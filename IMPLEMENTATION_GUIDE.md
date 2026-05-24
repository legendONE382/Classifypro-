# ClassifyPro Implementation Guide - Setup & Deployment

## 🚀 Complete Setup Instructions

### Part 1: Supabase Project Setup (5-10 minutes)

#### Step 1: Create Supabase Account & Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up with email or GitHub
3. Create new project:
   - **Project name:** ClassifyPro-School
   - **Database password:** Create a strong password
   - **Region:** Select closest to your school
4. Wait for project to be created (2-3 minutes)

#### Step 2: Create Database Schema
1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Copy **entire contents** from `SUPABASE_SETUP.sql` file in the project root
4. Paste into the SQL editor
5. Click **Run** (green button)
6. Wait for all queries to execute successfully
7. You should see: "Success. No rows returned" for each query

#### Step 3: Configure Authentication
1. Go to **Authentication** → **Providers** (left sidebar)
2. Make sure **Email** provider is enabled
3. Configure email settings if you want custom templates

#### Step 4: Get Your API Credentials
1. Go to **Settings** → **API** (left sidebar)
2. You'll see:
   - **PROJECT_URL**: Copy this (looks like `https://xxxxx.supabase.co`)
   - **anon key**: Copy this (public key, starts with `eyJ`)
3. **Save these safely** - you'll need them next

---

### Part 2: Mobile App Setup (5 minutes)

#### Step 1: Configure Environment Variables
1. In the project root folder, create a file named `.env`:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EXPO_PUBLIC_SCHOOL_LAT=6.9271
EXPO_PUBLIC_SCHOOL_LON=3.3955
EXPO_PUBLIC_GEOFENCE_RADIUS=100
```

**Replace:**
- `https://your-project-id.supabase.co` with your Project URL from Supabase
- `your-anon-key-here` with your anon key from Supabase
- `EXPO_PUBLIC_SCHOOL_LAT` and `EXPO_PUBLIC_SCHOOL_LON` with your school's GPS coordinates
- `EXPO_PUBLIC_GEOFENCE_RADIUS` is the radius in meters where teachers can clock in (default 100m)

**Find your school's coordinates:**
- Use Google Maps, search for your school
- Right-click on the location → click "What's here"
- Coordinates appear at the bottom

#### Step 2: Install Dependencies
```bash
npm install
```

#### Step 3: Run the App
```bash
npm run start
```

This will show options:
- **i** → Open in iOS simulator
- **a** → Open in Android emulator
- **w** → Open in web browser
- **j** → Open in Expo Go app (on physical device)

---

### Part 3: Test the App (5-10 minutes)

#### Create Test Data
1. Go back to Supabase SQL Editor
2. Run this query to create a demo school:

```sql
-- Insert a school
INSERT INTO schools (name, location, geofence_radius_meters)
VALUES ('Demo School', ST_GeogFromText('SRID=4326;POINT(3.3955 6.9271)'), 100);

-- Insert a principal user
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at)
VALUES (
  gen_random_uuid(),
  'principal@demo.com',
  crypt('password123', gen_salt('bf')),
  now()
);

-- Note: Use simpler auth in development - set these manually in Supabase Auth UI
```

**Easier way - Use Supabase UI:**
1. Go to **Authentication** → **Users** (left sidebar)
2. Click **"Add user"**
3. Email: `principal@demo.com`
4. Password: `password123`
5. Click **Save**

#### Test in App
1. Login with generated credentials
2. Choose role (Principal or Teacher)
3. Click through screens
4. Test attendance functionality

---

## 🔑 Feature Breakdown

### 1. **Teacher Clock-In** (Geo-Fenced Attendance)
- ✅ GPS location tracking
- ✅ Geofence validation (must be within 100m of school)
- ✅ Classroom QR code mapping
- ✅ Optional selfie verification
- ✅ Real-time status updates

**Flow:**
1. Teacher taps "Clock In"
2. App gets GPS coordinates
3. Server validates location (PostGIS)
4. Teacher scans classroom QR code
5. Attendance recorded with status (on_time/late)

### 2. **Principal Dashboard**
- ✅ Real-time classroom status (teaching/late/empty)
- ✅ Color-coded status indicators
- ✅ Attendance statistics
- ✅ Quick action buttons
- ✅ Notification alerts

**Features:**
- Green = Teaching (clocked in on time)
- Yellow = Late (clocked in after 8 AM)
- Red = Empty (no teacher present)

### 3. **Grading System**
- ✅ Input grades per student
- ✅ Automatic letter grade calculation
- ✅ Session/term tracking
- ✅ Report card generation
- ✅ Class performance insights

**Grading Scale:**
- A: 90-100%
- B: 80-89%
- C: 70-79%
- D: 60-69%
- F: Below 60%

### 4. **Student Management**
- ✅ Student attendance tracking
- ✅ Check-in/check-out times
- ✅ Weekly attendance summary
- ✅ Parent notifications (SMS integration ready)

### 5. **Real-Time Sync**
- ✅ WebSocket subscriptions via Supabase Realtime
- ✅ Instant dashboard updates
- ✅ Live notification delivery
- ✅ Offline queue support (coming soon)

---

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   └── StatusBadge.tsx  # Classroom status indicator
├── lib/                 # Utility & business logic
│   ├── supabase.ts      # Supabase client
│   ├── env.ts           # Environment configuration
│   ├── geofencing.ts    # GPS & geofence logic
│   ├── qr-validation.ts # QR code utilities
│   ├── attendance-service.ts  # Attendance API calls
│   ├── grading-service.ts     # Grading API calls
│   └── student-service.ts     # Student API calls
├── screens/             # Main screen components
│   ├── LoginScreen.tsx          # Auth
│   ├── RegisterScreen.tsx       # Registration
│   ├── ClockInScreen.tsx        # Teacher clock-in
│   ├── TeacherClockInScreen.tsx # Teacher flows
│   ├── PrincipalDashboardScreen.tsx  # Dashboard
│   └── GradingScreen.tsx        # Grade input
├── store/               # Zustand state management
│   ├── useAuthStore.ts           # Auth state
│   ├── useAttendanceStore_new.ts # Attendance state
│   ├── useDashboardStore.ts      # Dashboard state
│   ├── useGradingStore.ts        # Grading state
│   └── useStudentStore.ts        # Student state
└── types/               # TypeScript definitions
    └── domain.ts        # App data types
```

---

## 🔧 Configuration Guide

### `.env` Variables Explained

```bash
# Supabase connection
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# School location (GPS coordinates)
EXPO_PUBLIC_SCHOOL_LAT=6.9271      # Default: Lagos, Nigeria
EXPO_PUBLIC_SCHOOL_LON=3.3955      # Change to your school

# Geofence radius in meters
EXPO_PUBLIC_GEOFENCE_RADIUS=100    # 100m = ~300ft
```

### Customizing Geofence Radius
- **Small schools:** 50-75m
- **Medium schools:** 100-150m
- **Large schools:** 200-300m

### Changing School Location
1. Find GPS coordinates on Google Maps
2. Right-click location → "What's here"
3. Update `.env`:
   ```bash
   EXPO_PUBLIC_SCHOOL_LAT=your_latitude
   EXPO_PUBLIC_SCHOOL_LON=your_longitude
   ```
4. Restart the app with `npm run start`

---

## 🐛 Troubleshooting

### "Cannot connect to Supabase"
**Solution:**
- Check `.env` file has correct URL and anon key
- Verify Supabase project is active (not paused)
- Check internet connection
- Try: `npm run start` again

### "Location permission denied"
**Solution:**
- Android: Settings → Apps → ClassifyPro → Permissions → Location → Allow
- iOS: Settings → Privacy → Location → Allow for ClassifyPro

### "Geofence validation failed"
**Solution:**
- Make sure device GPS is enabled
- Move closer to the school location configured in `.env`
- Check GPS accuracy (wait 10-15 seconds for GPS lock)
- Verify `.env` coordinates are correct

### "Login fails with 'Invalid credentials'"
**Solution:**
- Make sure user was created in Supabase **Authentication** → **Users**
- Double-check email/password
- Try creating a new test user

### "Database schema errors"
**Solution:**
- Make sure you ran the complete `SUPABASE_SETUP.sql` file
- Check for SQL errors in Supabase SQL Editor
- Enable PostGIS extension: `CREATE EXTENSION IF NOT EXISTS postgis;`

---

## 📱 Building for Production

### Android APK
```bash
npm run android -- --release
```

### iOS
```bash
npm run ios -- --release
```

### Web (Vercel)
```bash
npm run build
```

---

## 🚀 Next Steps After Setup

1. **Create test users** in Supabase Authentication
2. **Seed test data** with sample classrooms and students
3. **Configure geofence** for your school location
4. **Test each feature** (login, clock-in, dashboard, grading)
5. **Set up SMS notifications** (integrate Twilio API)
6. **Deploy to production** (Build APK for Android)
7. **Train staff** on using the app

---

## 📞 Support Resources

- **Supabase Docs:** https://supabase.com/docs
- **React Native Docs:** https://reactnative.dev
- **Expo Docs:** https://docs.expo.dev
- **PostGIS Guide:** https://postgis.net/docs/

---

## ✅ Checklist

- [ ] Supabase project created
- [ ] Database schema imported (`SUPABASE_SETUP.sql`)
- [ ] `.env` file configured with API credentials
- [ ] School location (GPS) set in `.env`
- [ ] Dependencies installed (`npm install`)
- [ ] Test user created in Supabase
- [ ] App runs successfully (`npm run start`)
- [ ] Login works with test credentials
- [ ] Location permission granted
- [ ] Clock-in feature tested
- [ ] Dashboard displays correctly
- [ ] Grading interface works

---

**You're all set! The ClassifyPro mobile app is now fully functional and ready for deployment.** 🎉
