-- Atomic checkout: order insert + line insert + stock decrement in one DB transaction.
-- Run after orders/customers/coupons/points/shipping/grades/product-options/variants SQL.

alter table public.orders add column if not exists customer_id uuid references public.customers(id) on delete set null;
alter table public.orders add column if not exists discount integer not null default 0;
alter table public.orders add column if not exists coupon_code text;
alter table public.orders add column if not exists points_used integer not null default 0;
alter table public.orders add column if not exists shipping integer not null default 0;
alter table public.orders add column if not exists grade_discount integer not null default 0;
alter table public.products add column if not exists stock integer;
alter table public.products add column if not exists options jsonb not null default '[]'::jsonb;
alter table public.products add column if not exists variants jsonb not null default '[]'::jsonb;
alter table public.customers add column if not exists points integer not null default 0;
alter table public.customers add column if not exists total_spent integer not null default 0;
alter table public.stores add column if not exists points_on boolean not null default false;
alter table public.stores add column if not exists ship_on boolean not null default false;
alter table public.stores add column if not exists ship_fee integer not null default 0;
alter table public.stores add column if not exists ship_free_over integer not null default 0;
alter table public.stores add column if not exists ship_extra integer not null default 0;
alter table public.stores add column if not exists grades_on boolean default false;

create or replace function public.checkout_place_order_atomic(
  p_store_id uuid,
  p_buyer jsonb,
  p_items jsonb,
  p_coupon_code text default null,
  p_use_points integer default 0,
  p_token text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text := nullif(trim(coalesce(p_buyer->>'name', '')), '');
  v_phone text := nullif(trim(coalesce(p_buyer->>'phone', '')), '');
  v_email text := nullif(trim(coalesce(p_buyer->>'email', '')), '');
  v_address text := nullif(trim(coalesce(p_buyer->>'address', '')), '');
  v_memo text := nullif(trim(coalesce(p_buyer->>'memo', '')), '');
  v_remote boolean := coalesce((p_buyer->>'remote')::boolean, false);
  v_item jsonb;
  v_product record;
  v_groups jsonb;
  v_variants jsonb;
  v_opts jsonb;
  v_group jsonb;
  v_choice jsonb;
  v_group_name text;
  v_selected text;
  v_add integer;
  v_qty integer;
  v_opt_text text;
  v_combo_key text;
  v_combo_count integer;
  v_group_count integer;
  v_variant_key text;
  v_eff_stock integer;
  v_line_price integer;
  v_lines jsonb := '[]'::jsonb;
  v_line jsonb;
  v_subtotal integer := 0;
  v_discount integer := 0;
  v_applied_code text := null;
  v_after_coupon integer;
  v_grade_discount integer := 0;
  v_after_grade integer;
  v_points_to_use integer := 0;
  v_after_points integer;
  v_shipping integer := 0;
  v_total integer;
  v_customer_id uuid := null;
  v_customer_points integer := 0;
  v_order_id uuid := gen_random_uuid();
  v_coupon record;
  v_store record;
  v_grade record;
  v_current_stock integer;
  v_new_balance integer;
begin
  if v_name is null or v_phone is null then
    return jsonb_build_object('ok', false, 'error', '이름과 연락처를 입력해 주세요.');
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    return jsonb_build_object('ok', false, 'error', '장바구니가 비어 있어요.');
  end if;
  if not exists (select 1 from public.stores where id = p_store_id and published = true) then
    return jsonb_build_object('ok', false, 'error', '쇼핑몰 정보를 찾을 수 없어요.');
  end if;

  if nullif(trim(coalesce(p_token, '')), '') is not null then
    select c.id, c.points
      into v_customer_id, v_customer_points
      from public.customer_sessions s
      join public.customers c on c.id = s.customer_id
      where s.token = p_token and c.store_id = p_store_id
      limit 1;
  end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_qty := greatest(1, least(999, coalesce((v_item->>'qty')::integer, 1)));
    v_opts := case when jsonb_typeof(v_item->'opts') = 'object' then v_item->'opts' else '{}'::jsonb end;

    select id, name, price, stock, options, variants
      into v_product
      from public.products
      where id = (v_item->>'product_id')::uuid and store_id = p_store_id
      for update;
    if not found then
      return jsonb_build_object('ok', false, 'error', '상품 정보를 찾을 수 없어요.');
    end if;

    v_groups := case when jsonb_typeof(v_product.options) = 'array' then v_product.options else '[]'::jsonb end;
    v_variants := case when jsonb_typeof(v_product.variants) = 'array' then v_product.variants else '[]'::jsonb end;
    v_group_count := jsonb_array_length(v_groups);
    v_add := 0;
    v_opt_text := '';
    v_combo_key := '';
    v_combo_count := 0;
    v_variant_key := null;
    v_eff_stock := v_product.stock;

    for v_group in select value from jsonb_array_elements(v_groups)
    loop
      v_group_name := v_group->>'name';
      v_selected := v_opts->>v_group_name;
      v_choice := null;
      select value into v_choice
        from jsonb_array_elements(coalesce(v_group->'choices', '[]'::jsonb))
        where value->>'label' = v_selected
        limit 1;
      if v_choice is not null then
        v_add := v_add + greatest(0, coalesce((v_choice->>'add')::integer, 0));
        v_opt_text := v_opt_text || case when v_opt_text = '' then ' (' else ' / ' end || v_group_name || ': ' || (v_choice->>'label');
        v_combo_key := v_combo_key || case when v_combo_key = '' then '' else '|' end || (v_choice->>'label');
        v_combo_count := v_combo_count + 1;
      end if;
    end loop;
    if v_opt_text <> '' then v_opt_text := v_opt_text || ')'; end if;

    if jsonb_array_length(v_variants) > 0 and v_group_count > 0 and v_combo_count = v_group_count then
      v_variant_key := v_combo_key;
      select coalesce((value->>'stock')::integer, 0)
        into v_eff_stock
        from jsonb_array_elements(v_variants)
        where value->>'key' = v_variant_key
        limit 1;
      if not found then v_eff_stock := 0; end if;
    end if;

    if v_eff_stock is not null and v_qty > v_eff_stock then
      return jsonb_build_object(
        'ok', false,
        'error', case when v_eff_stock = 0 then quote_literal(v_product.name || v_opt_text) || '은(는) 품절됐어요.'
                      else quote_literal(v_product.name || v_opt_text) || '은(는) ' || v_eff_stock || '개만 남았어요.' end
      );
    end if;

    v_line_price := coalesce(v_product.price, 0) + v_add;
    v_subtotal := v_subtotal + (v_line_price * v_qty);
    v_lines := v_lines || jsonb_build_array(jsonb_build_object(
      'product_id', v_product.id,
      'name', v_product.name || v_opt_text,
      'price', v_line_price,
      'qty', v_qty,
      'variant_key', v_variant_key,
      'stock_managed', v_eff_stock is not null
    ));
  end loop;

  if v_subtotal <= 0 then
    return jsonb_build_object('ok', false, 'error', '주문할 상품이 없어요.');
  end if;

  if nullif(trim(coalesce(p_coupon_code, '')), '') is not null then
    select * into v_coupon
      from public.coupons
      where store_id = p_store_id and upper(code) = upper(trim(p_coupon_code))
      limit 1;
    if found
      and v_coupon.active
      and (v_coupon.expires_at is null or v_coupon.expires_at >= now())
      and (v_coupon.max_uses is null or v_coupon.used_count < v_coupon.max_uses)
      and v_subtotal >= v_coupon.min_order
    then
      if v_coupon.kind = 'amount' then
        v_discount := v_coupon.value;
      else
        v_discount := floor(v_subtotal * v_coupon.value / 100.0);
      end if;
      v_discount := least(v_subtotal, greatest(0, v_discount));
      v_applied_code := v_coupon.code;
    end if;
  end if;
  v_after_coupon := v_subtotal - v_discount;

  if v_customer_id is not null then
    select grades_on into v_store from public.stores where id = p_store_id;
    if coalesce(v_store.grades_on, false) then
      select name, discount_pct, min_spent
        into v_grade
        from public.store_grades
        where store_id = p_store_id
          and min_spent <= coalesce((select total_spent from public.customers where id = v_customer_id), 0)
        order by min_spent desc
        limit 1;
      if found then
        v_grade_discount := least(v_after_coupon, floor(v_subtotal * greatest(0, least(100, coalesce(v_grade.discount_pct, 0))) / 100.0));
      end if;
    end if;
  end if;
  v_after_grade := v_after_coupon - v_grade_discount;

  if v_customer_id is not null and coalesce(p_use_points, 0) > 0 then
    select points_on into v_store from public.stores where id = p_store_id;
    if coalesce(v_store.points_on, false) then
      v_points_to_use := least(greatest(0, p_use_points), v_customer_points, v_after_grade);
    end if;
  end if;
  v_after_points := v_after_grade - v_points_to_use;

  select ship_on, ship_fee, ship_free_over, ship_extra into v_store from public.stores where id = p_store_id;
  if coalesce(v_store.ship_on, false) then
    if coalesce(v_store.ship_free_over, 0) > 0 and v_subtotal >= v_store.ship_free_over then
      v_shipping := 0;
    else
      v_shipping := coalesce(v_store.ship_fee, 0);
    end if;
    if v_shipping > 0 and v_remote then
      v_shipping := v_shipping + coalesce(v_store.ship_extra, 0);
    end if;
  end if;
  v_total := v_after_points + v_shipping;

  for v_line in select value from jsonb_array_elements(v_lines)
  loop
    if coalesce((v_line->>'stock_managed')::boolean, false) then
      if nullif(v_line->>'variant_key', '') is not null then
        select variants
          into v_variants
          from public.products
          where id = (v_line->>'product_id')::uuid
          for update;
        select coalesce((value->>'stock')::integer, 0)
          into v_current_stock
          from jsonb_array_elements(v_variants) value
          where value->>'key' = v_line->>'variant_key'
          limit 1;
        if v_current_stock < (v_line->>'qty')::integer then
          raise exception '%은(는) 재고가 부족해요.', v_line->>'name';
        end if;
        update public.products
          set variants = (
            select jsonb_agg(
              case when value->>'key' = v_line->>'variant_key'
                then jsonb_set(value, '{stock}', to_jsonb(greatest(0, coalesce((value->>'stock')::integer, 0) - (v_line->>'qty')::integer)))
                else value end
            )
            from jsonb_array_elements(variants) value
          )
          where id = (v_line->>'product_id')::uuid;
      else
        select stock into v_current_stock from public.products where id = (v_line->>'product_id')::uuid for update;
        if v_current_stock < (v_line->>'qty')::integer then
          raise exception '%은(는) 재고가 부족해요.', v_line->>'name';
        end if;
        update public.products
          set stock = stock - (v_line->>'qty')::integer
          where id = (v_line->>'product_id')::uuid and stock is not null;
      end if;
    end if;
  end loop;

  insert into public.orders (
    id, store_id, buyer_name, buyer_phone, buyer_email, address, memo, total,
    discount, coupon_code, customer_id, points_used, shipping, grade_discount
  )
  values (
    v_order_id, p_store_id, v_name, v_phone, v_email, v_address, v_memo, v_total,
    v_discount, v_applied_code, v_customer_id, v_points_to_use, v_shipping, v_grade_discount
  );

  insert into public.order_items (order_id, product_id, name, price, qty)
  select v_order_id, (value->>'product_id')::uuid, value->>'name', (value->>'price')::integer, (value->>'qty')::integer
  from jsonb_array_elements(v_lines) value;

  if v_applied_code is not null then
    update public.coupons
      set used_count = used_count + 1
      where store_id = p_store_id and upper(code) = upper(v_applied_code);
    if v_customer_id is not null and to_regclass('public.customer_coupons') is not null then
      update public.customer_coupons cc
        set used = true, used_at = now()
        from public.coupons co
        where cc.coupon_id = co.id
          and cc.customer_id = v_customer_id
          and cc.used = false
          and upper(co.code) = upper(v_applied_code);
    end if;
  end if;

  if v_points_to_use > 0 and v_customer_id is not null then
    update public.customers
      set points = greatest(0, points - v_points_to_use)
      where id = v_customer_id
      returning points into v_new_balance;
    if to_regclass('public.point_transactions') is not null then
      execute 'insert into public.point_transactions(customer_id, store_id, amount, balance_after, kind, memo, order_id) values ($1,$2,$3,$4,$5,$6,$7)'
        using v_customer_id, p_store_id, -v_points_to_use, v_new_balance, 'use', '주문 결제 사용', v_order_id;
    end if;
  end if;

  if v_customer_id is not null and to_regclass('public.customer_coupons') is not null then
    perform public.auto_issue_coupon(p_token, 'repurchase');
  end if;

  return jsonb_build_object('ok', true, 'orderId', v_order_id);
end;
$$;

grant execute on function public.checkout_place_order_atomic(uuid, jsonb, jsonb, text, integer, text) to anon, authenticated;
