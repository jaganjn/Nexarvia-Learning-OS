
/* Nexarvia Learning OS 4.0 — shared integration layer */
(function () {
  const KEY = "nexarvia-os-state-v40";
  const defaultState = {
    progress: 64,
    streak: 8,
    focus: "API Integration",
    nextAction: "Debug an API failure scenario",
    notifications: 3,
    completedToday: 2,
    application: 76,
    capability: 82,
    graphCoverage: 78,
    live: false
  };
  let state = {};
  try { state = Object.assign({}, defaultState, JSON.parse(localStorage.getItem(KEY) || "{}")); }
  catch (_) { state = Object.assign({}, defaultState); }

  function save() { localStorage.setItem(KEY, JSON.stringify(state)); }
  window.NexarviaOS = {
    getState: () => ({...state}),
    set: (patch) => { state = Object.assign(state, patch); save(); window.dispatchEvent(new CustomEvent("nexarvia:state")); },
    reset: () => { state = Object.assign({}, defaultState); save(); window.dispatchEvent(new CustomEvent("nexarvia:state")); }
  };

  function hydrate() {
    document.querySelectorAll("[data-os]").forEach(el => {
      const key = el.dataset.os;
      if (key in state) el.textContent = state[key];
    });
    document.querySelectorAll("[data-os-width]").forEach(el => {
      const key = el.dataset.osWidth;
      if (key in state) el.style.width = Math.max(0, Math.min(100, Number(state[key]))) + "%";
    });
  }

  function markActive() {
    const current = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".sidebar nav a").forEach(a => {
      const href = (a.getAttribute("href") || "").split("/").pop();
      if (href === current) a.classList.add("active");
    });
  }

  function wireActions() {
    document.querySelectorAll("[data-action='complete']").forEach(btn => {
      btn.addEventListener("click", () => {
        state.completedToday += 1;
        state.progress = Math.min(100, state.progress + 2);
        save(); hydrate();
        btn.textContent = "Completed ✓";
        btn.disabled = true;
      });
    });
    document.querySelectorAll("[data-action='focus']").forEach(btn => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.focus || "API Integration";
        state.focus = target;
        save(); hydrate();
      });
    });
    document.querySelectorAll("[data-action='live']").forEach(btn => {
      btn.addEventListener("click", () => {
        state.live = !state.live;
        save(); hydrate();
        btn.textContent = state.live ? "Join live class ✓" : "Open live class →";
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    markActive(); hydrate(); wireActions();
    window.addEventListener("nexarvia:state", hydrate);
  });
})();
