// ---------- 2) Load shared SIDEBAR + SEARCH ----------
injectPartial('#sidebar-container', '/assets/includes/sidebar.html', (sidebarHost) => {
  // After sidebar is available, highlight the current page link
  const here = window.location;
  const normalize = (url) => url.replace(/\/+$/, '').toLowerCase(); // strip trailing slash
  const currentUrl = normalize(here.origin + here.pathname);

  sidebarHost.querySelectorAll('a[href]').forEach(a => {
    const linkUrl = normalize(a.href);
    if (linkUrl === currentUrl ||
        (currentUrl.endsWith('/index.html') && linkUrl === currentUrl.replace(/\/index\.html$/, ''))
    ) {
      a.setAttribute('aria-current', 'page');
      a.classList.add('active');
    }
  });

  // ====== SEARCH UI (inserted just below "📚 Contents") ======
  const nav = sidebarHost.querySelector('.sidebar') || sidebarHost;
  const heading = nav.querySelector('h3');
  const list = nav.querySelector('ul');
  if (!heading || !list) return; // defensive

  // Build search container
  const wrap = document.createElement('div');
  wrap.className = 'sidebar-search';

  const input = document.createElement('input');
  input.type = 'search';
  input.id = 'sidebar-search';
  input.placeholder = 'Search…';
  input.setAttribute('aria-label', 'Search pages');

  const clearBtn = document.createElement('button');
  clearBtn.type = 'button';
  clearBtn.className = 'sidebar-search-clear';
  clearBtn.setAttribute('aria-label', 'Clear search');
  clearBtn.textContent = '×';

  wrap.appendChild(input);
  wrap.appendChild(clearBtn);

  // Insert search right after the heading (below "📚 Contents")
  heading.insertAdjacentElement('afterend', wrap);

  // Index items
  const items = Array.from(list.querySelectorAll('li')).map(li => {
    const link = li.querySelector('a');
    const text = (link?.textContent || li.textContent || '').trim();
    return { li, link, text, lower: text.toLowerCase() };
  });

  // Simple highlighter for matches
  const highlight = (el, needle) => {
    if (!el || !el.textContent) return;
    const txt = el.textContent;
    if (!needle) { el.innerHTML = txt; return; }
    const i = txt.toLowerCase().indexOf(needle.toLowerCase());
    if (i === -1) { el.innerHTML = txt; return; }
    el.innerHTML = `${txt.slice(0, i)}<mark>${txt.slice(i, i + needle.length)}</mark>${txt.slice(i + needle.length)}`;
  };

  // Filter logic
  const filter = (q) => {
    const needle = q.trim().toLowerCase();
    let first;
    items.forEach(({ li, link, lower }) => {
      const show = !needle || lower.includes(needle);
      li.style.display = show ? '' : 'none';
      if (link) {
        highlight(link, needle);
        if (show && !first) first = link;
      }
    });
    clearBtn.style.visibility = needle ? 'visible' : 'hidden';
    return first;
  };

  // Wire events
  input.addEventListener('input', () => filter(input.value));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      input.value = '';
      filter('');
      input.focus();
    } else if (e.key === 'Enter') {
      const first = filter(input.value);
      if (first) first.focus();
    }
  });
  clearBtn.addEventListener('click', () => {
    input.value = '';
    filter('');
    input.focus();
  });

  // Initial state
  clearBtn.style.visibility = 'hidden';
});
