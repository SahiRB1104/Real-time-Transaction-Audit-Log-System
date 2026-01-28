# Architecture Diagram: Environment-Based URL Resolution

## Current Setup

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  src/config.ts (Single Source of Truth)                       │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ if (import.meta.env.DEV)                              │   │
│  │   return "http://localhost:8000"                      │   │
│  │ else                                                   │   │
│  │   return process.env.VITE_API_BASE_URL               │   │
│  └────────────────────────────────────────────────────────┘   │
│           ↓                                    ↓                 │
│     (Local Dev)                       (Production Build)       │
│           ↓                                    ↓                 │
│  ┌─────────────────────┐         ┌──────────────────────┐     │
│  │    .env             │         │  .env.production     │     │
│  │  ─────────────────  │         │  ──────────────────  │     │
│  │ VITE_API_BASE_URL=  │         │ VITE_API_BASE_URL=   │     │
│  │ localhost:8000      │         │ Render URL           │     │
│  └─────────────────────┘         └──────────────────────┘     │
│           ↓                                    ↓                 │
│  src/api/axios.ts (Uses BASE_API_URL)                         │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ axios.create({                                         │   │
│  │   baseURL: BASE_API_URL  ← Dynamic!                    │   │
│  │ })                                                      │   │
│  └────────────────────────────────────────────────────────┘   │
│           ↓                                    ↓                 │
└───────────┼────────────────────────────────────┼───────────────┘
            │                                    │
            ↓                                    ↓
┌─────────────────────────┐      ┌──────────────────────────┐
│    LOCAL BACKEND        │      │   RENDER BACKEND         │
│   localhost:8000        │      │  auditpay-backend.       │
│   (Development)         │      │   onrender.com           │
│                         │      │  (Production)            │
│   CORS allows:          │      │                          │
│  • localhost:5173       │      │   CORS allows:           │
│  • localhost:3000       │      │  • vercel.app domain     │
│                         │      │  • render.com URLs       │
└─────────────────────────┘      └──────────────────────────┘
```

## Data Flow: API Request

```
┌──────────────────────────────────────────────────────┐
│  User clicks "Transfer" on React component           │
└──────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────┐
│  transferFunds(data) in src/api/transactions.ts      │
└──────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────┐
│  api.post('/transfer', data)                         │
│  axios instance from src/api/axios.ts                │
└──────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────┐
│  Check BASE_API_URL from config.ts                   │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │ if DEV → http://localhost:8000/transfer       │  │
│  │ if PROD → https://auditpay-backend.../transfer│  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────┐
│  Backend receives request at appropriate URL          │
│  Backend CORS middleware validates request origin     │
│  Response sent back with correct data                 │
└──────────────────────────────────────────────────────┘
```

## Environment Variable Resolution Timeline

```
┌─────────────────────────────────────────────────────┐
│  Stage 1: npm run dev                               │
├─────────────────────────────────────────────────────┤
│  • Vite dev server starts                           │
│  • import.meta.env.DEV = TRUE                       │
│  • Reads .env (local)                               │
│  • VITE_API_BASE_URL = "http://localhost:8000"      │
│  • config.ts returns localhost URL                  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Stage 2: npm run build                             │
├─────────────────────────────────────────────────────┤
│  • Build script runs (vite build)                   │
│  • import.meta.env.DEV = FALSE                      │
│  • Reads .env.production                            │
│  • VITE_API_BASE_URL = "https://auditpay-backend"   │
│  • config.ts returns Render URL                     │
│  • URL embedded in compiled JS                      │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Stage 3: Deploy to Vercel                          │
├─────────────────────────────────────────────────────┤
│  • Vercel detects .env.production                   │
│  • Uses that for production build                   │
│  • Frontend served from vercel.app domain            │
│  • All API calls go to Render backend               │
│  • CORS validation passes ✅                         │
└─────────────────────────────────────────────────────┘
```

## Files & Their Responsibilities

```
Frontend
├── src/config.ts ⭐ SINGLE SOURCE OF TRUTH
│   ├── Detects environment (dev vs prod)
│   ├── Reads environment variables
│   └── Exports BASE_API_URL
│
├── src/api/axios.ts
│   ├── Imports BASE_API_URL from config
│   ├── Creates axios instance with dynamic URL
│   └── Handles auth & error interceptors
│
├── src/api/auth.ts
│   ├── Uses api from axios.ts
│   └── No hardcoded URLs ✅
│
├── src/api/transactions.ts
│   ├── Uses api from axios.ts
│   └── No hardcoded URLs ✅
│
├── .env (Development)
│   └── VITE_API_BASE_URL=http://localhost:8000
│
└── .env.production (Vercel Deployment)
    └── VITE_API_BASE_URL=https://auditpay-backend.onrender.com

Backend
└── app/main.py
    ├── Dynamic CORS configuration
    ├── Allows localhost:5173 (dev)
    ├── Allows vercel.app domain (prod)
    └── Supports Render env vars
```

## Key Improvements

✅ **Before**: Hardcoded URL in axios.ts  
✅ **After**: Dynamic config-based approach  

✅ **Before**: Manual URL changes needed for deployment  
✅ **After**: Automatic environment switching  

✅ **Before**: Risk of pushing prod URLs to dev code  
✅ **After**: URLs in .env files, never in code  

✅ **Before**: Limited to one backend URL  
✅ **After**: Supports unlimited environments  

---

## Testing

### Local Development (http://localhost:5173)
```bash
npm run dev
→ API calls go to http://localhost:8000 ✅
→ Backend CORS allows localhost:5173 ✅
```

### Production (https://vercel.app)
```bash
npm run build && npm run preview
→ API calls go to https://auditpay-backend.onrender.com ✅
→ Backend CORS allows vercel.app domain ✅
```
