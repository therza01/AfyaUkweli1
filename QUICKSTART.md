# AfyaUkweli Quick Start

Get up and running in 2 minutes.

## Installation

```bash
npm install
npm run db:seed
npm run dev
```

## Test Accounts

| Role       | Email                  | Password |
|------------|------------------------|----------|
| CHW        | akinyi.otieno@afya.ke  | demo123  |
| Supervisor | mary.wekesa@afya.ke    | demo123  |
| Admin      | admin@afya.ke          | demo123  |

## URLs

- **Login**: http://localhost:3000/login
- **CHW Portal**: http://localhost:3000/chw
- **Supervisor**: http://localhost:3000/supervisor
- **Admin Dashboard**: http://localhost:3000/admin

## Key Features

- ✅ Immutable task logging on Hedera HCS
- ✅ Automatic token rewards via Hedera HTS
- ✅ Enterprise analytics dashboard
- ✅ Mobile-first CHW interface
- ✅ Privacy-preserving (no PII on-chain)

## What to Show

1. **CHW logs task** → HCS transaction hash
2. **Supervisor approves** → HTS token transfer
3. **Admin views** → Real-time analytics + HashScan links

## Hedera Integration

```bash
npm run setup:hedera  # Creates HCS Topic & HTS Token
```

## More Info

- Full docs: [README.md](./README.md)
- Setup guide: [SETUP.md](./SETUP.md)
- Demo script: [DEMO.md](./DEMO.md)
