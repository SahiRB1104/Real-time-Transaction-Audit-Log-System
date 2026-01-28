# Copy-Paste Ready Code Reference

## File 1: `frontend/src/config.ts` (NEW)

```typescript
/**
 * Environment-based API configuration
 * Automatically resolves to localhost (dev) or Render backend (production)
 */

const getBaseURL = (): string => {
  // Development: Local Vite dev server (http://localhost:5173)
  if (import.meta.env.DEV) {
    return 'http://localhost:8000';
  }

  // Production: Use Render backend URL
  // This is set in .env.production or via Vercel environment variables
  return import.meta.env.VITE_API_BASE_URL || 'https://auditpay-backend.onrender.com';
};

export const BASE_API_URL = getBaseURL();

export const API_CONFIG = {
  BASE_URL: BASE_API_URL,
  TIMEOUT: 60000, // 60 seconds (for Render cold starts)
};
```

---

## File 2: `frontend/src/api/axios.ts` (UPDATED)

```typescript
/// <reference types="vite/client" />
import axios from 'axios';
import { BASE_API_URL, API_CONFIG } from '../config';

const api = axios.create({
  baseURL: BASE_API_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

/**
 * Request Interceptor
 * Automatically attaches JWT token to every request
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor (Improvement)
 * Auto logout on token expiry / unauthorized access
 * Handle network errors better
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');

      // HashRouter safe redirect
      window.location.href = '/#/login';
    } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error('Request timeout - backend might be waking up (Render cold start)');
      error.userMessage = 'Server is starting up (this may take 30-60 seconds on first request). Please try again.';
    } else if (!error.response) {
      console.error('Network error:', error);
      error.userMessage = 'Unable to connect to server. Please check your internet connection.';
    }
    return Promise.reject(error);
  }
);

/**
 * Token helper
 * Used during login/logout
 */
export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('access_token', token);
  } else {
    localStorage.removeItem('access_token');
  }
};

export default api;
```

---

## File 3: `frontend/.env` (UPDATED)

```dotenv
VITE_API_BASE_URL=http://localhost:8000
```

---

## File 4: `frontend/.env.production` (NEW)

```dotenv
VITE_API_BASE_URL=https://auditpay-backend.onrender.com
```

---

## File 5: `frontend/.env.local.example` (NEW)

```dotenv
# Local development - API calls go to localhost backend
VITE_API_BASE_URL=http://localhost:8000
```

---

## File 6: `backend/app/main.py` (UPDATED - Just the imports and CORS section)

```python
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from decimal import Decimal
import os  # ← ADD THIS

from .database import engine, get_db
from . import models, schemas
from .auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    get_current_user_fast,
)
from .models import Transaction

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Real-time Transaction & Audit Log System")

# ✅ CORS - Environment-based configuration
# Allow localhost for development AND deployed frontend for production
ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Local Vite dev server
    "http://localhost:3000",  # Alternative dev port
    "https://real-time-transaction-audit-log-sys.vercel.app",  # Deployed frontend
]

# Add RENDER_EXTERNAL_URL if running on Render (for self-requests during deployment)
if os.getenv("RENDER_EXTERNAL_URL"):
    ALLOWED_ORIGINS.append(os.getenv("RENDER_EXTERNAL_URL"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rest of your code continues...
```

---

## Quick Implementation Guide

### Step 1: Create config.ts
Copy the code from "File 1" above into `frontend/src/config.ts`

### Step 2: Update axios.ts
Replace the entire `frontend/src/api/axios.ts` with "File 2" above

### Step 3: Update/Create .env files
- Update `frontend/.env` with "File 3"
- Create `frontend/.env.production` with "File 4"
- Create `frontend/.env.local.example` with "File 5"

### Step 4: Update backend main.py
Add `import os` at the top and replace the CORS section with "File 6"

### Step 5: Test locally
```bash
npm run dev
# Check Network tab - API calls should go to http://localhost:8000
```

### Step 6: Test production build
```bash
npm run build
npm run preview
# Check Network tab - API calls should go to https://auditpay-backend.onrender.com
```

---

## Component Code (No Changes Needed)

Your components like `src/pages/Login.tsx` don't need any changes:

```typescript
// ✅ This still works as-is!
// No hardcoded URLs needed

import { loginUser } from '../api/auth';

const handleLogin = async () => {
  const response = await loginUser({ email, password });
  // axios with BASE_API_URL handles the rest automatically
};
```

The same applies to all other components using the API.

---

## Environment Variable Reference

| Variable | Dev Value | Prod Value | Usage |
|----------|-----------|------------|-------|
| `import.meta.env.DEV` | `true` | `false` | In config.ts to detect environment |
| `VITE_API_BASE_URL` | `http://localhost:8000` | `https://auditpay-backend.onrender.com` | Base URL for all API calls |
| `import.meta.env.VITE_API_BASE_URL` | Read from .env | Read from .env.production | Accessed in config.ts |

---

## Validation Commands

```bash
# Check if config.ts exists and is valid
ls -la frontend/src/config.ts

# Check if .env.production exists
ls -la frontend/.env.production

# Verify no hardcoded URLs in source code
grep -r "auditpay-backend.onrender.com" frontend/src/
# Should return: (nothing or only config.ts imports)

grep -r "localhost:8000" frontend/src/
# Should return: (nothing or only config.ts)

# Verify backend has dynamic CORS
grep -n "import os" backend/app/main.py
grep -n "ALLOWED_ORIGINS" backend/app/main.py
```

---

## Next Steps

1. ✅ Implement all 6 files above
2. ✅ Run `npm run dev` locally and test
3. ✅ Run `npm run build && npm run preview` and test
4. ✅ Deploy to Vercel (will use .env.production automatically)
5. ✅ Test deployed app against Render backend
6. ✅ Monitor console for CORS errors (shouldn't be any)

**Done!** 🎉
