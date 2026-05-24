# ClassifyPro - Developer Documentation

## Overview

ClassifyPro is a complete school management system built with React Native/Expo and Supabase. It provides real-time attendance tracking, grading, and student monitoring with geofence validation.

## Architecture Deep Dive

### Frontend Architecture

```
App.tsx (Main Entry)
├── LoginScreen (Authentication)
└── Main App
    ├── PrincipalDashboardScreen (Dashboard)
    ├── TeacherClockInScreen (Attendance)
    ├── GradingScreen (Grades)
    └── StudentAttendanceScreen (Tracking)
```

### State Management (Zustand)

We use **Zustand** for state management with 5 main stores:

#### 1. **useAuthStore** (`src/store/useAuthStore.ts`)
Handles user authentication and profile management.

```typescript
// State
user: User | null
isAuthenticated: boolean
loading: boolean
error: string | null

// Actions
login(email, password)
register(email, password, fullName, role, schoolId)
logout()
checkAuthStatus()
```

#### 2. **useAttendanceStore** (`src/store/useAttendanceStore.ts`)
Manages teacher attendance and clock-in functionality.

```typescript
// State
todayAttendance: AttendanceLog | null
attendanceHistory: AttendanceLog[]
loading: boolean

// Actions
clockIn(teacherId, classroomId, location, schoolLocation, geofenceRadius)
```

#### 3. **useDashboardStore** (`src/store/useDashboardStore.ts`)
Real-time classroom status for principals.

```typescript
// State
classroomStatuses: ClassroomStatus[]
notifications: AttendanceNotification[]

// Actions
fetchClassroomStatuses(schoolId)
fetchNotifications(principalId)
```

#### 4. **useGradingStore** (`src/store/useGradingStore.ts`)
Grade entry and report card management.

```typescript
// State
grades: Grade[]
reportCards: ReportCard[]

// Actions
fetchStudentGrades(studentId)
submitGrade(...)
generateReportCard(...)
```

#### 5. **useStudentStore** (`src/store/useStudentStore.ts`)
Student attendance and parent notifications.

```typescript
// State
students: Student[]
studentAttendance: StudentAttendance | null

// Actions
fetchSchoolStudents(schoolId)
recordStudentCheckIn(studentId, schoolId, status)
```

### Service Layer

#### `src/lib/attendance-service.ts`
- `submitGeofencedAttendance()` - Validates location and creates attendance record
- `getTodayAttendance()` - Fetches attendance for a specific date
- `getClassroomStatusForSchool()` - Real-time classroom status via RPC
- `createAttendanceNotification()` - Push notification system
- `getUnreadNotifications()` - Fetch pending alerts

#### `src/lib/student-service.ts`
- `getSchoolStudents()` - List all students
- `recordStudentCheckIn()` - Student arrival/departure
- `getTodayStudentAttendance()` - Current day tracking
- `notifyParentOfAttendance()` - Parent alerts

#### `src/lib/grading-service.ts`
- `submitGrade()` - Record single grade
- `generateReportCard()` - Create comprehensive report
- `calculateGPA()` - GPA computation
- `getStudentRankingInClass()` - Performance ranking

#### `src/lib/geofencing.ts`
- `calculateDistance()` - Haversine formula for GPS distance
- `isWithinGeofence()` - Validates if user is within school boundary
- `calculateBearing()` - Direction calculation

### Component Structure

#### Smart Components (Containers)
- `PrincipalDashboardScreen` - Fetches and displays real-time data
- `TeacherClockInScreen` - Manages clock-in flow with location
- `GradingScreen` - Student grade entry interface
- `LoginScreen` - Authentication UI

#### Dumb Components (Presentational)
- `StatusBadge` - Shows status (teaching/late/empty)

## Database Schema

### Core Tables

#### `schools`
- School information and geofence location
- Uses PostGIS for geographic queries

#### `users`
- Teachers, principals, parents
- Role-based access control (RBAC)
- Links to Supabase Auth

#### `classrooms`
- Associated with schools
- QR tokens for validation
- Teacher assignments

#### `attendance_logs`
- Teacher clock-in records
- Geofence validation flag
- Location coordinates stored

#### `grades`
- Individual subject scores
- Session and term tracking
- Automatic letter grade assignment

#### `student_attendance`
- Daily check-in/check-out
- Check-in and check-out times
- Status tracking (present/late/absent)

#### `report_cards`
- Generated from grades
- PDF URI storage
- Overall grade calculation

### Key Relationships

```
Schools
├── Users (Teachers, Principals, Parents)
├── Classrooms
│   └── Students (via student_enrollments)
│       ├── Attendance Logs
│       └── Grades
│           └── Report Cards
└── Attendance Logs (Teacher)
```

## Real-Time Features

### Supabase Realtime Integration

The dashboard uses **Supabase Realtime** subscriptions for live updates:

```typescript
// Example: Listen to attendance changes
supabase
  .from('attendance_logs')
  .on('INSERT', (payload) => {
    // Update UI immediately
    updateDashboard(payload.new)
  })
  .subscribe()
```

When a teacher clocks in:
1. Attendance record inserted in DB
2. Realtime event broadcast
3. Principal's UI updates instantly
4. No manual refresh needed

## Security Implementation

### Row Level Security (RLS)

Enable RLS policies to isolate data by school:

```sql
CREATE POLICY "Users can see users from their school"
  ON users FOR SELECT
  USING (school_id = (SELECT school_id FROM users WHERE id = auth.uid()));
```

### Geofence Validation (Server-Side)

Location checks happen on Supabase via RPC to prevent client tampering:

```typescript
// Client submits location
submitGeofencedAttendance({
  teacherId: "xxx",
  latitude: 6.9271,
  longitude: 3.3955
})

// Server RPC validates:
// 1. Calculate distance using PostGIS
// 2. Check against geofence radius
// 3. Create record only if valid
```

### Authentication Flow

```
1. User enters email/password
2. Supabase Auth validates
3. JWT token issued
4. Token stored in device
5. All API requests include token
6. Server-side RLS policies enforce permissions
```

## Error Handling

### Validation Layers

1. **Client-side** - Input validation before submission
2. **RPC-level** - Business logic validation
3. **RLS-level** - Permission enforcement
4. **Database-level** - Constraint enforcement

### Error Messages

All operations return this format:

```typescript
{
  success: boolean,
  message: string,
  data?: any,
  error?: string
}
```

## Performance Optimizations

### 1. Geofencing
- Uses Haversine formula (fast calculation)
- Server-side validation (prevents cheating)
- Caching of school locations

### 2. Queries
- Indexed frequently queried columns
- Pagination for lists
- Lazy loading of historical data

### 3. Components
- React.memo for expensive renders
- useCallback for handler optimization
- Zustand for fine-grained reactivity

## Testing Checklist

- [ ] Location permission request works
- [ ] Geofence validation blocks out-of-range clocks
- [ ] Attendance records appear on dashboard in real-time
- [ ] Grade submission updates student record
- [ ] Report cards generate with correct calculations
- [ ] Parent notifications send on attendance changes
- [ ] Morning/late logic works correctly (cutoff: 8:00 AM)
- [ ] Multi-school data isolation works
- [ ] Role-based UI rendering works

## Deployment Checklist

Before going to production:

- [ ] Enable RLS on all tables
- [ ] Rotate Supabase keys
- [ ] Set CORS properly
- [ ] Configure email service for notifications
- [ ] Set up AWS S3 for file storage (selfies, PDFs)
- [ ] Enable backup strategy
- [ ] Set up monitoring/logging
- [ ] Test with real network conditions
- [ ] Load test the dashboard
- [ ] Security audit RPC functions

## Future Enhancements

1. **Offline Support**
   - Queue attendance when offline
   - Sync when reconnected

2. **Advanced Analytics**
   - Attendance trends
   - Performance charts
   - Anomaly detection

3. **Parent Portal**
   - Performance tracking
   - Attendance history
   - Two-way messaging

4. **Payment Integration**
   - School fees management
   - Automated receipts
   - Payment reminders

5. **AI Features**
   - Predictive alerting
   - Performance predictions
   - Automated report generation

## Contributing Guidelines

1. Follow Expo best practices
2. Use TypeScript for type safety
3. Add error handling to all API calls
4. Test on real device before PR
5. Update types in `domain.ts` if adding new features
6. Document RPC functions in SQL comments

## Resources

- **Expo Docs**: https://docs.expo.dev
- **React Native**: https://reactnative.dev
- **Supabase**: https://supabase.com/docs
- **Zustand**: https://github.com/pmndrs/zustand
- **PostGIS**: https://postgis.net/documentation/

## Troubleshooting

### TypeScript Errors
- Run `npm run typecheck`
- Ensure all imports are correct
- Check `domain.ts` for type definitions

### Supabase Connection Issues
- Verify `.env` credentials
- Check Supabase project is running
- Look at browser DevTools Network tab

### Real-time Updates Not Working
- Ensure Realtime is enabled in Supabase
- Check subscription is active
- Verify user has RLS permission
- Check for browser console errors

## Contact

For questions or issues:
- Email: support@estech-solutions.com
- GitHub Issues: [your-repo]/issues
- Documentation: See README.md
