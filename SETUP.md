# AfyaUkweli Setup Guide

Complete setup instructions for running AfyaUkweli locally or in production.

---

## Quick Start (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your Supabase and Hedera credentials

# 3. Run database seed
npm run db:seed

# 4. (Optional) Setup Hedera Topic & Token
npm run setup:hedera

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Detailed Setup

### 1. Prerequisites

**Required**:
- Node.js 18+ and npm
- Supabase account (free tier works)
- Git

**Optional** (for live Hedera integration):
- Hedera Testnet account from [portal.hedera.com](https://portal.hedera.com)

---

### 2. Clone Repository

```bash
git clone <repository-url>
cd afyaukweli
npm install
```

---

### 3. Supabase Configuration

AfyaUkweli uses Supabase for database, authentication, and storage.

#### Option A: Use Existing Project (Pre-configured)

The `.env` file may already contain Supabase credentials. Skip to step 4.

#### Option B: Create New Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

5. Database schema is auto-created via migrations (already applied)

---

### 4. Environment Variables

Create `.env` file in project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your_key_here

# Hedera (Optional for demo)
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.xxxxx
HEDERA_PRIVATE_KEY=302e020100...

# Auto-populated by setup script
HCS_TOPIC_ID=0.0.yyyyy
HTS_TOKEN_ID=0.0.zzzzz

# Application
JWT_SECRET=generate_random_32_char_string_here
NEXT_PUBLIC_HASHSCAN_BASE=https://hashscan.io/testnet
```

#### Generate JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### 5. Hedera Setup (Optional)

**Note**: Hedera integration is optional for demo purposes. The app works with mock data if Hedera credentials are not provided.

#### Get Testnet Account

1. Visit [portal.hedera.com](https://portal.hedera.com)
2. Create a testnet account (free, instant)
3. You'll receive:
   - Account ID (e.g., `0.0.1234567`)
   - Private Key (starts with `302e020100`)

#### Create Topic & Token

Run the setup script:

```bash
npm run setup:hedera
```

This will:
- Create an HCS Topic for task logs
- Create an HTS Token (CHW Points - CHWP)
- Automatically update `.env` with IDs

Expected output:
```
🚀 AfyaUkweli Hedera Setup
==========================

📝 Step 1: Creating HCS Topic for task logs...
✅ HCS Topic Created: 0.0.1234568

🪙  Step 2: Creating HTS Token (CHW Points)...
✅ HTS Token Created: 0.0.1234569

📋 Summary
----------
HCS Topic ID: 0.0.1234568
HTS Token ID: 0.0.1234569

✅ .env file updated automatically!
```

---

### 6. Database Seeding

Populate the database with realistic Kenyan data:

```bash
npm run db:seed
```

This creates:
- **8 users**: 5 CHWs, 2 Supervisors, 1 Admin
- **200 tasks**: Distributed over last 30 days
- **30 metric snapshots**: Daily aggregates

Test accounts:
```
CHW:        akinyi.otieno@afya.ke / demo123
Supervisor: mary.wekesa@afya.ke   / demo123
Admin:      admin@afya.ke         / demo123
```

---

### 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

You should see the login page with the AfyaUkweli branding.

---

## Production Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables for Production

Ensure all production environment variables are set:

- ✅ Real `JWT_SECRET` (never reuse from dev)
- ✅ Production Supabase project
- ✅ Hedera Mainnet credentials (if using live blockchain)
- ✅ Set `HEDERA_NETWORK=mainnet`

### Deployment Platforms

AfyaUkweli can be deployed to:

- **Vercel** (Recommended for Next.js)
  ```bash
  npm i -g vercel
  vercel
  ```

- **Railway**
  - Connect GitHub repo
  - Set environment variables
  - Deploy

- **Docker**
  ```dockerfile
  FROM node:18-alpine
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci --only=production
  COPY . .
  RUN npm run build
  EXPOSE 3000
  CMD ["npm", "start"]
  ```

- **AWS / GCP / Azure**
  - Use Node.js 18+ runtime
  - Set environment variables
  - Run `npm run build && npm start`

---

## Troubleshooting

### Issue: "Cannot find module '@/lib/supabase'"

**Solution**: Ensure `tsconfig.json` has correct path mapping:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Issue: "supabaseUrl is required"

**Solution**: Check `.env` file exists and contains `NEXT_PUBLIC_SUPABASE_URL`

### Issue: "new row violates row-level security policy"

**Solution**: RLS is enabled. This is expected. The seed script temporarily disables RLS for seeding.

### Issue: Build fails with "output: export" error

**Solution**: Ensure `next.config.js` does NOT have `output: 'export'` since we use API routes.

### Issue: HashScan links show 404

**Solution**:
- If using mock mode (no Hedera setup), transaction hashes are simulated
- Run `npm run setup:hedera` for real Hedera integration
- Ensure `HCS_TOPIC_ID` and `HTS_TOKEN_ID` are in `.env`

### Issue: Charts not loading in Admin dashboard

**Solution**:
1. Check browser console for errors
2. Verify `/api/stats` returns data:
   ```bash
   curl http://localhost:3000/api/stats \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```
3. Ensure database has seeded data (`npm run db:seed`)

---

## Development Scripts

| Command                | Description                              |
|------------------------|------------------------------------------|
| `npm run dev`          | Start development server (port 3000)     |
| `npm run build`        | Build for production                     |
| `npm start`            | Start production server                  |
| `npm run lint`         | Run ESLint                               |
| `npm run typecheck`    | Run TypeScript type checking             |
| `npm run setup:hedera` | Create HCS Topic & HTS Token             |
| `npm run db:seed`      | Seed database with mock data             |

---

## Security Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Use production Supabase project (not the same as dev)
- [ ] Enable RLS policies on all tables
- [ ] Audit RLS policies for security
- [ ] Never commit `.env` file to git
- [ ] Use Hedera Mainnet accounts with limited balances
- [ ] Enable HTTPS/TLS
- [ ] Set up rate limiting on API routes
- [ ] Configure CORS appropriately
- [ ] Review and test authentication flows
- [ ] Enable Supabase auth (if using Supabase Auth instead of JWT)

---

## Architecture Diagram

```
┌─────────────────────────────────────────┐
│         Frontend (Next.js)              │
│  • Login, CHW, Supervisor, Admin UIs    │
└─────────────┬───────────────────────────┘
              │ HTTPS/JWT
              ▼
┌─────────────────────────────────────────┐
│      Backend (Next.js API Routes)       │
│  • /api/auth/login                      │
│  • /api/task                            │
│  • /api/approve                         │
│  • /api/stats                           │
└────┬──────────────────────┬─────────────┘
     │                      │
     ▼                      ▼
┌──────────────┐    ┌──────────────────┐
│   Supabase   │    │     Hedera       │
│ (PostgreSQL) │    │   Hashgraph      │
│              │    │                  │
│ • Users      │    │ • HCS Topic      │
│ • Tasks      │    │ • HTS Token      │
│ • Metrics    │    │ • Consensus      │
└──────────────┘    └──────────────────┘
    Private              Public
```

---

## Next Steps

1. ✅ Complete setup following this guide
2. ✅ Run the app locally
3. ✅ Test with provided demo accounts
4. ✅ Review [DEMO.md](./DEMO.md) for demo script
5. ✅ Read [README.md](./README.md) for full documentation
6. 🚀 Deploy to production
7. 🎉 Start logging health worker tasks on Hedera!

---

## Support

For issues or questions:
- Check [README.md](./README.md) for comprehensive docs
- Review troubleshooting section above
- Open GitHub issue
- Email: support@afyaukweli.example

---

**Built with** ❤️ **for Community Health Workers**
