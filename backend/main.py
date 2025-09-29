from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import datetime
import uvicorn
import sqlite3
import os

app = FastAPI(title="KPI Time Tracker API", version="1.0.0")

# CORS pentru frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modele Pydantic
class User(BaseModel):
    id: Optional[int] = None
    name: str
    email: str
    role: str
    total_hours: Optional[float] = 0.0

class Project(BaseModel):
    id: Optional[int] = None
    name: str
    description: str
    module_type: str  # "proiecte", "evom", "operational"
    status: str = "active"
    total_hours: Optional[float] = 0.0

class Task(BaseModel):
    id: Optional[int] = None
    user_id: int
    project_id: int
    description: str
    hours: float
    date: str
    created_at: Optional[str] = None

class TaskCreate(BaseModel):
    user_id: int
    project_id: int
    description: str
    hours: float
    date: str

# Inițializare bază de date
def init_db():
    conn = sqlite3.connect("kpi_tracker.db")
    cursor = conn.cursor()
    
    # Tabel utilizatori
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            role TEXT NOT NULL,
            total_hours REAL DEFAULT 0.0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Tabel proiecte
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            module_type TEXT NOT NULL,
            status TEXT DEFAULT "active",
            total_hours REAL DEFAULT 0.0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Tabel task-uri
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            project_id INTEGER NOT NULL,
            description TEXT NOT NULL,
            hours REAL NOT NULL,
            date TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (project_id) REFERENCES projects (id)
        )
    """)
    
    # Nu se inserează date de test - aplicația începe curată
    
    conn.commit()
    conn.close()

# Funcții helper
def get_db_connection():
    conn = sqlite3.connect("kpi_tracker.db")
    conn.row_factory = sqlite3.Row
    return conn

def update_user_hours(user_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT SUM(hours) FROM tasks WHERE user_id = ?", (user_id,))
    total_hours = cursor.fetchone()[0] or 0.0
    cursor.execute("UPDATE users SET total_hours = ? WHERE id = ?", (total_hours, user_id))
    conn.commit()
    conn.close()

def update_project_hours(project_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT SUM(hours) FROM tasks WHERE project_id = ?", (project_id,))
    total_hours = cursor.fetchone()[0] or 0.0
    cursor.execute("UPDATE projects SET total_hours = ? WHERE id = ?", (total_hours, project_id))
    conn.commit()
    conn.close()

# API Endpoints

# Utilizatori
@app.get("/api/users", response_model=List[User])
async def get_users():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users ORDER BY name")
    users = cursor.fetchall()
    conn.close()
    return [User(**dict(user)) for user in users]

@app.post("/api/users", response_model=User)
async def create_user(user: User):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Verifică dacă email-ul există deja
    cursor.execute("SELECT id FROM users WHERE email = ?", (user.email,))
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail="Email already exists")
    
    cursor.execute("INSERT INTO users (name, email, role) VALUES (?, ?, ?)", 
                   (user.name, user.email, user.role))
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()
    user.id = user_id
    return user

@app.put("/api/users/{user_id}", response_model=User)
async def update_user(user_id: int, user: User):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Verifică dacă utilizatorul există
    cursor.execute("SELECT id FROM users WHERE id = ?", (user_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verifică dacă email-ul există pentru alt utilizator
    cursor.execute("SELECT id FROM users WHERE email = ? AND id != ?", (user.email, user_id))
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail="Email already exists")
    
    cursor.execute("UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?", 
                   (user.name, user.email, user.role, user_id))
    conn.commit()
    conn.close()
    user.id = user_id
    return user

@app.delete("/api/users/{user_id}")
async def delete_user(user_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="User not found")
    conn.commit()
    conn.close()
    return {"message": "User deleted successfully"}

# Proiecte
@app.get("/api/projects", response_model=List[Project])
async def get_projects():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM projects ORDER BY module_type, name")
    projects = cursor.fetchall()
    conn.close()
    return [Project(**dict(project)) for project in projects]

@app.get("/api/projects/module/{module_type}", response_model=List[Project])
async def get_projects_by_module(module_type: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM projects WHERE module_type = ? ORDER BY name", (module_type,))
    projects = cursor.fetchall()
    conn.close()
    return [Project(**dict(project)) for project in projects]

@app.post("/api/projects", response_model=Project)
async def create_project(project: Project):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO projects (name, description, module_type, status) VALUES (?, ?, ?, ?)", 
                   (project.name, project.description, project.module_type, project.status))
    project_id = cursor.lastrowid
    conn.commit()
    conn.close()
    project.id = project_id
    return project

@app.delete("/api/projects/{project_id}")
async def delete_project(project_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM projects WHERE id = ?", (project_id,))
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    conn.commit()
    conn.close()
    return {"message": "Project deleted successfully"}

# Task-uri
@app.get("/api/tasks", response_model=List[dict])
async def get_tasks():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT t.*, u.name as user_name, p.name as project_name, p.module_type
        FROM tasks t
        JOIN users u ON t.user_id = u.id
        JOIN projects p ON t.project_id = p.id
        ORDER BY t.date DESC, t.created_at DESC
    """)
    tasks = cursor.fetchall()
    conn.close()
    return [dict(task) for task in tasks]

@app.get("/api/tasks/user/{user_id}")
async def get_user_tasks(user_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT t.*, p.name as project_name, p.module_type
        FROM tasks t
        JOIN projects p ON t.project_id = p.id
        WHERE t.user_id = ?
        ORDER BY t.date DESC, t.created_at DESC
    """, (user_id,))
    tasks = cursor.fetchall()
    conn.close()
    return [dict(task) for task in tasks]

@app.get("/api/tasks/date/{date}")
async def get_tasks_by_date(date: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT t.*, u.name as user_name, p.name as project_name, p.module_type
        FROM tasks t
        JOIN users u ON t.user_id = u.id
        JOIN projects p ON t.project_id = p.id
        WHERE t.date = ?
        ORDER BY t.created_at DESC
    """, (date,))
    tasks = cursor.fetchall()
    conn.close()
    return [dict(task) for task in tasks]

@app.post("/api/tasks", response_model=Task)
async def create_task(task: TaskCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Verifică dacă utilizatorul și proiectul există
    cursor.execute("SELECT id FROM users WHERE id = ?", (task.user_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="User not found")
    
    cursor.execute("SELECT id FROM projects WHERE id = ?", (task.project_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Creează task-ul
    cursor.execute("""
        INSERT INTO tasks (user_id, project_id, description, hours, date) 
        VALUES (?, ?, ?, ?, ?)
    """, (task.user_id, task.project_id, task.description, task.hours, task.date))
    
    task_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    # Actualizează orele totale
    update_user_hours(task.user_id)
    update_project_hours(task.project_id)
    
    return Task(id=task_id, **task.dict())

@app.delete("/api/tasks/{task_id}")
async def delete_task(task_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Obține detaliile task-ului înainte de ștergere
    cursor.execute("SELECT user_id, project_id FROM tasks WHERE id = ?", (task_id,))
    task = cursor.fetchone()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    user_id, project_id = task
    
    # Șterge task-ul
    cursor.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
    conn.commit()
    conn.close()
    
    # Actualizează orele totale
    update_user_hours(user_id)
    update_project_hours(project_id)
    
    return {"message": "Task deleted successfully"}

# Statistici
@app.get("/api/stats/overview")
async def get_overview_stats():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Total utilizatori
    cursor.execute("SELECT COUNT(*) FROM users")
    total_users = cursor.fetchone()[0]
    
    # Total ore
    cursor.execute("SELECT SUM(hours) FROM tasks")
    total_hours = cursor.fetchone()[0] or 0.0
    
    # Total proiecte active
    cursor.execute("SELECT COUNT(*) FROM projects WHERE status = \"active\"")
    active_projects = cursor.fetchone()[0]
    
    # Total task-uri
    cursor.execute("SELECT COUNT(*) FROM tasks")
    total_tasks = cursor.fetchone()[0]
    
    # Utilizatorul cu cele mai multe ore
    cursor.execute("""
        SELECT u.name, SUM(t.hours) as total_hours
        FROM users u
        LEFT JOIN tasks t ON u.id = t.user_id
        GROUP BY u.id, u.name
        ORDER BY total_hours DESC
        LIMIT 1
    """)
    top_user = cursor.fetchone()
    
    conn.close()
    
    return {
        "total_users": total_users,
        "total_hours": total_hours,
        "active_projects": active_projects,
        "total_tasks": total_tasks,
        "top_user": dict(top_user) if top_user else None,
        "average_hours_per_user": total_hours / total_users if total_users > 0 else 0
    }

@app.get("/api/stats/daily/{date}")
async def get_daily_stats(date: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT u.name, SUM(t.hours) as daily_hours
        FROM users u
        LEFT JOIN tasks t ON u.id = t.user_id AND t.date = ?
        GROUP BY u.id, u.name
        ORDER BY daily_hours DESC
    """, (date,))
    
    user_stats = [dict(row) for row in cursor.fetchall()]
    
    cursor.execute("SELECT SUM(hours) FROM tasks WHERE date = ?", (date,))
    total_daily_hours = cursor.fetchone()[0] or 0.0
    
    conn.close()
    
    return {
        "date": date,
        "total_hours": total_daily_hours,
        "user_stats": user_stats
    }

if __name__ == "__main__":
    init_db()
    uvicorn.run(app, host="0.0.0.0", port=8000)