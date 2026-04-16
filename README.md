# Employee Attendance Portal

Web-based attendance portal built with React, Node.js, Express, Sequelize, and PostgreSQL.

## Project Structure

- `frontend/` React app built with Vite
- `backend/` Express API with Sequelize
- `database.sql` SQL script for schema and seed data
- `.env.example` environment variables

## Requirements

- Node.js 18 or later
- PostgreSQL 14 or later

## Environment Variables

Copy `.env.example` into `backend/.env` and update the values:

```env
PORT=5000
DB_NAME=attendance_portal
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=secret123
```

## Database Setup

You can set up the database in either of these ways:

### Option 1: Run the SQL script

1. Create a PostgreSQL database named `attendance_portal`.
2. Open `database.sql` in your SQL client.
3. Run the script to create all tables and seed the initial user.

### Option 2: Run Sequelize migrations

1. Create the database `attendance_portal`.
2. Configure `backend/.env`.
3. Install the Sequelize CLI if needed and run:

```bash
npx sequelize-cli db:migrate
```

## Backend Setup

1. Open a terminal in `backend/`
2. Install dependencies:

```bash
npm install
```

3. Start the backend server:

```bash
npm run dev
```

The API runs on `http://localhost:5000` by default.

## Frontend Setup

1. Open a second terminal in `frontend/`
2. Install dependencies:

```bash
npm install
```

3. Start the frontend:

```bash
npm run dev
```

The React app runs on `http://localhost:5173` by default.

## Available Pages

- Login
- Check-in / Check-out Dashboard
- Timesheet
- Apply Leave

## API Endpoints

### Auth

- `POST /login`
- `POST /register`

### Attendance

- `POST /checkin`
- `POST /checkout`
- `GET /attendance/today`
- `GET /attendance`

### Leave

- `POST /leave`
- `GET /leave`

## Authentication Notes

- JWT token is stored in localStorage
- Token is refreshed on activity through the backend session middleware
- Token expires after 15 minutes of inactivity
- Missing or expired tokens return `401 Unauthorized`

## Seed User

The SQL script seeds a sample employee user for testing.

Use the following login after running the seed:

- Username: `employee`
- Password: `admin123`

If you replace the seeded password, make sure it is stored as a bcrypt hash.

## Submission Files

For final submission, include:

- `README.md`
- `database.sql`
- `frontend.zip`
- `backend.zip`
