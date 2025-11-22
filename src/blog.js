import { marked } from '/node_modules/marked/lib/marked.esm.js';

// Very small frontmatter parser (YAML-like key: value simple parser)
function parseFrontmatter(raw) {
  const fm = {};
  const m = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return { fm: {}, body: raw };
  const lines = m[1].split(/\n+/);
  for (const line of lines) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim().replace(/^"|"$/g, '');
    fm[key] = val;
  }
  const body = raw.slice(m[0].length);
  return { fm, body };
}

async function loadPosts() {
  // Vite-specific glob to load raw markdown files
  const modules = import.meta.glob('/src/content/blog/*.md', { as: 'raw' });
  const posts = [];
  for (const path in modules) {
    try {
      const resolver = modules[path];
      const raw = await resolver();
      const { fm, body } = parseFrontmatter(raw);
      const slug = path.split('/').pop().replace(/\.md$/, '');
      posts.push({ slug, path, meta: fm, body });
    } catch (e) {
      console.error('Failed to load', path, e);
    }
  }
  // sort by pubDate if present
  posts.sort((a, b) => {
    const da = a.meta.pubDate || '';
    const db = b.meta.pubDate || '';
    return db.localeCompare(da);
  });
  return posts;
}

function renderList(posts, container) {
  if (!posts.length) {
    container.innerHTML = '<p>No posts found.</p>';
    return;
  }
  const ul = document.createElement('div');
  ul.className = 'post-list';
  for (const p of posts) {
    const item = document.createElement('article');
    item.className = 'post-item';
    item.innerHTML = `
      <h2><a href="#${p.slug}">${p.meta.title || p.slug}</a></h2>
      <p class="meta">${p.meta.pubDate || ''} — ${p.meta.author || ''}</p>
      <p>${p.meta.description || ''}</p>
    `;
    ul.appendChild(item);
  }
  container.innerHTML = '';
  container.appendChild(ul);
}

function renderPost(post, container) {
  const html = marked.parse(post.body);
  container.innerHTML = `
    <article class="post-full">
      <h1>${post.meta.title || ''}</h1>
      <p class="meta">${post.meta.pubDate || ''} — ${post.meta.author || ''}</p>
      <div class="post-body">${html}</div>
      <p><a href="/blog.html">← Back to blog</a></p>
    </article>
  `;
}

async function boot() {
  const container = document.getElementById('blog-container');
  if (!container) return;
  const posts = await loadPosts();

  function hashChanged() {
    const slug = location.hash.replace('#', '');
    if (!slug) {
      renderList(posts, container);
    } else {
      const post = posts.find(p => p.slug === slug);
      if (post) renderPost(post, container);
      else container.innerHTML = '<p>Post not found.</p>';
    }
  }

  window.addEventListener('hashchange', hashChanged);
  hashChanged();
}

boot();
