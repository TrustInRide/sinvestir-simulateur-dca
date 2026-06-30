# Simulateur DCA Crypto — S'investir

Simulateur d'investissement progressif (DCA) sur 7 000+ cryptomonnaies, conçu pour s'intégrer nativement dans la suite `simulateurs.sinvestir.fr`. Données historiques multi-années via Coinbase Exchange (source primaire) et CoinGecko (repli) — sans clé API requise pour la démo.

## Démo

🔗 https://simulateur-cyan.vercel.app

- Version intégrable (sans le shell) : ajouter `?embedded=true`
- Exemple de lien partageable : [`?coin=bitcoin&sym=BTC&name=Bitcoin&amount=100&freq=monthly&from=2021-01-01&to=2026-01-01`](https://simulateur-cyan.vercel.app/?coin=bitcoin&sym=BTC&name=Bitcoin&amount=100&freq=monthly&from=2021-01-01&to=2026-01-01)

## Lancer en local

```bash
git clone https://github.com/TrustInRide/sinvestir-simulateur-dca
npm install
npm run dev   # http://localhost:3000
```

## Variables d'environnement

Copier `.env.example` → `.env.local` (toutes optionnelles).

| Variable | Requis | Description |
|---|---|---|
| `COINGECKO_API_KEY` | Non | Clé démo CoinGecko (relève la limite de débit). Sans clé, le tier public est utilisé. Lue **côté serveur uniquement**. |
| `NEXT_PUBLIC_SITE_URL` | Non | URL de production après le premier déploiement Vercel. |

## Fonctionnalités

- **Recherche** parmi 7 000+ cryptomonnaies (combobox asynchrone, debounce, navigation clavier).
- **5 métriques** : Capital final · Investi (« X € en N versements ») · Acquis (« X SYMB ») · Prix moyen d'acquisition · Performance (%).
- **2 graphes** : *Historique* (quantité acquise sur l'axe gauche, Valeur & Investi en € sur l'axe droit) et *Gains / Pertes* (Valeur, Investi et plus/moins-value).
- **Onglet Calendrier** : tableau détaillé de chaque versement (date, prix unitaire, montant, unités, cumul, valeur).
- **Cadences** : en une fois, par jour, par semaine, par mois.
- **Lien partageable** : chaque résultat s'encode dans l'URL et se rouvre à l'identique (voir ci-dessous).
- **Intégrable** : `?embedded=true` masque le shell et la page ajuste seule la hauteur de l'iframe.

## Intégration (embed)

Ajouter `?embedded=true` à l'URL : le shell (sidebar, en-tête, pied de page) disparaît, et la page émet un `postMessage` à chaque redimensionnement pour ajuster automatiquement la hauteur de l'iframe parent.

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

## Lien partageable

Le bouton **« Partager mes résultats »** copie une URL qui encode toute la simulation
(`?coin=&sym=&name=&amount=&freq=&from=&to=`). À l'ouverture, le formulaire est restauré et
le calcul relancé automatiquement — utile pour partager un scénario ou pré-remplir un embed.

## Partis pris techniques

- **Next.js 16 App Router** — aligné sur la stack S'investir ; routes API, Server Components, `searchParams` async (mode embed + restauration de lien).
- **Double source de prix sans clé** — Coinbase Exchange en priorité (candles EUR journalières multi-années, pagination 300 bougies/page) ; CoinGecko en repli (365 derniers jours) pour les coins sans paire EUR/Coinbase.
- **Proxy serveur** — toutes les requêtes transitent par `/api/coingecko/*` ; aucune clé n'est exposée au navigateur.
- **Zéro lib UI** — composants custom (`Button`, `Card`, `Input`, `Select`, `Badge`, `RangeSlider`, `FieldLabel`) reproduisant le design system S'investir (Lexend, `#1098f7`, `#f8d047`, dark mode, radius 8/12/20 px).
- **Recharts** — seule dépendance runtime ajoutée ; `ComposedChart` avec downsampling ≤ 420 points pour les longues périodes.
- **TypeScript strict** — aucun `any` ; moteur DCA (`lib/calculations.ts`) pur, découplé de React et testable seul.

## Architecture

```
simulateur/
├── app/
│   ├── layout.tsx                    # Lexend + dark mode + meta
│   ├── page.tsx                      # Shell + mode embed + restauration du lien partagé
│   └── api/coingecko/
│       ├── search/route.ts           # Proxy recherche : q → liste CoinGecko
│       └── history/route.ts          # Proxy historique : Coinbase primaire → CoinGecko repli
├── components/
│   ├── ui/                           # Design system (Button, Card, Input, Select, Badge, RangeSlider, FieldLabel)
│   ├── Simulator.tsx                 # Orchestrateur (form → fetch → calcul → résultats) + partage
│   ├── SimulateurCrypto.tsx          # Wrapper exportable / embeddable
│   ├── SimulatorForm.tsx             # Formulaire + validation
│   ├── CryptoSearch.tsx              # Combobox async (debounce 300 ms, clavier, chip)
│   ├── ResultsPanel.tsx              # 5 métriques + barre de proportion + récit
│   ├── ChartSection.tsx              # Onglets « Graphiques » / « Calendrier »
│   ├── HistoriqueChart.tsx           # Acquis (axe gauche) + Valeur & Investi (€)
│   ├── GainsPertesChart.tsx          # Valeur + Investi + Gains/Pertes
│   ├── EmbedHeightReporter.tsx       # postMessage hauteur (mode embed)
│   ├── SimulateursSidebar.tsx        # Rail dashboard repliable
│   ├── FormationCard.tsx             # Carte « Formation offerte »
│   └── SInvestirLogo.tsx             # Logo officiel
├── lib/
│   ├── types.ts                      # Interfaces (DCAParams, DCAResult, ContributionEvent…)
│   ├── calculations.ts               # Moteur DCA pur (+ calendrier des versements)
│   ├── coingecko.ts                  # Client navigateur (proxy)
│   ├── coingecko-server.ts           # Fetcher serveur CoinGecko (clé optionnelle)
│   ├── coinbase-server.ts            # Candles EUR Coinbase (pagination)
│   ├── share.ts                      # Encodage / décodage du lien partageable
│   ├── format.ts                     # Formatage FR (€, %, unités, dates)
│   ├── http.ts                       # fetchWithTimeout + détection d'abort
│   └── utils.ts                      # cn() sans dépendance
├── public/embed-test.html            # Page de test iframe en local
├── .env.example                      # Variables documentées
└── vercel.json                       # Headers X-Frame-Options + CSP + CORS /api/*
```
