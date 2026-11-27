// Tiny event bus shared by the Part B modules. See CONTRACT.md for the events.
window.Bus = (function () {
  const h = {};
  return {
    on(ev, fn) { (h[ev] = h[ev] || []).push(fn); return () => { h[ev] = h[ev].filter((f) => f !== fn); }; },
    emit(ev, data) { (h[ev] || []).slice().forEach((fn) => { try { fn(data); } catch (e) { console.error(ev, e); } }); },
  };
})();
window.toast = function (msg) {
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; t.setAttribute('role', 'status');
  document.getElementById('toastLayer').appendChild(t); setTimeout(() => t.remove(), 2500);
};
