const API = "https://blog-api-982x.onrender.com";

// ── PARTICLES ──
function initParticles(id = 'particles', count = 30) {
  const container = document.getElementById(id);
  if (!container) return;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.setProperty('--dur', (7 + Math.random() * 10) + 's');
    p.style.setProperty('--del', (Math.random() * 12) + 's');
    p.style.setProperty('--dx', ((Math.random() - 0.5) * 50) + 'px');
    const sz = 1 + Math.random() * 2;
    p.style.width = sz + 'px';
    p.style.height = sz + 'px';
    p.style.background = Math.random() > 0.6 ? '#c0392b' : '#f39c12';
    container.appendChild(p);
  }
}

// ── FLAMES ──
function initFlames(id = 'flames', count = 20) {
  const container = document.getElementById(id);
  if (!container) return;

  for (let i = 0; i < count; i++) {
    const f = document.createElement('div');
    f.className = 'flame';
    f.style.left = Math.random() * 100 + '%';
    f.style.setProperty('--fd', (1.5 + Math.random() * 2.5) + 's');
    f.style.setProperty('--fdel', (Math.random() * 4) + 's');
    const w = 3 + Math.random() * 10;
    f.style.width = w + 'px';
    f.style.background = Math.random() > 0.5
      ? 'linear-gradient(180deg,transparent,#c0392b,#e67e22)'
      : 'linear-gradient(180deg,transparent,#e67e22,#f39c12)';
    container.appendChild(f);
  }
}

// ── UTILITIES ──
function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function fmtDateLong(d) {
  return new Date(d).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

function escHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function wordCount(s) {
  return s.trim() ? s.trim().split(/\s+/).length : 0;
}

function readTime(s) {
  return Math.max(1, Math.ceil(wordCount(s) / 200));
}

// ── INDEX PAGE ──
async function loadPosts() {
  const grid = document.getElementById('posts-grid');
  if (!grid) return;

  try {
    const r = await fetch(`${API}/posts`);
    const posts = await r.json();
    const countEl = document.getElementById('post-count');
    if (countEl) {
      countEl.textContent = posts.length + ' SCROLL' + (posts.length !== 1 ? 'S' : '');
    }

    if (!posts.length) {
      grid.innerHTML = `<div class="empty-state"><span class="e-icon">📜</span><p>NO SCROLLS YET.<br>THE WARRIOR IS STILL WRITING.</p></div>`;
      return;
    }

    grid.innerHTML = posts.map((p, i) => `
      <a class="post-card" href="/blog/post.html?slug=${encodeURIComponent(p.slug)}" style="--delay:${i * 0.08}s">
        <div class="card-top">
          <div class="card-title">${escHtml(p.title)}</div>
          <div class="card-arrow">→</div>
        </div>
        ${p.excerpt ? `<div class="card-excerpt">${escHtml(p.excerpt)}</div>` : ''}
        <div class="card-footer">
          <span class="card-date">${fmtDate(p.created_at)}</span>
          <span class="card-badge">SCROLL</span>
          <span class="card-read">READ →</span>
        </div>
      </a>
    `).join('');
  } catch (e) {
    grid.innerHTML = `<div class="empty-state"><span class="e-icon">⚠</span><p>FAILED TO SUMMON SCROLLS.<br>THE API MAY BE SLEEPING.<br><small style="opacity:0.5">${e.message}</small></p></div>`;
  }
}

// ── POST PAGE ──
async function loadPost() {
  const wrap = document.getElementById('article-wrap');
  if (!wrap) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');

  if (!slug) {
    wrap.innerHTML = `<div class="state-box"><span class="state-icon">⚠</span><div class="state-text">NO SCROLL SPECIFIED.<br><a href="/blog/" style="color:#c0392b">← Return to the archive</a></div></div>`;
    return;
  }

  try {
    const r = await fetch(`${API}/posts/${encodeURIComponent(slug)}`);
    if (!r.ok) throw new Error('not found');
    const post = await r.json();

    document.title = `${post.title} — Shadow Scroll`;

    // Configure marked if available
    if (typeof marked !== 'undefined') {
      marked.setOptions({ breaks: true, gfm: true });
    }

    const html = typeof marked !== 'undefined' ? marked.parse(post.content || '') : post.content || '';
    const wc = wordCount(post.content || '');
    const rt = readTime(post.content || '');

    wrap.innerHTML = `
      <div class="post-header">
        <div class="post-eyebrow">
          <span class="post-date">${fmtDateLong(post.created_at)}</span>
          <span class="post-badge">SCROLL</span>
        </div>
        <h1 class="post-title">${post.title}</h1>
        ${post.excerpt ? `<p class="post-excerpt">${post.excerpt}</p>` : ''}
        <div class="post-meta-bar">
          <div class="meta-item">WORDS: <span>${wc}</span></div>
          <div class="meta-item">READ TIME: <span>${rt} MIN</span></div>
          <div class="meta-item">INSCRIBED: <span>${fmtDateLong(post.updated_at || post.created_at)}</span></div>
        </div>
      </div>
      <div class="post-content">${html}</div>
      <div class="post-footer">
        <a href="/blog/" class="back-link">← Back to all scrolls</a>
        <span class="post-sig">⚔ SHADOW SCROLL</span>
      </div>
    `;
  } catch (e) {
    wrap.innerHTML = `<div class="state-box"><span class="state-icon">💀</span><div class="state-text">THIS SCROLL WAS NOT FOUND.<br>IT MAY HAVE BEEN DESTROYED.<br><br><a href="/blog/" style="color:#c0392b;font-size:0.65rem;letter-spacing:0.2em">← RETURN TO THE ARCHIVE</a></div></div>`;
  }
}

// ── INITIALIZE ──
document.addEventListener('DOMContentLoaded', () => {
  initParticles('particles', window.location.pathname.includes('post.html') ? 25 : 35);
  initFlames('flames', window.location.pathname.includes('post.html') ? 18 : 22);

  // Load page-specific content
  if (document.getElementById('posts-grid')) {
    loadPosts();
  } else if (document.getElementById('article-wrap')) {
    loadPost();
  }
});
