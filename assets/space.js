/* Jaemi Space home page behaviour.
   Everything here is optional: the page still reads and works without it. */

/* =========================================================================
   SETTINGS: the only part you should need to change.
   -------------------------------------------------------------------------
   hubspot.formId   Paste the form ID from HubSpot (Marketing > Forms > your
                    form > Share > Embed code, the "formId" value). While it
                    is empty, no HubSpot code loads and the sign-up stays
                    "Coming soon".
   chat.endpoint    Address of the robot's AI brain (the Cloudflare Worker in
                    /workers/robot-chat). While it is empty the robot runs in
                    basic mode: it answers from the list below, on the
                    visitor's own device, and sends nothing anywhere.
   giveawayCloses   When the Christmas giveaway labels switch to "Closed".
   season           Dates for the seasonal look (Santa hat on Jambot, snow).
   liveFrom         When the Christmas live streams start.

   Timed content: in index.html, add data-show-until="2027-01-01T00:00:00Z"
   to anything that should disappear on a date, or data-show-from="..." (plus
   the hidden attribute) to anything that should appear on a date. That is how
   Christmas items step aside and the everyday items take their place.
   ========================================================================= */
const JAEMI_SETTINGS = {
  hubspot: { portalId: "248125260", region: "na2", formId: "" },
  chat: { endpoint: "" },
  giveawayCloses: "2026-12-10T23:59:59Z",
  season: { name: "christmas", from: "2026-11-15T00:00:00Z", until: "2027-01-01T00:00:00Z" },
  liveFrom: "2026-11-30T00:00:00Z",
  links: {
    robots: "/robots/",
    mino: "https://www.youtube.com/@MinoAINews",
    jazz: "https://www.youtube.com/@JamiesJazzRooms",
    film: "https://www.youtube.com/watch?v=zZaZsq8hqIM",
    giveaway: "/games/XmasTnC/",
    cat: "https://www.youtube.com/@ClockedOutCats"
  }
};

(() => {
  const root = document.documentElement;
  const body = document.body;
  const L = JAEMI_SETTINGS.links;
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const moving = () => !motionQuery.matches && !root.classList.contains("still");
  const giveawayOpen = Date.now() <= Date.parse(JAEMI_SETTINGS.giveawayCloses);
  const $ = (s) => document.querySelector(s);
  const now = Date.now();

  /* ---------- Timed content and the seasonal look ---------- */
  document.querySelectorAll("[data-show-from], [data-show-until]").forEach((el) => {
    const from = el.dataset.showFrom ? Date.parse(el.dataset.showFrom) : -Infinity;
    const until = el.dataset.showUntil ? Date.parse(el.dataset.showUntil) : Infinity;
    el.hidden = !(now >= from && now < until);
  });
  const season = JAEMI_SETTINGS.season;
  const inSeason = season && now >= Date.parse(season.from) && now < Date.parse(season.until);
  if (inSeason) root.classList.add(`season-${season.name}`);
  document.querySelectorAll(".js-only").forEach((el) => { el.hidden = false; });

  // Giveaway countdown and live-stream label
  const closes = Date.parse(JAEMI_SETTINGS.giveawayCloses);
  const daysLeft = Math.ceil((closes - now) / 86400000);
  const countdown = daysLeft > 1 ? `${daysLeft} days left` : daysLeft === 1 ? "Last day" : "Closed";
  document.querySelectorAll("[data-countdown]").forEach((el) => { el.textContent = countdown; });
  document.querySelectorAll("[data-countdown-pill]").forEach((el) => { el.textContent = daysLeft >= 1 ? `Ends in ${daysLeft} day${daysLeft === 1 ? "" : "s"}` : "Closed"; });
  if (now >= Date.parse(JAEMI_SETTINGS.liveFrom)) document.querySelectorAll("[data-live-pill]").forEach((el) => { el.textContent = "On YouTube now"; });

  /* ---------- Pause motion ---------- */
  const toggle = $("#motion-toggle");
  const syncToggle = () => {
    const still = root.classList.contains("still");
    toggle.setAttribute("aria-pressed", String(still));
    toggle.textContent = still ? "Play motion" : "Pause motion";
  };
  if (toggle) {
    syncToggle();
    toggle.addEventListener("click", () => {
      root.classList.toggle("still");
      try { localStorage.setItem("jaemi-still", root.classList.contains("still") ? "1" : "0"); } catch (e) {}
      syncToggle();
    });
  }

  /* ---------- Speech bubble that types like a robot ---------- */
  const bubble = $("#bubble");
  let typeTimer = 0;
  const say = (text) => {
    if (!bubble) return;
    clearInterval(typeTimer);
    bubble.innerHTML = "";
    const sr = document.createElement("span"); sr.className = "sr"; sr.textContent = text;
    const shown = document.createElement("span"); shown.setAttribute("aria-hidden", "true");
    bubble.append(sr, shown);
    if (!moving()) { shown.textContent = text; return; }
    let i = 0;
    typeTimer = setInterval(() => {
      shown.textContent = text.slice(0, ++i);
      if (i >= text.length) clearInterval(typeTimer);
    }, 26);
  };
  const hour = new Date().getHours();
  const hello = hour < 5 ? "Up late? Me too." : hour < 12 ? "Good morning!" : hour < 18 ? "Good afternoon!" : "Good evening!";

  /* ---------- Boot sequence (once per page load) ---------- */
  body.classList.add("booting");
  setTimeout(() => say(inSeason ? `${hello} I’m Jambot. Merry Christmas from Jaemi Space! 🎄` : `${hello} I’m Jambot. Welcome to Jaemi Space!`), moving() ? 1500 : 0);
  setTimeout(() => body.classList.remove("booting"), 2600);

  /* ---------- Eye colour follows the space you are in ---------- */
  const accents = { mint: "#6CF5D6", lilac: "#B9A4FF", amber: "#FFC86B" };
  const setEye = (name) => { if (accents[name]) root.style.setProperty("--eye", accents[name]); };
  if ("IntersectionObserver" in window) {
    const seen = new Map();
    const zoneWatch = new IntersectionObserver((entries) => {
      entries.forEach((e) => seen.set(e.target, e.isIntersecting ? e.intersectionRect.height : 0));
      let best = null, bestH = 0;
      seen.forEach((h, el) => { if (h > bestH) { bestH = h; best = el; } });
      if (best) setEye(best.dataset.accent);
    }, { rootMargin: "-35% 0px -35% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] });
    document.querySelectorAll("[data-accent]").forEach((z) => zoneWatch.observe(z));
  }
  document.querySelectorAll(".space").forEach((card) => {
    card.addEventListener("pointerenter", () => setEye(card.dataset.accent));
    card.addEventListener("focusin", () => setEye(card.dataset.accent));
  });

  /* ---------- Eyes follow the pointer or your tap ---------- */
  const heroBot = $("#bot");
  const dock = $("#dock");
  const eyeGroups = [
    [$(".bot .eyes"), 9, 7],
    [$(".mini-eyes"), 1.6, 1.2],
    [$(".dock-eyes"), 2.2, 1.6]
  ].filter(([el]) => el);
  let idleTimer = 0, frame = 0, target = { x: 0, y: 0 };
  const render = () => {
    frame = 0;
    eyeGroups.forEach(([el, kx, ky]) => el.setAttribute("transform", `translate(${(target.x * kx).toFixed(2)} ${(target.y * ky).toFixed(2)})`));
  };
  const aim = (x, y) => { target = { x, y }; if (!frame) frame = requestAnimationFrame(render); };
  const lookAt = (clientX, clientY) => {
    const ref = docked ? dock : heroBot;
    if (!ref) return;
    const r = ref.getBoundingClientRect();
    const dx = clientX - (r.left + r.width / 2), dy = clientY - (r.top + r.height * 0.38);
    const d = Math.max(1, Math.hypot(dx, dy)), k = Math.min(1, d / 260);
    aim((dx / d) * k, (dy / d) * k);
  };
  window.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    lookAt(e.clientX, e.clientY);
    clearTimeout(idleTimer); idleTimer = setTimeout(() => aim(0, 0), 4000);
  }, { passive: true });
  window.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse") return;
    lookAt(e.clientX, e.clientY);
    clearTimeout(idleTimer); idleTimer = setTimeout(() => aim(0, 0), 1800);
  }, { passive: true });
  // Phones have no hover, so the robot glances around now and then.
  const glances = [[-0.8, -0.2], [0.7, 0.1], [0, 0.6], [0, 0]];
  let g = 0;
  setInterval(() => {
    if (!moving() || document.hidden || matchMedia("(pointer: fine)").matches) return;
    const [x, y] = glances[g++ % glances.length]; aim(x, y);
  }, 3200);
  // Blink every few seconds.
  const eyes = document.querySelectorAll(".eye");
  eyes.forEach((el) => { el.style.transformBox = "fill-box"; el.style.transformOrigin = "center"; });
  const blink = () => {
    if (moving() && !document.hidden && eyes[0].animate) {
      eyes.forEach((el) => el.animate([{ transform: "scaleY(1)" }, { transform: "scaleY(.1)" }, { transform: "scaleY(1)" }], { duration: 180 }));
    }
    setTimeout(blink, 3800 + Math.random() * 3200);
  };
  setTimeout(blink, 4200);

  const beHappy = (ms = 1900) => {
    const parts = [heroBot, $(".mini-bot"), dock].filter(Boolean);
    parts.forEach((p) => p.classList.add("happy"));
    setTimeout(() => parts.forEach((p) => p.classList.remove("happy", "wave-hi")), ms);
  };

  /* ---------- Lift-off: the robot flies to the corner, then back home ---------- */
  let docked = false, chatOpen = false;
  const flyTo = (from, to, el, onDone) => {
    const dx = from.left + from.width / 2 - (to.left + to.width / 2);
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);
    const s = Math.min(3.2, Math.max(0.6, from.width / to.width * 0.55));
    return { dx, dy, s };
  };
  const dockOut = () => {
    docked = true;
    if (chatOpen || !dock) return;
    dock.hidden = false;
    if (!moving() || !dock.animate || !heroBot) return;
    const h = heroBot.getBoundingClientRect(), d = dock.getBoundingClientRect();
    const { dx, dy, s } = flyTo(h, d);
    dock.classList.add("flying");
    const a = dock.animate([
      { transform: `translate(${dx}px, ${dy}px) scale(${s})`, opacity: 0 },
      { transform: `translate(${dx * 0.45}px, ${dy * 0.55 - 70}px) scale(${(s + 1) / 2}) rotate(-10deg)`, opacity: 1, offset: 0.45 },
      { transform: "translate(0, -14px) rotate(4deg)", offset: 0.85 },
      { transform: "none" }
    ], { duration: 1000, easing: "cubic-bezier(.45,0,.2,1)" });
    a.onfinish = () => dock.classList.remove("flying");
  };
  const dockHome = () => {
    docked = false;
    if (!dock || dock.hidden) return;
    if (!moving() || !dock.animate || !heroBot) { dock.hidden = true; return; }
    const h = heroBot.getBoundingClientRect(), d = dock.getBoundingClientRect();
    const { dx, dy, s } = flyTo(h, d);
    dock.classList.add("flying");
    const a = dock.animate([
      { transform: "none", opacity: 1 },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 50}px) scale(${(s + 1) / 2}) rotate(8deg)`, opacity: 1, offset: 0.5 },
      { transform: `translate(${dx}px, ${dy}px) scale(${s})`, opacity: 0 }
    ], { duration: 800, easing: "cubic-bezier(.45,0,.2,1)" });
    a.onfinish = () => {
      dock.classList.remove("flying");
      if (!docked) dock.hidden = true;
      heroBot.animate([{ transform: "translateY(-16px)" }, { transform: "translateY(3px)" }, { transform: "none" }], { duration: 450, easing: "ease-out" });
    };
  };
  if (heroBot && dock && "IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => {
      if (!e.isIntersecting && !docked) dockOut();
      else if (e.isIntersecting && docked) dockHome();
    }, { threshold: 0.15 }).observe(heroBot);
  }

  /* ---------- Chat with the robot ---------- */
  const chat = $("#chat"), log = $("#chat-log"), form = $("#chat-form"), input = $("#chat-input");
  const history = [];
  let opener = null, greeted = false;

  const addMsg = (who, text, links = []) => {
    const m = document.createElement("div");
    m.className = `msg msg-${who}`;
    const p = document.createElement("p"); p.textContent = text; m.append(p);
    if (links.length) {
      const row = document.createElement("div"); row.className = "msg-links";
      links.forEach(([label, href]) => {
        const a = document.createElement("a"); a.textContent = label; a.href = href;
        if (/^https?:/.test(href)) { a.target = "_blank"; a.rel = "noopener"; }
        else a.addEventListener("click", () => { if (href.startsWith("#")) closeChat(); });
        row.append(a);
      });
      m.append(row);
    }
    log.append(m);
    log.scrollTop = log.scrollHeight;
    history.push({ role: who === "you" ? "user" : "assistant", content: text });
  };
  const typing = () => {
    const t = document.createElement("div"); t.className = "msg msg-bot typing"; t.setAttribute("aria-label", "The robot is typing");
    t.innerHTML = "<i></i><i></i><i></i>"; log.append(t); log.scrollTop = log.scrollHeight; return t;
  };

  // Basic mode: a short list of answers, checked in order.
  const soonList = "🛠️ Coming soon: Jaemi Shop, everyday AI lessons, Mino Boxing, sign-ups for updates, Instagram and TikTok, and my full AI brain.";
  const brain = [
    [/shop|store|order|deliver|phone part|parts|checkout|商店|網店|訂購/i, () => ["Jaemi Shop is coming soon: robots, mobile phone parts and imported finds. Nothing is for sale yet. Until then, the robot buying guide shows robots you can buy elsewhere.", [["Robot buying guide", L.robots]]]],
    [/robot|humanoid|unitree|buy|price|cost|機械人|機器人|買/i, () => ["🤖 The robot buying guide lists robots you can actually buy, with real prices and where each one ships.", [["Open the guide", L.robots], ["Mino AI News", L.mino]]]],
    [/jazz|music|relax|chill|bossa|cafe|café|study music|爵士|音樂/i, () => ["🎷 Jamie’s Jazz Rooms has jazz, bossa nova and café moods for slowing down.", [["Jamie’s Jazz Rooms", L.jazz], ["Christmas film", L.film]]]],
    [/\bcat\b|cats|clocked|milo|貓/i, () => ["🐱 Clocked Out Cats is our cat channel: human problems, cat attitude. Short animated comedy starring Milo the cat.", [["Clocked Out Cats", L.cat]]]],
    [/giveaway|christmas|xmas|prize|win|live|stream|聖誕|抽獎|直播/i, () => [giveawayOpen ? "🎄 It’s Christmas at Jaemi Space! Watch our Christmas film, and comment your favourite song in it (and who you’d play it for) to enter the giveaway. It closes on 10 December 2026. Christmas live streams are on Jamie’s Jazz Rooms too. 🎁" : "🎄 Our Christmas film is still playing, and Christmas live streams are on Jamie’s Jazz Rooms. The giveaway has closed; the rules page has the details.", [["Christmas film", L.film], ["Giveaway rules", L.giveaway], ["Live streams", `${L.jazz}/streams`]]]],
    [/\bai\b|news|tech|mino|gadget|人工智能|新聞/i, () => ["🛰️ Mino AI News covers AI discoveries and robots worth knowing about.", [["Mino AI News", L.mino]]]],
    [/learn|course|lesson|class|teach|study|school|課程|學/i, () => ["Everyday AI lessons are coming soon, for individuals and groups. No courses are open yet.", [["See the plans", "#bench-learn"]]]],
    [/sign ?up|newsletter|email|updates|notify|waiting list|waitlist|subscribe|訂閱|登記/i, () => ["Sign-ups are coming soon. No form is switched on yet, so please don’t share your email or other details here. You can subscribe to our YouTube channels today.", [["Mino AI News", `${L.mino}?sub_confirmation=1`], ["Jamie’s Jazz Rooms", `${L.jazz}?sub_confirmation=1`]]]],
    [/coming|soon|next|new|plan|roadmap|即將|將來/i, () => [soonList, [["See the workbench", "#workbench"]]]],
    [/jaemi|재미|mean|name|意思/i, () => ["재미 (jaemi) means fun in Korean. That’s the whole idea: fun living, fun learning, fun every day.", []]],
    [/who are you|what are you|are you (a )?(real|human|person|ai|bot)|你是誰|你係邊個/i, () => ["I’m Jambot, the friendly robot host of Jaemi Space. I’m not a person, and right now I’m in basic mode: I answer from a short list. My full AI brain is coming soon.", []]],
    [/contact|human|person|help|support|聯絡|幫/i, () => ["A contact option is coming soon. For now, the best way to reach us is a comment on our YouTube videos.", [["Mino AI News", L.mino], ["Jamie’s Jazz Rooms", L.jazz]]]],
    [/thank|cheers|\bta\b|謝|多謝|唔該/i, () => ["Any time. Beep boop. 💚", []]],
    [/^(hi|hello|hey|yo|hiya|morning|你好|哈囉|hi there)\b/i, () => ["Hi! I can show you robots you can buy, jazz to relax to, AI news, cat comedy and what’s coming soon. What are you curious about?", []]]
  ];
  const basicReply = (text) => {
    for (const [re, fn] of brain) if (re.test(text)) return fn();
    return ["My full AI brain is coming soon, so I only know a few things right now. Try asking about robots, jazz, AI news, our cat channel or what’s coming soon.", []];
  };

  const ep = JAEMI_SETTINGS.chat.endpoint;
  if (ep) {
    $("#chat-mode").textContent = "AI mode: replies are written by AI and can be wrong.";
    $("#chat-privacy").textContent = "Messages are sent to our AI service to write a reply. Please don’t share personal details.";
    const d = $("[data-chat-diag]"); if (d) d.querySelector("b").textContent = "AI";
  }

  const ask = async (text) => {
    text = text.trim().slice(0, 300);
    if (!text) return;
    addMsg("you", text);
    const t = typing();
    let reply = null, links = [];
    if (ep) {
      try {
        const r = await fetch(ep, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: history.slice(-10) }) });
        if (r.ok) { const j = await r.json(); if (typeof j.reply === "string" && j.reply.trim()) reply = j.reply.trim(); }
      } catch (e) {}
    }
    if (!reply) [reply, links] = basicReply(text);
    setTimeout(() => { t.remove(); addMsg("bot", reply, links); beHappy(900); }, moving() ? 550 : 0);
  };

  const openChat = (from) => {
    if (!chat) return;
    opener = from || document.activeElement;
    chatOpen = true;
    chat.hidden = false;
    if (dock) dock.hidden = true;
    if (!greeted) {
      greeted = true;
      addMsg("bot", `${hello} I’m Jambot 🤖 I can show you robots you can buy, jazz to relax to, AI news, cat comedy${inSeason ? ", our Christmas film and giveaway 🎄" : ""} and what’s coming soon. What are you curious about?`);
    }
    if (moving() && chat.animate) chat.animate([{ transform: "translateY(24px)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 260, easing: "cubic-bezier(.3,1.3,.5,1)" });
    if (matchMedia("(pointer: fine)").matches) input.focus(); else $("#chat-close").focus();
  };
  const closeChat = () => {
    if (!chat || chat.hidden) return;
    chat.hidden = true;
    chatOpen = false;
    if (docked && dock) dock.hidden = false;
    if (opener && opener.focus && !opener.hidden) opener.focus();
  };

  if (heroBot) heroBot.addEventListener("click", () => {
    heroBot.classList.remove("wave-hi"); void heroBot.offsetWidth; heroBot.classList.add("wave-hi");
    beHappy();
    say("Hi, I’m Jambot! Ask me anything. 💬");
    setTimeout(() => openChat(heroBot), moving() ? 450 : 0);
  });
  document.querySelectorAll("[data-open-chat]").forEach((b) => b.addEventListener("click", () => openChat(b)));
  if (dock) dock.addEventListener("click", () => openChat(dock));
  $("#menu-chat")?.addEventListener("click", () => { setMenu(false); openChat($("#menu-btn")); });
  $("#chat-close")?.addEventListener("click", closeChat);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeChat(); });
  form?.addEventListener("submit", (e) => { e.preventDefault(); const v = input.value; input.value = ""; ask(v); });
  document.querySelectorAll("#chat-chips [data-ask]").forEach((b) => b.addEventListener("click", () => ask(b.dataset.ask)));


  /* ---------- Menu (phones and tablets) ---------- */
  const menuBtn = $("#menu-btn"), menu = $("#menu");
  const setMenu = (open) => {
    if (!menu || !menuBtn) return;
    menu.hidden = !open;
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.querySelector(".menu-word").textContent = open ? "Close" : "Menu";
    root.classList.toggle("menu-open", open);
    if (open) {
      if (moving() && menu.animate) menu.animate([{ opacity: 0, transform: "translateY(-10px)" }, { opacity: 1, transform: "none" }], { duration: 220, easing: "ease-out" });
      menu.querySelector("a")?.focus({ preventScroll: true });
    }
  };
  menuBtn?.addEventListener("click", () => setMenu(menu.hidden));
  menu?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && menu && !menu.hidden) { setMenu(false); menuBtn.focus(); } });
  matchMedia("(min-width: 900px)").addEventListener?.("change", (e) => { if (e.matches) setMenu(false); });

  /* ---------- System check lights up once when you reach it ---------- */
  const diag = $(".diag");
  if (diag && "IntersectionObserver" in window) {
    diag.querySelectorAll("li").forEach((li, i) => { li.style.animationDelay = `${i * 110}ms`; });
    const diagWatch = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { diag.classList.add("lighting"); diagWatch.disconnect(); }
    }, { threshold: 0.35 });
    diagWatch.observe(diag);
  }

  /* ---------- Christmas giveaway closes automatically ---------- */
  if (!giveawayOpen) {
    document.querySelectorAll("[data-giveaway-pill]").forEach((p) => { p.textContent = "Closed"; p.className = "pill pill-off"; });
    document.querySelectorAll("[data-giveaway] small").forEach((s) => { s.textContent = "Rules and winner details"; });
    const d = $("[data-giveaway-diag]");
    if (d) { d.dataset.state = "off"; d.querySelector("b").textContent = "Closed"; }
  }

  /* ---------- HubSpot sign-up (only once a real form exists) ---------- */
  const hs = JAEMI_SETTINGS.hubspot;
  const slot = $("#hubspot-signup");
  if (slot && hs.formId) {
    const s = document.createElement("script");
    s.src = "https://js.hsforms.net/forms/embed/v2.js";
    s.async = true;
    s.onload = () => {
      if (!window.hbspt) return;
      slot.innerHTML = "";
      window.hbspt.forms.create({ region: hs.region, portalId: hs.portalId, formId: hs.formId, target: "#hubspot-signup" });
      const d = $("[data-signup-diag]");
      if (d) { d.dataset.state = "on"; d.querySelector("b").textContent = "On"; }
    };
    document.head.appendChild(s);
  }
})();
