/* ════════════════════════════════════════
   온봇 — 대문(정적)용 디자이너 도우미. AI 키 없이 클릭형 FAQ.
   자기주입(스타일+DOM)이라 index.html엔 <script src=onbot.js>만 추가.
════════════════════════════════════════ */
(function () {
  var CATS = [
    { id: "start", label: "시작하기", icon: "🚀", items: [
      { q: "쇼핑몰은 어떻게 만들어요?", a: "대문 <b>스튜디오</b>에서 마음에 드는 <b>스킨</b>을 고른 뒤 <b>‘이 스킨으로 제작하기’</b>를 누르세요. 주소(영문)를 정하고 이름만 적으면 바로 내 쇼핑몰이 생겨요." },
      { q: "상품은 어떻게 올려요?", a: "<b>대시보드 → 내 쇼핑몰 → (몰 선택) → 📦 상품</b>에서 <b>추가</b>를 눌러 사진·이름·가격·설명을 넣으면 됩니다." },
      { q: "손님이 보게 하려면요?", a: "몰 관리 위쪽의 <b>🟢 발행하기</b>를 누르세요. 발행 상태여야 주소로 접속했을 때 손님에게 보입니다." },
    ]},
    { id: "design", label: "디자인·꾸미기", icon: "🎨", items: [
      { q: "디자인(스킨) 바꾸기", a: "몰 관리 → <b>디자인</b> 탭에서 스킨을 고르고 <b>저장</b>하면 색·서체·무드가 통째로 바뀝니다. 언제든 다시 바꿀 수 있어요." },
      { q: "상단 로고·배너 꾸미기", a: "몰 관리의 <b>🎨 상단 꾸미기</b>에서 로고·배너 이미지와 제목·문구를 바꿀 수 있어요. 그 안 <b>‘🎬 따라 만드는 미리보기’</b>가 로고→배너→제목→문구 채워지는 모습을 보여줘요." },
      { q: "대문 구성(섹션)으로 나만의 대문 만들기", a: "몰 관리 → <b>🧩 대문 구성</b>에서 블록을 쌓아요. <b>🖼️기획전 배너</b>(높이 작게/보통/크게)·<b>🛒상품 선반</b>(신상/베스트/카테고리/직접)·<b>✍️텍스트 블록</b>·<b>🔲전체 상품 그리드</b>. 순서는 <b>드래그</b>나 <b>▲▼</b>로 바꾸고 <b>👁표시/🚫숨김·🗑삭제</b>도 돼요." },
      { q: "대문은 어떻게 만드는지 보여줘요", a: "<b>🧩 대문 구성</b> 페이지 맨 위 <b>‘🎬 대문은 이렇게 만들어요’</b>를 누르면, 배너→상품 선반→텍스트→전체 그리드가 <b>하나씩 쌓여 완성되는 모습</b>을 영상처럼 보여주고 왼쪽에 <b>🙋쉽게 따라하기</b> 설명이 있어요." },
    ]},
    { id: "domain", label: "도메인 연결", icon: "🌐", items: [
      { q: "기본 주소가 뭐예요?", a: "발행하면 <b>on.온종일.com/내주소</b> 로 바로 열립니다. 주소(영문)는 몰 관리에서 언제든 바꿀 수 있어요. 따로 도메인을 안 사도 돼요." },
      { q: "내 도메인(mybrand.com) 연결", a: "① 도메인 산 곳(가비아·후이즈·Cloudflare 등) <b>DNS 설정</b>에서 한 줄 추가:<div class='ob-code'>shop.mybrand.com → 타입 <b>CNAME</b>, 값 <b>cname.vercel-dns.com</b><br>mybrand.com → 타입 <b>A</b>, 값 <b>76.76.21.21</b></div>② 몰 관리 <b>도메인</b> 칸에 내 도메인 적고 저장. ③ 서버 등록·🔒https는 <b>자동</b>이에요. 연결까지 몇 분~몇 시간 걸릴 수 있어요." },
    ]},
    { id: "features", label: "전체 기능", icon: "🛠", items: [
      { q: "대시보드에서 뭘 할 수 있어요?", a: "<b>대시보드</b>(요약)·<b>쇼핑몰</b>(생성/관리)·<b>상품</b>·<b>주문/고객</b>·<b>분석</b>(통계)·<b>설정</b>을 한 곳에서 관리해요." },
      { q: "상품 태그(베스트/신상)", a: "상품에 <b>태그</b>(예: 베스트·인기·NEW)를 달면 스토어프런트가 <b>🔥베스트·🆕신상품 선반</b>으로 자동 분리해 보여줘요." },
      { q: "손님이 카테고리별로 상품 보기", a: "상품에 <b>카테고리</b>(예: 과일·정육·채소)를 정해두면 쇼핑몰 위에 <b>카테고리 단추(칩)</b>가 자동으로 생겨요. 손님이 누르면 그 카테고리 상품만 모아 보여주고, <b>상품은 항상 보이게</b> 돼 있어요." },
    ]},
    { id: "account", label: "계정·관리자", icon: "🔑", items: [
      { q: "비밀번호를 잊었어요", a: "로그인 화면의 <b>비밀번호 찾기</b>로 메일을 받아 새로 정하세요. 아이디는 <b>가입한 이메일</b>이에요." },
      { q: "관리자(컨트롤타워) 입장", a: "스튜디오 <b>좌측 상단 로고</b>를 <b>4번 빠르게 클릭</b>하면 관리자 로그인으로 들어가요. (숨은 입구라 평소엔 안 보여요)" },
    ]},
  ];

  var AVATAR =
    '<svg width="W" height="W" viewBox="0 0 48 48" aria-hidden="true">' +
    '<defs><linearGradient id="obg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7c6dff"/><stop offset="1" stop-color="#ff6ec7"/></linearGradient></defs>' +
    '<circle cx="24" cy="24" r="24" fill="url(#obg)"/>' +
    '<circle cx="24" cy="26" r="12" fill="#ffe0c7"/>' +
    '<path d="M12 18c1-7 8-10 12-10s11 3 12 10c0 1-2 1-4 1-2-3-5-4-8-4s-6 1-8 4c-2 0-4 0-4-1z" fill="#2a2350"/>' +
    '<circle cx="36" cy="15" r="2.4" fill="#ff6ec7"/>' +
    '<g fill="none" stroke="#2a2350" stroke-width="1.6"><circle cx="19.5" cy="25" r="3.2"/><circle cx="28.5" cy="25" r="3.2"/><path d="M22.7 25h2.6"/></g>' +
    '<path d="M20 30.5c1.6 1.8 6.4 1.8 8 0" fill="none" stroke="#c0694a" stroke-width="1.6" stroke-linecap="round"/></svg>';
  function av(w) { return AVATAR.replace(/W/g, w); }

  var CSS =
    ".ob-btn{position:fixed;bottom:20px;right:20px;z-index:120;display:flex;align-items:center;gap:8px;padding:6px 16px 6px 6px;border:0;border-radius:99px;background:var(--surf,#fff);color:var(--txt,#141422);box-shadow:0 12px 34px -8px rgba(124,109,255,.4);cursor:pointer;font-weight:700;font-size:14px;transition:.18s}" +
    ".ob-btn:hover{transform:translateY(-2px);box-shadow:0 18px 42px -10px rgba(124,109,255,.5)}" +
    ".ob-dot{position:absolute;top:2px;right:2px;width:11px;height:11px;border-radius:50%;background:#34d399;border:2px solid var(--surf,#fff)}" +
    ".ob-panel{position:fixed;bottom:92px;right:20px;z-index:120;display:flex;flex-direction:column;width:min(360px,92vw);max-height:70vh;overflow:hidden;border-radius:24px;background:var(--surf,#fff);color:var(--txt,#141422);border:1px solid var(--line-2,rgba(0,0,0,.12));box-shadow:0 30px 70px -20px rgba(0,0,0,.5);animation:obUp .25s cubic-bezier(.16,1,.3,1)}" +
    "@keyframes obUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}" +
    ".ob-head{display:flex;align-items:center;gap:12px;padding:15px;background:linear-gradient(120deg,#7c6dff,#ff6ec7);color:#fff}" +
    ".ob-head b{font-size:15px;font-weight:800;display:block;line-height:1.2}.ob-head i{font-size:11px;opacity:.85;font-style:normal}" +
    ".ob-x{margin-left:auto;width:30px;height:30px;border:0;border-radius:50%;background:rgba(255,255,255,.22);color:#fff;cursor:pointer;font-size:14px}" +
    ".ob-body{flex:1;overflow:auto;padding:15px;font-size:14px}" +
    ".ob-hi{color:var(--txt-2,#666);margin-bottom:12px}" +
    ".ob-cats{display:grid;grid-template-columns:1fr 1fr;gap:8px}" +
    ".ob-cat{display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding:12px;border:1px solid var(--line-2,rgba(0,0,0,.1));border-radius:16px;background:transparent;color:inherit;cursor:pointer;text-align:left;transition:.16s}" +
    ".ob-cat:hover{transform:translateY(-2px);border-color:#7c6dff}.ob-cat .e{font-size:20px}.ob-cat .l{font-size:13px;font-weight:700}" +
    ".ob-back{background:none;border:0;color:#7c6dff;font-weight:700;font-size:12px;cursor:pointer;padding:0;margin-bottom:12px}" +
    ".ob-qs{display:flex;flex-direction:column;gap:8px}" +
    ".ob-q{display:flex;justify-content:space-between;gap:8px;padding:11px 13px;border:1px solid var(--line-2,rgba(0,0,0,.1));border-radius:12px;background:transparent;color:inherit;cursor:pointer;text-align:left;font-size:13px;font-weight:600;transition:.16s}" +
    ".ob-q:hover{border-color:#7c6dff}.ob-q .c{color:#aaa}" +
    ".ob-qt{font-weight:800;margin-bottom:8px}.ob-a{line-height:1.7;color:var(--txt-2,#555)}" +
    ".ob-code{margin:8px 0;padding:9px;border-radius:8px;background:rgba(124,109,255,.1);font-family:ui-monospace,monospace;font-size:11px;line-height:1.6}" +
    ".ob-foot{padding:10px;text-align:center;font-size:11px;color:var(--sub,#999);border-top:1px solid var(--line,rgba(0,0,0,.06))}";

  function inject() {
    if (document.getElementById("onbot-style")) return;
    var st = document.createElement("style");
    st.id = "onbot-style";
    st.textContent = CSS;
    document.head.appendChild(st);

    var btn = document.createElement("button");
    btn.className = "ob-btn";
    btn.setAttribute("aria-label", "온봇 도우미");
    btn.innerHTML = '<span style="position:relative;display:inline-grid;place-items:center">' + av(38) + '<span class="ob-dot"></span></span><span>온봇</span>';
    document.body.appendChild(btn);

    var panel = null;
    var view = { cat: null, qa: null };

    function close() { if (panel) { panel.remove(); panel = null; } }
    function render() {
      var body;
      if (!view.cat) {
        body = '<p class="ob-hi">안녕하세요! 무엇이 궁금하세요? 👇 눌러보세요.</p><div class="ob-cats">' +
          CATS.map(function (c, i) { return '<button class="ob-cat" data-cat="' + i + '"><span class="e">' + c.icon + '</span><span class="l">' + c.label + '</span></button>'; }).join("") + "</div>";
      } else if (view.qa) {
        body = '<button class="ob-back" data-back="cat">← ' + view.cat.label + '</button><div class="ob-qt">' + view.qa.q + '</div><div class="ob-a">' + view.qa.a + "</div>";
      } else {
        body = '<button class="ob-back" data-back="home">← 처음으로</button><div class="ob-qt">' + view.cat.icon + " " + view.cat.label + '</div><div class="ob-qs">' +
          view.cat.items.map(function (it, i) { return '<button class="ob-q" data-q="' + i + '"><span>' + it.q + '</span><span class="c">›</span></button>'; }).join("") + "</div>";
      }
      panel.querySelector(".ob-body").innerHTML = body;
    }
    function open() {
      view = { cat: null, qa: null };
      panel = document.createElement("div");
      panel.className = "ob-panel";
      panel.innerHTML =
        '<div class="ob-head">' + av(40) + '<div><b>온봇</b><i>무한분양 디자이너 도우미</i></div><button class="ob-x" aria-label="닫기">✕</button></div>' +
        '<div class="ob-body"></div>' +
        '<div class="ob-foot">온봇은 도움말을 안내해요 · AI 응답 아님</div>';
      document.body.appendChild(panel);
      render();
      panel.querySelector(".ob-x").onclick = close;
      panel.querySelector(".ob-body").addEventListener("click", function (e) {
        var t = e.target.closest("[data-cat],[data-q],[data-back]");
        if (!t) return;
        if (t.dataset.cat != null) { view.cat = CATS[+t.dataset.cat]; view.qa = null; }
        else if (t.dataset.q != null) { view.qa = view.cat.items[+t.dataset.q]; }
        else if (t.dataset.back === "cat") { view.qa = null; }
        else if (t.dataset.back === "home") { view.cat = null; view.qa = null; }
        render();
      });
    }
    btn.onclick = function () { panel ? close() : open(); };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", inject);
  else inject();
})();
