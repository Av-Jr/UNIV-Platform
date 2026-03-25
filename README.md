Exam Platform (UNIV-Platform)
This project is a full-stack web application built for an online examination and classroom management system. It features separate dashboards for teachers and students, real-time-like group messaging, and a robust exam creator supporting both multiple-choice and coding questions.

Features
For Teachers
Group Management: Create classroom groups and generate unique join codes for students.
Exam Creator: Design exams with custom titles, time limits, and due dates.
Question Types: Supports Multiple Choice Questions (MCQs) and coding questions with template code.
Real-time Chat: Communicate with students within specific classroom groups.
For Students
Join Classes: Access classroom groups using codes provided by teachers.
Timed Exams: Take exams with a live countdown timer; exams are automatically submitted when time expires.
Interactive Code Editor: Solve coding questions using an integrated Monaco Editor.
Automated Grading: View instant results for MCQ sections upon submission.
History Tracking: Review past exam attempts and performance marks.
Tech Stack
Frontend: React 19 (Vite), CSS3, Monaco Editor.
Backend: Node.js, Express.
Database: Local JSON-based storage (UserAuth.json, Exams.json).
