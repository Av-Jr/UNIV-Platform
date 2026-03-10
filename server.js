import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(express.json());
app.use(cors());

const AUTH_DB = path.join(__dirname, "UserAuth.json");
const EXAMS_DB = path.join(__dirname, "Exams.json");

// Helpers
const readData = (file, defaultVal = []) => {
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(defaultVal));
  return JSON.parse(fs.readFileSync(file, "utf-8"));
};
const writeData = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

/* Auth & Groups */
app.post("/signup", (req, res) => {
  const { realName, role, username, password } = req.body;
  const db = readData(AUTH_DB, { users: [], groups: [], attempts: [] });
  if (db.users.find(u => u.username === username)) return res.status(400).json({ ok: false });
  db.users.push({ realName, role, username, password });
  writeData(AUTH_DB, db);
  res.json({ ok: true, realName, role });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const db = readData(AUTH_DB);
  const user = db.users.find(u => u.username === username && u.password === password);
  user ? res.json({ ok: true, role: user.role, realName: user.realName }) : res.status(401).json({ ok: false });
});

app.post("/create-group", (req, res) => {
  const { teacher, email, code } = req.body;
  const db = readData(AUTH_DB);
  db.groups.push({ id: Date.now(), teacher, email, code, students: [] });
  writeData(AUTH_DB, db);
  res.json({ ok: true });
});

/* Exam Management (Exams.json) */
app.post("/save-exam", (req, res) => {
  const { teacher, title, questions } = req.body;
  const exams = readData(EXAMS_DB, []);
  exams.push({ id: "EX-" + Date.now(), teacher, title, questions, createdAt: Date.now() });
  writeData(EXAMS_DB, exams);
  res.json({ ok: true });
});

app.get("/get-exams", (req, res) => {
  res.json(readData(EXAMS_DB, []));
});

/* Student History */
app.post("/attempt-exam", (req, res) => {
  const { examId, username, answers } = req.body;
  const db = readData(AUTH_DB);
  db.attempts.push({ examId, username, answers, submittedAt: Date.now() });
  writeData(AUTH_DB, db);
  res.json({ ok: true });
});

app.post("/history", (req, res) => {
  const { username } = req.body;
  const db = readData(AUTH_DB);
  res.json({ ok: true, history: db.attempts.filter(a => a.username === username) });
});

app.listen(5001, () => console.log("Server running at http://localhost:5001"));