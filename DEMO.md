# AfyaUkweli 3-Minute Demo Script

## Prerequisites
- Database seeded with `npm run db:seed`
- Application running on `http://localhost:3000`
- Hedera testnet configured (optional for demo with mock data)

---

## Demo Flow

### Part 1: CHW Logs Task (30 seconds)

**Goal**: Show how Community Health Workers submit tasks to Hedera

1. **Login as CHW**
   - Navigate to `http://localhost:3000/login`
   - Email: `akinyi.otieno@afya.ke`
   - Password: `demo123`

2. **Log a Task**
   - Select Task Type: **Immunization**
   - Enter Consent Code: `1234` (any 4 digits)
   - Add Notes: "Child immunization (PENTA3) - 6 months old"
   - Click **Submit Task**

3. **Highlight**:
   - ✅ Success toast with "View on HashScan" link
   - ✅ HCS transaction hash displayed
   - 💡 **Key Point**: Task is now immutably logged on Hedera Consensus Service

---

### Part 2: Supervisor Approves (45 seconds)

**Goal**: Show supervisor approval workflow and automatic token rewards

1. **Logout & Login as Supervisor**
   - Click logout icon (top-right)
   - Login with:
     - Email: `mary.wekesa@afya.ke`
     - Password: `demo123`

2. **Review Pending Tasks**
   - See list of pending tasks from CHWs
   - Filter by **PENDING** (default view)
   - Click **Review** on any task

3. **Approve Task**
   - Review task details (type, notes, CHW info, timestamp)
   - Click **Approve** button
   - Wait for confirmation (~3-5 seconds)

4. **Highlight**:
   - ✅ Success toast: "Task approved! 15 points awarded"
   - ✅ Two transaction hashes shown:
     - HCS approval log
     - HTS token transfer (15 CHWP)
   - 🔗 Click "View" to see transaction on HashScan (testnet)
   - 💡 **Key Point**: Automatic, transparent reward distribution

---

### Part 3: Admin Dashboard (90 seconds)

**Goal**: Show enterprise-grade analytics and Hedera integration

1. **Logout & Login as Admin**
   - Logout
   - Login with:
     - Email: `admin@afya.ke`
     - Password: `demo123`

2. **Highlight Dashboard Sections**

   **KPI Cards (Top Row)**:
   - **Tasks Today**: Real-time count of tasks submitted
   - **Approval Rate**: Overall approval percentage (88%)
   - **Points (24h)**: CHWP tokens awarded in last 24 hours
   - **Active CHWs**: Total registered community health workers

   **Charts**:
   - **Tasks by County**: Bar chart showing regional distribution
     - Kisumu, Nairobi, Mombasa, etc.
   - **7-Day Trend**: Line chart showing tasks and approvals over time
     - Blue line: Total tasks
     - Green line: Approved tasks
   - **Task Type Distribution**: Pie chart
     - Home Visits, Immunizations, Follow-ups

   **Key Metrics**:
   - Pending Tasks count
   - Average approval time in hours

   **Hedera Integration Panels (Bottom)**:
   - **HCS Topic ID**: Click external link icon → Opens HashScan
     - Shows all task logs on the consensus service
   - **HTS Token ID**: Click external link icon → Opens HashScan
     - Shows CHW Points token details and all transfers

3. **Export Feature (Placeholder)**
   - Click **Export CSV** button
   - Toast notification: "CSV export feature coming soon"

4. **Key Points**:
   - 💼 Enterprise-grade, BlackRock-style UI
   - 📊 Real-time data visualization
   - 🔗 Full transparency via HashScan links
   - 🌍 Kenyan context: Real counties, realistic data

---

### Part 4: Hedera Verification (15 seconds)

**Goal**: Prove immutability on public blockchain

1. **Open HashScan Link**
   - From admin dashboard, click HCS Topic ID → External link
   - Or use approval toast "View on HashScan"

2. **Show HashScan Page**
   - **HCS Topic**: List of all task log messages
     - Timestamped
     - Immutable
     - Publicly verifiable
   - **HTS Transfers**: Token transfer history
     - From: Treasury account
     - To: CHW accounts
     - Amount: 10-15 CHWP per task

3. **Key Points**:
   - ✅ Cannot be altered or deleted
   - ✅ Public audit trail
   - ✅ Low cost ($0.0001 per message)
   - ✅ 3-5 second finality

---

## Demo Talking Points

### Problem Statement
"Community health programs struggle to track and incentivize CHW activities. Traditional systems lack transparency, have high administrative costs, and make it difficult to verify work completion."

### Solution
"AfyaUkweli uses Hedera Hashgraph to create an immutable audit trail and automatic reward system. Every task is logged on HCS, and approved tasks trigger instant token transfers via HTS."

### Why Hedera?
- **Fixed Low Fees**: $0.0001 per log, $0.001 per transfer
- **Speed**: 3-5 second finality
- **Sustainability**: At 1000 tasks/day, costs ~$3/month
- **Carbon Negative**: Environmentally responsible
- **Comparison**: Ethereum would cost $5-50 per transaction (unusable)

### Impact
- **For CHWs**: Transparent rewards, instant verification
- **For Supervisors**: Easy approval workflow with full context
- **For Programs**: Real-time visibility, audit compliance, cost savings
- **For Communities**: Better health outcomes through incentivized care

---

## Optional: Advanced Features

If time permits, highlight:

1. **Privacy Design**:
   - No PII on-chain
   - Consent codes are SHA-256 hashed
   - Location stored as geohash (100m precision)

2. **Offline Support**:
   - CHW UI queues tasks locally
   - Auto-syncs when connectivity returns

3. **Security**:
   - Row-Level Security (RLS) on database
   - Role-based access control
   - JWT authentication

4. **Scalability**:
   - Supabase (PostgreSQL) handles millions of rows
   - Hedera supports 10,000+ TPS
   - Next.js scales horizontally

---

## Test Accounts Summary

| Role       | Email                    | Password |
|------------|--------------------------|----------|
| CHW        | akinyi.otieno@afya.ke    | demo123  |
| Supervisor | mary.wekesa@afya.ke      | demo123  |
| Admin      | admin@afya.ke            | demo123  |

---

## Troubleshooting

**Q: HashScan links show "not found"**
A: If using mock mode (no real Hedera setup), the transaction hashes are simulated. For live demo, run `npm run setup:hedera` first.

**Q: No tasks in supervisor view**
A: Ensure database is seeded with `npm run db:seed`. Check status filter (PENDING vs ALL).

**Q: Charts not loading**
A: Refresh page. Ensure `/api/stats` endpoint returns data (check browser DevTools → Network tab).

---

## Closing Statement

"AfyaUkweli demonstrates how blockchain technology—specifically Hedera—can solve real-world problems in healthcare logistics. By combining immutable logging with automatic incentives, we create a transparent, efficient system that benefits everyone: CHWs get fair compensation, supervisors streamline workflows, and programs gain unprecedented visibility. All while keeping costs predictable and low."

---

**Demo Time: ~3 minutes**
**Questions: 2-5 minutes**
**Total: 5-8 minutes**
