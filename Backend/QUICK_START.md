## 🚀 QUICK START - PowerShell Commands

### 1. Create MySQL Database

**Option A: MySQL Command (if MySQL is in PATH)**
```powershell
mysql -u root -pAtharv@24Nov -e "CREATE DATABASE field_harmony_hub;"
```

**Option B: Full MySQL Path (Common on Windows)**
```powershell
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql" -u root -pAtharv@24Nov -e "CREATE DATABASE field_harmony_hub;"
```

**Option C: Using MySQL Workbench or Command Line Client**
1. Open MySQL Workbench or Command Line Client
2. Connect with username: `root` and password: `Atharv@24Nov`
3. Run query:
```sql
CREATE DATABASE field_harmony_hub;
```

**Option D: Interactive MySQL Shell**
```powershell
mysql -u root -p
# Enter password: Atharv@24Nov
# Then type: CREATE DATABASE field_harmony_hub;
```

### 2. Install & Setup
```powershell
cd Backend
npm install
npm run db:setup
npm run db:seed
```

### 3. Start Server
```powershell
npm run dev
```

Server: **http://localhost:3000**

### 📝 Test Credentials
- Admin: `admin@ngo.com` / `admin123`
- Manager: `john.manager@ngo.com` / `manager123`
- Worker: `worker1@ngo.com` / `worker123`

### 📚 Login Endpoint
```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@ngo.com",
  "password": "admin123"
}
```

Response includes JWT token - use in all other requests:
```
Authorization: Bearer <token>
```
