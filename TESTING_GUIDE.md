# ClassifyPro - Testing & Verification Guide

This guide helps you verify that all features of ClassifyPro are working correctly.

## Pre-Test Checklist

- [ ] `.env` file is created with correct Supabase credentials
- [ ] Supabase schema has been imported (`supabase_schema.sql`)
- [ ] Test data has been created
- [ ] App is running (`npm run start`)
- [ ] You have at least 2 test accounts (principal + teacher)

## Test Scenarios

### 1. Authentication Tests

#### Test 1.1: Login with Valid Credentials
```
Expected: User logs in successfully → Dashboard displays
```
- [ ] Principal can login
- [ ] Teacher can login
- [ ] Parent can login (if created)
- [ ] User name displays in header

#### Test 1.2: Login with Invalid Credentials
```
Expected: Error message appears
```
- [ ] Wrong password shows error
- [ ] Non-existent email shows error
- [ ] Error can be dismissed

#### Test 1.3: Logout
```
Expected: Return to login screen
```
- [ ] Logout button appears in header
- [ ] Clicking logout returns to LoginScreen
- [ ] Session is cleared
- [ ] Subsequent login requires credentials again

#### Test 1.4: Sign Up (Optional)
```
Expected: New account created
```
- [ ] Can fill all required fields
- [ ] Role selection works (principal/teacher)
- [ ] Account created in Supabase
- [ ] Can immediately login with new account

---

### 2. Dashboard Tests (Principal Only)

#### Test 2.1: Classroom Status Display
```
Expected: Shows real-time classroom status
```
- [ ] Classrooms appear as cards
- [ ] Status badge shows (Teaching/Late/Empty)
- [ ] Teacher name displays correctly
- [ ] Last clock-in time is shown

#### Test 2.2: Summary Cards
```
Expected: Aggregate counts display
```
- [ ] "Teaching" count is correct
- [ ] "Late" count is correct
- [ ] "Empty" count is correct
- [ ] Totals update when new attendance logged

#### Test 2.3: Real-Time Updates
```
Expected: Dashboard updates without refresh
```
- [ ] Have teacher clock in from another device/tab
- [ ] Dashboard updates within 2 seconds
- [ ] No manual refresh needed
- [ ] Status color changes appropriately

#### Test 2.4: Notifications
```
Expected: Late arrival alerts appear
```
- [ ] Notification appears when teacher is late
- [ ] Contains teacher name and classroom
- [ ] Can mark as read
- [ ] Read notifications are visually distinct

---

### 3. Teacher Clock-In Tests

#### Test 3.1: Location Permission
```
Expected: Device location is used
```
- [ ] App requests location permission
- [ ] Permission can be granted
- [ ] Current distance to school displays
- [ ] "Refresh Location" updates distance

#### Test 3.2: Geofence Validation - Within Range
```
Expected: Clock in succeeds
```
Prerequisites: Be within the geofence (or emulate it)
- [ ] Distance shows "Within range ✅"
- [ ] Clock In button is enabled
- [ ] Classroom selector appears
- [ ] Can select a classroom
- [ ] After clicking "Clock In":
  - [ ] Success message appears
  - [ ] Status shows "On Time" or "Late"
  - [ ] Time is recorded correctly

#### Test 3.3: Geofence Validation - Outside Range
```
Expected: Clock in is blocked
```
Prerequisites: Be outside the geofence (or emulate it)
- [ ] Distance shows "Outside range ❌"
- [ ] Clock In button is disabled
- [ ] Error message explains geofence requirement
- [ ] Cannot proceed without being in geofence

#### Test 3.4: Late Detection
```
Expected: Late status is marked correctly
```
Prerequisites: Clock in after 8:00 AM, or manually set system time
- [ ] Status shows "LATE" instead of "ON_TIME"
- [ ] Record is saved with 'late' status
- [ ] Principal dashboard shows "Late" status

#### Test 3.5: Classroom Selection
```
Expected: Classroom chooser works
```
- [ ] Available classrooms display
- [ ] Can select a classroom
- [ ] Selection persists until change
- [ ] Cannot clock in without selection

---

### 4. Grading Tests

#### Test 4.1: Student Selection
```
Expected: Can find and select students
```
- [ ] Student search works by name
- [ ] Student search works by admission number
- [ ] Limited results display correctly
- [ ] Selected student shows in UI

#### Test 4.2: Grade Entry
```
Expected: Grades are saved correctly
```
- [ ] Subject field is required
- [ ] Score field accepts numbers
- [ ] Max score defaults to 100
- [ ] Can customize max score
- [ ] Percentage preview displays
- [ ] Grade letter is calculated (A-F)
- [ ] After submit: Grade appears in history

#### Test 4.3: Grade Validation
```
Expected: Bad data is rejected
```
- [ ] Cannot submit without subject
- [ ] Cannot submit invalid score numbers
- [ ] Cannot submit zero max score
- [ ] Cannot submit without student selection

#### Test 4.4: GPA Calculation
```
Expected: Correct GPA displays
```
- [ ] After adding grades: GPA displays
- [ ] GPA is accurate to 2 decimal places
- [ ] GPA updates when new grades added
- [ ] GPA formula is correct: (sum of grade points) / (number of grades)

#### Test 4.5: Report Card Generation
```
Expected: Report card creates with summary
```
- [ ] Can generate report card
- [ ] Contains all grades for viewing
- [ ] Shows overall grade
- [ ] Shows GPA

---

### 5. Student Attendance Tests (Parent Dashboard)

#### Test 5.1: Today's Status
```
Expected: Current attendance displays
```
- [ ] Shows student status (Present/Late/Absent)
- [ ] Check-in time displays if applicable
- [ ] Color codes are correct

#### Test 5.2: Weekly Summary
```
Expected: Week totals are accurate
```
- [ ] Present count is correct
- [ ] Late count is correct
- [ ] Absent count is correct
- [ ] Totals add up correctly

#### Test 5.3: Monthly Calendar
```
Expected: Calendar view works
```
- [ ] Can select different months
- [ ] Calendar displays correct days
- [ ] Can select year if needed
- [ ] All dates in month show attendance status

---

### 6. Data Integrity Tests

#### Test 6.1: Multi-School Isolation
```
Expected: Schools cannot see each other's data
```
Prerequisites: Create two schools with different users
- [ ] School A user sees only School A data
- [ ] School B user sees only School B data
- [ ] Dashboards are completely separate

#### Test 6.2: Role-Based Access
```
Expected: Users see only their role's tabs
```
- [ ] Principal sees: Dashboard, Grading
- [ ] Teacher sees: Clock In, Grading
- [ ] Parent sees: Attendance only
- [ ] Tabs match user role

#### Test 6.3: Permission Enforcement
```
Expected: Users cannot access other's data
```
- [ ] Teacher cannot see other teachers' attendance
- [ ] Teacher cannot modify student grades (if not their class)
- [ ] Principal can see all school data
- [ ] Parent sees only their child's data

---

### 7. Error Handling Tests

#### Test 7.1: Network Error Handling
```
Expected: App handles connectivity issues gracefully
```
Prerequisites: Disable internet or use network throttling
- [ ] Error messages display clearly
- [ ] Can retry operations
- [ ] App doesn't crash
- [ ] Can dismiss errors

#### Test 7.2: Validation Error Handling
```
Expected: User gets helpful error messages
```
- [ ] Required fields show error message
- [ ] Invalid format shows specific error
- [ ] Error messages explain the issue
- [ ] Can correct and retry

#### Test 7.3: Server Error Handling
```
Expected: 5xx errors are handled
```
- [ ] Server errors show friendly message
- [ ] Retry button is available
- [ ] App doesn't freeze or crash
- [ ] Can try again later

---

### 8. Performance Tests

#### Test 8.1: Dashboard Load Time
```
Expected: Loads in under 2 seconds
```
Prerequisites: Fresh login, classroom data exists
- [ ] Dashboard loads quickly
- [ ] Data populates smoothly
- [ ] No loading spinners lasting > 2 seconds

#### Test 8.2: List Scrolling Performance
```
Expected: Smooth scrolling, no jank
```
- [ ] Grading students list scrolls smoothly
- [ ] Attendance calendar doesn't lag
- [ ] No UI freezing while scrolling

#### Test 8.3: Real-Time Performance
```
Expected: Live updates don't slow app
```
- [ ] Dashboard real-time updates don't affect UI responsiveness
- [ ] Can interact while updates happening
- [ ] No memory leaks on long usage

---

### 9. UI/UX Tests

#### Test 9.1: Responsive Design
```
Expected: UI works on different screen sizes
```
- [ ] Works on small phones (320px)
- [ ] Works on large phones (480px+)
- [ ] Works on tablets (if you have one)
- [ ] All buttons are tap-able (min 44px)

#### Test 9.2: Color & Accessibility
```
Expected: UI is accessible
```
- [ ] Green/Red colors not only differentiator
- [ ] Text contrast meets WCAG standards
- [ ] All interactive elements are reachable
- [ ] Font size is readable

#### Test 9.3: User Feedback
```
Expected: User knows what's happening
```
- [ ] Loading indicators show during async operations
- [ ] Buttons provide visual feedback when pressed
- [ ] Success/error messages are clear
- [ ] Action results are visible

---

## Test Data Creation SQL

Run these in Supabase SQL Editor to populate test data:

```sql
-- Create multiple classrooms
INSERT INTO classrooms (school_id, name, class_code, grade_level)
SELECT id, 'Junior Secondary 1', 'JSS1', 'JSS1' FROM schools LIMIT 1
UNION ALL
SELECT id, 'Junior Secondary 2', 'JSS2', 'JSS2' FROM schools LIMIT 1;

-- Create students
INSERT INTO students (school_id, full_name, admission_number, grade_level)
SELECT id, 'Chioma Okoro', 'ADM-001', 'JSS1' FROM schools LIMIT 1
UNION ALL
SELECT id, 'Tunde Adeyemi', 'ADM-002', 'JSS1' FROM schools LIMIT 1
UNION ALL
SELECT id, 'Amara Usman', 'ADM-003', 'JSS2' FROM schools LIMIT 1;

-- Create sample grades
INSERT INTO grades (student_id, classroom_id, teacher_id, school_id, subject, score, max_score, grade_letter, session, term)
SELECT 
  s.id, 
  c.id, 
  u.id,
  s.school_id,
  'Mathematics',
  78,
  100,
  'B',
  '2024/2025',
  '1'
FROM students s, classrooms c, users u 
WHERE c.name = 'Junior Secondary 1' 
LIMIT 1;
```

---

## Sign-Off Checklist

After completing all tests, verify:

- [ ] All authentication flows work
- [ ] Dashboard shows real-time updates
- [ ] Geofencing validates correctly
- [ ] Grading system is accurate
- [ ] Student tracking works
- [ ] Data isolation is enforced
- [ ] Errors are handled gracefully
- [ ] UI is responsive
- [ ] No crashes on any path
- [ ] Performance is acceptable

## Known Issues / Limitations

Document any issues found:

| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| ? | ? | ? | ? |

## Approval

- [ ] Developer: Tested and verified all features
- [ ] QA: Confirmed testing complete
- [ ] Ready for deployment

---

**Testing completed on**: _____________  
**Tested by**: _____________  
**Any issues found**: _____________
