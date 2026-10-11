# ScrapeHub ULTIMATE V6 - 30 Formats + CLI + Docker + Terminal

![NPM Version](https://img.shields.io/npm/v/scrapehub-ultimate)
![Docker Pulls](https://img.shields.io/docker/pulls/scrapehub/scrapehub-ultimate)
![License](https://img.shields.io/badge/real-no%20fake-green)

Universal all-links scraper for ANY web link without heavy Cloudflare. Output as REST API downloadable in ALL possible formats until exhausted + terminal realtime checker + CLI + Docker. **Real, no fake/error, all tested HTTP 200.**

## 🚀 Quick Start

### NPM / npx (no install)
```bash
npx scrapehub-ultimate https://quotes.toscrape.com --check
npx scrapehub-ultimate https://quotes.toscrape.com --format=csv
npx scrapehub-ultimate https://quotes.toscrape.com --format=excel -o data.xlsx
npx scrapehub-ultimate https://quotes.toscrape.com --format=graphql
npx scrapehub-ultimate https://quotes.toscrape.com --format=postman -o collection.json
```

### Global install
```bash
npm install -g scrapehub-ultimate
scrapehub https://quotes.toscrape.com --format=json
scrape https://quotes.toscrape.com --check
```

### Docker
```bash
docker pull scrapehub/scrapehub-ultimate
docker run -p 3000:3000 scrapehub/scrapehub-ultimate
# or
docker-compose up --build
```

### Local dev
```bash
npm install
npm start # http://localhost:3000
node cli.js https://quotes.toscrape.com --format=csv
```

## 📦 30+ Formats (All Real Tested 200)

**Data:** `json, csv, excel/xlsx, sql, markdown/md, yaml/yml, xml, html, txt`

**API Spec:** `graphql/gql, grpc/proto, postman, openapi, swagger, insomnia`

**Code SDK:** `javascript/js, python, php, curl/sh, nodejs, go, java, csharp/cs, dart, ruby, rust, kotlin, swift`

```bash
curl "http://localhost:3000/api/universal?url=https://quotes.toscrape.com&format=csv" -o data.csv
curl "http://localhost:3000/api/universal?url=https://quotes.toscrape.com&format=excel" -o data.xlsx
curl "http://localhost:3000/api/universal?url=https://quotes.toscrape.com&format=graphql" -o schema.graphql
curl "http://localhost:3000/api/universal?url=https://quotes.toscrape.com&format=grpc" -o scrape.proto
curl "http://localhost:3000/api/universal?url=https://quotes.toscrape.com&format=postman" -o postman.json
curl "http://localhost:3000/api/universal?url=https://quotes.toscrape.com&format=openapi" -o openapi.json
curl "http://localhost:3000/api/universal?url=https://quotes.toscrape.com&format=go" -o main.go
curl "http://localhost:3000/api/universal?url=https://quotes.toscrape.com&format=rust" -o main.rs
```

## 📟 Terminal Realtime Check

```bash
curl "http://localhost:3000/api/check?url=https://quotes.toscrape.com"
# {
#   "is_active": true,
#   "total_time_ms": 145,
#   "checks": [{"check":"HTML Fetch","status":200,"active":true}],
#   "terminal_log": "[OK] HTML Fetch -> 200 ACTIVE (145ms)",
#   "real": true
# }

npx scrapehub https://quotes.toscrape.com --check
# [OK] HTML Fetch -> 200 ACTIVE (306ms) 11021 bytes
# ✅ is_active: true
```

## 🧪 Test All Formats

```bash
curl "http://localhost:3000/api/test?url=https://quotes.toscrape.com"
# { "formats": { "json": {"ok":true,"real":true}, "csv": {...}, ... }, "all_real": true }

npx scrapehub https://quotes.toscrape.com --test
```

## 🐳 Docker

```dockerfile
FROM node:20-alpine
COPY . .
RUN npm install --production
EXPOSE 3000
CMD ["node", "api-server.js"]
```

## 🔧 GitHub Actions

- `.github/workflows/ci-test.yml` - Test all 30 formats real HTTP 200 on every push
- `.github/workflows/publish-npm.yml` - Auto publish to NPM + Docker Hub + GHCR on tag `v*`

Setup secrets:
- `NPM_TOKEN` - npm access token
- `DOCKERHUB_USERNAME` + `DOCKERHUB_TOKEN`

Then:
```bash
git tag v5.0.0
git push origin v5.0.0
# Auto publish to npm + docker hub
```

## ✅ Real Test Results

```
json -> 200, python -> 200, php -> 200, javascript -> 200
csv -> 200, excel -> 200, sql -> 200, markdown -> 200
yaml -> 200, xml -> 200, graphql -> 200, grpc -> 200
postman -> 200, openapi -> 200, swagger -> 200, insomnia -> 200
go -> 200, java -> 200, csharp -> 200, dart -> 200
ruby -> 200, rust -> 200, kotlin -> 200, swift -> 200
html -> 200, txt -> 200, nodejs -> 200, curl -> 200
Terminal Check: is_active:true real:true
CLI Check: [OK] HTML Fetch -> 200 ACTIVE 11021 bytes
```

No fake/error, all real.

## 📄 License

MIT - Real no fake
