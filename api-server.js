// VIU REST API - Wrapper sederhana untuk memudahkan bikin website
// Cara pakai: npm install && npm start
// Buka http://localhost:3000

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint baru: Scrape web apapun - tempel link langsung dapat endpoint (tanpa simpan file)
app.get('/api/scrape', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).json({ error: 'Pakai ?url=https://target.com' });

  try {
    const urlObj = new URL(targetUrl);
    const base = `${urlObj.protocol}//${urlObj.host}`;
    const htmlRes = await fetch(targetUrl, {
      headers: { 'user-agent': 'Mozilla/5.0 Chrome/120.0.0.0', 'accept': 'text/html' }
    });
    const html = await htmlRes.text();

    // Cari endpoint di HTML
    const apiRegex = /https?:\/\/[^"'\s]*api[^"'\s]*|\/api\/[^"'\s]+|\/v1\/[^"'\s]+|\/v2\/[^"'\s]+|\/graphql[^"'\s]*/gi;
    const matches = html.match(apiRegex) || [];
    const unique = [...new Set(matches)].slice(0, 20);

    // Cari file JS
    const jsRegex = /src="([^"]+\.js[^"]*)"/gi;
    const jsFiles = [];
    let m;
    while ((m = jsRegex.exec(html)) !== null) {
      let js = m[1];
      if (js.startsWith('//')) js = 'https:' + js;
      else if (js.startsWith('/')) js = base + js;
      else if (!js.startsWith('http')) js = base + '/' + js;
      jsFiles.push(js);
      if (jsFiles.length >= 3) break;
    }

    // Bongkar 1 JS pertama cari API
    let jsApis = [];
    if (jsFiles[0]) {
      try {
        const jsRes = await fetch(jsFiles[0], { headers: { 'user-agent': 'Mozilla/5.0' } });
        const jsText = await jsRes.text();
        const jsMatches = jsText.match(apiRegex) || [];
        jsApis = [...new Set(jsMatches)].slice(0, 10);
      } catch {}
    }

    res.json({
      scanned_url: targetUrl,
      domain: urlObj.host,
      endpoints_found: unique,
      js_files: jsFiles,
      apis_in_js: jsApis,
      one_liner: `curl -s "${targetUrl}" -A "Mozilla/5.0" | grep -oE '/api/[^" ]+' | sort -u`,
      note: 'Ini tanpa simpan file, semua di memory. Untuk Viu pakai /api/films'
    });
  } catch (e) {
    res.status(500).json({ error: e.message, hint: 'Pastikan URL valid dan bisa diakses' });
  }
});

// Config Viu - Indonesia
const VIU_BASE = 'https://api-gateway-global.viu.com';
const DEFAULT_PARAMS = {
  platform_flag_label: 'web',
  area_id: '1000',
  language_flag_id: '8',
  ut: '1',
  platformFlagLabel: 'web',
  areaId: '1000',
  languageFlagId: '8',
  countryCode: 'ID',
  platform: 'web',
  languageId: '8',
  deviceId: '8da8e4be-faca-419f-a290-ba4cac5ad28f',
  deviceType: 'COOKIE',
  userId: '166244951',
  abtestId: 'z',
  osFlagId: '3',
  os_flag_id: '3'
};

function buildQuery(extra = {}) {
  const all = { ...DEFAULT_PARAMS, ...extra };
  return new URLSearchParams(all).toString();
}

// Simple cache biar gak spam Viu
const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 menit

async function fetchViu(path, extraParams = {}) {
  const query = buildQuery(extraParams);
  const url = `${VIU_BASE}${path}?${query}`;
  
  const cacheKey = url;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    console.log(`[CACHE] ${path}`);
    return cached.data;
  }

  console.log(`[FETCH] ${url}`);
  const res = await fetch(url, {
    headers: {
      'origin': 'https://www.viu.com',
      'referer': 'https://www.viu.com/',
      'accept': 'application/json',
      'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
    }
  });
  
  if (!res.ok) throw new Error(`Viu API error ${res.status}`);
  const data = await res.json();
  cache.set(cacheKey, { data, time: Date.now() });
  return data;
}

// Helper untuk merapikan data
function simplifyFilms(viuData) {
  const grids = viuData.data?.grid || [];
  const films = [];
  
  grids.forEach(grid => {
    const catName = grid.name;
    (grid.product || []).forEach(p => {
      films.push({
        product_id: p.product_id,
        series_id: p.series_id,
        title: p.series_name,
        synopsis: p.synopsis,
        category: p.series_category_name,
        grid_category: catName,
        is_movie: p.is_movie === "1",
        free_time: parseInt(p.free_time || 0),
        is_free: p.free_time !== "0",
        allow_download: p.allow_download === "1",
        cover_landscape: p.series_cover_landscape_image_url,
        cover_portrait: p.series_cover_portrait_image_url,
        product_cover: p.product_cover_landscape_image_url,
        cp_name: p.cp_name
      });
    });
  });
  
  return {
    source: 'viu.com/ott/id',
    total: films.length,
    categories: grids.map(g => ({ name: g.name, count: g.product?.length || 0, type: g.model_type })),
    films
  };
}

// Routes

app.get('/', (req, res) => {
  res.json({
    message: 'Viu Indonesia REST API - Buatan kamu sendiri!',
    author: 'Untuk belajar scraping terminal -> REST API',
    endpoints: {
      'GET /api/home': 'Ambil home raw dari Viu',
      'GET /api/films': 'Semua film sudah diringkas (72 film)',
      'GET /api/category/:name': 'Filter by kategori, contoh: /api/category/Horor%20Favorit',
      'GET /api/film/:productId': 'Detail lengkap 1 film, contoh: /api/film/3360914',
      'GET /api/series/:seriesId': 'Info series (pakai series_id)',
      'GET /api/search?q=horor': 'Cari film (filter lokal)',
      'GET /api/docs': 'Dokumentasi ini'
    },
    example: `http://localhost:${PORT}/api/films`,
    note: 'Data di-cache 10 menit biar gak spam Viu. Hormati ToS Viu, jangan share video stream, cuma metadata untuk belajar.'
  });
});

app.get('/api/docs', (req, res) => {
  res.redirect('/');
});

app.get('/api/home', async (req, res) => {
  try {
    const data = await fetchViu('/api/audienceTargeting/recommendations', {
      pageType: 'home',
      pageId: '0'
    });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/films', async (req, res) => {
  try {
    const raw = await fetchViu('/api/audienceTargeting/recommendations', {
      pageType: 'home',
      pageId: '0'
    });
    const simplified = simplifyFilms(raw);
    res.json(simplified);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/category/:name', async (req, res) => {
  try {
    const raw = await fetchViu('/api/audienceTargeting/recommendations', {
      pageType: 'home',
      pageId: '0'
    });
    const simplified = simplifyFilms(raw);
    const catName = decodeURIComponent(req.params.name).toLowerCase();
    const filtered = simplified.films.filter(f => 
      f.grid_category.toLowerCase().includes(catName) ||
      f.category.toLowerCase().includes(catName)
    );
    res.json({
      query: req.params.name,
      total: filtered.length,
      films: filtered
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/film/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const data = await fetchViu('/api/vod/detail', {
      productId,
      product_id: productId
    });
    
    // Rapikan biar gampang dipakai frontend
    const current = data.data?.current_product || {};
    const series = data.data?.series || {};
    
    res.json({
      product_id: current.product_id,
      series_id: series.series_id || current.series_id,
      title: series.name || current.series_id,
      description: series.description || current.description,
      synopsis: current.synopsis,
      genre: series.genre,
      category: series.category_name,
      actors: series.actor || [],
      tags: series.series_tag || [],
      total_episodes: series.product_total,
      released_episodes: series.released_product_total,
      cover: series.cover_landscape_image_url,
      poster: series.cover_portrait_image_url,
      cp_name: series.cp_name,
      schedule: series.update_cycle_description,
      free_time: current.free_time,
      allow_download: current.allow_download,
      share_url: current.share_url,
      subtitles: current.subtitle || [],
      raw: data // kalau mau lihat raw lengkap
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/series/:seriesId', async (req, res) => {
  try {
    // Series detail butuh productId, jadi kita cari productId dari home dulu
    const { seriesId } = req.params;
    const home = await fetchViu('/api/audienceTargeting/recommendations', {
      pageType: 'home',
      pageId: '0'
    });
    const allFilms = simplifyFilms(home).films;
    const found = allFilms.find(f => f.series_id === seriesId);
    
    if (!found) {
      return res.status(404).json({ error: `Series ${seriesId} tidak ketemu di home. Coba pakai /api/film/:productId` });
    }
    
    // Pakai productId yang ketemu
    const detail = await fetchViu('/api/vod/detail', {
      productId: found.product_id,
      product_id: found.product_id
    });
    
    res.json({
      info: `Series ${seriesId} ditemukan via product ${found.product_id}`,
      ...detail.data?.series,
      current_product: detail.data?.current_product
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/search', async (req, res) => {
  try {
    const q = (req.query.q || '').toLowerCase();
    if (!q) return res.status(400).json({ error: 'Pakai ?q=keyword, contoh /api/search?q=horor' });
    
    const raw = await fetchViu('/api/audienceTargeting/recommendations', {
      pageType: 'home',
      pageId: '0'
    });
    const simplified = simplifyFilms(raw);
    const filtered = simplified.films.filter(f => 
      f.title.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q) ||
      f.grid_category.toLowerCase().includes(q) ||
      (f.synopsis && f.synopsis.toLowerCase().includes(q))
    );
    
    res.json({
      query: q,
      total: filtered.length,
      films: filtered
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Jalankan server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ==========================================
  Viu REST API kamu jalan!
  Local: http://localhost:${PORT}
  Docs: http://localhost:${PORT}/api/docs
  
  Coba:
  curl http://localhost:${PORT}/api/films | jq
  curl http://localhost:${PORT}/api/category/Horor%20Favorit | jq
  curl http://localhost:${PORT}/api/film/3360914 | jq
  ==========================================
  `);
});
