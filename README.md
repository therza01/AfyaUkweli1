# AfyaUkweli (Swahili: Health Truth)

**Community Health Worker Task Logging and Verification Platform**

AfyaUkweli is a production-grade, enterprise platform that enables Community Health Workers (CHWs) in Kenya to log their tasks immutably on the blockchain and receive automatic token rewards for verified work. Built for NGOs and government health programs.

---

## Table of Contents

1. [Overview](#overview)
2. [Hedera Integration](#hedera-integration)
3. [Tech Stack](#tech-stack)
4. [Features](#features)
5. [Setup Instructions](#setup-instructions)
6. [Architecture](#architecture)
7. [Database Schema](#database-schema)
8. [API Endpoints](#api-endpoints)
9. [Security](#security)
10. [Demo Script](#demo-script)

---

## Overview

AfyaUkweli solves the challenge of tracking and incentivizing community health worker activities in resource-constrained settings. The platform provides:

- **Immutable Audit Trail**: Every task is logged on Hedera Consensus Service (HCS)
- **Automatic Incentives**: Approved tasks trigger automatic token transfers via Hedera Token Service (HTS)
- **Privacy-First**: No PII on-chain; only hashes and geohash buckets
- **Enterprise Analytics**: Real-time dashboards for program management
- **Offline Support**: Tasks queue locally and sync when connectivity returns

---

## Hedera Integration

AfyaUkweli leverages **Hedera Hashgraph** for its unique combination of speed, cost-efficiency, and immutability.

### Hedera Transactions Used

#### 1. **TopicMessageSubmitTransaction** (HCS)
- **Purpose**: Log CHW task events immutably
- **When**: Every time a CHW submits a task
- **Payload Example**:
  ```json
  {
    "type": "TASK_LOG",
    "taskId": "01JBXYZ...",
    "chwId": "uuid",
    "taskType": "IMMUNIZATION",
    "geohash": "s0j4r2k",
    "consentHash": "sha256...",
    "when": 1234567890
  }
  ```
- **Why HCS**: Provides an immutable, timestamped log that cannot be altered or deleted

#### 2. **TokenCreateTransaction** (HTS)
- **Purpose**: Create the CHW Points (CHWP) token
- **When**: One-time setup via `npm run setup:hedera`
- **Token Details**:
  - **Name**: CHW Points
  - **Symbol**: CHWP
  - **Type**: Fungible
  - **Decimals**: 0 (integer points)
  - **Supply Type**: Infinite
  - **Initial Supply**: 1,000,000

#### 3. **TransferTransaction** (HTS)
- **Purpose**: Award CHW Points to workers for approved tasks
- **When**: Supervisor approves a task
- **Points Awarded**:
  - Home Visit: 10 CHWP
  - Immunization: 15 CHWP
  - Follow-up: 12 CHWP
- **Why HTS**: Enables micro-rewards at scale with predictable, low costs

#### 4. **TopicMessageSubmitTransaction** (Approval Log)
- **Purpose**: Log supervisor approval/rejection decisions
- **When**: Supervisor processes a task
- **Payload Example**:
  ```json
  {
    "type": "TASK_APPROVAL",
    "taskId": "01JBXYZ...",
    "supervisorId": "uuid",
    "approved": true,
    "when": 1234567891
  }
  ```

### Economic Justification

**Why Hedera?**

- **Fixed Low Fees**: $0.0001 per HCS message, $0.001 per HTS transfer
- **Sustainability**: At 1000 tasks/day, HCS costs ~$3/month
- **Predictable**: No gas spikes; fees are stable
- **Speed**: 3-5 second finality
- **Carbon Negative**: Environmentally responsible

**Alternative Comparison**:
- Ethereum: $5-50+ per transaction (unusable for micro-rewards)
- Polygon: $0.01-0.50 per transaction (10-500x more expensive)
- Private chain: No public auditability, higher infrastructure costs

---

## Tech Stack

### Frontend
- **Framework**: Next.js 13 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (dark-themed, premium design)
- **UI Components**: Radix UI primitives
- **Charts**: Recharts
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod

### Backend
- **Runtime**: Node.js
- **API**: Next.js Route Handlers
- **Database**: Supabase (PostgreSQL)
- **Auth**: JWT + bcrypt
- **Blockchain**: Hedera SDK (`@hashgraph/sdk`)

### DevOps
- **Package Manager**: npm
- **Type Checking**: TypeScript 5.2
- **Linting**: ESLint
- **Environment**: `.env` file management

---

## Features

### CHW Portal
- ✅ Mobile-first task logging form
- ✅ Geolocation capture (geohash for privacy)
- ✅ 4-digit consent code (hashed before storage)
- ✅ Offline queueing with local storage
- ✅ Real-time HCS transaction tracking
- ✅ Token balance display

### Supervisor Portal
- ✅ Task approval/rejection workflow
- ✅ Detailed task drawer with full metadata
- ✅ Batch filtering (pending, approved, rejected)
- ✅ HashScan links for HCS and HTS transactions
- ✅ Rejection reason capture

### Admin Dashboard
- ✅ BlackRock-style enterprise UI
- ✅ 6 real-time KPI cards
- ✅ County-wise task distribution (bar chart)
- ✅ 7-day trend analysis (line chart)
- ✅ Task type distribution (pie chart)
- ✅ Approval latency metrics
- ✅ Hedera Topic & Token ID display with HashScan links
- ✅ CSV export (placeholder)

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm
- Hedera Testnet account (get from [portal.hedera.com](https://portal.hedera.com))

### Step 1: Clone and Install
```bash
git clone <repo-url>
cd afyaukweli
npm install
```

### Step 2: Configure Environment
Create a `.env` file (copy `.env.example`):

```env
# Supabase (pre-configured)
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>

# Hedera (obtain from portal.hedera.com)
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.xxxxx
HEDERA_PRIVATE_KEY=302e02010...

# App
JWT_SECRET=your_jwt_secret_here
NEXT_PUBLIC_HASHSCAN_BASE=https://hashscan.io/testnet
```

### Step 3: Initialize Hedera
```bash
npm run setup:hedera
```
This creates:
- HCS Topic for task logs
- HTS Token (CHW Points)

IDs are automatically added to `.env`.

### Step 4: Seed Database
```bash
npm run db:seed
```
Creates:
- 8 users (5 CHWs, 2 Supervisors, 1 Admin)
- 200 realistic tasks over 30 days
- 30 daily metric snapshots

### Step 5: Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### Step 6: Build for Production
```bash
npm run build
```

### Simple Mode (No external services)

For the fastest demo and deployment without Supabase/Hedera credentials:

- Set `SIMPLE_MODE=true` in your environment. The API will use a lightweight JSON file store
  (persisted under `/tmp` in serverless or `./.afya-data` locally) and mock Hedera tx hashes.
- Required envs:
  - `SIMPLE_MODE=true`
  - `JWT_SECRET=your_random_secret`
  - `NEXT_PUBLIC_HASHSCAN_BASE=https://hashscan.io/testnet`
- Optional envs:
  - `SIMPLE_DATA_DIR=/tmp/afya` to override data path

Deploy notes:
- Vercel: works out of the box in Simple Mode (data is ephemeral per instance).
- Docker: pass the same envs; data will persist in the container filesystem unless rebuilt.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   CHW UI     │  │ Supervisor   │  │  Admin       │      │
│  │ (Task Log)   │  │ (Approvals)  │  │ (Dashboard)  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │ JWT Auth
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend (Next.js)                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ API Routes:  /api/task  /api/approve  /api/stats      │ │
│  └────────┬──────────────────────────┬────────────────────┘ │
└───────────┼──────────────────────────┼──────────────────────┘
            │                          │
    ┌───────▼────────┐         ┌───────▼─────────┐
    │   Supabase     │         │    Hedera       │
    │  (PostgreSQL)  │         │   Hashgraph     │
    │                │         │                 │
    │  • Users       │         │  • HCS Topic    │
    │  • Tasks       │         │  • HTS Token    │
    │  • Metrics     │         │  • Immutable    │
    │  • PII Data    │         │    Logs         │
    └────────────────┘         └─────────────────┘
         (Private)                  (Public)
```

### Data Flow

1. **Task Submission**:
   - CHW submits task → Backend hashes consent code
   - Backend logs to HCS → Returns transaction hash
   - Backend stores task in DB with HCS hash

2. **Task Approval**:
   - Supervisor approves → Backend logs approval to HCS
   - Backend transfers CHWP via HTS
   - Backend updates task with both transaction hashes

3. **Analytics**:
   - Admin views dashboard → Backend aggregates DB data
   - Real-time KPIs computed from tasks table
   - Charts rendered from metric snapshots

---

## Database Schema

### `users`
```sql
id              uuid PRIMARY KEY
name            text NOT NULL
email           text UNIQUE NOT NULL
role            text CHECK IN ('CHW', 'SUPERVISOR', 'ADMIN')
phone           text
county          text
sub_county      text
ward            text
chw_account_id  text  -- Hedera account for rewards
password_hash   text NOT NULL
created_at      timestamptz DEFAULT now()
updated_at      timestamptz DEFAULT now()
```

### `tasks`
```sql
id                      uuid PRIMARY KEY
task_id                 text UNIQUE  -- ULID
chw_id                  uuid REFERENCES users
task_type               text CHECK IN ('HOME_VISIT', 'IMMUNIZATION', 'FOLLOW_UP')
consent_code_hash       text  -- SHA-256 hash
geohash                 text  -- 6-7 chars
notes                   text
status                  text CHECK IN ('PENDING', 'APPROVED', 'REJECTED')
created_at              timestamptz DEFAULT now()
approved_at             timestamptz
supervisor_id           uuid REFERENCES users
rejection_reason        text
hcs_log_txn_hash        text  -- Task log transaction
hcs_approval_txn_hash   text  -- Approval log transaction
hts_transfer_txn_hash   text  -- Token transfer transaction
points_awarded          integer DEFAULT 0
```

### `metric_snapshots`
```sql
id                uuid PRIMARY KEY
snapshot_date     date UNIQUE
total_tasks       integer
approved_tasks    integer
rejected_tasks    integer
pending_tasks     integer
points_distributed integer
active_chws       integer
created_at        timestamptz DEFAULT now()
```

---

## API Endpoints

### `POST /api/auth/signup`
**Auth**: Public
**Body**:
```json
{
  "name": "John Doe",
  "email": "john@afya.ke",
  "password": "securepass123",
  "phone": "+254712345678",
  "role": "CHW",
  "county": "Nairobi",
  "sub_county": "Westlands",
  "ward": "Kangemi"
}
```
**Response**:
```json
{
  "token": "jwt...",
  "user": { "id": "...", "role": "CHW", ... },
  "message": "Account created successfully"
}
```

### `POST /api/auth/login`
**Auth**: Public
**Body**:
```json
{
  "email": "chw@afya.ke",
  "password": "demo123"
}
```
**Response**:
```json
{
  "token": "jwt...",
  "user": { "id": "...", "role": "CHW", ... }
}
```

### `POST /api/task`
**Auth**: CHW
**Body**:
```json
{
  "taskType": "IMMUNIZATION",
  "consentCode": "1234",
  "geohash": "s0j4r2k",
  "notes": "Child immunization PENTA3"
}
```
**Response**:
```json
{
  "task": { ... },
  "hcsTransactionHash": "0xabc...",
  "hashScanUrl": "https://hashscan.io/testnet/transaction/0xabc..."
}
```

### `POST /api/approve`
**Auth**: Supervisor/Admin
**Body**:
```json
{
  "taskId": "uuid",
  "approved": true,
  "reason": "Insufficient docs" // optional
}
```
**Response**:
```json
{
  "task": { ... },
  "hcsApprovalHash": "0xdef...",
  "htsTransferHash": "0xghi...",
  "pointsAwarded": 15,
  "hashScanUrls": {
    "approval": "https://...",
    "transfer": "https://..."
  }
}
```

### `GET /api/task?status=PENDING&page=1&limit=20`
**Auth**: CHW/Supervisor/Admin
**Response**:
```json
{
  "tasks": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

### `GET /api/stats`
**Auth**: Admin
**Response**:
```json
{
  "kpis": {
    "tasksToday": 12,
    "approvalRate": 88,
    "pointsAwarded24h": 150,
    "pointsAwarded7d": 1200,
    "activeChws": 5,
    "avgTimeToApprovalHours": 4.5,
    "pendingTasks": 8
  },
  "charts": {
    "countyStats": [ { "county": "Kisumu", "count": 45 }, ... ],
    "taskTypeDistribution": [ { "type": "Home Visit", "value": 80 }, ... ],
    "weekTrend": [ { "date": "2025-10-24", "tasks": 10, "approved": 9, "points": 120 }, ... ]
  }
}
```

---

## Security

### Data Privacy
- **No PII on-chain**: Only hashes and geohashes
- **Consent codes**: SHA-256 hashed before storage
- **Location**: Geohash buckets (6-7 chars) ~100m precision
- **Access control**: Role-based RLS policies

### Authentication
- **JWT**: 7-day expiry
- **Passwords**: bcrypt hashed (10 rounds)
- **API**: Bearer token required for all protected routes

### RLS Policies
- **CHWs**: Can only view/insert own tasks
- **Supervisors**: Can view tasks in their county
- **Admins**: Full access to all data

### Best Practices
- ✅ Never commit `.env` file
- ✅ Rotate JWT_SECRET in production
- ✅ Use Hedera Mainnet accounts with limited balances
- ✅ Audit RLS policies before production deployment

---

## Demo Script (3 minutes)

### 1. CHW Logs Task (30s)
1. Login as `akinyi.otieno@afya.ke / demo123`
2. Fill form: Immunization, 4-digit code, notes
3. Click "Submit Task"
4. **Show**: HCS transaction hash + HashScan link

### 2. Supervisor Approves (45s)
1. Login as `mary.wekesa@afya.ke / demo123`
2. Filter: PENDING tasks
3. Click "Review" on a task
4. Click "Approve"
5. **Show**: HCS approval hash + HTS transfer hash + Points awarded

### 3. Admin Dashboard (90s)
1. Login as `admin@afya.ke / demo123`
2. **Highlight**:
   - Tasks Today KPI (updated)
   - Approval Rate
   - County distribution chart
   - 7-day trend
   - HCS Topic ID → HashScan link
   - HTS Token ID → HashScan link
3. Click "Export CSV" (placeholder toast)

### 4. Hedera Verification (15s)
- Open HashScan link from any transaction
- Show immutable message on HCS topic
- Show token transfer on HTS

---

## Test Accounts

| Role        | Email                    | Password |
|-------------|--------------------------|----------|
| CHW         | akinyi.otieno@afya.ke    | demo123  |
| CHW         | wanjiru.kamau@afya.ke    | demo123  |
| Supervisor  | mary.wekesa@afya.ke      | demo123  |
| Admin       | admin@afya.ke            | demo123  |

---

## Deployment IDs

**HCS Topic ID**: `<Set by npm run setup:hedera>`
**HTS Token ID**: `<Set by npm run setup:hedera>`
**Network**: Hedera Testnet

View on HashScan:
- Topic: `https://hashscan.io/testnet/topic/<TOPIC_ID>`
- Token: `https://hashscan.io/testnet/token/<TOKEN_ID>`

---

## License

MIT

---

## Support

For questions or issues:
- GitHub Issues: `<repo-url>/issues`
- Email: `support@afyaukweli.example`

---

**Built with** ❤️ **for Community Health Workers**
**Powered by Hedera Hashgraph**
