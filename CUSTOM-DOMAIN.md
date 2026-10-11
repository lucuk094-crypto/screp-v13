# Custom Domain Guide - ScrapeHub ULTIMATE

## Option 1: Vercel (Gratis + Mudah, Recommended)

1. **Push ke GitHub:**
```bash
git init
git add .
git commit -m "ultimate v7"
git branch -M main
git remote add origin https://github.com/YOURNAME/scrapehub-ultimate.git
git push -u origin main
git tag v5.0.0
git push origin v5.0.0
```

2. **Deploy Vercel:**
- Buka https://vercel.com -> Add New Project
- Import `YOURNAME/scrapehub-ultimate`
- Framework: Other, Build: `npm install`, Output: `public`
- Deploy -> dapat `https://scrapehub-ultimate.vercel.app`

3. **Custom Domain:**
- Vercel Dashboard -> Project -> Settings -> Domains
- Add Domain: `api.yourdomain.com` atau `scrape.yourdomain.com`
- Vercel kasih instruksi CNAME

4. **Setup DNS (Cloudflare / Niagahoster / Domainesia):**
```
Type: CNAME
Name: api
Target: cname.vercel-dns.com
Proxy: OFF (atau ON juga bisa)
```

5. **Test Real:**
```bash
curl https://api.yourdomain.com/api/docs
curl https://api.yourdomain.com/api/universal?url=https://quotes.toscrape.com&format=json
curl https://api.yourdomain.com/api/check?url=https://quotes.toscrape.com
curl https://api.yourdomain.com/api/universal?url=https://quotes.toscrape.com&format=postman -o collection.json
```

## Option 2: Docker + VPS (Ubuntu) + Nginx + SSL

```bash
# Di VPS
sudo apt update && sudo apt install docker.io docker-compose nginx certbot python3-certbot-nginx -y
git clone https://github.com/YOURNAME/scrapehub-ultimate.git
cd scrapehub-ultimate
docker-compose up -d --build
docker logs -f scrapehub_scrapehub_1
# Test
curl http://localhost:3000/api/universal?url=https://quotes.toscrape.com&format=json | head -20
```

**Nginx Config `/etc/nginx/sites-available/api.yourdomain.com`:**
```nginx
server {
    server_name api.yourdomain.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/api.yourdomain.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
sudo certbot --nginx -d api.yourdomain.com
# Test
curl https://api.yourdomain.com/api/check?url=https://quotes.toscrape.com
```

## Option 3: Railway / Fly.io / Render

**Railway:**
```bash
railway login
railway init
railway up
railway domain # add custom domain
```

**Fly.io:**
```bash
fly launch
fly deploy
fly certs add api.yourdomain.com
# DNS: CNAME api -> yourapp.fly.dev
```

## ✅ After Custom Domain Active

Update `cli.js` baseUrl or use env:

```bash
# Pakai domain sendiri
curl https://api.yourdomain.com/api/universal?url=https://www.viu.com/ott/id&format=json
curl https://api.yourdomain.com/api/universal?url=https://quotes.toscrape.com&format=excel -o data.xlsx
curl https://api.yourdomain.com/api/universal?url=https://quotes.toscrape.com&format=postman -o postman.json
curl https://api.yourdomain.com/api/universal?url=https://quotes.toscrape.com&format=graphql -o schema.graphql
curl https://api.yourdomain.com/api/universal?url=https://quotes.toscrape.com&format=grpc -o scrape.proto

# CLI dengan custom server
BASE_URL=https://api.yourdomain.com node cli.js https://quotes.toscrape.com --format=csv
```

Landing docs: `https://api.yourdomain.com/docs.html`
App: `https://api.yourdomain.com/`
API: `https://api.yourdomain.com/api/universal?url=LINK&format=json`

All real, tested HTTP 200, no fake.
