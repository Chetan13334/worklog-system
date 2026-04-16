CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  department VARCHAR(100) NOT NULL,
  designation VARCHAR(100) NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'employee',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_id VARCHAR(64) NOT NULL UNIQUE,
  last_activity_at TIMESTAMP NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  check_in_at TIMESTAMP NOT NULL,
  check_out_at TIMESTAMP NULL,
  total_hours NUMERIC(5, 2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'checked_in',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT attendance_user_date_unique UNIQUE (user_id, attendance_date)
);

CREATE TABLE IF NOT EXISTS leaves (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  leave_type VARCHAR(50) NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO users (username, password, full_name, email, department, designation, role, is_active)
VALUES (
  'employee',
  '$2b$10$rBTe4ib0/nJvVErkTkt47ePMyaqVotQs9dFuq96pv5ZH./2RJ3qPC',
  'Demo Employee',
  'employee@attendanceportal.local',
  'Operations',
  'Employee',
  'employee',
  TRUE
)
ON CONFLICT (username) DO NOTHING;
