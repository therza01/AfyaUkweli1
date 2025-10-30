# AfyaUkweli Access Guide

## Quick Start

1. **Start the application**:
   ```bash
   npm run dev
   ```

2. **Open your browser** to: `http://localhost:3000`

---

## New Features

### ✅ Animated Landing Page
- Beautiful hero section with logo animation
- Slow-motion feature carousel (3-second intervals)
- "How It Works" section with step-by-step guide
- Statistics showcase
- Fully responsive design

### ✅ Password Visibility Toggle
- Eye icon on login page to show/hide password
- Eye icon on signup page for both password fields
- Click to toggle between text and password input

### ✅ Working Authentication
- Database properly configured
- RLS temporarily disabled for authentication
- Demo accounts work correctly
- New user registration functional

---

## Demo Accounts

All passwords: **demo123**

| Role       | Email                    | Use Case                     |
|------------|--------------------------|------------------------------|
| CHW        | akinyi.otieno@afya.ke    | Submit and track tasks       |
| Supervisor | mary.wekesa@afya.ke      | Review and approve tasks     |
| Admin      | admin@afya.ke            | View analytics dashboard     |

---

## User Flows

### 1. New User Registration

1. Visit `http://localhost:3000`
2. Click **"Get Started"** or **"Sign Up"**
3. Fill registration form:
   - Full Name
   - Email (must be unique)
   - Password (min 6 characters, with visibility toggle)
   - Confirm Password (with visibility toggle)
   - Phone (optional)
   - Role: CHW / Supervisor / Admin
   - County (for CHW/Supervisor)
   - Sub-county & Ward (for CHW only)
4. Click **"Create Account"**
5. Automatically logged in and redirected to appropriate dashboard

### 2. Existing User Login

1. Visit `http://localhost:3000`
2. Click **"Sign In"**
3. Enter email and password (use eye icon to view password)
4. Click **"Sign in"**
5. Redirected to role-specific dashboard

### 3. CHW Workflow

1. Login as CHW
2. Select task type (Home Visit / Immunization / Follow-up)
3. Enter 4-digit consent code
4. Add notes
5. Submit task (location captured automatically)
6. View HCS transaction hash

### 4. Supervisor Workflow

1. Login as Supervisor
2. View pending tasks
3. Click "Review" on any task
4. See full task details
5. Approve or reject with optional reason
6. View HCS approval hash and HTS transfer hash

### 5. Admin Workflow

1. Login as Admin
2. View real-time KPIs
3. Analyze charts (county distribution, trends, task types)
4. View Hedera integration (Topic ID, Token ID)
5. Click HashScan links to verify on blockchain
6. Export data (placeholder for CSV)

---

## Page Navigation

| URL                  | Description                          | Access       |
|----------------------|--------------------------------------|--------------|
| `/`                  | Animated landing page                | Public       |
| `/login`             | Login form with password toggle      | Public       |
| `/signup`            | Registration form                    | Public       |
| `/chw`               | CHW task logging portal              | CHW only     |
| `/supervisor`        | Supervisor approval interface        | Supervisor   |
| `/admin`             | Enterprise analytics dashboard       | Admin only   |

---

## Testing the Application

### Test Login Flow

```bash
# 1. Try demo account
Email: admin@afya.ke
Password: demo123 (use eye icon to verify password)

# 2. Try new registration
Create a new account with any email
Use password visibility toggle to ensure correct password entry
```

### Test Features

1. **Landing Page Animations**:
   - Watch feature cards highlight every 3 seconds
   - Logo pulse animation
   - Smooth fade-in effects

2. **Password Toggle**:
   - Login: Click eye icon to show/hide password
   - Signup: Click eye icons on both password fields

3. **Form Validation**:
   - Try submitting with mismatched passwords
   - Try submitting with short password (<6 chars)
   - Try registering with existing email

---

## Common Issues & Solutions

### Issue: Cannot login with demo account

**Solution**: RLS has been disabled for authentication. If you still have issues:
```bash
# Re-seed the database
npm run db:seed
```

### Issue: Password field not accepting input

**Solution**: The input fields are now properly configured. Click directly in the input field and type.

### Issue: Can't see password while typing

**Solution**: Click the eye icon on the right side of the password field to toggle visibility.

### Issue: Landing page not loading

**Solution**: Ensure you're accessing the root URL: `http://localhost:3000`

### Issue: 404 on signup

**Solution**: The signup route is `/signup` (not `/register`). Click "Sign up" link from login page.

---

## Database Structure

### Users Table
- Stores all registered users (CHW, Supervisor, Admin)
- Passwords hashed with bcrypt
- RLS disabled for authentication endpoints

### Tasks Table
- All CHW tasks with status (PENDING, APPROVED, REJECTED)
- Links to CHW and Supervisor
- Contains Hedera transaction hashes

### Metric Snapshots
- Daily aggregated statistics
- Used for admin dashboard charts

---

## API Endpoints (for testing)

### Register New User
```bash
POST http://localhost:3000/api/auth/signup
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "test123",
  "role": "CHW",
  "county": "Nairobi"
}
```

### Login
```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@afya.ke",
  "password": "demo123"
}
```

---

## Next Steps

1. ✅ **Login works** - Use demo accounts or create new one
2. ✅ **Password visibility** - Toggle on all password fields
3. ✅ **Landing page** - Animated with features showcase
4. ✅ **Registration** - Full signup flow with validation
5. ✅ **Dashboards** - All three user roles functional

---

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Seed database with demo data
npm run db:seed

# Setup Hedera (optional for demo)
npm run setup:hedera
```

---

## Support

For any issues or improvements:
1. Check this guide first
2. Review `README.md` for comprehensive documentation
3. Check `DEMO.md` for demo walkthrough
4. Review `SETUP.md` for detailed setup instructions

---

**Welcome to AfyaUkweli!** 🎉

The platform is now fully functional with:
- Working authentication system
- Password visibility toggles
- Beautiful animated landing page
- Complete user flows for all three roles
- Proper database connectivity

Start by visiting `http://localhost:3000` and explore the features!
