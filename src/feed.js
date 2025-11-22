// Feed data structure
let feedData = [
  {
    tags: ["media", "ai"],
    heading: "The good, the bad, and the completely made-up: Newsrooms on wrestling accurate answers out of AI",
    pubDate: "2025-08-04",
    content: "https://www.niemanlab.org/2025/08/the-good-the-bad-and-the-completely-made-up-newsrooms-on-wrestling-accurate-answers-out-of-ai/",
    contentType: "link",
    description: "I was interviewed by Nieman Lab about AI answer engines in newsrooms."
  },
  {
    tags: ["ai"],
    heading: "Swedish Text-to-speech model released",
    pubDate: "2025-11-02",
    content: "https://huggingface.co/EkhoCollective/f5-tts-swedish",
    contentType: "link",
    description: "An open source Swedish TTS model trained for Ekho Collective's installation Layers in the Peace Machine.",
    custom_thumbnail_image_url: "https://images.squarespace-cdn.com/content/v1/5dc5a4c27a44b822c0f378d5/1573235020922-JQDD2JKLBJYT4ERHDRPT/EKHO_LOGO-frame_white_nobg.png?format=original"
  },
  {
    tags: ["art", "ai"],
    heading: "Suoratalo",
    pubDate: "2025-08-22",
    content: "https://chiliolavi.github.io/Suoratalo/",
    contentType: "link",
    description: "Reviving and remixing the old website of an abandoned hotel.",
    custom_thumbnail_image_url: "https://chiliolavi.github.io/Suoratalo/images/P1190771.JPG"
  },
  {
    tags: ["ai", "art"],
    heading: "Layer of Sharing",
    pubDate: "2025-09-15",
    content: "https://peacemachine.eu/",
    contentType: "link",
    description: "Virtual component of the multipart installation 'Layers in the Peace Machine' by Ekho Collective.",
    custom_thumbnail_image_url: "https://images.squarespace-cdn.com/content/v1/5dc5a4c27a44b822c0f378d5/1573235020922-JQDD2JKLBJYT4ERHDRPT/EKHO_LOGO-frame_white_nobg.png?format=original"
  },
  {
    tags: ["ai", "research", "media"],
    heading: "Presenting the Olympics Bot Project",
    pubDate: "2024-09-24",
    content: "https://areena.yle.fi/1-71707821?seek=3780",
    contentType: "video",
    description: "Discussing the Olympics Bot project in Yle AI Demo."
  },
  {
    tags: ["ai", "research", "media"],
    heading: "Neurodiverse Rhetoric with Conversational AI",
    pubDate: "2024-12-05",
    content: "https://aaltodoc.aalto.fi/items/78ee8740-eed2-4be9-8171-42ecb603ecad",
    contentType: "link",
    description: "My Master's thesis from Aalto University's New Media MA program."
  }
];

// Sort by date (newest first)
function sortFeedData() {
  feedData.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
}

sortFeedData();

// --- Hydra thumbnail helpers ---
// Simple hash to derive numbers from a string seed
function hashCode(str) {
  let hash = 0;
  if (!str) return 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// --- Thumbnail cache helpers (localStorage) ---
// Bump this to invalidate previously cached thumbnails when visuals change
const CACHE_VERSION = 'v2';

function cacheKeyForSeed(seed) {
  return `hydra-thumb:${CACHE_VERSION}:` + (seed || '').toString();
}

function loadThumbnailFromCache(seed) {
  try {
    const key = cacheKeyForSeed(seed);
    const v = localStorage.getItem(key);
    return v || null;
  } catch (e) {
    console.warn('Failed to read thumbnail cache:', e);
    return null;
  }
}

function saveThumbnailToCache(seed, dataUrl) {
  try {
    const key = cacheKeyForSeed(seed);
    localStorage.setItem(key, dataUrl);
    return true;
  } catch (e) {
    // Quota exceeded or other storage error
    console.warn('Failed to save thumbnail to cache:', e);
    return false;
  }
}

// Generate a small color palette (3 channels) deterministically from seedNum
function paletteForSeed(seedNum) {
  // Convert a HSL color to RGB (0-1 range)
  function hslToRgb(h, s, l) {
    let r, g, b;
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return [r, g, b];
  }

  const baseHue = (seedNum % 360) / 360;
  // choose a scheme type to diversify palettes
  const scheme = seedNum % 4; // 0: analogous, 1: complementary, 2: triadic, 3: random-ish
  let h0 = baseHue;
  let h1 = (baseHue + 0.15) % 1;
  let h2 = (baseHue + 0.33) % 1;
  if (scheme === 1) {
    h1 = (baseHue + 0.5) % 1; // complementary
    h2 = (baseHue + 0.25) % 1;
  } else if (scheme === 2) {
    h1 = (baseHue + 1/3) % 1; // triadic
    h2 = (baseHue + 2/3) % 1;
  } else if (scheme === 3) {
    h1 = (baseHue + ((seedNum >> 4) % 40) / 360) % 1;
    h2 = (baseHue + ((seedNum >> 7) % 60) / 360) % 1;
  }

  // Slightly vary saturation and lightness per seed
  const sat = 0.45 + ((seedNum >> 2) % 40) / 200; // 0.45 - 0.65
  const light = 0.45 + ((seedNum >> 5) % 20) / 200; // 0.45 - 0.55

  const c0 = hslToRgb(h0, sat, light);
  const c1 = hslToRgb(h1, Math.max(0.35, sat - 0.05), Math.max(0.35, light - 0.05));
  const c2 = hslToRgb(h2, Math.max(0.3, sat - 0.1), Math.max(0.3, light + 0.02));

  // Return flattened RGB channels [r,g,b] from the base color (we keep three
  // values so earlier code using p0/p1/p2 as RGB channels still works).
  // We'll return the base color components so color(p0,p1,p2) maps to RGB.
  return [c0[0], c0[1], c0[2]];
}

// Force fractal thumbnails as default when true
const FORCE_FRACTAL_THUMBNAILS = true;

// Create a small hydra-synth thumbnail as a data URL. Uses dynamic import so
// hydra is only loaded when needed for thumbnails.
async function createHydraThumbnail(seedStr, width = 420, height = 240) {
  try {
    const HydraMod = await import('hydra-synth');
    const Hydra = HydraMod && (HydraMod.default || HydraMod);

    const canvas = document.createElement('canvas');
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    const hydra = new Hydra({
      canvas,
      makeGlobal: false,
      detectAudio: false,
      autoLoop: false,
      precision: 'mediump'
    });

    const s = hydra.synth;
    const seedNum = hashCode(seedStr || String(Math.random()));
    const hue = (seedNum % 360) / 360;
    const pattern = (FORCE_FRACTAL_THUMBNAILS) ? 5 : seedNum % 6;
    const palette = paletteForSeed(seedNum);
    const [p0, p1, p2] = palette;
    const speed = 0.02 + (seedNum % 15) / 80;
    const noiseScale = 6 + (seedNum % 12);
    const chaos = 0.3 + (seedNum % 20) / 50;

    // Compute a scale factor based on requested thumbnail size. Smaller
    // thumbnails get coarser patterns (lower oscillator frequencies, more
    // pixelation) so details remain legible.
    const shortSide = Math.min(width, height);
    const scaleFactor = Math.max(1, Math.round(420 / shortSide));
    const scaleRepeat = Math.max(1, Math.round(shortSide / 160));
    // Adjust osc frequencies for small thumbnails by dividing by scaleFactor
    const f1 = Math.max(1, Math.round(13 / scaleFactor));
    const f2 = Math.max(1, Math.round(21 / scaleFactor));
    const f3 = Math.max(1, Math.round(34 / scaleFactor));
    const f4 = Math.max(1, Math.round(55 / scaleFactor));
    // Pixelation amounts to apply for coarse rendering
    const pixelX = Math.max(4, Math.round(40 / scaleFactor));
    const pixelY = Math.max(4, Math.round(24 / scaleFactor));

    // Geometric thumbnail patterns (simpler, clearer at small sizes)
    // Base gradient / duotone
    const base = s.gradient()
      .rotate((seedNum % 8) * 0.2)
      .color(p0, p1, p2);

    switch (pattern) {
      case 0: {
        // User-requested oscillator-based chain. Try it, but fall back to
        // geometric squares if any method is unsupported in this version.
        try {
          // Use scaled oscillator frequencies so small thumbs show coarse
          // patterns rather than fine-grained noise.
          const oscMain = s.osc(f1, 0, 1);
          const mod1 = s.osc(f2, 0.25, 0);
          const mod2 = s.osc(f3);
          const mod3 = s.osc(f4);

          // Attempt to chain the user-provided sequence.
          // Some hydra versions may not expose `modulateKaleid` — guard with try/catch.
          let chain = oscMain.modulate(mod1)
            .modulateScale(mod2);

          if (typeof chain.modulateKaleid === 'function') {
            chain = chain.modulateKaleid(mod3, 0.1, 1);
          } else {
            // If modulateKaleid not available, emulate kaleid with small kaleid + modulate
            chain = chain.kaleid(2).modulate(mod3, 0.08);
          }

          chain.color(p0, p1, p2)
            .contrast(1.02)
            .saturate(0.42)
            .modulatePixelate(s.noise(3, speed * 0.5), pixelX, pixelY)
            .out(s.o0);
        } catch (err) {
          // Fallback: Repeating squares with subtle rotation
          const cols = Math.max(1, 3 + Math.floor((seedNum % 4) / scaleRepeat));
          const rows = Math.max(1, 2 + Math.floor((seedNum % 3) / scaleRepeat));
          const squares = s.shape(4, 0.45, 0.02)
            .repeat(Math.max(1, cols * scaleRepeat), Math.max(1, rows * scaleRepeat))
            .rotate(() => (hydra.synth.time * (0.01 + (seedNum % 5) * 0.002)))
            .kaleid(1 + (seedNum % 2))
            .color(p1, p2, p0)
            .brightness(0.06);

          base.add(squares, 0.65).contrast(1.05).saturate(0.45)
            .modulatePixelate(s.noise(3, speed * 0.5), pixelX, pixelY)
            .out(s.o0);
        }
        break;
      }
      case 1: {
        // Triangular tessellation (triangles are clearer than noise)
        const tri = s.shape(3, 0.6, 0.02)
          .repeat(4 + (seedNum % 4), 3 + (seedNum % 3))
          .rotate((seedNum % 6) * 0.3)
          .color(p1, p2, p0);

        const overlay = s.osc(8, speed * 0.2, p2).thresh(0.35).rotate(0.5).color(p2, p0, p1).brightness(-0.03);

        base.add(tri, 0.6).add(overlay, 0.12).contrast(1.08).saturate(0.5).out(s.o0);
        break;
      }
      case 2: {
        // Central circular badge with subtle rings
        const badge = s.shape(100, 0.4, 0.01)
          .scale(0.9)
          .color(p2, p0, p1)
          .brightness(0.05);

        const rings = s.osc(12, speed * 0.15, p0).modulate(s.gradient(), 0.2).rotate(0.2).thresh(0.45).brightness(-0.02);

        base.mult(badge).add(rings, 0.18).contrast(1.1).saturate(0.4).out(s.o0);
        break;
      }
      case 3: {
        // Grid of rotated rectangles
        const rects = s.shape(4, 0.5, 0.02)
          .repeat(5 + (seedNum % 3), 3 + (seedNum % 2))
          .rotate((seedNum % 4) * 0.2)
          .kaleid(2)
          .color(p1, p0, p2)
          .brightness(0.04);

        base.add(rects, 0.6).modulate(s.osc(3, speed * 0.12), 0.02).contrast(1.06).saturate(0.45).out(s.o0);
        break;
      }
      default: {
        // Clean stripes / duotone
        const stripes = s.osc(6, speed * 0.2, p1).thresh(0.5).rotate((seedNum % 5) * 0.3).color(p1, p2, p0);
        base.add(stripes, 0.5).contrast(1.02).saturate(0.35).out(s.o0);
        break;
      }
      case 5: {
        // Orange fractal-like shapes: voronoi + feedback + kaleid modulation
        try {
          // Blend the warm orange idea with the generated palette so fractals
          // remain warm but gain variety per-seed.
          const orangeHue = 30 / 360;
          const hueOrange = (p0 * 0.6 + orangeHue * 0.4) % 1;
          const vor = s.voronoi(6 + (seedNum % 8), 0.6)
            .modulateScale(s.noise(2 + (seedNum % 4), speed * 0.8), 0.6 + chaos)
            .brightness(-0.05);

          const rings = s.osc(8, speed * 0.15, hueOrange).thresh(0.45).kaleid(3).rotate((seedNum % 6) * 0.2);

          const feedback = vor.mult(rings).modulate(s.noise(3, speed * 0.4), 0.12).diff(s.osc(12, speed * 0.07, hueOrange + 0.02));

          // Add a subtle pixelation so the fractal shapes read at small sizes
          feedback.color(p2, p0, p1)
            .contrast(1.15)
            .saturate(0.95)
            .modulatePixelate(s.noise(2, speed * 0.3), Math.max(3, Math.round(40 / scaleFactor)), Math.max(3, Math.round(22 / scaleFactor)))
            .out(s.o0);
        } catch (err) {
          // If any method is missing, fall back to clean stripes
          const stripes2 = s.osc(6, speed * 0.2, hue).thresh(0.5).rotate((seedNum % 5) * 0.3).color(hue + 0.02, hue + 0.08, hue + 0.04);
          base.add(stripes2, 0.5).contrast(1.02).saturate(0.35).out(s.o0);
        }
        break;
      }
    }

    // Render a few ticks to settle the visuals then capture
    for (let i = 0; i < 6; i++) {
      hydra.tick(1000 / 60);
    }

    const dataUrl = canvas.toDataURL('image/png');

    // Try to clean up references
    try { hydra.synth = null; } catch (e) {}

    return dataUrl;
  } catch (err) {
    console.warn('Hydra thumbnail generation failed:', err);
    return null;
  }
}

// Ensure an <img> element has a thumbnail; generates one using hydra when
// src is empty or the image fails to load. Protect against repeated attempts.
async function ensureThumbnailForImg(imgEl, seedStr) {
  if (!imgEl) return;
  const attempts = parseInt(imgEl.dataset.hydraAttempts || '0', 10);
  if (attempts > 2) return;
  imgEl.dataset.hydraAttempts = attempts + 1;

  const rect = imgEl.getBoundingClientRect();
  const w = Math.max(200, Math.round(rect.width || 420));
  const h = Math.max(120, Math.round(rect.height || 240));

  imgEl.dataset.hydraLoading = '1';
  // Check cache first
  try {
    const cached = loadThumbnailFromCache(seedStr);
    if (cached) {
      imgEl.src = cached;
      // If the cached value is a data URL it was generated by hydra; mark it
      // so CSS can choose to cover instead of contain. Otherwise clear it.
      if (typeof cached === 'string' && cached.indexOf('data:') === 0) {
        imgEl.dataset.hydra = '1';
      } else {
        delete imgEl.dataset.hydra;
      }
      delete imgEl.dataset.hydraLoading;
      return;
    }
  } catch (e) {
    // ignore cache errors and continue
  }

  // Best-effort: if the image element has a `data-url` (the linked page),
  // try to fetch an OpenGraph / representative image from that page for
  // non-Medium links. If that fails, fall back to hydra generation.
  try {
    const pageUrl = imgEl.dataset.url;
    if (pageUrl) {
      let skipRemote = false;
      try {
        const parsed = new URL(pageUrl);
        if ((parsed.hostname || '').toLowerCase().includes('medium.com')) skipRemote = true;
      } catch (e) {
        // malformed URL — don't attempt remote fetch
        skipRemote = true;
      }

      if (!skipRemote) {
        const remoteImg = await tryFetchRemoteThumbnail(pageUrl, 4500);
        if (remoteImg) {
          // Set remote image as the src and cache it under the same seed so
          // subsequent visits reuse it. Keep a try/catch in case of storage errors.
          imgEl.src = remoteImg;
          // remote images are not hydra-generated
          delete imgEl.dataset.hydra;
          try { saveThumbnailToCache(seedStr, remoteImg); } catch (e) { /* ignore */ }
          delete imgEl.dataset.hydraLoading;
          return;
        }
      }
    }
  } catch (e) {
    // Any errors in remote fetch should not stop us from generating hydra thumbs
    console.warn('Remote thumbnail fetch failed:', e);
  }

  const dataUrl = await createHydraThumbnail(seedStr || imgEl.alt || String(Math.random()), w, h);

  if (dataUrl) {
    imgEl.src = dataUrl;
    // Mark hydra-generated thumbnails so CSS can treat them differently
    imgEl.dataset.hydra = '1';
    // try to persist
    try { saveThumbnailToCache(seedStr, dataUrl); } catch (e) { /* ignore */ }
  }
  delete imgEl.dataset.hydraLoading;
}

// --- end hydra helpers ---
// Fetch Medium articles via rss2json and merge into feedData
function fetchMediumArticles(username = "vertti-luostarinen") {
  const rssUrl = `https://medium.com/feed/@${username}`;
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

  return fetch(apiUrl)
    .then(res => {
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    })
    .then(data => {
      // Debug: print the full rss2json response and per-item keys so we can
      // inspect where titles/headings and content are located in the payload.
      console.log('rss2json response:', data);
      if (data && data.items && data.items.length) {
        data.items.forEach((it, idx) => {
          console.log('[rss2json item]', idx, {
            title: it.title,
            link: it.link,
            guid: it.guid,
            isoDate: it.isoDate,
            pubDate: it.pubDate,
            thumbnail: it.thumbnail,
            categories: it.categories,
            contentSnippet: it.contentSnippet,
            contentKeys: Object.keys(it || {})
          });
        });
      }

      if (!data || !data.items) return [];

      // Map rss2json items to our internal feed format.
      // Parse the HTML content and extract the first image and the first heading text.
      const items = data.items.map(item => {
        const rawHtml = item.content || item.description || "";
        let firstImage = "";
        let headingFromContent = item.title || "Untitled";

        let firstParagraph = "";
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(rawHtml, "text/html");
          const imgEl = doc.querySelector("img");
          if (imgEl && imgEl.src) firstImage = imgEl.src;

          // Use the rss2json `title` field if present; otherwise try to extract a heading from HTML.
          if (!item.title) {
            const headings = doc.querySelectorAll("h1,h2,h3");
            if (headings && headings.length) {
              let preferred = Array.from(headings).find(h => h.tagName.toLowerCase() === 'h1');
              if (!preferred) preferred = Array.from(headings).find(h => h.tagName.toLowerCase() === 'h2');
              if (!preferred) preferred = Array.from(headings).find(h => h.tagName.toLowerCase() === 'h3');
              if (preferred && preferred.textContent && preferred.textContent.trim()) {
                headingFromContent = preferred.textContent.trim();
              }
            }
          }

          const pEl = doc.querySelector("p");
          if (pEl && pEl.textContent.trim()) {
            firstParagraph = pEl.textContent.trim();
          }
        } catch (e) {
          // DOMParser may not be available in some environments; fall back to title, thumbnail, or snippet
          firstImage = item.thumbnail || "";
          firstParagraph = (item.contentSnippet || item.description || "").replace(/<[^>]+>/g, "").trim();
        }

        return {
          tags: (item.categories && item.categories.length) ? item.categories.map(t => t.toLowerCase()) : ["medium"],
          heading: headingFromContent,
          pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
          // `content` will hold the first image (if any). Keep the original article link
          // in `originalLink` so we can open the article when the card is clicked.
          content: firstImage || item.link || item.guid || "#",
          originalLink: item.link || item.guid || null,
          contentType: firstImage ? "image" : "link",
          description: (function(){
            const src = firstParagraph || item.contentSnippet || item.description || "";
            const text = src.replace(/<[^>]+>/g, "").trim();
            return text.length > 240 ? text.slice(0,237) + '...' : text;
          })()
        };
      });

      return items;
    })
    .catch(err => {
      console.warn("Failed to fetch Medium articles:", err);
      return [];
    });
}

let currentFilter = "all";

// Render tag filter buttons based on most frequent tags
function renderTagFilters(maxTags = 6) {
  const container = document.querySelector('.tag-filters');
  if (!container) return;

  // Count tags frequency across feedData
  const counts = feedData.reduce((acc, item) => {
    (item.tags || []).forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {});

  // Convert to array and sort by frequency desc, then alphabetical
  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([tag]) => tag);

  // Pick top tags
  const topTags = sorted.slice(0, maxTags);

  // Build buttons: keep an 'All' button first
  container.innerHTML = '';
  const allBtn = document.createElement('button');
  allBtn.className = 'tag-filter' + (currentFilter === 'all' ? ' active' : '');
  allBtn.dataset.tag = 'all';
  allBtn.textContent = 'All';
  container.appendChild(allBtn);

  topTags.forEach(tag => {
    const btn = document.createElement('button');
    btn.className = 'tag-filter' + (currentFilter === tag ? ' active' : '');
    btn.dataset.tag = tag;
    btn.textContent = tag.charAt(0).toUpperCase() + tag.slice(1);
    container.appendChild(btn);
  });

  // Attach handlers
  container.querySelectorAll('.tag-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = btn.dataset.tag;
      filterFeed(tag);
    });
  });
}

// Render feed cards
function renderFeed(filterTag = "all") {
  const container = document.getElementById("feed-container");
  if (!container) return;

  // Filter data
  const filteredData = filterTag === "all" 
    ? feedData 
    : feedData.filter(item => item.tags.includes(filterTag));

  // Clear container
  container.innerHTML = "";

  // Create cards
  filteredData.forEach(item => {
    const card = document.createElement("div");
    card.className = "feed-card";

    // Format date
    const date = new Date(item.pubDate);
    const formattedDate = date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "short", 
      day: "numeric" 
    });

    // Build card content based on content type
    let contentHTML = "";
    
    if (item.contentType === "link" || item.contentType === "blog") {
      // For links and blog posts, prefer a provided `custom_thumbnail_image_url`.
      // If not present, render an empty <img> so we can generate/fetch a thumbnail.
      const seed = (item.originalLink || item.content || item.heading || '')
        .toString();
      const dataUrl = (item.originalLink || item.content || '').toString();
      if (item.custom_thumbnail_image_url) {
        contentHTML = `<div class="feed-media">
        <img class="feed-thumb" src="${item.custom_thumbnail_image_url}" alt="${item.heading}" loading="lazy" data-seed="${seed}" data-url="${dataUrl}" width="420" height="240" style="aspect-ratio:16/9;min-height:120px;object-fit:cover;" />
      </div>`;
      } else {
        contentHTML = `<div class="feed-media">
        <img class="feed-thumb" src="" alt="${item.heading}" loading="lazy" data-seed="${seed}" data-url="${dataUrl}" width="420" height="240" style="aspect-ratio:16/9;min-height:120px;object-fit:cover;" />
      </div>`;
      }
    } else if (item.contentType === "image") {
      const seed = (item.originalLink || item.content || item.heading || '')
        .toString();
      // If a custom thumbnail is provided use it, otherwise use the image content
      const thumbSrc = item.custom_thumbnail_image_url || item.content || '';
      contentHTML = `<div class="feed-media">
        <img class="feed-thumb" src="${thumbSrc}" alt="${item.heading}" loading="lazy" data-seed="${seed}" data-url="${item.originalLink || item.content || ''}" width="420" height="240" style="aspect-ratio:16/9;min-height:120px;object-fit:cover;" />
      </div>`;
    } else if (item.contentType === "video") {
      // Add a permissive `allow` attribute so embeds that request experimental
      // features (like compute-pressure) don't cause policy violation logs.
      // Note: `compute-pressure` is experimental — only allow it if you trust
      // the embed source. This list also includes common features used by
      // video players.
      const allowAttrs = [
        'accelerometer',
        'autoplay',
        'clipboard-write',
        'encrypted-media',
        'gyroscope',
        'picture-in-picture',
        'web-share',
        'compute-pressure'
      ].join('; ');

      contentHTML = `<div class="feed-media">
        <iframe src="${item.content}" frameborder="0" allow="${allowAttrs}" allowfullscreen loading="lazy"></iframe>
      </div>`;
    }

    // Build tags HTML
    const tagsHTML = item.tags.map(tag => 
      `<span class="feed-tag" data-tag="${tag}">${tag}</span>`
    ).join("");

    card.innerHTML = `
      ${contentHTML}
      <div class="feed-card-body">
        <h3>${item.heading}</h3>
        ${item.description ? `<p class="feed-description">${item.description}</p>` : ""}
        <div class="feed-meta">
          <time datetime="${item.pubDate}">${formattedDate}</time>
          <div class="feed-tags">${tagsHTML}</div>
        </div>
      </div>
    `;

    // Add click handler for clickable content (link, blog) or image cards that have an originalLink.
    const openUrl = item.originalLink || item.content;
    if (openUrl) {
      card.style.cursor = "pointer";
      card.addEventListener("click", (e) => {
        // Don't trigger if clicking on a tag
        if (!e.target.classList.contains("feed-tag")) {
          const target = (item.contentType === "blog" && !item.originalLink) ? "_self" : "_blank";
          window.open(openUrl, target);
        }
      });
    }

    container.appendChild(card);

    // If there's an image element in the card, ensure it has a thumbnail.
    const imgEl = card.querySelector('img.feed-thumb, img');
    if (imgEl) {
      const seedStr = imgEl.dataset.seed || item.originalLink || item.content || item.heading || '';
      // If no src or empty src, generate one. Also attach error handler.
      if (!imgEl.src) {
        ensureThumbnailForImg(imgEl, seedStr);
      }
      imgEl.addEventListener('error', () => {
        ensureThumbnailForImg(imgEl, seedStr);
      });
    }
  });

  // Add tag click handlers
  document.querySelectorAll(".feed-tag").forEach(tagEl => {
    tagEl.addEventListener("click", (e) => {
      e.stopPropagation();
      const tag = e.target.dataset.tag;
      filterFeed(tag);
    });
  });

  // Show message if no results
  if (filteredData.length === 0) {
    container.innerHTML = '<p class="no-results">No items found with this tag.</p>';
  }
}

// Attempt to fetch an OpenGraph / representative image from a remote page.
// This is best-effort: many sites block cross-origin HTML fetches (CORS),
// so failures are expected. On failure we return null and the caller should
// fall back to generated hydra thumbnails.
async function tryFetchRemoteThumbnail(pageUrl, timeoutMs = 5000) {
  if (!pageUrl) return null;
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(pageUrl, { method: 'GET', signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) return null;
    const text = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');

    // Check common meta tags for OpenGraph / Twitter images and link rel image_src
    const meta = doc.querySelector('meta[property="og:image"], meta[name="og:image"], meta[property="twitter:image"], link[rel="image_src"]');
    let imgUrl = null;
    if (meta) {
      imgUrl = meta.getAttribute('content') || meta.getAttribute('href') || meta.getAttribute('src');
    }

    // Fallback: first meaningful <img> in the page
    if (!imgUrl) {
      const img = doc.querySelector('img');
      if (img) imgUrl = img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-lazy-src');
    }

    if (!imgUrl) return null;

    // Resolve relative URLs against the page URL
    try {
      const abs = new URL(imgUrl, pageUrl).href;
      return abs;
    } catch (e) {
      return imgUrl;
    }
  } catch (e) {
    // Could be network error, CORS, or abort; return null to let caller fallback
    return null;
  }
}

// Filter feed by tag
function filterFeed(tag) {
  currentFilter = tag;
  renderFeed(tag);

  // Update active filter button
  document.querySelectorAll(".tag-filter").forEach(btn => {
    btn.classList.remove("active");
    if (btn.dataset.tag === tag) {
      btn.classList.add("active");
    }
  });
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  // Initial render from static items
  renderFeed();
  renderTagFilters();

  // Fetch and merge Medium articles, then re-render
  fetchMediumArticles().then(items => {
    if (items && items.length) {
      // Avoid duplicating items by checking the original article link when present,
      // otherwise fall back to the content value.
      const existingLinks = new Set(feedData.map(i => i.originalLink || i.content));
      const newItems = items.filter(i => !existingLinks.has(i.originalLink || i.content));
      if (newItems.length) {
        feedData = feedData.concat(newItems);
        sortFeedData();
        renderFeed(currentFilter);
        renderTagFilters();
      }
    }
  });
  // Tag filters are rendered by `renderTagFilters()` and have handlers attached there.
});
