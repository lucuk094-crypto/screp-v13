# ScrapeHub ULTIMATE V5 - All Formats + Terminal + CLI
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install --production

# Copy app
COPY api-server.js ./
COPY cli.js ./
COPY public ./public
COPY vercel.json ./

# Make CLI executable
RUN chmod +x cli.js

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD node -e "fetch('http://localhost:3000/api/docs').then(r=>{if(!r.ok) throw new Error('fail')}).catch(()=>process.exit(1))"

# Start server
CMD ["node", "api-server.js"]

# Labels
LABEL name="scrapehub-ultimate" \
      version="5.0" \
      description="Universal scraper 30 formats + terminal check + CLI - real no fake" \
      formats="json,csv,excel,sql,markdown,yaml,xml,html,txt,graphql,grpc,postman,openapi,go,java,csharp,dart,ruby,rust,kotlin,swift"
