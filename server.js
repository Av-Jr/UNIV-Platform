// server.js

import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";

/* -------------------------------------------------- */
/* Setup */
/* -------------------------------------------------- */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

const DB_PATH = path.join(__dirname, "UserAuth.json");

/* -------------------------------------------------- */
/* Helpers */
/* -------------------------------------------------- */

const readDB = () => {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(
      DB_PATH,
      JSON.stringify({ users: [], groups: [], exams: [], attempts: [] }, null, 2)
    );
  }
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw);
};

const writeDB = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

/* -------------------------------------------------- */
/* AUTH ROUTES */
/* -------------------------------------------------- */

app.post("/signup", (req, res) => {
  const { realName, role, username, password } = req.body;
  const db = readDB();

  const exists = db.users.find((u) => u.username === username);
  if (exists) {
    return res.status(400).json({ ok: false });
  }

  db.users.push({
    realName,
    role,
    username,
    password
  });

  writeDB(db);
  res.json({ ok: true, realName, role });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const db = readDB();

  const user = db.users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ ok: false });
  }

  res.json({
    ok: true,
    role: user.role,
    realName: user.realName
  });
});

/* -------------------------------------------------- */
/* TEACHER FEATURES */
/* -------------------------------------------------- */

/* Create Student Group */
app.post("/create-group", (req, res) => {
  const { teacher, email, code } = req.body;
  const db = readDB();

  if (!db.groups) db.groups = [];

  db.groups.push({
    id: Date.now(),
    teacher,
    email,
    code,
    students: []
  });

  writeDB(db);
  res.json({ ok: true });
});

/* Create Exam */
app.post("/create-exam", (req, res) => {
  const { teacher, questions } = req.body;
  const db = readDB();

  if (!db.exams) db.exams = [];

  db.exams.push({
    id: Date.now(),
    teacher,
    questions: questions || [],
    createdAt: Date.now()
  });

  writeDB(db);
  res.json({ ok: true });
});

/* -------------------------------------------------- */
/* STUDENT FEATURES */
/* -------------------------------------------------- */

/* Join Class using code */
app.post("/join-class", (req, res) => {
  const { username, code } = req.body;
  const db = readDB();

  const group = db.groups?.find((g) => g.code === code);

  if (!group) {
    return res.json({ ok: false });
  }

  if (!group.students.includes(username)) {
    group.students.push(username);
  }

  writeDB(db);
  res.json({ ok: true });
});

/* Attempt Exam (basic version) */
app.post("/attempt-exam", (req, res) => {
  const { examId, username, answers } = req.body;
  const db = readDB();

  if (!db.attempts) db.attempts = [];

  db.attempts.push({
    examId,
    username,
    answers,
    submittedAt: Date.now()
  });

  writeDB(db);
  res.json({ ok: true });
});

/* Get Student History */
app.post("/history", (req, res) => {
  const { username } = req.body;
  const db = readDB();

  const history = db.attempts?.filter((a) => a.username === username) || [];

  res.json({ ok: true, history });
});

/* -------------------------------------------------- */
/* SERVER START */
/* -------------------------------------------------- */

app.listen(5001, () => {
  console.log("Server started on http://localhost:5001");
});