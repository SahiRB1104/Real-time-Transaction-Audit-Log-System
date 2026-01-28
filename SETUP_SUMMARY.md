## QUICK REFERENCE: Environment-Based URL Setup

### ✅ What Changed

**Frontend Files:**
- ✅ Created: `src/config.ts` (single source of truth)
- ✅ Updated: `src/api/axios.ts` (removed hardcoded URL)
- ✅ Updated: `.env` (local dev)
- ✅ Created: `.env.production` (Vercel deploy)
- ✅ Created: `.env.local.example` (team reference)

**Backend Files:**
- ✅ Updated: `app/main.py` (dynamic CORS)

### 🔄 How Environment Switching Works

```
Local: npm run dev
  ↓
  import.meta.env.DEV = true
  ↓
  config.ts returns "http://localhost:8000"
  ↓
  All API calls → localhost

Production: Deployed to Vercel
  ↓
  import.meta.env.DEV = false
  ↓
  config.ts reads .env.production
  ↓
  Returns "https://auditpay-backend.onrender.com"
  ↓
  All API calls → Render
```

### 📝 Environment Files Content

**`.env` (Already exists - use as-is)**
```
VITE_API_BASE_URL=http://localhost:8000
```

**`.env.production` (New - auto-used by Vercel)**
```
VITE_API_BASE_URL=https://auditpay-backend.onrender.com
```

### 🎯 No More Hard-Coded URLs

Before:
```typescript
baseURL: "https://auditpay-backend.onrender.com"  // ❌ Hard-coded
```

After:
```typescript
import { BASE_API_URL } from '../config';
baseURL: BASE_API_URL  // ✅ Dynamic
```

### ✨ Result

✅ Local dev: `http://localhost:8000`  
✅ Vercel prod: `https://auditpay-backend.onrender.com`  
✅ Automatic switching  
✅ Zero manual changes needed  

Ready to deploy!
