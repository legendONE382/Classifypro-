# ClassifyPro - Quick Start Checklist

## ✅ Pre-Launch Checklist

### Phase 1: Supabase Setup (10 minutes)
- [ ] Create Supabase account at https://supabase.com
- [ ] Create new project named "ClassifyPro-School"
- [ ] Copy `SUPABASE_SETUP.sql` content
- [ ] Run SQL in Supabase SQL Editor
- [ ] Verify all tables created in "Table Editor"
- [ ] Get Project URL from Settings → API
- [ ] Get Anon Key from Settings → API

### Phase 2: Environment Configuration (5 minutes)
- [ ] Create `.env` file in project root
- [ ] Add EXPO_PUBLIC_SUPABASE_URL
- [ ] Add EXPO_PUBLIC_SUPABASE_ANON_KEY
- [ ] Set school GPS coordinates (EXPO_PUBLIC_SCHOOL_LAT/LON)
- [ ] Set geofence radius (default: 100 meters)
- [ ] Save `.env` file

### Phase 3: App Setup (10 minutes)
- [ ] Run `npm install` to install all dependencies
- [ ] Verify no errors after installation
- [ ] Run `npm run typecheck` to check TypeScript
- [ ] Fix any compilation errors

### Phase 4: Testing (15 minutes)
- [ ] Create test user in Supabase Auth (principal@demo.com / password123)
- [ ] Run `npm run start` to launch app
- [ ] Open in Android emulator or physical device
- [ ] Test login with demo credentials
- [ ] Test role selection (Principal/Teacher)
- [ ] Test location permission request
- [ ] Test clock-in with school location simulation
- [ ] Test dashboard screen loads correctly
- [ ] Test grading input form
- [ ] Verify no console errors

### Phase 5: Customization (20 minutes)
- [ ] Update app colors/branding in components
- [ ] Configure school name in database
- [ ] Add real classrooms to database
- [ ] Import teacher data
- [ ] Import student data
- [ ] Set up attendance notification templates

---

## 📋 Features Verification

### Authentication
- [ ] Login screen loads
- [ ] Registration screen works
- [ ] Email validation works
- [ ] Password reset flow works (optional)
- [ ] Session persists on app restart

### Teacher Clock-In
- [ ] Location permission request works
- [ ] GPS coordinates display correctly
- [ ] Distance to school calculates
- [ ] Geofence validation works
- [ ] "Within geofence" message shows when inside
- [ ] "Outside geofence" error shows when outside
- [ ] Clock-in button disabled when outside geofence
- [ ] Success message shows after clock-in
- [ ] Attendance saved to database

### Principal Dashboard
- [ ] Classroom list loads from database
- [ ] Status badges display (teaching/late/empty)
- [ ] Color coding works (green/yellow/red)
- [ ] Refresh button updates data
- [ ] Notification icons show
- [ ] Quick action buttons visible
- [ ] Real-time updates when student clocks in

### Grading
- [ ] Student list loads
- [ ] Grade form inputs accept values
- [ ] Score calculation works (converting to percentage)
- [ ] Letter grades assign correctly:
  - A (90-100%), B (80-89%), C (70-79%), D (60-69%), F (<60%)
- [ ] Session/term tracking works
- [ ] Grade saved to database
- [ ] Grade history displays
- [ ] Can update existing grades

### Student Attendance
- [ ] Student list loads from classroom
- [ ] Check-in records time
- [ ] Check-out updates attendance
- [ ] Weekly summary calculates
- [ ] Attendance status displays (present/late/absent)
- [ ] Parent notifications trigger (optional)

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module '@supabase/supabase-js'"
**Solution:** Run `npm install` and wait for completion

### Issue: "ReferenceError: process is not defined"
**Solution:** Check `.env` file format and restart app

### Issue: GPS location not working
**Solution:** 
- Android: Enable GPS in emulator settings
- iOS: Allow location access when prompted
- Physical device: Turn on device location services

### Issue: "Supabase connection failed"
**Solution:**
- Verify API URL is correct
- Verify anon key is correct
- Check internet connectivity
- Ensure Supabase project is active (not paused)

### Issue: Login unsuccessful
**Solution:**
- Verify user exists in Supabase → Authentication → Users
- Check correct email/password used
- Ensure user email is confirmed (check Supabase Auth)

---

## 📊 Database Tables Summary

| Table | Purpose | Key Fields |
|-------|---------|------------|
| schools | School info | name, location (GPS), geofence_radius |
| users | Accounts | email, role, school_id, full_name |
| classrooms | Class info | name, school_id, qr_token |
| teacher_classrooms | Assignments | teacher_id, classroom_id |
| attendance_logs | Clock-in records | teacher_id, status, clock_in_time |
| students | Student records | full_name, admission_number, school_id |
| grades | Academic scores | student_id, subject, score, session, term |
| attendance_notifications | Alerts | principal_id, event_type, message |

---

## 🚀 Deployment Checklist

### Before Production Release

- [ ] All features tested on real device
- [ ] No console errors or warnings
- [ ] Branding customized (colors, school name, logo)
- [ ] Test data cleared from production database
- [ ] Backup taken of Supabase database
- [ ] Security policies reviewed and applied
- [ ] Notification system integrated (SMS/Email)
- [ ] Performance tested with 100+ users
- [ ] Offline functionality tested
- [ ] API rate limits reviewed
- [ ] Error handling verified
- [ ] User documentation prepared

### Deployment Steps

1. Build APK for Android: `npm run build:android`
2. Test APK on target devices
3. Create GitHub Release
4. Upload APK to release
5. Distribute link to school admins
6. Train staff on usage
7. Monitor for issues first week

---

## 📞 Emergency Contacts

- **Supabase Support:** https://supabase.com/support
- **React Native Issues:** https://github.com/facebook/react-native/issues
- **Expo Support:** https://expo.canny.io

---

## ✨ Success Criteria

Your ClassifyPro app is ready when:

✅ Teachers can clock in with geofence validation
✅ Principals see real-time classroom dashboard
✅ Grades can be entered and calculated
✅ Student attendance tracked automatically
✅ All data persists after app restart
✅ No critical errors in console
✅ App loads in <3 seconds
✅ All buttons responsive
✅ Text is readable and properly formatted
✅ Colors match design specification

---

**🎉 Congratulations! You're ready to launch ClassifyPro!**
