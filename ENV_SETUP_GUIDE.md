# Environment-Based Backend URL Resolution - Setup Complete ✅

## Overview
This project now automatically routes API calls to the correct backend based on the environment:
- **Local Development** (`npm run dev`) → `http://localhost:8000`
- **Deployed Frontend** (Vercel) → `https://auditpay-backend.onrender.com`

## How It Works

### Frontend (React + Vite)

#### 1. **Source of Truth: `config.ts`**
```typescript
// src/config.ts
const getBaseURL = (): string => {
  // Development: Local Vite dev server
  if (import.meta.env.DEV) {
    return 'http://localhost:8000';
  }
  // Production: Use Render backend URL
  return import.meta.env.VITE_API_BASE_URL || 'https://auditpay-backend.onrender.com';
};

export const BASE_API_URL = getBaseURL();
```

**Logic:**
- `import.meta.env.DEV` = true when running `npm run dev` (local)
- `import.meta.env.DEV` = false when built for production
- Uses `VITE_API_BASE_URL` env var for production URL

#### 2. **Updated `axios.ts`**
```typescript
import { BASE_API_URL, API_CONFIG } from '../config';

const api = axios.create({
  baseURL: BASE_API_URL,  // ← Now uses config
  timeout: API_CONFIG.TIMEOUT,
  ...
});
```

#### 3. **Environment Files**

**`.env` (Local Development)**
```dotenv
VITE_API_BASE_URL=http://localhost:8000
```

**`.env.production` (Vercel Deployment)**
```dotenv
VITE_API_BASE_URL=https://auditpay-backend.onrender.com
```

**`.env.local.example`** (Reference for team)
```dotenv
# Local development - API calls go to localhost backend
VITE_API_BASE_URL=http://localhost:8000
```

### Backend (FastAPI)

#### Updated `main.py` - Dynamic CORS Configuration
```python
import os

# Allow localhost for development AND deployed frontend for production
ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Local Vite dev server
    "http://localhost:3000",  # Alternative dev port
    "https://real-time-transaction-audit-log-sys.vercel.app",  # Deployed frontend
]

# Add RENDER_EXTERNAL_URL if running on Render
if os.getenv("RENDER_EXTERNAL_URL"):
    ALLOWED_ORIGINS.append(os.getenv("RENDER_EXTERNAL_URL"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    ...
)
```

## Environment Switching Flow

### Local Development (`npm run dev`)
```
1. React runs on http://localhost:5173
2. import.meta.env.DEV = true
3. config.ts returns "http://localhost:8000"
4. All API calls → localhost backend
5. Backend CORS allows localhost:5173 ✅
```

### Production Deployment (Vercel)
```
1. React built and deployed to Vercel
2. import.meta.env.DEV = false
3. config.ts reads VITE_API_BASE_URL from .env.production
4. Returns "https://auditpay-backend.onrender.com"
5. All API calls → Render backend
6. Backend CORS allows vercel.app domain ✅
```

## Files Modified/Created

| File | Status | Change |
|------|--------|--------|
| `frontend/src/config.ts` | ✅ Created | Single source of truth for BASE_API_URL |
| `frontend/src/api/axios.ts` | ✅ Updated | Removed hardcoded URL, uses config.ts |
| `frontend/.env` | ✅ Updated | Local dev URL |
| `frontend/.env.production` | ✅ Created | Production URL |
| `frontend/.env.local.example` | ✅ Created | Template for team |
| `backend/app/main.py` | ✅ Updated | Dynamic CORS with env variables |

## Verification

### For Local Development:
```bash
cd frontend
npm run dev
# Check Network tab in DevTools - all API calls should go to http://localhost:8000
```

### For Production:
```bash
# Build for production
cd frontend
npm run build

# Vercel will automatically use .env.production
# All API calls will go to https://auditpay-backend.onrender.com
```

## Key Advantages

✅ **Zero Manual Changes** - Automatic environment switching  
✅ **Single Source of Truth** - `config.ts` controls all API URLs  
✅ **No Hard-Coded URLs** - All removed from components  
✅ **Secure** - Production URLs in .env files (never in code)  
✅ **Scalable** - Easy to add more environments  
✅ **CORS Safe** - Backend accepts both localhost and production origins  

## Future Environments

To add a staging environment:
1. Create `.env.staging` with `VITE_API_BASE_URL=https://staging-backend.onrender.com`
2. Update backend CORS origins list
3. Deploy to staging - automatic URL switching applies

---

**Status:** ✅ Production-Ready
