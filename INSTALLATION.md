# ClassifyPro Installation & Deployment Guide

## 🎯 Installation Overview

This guide walks you through getting ClassifyPro fully operational in **15-20 minutes**.

---

## Phase 1: Supabase Setup (5 minutes)

### 1.1 Create Supabase Account
```
1. Visit https://supabase.com
2. Click "Sign Up" 
3. Choose email or GitHub sign-in
4. Verify email
```

### 1.2 Create Project
```
Dashboard → New Project

Project Name: ClassifyPro
Database Password: [Create strong password]
Region: [Pick closest to your school]
Pricing: Free (default)

⏳ Wait 2-3 minutes for deployment
```

### 1.3 Navigate to SQL Editor
```
Left sidebar → SQL Editor → New query
```

### 1.4 Import Database Schema
```
1. Open SUPABASE_SETUP.sql file
2. Select all content (Ctrl+A / Cmd+A)
3. Copy entire file
4. Paste into Supabase SQL editor
5. Click "RUN" button
6. ✓ Wait for success messages
```

**Expected output:**
```
✓ CREATE EXTENSION
✓ CREATE TABLE schools
✓ CREATE TABLE users
... (13 more tables)
✓ CREATE POLICY
```

### 1.5 Get API Credentials
```
Left sidebar → Settings → API

Copy and save:
- PROJECT_URL (example: https://xxxxx.supabase.co)
- ANON_KEY (example: eyJ0eXAiOiJKV1QiLCJhbGc...)

⚠️ Save these! You'll need them next.
```

---

## Phase 2: Environment Configuration (5 minutes)

### 2.1 Create .env File
```
In project root folder, create a file named: .env

Add these lines:
```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGc...
EXPO_PUBLIC_SCHOOL_LAT=6.9271
EXPO_PUBLIC_SCHOOL_LON=3.3955
EXPO_PUBLIC_GEOFENCE_RADIUS=100
```

### 2.2 Update Credentials
```
Replace:
- xxxxx.supabase.co with your PROJECT_URL
- eyJ0eXAiOiJKV1QiLCJhbGc... with your ANON_KEY
```

### 2.3 Update School Location
```
1. Open Google Maps
2. Search for your school
3. Right-click on school location
4. Select "What's here"
5. Coordinates appear at bottom

Update:
- EXPO_PUBLIC_SCHOOL_LAT = your latitude
- EXPO_PUBLIC_SCHOOL_LON = your longitude

Example (Lagos):
EXPO_PUBLIC_SCHOOL_LAT=6.5244
EXPO_PUBLIC_SCHOOL_LON=3.3792
```

### 2.4 Geofence Radius
```
EXPO_PUBLIC_GEOFENCE_RADIUS = distance in meters

Recommendations:
- Small campus: 50-75 meters
- Medium campus: 100-150 meters
- Large campus: 200-300 meters
- Multi-site: 500+ meters
```

### 2.5 Save File
```
Save .env file (Ctrl+S / Cmd+S)
```

---

## Phase 3: Install Dependencies (3 minutes)

### 3.1 Install Node Packages
```bash
npm install
```

**Expect:**
```
added 500+ packages in 30-60 seconds
```

### 3.2 Verify Installation
```bash
npm run typecheck
```

**Expected output:**
```
✓ No errors found
✓ Successfully compiled
```

If errors appear:
```
1. Delete node_modules folder
2. Run: npm install again
3. Wait for completion
```


---

## Phase 4: Create Test User (2 minutes)

### 4.1 Access Supabase Auth
```
Supabase Dashboard → Authentication → Users → Add user
```

### 4.2 Create Principal User
```
Email: principal@demo.com
Password: Password123!

Click: Send invite email

Or:
Enable "Disable email verification"
Then create user directly
```

### 4.3 Create Teacher User (Optional)
```
Email: teacher@demo.com
Password: Teacher123!
```

---

## Phase 5: Run Application (2 minutes)

### 5.1 Start Development Server
```bash
npm run start
```

**Output will show:**
```
✔ Expo server running
✔ Metro bundler ready

Press:
  a  -  Open in Android emulator
  i  -  Open in iOS simulator
  w  -  Open in web browser
  j  -  Open in Expo Go app
```

### 5.2 Choose Platform
```
Press "a" for Android emulator (most accessible)

Wait 30-60 seconds for app to load...
```

### 5.3 Expected First Screen
```
ClassifyPro logo
Login form
Demo credentials hint
```

---

## Phase 6: Test Basic Functionality (3 minutes)

### 6.1 Login Test
```
Email: principal@demo.com
Password: Password123!

Click: Login

✓ Should see dashboard after ~1 second
```

### 6.2 Location Test
```
Emulator: Enable location simulation
- Android: Settings → Dev Tools → Location
- iOS: Xcode → Develop → Simulate Location

Select school location
```

### 6.3 Dashboard Test
```
✓ See 3 summary cards (Teaching/Late/Empty)
✓ See classroom list below
✓ Pull down to refresh
✓ Cards show color-coded status
```

### 6.4 Grading Test
```
1. Tap "Grading" section
2. Select a student
3. Enter grade data:
   - Subject: Mathematics
   - Score: 85
   - Max: 100
4. Click "Submit"
5. ✓ Should show "Success"
6. Refresh to see grade in history
```

---

## ✅ Verification Checklist

After running app, verify:

- [ ] App screenshot shows ClassifyPro logo
- [ ] Login screen loads without errors
- [ ] Demo credentials work
- [ ] Principal dashboard displays
- [ ] Classroom cards visible with status
- [ ] Summary statistics show correct counts
- [ ] Colors display correctly (green/yellow/red)
- [ ] Grading form appears
- [ ] Location permission dialog shows
- [ ] No red error messages in console
- [ ] Buttons respond to taps
- [ ] Pull-to-refresh works

**If any fail:**
1. Check console for errors
2. Verify .env file is correct
3. Check internet connection
4. Restart app with: Ctrl+C then `npm run start`

---

## 🔍 Debugging

### Check Supabase Connection
```
1. Go to Supabase Dashboard
2. Click "Table Editor"
3. Select any table
4. Should see data loading
```

### Check Environment Variables
```
In your terminal, verify:
echo $EXPO_PUBLIC_SUPABASE_URL

Should show: https://xxxxx.supabase.co
```

### Enable Console Logging
```
In code, check browser console:
- Right-click > Inspect > Console tab
- Look for error messages
- Search for "Error" or red text
```

### Reset App State
```bash
# Clear cache and restart
npm run start -- --clear

# Or fully reset:
rm -rf node_modules
npm install
npm run start
```

---

## 📱 Next Steps

### For Development
```bash
npm run start           # Local testing
npm run typecheck      # Check types
```

### For Testing on Real Device
```bash
npm run android        # Build for Android
npm run ios           # Build for iOS
```

### For Production
```bash
npm run build:android  # Create APK
npm run build:ios     # Create IPA
```

---

## ⚙️ Advanced Configuration

### Change Grading Scale
Edit in `src/lib/grading-service.ts`:
```typescript
export const getGradeLetter = (percentage: number): string => {
  if (percentage >= 90) return "A";    // Change 90 as needed
  if (percentage >= 80) return "B";    // Change 80 as needed
  // ... etc
};
```

### Customize Colors
Edit in component stylesheets:
```javascript
const styles = StyleSheet.create({
  summaryValue: {
    color: "#10B981",  // Green - Change hex code
  },
  // ... more styles
});
```

### Adjust Cutoff Time
Edit in `submitGeofencedAttendance`:
```typescript
// Default: 8 AM is considered on-time
if (EXTRACT(HOUR FROM now()) > 8 THEN 'late'
                                    ↑ Change 8
```

---

## 📞 Troubleshooting

### "Module not found" Error
```
Solution: npm install
Then: npm run start
```

### "Connection refused" Error
```bash
Solution: 
1. Check .env file exists
2. Check URL is correct
3. Check internet connection
4. Restart app
```

### "Permission denied" (Location)
```
Solution:
- Android: Settings → Apps → Permissions → Location → Allow
- iOS: Settings → Privacy → Location → ClassifyPro → Allow
```

### "Geofence validation failed"
```
Solution:
1. Enable GPS on emulator/device
2. Set location to school area
3. Wait 10 seconds for GPS lock
4. Check .env coordinates are correct
```

### App Crashes on Startup
```
Solution:
1. Check console for error message
2. Make sure all dependencies installed (npm install)
3. Clear cache (npm start -- --clear)
4. Check .env syntax (no typos, proper format)
5. Verify Supabase is active (not paused)
```

---

## 🚀 Production Deployment

### Step 1: Build APK (Android)
```bash
npm run build:android
```

### Step 2: Test APK
```
1. Download APK from build logs
2. Transfer to Android device
3. Enable "Unknown Sources" in Settings
4. Install APK
5. Test all features on real device
```

### Step 3: Distribute
```
1. Upload to GitHub Releases
2. Create download link
3. Send to school admins
4. Provide installation instructions
```

### Step 4: Monitor
```
1. Check for crashes first week
2. Collect user feedback
3. Monitor database performance
4. Track attendance accuracy
```

---

## 📊 Expected Performance

After full setup:

| Action | Expected Time |
|--------|----------------|
| App startup | 2-3 seconds |
| Login | 1 second |
| Dashboard load | 1 second |
| Clock-in submission | 2 seconds |
| Grade submission | 1 second |
| Real-time update | 500ms |

If slower, check:
- Internet connection speed
- Supabase project resources
- Device storage/memory

---

## ✨ Success Indicators

Your setup is complete when:

✅ App loads without errors
✅ Login works with test credentials
✅ Dashboard shows classroom statuses
✅ Colors display correctly (green/yellow/red)
✅ Location permission requests
✅ Grading interface works
✅ No red errors in console
✅ All buttons respond
✅ Data persists after restart

---

## 📚 Documentation Reference

For more information, see:

- **Setup Details:** `IMPLEMENTATION_GUIDE.md`
- **Troubleshooting:** `QUICK_START.md`
- **Project Overview:** `PROJECT_SUMMARY.md`
- **Configuration Help:** `SETUP_GUIDE.md`

---

## 🎉 You're Ready!

ClassifyPro is now installed and ready for use. 

**Next:** Add your school data and train your staff!

---

## 📞 Support

- Supabase Issues: https://supabase.com/support
- React Native Help: https://reactnative.dev/docs
- Expo Docs: https://docs.expo.dev

---

**ClassifyPro - Making School Administration Simple & Transparent** ✨
