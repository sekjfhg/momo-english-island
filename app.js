(() => {
  "use strict";

  const DATA = window.MOMO_DATA;
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches
    || window.navigator.standalone === true;
  document.documentElement.classList.toggle("is-ios", isIOS);
  document.documentElement.classList.toggle("ios-standalone", isIOS && isStandalone);

  const STORAGE_KEY = "momo-english-island-v1";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const localDateKey = (date = new Date()) => {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 10);
  };

  const now = () => Date.now();
  const DAY = 86400000;
  const MINUTE = 60000;

  const DEFAULT_STATE = {
    onboarded: false,
    view: "home",
    level: "小学",
    dailyGoal: 10,
    energy: 0,
    streak: 1,
    studyDates: [localDateKey()],
    history: {},
    dailyDate: localDateKey(),
    dailyWords: 0,
    dailyReviews: 0,
    wordMode: "learn",
    wordQueue: [],
    wordQueueMode: "",
    wordQueueIndex: 0,
    currentWordId: null,
    revealWord: false,
    wordProgress: {},
    starred: [],
    bankLevel: "全部",
    bankTheme: "全部",
    bankQuery: "",
    phonicsType: "元音",
    masteredPhonics: {},
    grammarId: DATA.grammarLessons[0].id,
    grammarAnswers: {},
    grammarProgress: {},
    sceneId: null,
    sceneHideZh: false,
    sceneAnswers: {},
    completedScenes: [],
    modal: null,
    onboardLevel: "小学",
    onboardGoal: 10,
    soundQuiz: null,
    installDismissed: false
  };

  function loadState() {
    let saved = {};
    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
      saved = {};
    }

    const merged = { ...DEFAULT_STATE, ...saved };
    merged.studyDates = Array.isArray(merged.studyDates) ? merged.studyDates : [localDateKey()];
    merged.history = merged.history || {};
    merged.wordProgress = merged.wordProgress || {};
    merged.starred = Array.isArray(merged.starred) ? merged.starred : [];
    merged.wordQueue = Array.isArray(merged.wordQueue) ? merged.wordQueue : [];
    merged.masteredPhonics = merged.masteredPhonics || {};
    merged.grammarAnswers = merged.grammarAnswers || {};
    merged.grammarProgress = merged.grammarProgress || {};
    merged.sceneAnswers = merged.sceneAnswers || {};
    merged.completedScenes = Array.isArray(merged.completedScenes) ? merged.completedScenes : [];
    merged.modal = null;

    if (merged.dailyDate !== localDateKey()) {
      merged.dailyDate = localDateKey();
      merged.dailyWords = 0;
      merged.dailyReviews = 0;
    }

    return merged;
  }

  let state = loadState();
  let deferredInstallPrompt = null;
  let toastTimer = null;
  let scenePlaybackTimer = null;

  const screen = $("#screen");
  const modalRoot = $("#modalRoot");
  const toastRegion = $("#toastRegion");
  const bottomNav = $("#bottomNav");
  const installButton = $("#installButton");

  const VIEWS = {
    home: { nav: "home" },
    words: { nav: "words" },
    phonics: { nav: "phonics" },
    grammar: { nav: "grammar" },
    profile: { nav: "profile" },
    scene: { nav: "" }
  };

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function escapeHTML(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttr(value = "") {
    return escapeHTML(value).replaceAll("`", "&#096;");
  }

  function getWord(id) {
    return DATA.words.find((word) => word.id === id) || DATA.words[0];
  }

  function getPhonetic(id) {
    return DATA.phonetics.find((item) => item.id === id);
  }

  function getGrammar(id) {
    return DATA.grammarLessons.find((lesson) => lesson.id === id) || DATA.grammarLessons[0];
  }

  function getScene(id) {
    return DATA.scenarios.find((scene) => scene.id === id) || DATA.scenarios[0];
  }

  function getProgress(id) {
    return state.wordProgress[id] || null;
  }

  function isDue(progress) {
    return progress && progress.due <= now();
  }

  function dueWords() {
    return DATA.words
      .map((word) => ({ word, progress: getProgress(word.id) }))
      .filter((item) => isDue(item.progress))
      .sort((a, b) => a.progress.due - b.progress.due)
      .map((item) => item.word);
  }

  function getLearnedWords() {
    return DATA.words.filter((word) => Boolean(getProgress(word.id)));
  }

  function getMasteredWords() {
    return DATA.words.filter((word) => (getProgress(word.id)?.stage || 0) >= 4);
  }

  function getStreak() {
    const dates = new Set(state.studyDates);
    let cursor = new Date();
    let count = 0;
    if (!dates.has(localDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);

    while (count < 366) {
      if (!dates.has(localDateKey(cursor))) break;
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return Math.max(1, count);
  }

  function markStudy(amountEnergy = 0) {
    const today = localDateKey();
    if (!state.studyDates.includes(today)) state.studyDates.push(today);
    if (state.dailyDate !== today) {
      state.dailyDate = today;
      state.dailyWords = 0;
      state.dailyReviews = 0;
    }
    if (!state.history[today]) state.history[today] = { words: 0, reviews: 0, energy: 0 };
    state.streak = getStreak();
    state.energy = Math.max(0, Number(state.energy) + Number(amountEnergy || 0));
    state.history[today].energy += Number(amountEnergy || 0);
    saveState();
    updateHeader();
  }

  function updateHeader() {
    $("#energyCount").textContent = state.energy;
    installButton.hidden = !(deferredInstallPrompt || state.installDismissed === false && window.matchMedia("(display-mode: browser)").matches);
    if (deferredInstallPrompt) installButton.hidden = false;
  }

  function showToast(message, strong = "") {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<span>${escapeHTML(message)}</span>${strong ? `<strong>${escapeHTML(strong)}</strong>` : ""}`;
    toastRegion.appendChild(toast);
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.remove(), 2600);
  }

  function burstConfetti(origin = "center") {
    const layer = $("#confettiLayer");
    const symbols = ["✦", "●", "◆", "★", "●", "✦"];
    const startX = window.innerWidth / 2;
    const startY = origin === "top" ? 80 : window.innerHeight * 0.56;
    for (let index = 0; index < 22; index += 1) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.textContent = symbols[index % symbols.length];
      piece.style.left = `${startX + (Math.random() - 0.5) * 120}px`;
      piece.style.top = `${startY}px`;
      piece.style.color = ["#ff735c", "#ffd35c", "#38ad85", "#4ba4d4", "#7a6ed0"][index % 5];
      piece.style.setProperty("--dx", `${(Math.random() - 0.5) * 350}px`);
      piece.style.setProperty("--dy", `${-80 - Math.random() * 330}px`);
      piece.style.setProperty("--rot", `${(Math.random() - 0.5) * 540}deg`);
      piece.style.animationDelay = `${Math.random() * 120}ms`;
      layer.appendChild(piece);
      window.setTimeout(() => piece.remove(), 1200);
    }
  }

  function speak(text, rate = 0.82) {
    const clean = String(text || "").trim();
    if (!clean) return;

    try {
      if (window.AndroidNative?.speak) {
        window.AndroidNative.speak(clean, rate);
        return;
      }
    } catch {
      // Fall through to Web Speech.
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = "en-US";
      utterance.rate = rate;
      utterance.pitch = 1.02;
      window.speechSynthesis.speak(utterance);
      return;
    }
    showToast("当前浏览器暂不支持语音朗读");
  }

  function vibrate(ms = 18) {
    try {
      if (window.AndroidNative?.vibrate) {
        window.AndroidNative.vibrate(ms);
      } else if (navigator.vibrate) {
        navigator.vibrate(ms);
      }
    } catch {
      // Haptics are optional.
    }
  }

  function greetingText() {
    const hour = new Date().getHours();
    if (hour < 6) return "夜深了";
    if (hour < 11) return "早上好";
    if (hour < 14) return "中午好";
    if (hour < 18) return "下午好";
    return "晚上好";
  }

  function updateNavigation() {
    const nav = VIEWS[state.view]?.nav || "";
    $$(".nav-tab").forEach((tab) => {
      tab.classList.toggle("is-active", tab.dataset.go === nav);
    });
    bottomNav.hidden = state.view === "scene";
    updateHeader();
  }

  function go(view, options = {}) {
    if (!VIEWS[view]) return;
    state.view = view;
    state.modal = null;
    modalRoot.innerHTML = "";
    document.body.style.overflow = "";

    if (view === "words") {
      ensureWordQueue(state.wordMode, Boolean(options.forceQueue));
    }

    saveState();
    render();
    window.scrollTo({ top: 0, behavior: options.instant ? "auto" : "smooth" });
    screen.focus({ preventScroll: true });
  }

  function ensureWordQueue(mode = "learn", force = false) {
    if (!force && state.wordQueueMode === mode && state.wordQueue.length && state.currentWordId) return;

    let queue = [];
    if (mode === "review") {
      queue = dueWords();
    } else {
      queue = DATA.words.filter((word) => {
        return word.level === state.level && !getProgress(word.id);
      }).slice(0, state.dailyGoal);
    }

    state.wordMode = mode;
    state.wordQueueMode = mode;
    state.wordQueue = queue.map((word) => word.id);
    state.wordQueueIndex = 0;
    state.currentWordId = state.wordQueue[0] || null;
    state.revealWord = false;
    saveState();
  }

  function mascotSVG() {
    return `
      <svg viewBox="0 0 160 180" role="img" aria-label="单词小狗 Momo">
        <ellipse cx="82" cy="166" rx="48" ry="8" fill="rgba(0,0,0,.12)"/>
        <path d="M41 163c2-15 17-24 40-24s39 9 42 24" fill="#ffd35c"/>
        <path d="M57 111c-14-9-18-29-6-44 11-14 33-19 50-9 20 11 25 34 12 52-11 15-39 20-56 1Z" fill="#fff9ef" stroke="#173b4d" stroke-width="3"/>
        <path d="M51 69C31 58 31 38 43 37c12-1 20 16 20 30M114 66c21-12 26-31 14-34-12-2-22 15-24 29" fill="#ff735c" stroke="#173b4d" stroke-width="3"/>
        <path d="M58 67c10-8 22-7 30 1 8-7 19-8 28 0" fill="none" stroke="#173b4d" stroke-width="3" stroke-linecap="round"/>
        <ellipse cx="67" cy="75" rx="8" ry="9" fill="#173b4d"/>
        <ellipse cx="104" cy="75" rx="8" ry="9" fill="#173b4d"/>
        <circle cx="70" cy="72" r="2.4" fill="#fff"/>
        <circle cx="107" cy="72" r="2.4" fill="#fff"/>
        <path d="m83 86 7 6 7-6M90 92v7" fill="none" stroke="#173b4d" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M75 104c8 7 17 7 25 0" fill="none" stroke="#173b4d" stroke-width="3" stroke-linecap="round"/>
        <path d="M54 108c21 16 43 15 65-1l6 8c-23 20-50 22-77 2Z" fill="#38ad85" stroke="#173b4d" stroke-width="2.5"/>
        <path d="M49 138c-7 8-7 17 3 20 8 2 10-8 7-15M112 139c7 7 8 16-2 19-8 2-11-7-8-15" fill="#fff9ef" stroke="#173b4d" stroke-width="2.5"/>
        <path d="M64 120c0 9 5 15 12 19M98 120c0 9-5 15-12 19" fill="none" stroke="#173b4d" stroke-width="2.4"/>
        <circle cx="40" cy="126" r="6" fill="#4ba4d4" opacity=".7"/>
        <circle cx="122" cy="118" r="4" fill="#ffd35c"/>
      </svg>
    `;
  }

  function render() {
    const renderers = {
      home: renderHome,
      words: renderWords,
      phonics: renderPhonics,
      grammar: renderGrammar,
      profile: renderProfile,
      scene: renderScene
    };
    screen.innerHTML = renderers[state.view]?.() || renderHome();
    updateNavigation();
    if (!state.onboarded) renderModal();
    document.title = `${state.view === "home" ? "今日学习" : viewTitle(state.view)} · MOMO英语岛`;
    bindViewInputs();
  }

  function viewTitle(view) {
    return {
      home: "今日学习",
      words: "单词",
      phonics: "音标",
      grammar: "语法",
      profile: "我的",
      scene: "生活口语"
    }[view] || "英语岛";
  }

  function renderHome() {
    const due = dueWords();
    const learned = getLearnedWords().length;
    const tip = DATA.dailyTips[new Date().getDate() % DATA.dailyTips.length];
    const nextScene = DATA.scenarios.find((scene) => !state.completedScenes.includes(scene.id)) || DATA.scenarios[0];
    const goalPercent = Math.min(100, Math.round((state.dailyWords / state.dailyGoal) * 100));
    const completedGrammar = Object.values(state.grammarProgress).filter((item) => item.done).length;

    return `
      <section class="home-greeting">
        <div>
          <span class="eyebrow">${greetingText()} · 今天也来开口</span>
          <h1>Momo 在岛上等你。</h1>
          <p>${state.dailyWords}/${state.dailyGoal} 个新词 · ${due.length} 个待复习</p>
        </div>
        <div class="streak-bubble" aria-label="连续学习 ${getStreak()} 天">
          <span><strong>${getStreak()}</strong><small>连续天数</small></span>
        </div>
      </section>

      <section class="island-hero">
        <div class="hero-copy">
          <span class="level-chip">${escapeHTML(state.level)}路线 · 今日约 ${state.dailyGoal + 5} 分钟</span>
          <h2>从“看懂”到<br>敢开口说。</h2>
          <p>先认一个词，再学一种说法，最后把它放进真实生活。</p>
          <button class="hero-cta" data-go="words">开始今天的学习 <span>→</span></button>
        </div>
        <div class="mascot-speech">${state.dailyWords ? "你已经种下一颗新种子！" : "别急，我们先从 10 分钟开始。"}</div>
        <div class="hero-mascot" aria-hidden="true">${mascotSVG()}</div>
      </section>

      <section class="hero-stats" aria-label="学习统计">
        <div><strong>${learned}</strong><span>已遇见单词</span></div>
        <div><strong>${getMasteredWords().length}</strong><span>熟悉单词</span></div>
        <div><strong>${completedGrammar}/8</strong><span>语法站点</span></div>
      </section>

      <div class="section-title-row">
        <div><span class="eyebrow">今日路线</span><h2>三个小站，慢慢前进</h2></div>
        <span class="goal-dots">${Array.from({ length: Math.min(10, state.dailyGoal) }, (_, index) => `<i class="${index < state.dailyWords ? "is-done" : ""}"></i>`).join("")}</span>
      </div>

      <section class="route-board">
        <button class="route-stop" data-go="words">
          <span class="route-icon">📚</span>
          <span class="route-copy"><strong>${state.dailyWords ? "继续今天的词卡" : "认识今天的新词"}</strong><small>${due.length ? `先复习 ${due.length} 个到期单词，再学新词` : `按 ${state.level} 难度学习 ${state.dailyGoal} 个词`}</small></span>
          <span class="route-go">→</span>
        </button>
        <button class="route-stop" data-go="phonics">
          <span class="route-icon">🎧</span>
          <span class="route-copy"><strong>在声音花园读一读</strong><small>分清长短音，听见单词真正的形状</small></span>
          <span class="route-go">→</span>
        </button>
        <button class="route-stop" data-go="grammar">
          <span class="route-icon">🚂</span>
          <span class="route-copy"><strong>乘时间小火车学语法</strong><small>用一个生活场景，理解一种时态</small></span>
          <span class="route-go">→</span>
        </button>
      </section>

      <div class="section-title-row">
        <div><span class="eyebrow">生活英语</span><h2>今天开口说什么？</h2></div>
        <button class="text-button" data-go="profile">查看足迹 →</button>
      </div>

      <button class="scene-highlight" data-action="open-scene" data-scene-id="${nextScene.id}">
        <div>
          <span class="eyebrow">${escapeHTML(nextScene.setting)}</span>
          <h3>${escapeHTML(nextScene.title)}</h3>
          <p>${escapeHTML(nextScene.subtitle)} · 4 句对话 + 1 次开口选择</p>
          <span class="scene-action">进入场景 →</span>
        </div>
        <span class="scene-emoji">${nextScene.emoji}</span>
      </button>

      <div class="install-banner">
        <div><strong>把英语岛装到手机桌面</strong><p>安装后可全屏打开，学习记录和内容离线保存。</p></div>
        <button data-action="install-app">安装</button>
      </div>

      <div class="section-title-row">
        <div><span class="eyebrow">Momo 的便签</span><h2>今天记一句</h2></div>
      </div>
      <div class="memory-note" style="background:#edf8f4">
        <strong>✦</strong>
        <span>${escapeHTML(tip)}</span>
      </div>
      <div class="mini-progress" style="margin-top:14px"><span style="width:${goalPercent}%"></span></div>
    `;
  }

  function currentQueueWord() {
    if (state.wordQueueIndex >= state.wordQueue.length) return null;
    return getWord(state.wordQueue[state.wordQueueIndex]);
  }

  function renderWords() {
    if (state.wordMode === "bank") {
      return renderWordBank();
    }

    if (!state.wordQueue.length || state.wordQueueMode !== state.wordMode) {
      ensureWordQueue(state.wordMode);
    }
    const word = currentQueueWord();

    return `
      <div class="view-head">
        <div>
          <span class="eyebrow">单词街区</span>
          <h1 class="view-title">${state.wordMode === "review" ? "把记忆找回来" : "今天遇见的新词"}</h1>
          <p class="view-subtitle">${state.wordMode === "review" ? "按遗忘曲线安排复习，忘掉也没关系。" : `当前难度：${escapeHTML(state.level)} · 每天 ${state.dailyGoal} 个`}</p>
        </div>
        <div class="small-stat"><strong>${state.dailyWords}</strong><small>今日已学</small></div>
      </div>

      <div class="word-topbar">
        <div class="segmented" role="tablist" aria-label="单词模式">
          <button class="${state.wordMode === "learn" ? "is-active" : ""}" data-action="word-mode" data-mode="learn">新词</button>
          <button class="${state.wordMode === "review" ? "is-active" : ""}" data-action="word-mode" data-mode="review">复习 <span>${dueWords().length || ""}</span></button>
          <button class="${state.wordMode === "bank" ? "is-active" : ""}" data-action="word-mode" data-mode="bank">词库</button>
        </div>
        <div class="level-filter" style="padding:0">
          ${DATA.levels.map((level) => `<button class="filter-chip${state.level === level ? " is-active" : ""}" data-action="set-level" data-level="${level}">${level}</button>`).join("")}
        </div>
      </div>

      ${word ? renderWordCard(word) : renderWordEmpty()}
    `;
  }

  function renderWordCard(word) {
    const progress = getProgress(word.id);
    const starred = state.starred.includes(word.id);
    const progressPercent = state.wordQueue.length
      ? Math.round((state.wordQueueIndex / state.wordQueue.length) * 100)
      : 0;
    const displayLevel = state.wordMode === "review" ? "到期复习" : `${word.level}词库`;

    return `
      <article class="word-card color-${word.colorIndex}" id="wordCard">
        <div class="word-card-top">
          <span class="level-pill">${displayLevel} · ${escapeHTML(word.theme)}</span>
          <div class="word-card-tools">
            <button class="round-tool${starred ? " is-starred" : ""}" data-action="star-word" data-word-id="${word.id}" aria-label="${starred ? "取消收藏" : "收藏单词"}">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z"/></svg>
            </button>
            <button class="round-tool" data-action="speak" data-text="${escapeAttr(word.word)}" aria-label="朗读 ${escapeAttr(word.word)}">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h3l4 4V6L7 10z"/><path d="M15 9c2 2 2 4 0 6M18 6c4 4 4 8 0 12"/></svg>
            </button>
          </div>
        </div>

        <div class="word-visual" aria-hidden="true">${word.emoji}</div>
        <div class="word-main">
          <h1>${escapeHTML(word.word)}</h1>
          <span class="word-ipa">${escapeHTML(word.ipa)}
            <button data-action="speak" data-text="${escapeAttr(word.word)}" aria-label="播放读音">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h3l4 4V6L7 10z"/><path d="M16 10c1 1 1 3 0 4"/></svg>
            </button>
          </span>
        </div>

        <div class="word-reveal-zone">
          ${state.revealWord ? `
            <div class="word-answer">
              <div class="translation-line">${escapeHTML(word.meaning)}</div>
              <div class="memory-note"><strong>✦</strong><span>${escapeHTML(word.memory)}</span></div>
              <p class="example-line">${escapeHTML(word.example)}<span>${escapeHTML(word.translation)}</span></p>
              <div class="rating-row" aria-label="记忆程度">
                <button class="rating-button" data-action="rate-word" data-rating="again">先忘了<small>稍后再见</small></button>
                <button class="rating-button" data-action="rate-word" data-rating="fuzzy">有点模糊<small>明天复习</small></button>
                <button class="rating-button" data-action="rate-word" data-rating="know">认识了<small>间隔拉长</small></button>
              </div>
            </div>
          ` : `
            <div class="reveal-hint">${progress ? "想一想：它是什么意思？" : "先看图和发音，在脑中猜一猜。"}</div>
            <button class="reveal-button" data-action="reveal-word">想好了，翻开答案</button>
          `}
          <div class="word-progress-bottom">
            <div class="mini-progress"><span style="width:${progressPercent}%"></span></div>
            <small>${state.wordQueueIndex + 1} / ${state.wordQueue.length}</small>
          </div>
        </div>
      </article>
    `;
  }

  function renderWordEmpty() {
    const isReview = state.wordMode === "review";
    return `
      <section class="empty-state">
        <div>
          <div class="empty-icon">${isReview ? "🌙" : "🌱"}</div>
          <h2>${isReview ? "今天的复习完成了" : `${escapeHTML(state.level)}新词暂时学完`}</h2>
          <p>${isReview ? "没有到期的单词。去学几个新词，或从词库里挑一个再巩固。" : "可以去复习已学单词，也可以切换一个难度继续探索。"}</p>
          <button class="primary-button" data-action="${isReview ? "word-mode" : "open-word-bank"}" ${isReview ? 'data-mode="bank"' : ""}>${isReview ? "打开我的词库" : "去词库挑词"}</button>
        </div>
      </section>
    `;
  }

  function renderWordBank() {
    if (!state.wordQueue.length && state.wordQueueMode !== "bank") {
      state.wordMode = "bank";
      state.wordQueueMode = "bank";
    }
    const filtered = DATA.words.filter((word) => {
      if (state.bankLevel !== "全部" && word.level !== state.bankLevel) return false;
      if (state.bankTheme !== "全部" && word.theme !== state.bankTheme) return false;
      if (state.bankQuery) {
        const haystack = `${word.word} ${word.meaning} ${word.translation} ${word.theme}`.toLowerCase();
        if (!haystack.includes(state.bankQuery.toLowerCase())) return false;
      }
      return true;
    });

    return `
      <div class="view-head">
        <div>
          <span class="eyebrow">分级词库</span>
          <h1 class="view-title">把生活装进词卡</h1>
          <p class="view-subtitle">参考小学、初中、高中英语课程的常见主题精选，共 ${DATA.words.length} 个起始词。</p>
        </div>
        <div class="small-stat"><strong>${filtered.length}</strong><small>当前词条</small></div>
      </div>
      <div class="segmented" style="margin-bottom:12px" role="tablist" aria-label="单词模式">
        <button data-action="word-mode" data-mode="learn">新词</button>
        <button data-action="word-mode" data-mode="review">复习 ${dueWords().length || ""}</button>
        <button class="is-active" data-action="word-mode" data-mode="bank">词库</button>
      </div>
      <div class="level-filter">
        ${["全部", ...DATA.levels].map((level) => `<button class="filter-chip${state.bankLevel === level ? " is-active" : ""}" data-action="bank-level" data-level="${level}">${level}</button>`).join("")}
      </div>
      <div class="level-filter" style="padding-top:0">
        ${["全部", ...DATA.wordThemes].slice(0, 12).map((theme) => `<button class="filter-chip${state.bankTheme === theme ? " is-active" : ""}" data-action="bank-theme" data-theme="${escapeAttr(theme)}">${escapeHTML(theme)}</button>`).join("")}
      </div>
      <label class="bank-search">
        <span class="sr-only">搜索单词</span>
        <input id="bankSearchInput" value="${escapeAttr(state.bankQuery)}" placeholder="搜索英文、中文或主题…">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 4.5 4.5"/></svg>
      </label>
      <div class="word-list">
        ${filtered.length ? filtered.map((word) => {
          const progress = getProgress(word.id);
          return `
            <button class="word-row" data-action="open-word" data-word-id="${word.id}">
              <span class="word-row-emoji">${word.emoji}</span>
              <span><strong>${escapeHTML(word.word)}</strong><small>${escapeHTML(word.meaning)} · ${escapeHTML(word.theme)}</small></span>
              <span class="word-row-meta"><span>${escapeHTML(word.level)}</span><i>${state.starred.includes(word.id) ? "★" : progress ? `L${Math.min(6, progress.stage + 1)}` : ""}</i></span>
            </button>
          `;
        }).join("") : `<div class="empty-state" style="min-height:260px"><div><div class="empty-icon">🔎</div><h2>没有找到这个词</h2><p>换个中文释义或主题试试。</p></div></div>`}
      </div>
    `;
  }

  function renderPhonics() {
    const filtered = DATA.phonetics.filter((item) => state.phonicsType === "全部" || item.type === state.phonicsType);
    const masteredCount = Object.values(state.masteredPhonics).filter(Boolean).length;

    return `
      <div class="view-head">
        <div>
          <span class="eyebrow">声音花园</span>
          <h1 class="view-title">先听清，再读准</h1>
          <p class="view-subtitle">不背抽象符号，跟着口型和例词练习。点击音标听单词发音。</p>
        </div>
        <div class="small-stat"><strong>${masteredCount}</strong><small>已掌握</small></div>
      </div>

      <section class="phonics-hero">
        <div class="sound-waves" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
        <span class="eyebrow" style="color:#fff">48 个声音朋友</span>
        <h2>嘴巴的位置，决定声音的样子。</h2>
        <p>每天挑 3 个音，听例词、看提示、读三遍，就足够形成新的耳朵记忆。</p>
      </section>

      <div class="level-filter" style="margin-top:17px">
        ${["元音", "辅音", "全部"].map((type) => `<button class="filter-chip${state.phonicsType === type ? " is-active" : ""}" data-action="phonics-filter" data-type="${type}">${type === "元音" ? "元音 · 20" : type === "辅音" ? "辅音 · 28" : "全部 · 48"}</button>`).join("")}
      </div>

      <div class="sound-legend">
        <h2>${state.phonicsType === "元音" ? "让声音变得饱满" : state.phonicsType === "辅音" ? "让咬字变得清楚" : "完整音标地图"}</h2>
        <span>${filtered.filter((item) => state.masteredPhonics[item.id]).length} / ${filtered.length}</span>
      </div>

      <div class="sound-grid">
        ${filtered.map((item) => `
          <button class="sound-chip${state.masteredPhonics[item.id] ? " is-mastered" : ""}" data-action="open-phonetic" data-id="${item.id}">
            <strong>/${escapeHTML(item.symbol)}/</strong>
            <small>${escapeHTML(item.word)}</small>
          </button>
        `).join("")}
      </div>

      <button class="sound-quiz-card" data-action="start-sound-quiz">
        <span class="quiz-icon">🎧</span>
        <span><strong>听音小挑战</strong><small>听一个单词，找出它包含的音标</small></span>
        <span>→</span>
      </button>
    `;
  }

  function renderMouthCoach(item) {
    const wide = ["æ", "ɑː", "aɪ", "aʊ"].includes(item.symbol);
    const round = ["ɒ", "ɔː", "ʊ", "uː", "əʊ", "ɔɪ", "w"].includes(item.symbol);
    const width = wide ? 104 : round ? 50 : 76;
    const height = wide ? 48 : round ? 62 : 35;
    return `
      <div class="mouth-coach" aria-label="口型提示">
        <svg viewBox="0 0 160 100">
          <path d="M18 48c22-25 102-25 124 0-23 35-101 35-124 0Z" fill="#ffb6aa" stroke="#173b4d"/>
          <ellipse cx="80" cy="49" rx="${width / 2}" ry="${height / 2}" fill="#173b4d"/>
          <path d="M35 21c12-10 28-11 40-5M125 21c-12-10-28-11-40-5" fill="none" stroke="#173b4d" opacity=".45"/>
        </svg>
      </div>
    `;
  }

  function renderGrammar() {
    const completed = DATA.grammarLessons.filter((lesson) => state.grammarProgress[lesson.id]?.done).length;
    const lesson = getGrammar(state.grammarId);
    const answers = lesson.quiz.map((_, index) => state.grammarAnswers[`${lesson.id}:${index}`]);
    const allAnswered = answers.every((answer) => answer !== undefined);
    const correctCount = lesson.quiz.reduce((sum, question, index) => sum + (answers[index] === question.answer ? 1 : 0), 0);
    const completedThis = Boolean(state.grammarProgress[lesson.id]?.done);

    return `
      <div class="view-head">
        <div>
          <span class="eyebrow">语法小火车</span>
          <h1 class="view-title">把时间排成顺序</h1>
          <p class="view-subtitle">从一句生活话出发，看懂动作发生在什么时候。</p>
        </div>
        <div class="small-stat"><strong>${completed}/8</strong><small>已完成</small></div>
      </div>

      <div class="grammar-train" aria-label="语法学习路径">
        <div class="train-track">
          ${DATA.grammarLessons.map((item, index) => `
            <button class="train-stop${item.id === lesson.id ? " is-active" : ""}${state.grammarProgress[item.id]?.done ? " is-done" : ""}" data-action="choose-grammar" data-id="${item.id}">
              <i>${state.grammarProgress[item.id]?.done ? "✓" : index + 1}</i>
              <span>${escapeHTML(item.title)}</span>
            </button>
          `).join("")}
        </div>
      </div>

      <section class="lesson-card accent-${escapeAttr(lesson.color)}">
        <span class="lesson-tag">${escapeHTML(lesson.badge)}</span>
        <h2>${escapeHTML(lesson.title)}</h2>
        <span class="lesson-en">${escapeHTML(lesson.en)}</span>
        <div class="formula-box">${escapeHTML(lesson.form)}</div>
        <p class="lesson-use">${escapeHTML(lesson.use)}</p>
        <div class="signal-row">${lesson.signals.map((signal) => `<span>${escapeHTML(signal)}</span>`).join("")}</div>
      </section>

      <div class="section-title-row">
        <div><span class="eyebrow">听懂它在生活里</span><h2>三个真实句子</h2></div>
        <button class="text-button" data-action="speak-lesson">整组朗读</button>
      </div>
      <div class="example-stack">
        ${lesson.examples.map((example, index) => `
          <div class="example-item">
            <span>${String(index + 1).padStart(2, "0")}</span>
            <div><strong>${escapeHTML(example.en)}</strong><small>${escapeHTML(example.zh)}</small></div>
            <button class="speak-mini" data-action="speak" data-text="${escapeAttr(example.en)}" aria-label="朗读例句">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h3l4 4V6L7 10z"/><path d="M16 10c1 1 1 3 0 4"/></svg>
            </button>
          </div>
        `).join("")}
      </div>

      <section class="grammar-quiz">
        <h3>到站小测 <span class="lesson-tag">${correctCount}/${lesson.quiz.length}</span></h3>
        ${lesson.quiz.map((question, questionIndex) => {
          const selected = answers[questionIndex];
          return `
            <div class="quiz-question">
              <p>${escapeHTML(question.q)}</p>
              <div class="quiz-options">
                ${question.options.map((option, optionIndex) => {
                  let status = "";
                  if (selected !== undefined && optionIndex === question.answer) status = "is-correct";
                  if (selected === optionIndex && optionIndex !== question.answer) status = "is-wrong";
                  return `<button class="quiz-option ${status}" data-action="grammar-answer" data-lesson-id="${lesson.id}" data-question="${questionIndex}" data-option="${optionIndex}">${escapeHTML(option)}</button>`;
                }).join("")}
              </div>
              ${selected !== undefined ? `<div class="quiz-feedback">${selected === question.answer ? "答对了。" : `正确答案是“${escapeHTML(question.options[question.answer])}”。`} ${escapeHTML(question.explain)}</div>` : ""}
            </div>
          `;
        }).join("")}
        <div class="lesson-footer">
          <span>${completedThis ? `已到站 · ${state.grammarProgress[lesson.id].score}/${lesson.quiz.length}` : allAnswered ? "本轮已作答" : `还有 ${answers.filter((answer) => answer === undefined).length} 题`}</span>
          <button class="primary-button" data-action="next-grammar">${completedThis ? "下一站 →" : allAnswered ? "完成本站 →" : "先做完小测"}</button>
        </div>
      </section>
    `;
  }

  function weeklyBars() {
    const labels = ["一", "二", "三", "四", "五", "六", "日"];
    const date = new Date();
    const monday = new Date(date);
    monday.setDate(date.getDate() - ((date.getDay() + 6) % 7));

    return labels.map((label, index) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + index);
      const key = localDateKey(day);
      const activity = state.history[key] || { words: 0, reviews: 0 };
      const total = activity.words + activity.reviews;
      const height = total ? Math.min(78, 14 + total * 7) : 8;
      return `<div class="day-bar${key === localDateKey() ? " is-today" : ""}"><i style="height:${height}%"></i>${label}</div>`;
    }).join("");
  }

  function renderProfile() {
    const learned = getLearnedWords().length;
    const due = dueWords().length;
    const mastered = getMasteredWords().length;
    const completedGrammar = Object.values(state.grammarProgress).filter((item) => item.done).length;
    const masteredSounds = Object.values(state.masteredPhonics).filter(Boolean).length;
    const badges = [
      { icon: "🌱", title: "第一次发芽", earned: learned > 0 },
      { icon: "🔥", title: "连续 3 天", earned: getStreak() >= 3 },
      { icon: "📚", title: "认识 10 词", earned: learned >= 10 },
      { icon: "🎧", title: "读准 10 音", earned: masteredSounds >= 10 },
      { icon: "🚂", title: "语法 3 站", earned: completedGrammar >= 3 },
      { icon: "💬", title: "开口说话", earned: state.completedScenes.length > 0 }
    ];

    return `
      <section class="profile-card">
        <div class="profile-mascot">${mascotSVG()}</div>
        <div class="profile-copy">
          <span>你好，学习者</span>
          <h1>Momo 的同路人</h1>
          <p>${state.dailyGoal} 分钟一天，慢慢把英语变成生活的一部分。</p>
          <span class="profile-level">${escapeHTML(state.level)} · 每日目标 ${state.dailyGoal} 词</span>
        </div>
      </section>

      <div class="stats-grid">
        <div class="stat-tile"><strong>${learned}</strong><span>遇见过的单词</span></div>
        <div class="stat-tile"><strong>${mastered}</strong><span>进入长期记忆</span></div>
        <div class="stat-tile"><strong>${masteredSounds}</strong><span>掌握的音标</span></div>
        <div class="stat-tile"><strong>${due}</strong><span>今天待复习</span></div>
      </div>

      <section class="week-card">
        <h2>这周的学习足迹</h2>
        <div class="week-chart">${weeklyBars()}</div>
      </section>

      <section class="achievement-card">
        <h2>小岛徽章</h2>
        <div class="achievement-list">
          ${badges.map((badge) => `<div class="badge-item${badge.earned ? " is-earned" : ""}"><span>${badge.icon}</span><small>${badge.title}</small></div>`).join("")}
        </div>
      </section>

      <section class="settings-card">
        <h2>学习设置</h2>
        <div class="settings-row">
          <div><strong>当前难度</strong><small>切换后从该级别的新词继续</small></div>
          <select id="profileLevel">
            ${DATA.levels.map((level) => `<option value="${level}"${state.level === level ? " selected" : ""}>${level}</option>`).join("")}
          </select>
        </div>
        <div class="settings-row">
          <div><strong>每日新词</strong><small>小步稳定比一次学很多更有效</small></div>
          <select id="profileGoal">
            ${[5, 10, 15, 20].map((goal) => `<option value="${goal}"${state.dailyGoal === goal ? " selected" : ""}>${goal} 个</option>`).join("")}
          </select>
        </div>
        <div class="settings-row">
          <div><strong>安装到手机</strong><small>离线打开，记录保存在当前设备</small></div>
          <button data-action="install-app">安装 / 教程</button>
        </div>
        <div class="settings-row">
          <div><strong>学习数据</strong><small>已保存在此浏览器，不会自动上传</small></div>
          <button data-action="open-reset">清空记录</button>
        </div>
      </section>
    `;
  }

  function renderScene() {
    const scene = getScene(state.sceneId);
    const selected = state.sceneAnswers[scene.id];
    const completed = state.completedScenes.includes(scene.id);

    return `
      <div class="scene-view">
        <div class="back-row">
          <button class="back-button" data-go="home" aria-label="返回首页">←</button>
          <span>生活口语 · ${escapeHTML(scene.setting)}</span>
        </div>
        <section class="scene-cover ${escapeAttr(scene.color)}">
          <span class="big-emoji">${scene.emoji}</span>
          <span class="scene-setting">${escapeHTML(scene.setting)}</span>
          <h1>${escapeHTML(scene.title)}</h1>
          <p>${escapeHTML(scene.subtitle)} · 先听，再跟读，最后自己回答</p>
        </section>

        <div class="scene-toolbar">
          <h2>四句对话</h2>
          <div style="display:flex;align-items:center;gap:12px">
            <button class="text-button" data-action="play-scene">播放对话</button>
            <button class="toggle-line" data-action="toggle-scene-zh">
              <span class="tiny-switch${state.sceneHideZh ? "" : " is-on"}"></span>中文提示
            </button>
          </div>
        </div>

        <div class="dialogue-list">
          ${scene.lines.map((line, index) => `
            <div class="dialogue-line${line.speaker === "You" ? " is-you" : ""}">
              <span class="speaker-dot">${line.speaker === "You" ? "我" : escapeHTML(line.speaker.slice(0, 1))}</span>
              <div class="dialogue-bubble">
                <strong>${escapeHTML(line.en)}
                  <button data-action="speak" data-text="${escapeAttr(line.en)}" aria-label="朗读第 ${index + 1} 句">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h3l4 4V6L7 10z"/><path d="M16 10c1 1 1 3 0 4"/></svg>
                  </button>
                </strong>
                ${state.sceneHideZh ? "" : `<small>${escapeHTML(line.zh)}</small>`}
              </div>
            </div>
          `).join("")}
        </div>

        <section class="scene-challenge">
          <span class="eyebrow">轮到你说</span>
          <h3>${escapeHTML(scene.challenge.q)}</h3>
          <p>先说出你的答案，再点选核对。</p>
          <div class="quiz-options">
            ${scene.challenge.options.map((option, index) => {
              let status = "";
              if (selected !== undefined && index === scene.challenge.answer) status = "is-correct";
              if (selected === index && index !== scene.challenge.answer) status = "is-wrong";
              return `<button class="quiz-option ${status}" data-action="scene-answer" data-scene-id="${scene.id}" data-option="${index}">${escapeHTML(option)}</button>`;
            }).join("")}
          </div>
          ${selected !== undefined ? `<div class="quiz-feedback">${selected === scene.challenge.answer ? "说对了，这个场景已经装进你的口袋。" : `参考答案：${escapeHTML(scene.challenge.options[scene.challenge.answer])}`} ${escapeHTML(scene.challenge.explain)}</div>` : ""}
          <div style="display:flex;justify-content:flex-end;margin-top:12px">
            <button class="primary-button" data-action="speak" data-text="${escapeAttr(scene.challenge.options[scene.challenge.answer])}">跟读参考答案</button>
          </div>
        </section>

        <div class="install-banner" style="margin-bottom:20px">
          <div><strong>${completed ? "这个场景已经完成" : "完成一次开口就点亮场景"}</strong><p>回到首页，继续发现另一个生活场景。</p></div>
          <button data-go="home">回小岛</button>
        </div>
      </div>
    `;
  }

  function openModal(type, payload = {}) {
    state.modal = { type, ...payload };
    document.body.style.overflow = "hidden";
    renderModal();
  }

  function closeModal() {
    if (!state.onboarded && state.modal?.type === "onboarding") return;
    state.modal = null;
    document.body.style.overflow = "";
    modalRoot.innerHTML = "";
  }

  function renderModal() {
    if (!state.onboarded) {
      renderOnboarding();
      return;
    }
    if (!state.modal) {
      modalRoot.innerHTML = "";
      document.body.style.overflow = "";
      return;
    }

    if (state.modal.type === "word") {
      renderWordModal(getWord(state.modal.wordId));
    } else if (state.modal.type === "phonetic") {
      renderPhoneticModal(getPhonetic(state.modal.phoneticId));
    } else if (state.modal.type === "sound-quiz") {
      renderSoundQuizModal();
    } else if (state.modal.type === "install") {
      renderInstallModal();
    } else if (state.modal.type === "reset") {
      renderResetModal();
    } else {
      closeModal();
    }
  }

  function modalShell(content, className = "bottom-sheet") {
    return `
      <div class="modal-backdrop" data-modal-backdrop>
        <section class="${className}" role="dialog" aria-modal="true">
          ${className === "bottom-sheet" ? '<div class="sheet-grabber"></div>' : ""}
          <div class="sheet-content">${content}</div>
        </section>
      </div>
    `;
  }

  function renderOnboarding() {
    modalRoot.innerHTML = modalShell(`
      <div class="onboarding-inner">
        <div class="onboarding-mascot" aria-hidden="true">${mascotSVG()}</div>
        <span class="eyebrow">你好，我是 Momo</span>
        <h1>一起把英语学成<br>能用的样子。</h1>
        <p>先选一个舒服的起点。Momo 会根据你的节奏安排单词、发音和语法，不追赶、不硬背。</p>
        <label class="choice-label">我的英语起点</label>
        <div class="onboarding-choices">
          ${[
            ["小学", "从身边事物开始"],
            ["初中", "连接校园与出行"],
            ["高中", "走向表达与思考"]
          ].map(([level, desc]) => `
            <button class="onboarding-choice${state.onboardLevel === level ? " is-active" : ""}" data-action="onboard-level" data-level="${level}">
              <strong>${level}</strong><small>${desc}</small>
            </button>
          `).join("")}
        </div>
        <label class="choice-label">每天打算学几个新词？</label>
        <div class="goal-choices">
          ${[5, 10, 15].map((goal) => `<button class="goal-choice${state.onboardGoal === goal ? " is-active" : ""}" data-action="onboard-goal" data-goal="${goal}">${goal} 个 · ${goal === 5 ? "轻量" : goal === 10 ? "推荐" : "加量"}</button>`).join("")}
        </div>
        <button class="onboarding-start" data-action="complete-onboarding">登岛，开始第一天 →</button>
      </div>
    `, "onboarding-sheet");
  }

  function renderWordModal(word) {
    const starred = state.starred.includes(word.id);
    modalRoot.innerHTML = modalShell(`
      <div class="sheet-top">
        <div><span class="eyebrow">${escapeHTML(word.level)} · ${escapeHTML(word.theme)}</span><h2>词卡放大镜</h2></div>
        <button class="close-button" data-action="close-modal" aria-label="关闭">×</button>
      </div>
      <div class="word-detail-visual" style="background:${["#dceffa", "#d9f3e8", "#fff4cf", "#ffe3eb", "#e8e1ff", "#e7f2dd"][word.colorIndex]}">${word.emoji}</div>
      <div class="word-detail-head">
        <div><h2>${escapeHTML(word.word)}</h2><span class="word-ipa">${escapeHTML(word.ipa)}</span></div>
        <button class="detail-speaker" data-action="speak" data-text="${escapeAttr(word.word)}" aria-label="播放读音">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h3l4 4V6L7 10z"/><path d="M16 10c1 1 1 3 0 4"/></svg>
        </button>
      </div>
      <p class="detail-meaning">${escapeHTML(word.meaning)}</p>
      <div class="detail-memory"><strong>图像记忆：</strong>${escapeHTML(word.memory)}</div>
      <div class="detail-example"><strong>${escapeHTML(word.example)}</strong><small>${escapeHTML(word.translation)}</small></div>
      <div class="detail-actions">
        <button class="secondary-button" data-action="star-word" data-word-id="${word.id}">${starred ? "★ 已收藏" : "☆ 收藏生词"}</button>
        <button class="primary-button" data-action="add-word-review" data-word-id="${word.id}">加入复习</button>
      </div>
    `);
  }

  function renderPhoneticModal(item) {
    if (!item) {
      closeModal();
      return;
    }
    const mastered = Boolean(state.masteredPhonics[item.id]);
    modalRoot.innerHTML = modalShell(`
      <div class="sheet-top">
        <div><span class="eyebrow">${escapeHTML(item.type)} · ${escapeHTML(item.subtype)}</span><h2>声音练习</h2></div>
        <button class="close-button" data-action="close-modal" aria-label="关闭">×</button>
      </div>
      <div class="phonetic-detail">
        <div class="phonetic-symbol">/${escapeHTML(item.symbol)}/</div>
        ${renderMouthCoach(item)}
        <div class="phonetic-sample">${escapeHTML(item.word)} <span>${escapeHTML(item.zh)}</span></div>
        <p class="mouth-tip">${escapeHTML(item.tip)}</p>
        <div style="display:flex;justify-content:center;gap:8px">
          <button class="primary-button" data-action="speak" data-text="${escapeAttr(item.word)}">听例词</button>
          <button class="secondary-button" data-action="toggle-phonetic" data-id="${item.id}">${mastered ? "取消已掌握" : "我读准了"}</button>
        </div>
      </div>
    `);
  }

  function createSoundQuiz() {
    const pool = DATA.phonetics.filter((item) => state.phonicsType === "全部" || item.type === state.phonicsType);
    const answer = pool[Math.floor(Math.random() * pool.length)] || DATA.phonetics[0];
    const distractors = DATA.phonetics
      .filter((item) => item.id !== answer.id && item.type === answer.type)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);
    const choices = [answer, ...distractors].sort(() => Math.random() - 0.5);
    state.soundQuiz = {
      answerId: answer.id,
      choices: choices.map((item) => item.id),
      selectedId: null
    };
  }

  function startSoundQuiz() {
    createSoundQuiz();
    openModal("sound-quiz");
    window.setTimeout(() => speak(getPhonetic(state.soundQuiz.answerId).word, 0.76), 200);
  }

  function renderSoundQuizModal() {
    if (!state.soundQuiz) createSoundQuiz();
    const quiz = state.soundQuiz;
    const answer = getPhonetic(quiz.answerId);
    const selected = quiz.selectedId ? getPhonetic(quiz.selectedId) : null;
    const correct = quiz.selectedId === quiz.answerId;

    modalRoot.innerHTML = modalShell(`
      <div class="sheet-top">
        <div><span class="eyebrow">听音小挑战</span><h2>听到了哪一个？</h2></div>
        <button class="close-button" data-action="close-modal" aria-label="关闭">×</button>
      </div>
      <div class="sound-quiz-card" style="margin-top:0">
        <span class="quiz-icon">🔊</span>
        <span><strong>点击播放例词</strong><small>仔细听开头和中间的声音</small></span>
        <button class="round-tool" data-action="speak" data-text="${escapeAttr(answer.word)}" style="margin-left:auto;background:#fff">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h3l4 4V6L7 10z"/><path d="M16 10c1 1 1 3 0 4"/></svg>
        </button>
      </div>
      <div class="sound-grid" style="grid-template-columns:repeat(3,1fr);margin-top:16px">
        ${quiz.choices.map((id) => {
          const choice = getPhonetic(id);
          let style = "";
          if (quiz.selectedId) {
            if (id === quiz.answerId) style = "border-color:#38ad85;background:#e5f5ee";
            else if (id === quiz.selectedId) style = "border-color:#ff735c;background:#fff0ed";
          }
          return `<button class="sound-chip" style="${style}" data-action="answer-sound-quiz" data-id="${id}"><strong>/${escapeHTML(choice.symbol)}/</strong><small>${escapeHTML(choice.word)}</small></button>`;
        }).join("")}
      </div>
      ${selected ? `<div class="quiz-feedback" style="margin-top:14px">${correct ? `答对了！${answer.word} 中包含 /${escapeHTML(answer.symbol)}/。` : `这个单词是 ${answer.word}，正确答案是 /${escapeHTML(answer.symbol)}/。`}<br>${escapeHTML(answer.tip)}</div>` : ""}
      ${selected ? `<button class="primary-button" style="width:100%;margin-top:14px" data-action="next-sound-quiz">${correct ? "再来一题" : "听下一题"}</button>` : ""}
    `);
  }

  function renderInstallModal() {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
    modalRoot.innerHTML = modalShell(`
      <div class="sheet-top">
        <div><span class="eyebrow">装进口袋</span><h2>${isStandalone ? "已经安装好了" : "把英语岛放到桌面"}</h2></div>
        <button class="close-button" data-action="close-modal" aria-label="关闭">×</button>
      </div>
      ${isStandalone ? `
        <div class="empty-state" style="min-height:260px">
          <div><div class="empty-icon">✓</div><h2>正在以独立 App 打开</h2><p>你的学习记录和设备上的内容都可以离线使用。</p></div>
        </div>
      ` : `
        <div class="install-options">
          <div class="install-option"><span>🤖</span><div><strong>Android / Chrome / Edge</strong><p>打开浏览器菜单，选择“安装应用”或“添加到主屏幕”。本页由受信任的 HTTPS 静态站点提供时会直接出现安装按钮。</p></div></div>
          <div class="install-option"><span>🍎</span><div><strong>iPhone 15 及以上 · Safari</strong><p>点击底部“分享”按钮，选择“添加到主屏幕”，再点击“添加”。安装后会自动适配灵动岛、屏幕圆角和 Home 指示条。</p></div></div>
          <div class="install-option"><span>💻</span><div><strong>当前电脑预览</strong><p>双击“启动英语岛.bat”，在 Chrome 地址栏右侧点击安装图标，即可像普通应用一样启动。</p></div></div>
        </div>
        ${deferredInstallPrompt ? `<button class="primary-button" style="width:100%;margin-top:14px" data-action="native-install">立即安装</button>` : ""}
      `}
    `);
  }

  function renderResetModal() {
    modalRoot.innerHTML = modalShell(`
      <div class="sheet-top">
        <div><span class="eyebrow">清空记录</span><h2>要从头开始吗？</h2></div>
        <button class="close-button" data-action="close-modal" aria-label="关闭">×</button>
      </div>
      <p class="view-subtitle" style="margin:0 0 18px">这会删除单词复习进度、收藏、语法答题和连续学习记录。课程内容不会被删除。</p>
      <div class="detail-actions">
        <button class="secondary-button" data-action="close-modal">保留记录</button>
        <button class="primary-button" data-action="confirm-reset">确认清空</button>
      </div>
    `);
  }

  function openWord(wordId) {
    openModal("word", { wordId });
  }

  function toggleStar(wordId) {
    if (state.starred.includes(wordId)) {
      state.starred = state.starred.filter((id) => id !== wordId);
      showToast("已取消收藏");
    } else {
      state.starred.push(wordId);
      showToast("已收藏，可在词库中用星标找到");
      vibrate();
    }
    saveState();
    render();
    if (state.modal?.type === "word") renderModal();
  }

  function addWordToReview(wordId) {
    const word = getWord(wordId);
    const progress = getProgress(wordId) || {
      stage: 0,
      seen: 0,
      correct: 0,
      due: now(),
      lastRating: "new"
    };
    progress.due = now();
    state.wordProgress[wordId] = progress;
    saveState();
    showToast("已加入复习队列", word.word);
    vibrate();
    render();
    if (state.modal?.type === "word") renderModal();
  }

  function revealCurrentWord() {
    state.revealWord = true;
    state.wordQueueMode = state.wordMode;
    saveState();
    render();
  }

  function rateCurrentWord(rating) {
    const word = currentQueueWord();
    if (!word) return;
    const previous = getProgress(word.id);
    const stage = previous?.stage || 0;
    let nextStage = stage;
    let delay = DAY;
    let energy = 2;
    let message = "记下来了";

    if (rating === "again") {
      nextStage = 0;
      delay = 5 * MINUTE;
      energy = 1;
      message = "没关系，5 分钟后再见";
    } else if (rating === "fuzzy") {
      nextStage = Math.max(1, stage);
      delay = DAY;
      energy = 2;
      message = "模糊是记忆正在生长";
    } else {
      nextStage = Math.min(6, stage + 1);
      const intervals = [0.0035, 1, 3, 7, 14, 30, 60];
      delay = intervals[nextStage] * DAY;
      energy = nextStage >= 3 ? 5 : 3;
      message = nextStage >= 4 ? "进入长期记忆" : "记忆更牢了一点";
    }

    state.wordProgress[word.id] = {
      stage: nextStage,
      seen: (previous?.seen || 0) + 1,
      correct: (previous?.correct || 0) + (rating === "know" ? 1 : 0),
      due: now() + delay,
      lastRating: rating,
      lastSeen: now()
    };

    if (previous) state.dailyReviews += 1;
    else state.dailyWords += 1;
    if (!state.history[state.dailyDate]) state.history[state.dailyDate] = { words: 0, reviews: 0, energy: 0 };
    if (previous) state.history[state.dailyDate].reviews += 1;
    else state.history[state.dailyDate].words += 1;

    state.wordQueueIndex += 1;
    state.currentWordId = state.wordQueue[state.wordQueueIndex] || null;
    state.revealWord = false;
    markStudy(energy);
    showToast(message, `+${energy} 能量`);
    vibrate(rating === "know" ? 28 : 16);
    if (rating === "know") burstConfetti("top");
    saveState();
    render();
  }

  function changeWordMode(mode) {
    state.wordMode = mode;
    if (mode === "bank") {
      state.wordQueueMode = "bank";
      state.wordQueue = [];
      state.currentWordId = null;
    } else {
      ensureWordQueue(mode, true);
    }
    saveState();
    render();
  }

  function changeLevel(level) {
    if (!DATA.levels.includes(level)) return;
    state.level = level;
    state.wordQueueMode = "";
    state.wordQueue = [];
    state.currentWordId = null;
    if (state.view === "words" && state.wordMode !== "bank") ensureWordQueue(state.wordMode, true);
    saveState();
    render();
    showToast(`已切换到${level}词库`);
  }

  function togglePhonetic(id) {
    state.masteredPhonics[id] = !state.masteredPhonics[id];
    if (state.masteredPhonics[id]) {
      markStudy(2);
      burstConfetti();
      showToast("又读准一个声音", "+2 能量");
    }
    saveState();
    render();
    renderModal();
  }

  function completeGrammarIfReady(lessonId) {
    const lesson = getGrammar(lessonId);
    const answers = lesson.quiz.map((_, index) => state.grammarAnswers[`${lesson.id}:${index}`]);
    if (answers.some((answer) => answer === undefined)) return;
    if (state.grammarProgress[lesson.id]?.done) return;
    const score = lesson.quiz.reduce((sum, question, index) => sum + (answers[index] === question.answer ? 1 : 0), 0);
    state.grammarProgress[lesson.id] = { done: true, score, completedAt: now() };
    markStudy(5);
    burstConfetti();
    showToast("语法小火车到站", "+5 能量");
  }

  function answerGrammar(lessonId, questionIndex, optionIndex) {
    const key = `${lessonId}:${questionIndex}`;
    if (state.grammarAnswers[key] !== undefined) return;
    state.grammarAnswers[key] = optionIndex;
    saveState();
    completeGrammarIfReady(lessonId);
    render();
  }

  function goNextGrammar() {
    const lesson = getGrammar(state.grammarId);
    const answers = lesson.quiz.map((_, index) => state.grammarAnswers[`${lesson.id}:${index}`]);
    if (answers.some((answer) => answer === undefined)) {
      showToast("先完成两道小测，再前往下一站");
      return;
    }
    completeGrammarIfReady(lesson.id);
    const index = DATA.grammarLessons.findIndex((item) => item.id === lesson.id);
    state.grammarId = DATA.grammarLessons[(index + 1) % DATA.grammarLessons.length].id;
    saveState();
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function speakLesson() {
    const lesson = getGrammar(state.grammarId);
    lesson.examples.forEach((example, index) => {
      window.setTimeout(() => speak(example.en, 0.82), index * 2600);
    });
  }

  function openScene(id) {
    clearScenePlayback();
    state.sceneId = id;
    state.sceneHideZh = false;
    go("scene", { instant: true });
  }

  function answerScene(sceneId, optionIndex) {
    if (state.sceneAnswers[sceneId] !== undefined) return;
    const scene = getScene(sceneId);
    state.sceneAnswers[sceneId] = optionIndex;
    if (optionIndex === scene.challenge.answer) {
      if (!state.completedScenes.includes(sceneId)) {
        state.completedScenes.push(sceneId);
        markStudy(5);
        burstConfetti();
        showToast("场景点亮成功", "+5 能量");
        vibrate(30);
      }
    } else {
      showToast("再看一眼参考答案，然后读出来");
    }
    saveState();
    render();
  }

  function clearScenePlayback() {
    if (scenePlaybackTimer) {
      scenePlaybackTimer.forEach((timer) => window.clearTimeout(timer));
      scenePlaybackTimer = null;
    }
  }

  function playSceneDialogue() {
    clearScenePlayback();
    const scene = getScene(state.sceneId);
    scenePlaybackTimer = scene.lines.map((line, index) => {
      return window.setTimeout(() => speak(line.en, 0.78), index * 2800);
    });
    showToast("正在播放整段对话");
  }

  async function handleInstall() {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      updateHeader();
      return;
    }
    openModal("install");
  }

  async function nativeInstall() {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    closeModal();
    updateHeader();
  }

  function resetProgress() {
    localStorage.removeItem(STORAGE_KEY);
    state = {
      ...DEFAULT_STATE,
      onboarded: true,
      level: "小学",
      dailyGoal: 10,
      studyDates: [localDateKey()],
      history: {},
      wordProgress: {},
      dailyDate: localDateKey()
    };
    saveState();
    closeModal();
    showToast("学习记录已清空，可以重新开始");
    go("home", { instant: true });
  }

  function markOnboardingComplete() {
    state.onboarded = true;
    state.level = state.onboardLevel;
    state.dailyGoal = state.onboardGoal;
    state.studyDates = [localDateKey()];
    state.history[localDateKey()] = { words: 0, reviews: 0, energy: 0 };
    markStudy(0);
    state.wordQueueMode = "";
    state.wordQueue = [];
    state.currentWordId = null;
    state.modal = null;
    document.body.style.overflow = "";
    modalRoot.innerHTML = "";
    saveState();
    render();
    burstConfetti();
    showToast("登岛成功，今天先认识 5 分钟英语");
  }

  function bindViewInputs() {
    const bankSearch = $("#bankSearchInput");
    if (bankSearch) {
      bankSearch.addEventListener("input", () => {
        state.bankQuery = bankSearch.value;
        saveState();
        render();
        const nextSearch = $("#bankSearchInput");
        nextSearch?.focus();
        nextSearch?.setSelectionRange(nextSearch.value.length, nextSearch.value.length);
      });
    }

    const profileLevel = $("#profileLevel");
    if (profileLevel) {
      profileLevel.addEventListener("change", () => changeLevel(profileLevel.value));
    }

    const profileGoal = $("#profileGoal");
    if (profileGoal) {
      profileGoal.addEventListener("change", () => {
        state.dailyGoal = Number(profileGoal.value);
        state.wordQueueMode = "";
        state.wordQueue = [];
        saveState();
        render();
        showToast(`每日目标已改为 ${state.dailyGoal} 个新词`);
      });
    }
  }

  document.addEventListener("click", async (event) => {
    const goButton = event.target.closest("[data-go]");
    if (goButton) {
      event.preventDefault();
      clearScenePlayback();
      go(goButton.dataset.go);
      return;
    }

    if (event.target.matches("[data-modal-backdrop]") && state.onboarded) {
      closeModal();
      return;
    }

    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;
    const action = actionButton.dataset.action;

    if (action === "close-modal") {
      closeModal();
    } else if (action === "install-app") {
      handleInstall();
    } else if (action === "native-install") {
      nativeInstall();
    } else if (action === "onboard-level") {
      state.onboardLevel = actionButton.dataset.level;
      renderOnboarding();
    } else if (action === "onboard-goal") {
      state.onboardGoal = Number(actionButton.dataset.goal);
      renderOnboarding();
    } else if (action === "complete-onboarding") {
      markOnboardingComplete();
    } else if (action === "word-mode") {
      changeWordMode(actionButton.dataset.mode);
    } else if (action === "open-word-bank") {
      changeWordMode("bank");
    } else if (action === "set-level") {
      changeLevel(actionButton.dataset.level);
    } else if (action === "reveal-word") {
      revealCurrentWord();
    } else if (action === "rate-word") {
      rateCurrentWord(actionButton.dataset.rating);
    } else if (action === "star-word") {
      toggleStar(actionButton.dataset.wordId);
    } else if (action === "speak") {
      speak(actionButton.dataset.text, 0.82);
    } else if (action === "open-word") {
      openWord(actionButton.dataset.wordId);
    } else if (action === "add-word-review") {
      addWordToReview(actionButton.dataset.wordId);
    } else if (action === "bank-level") {
      state.bankLevel = actionButton.dataset.level;
      saveState();
      render();
    } else if (action === "bank-theme") {
      state.bankTheme = actionButton.dataset.theme;
      saveState();
      render();
    } else if (action === "phonics-filter") {
      state.phonicsType = actionButton.dataset.type;
      saveState();
      render();
    } else if (action === "open-phonetic") {
      openModal("phonetic", { phoneticId: actionButton.dataset.id });
      const item = getPhonetic(actionButton.dataset.id);
      if (item) window.setTimeout(() => speak(item.word, 0.78), 160);
    } else if (action === "toggle-phonetic") {
      togglePhonetic(actionButton.dataset.id);
    } else if (action === "start-sound-quiz") {
      startSoundQuiz();
    } else if (action === "answer-sound-quiz") {
      if (state.soundQuiz?.selectedId) return;
      const selectedId = actionButton.dataset.id;
      state.soundQuiz.selectedId = selectedId;
      if (selectedId === state.soundQuiz.answerId) {
        state.masteredPhonics[selectedId] = true;
        markStudy(2);
        burstConfetti();
        vibrate(24);
      }
      saveState();
      render();
      renderSoundQuizModal();
    } else if (action === "next-sound-quiz") {
      createSoundQuiz();
      saveState();
      renderSoundQuizModal();
      window.setTimeout(() => speak(getPhonetic(state.soundQuiz.answerId).word, 0.76), 120);
    } else if (action === "choose-grammar") {
      state.grammarId = actionButton.dataset.id;
      saveState();
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (action === "grammar-answer") {
      answerGrammar(actionButton.dataset.lessonId, Number(actionButton.dataset.question), Number(actionButton.dataset.option));
    } else if (action === "next-grammar") {
      goNextGrammar();
    } else if (action === "speak-lesson") {
      speakLesson();
    } else if (action === "open-scene") {
      openScene(actionButton.dataset.sceneId);
    } else if (action === "toggle-scene-zh") {
      state.sceneHideZh = !state.sceneHideZh;
      saveState();
      render();
    } else if (action === "play-scene") {
      playSceneDialogue();
    } else if (action === "scene-answer") {
      answerScene(actionButton.dataset.sceneId, Number(actionButton.dataset.option));
    } else if (action === "open-reset") {
      openModal("reset");
    } else if (action === "confirm-reset") {
      resetProgress();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.modal) closeModal();
  });

  let touchStart = null;
  screen.addEventListener("touchstart", (event) => {
    if (state.view !== "words" || state.wordMode === "bank") return;
    const touch = event.changedTouches[0];
    touchStart = { x: touch.clientX, y: touch.clientY };
  }, { passive: true });

  screen.addEventListener("touchend", (event) => {
    if (!touchStart || state.view !== "words" || state.wordMode === "bank") return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStart.x;
    const dy = touch.clientY - touchStart.y;
    touchStart = null;
    if (dy < -55 && Math.abs(dx) < 70 && !state.revealWord) {
      revealCurrentWord();
      vibrate(12);
    }
  }, { passive: true });

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    installButton.hidden = false;
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    installButton.hidden = true;
    showToast("MOMO 英语岛已安装到设备");
    if (state.modal?.type === "install") renderInstallModal();
  });

  window.handleAndroidBack = () => {
    if (state.modal) {
      closeModal();
      return true;
    }
    if (state.view === "scene") {
      clearScenePlayback();
      go("home", { instant: true });
      return true;
    }
    if (state.view !== "home") {
      go("home", { instant: true });
      return true;
    }
    return false;
  };

  const requestedView = new URLSearchParams(location.search).get("open");
  if (requestedView && VIEWS[requestedView]) {
    state.view = requestedView;
    if (requestedView === "words") ensureWordQueue(state.wordMode);
  }

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // The standalone app still works when service workers are unavailable.
    });
  }

  updateHeader();
  render();
})();
