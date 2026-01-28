# ✅ Environment-Based URL Setup - Complete Verification Checklist

## Files Created/Modified

### ✅ Created Files

- [ ] **`frontend/src/config.ts`** - Single source of truth
  - [ ] Contains `getBaseURL()` function
  - [ ] Checks `import.meta.env.DEV`
  - [ ] Returns localhost for dev, uses env var for prod
  - [ ] Exports `BASE_API_URL` and `API_CONFIG`

- [ ] **`frontend/.env.production`** - Production environment
  - [ ] Contains `VITE_API_BASE_URL=https://auditpay-backend.onrender.com`

- [ ] **`frontend/.env.local.example`** - Team reference template
  - [ ] Shows correct format for local development

- [ ] **`ENV_SETUP_GUIDE.md`** - Full documentation
- [ ] **`SETUP_SUMMARY.md`** - Quick reference
- [ ] **`ARCHITECTURE.md`** - Visual diagrams

### ✅ Modified Files

- [ ] **`frontend/src/api/axios.ts`**
  - [ ] Removed hardcoded URL `"https://auditpay-backend.onrender.com"`
  - [ ] Added import from `../config`
  - [ ] Uses `BASE_API_URL` in axios.create()
  - [ ] Uses `API_CONFIG.TIMEOUT` instead of magic number

- [ ] **`backend/app/main.py`**
  - [ ] Added `import os`
  - [ ] Changed to dynamic `ALLOWED_ORIGINS` list
  - [ ] Adds `RENDER_EXTERNAL_URL` if available
  - [ ] Passes `ALLOWED_ORIGINS` to CORSMiddleware

- [ ] **`frontend/.env`** (already correct)
  - [ ] Contains `VITE_API_BASE_URL=http://localhost:8000`

## Files NOT Modified (Should Remain Unchanged)

- [ ] `frontend/src/api/auth.ts` - Uses api from axios.ts ✅
- [ ] `frontend/src/api/transactions.ts` - Uses api from axios.ts ✅
- [ ] `frontend/vercel.json` - Already correct for SPA ✅
- [ ] All component files - No hardcoded URLs ✅

## Verification Steps

### 1. Local Development Test
```bash
# Terminal 1: Backend
cd backend
uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev

# Browser: http://localhost:5173
# DevTools Network tab: All API calls should go to http://localhost:8000
✅ Verify: Base URL = http://localhost:8000
✅ Verify: No CORS errors
✅ Verify: Login/Transfer work
```

### 2. Production Build Test
```bash
cd frontend
npm run build

# Verify build output
✅ Check: dist/ folder created
✅ Check: No hardcoded "https://auditpay-backend" in dist/
✅ Check: API URL is configurable via .env.production

npm run preview
# Browser: http://localhost:4173
# DevTools Network tab: Check API base URL
```

### 3. Code Inspection

- [ ] **config.ts** exists and is correct
  ```bash
  grep -n "import.meta.env.DEV" frontend/src/config.ts
  # Should show the DEV check
  ```

- [ ] **axios.ts** uses config
  ```bash
  grep -n "BASE_API_URL" frontend/src/api/axios.ts
  # Should show it's imported and used
  ```

- [ ] **No hardcoded URLs remain**
  ```bash
  grep -r "auditpay-backend.onrender.com" frontend/src/
  # Should return NOTHING (except .env.production)
  ```

- [ ] **No hardcoded localhost URLs**
  ```bash
  grep -r "localhost:8000" frontend/src/
  # Should return NOTHING (except config.ts and .env)
  ```

## Environment Variable Values

### Local Development (`.env`)
```
VITE_API_BASE_URL=http://localhost:8000
```
✅ Used when: `npm run dev`

### Production (`.env.production`)
```
VITE_API_BASE_URL=https://auditpay-backend.onrender.com
```
✅ Used when: `npm run build` (Vercel will apply this)

## How to Verify Environment is Being Used

### In Browser DevTools (Local Dev)
```
1. Open Chrome DevTools
2. Go to Sources → config.ts
3. Check BASE_API_URL value → should be "http://localhost:8000"
4. Go to Network tab
5. Make any API request
6. Check Request URL → should start with http://localhost:8000
```

### In Browser DevTools (Production)
```
1. Build project: npm run build
2. Preview: npm run preview
3. Open Chrome DevTools
4. Go to Network tab
5. Make any API request
6. Check Request URL → should start with https://auditpay-backend.onrender.com
```

## Backend CORS Verification

### Check allowed origins in main.py
```bash
grep -A 10 "ALLOWED_ORIGINS = " backend/app/main.py
```

Should contain:
```
- "http://localhost:5173"    # Local Vite
- "http://localhost:3000"    # Alt local
- "https://real-time-transaction-audit-log-sys.vercel.app"  # Vercel
```

### Test CORS locally
```bash
# When backend is running on localhost:8000
# And frontend on localhost:5173
# No CORS errors should appear in console
```

## Deployment Checklist

### Before Deploying to Vercel
- [ ] `.env.production` exists
- [ ] `VITE_API_BASE_URL=https://auditpay-backend.onrender.com` in it
- [ ] No hardcoded URLs in component code
- [ ] `npm run build` succeeds
- [ ] Local preview works and calls correct backend

### Before Deploying Backend to Render
- [ ] CORS middleware updated with dynamic origins
- [ ] Production frontend URL in allowed origins
- [ ] Environment variables properly configured
- [ ] Test CORS with actual Vercel domain if possible

### Post-Deployment
- [ ] Open deployed Vercel app
- [ ] Login/register works
- [ ] DevTools Network tab shows requests going to Render
- [ ] No CORS errors in console
- [ ] Transfer/transaction features work

## Troubleshooting

### API calls still go to Render in local dev
**Problem**: `import.meta.env.DEV` not working  
**Solution**: 
- Check if running `npm run dev` (not `npm start`)
- Check if using Vite config properly
- Clear browser cache

### CORS error when calling backend
**Problem**: "Access to XMLHttpRequest blocked by CORS policy"  
**Solution**:
- Check backend CORS origins includes frontend domain
- Check backend is responding with correct CORS headers
- Verify frontend URL exactly matches allowed origin

### API calls still hardcoded to old URL
**Problem**: Components directly importing axios with hardcoded URL  
**Solution**:
- Search codebase: `grep -r "localhost:8000" src/`
- Search codebase: `grep -r "onrender.com" src/`
- Remove any hardcoded URLs, use config.ts instead

## Success Criteria ✅

- [ ] Local dev: API calls to localhost:8000
- [ ] Production: API calls to Render backend
- [ ] No hardcoded URLs in code (only config.ts and .env files)
- [ ] CORS working for both environments
- [ ] Zero manual changes needed when switching environments
- [ ] Build pipeline automatic (Vercel uses .env.production)

---

**Status**: ✅ Ready for Production Deployment
