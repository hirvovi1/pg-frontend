#!/bin/bash

# Varmistetaan puhdas pöytä ja käynnistetään Docker-kontit
echo "🔄 Alustetaan Docker-kontit..."
npm run docker:down:ci > /dev/null 2>&1
npm run docker:up:ci > /dev/null 2>&1

# Ajetaan dev-palvelin ja odotetaan, että kaikki palvelut vastaavat
echo "🚀 Käynnistetään palvelimet ja odotetaan yhteyksiä..."
concurrently -k -s first \
  "npm run dev" \
  "wait-on http://localhost:5173 http://localhost:8080/accounts http://localhost:8091/api/v1/frontend/products && \
   echo '✅ Kaikki palvelut valmiina! Ajetaan Playwright-testit...' && \
   npx playwright test --workers=1 && \
   echo '🧹 Testit ajettu, sammutetaan kontit...' && \
   npm run docker:down:ci > /dev/null 2>&1"
