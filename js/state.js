// ── State management ─────────────────────────────────────────

const STORAGE_KEY = 'gamebin-state';

export const state = {
  user: null,
  profile: null,
  currentView: 'mylists', // mylists | categories | profile | discover | shared
  activeListId: null,
  lists: [],
  games: [],
  categories: [],
  viewMode: 'grid',
  searchQuery: '',
  filterCategory: '',
  loading: false,
  sharedList: null,
  _likedList: false,
  _prices: null,
  _sharedProfile: null,
  _votes: {},
  _allowedVoters: [],
  _publicLists: [],
};

export function loadSaved(s) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved.viewMode) s.viewMode = saved.viewMode;
      if (saved.activeListId) s.activeListId = saved.activeListId;
      if (saved.searchQuery) s.searchQuery = saved.searchQuery;
      if (saved.filterCategory) s.filterCategory = saved.filterCategory;
      if (saved.currentView) s.currentView = saved.currentView;
    }

    const session = localStorage.getItem('gamebin_session');
    if (session) {
      const data = JSON.parse(session);
      const stored = localStorage.getItem('gamebin_user_' + data.username);
      if (stored) {
        const user = JSON.parse(stored);
        s.user = { username: user.username, id: 'local_' + data.username };
        document.getElementById('authUsername').textContent = data.username;
        document.getElementById('authUser').hidden = false;
        document.getElementById('authGate').hidden = true;
      }
    }
  } catch { /* ignore */ }
}

export function save(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      viewMode: s.viewMode,
      activeListId: s.activeListId,
      searchQuery: s.searchQuery,
      filterCategory: s.filterCategory,
      currentView: s.currentView,
    }));
  } catch { /* quota */ }
}
