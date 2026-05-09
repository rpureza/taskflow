const router = require("express").Router();
const db = require("../db");
const auth = require("../middleware/auth");

// GET ALL TASKS
router.get("/", auth, (req, res) => {
  const { filter } = req.query;
  let query = "SELECT * FROM tasks WHERE user_id = ?";
  const params = [req.user.id];

  if (filter === "active") {
    query += " AND completed = false";
  } else if (filter === "completed") {
    query += " AND completed = true";
  }

  query += " ORDER BY due_date ASC, created_at DESC";

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });
    res.json(results);
  });
});

// ADD TASK
router.post("/", auth, (req, res) => {
  const { title, due_date } = req.body;

  if (!title)
    return res.status(400).json({ message: "Title is required" });

  db.query(
    "INSERT INTO tasks (user_id, title, due_date) VALUES (?, ?, ?)",
    [req.user.id, title, due_date || null],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Server error" });
      res.status(201).json({
        id: result.insertId,
        title,
        due_date: due_date || null,
        completed: false,
      });
    }
  );
});

// UPDATE TASK
router.put("/:id", auth, (req, res) => {
  const { completed, title, due_date } = req.body;
  const taskId = req.params.id;

  db.query(
    "UPDATE tasks SET completed = COALESCE(?, completed), title = COALESCE(?, title), due_date = COALESCE(?, due_date) WHERE id = ? AND user_id = ?",
    [
      completed !== undefined ? completed : null,
      title || null,
      due_date || null,
      taskId,
      req.user.id,
    ],
    (err) => {
      if (err) return res.status(500).json({ message: "Server error" });
      res.json({ message: "Task updated" });
    }
  );
});

// DELETE TASK
router.delete("/:id", auth, (req, res) => {
  db.query(
    "DELETE FROM tasks WHERE id = ? AND user_id = ?",
    [req.params.id, req.user.id],
    (err) => {
      if (err) return res.status(500).json({ message: "Server error" });
      res.json({ message: "Task deleted" });
    }
  );
});

module.exports = router;
