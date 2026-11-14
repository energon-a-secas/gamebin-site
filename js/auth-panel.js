// ── Sign-in panel ────────────────────────────────────────────
// The panel collapses with max-height, so its fields would stay in the tab
// order while it is closed. It is inert until opened.

const panel = () => document.getElementById('authPanel');

export function setAuthPanelOpen(open, { focus = false } = {}) {
  const el = panel();
  if (!el) return;
  el.classList.toggle('open', open);
  el.inert = !open;
  document.getElementById('authToggle')?.setAttribute('aria-expanded', String(open));
  if (open && focus) el.querySelector('.auth-form:not([hidden]) input')?.focus();
}

export function toggleAuthPanel() {
  setAuthPanelOpen(!panel()?.classList.contains('open'));
}
