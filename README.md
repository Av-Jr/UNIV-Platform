# Project Overview: UNIV-Platform (Exam Management System)

### 1. Introduction
UNIV-Platform is a comprehensive full-stack web application designed to facilitate online examinations and classroom management. It provides a specialized interface for both educators and students, streamlining the process of creating, taking, and grading assessments.

### 2. Core Features
* **Role-Based Dashboards:** Separate, intuitive interfaces for Teachers and Students.
* **Classroom Management:** Teachers can create groups with unique access codes; students join via these codes to access specific materials.
* **Advanced Exam Creator:** Supports Multiple Choice Questions (MCQs) and coding problems. Includes settings for time limits, due dates, and custom titles.
* **Integrated Coding Environment:** A built-in code editor (Monaco Editor) allows students to solve programming challenges directly within the platform.
* **Automated Evaluation:** Instant scoring for MCQ sections and organized submission tracking for coding assignments.
* **Real-time Communication:** Group-specific chat functionality for teacher-student interaction.
* **Automated Timing:** Exams feature live countdown timers with auto-submission upon expiration.

### 3. Technical Stack
* **Frontend:** React 19, Vite (for fast builds), and Monaco Editor (for the coding environment).
* **Backend:** Node.js and Express.js.
* **Data Management:** JSON-based persistence (Exams.json, UserAuth.json) for lightweight and portable data handling.

### 4. System Workflow
1.  **Authentication:** Users sign up/log in as either a Teacher or a Student.
2.  **Organization:** Teachers create "Groups" and share the generated code.
3.  **Assessment:** Teachers design exams within the Group; Students see these exams on their dashboard and can start the timed session.
4.  **Completion:** Upon submission or time-out, results are recorded for teacher review and student feedback.
