import { useState, useEffect } from "react";

const API = "http://localhost:3001";

export default function Dashboard({ token, email, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API}/tasks?filter=${filter}`, { headers });
      if (res.status === 401) return onLogout();
      const data = await res.json();
      setTasks(data);
    } catch {
      setError("Could not load tasks.");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const res = await fetch(`${API}/tasks`, {
        method: "POST",
        headers,
        body: JSON.stringify({ title, due_date: dueDate || null }),
      });
      if (!res.ok) return;
      setTitle("");
      setDueDate("");
      fetchTasks();
    } catch {
      setError("Could not add task.");
    }
  };

  const toggleTask = async (task) => {
    await fetch(`${API}/tasks/${task.id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ completed: !task.completed }),
    });
    fetchTasks();
  };

  const deleteTask = async (id) => {
    await fetch(`${API}/tasks/${id}`, { method: "DELETE", headers });
    fetchTasks();
  };

  const isOverdue = (due) => {
    if (!due) return false;
    return new Date(due) < new Date();
  };

  const formatDate = (due) => {
    if (!due) return null;
    return new Date(due).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const total = tasks.length;
  const done = tasks.filter((t) => t.completed).length;
  const pending = total - done;

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dash-header">
        <div>
          <div className="dash-logo">TaskFlow</div>
          <div className="dash-user">{email}</div>
        </div>
        <button className="btn-logout" onClick={onLogout}>Logout</button>
      </div>

      {/* Stats */}
      <div className="task-stats">
        <div className="stat-card">
          <div className="stat-number">{total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: "#ff6a8e" }}>{pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: "#4ade80" }}>{done}</div>
          <div className="stat-label">Done</div>
        </div>
      </div>

      {/* Add Task */}
      <div className="add-task-form">
        <h3>Add New Task</h3>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={addTask}>
          <div className="task-inputs">
            <div className="form-group" style={{ flex: 2 }}>
              <label>Task Title</label>
              <input
                type="text"
                placeholder="What needs to be done?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <button className="btn-add" type="submit">+ Add</button>
          </div>
        </form>
      </div>

      {/* Filter */}
      <div className="filter-bar">
        {["all", "active", "completed"].map((f) => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Tasks */}
      <div className="tasks-list">
        {tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>No tasks here. Add one above!</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`task-item ${task.completed ? "completed" : ""}`}
            >
              <div
                className={`task-check ${task.completed ? "done" : ""}`}
                onClick={() => toggleTask(task)}
              />
              <div className="task-info">
                <div className="task-title">{task.title}</div>
                {task.due_date && (
                  <div className={`task-due ${isOverdue(task.due_date) && !task.completed ? "overdue" : ""}`}>
                    📅 {formatDate(task.due_date)}
                    {isOverdue(task.due_date) && !task.completed ? " — Overdue" : ""}
                  </div>
                )}
              </div>
              <button
                className="btn-delete"
                onClick={() => deleteTask(task.id)}
                title="Delete task"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}