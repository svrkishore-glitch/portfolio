document.body.classList.add('js');

const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const intro = document.getElementById('intro');
let bootTimers = [];

function closeIntro() {
  intro?.classList.add('hide');
  bootTimers.forEach(clearTimeout);
  setTimeout(() => intro?.remove(), 380);
}

if (prefersReduced) {
  intro?.remove();
} else {
  const bootLines = document.getElementById('bootLines');
  const sequence = [
    'initializing portfolio...',
    'loading projects and profile data...',
    'access granted',
  ];
  let bootIndex = 0;

  function showBootLine() {
    if (!bootLines) return;
    if (bootIndex < sequence.length) {
      const row = document.createElement('div');
      row.className = 'bootLine';
      row.style.transform = 'translateX(-5px)';
      row.innerHTML = '&gt; ' + (bootIndex === 2 ? `<b>${sequence[bootIndex]}</b>` : sequence[bootIndex]);
      bootLines.appendChild(row);
      bootIndex++;
      bootTimers.push(setTimeout(showBootLine, 310));
    } else {
      bootTimers.push(setTimeout(closeIntro, 650));
    }
  }

  bootTimers.push(setTimeout(showBootLine, 120));
  const skipBtn = document.getElementById('skipIntro');
  if (skipBtn) skipBtn.onclick = closeIntro;
}

// Theme preference: saved choice wins; otherwise follow system setting.
const savedTheme = localStorage.getItem('kishore-theme');
document.documentElement.dataset.theme =
  savedTheme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
document.getElementById('themeToggle').onclick = () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('kishore-theme', next);
};

// Mobile nav drawer
const menu = document.getElementById('navlinks');
const menuBtn = document.getElementById('menuBtn');
menuBtn.onclick = () => {
  const open = menu.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
};
menu.querySelectorAll('a').forEach((a) => {
  a.onclick = () => {
    menu.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
  };
});

// Reveal animations and skill bar widths
const observer = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        e.target.querySelectorAll?.('.skill').forEach((s) => {
          s.querySelector('i').style.width = `${s.dataset.level}%`;
        });
        observer.unobserve(e.target);
      }
    }),
  { threshold: 0.15 }
);
document.querySelectorAll('.reveal').forEach((x) => observer.observe(x));

// Active navigation highlight
const sections = [...document.querySelectorAll('main section[id]')];
const navAnchors = [...document.querySelectorAll('.navlinks a')];
const navObs = new IntersectionObserver(
  (es) =>
    es.forEach((e) => {
      if (e.isIntersecting) {
        navAnchors.forEach((a) => a.classList.toggle('active', a.hash === `#${e.target.id}`));
      }
    }),
  { rootMargin: '-35% 0px -55%' }
);
sections.forEach((s) => navObs.observe(s));

const fallbackCurated = [
  {
    name: 'SpinCycle-Bikes',
    repo: 'SpinCycle-Bikes',
    alwaysShow: true,
    badge: 'Backend API · Team (Server & Routes)',
    description:
      'Campus bike-sharing REST API with Node.js, Express 5, SQLite, parameterized queries, pagination, conflict checks, and 48 automated tests.',
    html_url: 'https://github.com/svrkishore-glitch/SpinCycle-Bikes',
    topics: ['Node.js', 'Express', 'SQLite', 'REST API'],
    outcome: 'Owned server.js & routes.js (middleware, routing, 404 & centralized error handling).',
  },
  {
    name: 'LandslideGuard NER',
    repo: 'landslide-monitoring-prototype',
    alwaysShow: true,
    badge: 'Prototype · Full-Stack',
    description:
      'Northeast India rainfall and slope-monitoring prototype built with React 19, Leaflet, FastAPI, Open-Meteo forecasts, and an optional local vision-model experiment.',
    html_url: 'https://github.com/svrkishore-glitch/landslide-monitoring-prototype',
    topics: ['React', 'FastAPI', 'Python', 'Leaflet'],
    outcome: 'Honest prototype scoping with fixed-fixture API tests and graceful offline fallback.',
  },
  {
    name: 'Developer Portfolio',
    repo: 'portfolio',
    alwaysShow: true,
    badge: 'Static Web + CI Sync',
    description:
      'Static developer portfolio with zero runtime dependencies, automated GitHub/LeetCode/GFG snapshot syncing, and GitHub Pages CI deployment.',
    html_url: 'https://github.com/svrkishore-glitch/portfolio',
    homepage: 'https://svrkishore-glitch.github.io/portfolio/',
    topics: ['JavaScript', 'HTML/CSS', 'Python', 'GitHub Actions'],
    outcome: 'Modularized UI with change-only snapshot sync to prevent empty commit churn.',
  },
  {
    name: 'SmartFinance',
    repo: 'SMART-FINANCE-',
    alwaysShow: true,
    badge: 'Full-Stack · Demo',
    description:
      'Personal finance tracker with Express, SQLite, Chart.js analytics, budget summaries, and optional AI insights using synthetic demo data.',
    html_url: 'https://github.com/svrkishore-glitch/SMART-FINANCE-',
    topics: ['JavaScript', 'Node.js', 'SQLite', 'Chart.js'],
    outcome: 'Relational SQLite schema with indexed queries, budget tracking, and demo-mode isolation.',
  },
  {
    name: 'GoYatri',
    repo: 'Go-Yatri',
    alwaysShow: true,
    badge: 'Full-Stack · Live Demo',
    description:
      'Multi-mode travel booking app (buses, trains, flights) with interactive seat selection, role-based views, and Firebase Auth/Firestore transactions.',
    homepage: 'https://goyatri.vercel.app',
    html_url: 'https://github.com/svrkishore-glitch/Go-Yatri',
    topics: ['React', 'Firebase', 'Zustand', 'Tailwind CSS'],
    outcome: 'Deployed on Vercel with Firestore security rules and transactional seat booking.',
  },
  {
    name: 'HR Policy RAG Assistant',
    repo: 'streamlit-2',
    alwaysShow: true,
    badge: 'AI / RAG · Python',
    description:
      'Document-grounded HR policy Q&A chatbot built with Streamlit, LangChain, Hugging Face embeddings, FAISS vector search, and Groq LLM.',
    html_url: 'https://github.com/svrkishore-glitch/streamlit-2',
    topics: ['Python', 'Streamlit', 'LangChain', 'FAISS'],
    outcome: 'Deterministic PDF corpus loading with scope classification and source citations.',
  },
  {
    name: 'SVS Traders',
    repo: 'svs-traders',
    alwaysShow: true,
    badge: 'Full-Stack · Business App',
    description:
      'Inventory, billing, and returns management app built with React, Vite, Tailwind CSS, and Supabase.',
    html_url: 'https://github.com/svrkishore-glitch/svs-traders',
    topics: ['React', 'Supabase', 'Vite', 'Tailwind CSS'],
    outcome: 'Supports stock uploads, invoice generation, and returns workflows.',
  },
];

let allProjects = [];
const projectRepoCacheKey = 'kishore-project-repos';
const projectSyncCacheKey = 'kishore-project-repos-lastSynced';

function norm(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function esc(s) {
  return String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function safeUrl(url) {
  if (!url) return '';
  try {
    const parsed = new URL(url, location.origin);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.href : '';
  } catch {
    return '';
  }
}

function projectTags(repo) {
  const topics = [...(repo.topics || []), repo.language].filter(Boolean);
  return [
    ...new Set(
      topics.map((t) => {
        const l = String(t).toLowerCase();
        if (l.includes('react')) return 'React';
        if (l.includes('python')) return 'Python';
        if (l.includes('javascript') || l === 'js') return 'JavaScript';
        if (l.includes('typescript')) return 'TypeScript';
        if (l.includes('firebase')) return 'Firebase';
        if (l.includes('fastapi')) return 'FastAPI';
        if (l.includes('sqlite')) return 'SQLite';
        if (l.includes('express')) return 'Express';
        if (l.includes('node')) return 'Node.js';
        return String(t);
      })
    ),
  ];
}

function readableRepoName(name) {
  return String(name || '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function setProjectsStatus(message, showRetry = false) {
  const statusEl = document.getElementById('projectsStatus');
  if (!statusEl) return;
  statusEl.innerHTML = esc(message);
  if (showRetry) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip';
    btn.textContent = 'Retry';
    btn.onclick = () => loadProjects();
    statusEl.appendChild(btn);
  }
}

async function loadProjects() {
  setProjectsStatus('Loading project metadata...');
  let curatedList = fallbackCurated;
  try {
    const curResp = await fetch(`data/curated.json?t=${Date.now()}`, { cache: 'no-store' });
    if (curResp.ok) {
      const parsed = await curResp.json();
      if (Array.isArray(parsed) && parsed.length) curatedList = parsed;
    }
  } catch {
    // Retain inline curated fallback.
  }

  let repos = [];
  let loadedFromNetwork = false;
  let lastSynced = '';
  try {
    const r = await fetch(`data/github.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!r.ok) throw new Error('GitHub project data request failed');
    const data = await r.json();
    repos = Array.isArray(data) ? data : data.repos || [];
    lastSynced = String(data.lastSynced || '');
    loadedFromNetwork = true;
    try {
      const previous = localStorage.getItem(projectSyncCacheKey);
      if (previous !== lastSynced) localStorage.removeItem(projectRepoCacheKey);
      localStorage.setItem(projectSyncCacheKey, lastSynced);
      localStorage.setItem(projectRepoCacheKey, JSON.stringify(repos));
    } catch {
      // Storage unavailable.
    }
  } catch {
    try {
      const cached = localStorage.getItem(projectRepoCacheKey);
      if (cached) repos = JSON.parse(cached);
    } catch {
      repos = [];
    }
  }

  const repoByKey = new Map(repos.map((r) => [norm(r.name), { ...r, _tags: projectTags(r) }]));
  const curatedOrder = new Map(curatedList.map((c, idx) => [norm(c.repo || c.name), idx]));
  const combined = new Map();

  curatedList.forEach((c) => {
    const repoName = String(c.repo || c.name || '').trim();
    const key = norm(repoName);
    const synced = repoByKey.get(key);
    if (!synced && !c.alwaysShow) return;
    const tags = c.topics?.length ? [...c.topics] : synced?._tags || [];
    combined.set(key, {
      ...(synced || {}),
      ...c,
      name: c.name || synced?.name,
      repo: repoName,
      homepage: c.homepage !== undefined ? c.homepage : synced?.homepage,
      _curated: true,
      _priority: curatedOrder.get(key) ?? 999,
      _tags: tags,
    });
  });

  // Include any remaining non-curated public repos only after featured projects.
  repoByKey.forEach((r, key) => {
    if (!combined.has(key)) {
      combined.set(key, { ...r, _curated: false, _priority: 1000 });
    }
  });

  allProjects = [...combined.values()].sort((a, b) => {
    if (a._priority !== b._priority) return a._priority - b._priority;
    return (b.pushed_at || b.updated_at || '').localeCompare(a.pushed_at || a.updated_at || '');
  });

  const chips = [...new Set(allProjects.flatMap((p) => p._tags || []))].sort((a, b) => a.localeCompare(b));
  renderFilters(['All', ...chips]);
  renderProjects('All');

  if (loadedFromNetwork && lastSynced) {
    const dateLabel = new Date(lastSynced).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    setProjectsStatus(`Showing ${allProjects.length} projects · synced ${dateLabel}`);
  } else if (!loadedFromNetwork) {
    setProjectsStatus('Showing curated project list (live GitHub snapshot unavailable).', true);
  } else {
    setProjectsStatus('');
  }
}

function renderFilters(tags) {
  const box = document.getElementById('filters');
  box.innerHTML = tags
    .map(
      (t, i) =>
        `<button class="chip ${i === 0 ? 'selected' : ''}" type="button" aria-pressed="${i === 0 ? 'true' : 'false'}" data-filter="${esc(t)}">${esc(t)}</button>`
    )
    .join('');
  box.querySelectorAll('button').forEach((b) => {
    b.onclick = () => {
      box.querySelectorAll('button').forEach((x) => {
        const isSelected = x === b;
        x.classList.toggle('selected', isSelected);
        x.setAttribute('aria-pressed', String(isSelected));
      });
      renderProjects(b.dataset.filter);
    };
  });
}

function renderProjects(filter = 'All') {
  const list = allProjects.filter(
    (p) => filter === 'All' || (p._tags || []).some((t) => t.toLowerCase() === filter.toLowerCase())
  );
  const grid = document.getElementById('projectsGrid');
  grid.innerHTML = list.length
    ? list
        .map((p) => {
          const live = safeUrl(p.homepage);
          const repoUrl = safeUrl(p.html_url);
          const date = p.updated_at || p.pushed_at;
          const stars = Number(p.stargazers_count) || 0;
          const meta = [
            stars ? `<span>★ ${stars}</span>` : '',
            date ? `<span>${new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</span>` : '',
          ]
            .filter(Boolean)
            .join('');
          const summary = p._curated && p.description ? p.description : p.overview || p.description || '';
          const title = p._curated ? p.name : summary ? p.name : readableRepoName(p.name);
          return `<article class="card project">${p.badge ? `<span class="projectBadge">${esc(p.badge)}</span>` : ''}<h3>${esc(title)}</h3>${
            summary ? `<p class="projectDescription">${esc(summary)}</p>` : ''
          }<div class="tags">${(p._tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>${
            p.outcome ? `<p class="projectOutcome">${esc(p.outcome)}</p>` : ''
          }${meta ? `<div class="projectMeta">${meta}</div>` : ''}<div class="projectLinks">${
            live ? `<a href="${esc(live)}" target="_blank" rel="noopener noreferrer">Live ↗</a>` : ''
          }${
            repoUrl
              ? `<a href="${esc(repoUrl)}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>`
              : ''
          }</div></article>`;
        })
        .join('')
    : '<div class="card empty">No projects match this filter yet.</div>';
}

loadProjects();

function num(v) {
  return Number(v) || 0;
}

function profileLink(url) {
  return `<a class="btn secondary" target="_blank" rel="noopener noreferrer" href="${esc(url)}">View profile ↗</a>`;
}

function countAnim(el, value) {
  const target = num(value);
  let started = false;
  const run = () => {
    if (started) return;
    started = true;
    if (prefersReduced) {
      el.textContent = target.toLocaleString();
      return;
    }
    const start = performance.now();
    const dur = 900;
    function step(t) {
      const p = Math.min((t - start) / dur, 1);
      el.textContent = Math.floor(target * (1 - Math.pow(1 - p, 3))).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  };
  if (prefersReduced) {
    run();
    return;
  }
  const watch = new IntersectionObserver(
    (entries) => {
      if (entries.some((x) => x.isIntersecting)) {
        run();
        watch.disconnect();
      }
    },
    { threshold: 0.35 }
  );
  watch.observe(el);
}

const profileFallbacks = {
  leetcode: {
    username: 'svr_kishore',
    submitStats: {
      acSubmissionNum: [
        { difficulty: 'All', count: 95, submissions: 115 },
        { difficulty: 'Easy', count: 43, submissions: 59 },
        { difficulty: 'Medium', count: 42, submissions: 44 },
        { difficulty: 'Hard', count: 10, submissions: 12 },
      ],
    },
    calendar: { activeYears: [2026], streak: 16, totalActiveDays: 67, submissionCalendar: '{}' },
    recentAccepted: [],
    lastSynced: '2026-11-27T20:12:02Z',
  },
  gfg: {
    profileUrl: 'https://www.geeksforgeeks.org/profile/svrkishonvno',
    problemsSolved: 13,
    codingScore: 38,
    instituteRank: 13,
    difficulty: {},
    lastSynced: '2026-11-27T20:12:03Z',
  },
};

const profileVersion = {};

async function loadProfile(id, path, url, type) {
  const root = document.getElementById(id);
  const sync = root.querySelector('.sync');
  const body = root.querySelector('.profileBody');
  try {
    let d = profileFallbacks[id];
    let fileLoaded = false;
    try {
      const r = await fetch(`${path}?t=${Date.now()}`, { cache: 'no-store' });
      if (r.ok) {
        const latest = await r.json();
        if (latest.lastSynced) {
          d = latest;
          fileLoaded = true;
        }
      }
    } catch {
      // Fallback to embedded snapshot.
    }

    if (profileVersion[id] === d.lastSynced) return;
    profileVersion[id] = d.lastSynced;
    sync.textContent =
      (fileLoaded ? 'Synced ' : 'Saved snapshot · ') +
      new Date(d.lastSynced).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

    if (type === 'lc') {
      const stats = d.submitStats || {};
      const counts = stats.acSubmissionNum || d.acSubmissionNum || [];
      const by = Object.fromEntries(counts.map((x) => [String(x.difficulty || x.diff || '').toLowerCase(), num(x.count)]));
      const total = num(stats.totalSolved) || num(d.totalSolved) || num(by.all);
      const easy = by.easy || num(d.easy);
      const med = by.medium || num(d.medium);
      const hard = by.hard || num(d.hard);
      const cal = d.calendar || d.userProfileCalendar || {};
      const subs = cal.submissionCalendar || cal;
      let calendar = {};
      try {
        calendar = typeof subs === 'string' ? JSON.parse(subs) : subs || {};
      } catch {
        calendar = {};
      }
      const today = new Date();
      const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
      const rangeStart = todayUtc - 364 * 86400000;
      const submissionTotal = Object.entries(calendar).reduce(
        (sum, [ts, value]) => sum + (Number(ts) * 1000 >= rangeStart ? Number(value) || 0 : 0),
        0
      );
      const easyPct = total ? (easy / total) * 100 : 0;
      const mediumPct = total ? ((easy + med) / total) * 100 : 0;

      body.innerHTML = `<div class="lcOverview"><div class="lcSolvedPanel"><div class="lcDonut" style="--easy:${easyPct}%;--medium:${mediumPct}%"><div class="lcDonutInner"><b class="counter" data-count="${total}">0</b><small>Solved</small></div></div><div class="lcDifficulty"><div><span>Easy</span><b>${easy}</b></div><div><span>Medium</span><b>${med}</b></div><div><span>Hard</span><b>${hard}</b></div></div></div><div class="lcMeta"><div><small>Active days</small><b>${num(cal.totalActiveDays)}</b></div><div><small>Current streak</small><b>${num(cal.streak)} days</b></div></div></div><div class="lcActivity"><div class="lcActivityHead"><strong>${submissionTotal.toLocaleString()}</strong> submissions in the past year<span>${num(cal.totalActiveDays)} active days · current streak ${num(cal.streak)} days</span></div><div class="lcCalendar"><div class="lcMonthLabels"></div><div class="heatmap lcHeatmap" aria-label="LeetCode submission activity in the past year"></div></div></div><div class="lcRecent"><div class="lcRecentHead"><strong>Recent accepted</strong><a target="_blank" rel="noopener noreferrer" href="${esc(url)}">View all ↗</a></div><div class="lcRecentList"></div></div>${profileLink(url)}`;

      const heat = body.querySelector('.lcHeatmap');
      const months = body.querySelector('.lcMonthLabels');
      const start = new Date(rangeStart);
      start.setUTCDate(start.getUTCDate() - start.getUTCDay());
      let monthSeen = '';
      for (let day = new Date(start), index = 0; day.getTime() <= todayUtc; day.setUTCDate(day.getUTCDate() + 1), index++) {
        const week = Math.floor(index / 7);
        const weekday = day.getUTCDay();
        const key = String(Math.floor(day.getTime() / 1000));
        const v = Number(calendar[key] || 0);
        const level = v ? Math.min(4, Math.ceil(Math.log2(v + 1))) : 0;
        heat.insertAdjacentHTML(
          'beforeend',
          `<i style="grid-column:${week + 1};grid-row:${weekday + 1}" data-v="${level}" title="${day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: ${v} submissions"></i>`
        );
        const month = day.getUTCMonth();
        if (day.getUTCDate() <= 7 && month !== monthSeen) {
          monthSeen = month;
          months.insertAdjacentHTML(
            'beforeend',
            `<span style="grid-column:${week + 1}">${day.toLocaleDateString(undefined, { month: 'short' })}</span>`
          );
        }
      }

      const recent = Array.isArray(d.recentAccepted) ? d.recentAccepted.slice(0, 6) : [];
      const list = body.querySelector('.lcRecentList');
      list.innerHTML = recent.length
        ? recent
            .map((item) => {
              const when = new Date(Number(item.timestamp) * 1000);
              const days = Math.max(0, Math.floor((Date.now() - when.getTime()) / 86400000));
              const age = days === 0 ? 'today' : days === 1 ? '1 day ago' : `${days} days ago`;
              return `<a class="lcRecentItem" target="_blank" rel="noopener noreferrer" href="https://leetcode.com/problems/${encodeURIComponent(item.titleSlug || '')}/"><strong>${esc(item.title)}</strong><span>${age}</span></a>`;
            })
            .join('')
        : '<p class="sync">Recent accepted submissions appear after the next successful sync.</p>';
      body.querySelectorAll('.counter').forEach((e) => countAnim(e, e.dataset.count));
    } else {
      const solved = num(d.problemsSolved);
      const score = num(d.codingScore);
      body.innerHTML = `<div class="profileStats gfgStats"><div class="stat"><strong class="counter" data-count="${solved}">0</strong><span>Problems solved</span></div><div class="stat"><strong class="counter" data-count="${score}">0</strong><span>Coding score</span></div></div>${profileLink(url)}`;
      body.querySelectorAll('.counter').forEach((e) => countAnim(e, e.dataset.count));
    }
  } catch {
    sync.textContent = 'Profile stats will appear after the first successful sync.';
    body.innerHTML = profileLink(url);
  }
}

loadProfile('leetcode', 'data/leetcode.json', 'https://leetcode.com/u/svr_kishore/', 'lc');
loadProfile('gfg', 'data/gfg.json', 'https://www.geeksforgeeks.org/profile/svrkishonvno', 'gfg');

setInterval(() => {
  loadProjects();
  loadProfile('leetcode', 'data/leetcode.json', 'https://leetcode.com/u/svr_kishore/', 'lc');
  loadProfile('gfg', 'data/gfg.json', 'https://www.geeksforgeeks.org/profile/svrkishonvno', 'gfg');
}, 60000);

document.getElementById('copyEmail').onclick = async () => {
  try {
    await navigator.clipboard.writeText('svrkishore.2006@gmail.com');
    document.getElementById('copyStatus').textContent = 'Copied!';
  } catch {
    document.getElementById('copyStatus').textContent = 'Select the email above to copy';
  }
};

document.getElementById('contactForm').onsubmit = (e) => {
  e.preventDefault();
  const f = new FormData(e.currentTarget);
  const subject = encodeURIComponent(`Portfolio inquiry from ${f.get('name')}`);
  const body = encodeURIComponent(`Name: ${f.get('name')}\nEmail: ${f.get('email')}\n\n${f.get('message')}`);
  document.getElementById('formMessage').textContent = 'Opening your email app…';
  location.href = `mailto:svrkishore.2006@gmail.com?subject=${subject}&body=${body}`;
};

// Animated role label
const roleText = document.getElementById('roleText');
if (!prefersReduced && roleText) {
  const roles = ['Full-Stack Developer', 'Backend & API Builder', 'Python & AI Engineer', 'CS Undergrad'];
  let ri = 0;
  let ci = roles[0].length;
  let erasing = true;
  function cycleRole() {
    const word = roles[ri];
    if (erasing) {
      ci = Math.max(0, ci - 1);
      roleText.textContent = word.slice(0, ci);
      if (ci === 0) {
        erasing = false;
        ri = (ri + 1) % roles.length;
        setTimeout(cycleRole, 180);
        return;
      }
    } else {
      const next = roles[ri];
      ci = Math.min(next.length, ci + 1);
      roleText.textContent = next.slice(0, ci);
      if (ci === next.length) {
        erasing = true;
        setTimeout(cycleRole, 1450);
        return;
      }
    }
    setTimeout(cycleRole, erasing ? 42 : 68);
  }
  setTimeout(cycleRole, 1400);
}

// Scroll progress & subtle grid parallax
let scrollQueued = false;
function updateScrollState() {
  const max = document.documentElement.scrollHeight - innerHeight;
  const pct = max > 0 ? (scrollY / max) * 100 : 0;
  document.getElementById('scrollProgressBar').style.width = `${pct}%`;
  document.querySelector('.topbar').classList.toggle('scrolled', scrollY > 16);
  document.getElementById('pageGrid').style.setProperty('--grid-shift', `${(scrollY * 0.08).toFixed(1)}px`);
  scrollQueued = false;
}
addEventListener(
  'scroll',
  () => {
    if (!scrollQueued) {
      scrollQueued = true;
      requestAnimationFrame(updateScrollState);
    }
  },
  { passive: true }
);
updateScrollState();

// Brief scramble effect on section eyebrows
if (!prefersReduced) {
  const alphabet = '01<>/[]{}';
  const scrambleObserver = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        scrambleObserver.unobserve(el);
        const original = el.textContent;
        const chars = original.split('');
        let frame = 0;
        el.classList.add('glitch');
        const interval = setInterval(() => {
          el.textContent = chars
            .map((ch, i) => (ch === ' ' ? ch : frame > i ? ch : alphabet[Math.floor(Math.random() * alphabet.length)]))
            .join('');
          frame++;
          if (frame > chars.length) {
            clearInterval(interval);
            el.textContent = original;
            setTimeout(() => el.classList.remove('glitch'), 520);
          }
        }, 24);
      }),
    { threshold: 0.7 }
  );
  document.querySelectorAll('.sectionHead .eyebrow').forEach((el) => scrambleObserver.observe(el));
}

// Fine-pointer custom cursor, magnetic buttons, and tilt cards
const finePointer = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 768px)').matches;
if (finePointer && !prefersReduced) {
  const ring = document.getElementById('cursorRing');
  const glow = document.getElementById('cursorGlow');
  document.body.classList.add('customCursor');
  let mx = innerWidth / 2;
  let my = innerHeight / 2;
  let rx = mx;
  let ry = my;
  let ringLoop = false;

  function easeRing() {
    rx += (mx - rx) * 0.17;
    ry += (my - ry) * 0.17;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
    if (Math.abs(mx - rx) + Math.abs(my - ry) > 0.4) requestAnimationFrame(easeRing);
    else ringLoop = false;
  }

  function hideCursor() {
    ring.classList.remove('is-visible', 'hover', 'form-hover');
    glow.classList.remove('is-visible', 'form-hover');
  }

  document.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    mx = e.clientX;
    my = e.clientY;
    document.body.style.setProperty('--cursor-x', `${mx}px`);
    document.body.style.setProperty('--cursor-y', `${my}px`);
    ring.classList.add('is-visible');
    glow.classList.add('is-visible');
    if (!ringLoop) {
      ringLoop = true;
      requestAnimationFrame(easeRing);
    }
    const target = e.target instanceof Element ? e.target : null;
    const formField = !!target?.closest('input, textarea');
    const hot = !formField && !!target?.closest('a, button, .chip');
    ring.classList.toggle('hover', hot);
    ring.classList.toggle('form-hover', formField);
    glow.classList.toggle('form-hover', formField);
  });
  document.documentElement.addEventListener('pointerleave', hideCursor);
  window.addEventListener('blur', hideCursor);

  document.querySelectorAll('.magnetic').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) / r.width;
      const dy = (e.clientY - r.top - r.height / 2) / r.height;
      el.style.translate = `${dx * 9}px ${dy * 7}px`;
    });
    el.addEventListener('pointerleave', () => {
      el.style.translate = '0 0';
    });
  });

  let activeTilt = null;
  document.addEventListener('pointermove', (e) => {
    const card = e.target instanceof Element ? e.target.closest('.project, .profileCard') : null;
    if (activeTilt && activeTilt !== card) {
      activeTilt.classList.remove('tilt-card', 'tilt-active');
      activeTilt.style.transform = '';
      activeTilt = null;
    }
    if (!card) return;
    activeTilt = card;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    card.classList.add('tilt-card', 'tilt-active');
    card.style.setProperty('--glare-x', `${x * 100}%`);
    card.style.setProperty('--glare-y', `${y * 100}%`);
    card.style.transform = `perspective(1000px) rotateX(${(0.5 - y) * 5}deg) rotateY(${(x - 0.5) * 6}deg) translateY(-3px)`;
  });
  document.addEventListener('pointerout', (e) => {
    if (activeTilt && !(e.relatedTarget instanceof Element && e.relatedTarget.closest('.project, .profileCard'))) {
      activeTilt.classList.remove('tilt-active');
      activeTilt.style.transform = '';
      activeTilt = null;
    }
  });

  const portrait = document.querySelector('.portraitHalo');
  document.querySelector('.portrait')?.addEventListener('pointermove', (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    portrait.style.setProperty('--portrait-x', `${-y * 8}deg`);
    portrait.style.setProperty('--portrait-y', `${x * 10}deg`);
  });
  document.querySelector('.portrait')?.addEventListener('pointerleave', () => {
    portrait.style.setProperty('--portrait-x', '0deg');
    portrait.style.setProperty('--portrait-y', '0deg');
  });
}

// Pause hero ambient animation when off-screen or hidden
const heroSection = document.querySelector('.hero');
if (heroSection && !prefersReduced) {
  let heroVisible = false;
  const pauseMesh = () => heroSection.classList.toggle('motion-paused', document.hidden || !heroVisible);
  const heroMotionObserver = new IntersectionObserver(
    (entries) => {
      heroVisible = entries.some((entry) => entry.isIntersecting);
      pauseMesh();
    },
    { threshold: 0.02 }
  );
  heroMotionObserver.observe(heroSection);
  document.addEventListener('visibilitychange', pauseMesh);
}

// Lightweight canvas particle nets
function particleNet(id, selector) {
  if (prefersReduced) return;
  const canvas = document.getElementById(id);
  const section = document.querySelector(selector);
  if (!canvas || !section) return;
  const ctx = canvas.getContext('2d');
  let w = 0;
  let h = 0;
  let points = [];
  let visible = false;
  let raf = 0;

  function resize() {
    const r = section.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    w = Math.max(1, r.width);
    h = Math.max(1, r.height);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = innerWidth < 768 ? 18 : 44;
    points = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.23,
      vy: (Math.random() - 0.5) * 0.23,
    }));
  }

  function draw() {
    if (!visible || document.hidden) return;
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(57, 255, 20, 0.55)';
      ctx.fill();
      for (let j = i + 1; j < points.length; j++) {
        const q = points[j];
        const dist = Math.hypot(p.x - q.x, p.y - q.y);
        if (dist < 112) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(57, 255, 20, ${(1 - dist / 112) * 0.16})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }
    raf = requestAnimationFrame(draw);
  }

  const io = new IntersectionObserver(
    (es) => {
      visible = es.some((x) => x.isIntersecting);
      if (visible && !document.hidden && !raf) draw();
      else if ((!visible || document.hidden) && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    },
    { threshold: 0.03 }
  );
  io.observe(section);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else if (visible && !raf) {
      draw();
    }
  });
  addEventListener('resize', resize, { passive: true });
  resize();
}

particleNet('heroParticles', '#home');
particleNet('contactParticles', '#contact');
document.getElementById('year').textContent = new Date().getFullYear();
