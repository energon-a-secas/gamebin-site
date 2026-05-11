// ── DOM rendering ────────────────────────────────────────────

import { state } from './state.js';
import { escHtml, LIST_COLORS, DEFAULT_CATEGORIES, timeAgo } from './utils.js';
import { renderAvatarSvg, getBannerGradient } from './profile.js';
import { formatCLP } from './prices.js';

function getGameScore(gameId) {
  const gameVotes = state._votes[gameId];
  if (!gameVotes) return 0;
  return Object.values(gameVotes).reduce((sum, v) => sum + v, 0);
}

function renderEmptyGames() {
  return `
    <div class="empty-state">
      <div class="empty-state-icon">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round">
          <rect x="2" y="6" width="20" height="12" rx="2"/>
          <circle cx="8" cy="12" r="2"/><circle cx="16" cy="12" r="2"/>
          <path d="M9 9h6"/>
        </svg>
      </div>
      <div class="empty-state-title">No games yet</div>
      <div class="empty-state-text">Add games by name or paste a Steam URL to auto-fill details</div>
      <button class="btn btn-primary" id="btnAddGame">Add Game</button>
    </div>`;
}

function renderEmptyLists() {
  return `
    <div class="empty-state">
      <div class="empty-state-icon">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round">
          <path d="M4 4h16v16H4z" rx="2"/><path d="M4 10h16M10 4v16"/>
        </svg>
      </div>
      <div class="empty-state-title">Your collection starts here</div>
      <div class="empty-state-text">Create a list to organize your games by genre, platform, or mood</div>
      <button class="btn btn-primary" id="btnNewList">Create First List</button>
    </div>`;
}

function renderListSidebar(lists, activeId) {
  return `
    <div class="lists-sidebar">
      <button class="btn btn-primary btn-new-list" id="btnNewList">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
        New List
      </button>
      ${lists.map(l => `
        <div class="list-item ${l._id === activeId ? 'active' : ''}" data-list-id="${escHtml(l._id)}">
          <div class="list-item-color" style="background:${escHtml(l.coverColor)}"></div>
          <div class="list-item-name">${escHtml(l.name)}</div>
          <div class="list-item-count">${l._gameCount || 0}</div>
        </div>
      `).join('')}
    </div>`;
}

function renderGameCard(g) {
  const catBadges = (g.categories && g.categories.length > 0)
    ? `<div class="game-card-categories">${g.categories.slice(0, 3).map(c => {
        const cat = state.categories.find(d => d.name === c);
        const def = DEFAULT_CATEGORIES.find(d => d.name === c);
        const color = (cat && cat.color) || (def && def.color) || '#666';
        return `<span class="category-badge" style="background:${color}20;color:${color};border:1px solid ${color}33">${escHtml(c)}</span>`;
      }).join('')}</div>`
    : '';

  const steamBadge = g.steamAppId
    ? `<div class="steam-badge" title="From Steam">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><circle cx="12" cy="12" r="3"/></svg>
       </div>`
    : '';

  let priceTag = '';
  let saleBadge = '';
  if (g.steamAppId && state._prices) {
    const p = state._prices[g.steamAppId];
    if (p) {
      if (p.free) {
        priceTag = `<div class="game-card-price free">Free</div>`;
      } else if (p.formatted) {
        priceTag = `<div class="game-card-price${p.discount ? ' discount' : ''}">${escHtml(p.formatted)}${p.discount ? `<span class="price-discount">-${p.discount}%</span>` : ''}</div>`;
      }
      if (p.discount) {
        saleBadge = `<div class="sale-badge">-${p.discount}%</div>`;
      }
    }
  }

  const storeLink = g.steamAppId
    ? `<a class="game-card-store" href="https://store.steampowered.com/app/${escHtml(g.steamAppId)}/" target="_blank" rel="noopener" title="View on Steam">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
        Steam
       </a>`
    : '';

  const score = getGameScore(g._id);
  const voteIndicator = (state.currentView === 'shared' && score !== 0)
    ? `<div class="game-card-votes ${score > 0 ? 'positive' : 'negative'}">${score > 0 ? '+' : ''}${score}</div>`
    : '';

  return `
    <div class="game-card" data-game-id="${escHtml(g._id)}">
      ${steamBadge}
      ${saleBadge}
      ${g.coverUrl
        ? `<img class="game-card-cover" src="${escHtml(g.coverUrl)}" alt="${escHtml(g.name)}" loading="lazy" onerror="if(this.dataset.tried){this.style.display='none';this.nextElementSibling.style.display='flex';}else if(this.dataset.steamid){this.dataset.tried='1';this.src='https://cdn.akamai.steamstatic.com/steam/apps/'+this.dataset.steamid+'/library_hero.jpg';}else{this.style.display='none';this.nextElementSibling.style.display='flex';}" ${g.steamAppId ? `data-steamid="${escHtml(g.steamAppId)}"` : ''}>
           <div class="game-card-cover-placeholder" style="display:none;">
             <span class="placeholder-initial">${escHtml(g.name.charAt(0).toUpperCase())}</span>
           </div>`
        : g.steamAppId
          ? `<img class="game-card-cover" src="https://cdn.akamai.steamstatic.com/steam/apps/${escHtml(g.steamAppId)}/library_hero.jpg" alt="${escHtml(g.name)}" loading="lazy" data-steamid="${escHtml(g.steamAppId)}" data-tried="1" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
             <div class="game-card-cover-placeholder" style="display:none;">
               <span class="placeholder-initial">${escHtml(g.name.charAt(0).toUpperCase())}</span>
             </div>`
          : `<div class="game-card-cover-placeholder">
               <span class="placeholder-initial">${escHtml(g.name.charAt(0).toUpperCase())}</span>
             </div>`
      }
      <div class="game-card-info">
        <div class="game-card-name">${escHtml(g.name)}</div>
        ${voteIndicator}
        ${priceTag}
        ${storeLink}
        ${g.notes ? `<div class="game-card-notes">${escHtml(g.notes)}</div>` : ''}
        ${catBadges}
      </div>
    </div>`;
}

function renderGamesGrid(games) {
  if (games.length === 0) return renderEmptyGames();

  return `
    <div class="games-grid ${state.viewMode === 'list' ? 'list-view' : ''}">
      ${games.map(g => renderGameCard(g)).join('')}
    </div>`;
}

function renderToolbar(hasGames) {
  return `
    <div class="toolbar">
      <div class="search-wrap">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input type="text" id="searchInput" placeholder="Search games..." value="${escHtml(state.searchQuery)}">
      </div>
      ${state.filterCategory
        ? `<button class="btn btn-sm btn-filter-active" id="btnClearFilter">
            ${escHtml(state.filterCategory)}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
           </button>`
        : ''
      }
      <div class="view-toggle">
        <button class="${state.viewMode === 'grid' ? 'active' : ''}" data-mode="grid" aria-label="Grid view">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
        </button>
        <button class="${state.viewMode === 'list' ? 'active' : ''}" data-mode="list" aria-label="List view">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="4" width="18" height="3" rx="1"/><rect x="3" y="10.5" width="18" height="3" rx="1"/><rect x="3" y="17" width="18" height="3" rx="1"/></svg>
        </button>
      </div>
      ${hasGames ? `<button class="btn btn-primary btn-sm" id="btnAddGame">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
        Add
      </button>` : ''}
    </div>`;
}

function renderMyLists() {
  const { lists, games, activeListId, categories } = state;
  const active = lists.find(l => l._id === activeListId);

  lists.forEach(l => {
    l._gameCount = games.filter(g => g.listId === l._id).length;
  });

  if (!state.user) {
    return renderCarousel(state._publicLists) + renderEmptyLists();
  }

  if (lists.length === 0) {
    return renderEmptyLists();
  }

  if (!active) {
    if (lists.length > 0) {
      state.activeListId = lists[0]._id;
      return renderMyLists();
    }
    return renderEmptyLists();
  }

  let listGames = games.filter(g => g.listId === activeListId);

  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    listGames = listGames.filter(g =>
      g.name.toLowerCase().includes(q) ||
      (g.notes && g.notes.toLowerCase().includes(q))
    );
  }

  if (state.filterCategory) {
    listGames = listGames.filter(g => g.categories && g.categories.includes(state.filterCategory));
  }

  const totalInList = games.filter(g => g.listId === activeListId).length;

  return `
    ${renderToolbar(totalInList > 0)}
    <div class="lists-panel">
      ${renderListSidebar(lists, activeListId)}
      <div class="games-content">
        <div class="list-header">
          <div class="list-header-left">
            <div class="list-color-dot" style="background:${escHtml(active.coverColor)}"></div>
            <h2 class="list-title">${escHtml(active.name)}</h2>
            <span class="list-count">${totalInList} game${totalInList !== 1 ? 's' : ''}</span>
          </div>
          <div class="list-actions">
            <button class="btn btn-sm btn-ghost" id="btnEditList">Edit</button>
            <button class="btn btn-sm btn-ghost" id="btnShareList">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
              Share
            </button>
            <button class="btn btn-sm btn-ghost btn-danger-text" id="btnDeleteList">Delete</button>
          </div>
        </div>
        ${categories.length > 0
          ? `<div class="category-filter-row">
              ${categories.map(c => `
                <button class="category-chip ${state.filterCategory === c.name ? 'selected' : ''}" data-filter-cat="${escHtml(c.name)}">
                  <span class="category-chip-dot" style="background:${escHtml(c.color)}"></span>
                  ${escHtml(c.name)}
                </button>
              `).join('')}
            </div>`
          : ''
        }
        ${renderGamesGrid(listGames)}
      </div>
    </div>`;
}

function renderCategories() {
  const { categories } = state;
  return `
    <div class="categories-view">
      <h2 class="section-title">Categories</h2>
      <p class="section-desc">Create reusable tags to organize games across all your lists.</p>
      <div class="category-add-row">
        <input type="text" id="newCategoryName" placeholder="Category name" maxlength="30">
        <input type="color" id="newCategoryColor" value="#6366f1" class="color-input">
        <button class="btn btn-primary" id="btnAddCategory">Add</button>
      </div>
      <div class="category-list">
        ${categories.length === 0
          ? '<div class="empty-state-text" style="padding:20px 0;">No categories yet</div>'
          : categories.map(c => `
            <div class="category-row">
              <div class="category-row-dot" style="background:${escHtml(c.color)}"></div>
              <span class="category-row-name">${escHtml(c.name)}</span>
              <button class="btn btn-sm btn-ghost btn-danger-text" data-delete-cat="${escHtml(c._id)}">Remove</button>
            </div>
          `).join('')
        }
      </div>
      <div class="category-defaults">
        <div class="category-defaults-label">Quick add presets</div>
        <div class="category-defaults-chips">
          ${DEFAULT_CATEGORIES.map(d => {
            const exists = categories.find(c => c.name === d.name);
            return `
              <button class="category-chip ${exists ? 'disabled' : ''}" data-quick-cat="${escHtml(d.name)}" ${exists ? 'disabled' : ''}>
                <span class="category-chip-dot" style="background:${d.color}"></span>
                ${escHtml(d.name)}
              </button>`;
          }).join('')}
        </div>
      </div>
    </div>`;
}

function renderProfile() {
  if (!state.user || !state.profile) {
    return `<div class="empty-state"><div class="empty-state-text">Log in to view your profile</div></div>`;
  }

  const p = state.profile;
  const banner = getBannerGradient(p.banner);
  const totalGames = state.games.length;
  const totalLists = state.lists.length;

  return `
    <div class="profile-view">
      <div class="profile-banner" style="background:${banner}">
        <div class="profile-avatar-wrap">
          ${renderAvatarSvg(p.avatar, 64)}
        </div>
      </div>
      <div class="profile-info">
        <h2 class="profile-name">${escHtml(p.username)}</h2>
        ${p.bio ? `<p class="profile-bio">${escHtml(p.bio)}</p>` : '<p class="profile-bio profile-bio-empty">No bio yet</p>'}
        <div class="profile-stats">
          <div class="profile-stat"><strong>${totalLists}</strong> lists</div>
          <div class="profile-stat"><strong>${totalGames}</strong> games</div>
          <div class="profile-stat">Joined ${timeAgo(p.joinedAt)}</div>
        </div>
      </div>
      <button class="btn btn-sm" id="btnEditProfile">Edit Profile</button>
    </div>`;
}


function renderCarousel(lists) {
  if (lists.length === 0) return '';

  return `
    <div class="carousel-section">
      <div class="carousel-header">
        <h2 class="carousel-title">Community Lists</h2>
        <div class="carousel-nav">
          <button class="carousel-arrow carousel-prev" aria-label="Previous">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button class="carousel-arrow carousel-next" aria-label="Next">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>
      <div class="carousel-track-wrap">
        <div class="carousel-track">
          ${lists.map(l => `
            <div class="carousel-card" data-shared-list="${escHtml(l._id)}">
              <div class="carousel-card-covers">
                ${l._previewCovers.length > 0
                  ? l._previewCovers.map(url => `<img src="${escHtml(url)}" alt="" loading="lazy">`).join('')
                  : `<div class="carousel-card-empty"><span>${escHtml(l.name.charAt(0))}</span></div>`
                }
              </div>
              <div class="carousel-card-overlay">
                <div class="carousel-card-owner">
                  ${renderAvatarSvg(l._owner.avatar, 20)}
                  <span>${escHtml(l._owner.username)}</span>
                </div>
                <div class="carousel-card-name">${escHtml(l.name)}</div>
                <div class="carousel-card-meta">${l._gameCount} game${l._gameCount !== 1 ? 's' : ''}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>`;
}

function renderDiscover() {
  return `
    <div class="discover-view">
      ${renderCarousel(state._publicLists)}
      ${state._publicLists.length === 0
        ? `<div class="empty-state"><div class="empty-state-text">No public lists yet. Create one and share it!</div></div>`
        : ''
      }
    </div>`;
}

function renderPriceSummary(games) {
  if (!state._prices) return '';
  const steamGames = games.filter(g => g.steamAppId);
  if (steamGames.length === 0) return '';

  let onSale = 0, freeCount = 0, totalPrice = 0, priced = 0;
  steamGames.forEach(g => {
    const p = state._prices[g.steamAppId];
    if (!p) return;
    if (p.free) { freeCount++; return; }
    if (p.price) { totalPrice += p.price; priced++; }
    if (p.discount) onSale++;
  });

  if (priced === 0 && freeCount === 0 && onSale === 0) return '';

  const parts = [];
  if (onSale > 0) parts.push(`<span class="price-summary-sale">${onSale} on sale</span>`);
  if (freeCount > 0) parts.push(`<span class="price-summary-free">${freeCount} free</span>`);
  if (totalPrice > 0) parts.push(`<span class="price-summary-total">Total: ${formatCLP(totalPrice)}</span>`);

  return `<div class="price-summary-bar">${parts.join('<span class="price-summary-sep"></span>')}</div>`;
}

function renderSharedList(shared) {
  if (!shared) return '<div class="empty-state"><div class="empty-state-text">Loading...</div></div>';
  const { list, games, likesCount } = shared;
  const hasLiked = state.user && state._likedList;
  const ownerProfile = state._sharedProfile || { username: list.userId || 'Anonymous', avatar: 'warrior', banner: 'midnight' };

  const isOwner = state.user && list.userId === state.user.username;

  const sortedGames = [...games].sort((a, b) => getGameScore(b._id) - getGameScore(a._id));

  return `
    <a class="shared-back" href="?" id="btnBackHome">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      Back
    </a>
    <div class="shared-banner" style="background:${getBannerGradient(ownerProfile.banner)}">
      <div class="shared-banner-content">
        <div class="shared-banner-avatar">${renderAvatarSvg(ownerProfile.avatar, 48)}</div>
        <div>
          <div class="shared-banner-user">${escHtml(ownerProfile.username)}</div>
          <div class="shared-banner-list">${escHtml(list.name)}</div>
        </div>
      </div>
      <div class="shared-banner-actions">
        ${isOwner ? `<button class="btn btn-sm" id="btnAddGame">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Add Game
        </button>
        <button class="btn btn-sm" id="btnManageVoters">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
          Voters
        </button>` : ''}
        <button class="shared-likes ${hasLiked ? 'liked' : ''}" id="btnLike">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="${hasLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span>${likesCount}</span>
        </button>
      </div>
    </div>
    ${renderPriceSummary(sortedGames)}
    ${renderGamesGrid(sortedGames)}
    <div class="shared-footer">
      ${games.length} game${games.length !== 1 ? 's' : ''} in this list
    </div>`;
}

export function render(s) {
  const container = document.getElementById('appContent');
  if (!container) return;

  let html = '';

  if (s.currentView === 'shared') {
    html = renderSharedList(s.sharedList);
  } else if (s.currentView === 'categories') {
    html = renderCategories();
  } else if (s.currentView === 'profile') {
    html = renderProfile();
  } else if (s.currentView === 'discover') {
    html = renderDiscover();
  } else {
    html = renderMyLists();
  }

  container.innerHTML = html;
}
