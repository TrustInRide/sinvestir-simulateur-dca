# Simulateur DCA Crypto — S'investir

Simulateur d'investissement progressif (DCA) sur 7 000+ cryptomonnaies, conçu pour s'intégrer nativement dans la suite `simulateurs.sinvestir.fr`. Données historiques multi-années via Coinbase Exchange (source primaire) et CoinGecko (repli) — sans clé API requise pour la démo.

## Demo

🔗 https://simulateur-cyan.vercel.app

## Lancer en local

```bash
git clone https://github.com/TrustInRide/sinvestir-simulateur-dca
npm install
npm run dev   # http://localhost:3000
```

## Variables d'environnement

Copier `.env.example` → `.env.local` et remplir les valeurs souhaitées.

| Variable | Requis | Description |
|---|---|---|
| `COINGECKO_API_KEY` | Non | Clé demo CoinGecko (10k req/mois). Sans clé, le tier public est utilisé. |
| `NEXT_PUBLIC_SITE_URL` | Non | URL de production après premier déploiement Vercel |

## Intégration (embed)

Ajouter `?embedded=true` à l'URL : le header et le footer disparaissent, et la page émet un `postMessage` à chaque redimensionnement pour ajuster automatiquement la hauteur de l'iframe parent.

```html
<iframe
  id="sim"
  src="https://[URL]?embedded=true"
  style="width:100%;border:none;"
></iframe>
<script>
  window.addEventListener('message', (e) => {
    if (e.data?.type === 'simulateur-crypto-resize') {
      document.getElementById('sim').style.height = e.data.height + 'px';
    }
  });
</script>
```

Un fichier de test est disponible dans `public/embed-test.html`.

## Partis pris techniques

- **Next.js 16 App Router** — aligné sur la stack S'investir ; routes API Server Components, `searchParams` async pour le mode embed
- **Double source de prix sans clé** — Coinbase Exchange en priorité (candles EUR journalières multi-années, pagination automatique 300 bougies/page) ; CoinGecko en repli pour les coins sans paire EUR/Coinbase (dernier 365 jours)
- **Proxy serveur** — toutes les requêtes transitent par `/api/coingecko/*` ; aucune clé n'est exposée au navigateur
- **Zéro lib UI** — 6 composants custom (`Button`, `Card`, `Input`, `Select`, `Badge`, `RangeSlider`) qui reproduisent fidèlement le design system S'investir (Lexend, `#1098f7`, `#f8d047`, dark mode, radius 8/12/20 px)
- **Recharts** — seule dépendance runtime ajoutée ; `ComposedChart` avec downsampling ≤ 420 points pour les longues périodes
- **TypeScript strict** — aucun `any` ; moteur DCA (`lib/calculations.ts`) pur et découplé de React, testable indépendamment

## Architecture

```
simulateur/
├── app/
│   ├── layout.tsx                    # Lexend + dark mode + meta
│   ├── page.tsx                      # Mode embedded + header/footer conditionnels
│   └── api/coingecko/
│       ├── search/route.ts           # Proxy recherche : q → liste CoinGecko
│       └── history/route.ts          # Proxy historique : Coinbase primaire → CoinGecko fallback
├── components/
│   ├── ui/                           # Design system (Button, Card, Input, Select, Badge, RangeSlider)
│   ├── CryptoSearch.tsx              # Combobox async debounce 300 ms + chip de sélection
│   ├── SimulatorForm.tsx             # Formulaire + validation + submit
│   ├── ResultsPanel.tsx              # 4 métriques + badges gain/perte + animations CSS
│   ├── PortfolioChart.tsx            # Recharts : courbe valeur + courbe investie + tooltip FR
│   ├── EmbedHeightReporter.tsx       # postMessage height via ResizeObserver (mode embed)
│   ├── Simulator.tsx                 # Orchestrateur état global (form → fetch → calcul → affichage)
│   └── SimulateurCrypto.tsx          # Wrapper exportable (props embedded + defaultCoin)
├── lib/
│   ├── types.ts                      # Interfaces TypeScript (DCAParams, DCAResult, PricePoint…)
│   ├── calculations.ts               # Moteur DCA pur (bucketByDay, cadence, cumul unités)
│   ├── coingecko.ts                  # Client API côté client (search + history)
│   ├── coingecko-server.ts           # Fetcher serveur CoinGecko avec timeout + clé optionnelle
│   ├── coinbase-server.ts            # Fetcher Coinbase Exchange (candles EUR paginées)
│   ├── format.ts                     # Formatage FR (€, %, dates)
│   └── http.ts                       # fetchWithTimeout + isAbortError
├── public/embed-test.html            # Page de test iframe en local
├── .env.example                      # Variables documentées
└── vercel.json                       # Headers X-Frame-Options ALLOWALL + CORS /api/*
```
