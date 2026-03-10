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
const readDB = (filePath, defaultData = { users: [], groups: [], attempts: [] }) => {
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
};

const writeDB = (filePath, data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

/* Auth & Groups (UserAuth.json) */
app.post("/signup", (req, res) => {
  const { realName, role, username, password } = req.body;
  const db = readDB(AUTH_DB);
  if (db.users.find((u) => u.username === username)) return res.status(400).json({ ok: false });
  db.users.push({ realName, role, username, password });
  writeDB(AUTH_DB, db);
  res.json({ ok: true, realName, role });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const db = readDB(AUTH_DB);
  const user = db.users.find((u) => u.username === username && u.password === password);
  user ? res.json({ ok: true, role: user.role, realName: user.realName }) : res.status(401).json({ ok: false });
});

app.post("/create-group", (req, res) => {
  const { teacher, email, code } = req.body;
  const db = readDB(AUTH_DB);
  db.groups.push({ id: Date.now(), teacher, email, code, students: [] });
  writeDB(AUTH_DB, db);
  res.json({ ok: true });
});

/* Exams (Exams.json) */
app.post("/save-exam", (req, res) => {
  const { teacher, title, questions } = req.body;
  const exams = readDB(EXAMS_DB, []);
  exams.push({ id: Date.now().toString(), teacher, title, questions, createdAt: Date.now() });
  writeDB(EXAMS_DB, exams);
  res.json({ ok: true });
});

app.get("/get-exams", (req, res) => {
  res.json(readDB(EXAMS_DB, []));
});

/* Attempts */
app.post("/attempt-exam", (req, res) => {
  const { examId, username, answers } = req.body;
  const db = readDB(AUTH_DB);
  db.attempts.push({ examId, username, answers, submittedAt: Date.now() });
  writeDB(AUTH_DB, db);
  res.json({ ok: true });
});

app.post("/history", (req, res) => {
  const { username } = req.body;
  const db = readDB(AUTH_DB);
  res.json({ ok: true, history: db.attempts.filter(a => a.username === username) });
});

app.listen(5001, () => console.log("Server started on http://localhost:5001"));