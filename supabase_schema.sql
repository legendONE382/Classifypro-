-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================
-- Schools Table
-- ============================================
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  geofence_radius_meters FLOAT NOT NULL DEFAULT 100,
  address TEXT,
  phone_number TEXT,
  principal_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Users Table (with Supabase Auth reference)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  role TEXT NOT NULL CHECK (role IN ('principal', 'teacher', 'parent', 'admin')),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_school_id ON users(school_id);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- Classrooms Table
-- ============================================
CREATE TABLE IF NOT EXISTS classrooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  class_code TEXT NOT NULL,
  qr_token TEXT UNIQUE,
  grade_level TEXT,
  classroom_teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_classrooms_school_id ON classrooms(school_id);
CREATE UNIQUE INDEX idx_classrooms_code ON classrooms(school_id, class_code);

-- ============================================
-- Attendance Logs Table
-- ============================================
CREATE TABLE IF NOT EXISTS attendance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('on_time', 'late', 'absent')),
  clock_in_time TIMESTAMPTZ NOT NULL,
  verified_location GEOGRAPHY(POINT, 4326) NOT NULL,
  selfie_uri TEXT,
  geofence_validated BOOLEAN DEFAULT false,
  qr_validated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_attendance_logs_teacher_id ON attendance_logs(teacher_id);
CREATE INDEX idx_attendance_logs_school_id ON attendance_logs(school_id);
CREATE INDEX idx_attendance_logs_clock_in_time ON attendance_logs(clock_in_time);

-- ============================================
-- Attendance Notifications Table
-- ============================================
CREATE TABLE IF NOT EXISTS attendance_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  principal_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('late_arrival', 'absent', 'on_time')),
  message TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_principal_id ON attendance_notifications(principal_id);
CREATE INDEX idx_notifications_school_id ON attendance_notifications(school_id);

-- ============================================
-- Students Table
-- ============================================
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  admission_number TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  parent_phone_number TEXT,
  enrollment_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_students_school_id ON students(school_id);
CREATE UNIQUE INDEX idx_students_admission_number ON students(school_id, admission_number);

-- ============================================
-- Student Enrollments Table
-- ============================================
CREATE TABLE IF NOT EXISTS student_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  enrolled_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_enrollments_student_id ON student_enrollments(student_id);
CREATE INDEX idx_enrollments_classroom_id ON student_enrollments(classroom_id);

-- ============================================
-- Student Attendance Table
-- ============================================
CREATE TABLE IF NOT EXISTS student_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  date_recorded DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_student_attendance_student_id ON student_attendance(student_id);
CREATE INDEX idx_student_attendance_date ON student_attendance(date_recorded);

-- ============================================
-- Student Parents Table
-- ============================================
CREATE TABLE IF NOT EXISTS student_parents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL CHECK (relationship IN ('father', 'mother', 'guardian')),
  primary_contact BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_student_parents_student_id ON student_parents(student_id);
CREATE INDEX idx_student_parents_parent_id ON student_parents(parent_id);

-- ============================================
-- Grades Table
-- ============================================
CREATE TABLE IF NOT EXISTS grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  score FLOAT NOT NULL,
  max_score FLOAT NOT NULL DEFAULT 100,
  grade_letter TEXT,
  session TEXT NOT NULL,
  term TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_grades_student_id ON grades(student_id);
CREATE INDEX idx_grades_classroom_id ON grades(classroom_id);
CREATE INDEX idx_grades_teacher_id ON grades(teacher_id);
CREATE INDEX idx_grades_session_term ON grades(session, term);

-- ============================================
-- Report Cards Table
-- ============================================
CREATE TABLE IF NOT EXISTS report_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  session TEXT NOT NULL,
  term TEXT NOT NULL,
  generated_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pdf_uri TEXT,
  total_score FLOAT,
  total_max_score FLOAT,
  average_percentage FLOAT,
  overall_grade TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_report_cards_student_id ON report_cards(student_id);
CREATE INDEX idx_report_cards_school_id ON report_cards(school_id);

-- ============================================
-- Notifications Table
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  message TEXT NOT NULL,
  related_student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- ============================================
-- RPC Functions
-- ============================================

-- Function to validate geofenced attendance
CREATE OR REPLACE FUNCTION validate_geofenced_attendance(
  p_teacher_id UUID,
  p_classroom_id TEXT,
  p_latitude FLOAT,
  p_longitude FLOAT,
  p_selfie_uri TEXT DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  attendance_id UUID,
  status TEXT
) AS $$
DECLARE
  v_school_id UUID;
  v_school_location GEOGRAPHY;
  v_geofence_radius FLOAT;
  v_distance FLOAT;
  v_user_location GEOGRAPHY;
  v_attendance_id UUID;
  v_is_late BOOLEAN;
  v_clock_in_time TIMESTAMPTZ;
BEGIN
  -- Get teacher's school
  SELECT school_id INTO v_school_id FROM users WHERE id = p_teacher_id;
  
  IF v_school_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Teacher not found'::TEXT, NULL::UUID, NULL::TEXT;
    RETURN;
  END IF;

  -- Get school location and geofence
  SELECT location, geofence_radius_meters INTO v_school_location, v_geofence_radius
  FROM schools WHERE id = v_school_id;

  -- Create geography point from user location
  v_user_location := ST_Point(p_longitude, p_latitude)::GEOGRAPHY;

  -- Calculate distance
  v_distance := ST_DistanceSphere(v_school_location, v_user_location);

  -- Check if within geofence
  IF v_distance > v_geofence_radius THEN
    RETURN QUERY SELECT FALSE, 'You are outside the school geofence'::TEXT, NULL::UUID, NULL::TEXT;
    RETURN;
  END IF;

  -- Check if late (after 8:00 AM)
  v_clock_in_time := NOW();
  v_is_late := EXTRACT(HOUR FROM v_clock_in_time) > 8 OR 
             (EXTRACT(HOUR FROM v_clock_in_time) = 8 AND EXTRACT(MINUTE FROM v_clock_in_time) > 0);

  -- Insert attendance log
  INSERT INTO attendance_logs (
    teacher_id,
    classroom_id,
    school_id,
    status,
    clock_in_time,
    verified_location,
    selfie_uri,
    geofence_validated,
    qr_validated
  ) VALUES (
    p_teacher_id,
    p_classroom_id::UUID,
    v_school_id,
    CASE WHEN v_is_late THEN 'late' ELSE 'on_time' END,
    v_clock_in_time,
    v_user_location,
    p_selfie_uri,
    TRUE,
    FALSE
  )
  RETURNING id INTO v_attendance_id;

  RETURN QUERY SELECT 
    TRUE,
    CASE WHEN v_is_late THEN 'Clocked in late'::TEXT ELSE 'Clocked in on time'::TEXT END,
    v_attendance_id,
    CASE WHEN v_is_late THEN 'late' ELSE 'on_time' END;
END;
$$ LANGUAGE plpgsql;

-- Function to get daily classroom status
CREATE OR REPLACE FUNCTION get_daily_classroom_status(p_school_id UUID)
RETURNS TABLE (
  classroom_id UUID,
  classroom_name TEXT,
  teacher_name TEXT,
  status TEXT,
  last_clock_in TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    COALESCE(u.full_name, 'No Teacher') as teacher_name,
    CASE
      WHEN latest_status.status = 'on_time' THEN 'teaching'::TEXT
      WHEN latest_status.status = 'late' THEN 'late'::TEXT
      ELSE 'empty'::TEXT
    END as status,
    latest_status.clock_in_time as last_clock_in
  FROM classrooms c
  LEFT JOIN users u ON c.classroom_teacher_id = u.id
  LEFT JOIN LATERAL (
    SELECT al.status, al.clock_in_time
    FROM attendance_logs al
    WHERE al.classroom_id = c.id
      AND DATE(al.clock_in_time) = CURRENT_DATE
    ORDER BY al.clock_in_time DESC
    LIMIT 1
  ) latest_status ON true
  WHERE c.school_id = p_school_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS on tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_cards ENABLE ROW LEVEL SECURITY;

-- Users can only see their own school's data
CREATE POLICY "Users can see users from their school"
  ON users FOR SELECT
  USING (school_id = (SELECT school_id FROM users WHERE id = auth.uid()));

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

-- Allow authenticated users to insert their own row (for registration)
CREATE POLICY "Users can insert own row"
  ON users FOR INSERT
  WITH CHECK (id = auth.uid());

-- Users can see classrooms from their school
CREATE POLICY "Users can see classrooms from their school"
  ON classrooms FOR SELECT
  USING (school_id = (SELECT school_id FROM users WHERE id = auth.uid()));

-- Users can see attendance logs from their school
CREATE POLICY "Users can see attendance from their school"
  ON attendance_logs FOR SELECT
  USING (school_id = (SELECT school_id FROM users WHERE id = auth.uid()));

-- Grants for authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
