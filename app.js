'use strict';

/* ══ 언어팩 ══ */
const LANGS = {
  ko:{flag:'🇰🇷',name:'한국어',data:{
    nav_product:'분양 상품 관리',nav_apply:'분양 신청 현황',nav_adopter:'입양자 관리',nav_schedule:'분양 일정',nav_contract:'분양 계약서',nav_notice:'분양 공지',
    nav_goods:'상품 등록/관리',nav_order:'주문 관리',nav_ship:'배송 관리',nav_pay:'입금 확인',nav_stock:'재고 관리',nav_return:'반품/교환',nav_coupon:'쿠폰/이벤트',nav_review:'리뷰 관리',nav_banner:'광고/배너',
    nav_member:'회원 관리',nav_cs:'고객 문의',nav_stats:'통계/분석',nav_settings:'설정',
    stat1:'분양 대기 중',stat2:'이번 달 주문',stat3:'오늘 매출',stat4:'총 회원 수',
    sec_adoption:'분양몰 관리',sec_shopping:'쇼핑몰 관리',sec_system:'공통 관리',
    sub_product:'등록·수정·삭제',sub_apply:'신청·승인·거절',sub_adopter:'계약·이력·연락',sub_schedule:'캘린더·예약',
    sub_goods:'옵션·이미지·가격',sub_order:'신규·처리·완료',sub_ship:'운송장·상태추적',sub_pay:'무통장·가상계좌',sub_stock:'수량·입출고·알림',sub_return:'요청·처리·환불',
    create_btn:'분양몰 생성',search_ph:'상품명, 주문번호, 회원명 검색...',
    user_name:'최고관리자',user_online:'온라인',
    theme_day:'낮 모드',theme_night:'밤 모드',
    lbl_adoption:'분양몰 관리',lbl_shopping:'쇼핑몰 관리',lbl_system:'시스템',
  }},
  en:{flag:'🇺🇸',name:'English',data:{
    nav_product:'Adoption Products',nav_apply:'Applications',nav_adopter:'Adopters',nav_schedule:'Schedule',nav_contract:'Contracts',nav_notice:'Announcements',
    nav_goods:'Products',nav_order:'Orders',nav_ship:'Shipping',nav_pay:'Payments',nav_stock:'Inventory',nav_return:'Returns',nav_coupon:'Coupons',nav_review:'Reviews',nav_banner:'Banners',
    nav_member:'Members',nav_cs:'Support',nav_stats:'Analytics',nav_settings:'Settings',
    stat1:'Pending Adoption',stat2:'Monthly Orders',stat3:"Today's Revenue",stat4:'Total Members',
    sec_adoption:'Adoption Mall',sec_shopping:'Shopping Mall',sec_system:'System',
    sub_product:'Add·Edit·Remove',sub_apply:'Apply·Approve·Reject',sub_adopter:'Contract·History',sub_schedule:'Calendar·Reserve',
    sub_goods:'Options·Images·Price',sub_order:'New·Process·Done',sub_ship:'Tracking·Status',sub_pay:'Bank·Virtual Acct',sub_stock:'Qty·In/Out·Alert',sub_return:'Request·Process·Refund',
    create_btn:'Create Mall',search_ph:'Search products, orders, members...',
    user_name:'Super Admin',user_online:'Online',
    theme_day:'Day Mode',theme_night:'Night Mode',
    lbl_adoption:'Adoption Mall',lbl_shopping:'Shopping',lbl_system:'System',
  }},
  ja:{flag:'🇯🇵',name:'日本語',data:{
    nav_product:'譲渡商品',nav_apply:'申請状況',nav_adopter:'里親管理',nav_schedule:'日程',nav_contract:'契約書',nav_notice:'お知らせ',
    nav_goods:'商品管理',nav_order:'注文管理',nav_ship:'配送管理',nav_pay:'入金確認',nav_stock:'在庫管理',nav_return:'返品/交換',nav_coupon:'クーポン',nav_review:'レビュー',nav_banner:'バナー',
    nav_member:'会員管理',nav_cs:'問い合わせ',nav_stats:'統計',nav_settings:'設定',
    stat1:'譲渡待ち',stat2:'今月注文',stat3:'本日売上',stat4:'総会員数',
    sec_adoption:'譲渡モール管理',sec_shopping:'ショッピング管理',sec_system:'システム',
    sub_product:'追加·編集·削除',sub_apply:'申請·承認·拒否',sub_adopter:'契約·履歴',sub_schedule:'カレンダー·予約',
    sub_goods:'オプション·画像·価格',sub_order:'新規·処理·完了',sub_ship:'送り状·追跡',sub_pay:'振込·仮想口座',sub_stock:'数量·入出荷',sub_return:'申請·処理·返金',
    create_btn:'モール作成',search_ph:'商品名・注文番号で検索...',
    user_name:'最高管理者',user_online:'オンライン',
    theme_day:'昼モード',theme_night:'夜モード',
    lbl_adoption:'譲渡モール',lbl_shopping:'ショッピング',lbl_system:'システム',
  }},
  vi:{flag:'🇻🇳',name:'Tiếng Việt',data:{
    nav_product:'Sản phẩm nhận nuôi',nav_apply:'Đơn nhận nuôi',nav_adopter:'Người nhận nuôi',nav_schedule:'Lịch nhận nuôi',nav_contract:'Hợp đồng',nav_notice:'Thông báo',
    nav_goods:'Sản phẩm',nav_order:'Đơn hàng',nav_ship:'Vận chuyển',nav_pay:'Thanh toán',nav_stock:'Tồn kho',nav_return:'Trả hàng',nav_coupon:'Phiếu giảm giá',nav_review:'Đánh giá',nav_banner:'Banner',
    nav_member:'Thành viên',nav_cs:'Hỗ trợ',nav_stats:'Thống kê',nav_settings:'Cài đặt',
    stat1:'Chờ nhận nuôi',stat2:'Đơn hàng tháng',stat3:'Doanh thu hôm nay',stat4:'Tổng thành viên',
    sec_adoption:'Quản lý nhận nuôi',sec_shopping:'Quản lý mua sắm',sec_system:'Hệ thống',
    sub_product:'Thêm·Sửa·Xóa',sub_apply:'Nộp·Duyệt·Từ chối',sub_adopter:'Hợp đồng·Lịch sử',sub_schedule:'Lịch·Đặt chỗ',
    sub_goods:'Tùy chọn·Ảnh·Giá',sub_order:'Mới·Xử lý·Xong',sub_ship:'Mã vận đơn·Theo dõi',sub_pay:'Ngân hàng·Ví điện tử',sub_stock:'Số lượng·Nhập/Xuất',sub_return:'Yêu cầu·Xử lý·Hoàn tiền',
    create_btn:'Tạo Mall',search_ph:'Tìm kiếm sản phẩm, đơn hàng...',
    user_name:'Quản trị viên',user_online:'Trực tuyến',
    theme_day:'Ban ngày',theme_night:'Ban đêm',
    lbl_adoption:'Nhận nuôi',lbl_shopping:'Mua sắm',lbl_system:'Hệ thống',
  }},
  th:{flag:'🇹🇭',name:'ภาษาไทย',data:{
    nav_product:'สินค้ารับเลี้ยง',nav_apply:'คำขอรับเลี้ยง',nav_adopter:'ผู้รับเลี้ยง',nav_schedule:'ตารางเวลา',nav_contract:'สัญญา',nav_notice:'ประกาศ',
    nav_goods:'สินค้า',nav_order:'คำสั่งซื้อ',nav_ship:'จัดส่ง',nav_pay:'ชำระเงิน',nav_stock:'สต็อก',nav_return:'คืนสินค้า',nav_coupon:'คูปอง',nav_review:'รีวิว',nav_banner:'แบนเนอร์',
    nav_member:'สมาชิก',nav_cs:'ฝ่ายสนับสนุน',nav_stats:'สถิติ',nav_settings:'ตั้งค่า',
    stat1:'รอรับเลี้ยง',stat2:'คำสั่งซื้อเดือนนี้',stat3:'รายได้วันนี้',stat4:'สมาชิกทั้งหมด',
    sec_adoption:'จัดการรับเลี้ยง',sec_shopping:'จัดการร้านค้า',sec_system:'ระบบ',
    sub_product:'เพิ่ม·แก้ไข·ลบ',sub_apply:'สมัคร·อนุมัติ·ปฏิเสธ',sub_adopter:'สัญญา·ประวัติ',sub_schedule:'ปฏิทิน·จอง',
    sub_goods:'ตัวเลือก·รูป·ราคา',sub_order:'ใหม่·ดำเนินการ·เสร็จ',sub_ship:'เลขพัสดุ·ติดตาม',sub_pay:'ธนาคาร·กระเป๋าเงิน',sub_stock:'จำนวน·รับ/จ่าย',sub_return:'ขอคืน·จัดการ·คืนเงิน',
    create_btn:'สร้างมอลล์',search_ph:'ค้นหาสินค้า คำสั่งซื้อ...',
    user_name:'ผู้ดูแลระบบ',user_online:'ออนไลน์',
    theme_day:'กลางวัน',theme_night:'กลางคืน',
    lbl_adoption:'รับเลี้ยง',lbl_shopping:'ร้านค้า',lbl_system:'ระบบ',
  }},
  id:{flag:'🇮🇩',name:'Indonesia',data:{
    nav_product:'Produk Adopsi',nav_apply:'Permohonan',nav_adopter:'Pengadopsi',nav_schedule:'Jadwal',nav_contract:'Kontrak',nav_notice:'Pengumuman',
    nav_goods:'Produk',nav_order:'Pesanan',nav_ship:'Pengiriman',nav_pay:'Pembayaran',nav_stock:'Stok',nav_return:'Pengembalian',nav_coupon:'Kupon',nav_review:'Ulasan',nav_banner:'Banner',
    nav_member:'Anggota',nav_cs:'Dukungan',nav_stats:'Statistik',nav_settings:'Pengaturan',
    stat1:'Menunggu Adopsi',stat2:'Pesanan Bulan Ini',stat3:'Pendapatan Hari Ini',stat4:'Total Anggota',
    sec_adoption:'Manajemen Adopsi',sec_shopping:'Manajemen Belanja',sec_system:'Sistem',
    sub_product:'Tambah·Edit·Hapus',sub_apply:'Ajukan·Setujui·Tolak',sub_adopter:'Kontrak·Riwayat',sub_schedule:'Kalender·Reservasi',
    sub_goods:'Opsi·Gambar·Harga',sub_order:'Baru·Proses·Selesai',sub_ship:'Resi·Pelacakan',sub_pay:'Bank·Virtual Acct',sub_stock:'Jumlah·Masuk/Keluar',sub_return:'Minta·Proses·Refund',
    create_btn:'Buat Mall',search_ph:'Cari produk, pesanan...',
    user_name:'Super Admin',user_online:'Online',
    theme_day:'Siang',theme_night:'Malam',
    lbl_adoption:'Adopsi',lbl_shopping:'Belanja',lbl_system:'Sistem',
  }},
};

let curLang = 'ko';
let curTheme = 'dark';
let curSkin = 'cyber';
let mallList = [{name:'KONEXA 본점', skin:'cyber', status:'운영중'},{name:'펫러버스 분양몰', skin:'rose', status:'운영중'}];

/* ── 언어 적용 ── */
function applyLang(code) {
  const l = LANGS[code]; if (!l) return;
  curLang = code;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const k = el.getAttribute('data-i18n');
    if (l.data[k] !== undefined) el.textContent = l.data[k];
  });
  document.getElementById('curFlag').textContent = l.flag;
  document.getElementById('curLangName').textContent = l.name;
  const si = document.getElementById('searchInput');
  if (si) si.placeholder = l.data.search_ph || '';
  updateThemeBtn();
}

/* ── 테마 ── */
function applyTheme(theme) {
  curTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeBtn();
}
function toggleTheme() {
  applyTheme(curTheme === 'dark' ? 'light' : 'dark');
}
function updateThemeBtn() {
  const l = LANGS[curLang] || LANGS['ko'];
  const isLight = curTheme === 'light';
  const icon = document.getElementById('themeIcon');
  const txt  = document.getElementById('themeTxt');
  if (icon) icon.textContent = isLight ? '☀️' : '🌙';
  if (txt)  txt.textContent  = isLight ? (l.data.theme_day||'Day') : (l.data.theme_night||'Night');
}

/* ── 언어 드롭다운 ── */
function toggleLang() {
  document.getElementById('langWrap').classList.toggle('open');
}
function setLang(el, code) {
  document.querySelectorAll('.lang-opt').forEach(o => o.classList.remove('sel'));
  el.classList.add('sel');
  applyLang(code);
  document.getElementById('langWrap').classList.remove('open');
}
document.addEventListener('click', e => {
  if (!e.target.closest('#langWrap')) {
    const lw = document.getElementById('langWrap');
    if (lw) lw.classList.remove('open');
  }
});

/* ── 사이드바 ── */
const sidebar  = document.getElementById('sidebar');
const mainWrap = document.getElementById('mainWrap');
function toggleSidebar() {
  sidebar.classList.toggle('collapsed');
  mainWrap.classList.toggle('collapsed');
  const btn = document.getElementById('collapseBtn');
  if (btn) btn.textContent = sidebar.classList.contains('collapsed') ? '▶' : '◀';
}
// 모바일 햄버거
function toggleMobileSidebar() {
  sidebar.classList.toggle('mobile-open');
  const ov = document.getElementById('sbOverlay');
  if (ov) ov.classList.toggle('open');
}

/* ── 네비게이션 ── */
document.querySelectorAll('.nav-item[data-page]').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    const page = item.dataset.page;
    const lbl = item.querySelector('[data-i18n]');
    const tt = document.getElementById('topbarTitle');
    if (lbl && tt) tt.textContent = lbl.textContent;
    if (page === 'shop-preview') openShopPanel();
    // 모바일 사이드바 닫기
    if (window.innerWidth <= 768) {
      sidebar.classList.remove('mobile-open');
      const ov = document.getElementById('sbOverlay');
      if (ov) ov.classList.remove('open');
    }
  });
});

/* ── 쇼핑몰 슬라이드 패널 ── */
function openShopPanel() {
  document.getElementById('shopOverlay').classList.add('open');
  document.getElementById('shopPanel').classList.add('open');
  renderMallList();
}
function closeShopPanel() {
  document.getElementById('shopOverlay').classList.remove('open');
  document.getElementById('shopPanel').classList.remove('open');
}

/* ── 스킨 전환 ── */
function setSkin(skin) {
  curSkin = skin;
  document.querySelectorAll('.skin-chip').forEach(c => c.classList.remove('active'));
  const active = document.querySelector(`.skin-chip[data-skin="${skin}"]`);
  if (active) active.classList.add('active');
  renderShopPreview(skin);
}
function renderShopPreview(skin) {
  const products = [
    {emoji:'🐕',name:'골든 리트리버',price:'₩850,000'},
    {emoji:'🐈',name:'스코티시 폴드',price:'₩650,000'},
    {emoji:'🐇',name:'미니 렉스 토끼',price:'₩180,000'},
    {emoji:'🐦',name:'러브버드 앵무',price:'₩120,000'},
    {emoji:'🐠',name:'구피 열대어',price:'₩25,000'},
    {emoji:'🦔',name:'아프리카 고슴도치',price:'₩320,000'},
  ];
  const skinNames = {cyber:'CYBER DARK',rose:'ROSE GOLD',ocean:'OCEAN BLUE',forest:'FOREST GREEN',sunset:'SUNSET WARM',mono:'MONO CLEAN'};
  const heroTitles = {
    cyber:'특별한 인연을 찾고 있나요?',
    rose:'사랑스러운 가족을 만나세요',
    ocean:'새로운 친구를 기다리고 있어요',
    forest:'자연 속 소중한 생명과 함께',
    sunset:'따뜻한 가족이 되어주세요',
    mono:'Premium Pet Adoption Mall'
  };
  const mallNav = ['홈','분양몰','입양신청','커뮤니티','고객센터'];
  document.getElementById('shopPreviewArea').innerHTML = `
    <div class="mall-preview">
      <div class="mall-header skin-${skin}">
        <div class="mall-logo skin-${skin}">🐾 KONEXA</div>
        <div class="mall-nav">${mallNav.map(n=>`<a>${n}</a>`).join('')}</div>
        <div style="font-size:11px;color:rgba(255,255,255,.4);font-family:'Syncopate',monospace;font-size:9px;">${skinNames[skin]}</div>
      </div>
      <div class="mall-hero skin-${skin}">
        <div class="hero-badge skin-${skin}">🌟 KONEXA ADOPTION MALL</div>
        <div class="hero-title">${heroTitles[skin]}</div>
        <div class="hero-sub">전국 최대 믿을 수 있는 분양 플랫폼</div>
        <div class="hero-btn skin-${skin}">분양 신청하기 →</div>
      </div>
      <div class="mall-products">
        <div class="products-title">📦 인기 분양 상품</div>
        <div class="products-grid">
          ${products.map(p=>`
            <div class="product-card">
              <div class="prod-img skin-${skin}">${p.emoji}</div>
              <div class="prod-info">
                <div class="prod-name">${p.name}</div>
                <div class="prod-price skin-${skin}">${p.price}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

/* ── 분양몰 목록 ── */
function renderMallList() {
  const colors = {cyber:'#00E5FF',rose:'#FF80AB',ocean:'#00B4D8',forest:'#52B788',sunset:'#FF6B35',mono:'#AAAACC'};
  const skinLabel = {cyber:'Cyber Dark',rose:'Rose Gold',ocean:'Ocean Blue',forest:'Forest Green',sunset:'Sunset Warm',mono:'Mono Clean'};
  const listEl = document.getElementById('mallListItems');
  if (!listEl) return;
  listEl.innerHTML = mallList.map((m,i) => `
    <div class="mall-item" onclick="selectMall(${i})">
      <div class="mall-item-dot" style="background:${colors[m.skin]||'#00E5FF'};box-shadow:0 0 8px ${colors[m.skin]||'#00E5FF'};"></div>
      <div>
        <div class="mall-item-name">${m.name}</div>
        <div class="mall-item-skin">${skinLabel[m.skin]||m.skin}</div>
      </div>
      <div class="mall-item-status chip gr">${m.status}</div>
    </div>
  `).join('');
}
function selectMall(idx) {
  const m = mallList[idx];
  if (m) setSkin(m.skin);
}

/* ── 분양몰 생성 모달 ── */
function openCreateModal() {
  document.getElementById('createModal').classList.add('open');
}
function closeCreateModal() {
  document.getElementById('createModal').classList.remove('open');
}
function selectModalSkin(el, skin) {
  document.querySelectorAll('.skin-opt').forEach(o => o.classList.remove('sel'));
  el.classList.add('sel');
  el.dataset.selectedSkin = skin;
}
function createMall() {
  const nameEl = document.getElementById('mallNameInput');
  const selSkin = document.querySelector('.skin-opt.sel');
  const name = nameEl ? nameEl.value.trim() : '';
  const skin = selSkin ? selSkin.getAttribute('onclick').match(/'([^']+)'/)?.[1] || 'cyber' : 'cyber';
  if (!name) { nameEl && (nameEl.style.borderColor = 'var(--pink)'); return; }
  mallList.push({name, skin, status:'운영중'});
  closeCreateModal();
  openShopPanel();
  if (nameEl) nameEl.value = '';
  document.querySelectorAll('.skin-opt').forEach(o => o.classList.remove('sel'));
  showToast(`✅ "${name}" 분양몰이 생성되었습니다!`);
}

/* ── 토스트 ── */
function showToast(msg) {
  const ex = document.querySelector('.toast-msg'); if (ex) ex.remove();
  const t = document.createElement('div');
  t.className = 'toast-msg';
  t.style.cssText = `position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(8,8,26,.96);border:1px solid rgba(0,229,255,.3);color:var(--text1);font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;padding:10px 22px;border-radius:99px;white-space:nowrap;z-index:9999;backdrop-filter:blur(12px);box-shadow:0 0 24px rgba(0,229,255,.15);animation:fadeUp .3s ease;`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

/* ── 시계 ── */
function tick() {
  const el = document.getElementById('liveClock'); if (!el) return;
  const n = new Date();
  el.textContent = [n.getHours(),n.getMinutes(),n.getSeconds()].map(v=>String(v).padStart(2,'0')).join(':');
}
tick(); setInterval(tick, 1000);

/* ── 하단 네비 (모바일) ── */
document.querySelectorAll('.bn-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.bn-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    const page = item.dataset.page;
    if (page === 'shop') openShopPanel();
    if (page === 'create') openCreateModal();
  });
});

/* ── FAB ── */
const fab = document.getElementById('fab');
if (fab) fab.addEventListener('click', openCreateModal);

/* 초기화 */
applyTheme('dark');
applyLang('ko');
renderShopPreview('cyber');
setSkin('cyber');
