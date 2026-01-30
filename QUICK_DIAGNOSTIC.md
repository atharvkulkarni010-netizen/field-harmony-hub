# 🔍 Quick Diagnostic Checklist

## Run This to Test Everything

### 1. Backend Test
```powershell
# Make sure you're in the Backend folder
cd Backend

# Check if MySQL is running
# You should be able to connect to the database

# Start backend
npm start

# You should see:
# ✅ "Database connected successfully"
# ✅ "Server running on port 3000"
```

### 2. Frontend Test
```powershell
# In root folder (field-harmony-hub)
npm run dev

# You should see:
# ✅ "VITE v7.x.x  ready in xxx ms"
# ✅ "➜  Local:   http://localhost:5173/"
```

### 3. Browser Test
1. Go to: `http://localhost:5173`
2. **You should see**: Login page (NOT blank screen)
3. **Try demo login** with one of these:
   - Email: `admin@example.com` | Password: `admin123`
   - Email: `manager@example.com` | Password: `manager123`
   - Email: `worker@example.com` | Password: `worker123`

### 4. If Blank Screen Appears
Open DevTools (F12) and check:

**Console Tab** - Look for RED ERRORS:
```
Click F12 → Console tab → Take screenshot of any red errors
```

**Network Tab** - Look for RED/FAILED requests:
```
Click F12 → Network tab → Refresh page → Take screenshot
```

**Application Tab** - Check sessionStorage:
```
Click F12 → Application → SessionStorage 
Should have: auth_token and auth_user
If empty, you're not logged in or login failed
```

---

## Most Common Causes of Blank Screen

| Symptom | Cause | Fix |
|---------|-------|-----|
| Blank white page | JavaScript error | Check console (F12) |
| Page loads but shows "Loading..." | API not responding | Check backend is running |
| Redirects to /login | Invalid JWT token | Log out and log in again |
| 404 errors in Network tab | Wrong API URL | Check `api.ts` has correct API_BASE_URL |
| CORS errors | Backend CORS not configured | Restart backend |

---

## Files That Were Just Fixed

1. **src/App.tsx**
   - Changed route allowedRoles from `['admin']` to `['ADMIN']`
   - Changed route allowedRoles from `['manager']` to `['MANAGER']`
   - Changed route allowedRoles from `['worker']` to `['WORKER']`

2. **src/pages/Index.tsx**
   - Changed roleRedirects keys to uppercase

3. **vite.config.ts**
   - Changed port from 8080 to 5173

---

## Next Steps

1. ✅ Close and reopen browser completely
2. ✅ Do hard refresh: Ctrl+Shift+R (or Cmd+Shift+R)
3. ✅ Restart frontend: Stop (Ctrl+C) and run `npm run dev` again
4. ✅ Test login with demo credentials
5. ✅ If still blank, open F12 console and share screenshot of errors

**The fixes should work!** These were critical role name mismatches.
