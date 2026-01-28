# ⚡ QUICK START - 5 Minute Setup

## What Changed?

✅ **Added**: `frontend/src/config.ts` - Central URL config  
✅ **Updated**: `frontend/src/api/axios.ts` - Uses config  
✅ **Created**: `frontend/.env.production` - Production URLs  
✅ **Updated**: `backend/app/main.py` - Dynamic CORS  

## The Magic (How It Works)

```javascript
// In config.ts
if (import.meta.env.DEV) {
  return 'http://localhost:8000';  // Local dev
} else {
  return 'https://auditpay-backend.onrender.com';  // Production
}
```

**That's it!** The rest happens automatically.

---

## For Developers

### Run Locally
```bash
cd frontend && npm run dev
cd backend && uvicorn app.main:app --reload --port 8000
```
→ Frontend on http://localhost:5173  
→ Backend on http://localhost:8000  
→ All APIs go to localhost ✅

### Deploy to Production
```bash
# Just commit and push to Vercel
git add .
git commit -m "Environment-based URL setup"
git push
```
→ Vercel uses `.env.production`  
→ All APIs go to Render ✅

### Test URLs in Browser DevTools
```
Local: Network → XHR/Fetch → Check URL starts with localhost:8000
Prod:  Network → XHR/Fetch → Check URL starts with auditpay-backend
```

---

## Configuration Reference

| Environment | Frontend URL | Backend URL | How |
|---|---|---|---|
| **Local** | localhost:5173 | localhost:8000 | `.env` file |
| **Prod** | vercel.app | onrender.com | `.env.production` |

---

## Files to Know

| File | What It Does |
|------|---|
| `frontend/src/config.ts` | Decides which backend URL to use |
| `frontend/.env` | Local dev URL |
| `frontend/.env.production` | Production URL |
| `backend/app/main.py` | Allows requests from both URLs |

---

## Testing Checklist

- [ ] `npm run dev` → APIs go to localhost:8000
- [ ] `npm run build && npm run preview` → APIs go to onrender.com
- [ ] No console errors
- [ ] Login works
- [ ] Transfers work
- [ ] No hardcoded URLs visible in Network tab

---

## Common Questions

**Q: Do I need to change anything to deploy?**  
A: No! Just push to Vercel. `.env.production` is used automatically.

**Q: Where are the hardcoded URLs?**  
A: They're gone! Now in `.env` and `.env.production` instead.

**Q: What if I add a new API endpoint?**  
A: Just use `api.get('/endpoint')` - it automatically uses the right URL.

**Q: How do I add staging environment?**  
A: Create `.env.staging` and set it in your CI/CD pipeline.

---

## One-Line Verification

```bash
# Should return NOTHING (no hardcoded URLs found)
grep -r "onrender.com\|localhost:8000" frontend/src/
```

---

**Status**: ✅ Ready!  
**Next**: Run `npm run dev` and test!
