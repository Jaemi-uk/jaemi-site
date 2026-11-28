/* Jaemi Space home page behaviour.
   Everything here is optional: the page reads and works without it. */

/* ---------- Settings you can change ----------
   hubspot.formId: leave empty until a real HubSpot form exists. While it is
   empty the sign-up stays marked "Not connected" and nothing is loaded.
   giveawayCloses: when the Christmas giveaway labels switch to "Closed". */
const JAEMI_SETTINGS = {
  hubspot: { portalId: "248125260", region: "na2", formId: "" },
  giveawayCloses: "2026-12-10T23:59:59Z",
  robotLines: [
    "Hi! I’m the Jaemi Space robot.",
    "재미 means fun. That’s my job description.",
    "Looking for a robot you can actually buy? Try the buying guide.",
    "Need a calmer frequency? Jamie’s Jazz Rooms has you.",
    "The shop and lessons are still on the workbench. I’ll shout when they’re ready.",
    "Beep boop. Sorry, I’ve always wanted to say that."
  ]
};

(() => {
  const root = document.documentElement;
  const body = document.body;
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const moving = () => !motionQuery.matches && !root.classList.contains("still");

  /* ---------- Pause motion ---------- */
  const toggle = document.getElementById("motion-toggle");
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

  /* ---------- Boot sequence (once per page load) ---------- */
  body.classList.add("booting");
  window.setTimeout(() => body.classList.remove("booting"), 2400);

  /* ---------- Eye colour follows the space you are in ---------- */
  const accents = { mint: "#6CF5D6", lilac: "#B9A4FF", amber: "#FFC86B" };
  const setEye = (name) => { if (accents[name]) root.style.setProperty("--eye", accents[name]); };
  const zones = document.querySelectorAll("[data-accent]");
  if ("IntersectionObserver" in window) {
    const seen = new Map();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => seen.set(e.target, e.isIntersecting ? e.intersectionRect.height : 0));
      let best = null, bestH = 0;
      seen.forEach((h, el) => { if (h > bestH) { bestH = h; best = el; } });
      if (best) setEye(best.dataset.accent);
    }, { rootMargin: "-35% 0px -35% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] });
    zones.forEach((z) => io.observe(z));
  }
  // On wide screens the three spaces sit side by side, so pointing at one also tints the eyes.
  document.querySelectorAll(".space").forEach((card) => {
    card.addEventListener("pointerenter", () => setEye(card.dataset.accent));
    card.addEventListener("focusin", () => setEye(card.dataset.accent));
  });

  /* ---------- Eyes follow the pointer or your tap ---------- */
  const bot = document.getElementById("bot");
  const heroEyes = document.querySelector(".bot .eyes");
  const miniEyes = document.querySelector(".mini-eyes");
  let idleTimer = 0, frame = 0, target = { x: 0, y: 0 };

  const render = () => {
    frame = 0;
    if (heroEyes) heroEyes.setAttribute("transform", `translate(${target.x * 9} ${target.y * 7})`);
    if (miniEyes) miniEyes.setAttribute("transform", `translate(${target.x * 1.6} ${target.y * 1.2})`);
  };
  const lookAt = (clientX, clientY) => {
    const ref = (bot && bot.getBoundingClientRect().bottom > 0) ? bot : document.querySelector(".mini-bot");
    if (!ref) return;
    const r = ref.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height * 0.38;
    const dx = clientX - cx, dy = clientY - cy;
    const d = Math.max(1, Math.hypot(dx, dy));
    const k = Math.min(1, d / 260);
    target = { x: (dx / d) * k, y: (dy / d) * k };
    if (!frame) frame = requestAnimationFrame(render);
  };
  const lookHome = () => { target = { x: 0, y: 0 }; if (!frame) frame = requestAnimationFrame(render); };

  window.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    lookAt(e.clientX, e.clientY);
    clearTimeout(idleTimer);
    idleTimer = setTimeout(lookHome, 4000);
  }, { passive: true });
  window.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse") return;
    lookAt(e.clientX, e.clientY);
    clearTimeout(idleTimer);
    idleTimer = setTimeout(lookHome, 1800);
  }, { passive: true });

  // On phones nobody hovers, so the robot glances around now and then.
  const glances = [[-0.8, -0.2], [0.7, 0.1], [0, 0.6], [0, 0]];
  let g = 0;
  setInterval(() => {
    if (!moving() || document.hidden || window.matchMedia("(pointer: fine)").matches) return;
    const [x, y] = glances[g++ % glances.length];
    target = { x, y };
    if (!frame) frame = requestAnimationFrame(render);
  }, 3200);

  // Blink every few seconds.
  const blink = () => {
    if (moving() && !document.hidden) {
      document.querySelectorAll(".eye").forEach((el) => {
        el.animate([{ transform: "scaleY(1)" }, { transform: "scaleY(.1)" }, { transform: "scaleY(1)" }],
          { duration: 180, easing: "ease-in-out" });
      });
    }
    setTimeout(blink, 3800 + Math.random() * 3200);
  };
  document.querySelectorAll(".eye").forEach((el) => { el.style.transformBox = "fill-box"; el.style.transformOrigin = "center"; });
  setTimeout(blink, 4200);

  /* ---------- Tap the robot: it waves and talks ---------- */
  const bubble = document.getElementById("bubble");
  let line = 0, happyTimer = 0;
  if (bot && bubble) {
    bot.addEventListener("click", () => {
      bubble.textContent = JAEMI_SETTINGS.robotLines[line++ % JAEMI_SETTINGS.robotLines.length];
      bot.classList.remove("wave-hi");
      void bot.offsetWidth; // restart the wave
      bot.classList.add("wave-hi", "happy");
      document.querySelector(".mini-bot")?.classList.add("happy");
      clearTimeout(happyTimer);
      happyTimer = setTimeout(() => {
        bot.classList.remove("wave-hi", "happy");
        document.querySelector(".mini-bot")?.classList.remove("happy");
      }, 1900);
      if (moving() && bubble.animate) {
        bubble.animate([{ transform: "translateY(6px) scale(.97)", opacity: .4 }, { transform: "none", opacity: 1 }],
          { duration: 260, easing: "cubic-bezier(.3,1.5,.5,1)" });
      }
    });
  }

  /* ---------- System check lights up once when you reach it ---------- */
  const diag = document.querySelector(".diag");
  if (diag && "IntersectionObserver" in window) {
    diag.querySelectorAll("li").forEach((li, i) => { li.style.animationDelay = `${i * 110}ms`; });
    const dio = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { diag.classList.add("lighting"); dio.disconnect(); }
    }, { threshold: 0.35 });
    dio.observe(diag);
  }

  /* ---------- Christmas giveaway closes automatically ---------- */
  if (Date.now() > Date.parse(JAEMI_SETTINGS.giveawayCloses)) {
    document.querySelectorAll("[data-giveaway-pill]").forEach((p) => {
      p.textContent = "Closed";
      p.className = "pill pill-off";
    });
    document.querySelectorAll("[data-giveaway] small").forEach((s) => { s.textContent = "Rules and winner details"; });
    const d = document.querySelector("[data-giveaway-diag]");
    if (d) { d.dataset.state = "off"; d.querySelector("b").textContent = "Closed"; }
  }

  /* ---------- HubSpot sign-up (only once a real form exists) ---------- */
  const hs = JAEMI_SETTINGS.hubspot;
  const slot = document.getElementById("hubspot-signup");
  if (slot && hs.formId) {
    const s = document.createElement("script");
    s.src = "https://js.hsforms.net/forms/embed/v2.js";
    s.async = true;
    s.onload = () => {
      if (!window.hbspt) return;
      slot.innerHTML = "";
      window.hbspt.forms.create({ region: hs.region, portalId: hs.portalId, formId: hs.formId, target: "#hubspot-signup" });
      const sw = document.querySelector('[data-state="off"]');
      if (sw && /HubSpot/.test(sw.textContent)) { sw.dataset.state = "on"; sw.querySelector("b").textContent = "On"; }
    };
    document.head.appendChild(s);
  }
})();
