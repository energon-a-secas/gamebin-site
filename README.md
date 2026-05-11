<div align="center">

# GameBin

Curate, organize, and share visual game lists

[![Live][badge-site]][url-site]
[![HTML5][badge-html]][url-html]
[![CSS3][badge-css]][url-css]
[![JavaScript][badge-js]][url-js]
[![Claude Code][badge-claude]][url-claude]
[![License][badge-license]](LICENSE)

[badge-site]:    https://img.shields.io/badge/live_site-0063e5?style=for-the-badge&logo=googlechrome&logoColor=white
[badge-html]:    https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white
[badge-css]:     https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white
[badge-js]:      https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black
[badge-claude]:  https://img.shields.io/badge/Claude_Code-CC785C?style=for-the-badge&logo=anthropic&logoColor=white
[badge-license]: https://img.shields.io/badge/license-MIT-404040?style=for-the-badge

[url-site]:   https://gamebin.neorgon.com/
[url-html]:   #
[url-css]:    #
[url-js]:     #
[url-claude]: https://claude.ai/code

</div>

---

## Overview

GameBin lets you build visual game lists with cover art, custom names, and reusable category labels. Browse in grid or list view, filter by category, share lists via link, and bookmark your favorites.

**Live:** gamebin.neorgon.com

---

## Features

- **[List management]** -- Create, rename, and delete game lists with custom accent colors
- **[Visual browsing]** -- Toggle between grid gallery and card list views for easy scanning
- **[Reusable categories]** -- Define custom categories with colors, or use preloaded defaults (Favorites, Completed, Wishlist, To Play, Replay, Abandoned)
- **[Quick filtering]** -- Tap category chips to filter games in any list
- **[Cover art]** -- Paste image URLs for game covers; fallback icon when no image
- **[Share lists]** -- Copy a shareable link to any list; viewers can browse and like
- **[Search]** -- Instant search across games in the active list
- **[Auth]** -- Create an account to save lists, categories, and likes to the cloud backend

---

## Running locally

ES modules require an HTTP server (not `file://`):

```bash
python3 -m http.server
```

Or from the monorepo root:

```bash
make serve gamebin
```

For the Convex backend:

```bash
npm install
npx convex dev
```

---

## Architecture

![Architecture](docs/architecture.svg)

```
gamebin-site/
├── index.html              # HTML shell (header, auth panel, app container)
├── css/
│   └── style.css           # All styles (dark theme, grid/list views, modals)
├── js/
│   ├── app.js              # Entry point — init, check URL for shared list
│   ├── state.js            # Shared state object, localStorage persistence
│   ├── render.js           # DOM rendering (sidebar, grid, categories, shared view)
│   ├── events.js           # Event handlers, modals, auth, local "DB"
│   └── utils.js            # Helpers (escHtml, toast, copy, defaults)
├── convex/
│   ├── schema.ts           # Table definitions (users, lists, games, categories, likes)
│   ├── auth.ts             # Login, register, session management
│   ├── lists.ts            # CRUD for lists, games, categories, likes
│   └── tsconfig.json       # Convex TypeScript config
├── docs/
│   └── architecture.mmd    # Mermaid architecture diagram source
├── assets/
│   └── icons/              # Hub card SVG icon
├── CNAME                   # gamebin.neorgon.com
├── favicon.ico             # Browser tab icon
├── energon-classic-logo.png # Header logo
├── robots.txt              # Search engine access rules
├── sitemap.xml             # Search engine sitemap
├── Makefile                # make serve / make kill
├── .gitignore              # Standard ignores
└── .claudeignore           # Claude Code scope rules
```

---

<div align="center">
<sub>Part of <a href="https://neorgon.com/">Neorgon</a></sub>
</div>
