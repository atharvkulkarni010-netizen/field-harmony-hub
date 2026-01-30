# 🔧 White Blank Screen - Troubleshooting Guide

## Issues Found & Fixed ✅

### 1. **Role Case Mismatch** (CRITICAL)
**Problem**: Routes expected lowercase roles (`'admin'`, `'manager'`, `'worker'`) but database returns uppercase (`'ADMIN'`, `'MANAGER'`, `'WORKER'`)

**Files Fixed**:
- ✅ `src/App.tsx` - Updated route allowedRoles
- ✅ `src/pages/Index.tsx` - Updated role redirects
- ✅ `src/components/layout/DashboardLayout.tsx` - Already fixed previously

### 2. **Vite Config Port Mismatch**
**Problem**: vite.config.ts was set to port 8080 instead of 5173

**File Fixed**:
- ✅ `vite.config.ts` - Changed port from 8080 to 5173

---

## What to Do Now

### Step 1: Clear Browser Cache
```
Press Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
Clear all browsing data
Close browser completely
```

### Step 2: Restart Frontend
```powershell
# Stop current frontend process (Ctrl+C)
npm run dev
```

### Step 3: Verify Backend is Running
```powershell
# In Backend terminal, make sure it's running:
npm start
# Should see: "Server running on port 3000"
```

### Step 4: Open Browser & Test
```
URL: http://localhost:5173
```

---

## If White Screen Still Appears

### Debug Step 1: Check Browser Console (F12)
Look for any JavaScript errors and report them:
- Ctrl+Shift+J (Chrome/Edge)
- Or right-click → Inspect → Console tab

### Debug Step 2: Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Look for failed requests (RED)
5. Check if API calls are going to `http://localhost:3000`

### Debug Step 3: Verify Backend Connection
```powershell
# Test if backend is running
curl http://localhost:3000/api/auth/login
# Should NOT return "Connection refused"
```

---

## Common Issues & Solutions

### Issue: "Connection refused" on API calls
**Solution**: 
- Make sure backend is running: `npm start` in Backend folder
- Backend should be on port 3000
- Check firewall isn't blocking it

### Issue: Page loads but shows "Loading..."
**Solution**:
- Clear sessionStorage: Go to DevTools → Application → SessionStorage → Delete all
- Refresh page
- Try login again

### Issue: Login works but dashboard is blank
**Solution**:
- Clear browser cache (Ctrl+Shift+Delete)
- Check Network tab for failed API requests
- Look at console (F12) for JavaScript errors

### Issue: Page redirects back to login
**Solution**:
- Your JWT token might be expired
- Log out and log in again
- Check that sessionStorage has `auth_token` and `auth_user`

---

## What Changed in Code

### Before (Broken):
```typescript
// App.tsx
<Route element={<DashboardLayout allowedRoles={['admin']} />}>

// Index.tsx
const roleRedirects = {
  admin: '/admin',      // ❌ Lowercase
  manager: '/manager',
  worker: '/worker',
};

// vite.config.ts
port: 8080,  // ❌ Wrong port
```

### After (Fixed):
```typescript
// App.tsx
<Route element={<DashboardLayout allowedRoles={['ADMIN']} />}>

// Index.tsx
const roleRedirects = {
  ADMIN: '/admin',      // ✅ Uppercase
  MANAGER: '/manager',
  WORKER: '/worker',
};

// vite.config.ts
port: 5173,  // ✅ Correct port
```

---

## Verification Checklist

✅ Fix Case Mismatch in Roles
✅ Fix Vite Port Configuration
✅ Clear Browser Cache
✅ Restart Frontend
✅ Verify Backend Running
✅ Check Console for Errors
✅ Check Network Tab for Failed Requests

---

## If Still Not Working

### Provide These Details:
1. **Console Errors** (F12 → Console tab) - Take a screenshot
2. **Network Failures** (F12 → Network tab) - Take a screenshot
3. **Backend Status** - Is it running without errors?
4. **Browser Used** - Chrome, Edge, Firefox, Safari?

Then I can provide more specific help!

---

## Quick Restart Guide

```powershell
# Terminal 1 - Backend
cd Backend
npm start
# Wait for: "Database connected successfully"
# Wait for: "Server running on port 3000"

# Terminal 2 - Frontend
npm run dev
# Wait for: "➜  Local:   http://localhost:5173/"

# Browser
http://localhost:5173
# Try login with credentials
```

**Expected Flow**:
1. Shows login page
2. Enter credentials
3. Click login
4. Redirects to /admin, /manager, or /worker
5. Dashboard loads with real data

If it still shows blank screen, the issue is in those 3 steps. Let me know where it gets stuck!
