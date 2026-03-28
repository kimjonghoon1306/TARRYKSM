'use strict';

/* ══ 언어 데이터 ══ */
const LANGS={
  ko:{flag:'🇰🇷',name:'한국어',d:{
    nav_p1:'분양 상품 관리',nav_p2:'분양 신청 현황',nav_p3:'입양자 관리',nav_p4:'분양 일정',nav_p5:'분양 계약서',nav_p6:'분양 공지',
    nav_s1:'쇼핑몰 미리보기',nav_s2:'상품 등록/관리',nav_s3:'주문 관리',nav_s4:'배송 관리',nav_s5:'입금 확인',nav_s6:'재고 관리',nav_s7:'반품/교환',nav_s8:'쿠폰/이벤트',nav_s9:'리뷰 관리',nav_s10:'광고/배너',
    nav_y1:'회원 관리',nav_y2:'고객 문의',nav_y3:'통계/분석',nav_y4:'설정',
    acc_adopt:'분양몰 관리',acc_shop:'쇼핑몰 관리',acc_sys:'시스템',
    stat1:'분양 대기 중',stat2:'이번 달 주문',stat3:'오늘 매출',stat4:'총 회원 수',
    sec_adopt:'분양몰 관리',sec_shop:'쇼핑몰 관리',sec_sys:'공통 관리',
    sub_p1:'등록·수정·삭제',sub_p2:'신청·승인·거절',sub_p3:'계약·이력·연락',
    sub_s2:'옵션·이미지·가격',sub_s3:'신규·처리·완료',sub_s4:'운송장·상태추적',sub_s5:'무통장·가상계좌',sub_s6:'수량·입출고·알림',sub_s7:'요청·처리·환불',
    create_btn:'분양몰 생성',create_sub:'무제한 생성 가능',
    search_ph:'상품명, 주문번호, 회원명 검색...',
    user_name:'최고관리자',user_online:'온라인',
    t_day:'낮 모드',t_night:'밤 모드',
  }},
  en:{flag:'🇺🇸',name:'English',d:{
    nav_p1:'Adoption Products',nav_p2:'Applications',nav_p3:'Adopters',nav_p4:'Schedule',nav_p5:'Contracts',nav_p6:'Announcements',
    nav_s1:'Mall Preview',nav_s2:'Products',nav_s3:'Orders',nav_s4:'Shipping',nav_s5:'Payments',nav_s6:'Inventory',nav_s7:'Returns',nav_s8:'Coupons',nav_s9:'Reviews',nav_s10:'Banners',
    nav_y1:'Members',nav_y2:'Support',nav_y3:'Analytics',nav_y4:'Settings',
    acc_adopt:'Adoption Mall',acc_shop:'Shopping Mall',acc_sys:'System',
    stat1:'Pending Adoption',stat2:'Monthly Orders',stat3:"Today's Revenue",stat4:'Total Members',
    sec_adopt:'Adoption Mall',sec_shop:'Shopping Mall',sec_sys:'System',
    sub_p1:'Add·Edit·Remove',sub_p2:'Apply·Approve·Reject',sub_p3:'Contract·History',
    sub_s2:'Options·Images·Price',sub_s3:'New·Process·Done',sub_s4:'Tracking·Status',sub_s5:'Bank·Virtual Acct',sub_s6:'Qty·In/Out·Alert',sub_s7:'Request·Process·Refund',
    create_btn:'Create Mall',create_sub:'Unlimited creation',
    search_ph:'Search products, orders, members...',
    user_name:'Super Admin',user_online:'Online',t_day:'Day Mode',t_night:'Night Mode',
  }},
  ja:{flag:'🇯🇵',name:'日本語',d:{
    nav_p1:'譲渡商品管理',nav_p2:'申請状況',nav_p3:'里親管理',nav_p4:'日程',nav_p5:'契約書',nav_p6:'お知らせ',
    nav_s1:'モールプレビュー',nav_s2:'商品管理',nav_s3:'注文管理',nav_s4:'配送管理',nav_s5:'入金確認',nav_s6:'在庫管理',nav_s7:'返品/交換',nav_s8:'クーポン',nav_s9:'レビュー',nav_s10:'バナー',
    nav_y1:'会員管理',nav_y2:'お問い合わせ',nav_y3:'統計',nav_y4:'設定',
    acc_adopt:'譲渡モール管理',acc_shop:'ショッピング管理',acc_sys:'システム',
    stat1:'譲渡待ち',stat2:'今月注文',stat3:'本日売上',stat4:'総会員数',
    sec_adopt:'譲渡モール管理',sec_shop:'ショッピング管理',sec_sys:'システム',
    sub_p1:'追加·編集·削除',sub_p2:'申請·承認·拒否',sub_p3:'契約·履歴',
    sub_s2:'オプション·画像·価格',sub_s3:'新規·処理·完了',sub_s4:'送り状·追跡',sub_s5:'振込·仮想口座',sub_s6:'数量·入出荷',sub_s7:'申請·処理·返金',
    create_btn:'モール作成',create_sub:'無制限作成可能',
    search_ph:'商品名・注文番号で検索...',
    user_name:'最高管理者',user_online:'オンライン',t_day:'昼モード',t_night:'夜モード',
  }},
  vi:{flag:'🇻🇳',name:'Tiếng Việt',d:{
    nav_p1:'Sản phẩm nhận nuôi',nav_p2:'Đơn nhận nuôi',nav_p3:'Người nhận nuôi',nav_p4:'Lịch nhận nuôi',nav_p5:'Hợp đồng',nav_p6:'Thông báo',
    nav_s1:'Xem trước Mall',nav_s2:'Sản phẩm',nav_s3:'Đơn hàng',nav_s4:'Vận chuyển',nav_s5:'Thanh toán',nav_s6:'Tồn kho',nav_s7:'Trả hàng',nav_s8:'Phiếu giảm giá',nav_s9:'Đánh giá',nav_s10:'Banner',
    nav_y1:'Thành viên',nav_y2:'Hỗ trợ',nav_y3:'Thống kê',nav_y4:'Cài đặt',
    acc_adopt:'Quản lý nhận nuôi',acc_shop:'Quản lý mua sắm',acc_sys:'Hệ thống',
    stat1:'Chờ nhận nuôi',stat2:'Đơn tháng này',stat3:'Doanh thu hôm nay',stat4:'Tổng thành viên',
    sec_adopt:'Nhận nuôi',sec_shop:'Mua sắm',sec_sys:'Hệ thống',
    sub_p1:'Thêm·Sửa·Xóa',sub_p2:'Nộp·Duyệt·Từ chối',sub_p3:'Hợp đồng·Lịch sử',
    sub_s2:'Tùy chọn·Ảnh·Giá',sub_s3:'Mới·Xử lý·Xong',sub_s4:'Mã vận đơn·Theo dõi',sub_s5:'NH·Ví điện tử',sub_s6:'Số lượng·Nhập/Xuất',sub_s7:'Yêu cầu·Xử lý·Hoàn tiền',
    create_btn:'Tạo Mall',create_sub:'Tạo không giới hạn',
    search_ph:'Tìm kiếm sản phẩm, đơn hàng...',
    user_name:'Quản trị viên',user_online:'Trực tuyến',t_day:'Ban ngày',t_night:'Ban đêm',
  }},
  th:{flag:'🇹🇭',name:'ภาษาไทย',d:{
    nav_p1:'สินค้ารับเลี้ยง',nav_p2:'คำขอรับเลี้ยง',nav_p3:'ผู้รับเลี้ยง',nav_p4:'ตารางเวลา',nav_p5:'สัญญา',nav_p6:'ประกาศ',
    nav_s1:'ดูตัวอย่าง Mall',nav_s2:'สินค้า',nav_s3:'คำสั่งซื้อ',nav_s4:'จัดส่ง',nav_s5:'ชำระเงิน',nav_s6:'สต็อก',nav_s7:'คืนสินค้า',nav_s8:'คูปอง',nav_s9:'รีวิว',nav_s10:'แบนเนอร์',
    nav_y1:'สมาชิก',nav_y2:'ฝ่ายสนับสนุน',nav_y3:'สถิติ',nav_y4:'ตั้งค่า',
    acc_adopt:'จัดการรับเลี้ยง',acc_shop:'จัดการร้านค้า',acc_sys:'ระบบ',
    stat1:'รอรับเลี้ยง',stat2:'คำสั่งซื้อเดือนนี้',stat3:'รายได้วันนี้',stat4:'สมาชิกทั้งหมด',
    sec_adopt:'รับเลี้ยง',sec_shop:'ร้านค้า',sec_sys:'ระบบ',
    sub_p1:'เพิ่ม·แก้ไข·ลบ',sub_p2:'สมัคร·อนุมัติ·ปฏิเสธ',sub_p3:'สัญญา·ประวัติ',
    sub_s2:'ตัวเลือก·รูป·ราคา',sub_s3:'ใหม่·ดำเนินการ·เสร็จ',sub_s4:'เลขพัสดุ·ติดตาม',sub_s5:'ธนาคาร·กระเป๋าเงิน',sub_s6:'จำนวน·รับ/จ่าย',sub_s7:'ขอคืน·จัดการ·คืนเงิน',
    create_btn:'สร้างมอลล์',create_sub:'สร้างได้ไม่จำกัด',
    search_ph:'ค้นหาสินค้า คำสั่งซื้อ...',
    user_name:'ผู้ดูแลระบบ',user_online:'ออนไลน์',t_day:'กลางวัน',t_night:'กลางคืน',
  }},
  id:{flag:'🇮🇩',name:'Indonesia',d:{
    nav_p1:'Produk Adopsi',nav_p2:'Permohonan',nav_p3:'Pengadopsi',nav_p4:'Jadwal',nav_p5:'Kontrak',nav_p6:'Pengumuman',
    nav_s1:'Preview Mall',nav_s2:'Produk',nav_s3:'Pesanan',nav_s4:'Pengiriman',nav_s5:'Pembayaran',nav_s6:'Stok',nav_s7:'Pengembalian',nav_s8:'Kupon',nav_s9:'Ulasan',nav_s10:'Banner',
    nav_y1:'Anggota',nav_y2:'Dukungan',nav_y3:'Statistik',nav_y4:'Pengaturan',
    acc_adopt:'Manajemen Adopsi',acc_shop:'Manajemen Belanja',acc_sys:'Sistem',
    stat1:'Menunggu Adopsi',stat2:'Pesanan Bulan Ini',stat3:'Pendapatan Hari Ini',stat4:'Total Anggota',
    sec_adopt:'Adopsi',sec_shop:'Belanja',sec_sys:'Sistem',
    sub_p1:'Tambah·Edit·Hapus',sub_p2:'Ajukan·Setujui·Tolak',sub_p3:'Kontrak·Riwayat',
    sub_s2:'Opsi·Gambar·Harga',sub_s3:'Baru·Proses·Selesai',sub_s4:'Resi·Pelacakan',sub_s5:'Bank·Virtual Acct',sub_s6:'Jumlah·Masuk/Keluar',sub_s7:'Minta·Proses·Refund',
    create_btn:'Buat Mall',create_sub:'Buat tanpa batas',
    search_ph:'Cari produk, pesanan...',
    user_name:'Super Admin',user_online:'Online',t_day:'Siang',t_night:'Malam',
  }},
};

let curLang='ko', curTheme='dark', curSkin='cyber';
let mallList=[{name:'KONEXA 본점',skin:'cyber'},{name:'펫러버스 분양몰',skin:'rose'}];

/* ─ 랜딩 → 대시보드 ─ */
function enterDashboard(){
  const l=document.getElementById('landing');
  l.classList.add('hide');
  setTimeout(()=>{
    l.style.display='none';
    const app=document.getElementById('app');
    app.style.display='flex';
    app.classList.add('show');
  },580);
}

/* ─ 언어 적용 ─ */
function applyLang(code){
  const l=LANGS[code]; if(!l) return;
  curLang=code;
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const k=el.getAttribute('data-i18n');
    if(l.d[k]!==undefined) el.textContent=l.d[k];
  });
  document.getElementById('curFlag').textContent=l.flag;
  document.getElementById('curLangName').textContent=l.name;
  const si=document.getElementById('searchInput');
  if(si) si.placeholder=l.d.search_ph||'';
  document.querySelectorAll('.lang-opt').forEach(o=>o.classList.remove('sel'));
  const sel=document.querySelector(`.lang-opt[data-code="${code}"]`);
  if(sel) sel.classList.add('sel');
  updateThemeBtn();
}
function toggleLang(){document.getElementById('langWrap').classList.toggle('open');}
function setLang(code){applyLang(code);document.getElementById('langWrap').classList.remove('open');}
document.addEventListener('click',e=>{
  if(!e.target.closest('#langWrap')){
    const lw=document.getElementById('langWrap');
    if(lw) lw.classList.remove('open');
  }
});

/* ─ 테마 ─ */
function toggleTheme(){applyTheme(curTheme==='dark'?'light':'dark');}
function applyTheme(t){
  curTheme=t;
  // GPU 레이어 촉진 후 테마 적용 - 버벅임 방지
  document.body.classList.add('theme-transitioning');
  requestAnimationFrame(()=>{
    document.documentElement.setAttribute('data-theme',t);
    updateThemeBtn();
    setTimeout(()=>document.body.classList.remove('theme-transitioning'),300);
  });
}
function updateThemeBtn(){
  const l=LANGS[curLang]||LANGS['ko'];
  const isL=curTheme==='light';
  const ic=document.getElementById('themeIcon');
  const tx=document.getElementById('themeTxt');
  if(ic) ic.textContent=isL?'☀️':'🌙';
  if(tx) tx.textContent=isL?(l.d.t_day||'Day'):(l.d.t_night||'Night');
}

/* ─ 사이드바 아코디언 ─ */
document.querySelectorAll('.acc-header').forEach(hd=>{
  hd.addEventListener('click',()=>{
    const body=hd.nextElementSibling;
    const isOpen=hd.classList.contains('open');
    hd.classList.toggle('open',!isOpen);
    body.classList.toggle('open',!isOpen);
  });
});
// 첫 번째 열린 상태로
document.querySelectorAll('.acc-header')[0]?.click();

/* ─ 사이드바 접기 ─ */
function toggleSidebar(){
  const sb=document.getElementById('sidebar');
  const mw=document.getElementById('mainWrap');
  sb.classList.toggle('collapsed');
  mw.classList.toggle('collapsed');
  const btn=document.getElementById('sbCollapse');
  if(btn) btn.textContent=sb.classList.contains('collapsed')?'▶':'◀';
}
function toggleMobileSidebar(){
  document.getElementById('sidebar').classList.toggle('mob-open');
  document.getElementById('sbOverlay').classList.toggle('open');
}

/* ─ 네비 클릭 ─ */
document.querySelectorAll('.nav-item[data-page]').forEach(item=>{
  item.addEventListener('click',()=>{
    document.querySelectorAll('.nav-item').forEach(i=>i.classList.remove('active'));
    item.classList.add('active');
    const lbl=item.querySelector('[data-i18n]');
    const tt=document.getElementById('topbarTitle');
    if(lbl&&tt) tt.textContent=lbl.textContent;
    if(item.dataset.page==='shop-preview') openShopPanel();
    if(window.innerWidth<=768){
      document.getElementById('sidebar').classList.remove('mob-open');
      document.getElementById('sbOverlay').classList.remove('open');
    }
  });
});

/* ─ 쇼핑몰 패널 ─ */
function openShopPanel(){
  document.getElementById('shopOv').classList.add('open');
  document.getElementById('shopPanel').classList.add('open');
  renderMallList();
}
function closeShopPanel(){
  document.getElementById('shopOv').classList.remove('open');
  document.getElementById('shopPanel').classList.remove('open');
}

/* ─ 스킨 ─ */
function setSkin(skin){
  curSkin=skin;
  document.querySelectorAll('.skin-chip').forEach(c=>c.classList.remove('active'));
  const a=document.querySelector(`.skin-chip[data-skin="${skin}"]`);
  if(a) a.classList.add('active');
  renderShopPreview(skin);
}
const SKIN_DATA={
  cyber:{accent:'#00E5FF',heroTitle:'특별한 인연을 찾고 있나요?',heroSub:'전국 최대 믿을 수 있는 분양 플랫폼'},
  rose:{accent:'#FF80AB',heroTitle:'사랑스러운 가족을 만나세요',heroSub:'로즈 골드 감성의 프리미엄 분양몰'},
  ocean:{accent:'#00B4D8',heroTitle:'새로운 친구를 기다리고 있어요',heroSub:'청명한 오션 테마 분양 플랫폼'},
  forest:{accent:'#52B788',heroTitle:'자연 속 소중한 생명과 함께',heroSub:'싱그러운 숲 감성의 분양몰'},
  sunset:{accent:'#FF6B35',heroTitle:'따뜻한 가족이 되어주세요',heroSub:'노을빛 감성 분양 플랫폼'},
  mono:{accent:'#AAAACC',heroTitle:'Premium Pet Adoption Mall',heroSub:'모던하고 깔끔한 모노톤 분양몰'},
};
const PRODUCTS=[
  {e:'🐕',n:'골든 리트리버',p:'₩850,000'},{e:'🐈',n:'스코티시 폴드',p:'₩650,000'},
  {e:'🐇',n:'미니 렉스 토끼',p:'₩180,000'},{e:'🐦',n:'러브버드 앵무',p:'₩120,000'},
  {e:'🐠',n:'구피 열대어',p:'₩25,000'},{e:'🦔',n:'아프리카 고슴도치',p:'₩320,000'},
];
const SKIN_LABELS={cyber:'Cyber Dark',rose:'Rose Gold',ocean:'Ocean Blue',forest:'Forest Green',sunset:'Sunset Warm',mono:'Mono Clean'};

function renderShopPreview(skin){
  const d=SKIN_DATA[skin];
  document.getElementById('shopPreviewArea').innerHTML=`
    <div class="mall-preview">
      <div class="mall-hdr sk-${skin}">
        <div class="mall-logo-text">🐾 KONEXA</div>
        <div class="mall-nav-links"><a>홈</a><a>분양몰</a><a>입양신청</a><a>고객센터</a></div>
        <span style="font-size:9px;color:rgba(255,255,255,.35);font-family:'Syncopate',monospace;">${SKIN_LABELS[skin]}</span>
      </div>
      <div class="mall-hero sk-${skin}">
        <div class="hero-badge">🌟 KONEXA ADOPTION MALL</div>
        <div class="hero-ttl">${d.heroTitle}</div>
        <div class="hero-sub">${d.heroSub}</div>
        <button class="hero-btn">분양 신청하기 →</button>
      </div>
      <div class="mall-products">
        <div class="prod-ttl">📦 인기 분양 상품</div>
        <div class="prod-grid sk-${skin}">
          ${PRODUCTS.map(p=>`<div class="prod-card"><div class="prod-img">${p.e}</div><div class="prod-info"><div class="prod-name">${p.n}</div><div class="prod-price">${p.p}</div></div></div>`).join('')}
        </div>
      </div>
    </div>`;
}

function renderMallList(){
  const colors={cyber:'#00E5FF',rose:'#FF80AB',ocean:'#00B4D8',forest:'#52B788',sunset:'#FF6B35',mono:'#AAAACC'};
  const el=document.getElementById('mallListItems');
  if(!el) return;
  el.innerHTML=mallList.map((m,i)=>`
    <div class="mall-item" onclick="setSkin('${m.skin}')">
      <div class="mall-item-dot" style="background:${colors[m.skin]};box-shadow:0 0 8px ${colors[m.skin]};"></div>
      <div><div class="mall-item-name">${m.name}</div><div class="mall-item-skin">${SKIN_LABELS[m.skin]||m.skin}</div></div>
      <span class="chip chip-gr">운영중</span>
    </div>`).join('');
}

/* ─ 분양몰 생성 모달 ─ */
function openCreateModal(){document.getElementById('createModal').classList.add('open');}
function closeCreateModal(){document.getElementById('createModal').classList.remove('open');}
function selectSkinOpt(el){
  document.querySelectorAll('.skin-opt').forEach(o=>o.classList.remove('sel'));
  el.classList.add('sel');
}
function createMall(){
  const nameEl=document.getElementById('mallNameInput');
  const selSkin=document.querySelector('.skin-opt.sel');
  const name=nameEl?nameEl.value.trim():'';
  if(!name){if(nameEl)nameEl.style.borderColor='var(--p)';return;}
  const skin=selSkin?.dataset?.skin||'cyber';
  mallList.push({name,skin});
  closeCreateModal();
  if(nameEl)nameEl.value='';
  nameEl&&(nameEl.style.borderColor='');
  document.querySelectorAll('.skin-opt').forEach(o=>o.classList.remove('sel'));
  document.querySelector('.skin-opt')?.classList.add('sel');
  openShopPanel();
  showToast(`🏪 "${name}" 분양몰이 생성되었습니다!`);
}

/* ─ 토스트 ─ */
function showToast(msg){
  const ex=document.querySelector('.toast-konexa');if(ex)ex.remove();
  const t=document.createElement('div');
  t.className='toast-konexa';
  t.style.cssText='position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(6,6,18,.97);border:1px solid rgba(0,229,255,.3);color:#F0F0FF;font-family:"DM Sans",sans-serif;font-size:13px;font-weight:500;padding:12px 24px;border-radius:99px;white-space:nowrap;z-index:9999;backdrop-filter:blur(16px);box-shadow:0 0 30px rgba(0,229,255,.2);animation:fadeUp .3s ease;';
  t.textContent=msg;
  document.body.appendChild(t);
  setTimeout(()=>t.remove(),3000);
}

/* ─ 시계 ─ */
function tick(){
  const el=document.getElementById('liveClock');if(!el)return;
  const n=new Date();
  el.textContent=[n.getHours(),n.getMinutes(),n.getSeconds()].map(v=>String(v).padStart(2,'0')).join(':');
}
tick();setInterval(tick,1000);

/* ─ 모바일 하단 네비 ─ */
document.querySelectorAll('.bn-item').forEach(item=>{
  item.addEventListener('click',()=>{
    document.querySelectorAll('.bn-item').forEach(i=>i.classList.remove('active'));
    item.classList.add('active');
    const p=item.dataset.page;
    if(p==='shop') openShopPanel();
    if(p==='create') openCreateModal();
  });
});

const fab=document.getElementById('fab');
if(fab) fab.addEventListener('click',openCreateModal);

/* 초기화 */
applyTheme('dark');
applyLang('ko');
renderShopPreview('cyber');
setSkin('cyber');
