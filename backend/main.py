from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
from typing import List, Optional
import datetime
import uvicorn
import pymysql
import os
import json
import xml.etree.ElementTree as ET
import pandas as pd
import tempfile
import configparser
from decimal import Decimal

app = FastAPI(title="KPI Time Tracker API", version="1.0.0")

# Funcție pentru a converti tipurile Decimal în float pentru JSON
def convert_decimals_to_float(data):
    """Convertește toate tipurile Decimal din date în float pentru serializare JSON"""
    if isinstance(data, dict):
        return {key: convert_decimals_to_float(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [convert_decimals_to_float(item) for item in data]
    elif isinstance(data, Decimal):
        return float(data)
    else:
        return data

# CORS pentru frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
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
    department: str
    total_hours: Optional[float] = 0.0

class Project(BaseModel):
    id: Optional[int] = None
    name: str
    description: str
    module_type: str  # "proiecte", "evom", "operational"
    status: str = "active"
    total_hours: Optional[float] = 0.0
    visibility_type: str = "all"  # "all", "specific_departments", "private"
    visible_departments: Optional[List[str]] = None

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

class TaskComment(BaseModel):
    id: Optional[int] = None
    task_id: int
    user_id: int
    comment: str
    created_at: Optional[str] = None
    user_name: Optional[str] = None

class TaskCommentCreate(BaseModel):
    task_id: int
    user_id: int
    comment: str

class AuditLog(BaseModel):
    id: Optional[int] = None
    user_id: Optional[int] = None
    action: str
    entity_type: str
    entity_id: Optional[int] = None
    old_values: Optional[dict] = None
    new_values: Optional[dict] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: Optional[str] = None
    user_name: Optional[str] = None

# Inițializare bază de date MySQL
def init_db():
    try:
        print(f"Conectare la MySQL: {MYSQL_CONFIG['host']}:{MYSQL_CONFIG['port']}")
        print(f"Utilizator: {MYSQL_CONFIG['user']}")
        print(f"Baza de date: {MYSQL_CONFIG['database']}")
        
        # Creează baza de date dacă nu există
        temp_config = MYSQL_CONFIG.copy()
        temp_config.pop('database', None)
        
        temp_conn = pymysql.connect(**temp_config)
        temp_cursor = temp_conn.cursor()
        temp_cursor.execute(f"CREATE DATABASE IF NOT EXISTS {MYSQL_CONFIG['database']}")
        temp_conn.close()
        print(f"Baza de date '{MYSQL_CONFIG['database']}' creată/verificată")
        
        # Conectează la baza de date creată
        conn = pymysql.connect(**MYSQL_CONFIG)
        cursor = conn.cursor()

        # Tabel utilizatori
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                role VARCHAR(50) NOT NULL,
                department VARCHAR(100) NOT NULL,
                total_hours DECIMAL(10,2) DEFAULT 0.0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("Tabel 'users' creat/verificat")

        # Tabel proiecte
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS projects (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                module_type VARCHAR(50) NOT NULL,
                status VARCHAR(20) DEFAULT 'active',
                total_hours DECIMAL(10,2) DEFAULT 0.0,
                visibility_type VARCHAR(20) DEFAULT 'all',
                visible_departments JSON DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("Tabel 'projects' creat/verificat")
        
        # Migrație pentru a adăuga câmpurile de vizibilitate la tabelul existent
        try:
            cursor.execute("ALTER TABLE projects ADD COLUMN visibility_type VARCHAR(20) DEFAULT 'all'")
            print("Câmp 'visibility_type' adăugat la tabelul 'projects'")
        except pymysql.Error:
            print("Câmp 'visibility_type' deja există în tabelul 'projects'")
        
        try:
            cursor.execute("ALTER TABLE projects ADD COLUMN visible_departments JSON DEFAULT NULL")
            print("Câmp 'visible_departments' adăugat la tabelul 'projects'")
        except pymysql.Error:
            print("Câmp 'visible_departments' deja există în tabelul 'projects'")

        # Tabel task-uri
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tasks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                project_id INT NOT NULL,
                description TEXT NOT NULL,
                hours DECIMAL(10,2) NOT NULL,
                date DATE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
            )
        """)
        print("Tabel 'tasks' creat/verificat")

        # Tabel comentarii task-uri
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS task_comments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                task_id INT NOT NULL,
                user_id INT NOT NULL,
                comment TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        """)
        print("Tabel 'task_comments' creat/verificat")

        # Tabel audit logs
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                action VARCHAR(100) NOT NULL,
                entity_type VARCHAR(50) NOT NULL,
                entity_id INT,
                old_values JSON,
                new_values JSON,
                ip_address VARCHAR(45),
                user_agent TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
            )
        """)
        print("Tabel 'audit_logs' creat/verificat")

        conn.commit()
        conn.close()
        print("✅ MySQL database initialized successfully")
        
    except pymysql.Error as e:
        print(f"❌ Error initializing MySQL database: {e}")
        print("🔧 Verifică:")
        print("   1. MySQL Server este instalat și rulează")
        print("   2. Credențialele din mysql_config.ini sunt corecte")
        print("   3. Utilizatorul are permisiuni pentru a crea baze de date")
        raise HTTPException(status_code=500, detail=f"MySQL initialization failed: {str(e)}")
    except FileNotFoundError as e:
        print(f"❌ {e}")
        raise HTTPException(status_code=500, detail=f"Configuration file not found: {str(e)}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=f"Database initialization failed: {str(e)}")

# Încarcă configurarea MySQL din fișier
def load_mysql_config():
    config = configparser.ConfigParser()
    config_file = os.path.join(os.path.dirname(__file__), 'mysql_config.ini')
    
    if not os.path.exists(config_file):
        raise FileNotFoundError(f"Fișierul de configurare MySQL nu există: {config_file}")
    
    config.read(config_file)
    
    mysql_config = {
        'host': config.get('mysql', 'host'),
        'port': config.getint('mysql', 'port'),
        'user': config.get('mysql', 'user'),
        'password': config.get('mysql', 'password'),
        'database': config.get('mysql', 'database'),
        'charset': config.get('mysql', 'charset'),
        'autocommit': config.getboolean('mysql', 'autocommit')
    }
    
    return mysql_config

# Configurare MySQL
MYSQL_CONFIG = load_mysql_config()

# Funcție pentru conexiunea la MySQL
def get_db_connection():
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        return connection
    except pymysql.Error as e:
        print(f"❌ Error connecting to MySQL: {e}")
        print(f"🔧 Configurare folosită: {MYSQL_CONFIG['host']}:{MYSQL_CONFIG['port']}")
        print("🔧 Verifică:")
        print("   1. MySQL Server rulează")
        print("   2. Credențialele sunt corecte în mysql_config.ini")
        print("   3. Baza de date există")
        raise HTTPException(status_code=500, detail=f"MySQL connection failed: {str(e)}")

def update_user_hours(user_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT SUM(hours) FROM tasks WHERE user_id = %s", (user_id,))
    result = cursor.fetchone()
    total_hours = result[0] if result[0] is not None else 0.0
    cursor.execute("UPDATE users SET total_hours = %s WHERE id = %s", (total_hours, user_id))
    conn.commit()
    conn.close()

def update_project_hours(project_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT SUM(hours) FROM tasks WHERE project_id = %s", (project_id,))
    result = cursor.fetchone()
    total_hours = result[0] if result[0] is not None else 0.0
    cursor.execute("UPDATE projects SET total_hours = %s WHERE id = %s", (total_hours, project_id))
    conn.commit()
    conn.close()

def log_audit_event(user_id: int, action: str, entity_type: str, entity_id: int = None, 
                   old_values: dict = None, new_values: dict = None, 
                   ip_address: str = None, user_agent: str = None):
    """Log audit event to database"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (user_id, action, entity_type, entity_id, 
          json.dumps(old_values) if old_values else None,
          json.dumps(new_values) if new_values else None,
          ip_address, user_agent))
    
    conn.commit()
    conn.close()

# API Endpoints

# Utilizatori
@app.get("/time-monitoring/api/users", response_model=List[User])
async def get_users():
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    cursor.execute("SELECT * FROM users ORDER BY name")
    users = cursor.fetchall()
    conn.close()
    return users

@app.get("/time-monitoring/api/users/email/{email}", response_model=User)
async def get_user_by_email(email: str):
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

@app.post("/time-monitoring/api/users", response_model=User)
async def create_user(user: User, request: Request):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Verifică dacă email-ul există deja
    cursor.execute("SELECT id FROM users WHERE email = %s", (user.email,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Email already exists")
    
    cursor.execute("INSERT INTO users (name, email, role, department) VALUES (%s, %s, %s, %s)", 
                   (user.name, user.email, user.role, user.department))
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    # Log audit event
    log_audit_event(
        user_id=user_id,
        action="CREATE_USER",
        entity_type="user",
        entity_id=user_id,
        new_values=user.dict(),
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    
    user.id = user_id
    return user

@app.put("/time-monitoring/api/users/{user_id}", response_model=User)
async def update_user(user_id: int, user: User):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Verifică dacă utilizatorul există
    cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verifică dacă email-ul există pentru alt utilizator
    cursor.execute("SELECT id FROM users WHERE email = %s AND id != %s", (user.email, user_id))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Email already exists")
    
    cursor.execute("UPDATE users SET name = %s, email = %s, role = %s, department = %s WHERE id = %s", 
                   (user.name, user.email, user.role, user.department, user_id))
    conn.commit()
    conn.close()
    user.id = user_id
    return user

@app.delete("/time-monitoring/api/users/{user_id}")
async def delete_user(user_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")
    conn.commit()
    conn.close()
    return {"message": "User deleted successfully"}

# Proiecte
@app.get("/time-monitoring/api/departments", response_model=List[str])
async def get_departments():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT DISTINCT department FROM users WHERE department IS NOT NULL AND department != '' ORDER BY department")
    departments = [row[0] for row in cursor.fetchall()]
    conn.close()
    return departments

@app.get("/time-monitoring/api/projects", response_model=List[Project])
async def get_projects():
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    cursor.execute("SELECT * FROM projects ORDER BY module_type, name")
    projects = cursor.fetchall()
    conn.close()
    
    # Convertim JSON string-urile înapoi în liste Python
    for project in projects:
        if project['visible_departments']:
            try:
                project['visible_departments'] = json.loads(project['visible_departments'])
            except (json.JSONDecodeError, TypeError):
                project['visible_departments'] = []
        else:
            project['visible_departments'] = []
    
    return projects

@app.get("/time-monitoring/api/projects/department/{department}", response_model=List[Project])
async def get_projects_for_department(department: str):
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    
    # Obținem proiectele care sunt vizibile pentru departamentul specificat
    cursor.execute("""
        SELECT * FROM projects 
        WHERE visibility_type = 'all' 
           OR (visibility_type = 'specific_departments' AND JSON_CONTAINS(visible_departments, %s))
        ORDER BY module_type, name
    """, (json.dumps(department),))
    
    projects = cursor.fetchall()
    conn.close()
    
    # Convertim JSON string-urile înapoi în liste Python
    for project in projects:
        if project['visible_departments']:
            try:
                project['visible_departments'] = json.loads(project['visible_departments'])
            except (json.JSONDecodeError, TypeError):
                project['visible_departments'] = []
        else:
            project['visible_departments'] = []
    
    return projects

@app.get("/time-monitoring/api/projects/module/{module_type}", response_model=List[Project])
async def get_projects_by_module(module_type: str):
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    cursor.execute("SELECT * FROM projects WHERE module_type = %s ORDER BY name", (module_type,))
    projects = cursor.fetchall()
    conn.close()
    return projects

@app.post("/time-monitoring/api/projects", response_model=Project)
async def create_project(project: Project):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Convertim visible_departments în JSON string pentru MySQL
    visible_departments_json = None
    if project.visible_departments:
        visible_departments_json = json.dumps(project.visible_departments)
    
    cursor.execute("""
        INSERT INTO projects (name, description, module_type, status, visibility_type, visible_departments) 
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (project.name, project.description, project.module_type, project.status, 
          project.visibility_type, visible_departments_json))
    
    project_id = cursor.lastrowid
    conn.commit()
    conn.close()
    project.id = project_id
    return project

@app.put("/time-monitoring/api/projects/{project_id}", response_model=Project)
async def update_project(project_id: int, project: Project):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Convertim visible_departments în JSON string pentru MySQL
    visible_departments_json = None
    if project.visible_departments:
        visible_departments_json = json.dumps(project.visible_departments)
    
    cursor.execute("""
        UPDATE projects 
        SET name = %s, description = %s, module_type = %s, status = %s, 
            visibility_type = %s, visible_departments = %s
        WHERE id = %s
    """, (project.name, project.description, project.module_type, project.status,
          project.visibility_type, visible_departments_json, project_id))
    
    conn.commit()
    conn.close()
    project.id = project_id
    return project

@app.delete("/time-monitoring/api/projects/{project_id}")
async def delete_project(project_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM projects WHERE id = %s", (project_id,))
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Project not found")
    conn.commit()
    conn.close()
    return {"message": "Project deleted successfully"}

# Task-uri
@app.get("/time-monitoring/api/tasks", response_model=List[dict])
async def get_tasks():
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    cursor.execute("""
        SELECT t.*, u.name as user_name, u.department as user_department, p.name as project_name, p.module_type
        FROM tasks t
        JOIN users u ON t.user_id = u.id
        JOIN projects p ON t.project_id = p.id
        ORDER BY t.date DESC, t.created_at DESC
    """)
    tasks = cursor.fetchall()
    conn.close()
    return tasks

@app.get("/time-monitoring/api/tasks/department/{department}")
async def get_department_tasks(department: str):
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    cursor.execute("""
        SELECT t.*, u.name as user_name, u.department as user_department, p.name as project_name, p.module_type
        FROM tasks t
        JOIN users u ON t.user_id = u.id
        JOIN projects p ON t.project_id = p.id
        WHERE u.department = %s
        ORDER BY t.date DESC, t.created_at DESC
    """, (department,))
    tasks = cursor.fetchall()
    conn.close()
    return tasks

@app.get("/time-monitoring/api/tasks/user/{user_id}")
async def get_user_tasks(user_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    cursor.execute("""
        SELECT t.*, p.name as project_name, p.module_type, u.department as user_department
        FROM tasks t
        JOIN projects p ON t.project_id = p.id
        JOIN users u ON t.user_id = u.id
        WHERE t.user_id = %s
        ORDER BY t.date DESC, t.created_at DESC
    """, (user_id,))
    tasks = cursor.fetchall()
    conn.close()
    return tasks

@app.get("/time-monitoring/api/tasks/date/{date}")
async def get_tasks_by_date(date: str):
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    cursor.execute("""
        SELECT t.*, u.name as user_name, p.name as project_name, p.module_type
        FROM tasks t
        JOIN users u ON t.user_id = u.id
        JOIN projects p ON t.project_id = p.id
        WHERE t.date = %s
        ORDER BY t.created_at DESC
    """, (date,))
    tasks = cursor.fetchall()
    conn.close()
    return tasks

@app.post("/time-monitoring/api/tasks", response_model=Task)
async def create_task(task: TaskCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Verifică dacă utilizatorul și proiectul există
    cursor.execute("SELECT id FROM users WHERE id = %s", (task.user_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")
    
    cursor.execute("SELECT id FROM projects WHERE id = %s", (task.project_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Creează task-ul
    cursor.execute("""
        INSERT INTO tasks (user_id, project_id, description, hours, date) 
        VALUES (%s, %s, %s, %s, %s)
    """, (task.user_id, task.project_id, task.description, task.hours, task.date))
    
    task_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    # Actualizează orele totale
    update_user_hours(task.user_id)
    update_project_hours(task.project_id)
    
    return Task(id=task_id, **task.dict())

async def get_task_by_id(task_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    cursor.execute("""
        SELECT t.*, u.name as user_name, u.department as user_department, p.name as project_name, p.module_type
        FROM tasks t
        JOIN users u ON t.user_id = u.id
        JOIN projects p ON t.project_id = p.id
        WHERE t.id = %s
    """, (task_id,))
    task = cursor.fetchone()
    conn.close()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return task

@app.put("/time-monitoring/api/tasks/{task_id}", response_model=Task)
async def update_task(task_id: int, task: Task):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        UPDATE tasks 
        SET description = %s, hours = %s, date = %s
        WHERE id = %s
    """, (task.description, task.hours, task.date, task_id))
    
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Task not found")
    
    conn.commit()
    conn.close()
    
    # Returnează task-ul actualizat cu informațiile complete
    updated_task = await get_task_by_id(task_id)
    return updated_task

@app.delete("/time-monitoring/api/tasks/{task_id}")
async def delete_task(task_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Obține detaliile task-ului înainte de ștergere
    cursor.execute("SELECT user_id, project_id FROM tasks WHERE id = %s", (task_id,))
    task = cursor.fetchone()
    if not task:
        conn.close()
        raise HTTPException(status_code=404, detail="Task not found")
    
    user_id, project_id = task
    
    # Șterge task-ul
    cursor.execute("DELETE FROM tasks WHERE id = %s", (task_id,))
    conn.commit()
    conn.close()
    
    # Actualizează orele totale
    update_user_hours(user_id)
    update_project_hours(project_id)
    
    return {"message": "Task deleted successfully"}

# Comentarii Task-uri
@app.get("/time-monitoring/api/tasks/{task_id}/comments", response_model=List[TaskComment])
async def get_task_comments(task_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    cursor.execute("""
        SELECT tc.*, u.name as user_name
        FROM task_comments tc
        JOIN users u ON tc.user_id = u.id
        WHERE tc.task_id = %s
        ORDER BY tc.created_at ASC
    """, (task_id,))
    comments = cursor.fetchall()
    conn.close()
    return comments

@app.post("/time-monitoring/api/tasks/{task_id}/comments", response_model=TaskComment)
async def create_task_comment(task_id: int, comment: TaskCommentCreate, request: Request):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Verifică dacă task-ul există
    cursor.execute("SELECT id FROM tasks WHERE id = %s", (task_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Creează comentariul
    cursor.execute("""
        INSERT INTO task_comments (task_id, user_id, comment)
        VALUES (%s, %s, %s)
    """, (task_id, comment.user_id, comment.comment))
    
    comment_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    # Log audit event
    log_audit_event(
        user_id=comment.user_id,
        action="CREATE_COMMENT",
        entity_type="task_comment",
        entity_id=comment_id,
        new_values={"task_id": task_id, "comment": comment.comment},
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    
    return TaskComment(id=comment_id, **comment.dict())

@app.delete("/time-monitoring/api/comments/{comment_id}")
async def delete_task_comment(comment_id: int, request: Request):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Obține detaliile comentariului înainte de ștergere
    cursor.execute("SELECT user_id, task_id, comment FROM task_comments WHERE id = %s", (comment_id,))
    comment = cursor.fetchone()
    if not comment:
        conn.close()
        raise HTTPException(status_code=404, detail="Comment not found")
    
    user_id, task_id, comment_text = comment
    
    # Șterge comentariul
    cursor.execute("DELETE FROM task_comments WHERE id = %s", (comment_id,))
    conn.commit()
    conn.close()
    
    # Log audit event
    log_audit_event(
        user_id=user_id,
        action="DELETE_COMMENT",
        entity_type="task_comment",
        entity_id=comment_id,
        old_values={"task_id": task_id, "comment": comment_text},
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    
    return {"message": "Comment deleted successfully"}

# Audit Logs
@app.get("/time-monitoring/api/audit-logs", response_model=List[AuditLog])
async def get_audit_logs(skip: int = 0, limit: int = 100, user_id: Optional[int] = None):
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    
    query = """
        SELECT al.*, u.name as user_name
        FROM audit_logs al
        LEFT JOIN users u ON al.user_id = u.id
    """
    params = []
    
    if user_id:
        query += " WHERE al.user_id = %s"
        params.append(user_id)
    
    query += " ORDER BY al.created_at DESC LIMIT %s OFFSET %s"
    params.extend([limit, skip])
    
    cursor.execute(query, params)
    logs = cursor.fetchall()
    conn.close()
    return logs

@app.get("/time-monitoring/api/audit-logs/stats")
async def get_audit_stats():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Total logs
    cursor.execute("SELECT COUNT(*) FROM audit_logs")
    total_logs = cursor.fetchone()[0]
    
    # Logs by action
    cursor.execute("""
        SELECT action, COUNT(*) as count
        FROM audit_logs
        GROUP BY action
        ORDER BY count DESC
    """)
    action_stats = cursor.fetchall()
    
    # Logs by user
    cursor.execute("""
        SELECT u.name, COUNT(al.id) as count
        FROM audit_logs al
        LEFT JOIN users u ON al.user_id = u.id
        GROUP BY al.user_id, u.name
        ORDER BY count DESC
        LIMIT 10
    """)
    user_stats = cursor.fetchall()
    
    conn.close()
    
    return {
        "total_logs": total_logs,
        "action_stats": [{"action": row[0], "count": row[1]} for row in action_stats],
        "user_stats": [{"user": row[0] or "Unknown", "count": row[1]} for row in user_stats]
    }

# Statistici
@app.get("/time-monitoring/api/stats/overview")
async def get_overview_stats():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Total utilizatori
    cursor.execute("SELECT COUNT(*) FROM users")
    total_users = cursor.fetchone()[0]
    
    # Total ore
    cursor.execute("SELECT SUM(hours) FROM tasks")
    result = cursor.fetchone()
    total_hours = result[0] if result[0] is not None else 0.0
    
    # Total proiecte active
    cursor.execute("SELECT COUNT(*) FROM projects WHERE status = 'active'")
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
        "top_user": {
            "name": top_user[0] if top_user else "N/A",
            "hours": float(top_user[1]) if top_user and top_user[1] else 0.0
        },
        "average_hours_per_user": total_hours / total_users if total_users > 0 else 0
    }

@app.get("/time-monitoring/api/stats/daily/{date}")
async def get_daily_stats(date: str):
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    
    cursor.execute("""
        SELECT u.name, SUM(t.hours) as daily_hours
        FROM users u
        LEFT JOIN tasks t ON u.id = t.user_id AND t.date = %s
        GROUP BY u.id, u.name
        ORDER BY daily_hours DESC
    """, (date,))
    
    user_stats = cursor.fetchall()
    
    cursor.execute("SELECT SUM(hours) FROM tasks WHERE date = %s", (date,))
    result = cursor.fetchone()
    total_daily_hours = result[0] if result[0] is not None else 0.0
    
    conn.close()
    
    return {
        "date": date,
        "total_hours": total_daily_hours,
        "user_stats": user_stats
    }

# Export endpoints
@app.get("/time-monitoring/api/export/json")
async def export_json():
    """Export all data as JSON"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        
        # Get all data
        cursor.execute("SELECT * FROM users ORDER BY name")
        users = cursor.fetchall()
        
        cursor.execute("SELECT * FROM projects ORDER BY module_type, name")
        projects = cursor.fetchall()
        
        cursor.execute("""
            SELECT t.*, u.name as user_name, p.name as project_name, p.module_type
            FROM tasks t
            JOIN users u ON t.user_id = u.id
            JOIN projects p ON t.project_id = p.id
            ORDER BY t.date DESC, t.created_at DESC
        """)
        tasks = cursor.fetchall()
        
        conn.close()
        
        # Convertește tipurile Decimal în float pentru serializare JSON
        users = convert_decimals_to_float(users)
        projects = convert_decimals_to_float(projects)
        tasks = convert_decimals_to_float(tasks)
        
        export_data = {
            "export_info": {
                "timestamp": datetime.datetime.now().isoformat(),
                "version": "1.0.0",
                "format": "json"
            },
            "users": users,
            "projects": projects,
            "tasks": tasks
        }
        
        return JSONResponse(content=export_data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

@app.get("/time-monitoring/api/export/xml")
async def export_xml():
    """Export all data as XML"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        
        # Get all data
        cursor.execute("SELECT * FROM users ORDER BY name")
        users = cursor.fetchall()
        
        cursor.execute("SELECT * FROM projects ORDER BY module_type, name")
        projects = cursor.fetchall()
        
        cursor.execute("""
            SELECT t.*, u.name as user_name, p.name as project_name, p.module_type
            FROM tasks t
            JOIN users u ON t.user_id = u.id
            JOIN projects p ON t.project_id = p.id
            ORDER BY t.date DESC, t.created_at DESC
        """)
        tasks = cursor.fetchall()
        
        conn.close()
        
        # Convertește tipurile Decimal în float pentru serializare
        users = convert_decimals_to_float(users)
        projects = convert_decimals_to_float(projects)
        tasks = convert_decimals_to_float(tasks)
        
        # Create XML structure
        root = ET.Element("kpi_export")
        root.set("timestamp", datetime.datetime.now().isoformat())
        root.set("version", "1.0.0")
        
        # Users
        users_elem = ET.SubElement(root, "users")
        for user in users:
            user_elem = ET.SubElement(users_elem, "user")
            for key, value in user.items():
                user_elem.set(key, str(value))
        
        # Projects
        projects_elem = ET.SubElement(root, "projects")
        for project in projects:
            project_elem = ET.SubElement(projects_elem, "project")
            for key, value in project.items():
                project_elem.set(key, str(value))
        
        # Tasks
        tasks_elem = ET.SubElement(root, "tasks")
        for task in tasks:
            task_elem = ET.SubElement(tasks_elem, "task")
            for key, value in task.items():
                task_elem.set(key, str(value))
        
        # Convert to string
        xml_str = ET.tostring(root, encoding='unicode', xml_declaration=True)
        
        return JSONResponse(content={"xml": xml_str})
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

@app.get("/time-monitoring/api/export/excel")
async def export_excel():
    """Export all data as Excel file"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        
        # Get all data
        cursor.execute("SELECT * FROM users ORDER BY name")
        users = cursor.fetchall()
        
        cursor.execute("SELECT * FROM projects ORDER BY module_type, name")
        projects = cursor.fetchall()
        
        cursor.execute("""
            SELECT t.*, u.name as user_name, p.name as project_name, p.module_type
            FROM tasks t
            JOIN users u ON t.user_id = u.id
            JOIN projects p ON t.project_id = p.id
            ORDER BY t.date DESC, t.created_at DESC
        """)
        tasks = cursor.fetchall()
        
        conn.close()
        
        # Convertește tipurile Decimal în float pentru pandas
        users = convert_decimals_to_float(users)
        projects = convert_decimals_to_float(projects)
        tasks = convert_decimals_to_float(tasks)
        
        # Create Excel file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx') as tmp_file:
            with pd.ExcelWriter(tmp_file.name, engine='openpyxl') as writer:
                # Users sheet
                users_df = pd.DataFrame(users)
                users_df.to_excel(writer, sheet_name='Users', index=False)
                
                # Projects sheet
                projects_df = pd.DataFrame(projects)
                projects_df.to_excel(writer, sheet_name='Projects', index=False)
                
                # Tasks sheet
                tasks_df = pd.DataFrame(tasks)
                tasks_df.to_excel(writer, sheet_name='Tasks', index=False)
                
                # Summary sheet
                summary_data = {
                    'Metric': ['Total Users', 'Total Projects', 'Total Tasks', 'Total Hours'],
                    'Value': [
                        len(users),
                        len(projects),
                        len(tasks),
                        sum(task.get('hours', 0) for task in tasks)
                    ]
                }
                summary_df = pd.DataFrame(summary_data)
                summary_df.to_excel(writer, sheet_name='Summary', index=False)
            
            # Return file
            return FileResponse(
                tmp_file.name,
                media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                filename=f'kpi_export_{datetime.datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx'
            )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

if __name__ == "__main__":
    init_db()
    uvicorn.run(app, host="0.0.0.0", port=8000)