# Smart AI Classroom Attendance System

Browser (React :3000) -> Spring Boot backend (:9630) -> Python AI service (:8000). Data is stored in MySQL.

## What's new
- **Home page** with two options: **Admin Login** and **Teacher Login**
- **Teachers can add students** (details + 1-5 photos; the face is registered automatically)
- Teachers take attendance from **one photo or video**
- Cloud database removed; the app now uses a **local MySQL** database
- AI service install problem fixed (no dlib compilation needed)

## First-time setup
1. Make sure **MySQL** is running (Windows Services: MySQL80 = Running).
2. In `backend/src/main/resources/application.yml` set your MySQL password:
   `password: ${DATABASE_PASSWORD:YOUR_PASSWORD}`
3. Double-click `SETUP_FIRST_TIME.bat` (needs Python 3.9-3.12 and Node.js, plus internet).

## Run
1. Run `AttendanceApplication.java` from IntelliJ (backend, port 9630).
2. Double-click `START_ALL_SERVICES.bat` (starts the AI service and the frontend).
3. Open **http://localhost:3000**

The database `smart_attendance_db` and all tables are created automatically on the first backend start
(`database/schema.sql` is optional). Default admin: `admin@college.edu` / `admin123`

## Usage (in this order)
1. **Admin Login** -> Teachers -> add a teacher
2. Admin -> Subjects -> add a subject (choose the teacher, enter a semester such as `MCA 3rd`)
3. Logout -> **Teacher Login** with that teacher
4. **Students (add / view)** -> add a student: Roll No, Name, **Semester `MCA 3rd`**, **Section `A`**, and 1-5 clear photos
5. **Create class** -> choose the subject, then pick the Semester and Section from the dropdowns (they come from the students you added), plus date and time
6. Upload a photo or video -> the Present / Absent list is shown

**Important:** attendance is marked only for students whose Semester and Section exactly match the class's Semester and Section.

## Troubleshooting
- Backend `Access denied for user 'root'` -> wrong password in application.yml
- AI service: open `http://localhost:8000/health`, it should say `AI service is running`
- Backend, AI service and frontend must all be running
- Nobody is marked present -> use a clear photo where faces are well lit and not tiny; and make sure the students' faces were registered with clear front-facing photos
- Admin login says "Invalid email or password" -> an old admin row exists in the database. Stop the backend, run `DROP DATABASE IF EXISTS smart_attendance_db;` in MySQL, start the backend again.
