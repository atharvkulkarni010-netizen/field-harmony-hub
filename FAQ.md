# FAQ - Field Harmony Hub Full Stack Integration

## Setup & Installation

### Q: Do I need to install packages again?
**A:** 
- **First time:** Yes, run `npm install` in both Backend and root folders
- **Subsequent runs:** No, just run `npm run dev` in both

### Q: MySQL connection failing. What do I do?
**A:** 
1. Check MySQL server is running: `mysql -u root -p` and enter password
2. Verify database exists: `SHOW DATABASES;`
3. Check credentials in `Backend/config/database.js`
4. Make sure database name is `field_harmony_hub`

### Q: "Port 3000 is already in use" error
**A:** 
- Kill the process using port 3000
- Or change PORT in `Backend/.env` to 3001
- Then update `.env` frontend `VITE_API_URL=http://localhost:3001`

### Q: "Port 5173 is already in use" error
**A:** 
- Kill the process using port 5173
- Or it will auto-increment to 5174
- Check console for actual port being used

---

## Authentication

### Q: How do I login?
**A:** 
1. You need users in the database first
2. Frontend sends `POST /api/auth/login` with email & password
3. Backend verifies credentials and returns JWT token
4. Frontend stores token and redirects to dashboard

### Q: How do I create users for testing?
**A:** 
**Option 1: Direct SQL**
```sql
INSERT INTO user (name, email, password, role) VALUES
('Admin', 'admin@test.com', 'plain_password_hash', 'ADMIN');
```

**Option 2: Using API (requires existing admin)**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Authorization: Bearer {admin_token}" \
  -d '{"name":"User","email":"test@test.com","password":"123","role":"WORKER"}'
```

### Q: How long does login token last?
**A:** 
- Stored in `sessionStorage` (cleared when browser closes)
- Token expiration configured in backend (default: 7 days via JWT_EXPIRE)
- If 401 error: token expired, must login again

### Q: Can I logout?
**A:** 
Yes, logout button (when implemented) clears sessionStorage and redirects to login

---

## Frontend Features

### Q: Why is attendance check-in not working?
**A:** 
- [ ] Did you grant location permission? (Check browser prompt)
- [ ] Is GPS enabled on your device?
- [ ] Are you on localhost (HTTP works) or HTTPS?
- [ ] Check F12 Console for geolocation errors

### Q: Images in daily report not uploading?
**A:** 
- Max 5 images per report
- Images converted to base64 (sent as JSON)
- Check image file size (too large might fail)
- Check browser console for errors

### Q: Why is leave history empty?
**A:** 
- [ ] Are you logged in with correct user_id?
- [ ] Have you submitted any leave requests?
- [ ] Check backend logs: `GET /api/leaves` being called?
- [ ] Check Network tab (F12) to see API response

### Q: Tasks not showing in report submission?
**A:** 
- [ ] Do you have task assignments in database?
- [ ] Are you logged in as a worker?
- [ ] Check: `GET /api/task-assignments?worker_id={id}`
- [ ] Verify task_assignment table has records for your user_id

### Q: How do I see API calls being made?
**A:** 
Open F12 → Network tab → Filter: "fetch/xhr" → Perform action → See requests/responses

---

## Backend & Database

### Q: How do I verify database is set up correctly?
**A:** 
```bash
mysql -u root -p
USE field_harmony_hub;
SHOW TABLES;  # Should show 9 tables
```

### Q: Can I see what SQL queries are running?
**A:** 
- Backend terminal shows some logging
- Enable MySQL query logging (complicated, not recommended)
- Check Network tab to see what endpoint was called

### Q: Can I modify the database schema?
**A:** 
Not recommended after initial setup. If needed:
1. Back up database
2. Stop backend
3. Run migrations
4. Restart backend

### Q: How do I clear/reset the database?
**A:** 
```sql
-- DROP all tables
DROP TABLE IF EXISTS manager_project_report;
DROP TABLE IF EXISTS report_task;
DROP TABLE IF EXISTS daily_report;
DROP TABLE IF EXISTS leave_request;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS task_assignment;
DROP TABLE IF EXISTS task;
DROP TABLE IF EXISTS project;
DROP TABLE IF EXISTS user;

-- Then run backend setup
npm run db:setup
```

### Q: How do I add more sample data?
**A:** 
Edit `Backend/scripts/seedDatabase.js` and run:
```bash
npm run db:seed
```

---

## API Endpoints

### Q: What endpoints are available?
**A:** See `INTEGRATION_GUIDE.md` for complete API documentation

### Q: How do I make custom API calls?
**A:** 
Edit `src/services/api.ts` and add new endpoint:
```typescript
export const customApi = {
  getData: () => api.get('/api/custom'),
  postData: (data: any) => api.post('/api/custom', data),
};
```

Then use in component:
```typescript
import { customApi } from '@/services/api';
const response = await customApi.getData();
```

### Q: Why am I getting 401 errors?
**A:** 
- Token missing from Authorization header
- Token expired (requires re-login)
- Backend token validation failed
- Check Network tab to see Authorization header

### Q: Why am I getting 403 errors?
**A:** 
- User role doesn't have permission
- Manager trying to access admin endpoint
- Worker trying to access manager features
- Check `middleware/auth.js` for role requirements

---

## Troubleshooting

### Q: "Cannot GET /" or blank page
**A:** 
- Frontend not running: `npm run dev`
- Check console (F12) for errors
- Check localhost:5173 in address bar

### Q: Network requests failing
**A:** 
1. Is backend running? (Should see logs)
2. Is backend on port 3000? (Check .env)
3. Are both servers running in different terminals?
4. Check Network tab (F12) for actual error response

### Q: Console shows "Cannot read property 'user_id' of undefined"
**A:** 
- User object not loaded yet
- Add null check: `user?.user_id`
- Wrap in useEffect to ensure user loaded

### Q: Data not persisting after refresh
**A:** 
- Tokens stored in sessionStorage (persistent during session)
- Page refresh = new request with stored token
- If lost: user was logged out, need to login again

### Q: "Cross-Origin Request Blocked"
**A:** 
- Check both servers running (3000 & 5173)
- Check frontend .env has correct API URL
- Backend has CORS enabled, should work automatically
- Try incognito mode if issues persist

### Q: Old data showing after update
**A:** 
- Refresh doesn't re-fetch automatically
- Call API again to get fresh data
- useEffect dependency arrays might be wrong

---

## Performance

### Q: App is slow, what can I do?
**A:** 
- Check Network tab: API calls taking too long?
- Check MySQL connection: is it local or remote?
- Close unnecessary browser tabs
- Check browser RAM usage (F12 → Memory tab)

### Q: Database queries are slow
**A:** 
- Check if indexes needed on frequently searched columns
- Check if too many rows (optimize queries)
- Database on slow network? (Use local MySQL)

### Q: Frontend is laggy
**A:** 
- Check for console errors
- Check Network tab for failed requests
- Check if too many re-renders (React DevTools)
- Disable browser extensions temporarily

---

## Deployment

### Q: How do I deploy to production?
**A:** 
1. **Frontend:** Run `npm run build` → Deploy `dist/` to hosting
2. **Backend:** Deploy to Node.js hosting (Heroku, AWS, etc.)
3. **Database:** Use managed MySQL (RDS, PlanetScale, etc.)
4. **Update URLs:** Change API_URL in .env.production

### Q: Which hosting services work?
**A:** 
- **Frontend:** Vercel, Netlify, AWS S3 + CloudFront
- **Backend:** Heroku, Railway, Render, AWS EC2
- **Database:** AWS RDS, PlanetScale, DigitalOcean

### Q: Do I need HTTPS for production?
**A:** 
- **Yes**, mandatory for production
- Frontend to API: HTTPS required
- Geolocation: HTTPS required
- Most hosting auto-provides free SSL

### Q: How do I use environment variables in production?
**A:** 
- Never hardcode secrets
- Use .env files (git ignored)
- Hosting services allow environment variable configuration
- Backend: JWT_SECRET, DATABASE_URL, PORT
- Frontend: VITE_API_URL only

---

## Development Tips

### Q: How do I debug backend?
**A:** 
- Add `console.log()` statements in route handlers
- Check backend terminal output
- Check MySQL logs if needed
- Use VS Code debugger (advanced)

### Q: How do I debug frontend?
**A:** 
- F12 Console for errors
- F12 Network tab for API calls
- F12 Application tab for localStorage/sessionStorage
- React DevTools extension for component state

### Q: How do I add new pages?
**A:** 
1. Create file: `src/pages/new-page.tsx`
2. Add route in `src/App.tsx` (check routing setup)
3. Create API methods in `src/services/api.ts`
4. Import and use API in component
5. Add to navigation if needed

### Q: How do I add new API endpoints?
**A:** 
1. Create route in `Backend/routes/feature.js`
2. Add to `Backend/server.js` imports
3. Add to `src/services/api.ts`
4. Test with Postman or curl
5. Use in frontend component

---

## Security

### Q: Is my password secure?
**A:** 
- Passwords hashed with bcryptjs before storage
- Never transmitted in plain text
- HTTPS required in production
- Backend validates all requests

### Q: Can I use test data in production?
**A:** 
- No, create proper user accounts
- Use strong passwords
- Don't commit real credentials to git
- Use environment variables for secrets

### Q: How do I secure sensitive endpoints?
**A:** 
- All endpoints require `verifyToken` middleware
- Role-based access with `authorize()` middleware
- Hierarchy check with `checkUserHierarchy()` middleware
- Add more auth checks as needed

---

## General

### Q: What if something breaks?
**A:** 
1. Check the error message carefully
2. Check browser console (F12)
3. Check backend logs
4. Try restarting both servers
5. Check QUICK_START.md and INTEGRATION_GUIDE.md
6. Review the file that's erroring

### Q: Can I modify the database schema?
**A:** 
- Frontend and backend don't depend on specific columns
- You can add columns (won't break existing code)
- Avoid removing/renaming columns
- Test thoroughly before using in production

### Q: How do I contribute to the project?
**A:** 
1. Create feature branch
2. Make changes
3. Test thoroughly
4. Commit with clear messages
5. Push and create pull request
6. Code review and merge

### Q: Where do I report bugs?
**A:** 
- Check existing issues first
- Create detailed bug report with:
  - Steps to reproduce
  - Expected behavior
  - Actual behavior
  - Screenshots/logs
  - System info

---

## More Help

- **QUICK_START.md** - Fast setup guide
- **INTEGRATION_GUIDE.md** - Detailed documentation
- **ARCHITECTURE_DIAGRAM.md** - System architecture
- **Backend/README.md** - Backend-specific docs
- **Browser DevTools** (F12) - Built-in debugging

---

**Last Updated:** January 28, 2026  
**Total Questions:** 50+
