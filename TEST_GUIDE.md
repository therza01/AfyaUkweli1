# 🧪 Testing Guide

## 🎯 Complete Test Checklist

Test your AfyaUkweli deployment before submitting!

---

## ✅ Pre-Deployment Tests (Local)

### 1. Build Test
```bash
npm run build
```
**Expected**: ✅ Build completes without errors

### 2. Type Check
```bash
npm run typecheck
```
**Expected**: ✅ No TypeScript errors

### 3. Database Connection
```bash
node -e "
const { createClient } = require('@supabase/supabase-js');
const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
client.from('users').select('count').limit(1).then(r => {
  console.log('DB Connection:', r.error ? 'FAILED' : 'SUCCESS');
});
"
```
**Expected**: DB Connection: SUCCESS

---

## 🌐 Post-Deployment Tests

### Test 1: Homepage Loads
```
URL: https://your-app.vercel.app
Expected:
- ✅ Login page displays
- ✅ AfyaUkweli logo visible
- ✅ Demo accounts listed
- ✅ No console errors
```

### Test 2: CHW Login
```
Steps:
1. Visit /login
2. Enter: akinyi.otieno@afya.ke / demo123
3. Click "Sign in"

Expected:
- ✅ Redirect to /chw
- ✅ Dashboard loads
- ✅ User name shows: "Akinyi Otieno"
- ✅ Points balance visible
- ✅ Navigation menu appears
```

### Test 3: Supervisor Login
```
Steps:
1. Visit /login
2. Enter: mary.wekesa@afya.ke / demo123
3. Click "Sign in"

Expected:
- ✅ Redirect to /supervisor
- ✅ Dashboard loads
- ✅ User name shows: "Mary Wekesa"
- ✅ Approvals section visible
- ✅ Navigation menu appears
```

### Test 4: Admin Login
```
Steps:
1. Visit /login
2. Enter: admin@afya.ke / demo123
3. Click "Sign in"

Expected:
- ✅ Redirect to /admin
- ✅ Dashboard loads
- ✅ User name shows: "Grace Adhiambo"
- ✅ KPI cards visible
- ✅ Navigation menu appears
```

---

## 📝 Functional Tests

### Test 5: CHW Task Submission

```
As: CHW (akinyi.otieno@afya.ke)

Steps:
1. Login as CHW
2. Click "Dashboard" in sidebar
3. Select Task Type: "Home Visit"
4. Enter Consent Code: TEST-001-2024
5. Enter Notes: "Malaria screening completed"
6. Click "Submit Task"

Expected:
- ✅ Success message appears
- ✅ Transaction ID shown (format: mock-XXXXX or 0.0.XXX@XXX)
- ✅ Toast notification: "Task submitted successfully"
- ✅ Form clears for next entry
- ✅ Points balance unchanged (pending approval)

Verify Database:
- New record in tasks table
- Status: "pending"
- hcs_log_txn_hash populated
```

### Test 6: Supervisor Task Approval

```
As: Supervisor (mary.wekesa@afya.ke)

Steps:
1. Login as Supervisor
2. Click "Approvals" in sidebar
3. See pending task from Test 5
4. Click on task to view details
5. Review task information
6. Click "Approve"
7. Confirm approval

Expected:
- ✅ Success message: "Task approved"
- ✅ Approval transaction ID shown
- ✅ Task disappears from pending list
- ✅ CHW gets points (15-30)

Verify Database:
- Task status: "approved"
- hcs_approval_txn_hash populated
- points_awarded value set
```

### Test 7: Supervisor QR Code Generation

```
As: Supervisor (mary.wekesa@afya.ke)

Steps:
1. Login as Supervisor
2. Click "Attendance" in sidebar
3. View today's QR code
4. QR code should be displayed
5. Copy QR code value

Expected:
- ✅ QR code visible
- ✅ Format: AFYA-YYYYMMDD-XXXXXX
- ✅ Valid only for today
- ✅ Can be used by CHWs

Verify Database:
- New record in supervisor_qr_codes table
- valid_date = today
- expires_at = end of today
```

### Test 8: CHW Attendance Check-In

```
As: CHW (akinyi.otieno@afya.ke)

Prerequisite: Get QR code from Test 7

Steps:
1. Login as CHW
2. Click "Attendance" in sidebar
3. Select Supervisor: "Mary Wekesa"
4. Enter QR Code from Test 7
5. Click "Check In to Work"

Expected:
- ✅ Success message: "Checked in successfully"
- ✅ Today's status card appears
- ✅ Check-in time displayed
- ✅ Supervisor name shown
- ✅ "Check Out" button visible

Verify Database:
- New record in attendance table
- status: "CHECKED_IN"
- check_in_time populated
- qr_code_used matches
```

### Test 9: CHW Attendance Check-Out

```
As: CHW (akinyi.otieno@afya.ke)

Prerequisite: Completed Test 8

Steps:
1. Stay logged in as CHW
2. On Attendance page
3. Click "Check Out Now"
4. Confirm check-out

Expected:
- ✅ Success message with hours worked
- ✅ Points earned displayed (10 per hour)
- ✅ Status changes to "CHECKED_OUT"
- ✅ Check-out time shown
- ✅ Total points updated

Verify Database:
- attendance status: "CHECKED_OUT"
- check_out_time populated
- points_earned calculated (10/hour)
```

### Test 10: Supervisor Manual Sign-In

```
As: Supervisor (mary.wekesa@afya.ke)

Steps:
1. Login as Supervisor
2. Click "Attendance" in sidebar
3. Scroll to "Sign In CHW" section
4. Select CHW from dropdown
5. Click "Sign In"

Expected:
- ✅ Success message
- ✅ CHW appears in active list
- ✅ Current time as check-in

Verify Database:
- New attendance record
- check_in_time = now
- supervisor_id = Mary's ID
```

### Test 11: Admin Dashboard Metrics

```
As: Admin (admin@afya.ke)

Steps:
1. Login as Admin
2. View dashboard KPIs
3. Click "Attendance" in sidebar
4. View organization metrics

Expected:
- ✅ Total tasks count accurate
- ✅ Pending tasks count correct
- ✅ CHWs checked in today shown
- ✅ Total points awarded displayed
- ✅ 7-day trend chart visible
- ✅ All data matches database

Verify:
- KPI cards show correct numbers
- Attendance graph loads
- Date selector works
```

---

## 🔍 Hedera Integration Tests

### Test 12: HCS Transaction Verification (Mock Mode)

```
After task submission:

Steps:
1. Note transaction ID from Test 5
2. Check format: mock-{timestamp}
3. Verify saved in database

Expected:
- ✅ Transaction ID follows pattern
- ✅ Stored in tasks.hcs_log_txn_hash
- ✅ Unique for each submission
```

### Test 13: HCS Transaction Verification (Production Mode)

```
If using real Hedera testnet:

Steps:
1. Note transaction ID from task submission
2. Visit https://hashscan.io/testnet
3. Search for transaction ID
4. View transaction details

Expected:
- ✅ Transaction found on network
- ✅ Message contains task data
- ✅ Timestamp matches submission
- ✅ Topic ID matches HCS_TOPIC_ID
```

### Test 14: HTS Token Verification (Production Mode)

```
If using real Hedera testnet:

Steps:
1. Note CHW account ID
2. Visit https://hashscan.io/testnet
3. Search for token ID (HTS_TOKEN_ID)
4. View token transfers
5. Find transfer to CHW

Expected:
- ✅ Token transfer visible
- ✅ Amount matches points awarded
- ✅ Receiver is CHW account
- ✅ Timestamp matches approval
```

---

## 📱 Responsive Design Tests

### Test 15: Mobile View

```
Devices to test:
- iPhone (Safari)
- Android (Chrome)
- Tablet (iPad)

Pages to test:
- Login page
- CHW dashboard
- Supervisor approvals
- Admin dashboard
- Attendance pages

Expected:
- ✅ All pages responsive
- ✅ Navigation menu works
- ✅ Forms are usable
- ✅ Buttons sized properly
- ✅ Text readable
- ✅ No horizontal scroll
```

---

## 🔐 Security Tests

### Test 16: Unauthorized Access

```
Steps:
1. Logout
2. Try to access /chw directly
3. Try to access /supervisor directly
4. Try to access /admin directly

Expected:
- ✅ Redirect to /login
- ✅ Cannot access protected routes
- ✅ No data visible without auth
```

### Test 17: Role-Based Access

```
As: CHW (akinyi.otieno@afya.ke)

Steps:
1. Login as CHW
2. Try to access /supervisor
3. Try to access /admin

Expected:
- ✅ Blocked or redirected
- ✅ Cannot see other roles' data
- ✅ Only CHW menu visible
```

### Test 18: Token Expiration

```
Steps:
1. Login
2. Wait 7 days (or modify JWT expiry in code)
3. Try to perform action

Expected:
- ✅ Token expires
- ✅ Redirect to login
- ✅ Must re-authenticate
```

---

## ⚡ Performance Tests

### Test 19: Page Load Times

```
Pages to test:
- Homepage (login)
- CHW dashboard
- Supervisor dashboard
- Admin dashboard

Expected:
- ✅ Initial load < 3 seconds
- ✅ Subsequent loads < 1 second
- ✅ No layout shift (CLS)
- ✅ Smooth interactions
```

### Test 20: Database Query Performance

```
Test with multiple records:

Expected:
- ✅ Task list loads quickly
- ✅ Attendance list loads quickly
- ✅ Dashboard metrics fast
- ✅ No timeout errors
```

---

## 🐛 Error Handling Tests

### Test 21: Network Error

```
Steps:
1. Open DevTools
2. Set network to "Offline"
3. Try to submit task

Expected:
- ✅ Error message displayed
- ✅ User-friendly message
- ✅ No crash or hang
- ✅ Form data preserved
```

### Test 22: Invalid Input

```
Steps:
1. Try to submit empty form
2. Try invalid email format
3. Try short password

Expected:
- ✅ Validation errors shown
- ✅ Fields highlighted
- ✅ Clear error messages
- ✅ Form blocked until fixed
```

### Test 23: Duplicate QR Code

```
Steps:
1. CHW checks in with QR code
2. Try to check in again with same code

Expected:
- ✅ Error: "Already checked in"
- ✅ Clear error message
- ✅ No duplicate records
```

---

## 📊 Test Results Template

```
## AfyaUkweli Test Results
Date: __________
Tester: __________
Deployment URL: __________

### Authentication
- [ ] CHW Login (Test 2)
- [ ] Supervisor Login (Test 3)
- [ ] Admin Login (Test 4)

### Core Features
- [ ] Task Submission (Test 5)
- [ ] Task Approval (Test 6)
- [ ] QR Code Generation (Test 7)
- [ ] Attendance Check-In (Test 8)
- [ ] Attendance Check-Out (Test 9)

### Hedera Integration
- [ ] HCS Mock TX (Test 12)
- [ ] HCS Real TX (Test 13) - if applicable
- [ ] HTS Tokens (Test 14) - if applicable

### Security
- [ ] Unauthorized Access (Test 16)
- [ ] Role-Based Access (Test 17)

### Performance
- [ ] Page Load Times (Test 19)

### Mobile
- [ ] Responsive Design (Test 15)

### Overall Status
- [ ] All tests passed
- [ ] Ready for submission
```

---

## 🎯 Quick Test (5 Minutes)

If short on time:

```bash
1. Deploy app                    (1 min)
2. Test CHW login                (30 sec)
3. Submit one task               (30 sec)
4. Login as Supervisor           (30 sec)
5. Approve the task              (30 sec)
6. Login as Admin                (30 sec)
7. View dashboard                (30 sec)
8. Check all pages load          (1 min)

Total: 5 minutes
Result: Core functionality verified ✅
```

---

## 🏆 Submission Checklist

Before submitting:

- [ ] All core tests passed (Tests 2-11)
- [ ] Login works for all 3 roles
- [ ] Task submission creates TX ID
- [ ] Approvals work correctly
- [ ] Attendance system functional
- [ ] Admin dashboard displays data
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Deployment stable
- [ ] URL copied for submission

---

## 💡 Testing Tips

1. **Use Incognito Mode** - Fresh session each time
2. **Check Console** - Look for errors
3. **Test Multiple Browsers** - Chrome, Firefox, Safari
4. **Test Mobile** - Use real device or dev tools
5. **Document Issues** - Screenshot any problems
6. **Test Sequentially** - Follow test order
7. **Verify Database** - Check data is saved
8. **Test Edge Cases** - Try unusual inputs

---

## 🚨 Common Issues

### Issue: "Login failed"
**Check**:
- Environment variables set correctly
- Database connection working
- Password is "demo123"

### Issue: "Transaction failed"
**Check**:
- Hedera credentials correct (if production mode)
- Mock mode enabled (if no credentials)
- Network connection stable

### Issue: "Page not found"
**Check**:
- Deployment successful
- All routes built correctly
- No typos in URLs

---

## ✅ Success Criteria

Your app is ready when:

✅ All 3 demo accounts can login
✅ CHWs can submit tasks
✅ Supervisors can approve tasks
✅ Attendance system works
✅ Admin can view metrics
✅ No critical errors
✅ Mobile responsive
✅ Hedera integration functional (mock or real)

---

**Ready to Submit? Run the Quick Test above and you're good to go!** 🚀
