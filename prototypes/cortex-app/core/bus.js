// Shared event bus, app state and toast. See CONTRACT.md.
window.Bus = (function () {
  const h = {};
  return {
    on(ev, fn) { (h[ev] = h[ev] || []).push(fn); return () => { h[ev] = h[ev].filter((f) => f !== fn); }; },
    emit(ev, data) { (h[ev] || []).slice().forEach((fn) => { try { fn(data); } catch (e) { console.error(ev, e); } }); },
  };
})();

(function () {
  const P = new URLSearchParams(location.search);
  // One shared, mutable state object. Change it only through Store.set so everyone hears about it.
  const state = {
    style: P.get('style') || null,          // 'quick' | 'connect' | 'roadmap'
    topic: null, goal: P.get('goal') || null, span: P.get('span') || null, daily: null,
    plan: P.get('plan') || 'free',          // 'free' | 'plus'
    courses: [],                            // [{ id, title, progress: { [lessonId]: 'done' } }]
    activeCourse: null,
    explored: [],                           // ids of things explored (Ask + lessons): feeds the graph + archetype
    collectibles: [],                       // [{ id, title, shape, palette }]
    streak: 1,
    branchesUsed: {},                       // { [questionId]: n } for the free 3-branch limit
    paywallSeen: false,
    variants: { askHome: P.get('ask') || 'A', lesson: P.get('lesson') || '1' },
  };
  window.Store = {
    get: () => state,
    set(patch) { Object.assign(state, patch); Bus.emit('store:change', { patch, state }); },
    variant(key, value) { state.variants[key] = value; Bus.emit('variant:change', { key, value }); },
    isPlus: () => state.plan === 'plus',
  };
})();

window.toast = function (msg) {
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; t.setAttribute('role', 'status');
  document.getElementById('toastLayer').appendChild(t); setTimeout(() => t.remove(), 2500);
};
