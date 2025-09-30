#!/usr/bin/env python3
"""
Script pentru inițializarea bazei de date MySQL pentru KPI Time Tracker
"""

import pymysql
import configparser
import os
import sys

def load_mysql_config():
    """Încarcă configurația MySQL din fișierul mysql_config.ini"""
    config = configparser.ConfigParser()
    config.read('mysql_config.ini')
    
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

def create_database():
    """Creează baza de date MySQL"""
    try:
        config = load_mysql_config()
        
        # Conectare fără specificarea bazei de date pentru a o crea
        connection = pymysql.connect(
            host=config['host'],
            port=config['port'],
            user=config['user'],
            password=config['password'],
            charset=config['charset']
        )
        
        cursor = connection.cursor()
        
        # Creează baza de date dacă nu există
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {config['database']} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        print(f"✅ Baza de date '{config['database']}' a fost creată cu succes!")
        
        connection.close()
        return True
        
    except Exception as e:
        print(f"❌ Eroare la crearea bazei de date: {e}")
        return False

def init_tables():
    """Inițializează tabelele în baza de date MySQL"""
    try:
        config = load_mysql_config()
        
        connection = pymysql.connect(**config)
        cursor = connection.cursor()
        
        # Tabel utilizatori
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                role VARCHAR(50) NOT NULL,
                department VARCHAR(100) NOT NULL,
                total_hours DECIMAL(10,2) DEFAULT 0.00,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Tabel proiecte
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS projects (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                module_type VARCHAR(50) NOT NULL,
                status VARCHAR(50) DEFAULT 'active',
                total_hours DECIMAL(10,2) DEFAULT 0.00,
                visibility_type VARCHAR(50) DEFAULT 'all',
                visible_departments JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Tabel task-uri
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tasks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                project_id INT NOT NULL,
                description TEXT NOT NULL,
                hours DECIMAL(5,2) NOT NULL,
                date DATE NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (project_id) REFERENCES projects (id)
            )
        """)
        
        # Tabel comentarii task-uri
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS task_comments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                task_id INT NOT NULL,
                user_id INT NOT NULL,
                comment TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (task_id) REFERENCES tasks (id),
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)
        
        # Tabel audit logs
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                action VARCHAR(100) NOT NULL,
                table_name VARCHAR(100) NOT NULL,
                record_id INT NOT NULL,
                old_values JSON,
                new_values JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)
        
        print("✅ Tabelele au fost create cu succes!")
        
        connection.commit()
        connection.close()
        return True
        
    except Exception as e:
        print(f"❌ Eroare la crearea tabelelor: {e}")
        return False

def add_demo_data():
    """Adaugă date demo în baza de date"""
    try:
        config = load_mysql_config()
        
        connection = pymysql.connect(**config)
        cursor = connection.cursor()
        
        # Adaugă demo user dacă nu există
        cursor.execute("SELECT COUNT(*) FROM users WHERE email = %s", ("demo@company.com",))
        if cursor.fetchone()[0] == 0:
            cursor.execute("""
                INSERT INTO users (name, email, role, department, total_hours)
                VALUES (%s, %s, %s, %s, %s)
            """, ("Demo User", "demo@company.com", "Admin", "IT", 0.0))
            print("✅ Utilizator demo a fost creat!")
        else:
            print("ℹ️  Utilizator demo există deja")
        
        # Adaugă demo proiecte dacă nu există
        demo_projects = [
            ("Website Redesign", "Redesign complet al website-ului companiei", "proiecte"),
            ("Mobile App", "Dezvoltare aplicație mobilă", "proiecte"),
            ("EVOM Training", "Training pentru echipă", "evom"),
            ("Server Maintenance", "Mentenanță servere", "operational")
        ]
        
        for name, desc, module_type in demo_projects:
            cursor.execute("SELECT COUNT(*) FROM projects WHERE name = %s", (name,))
            if cursor.fetchone()[0] == 0:
                cursor.execute("""
                    INSERT INTO projects (name, description, module_type, visibility_type)
                    VALUES (%s, %s, %s, %s)
                """, (name, desc, module_type, "all"))
        
        print("✅ Proiecte demo au fost create!")
        
        connection.commit()
        connection.close()
        return True
        
    except Exception as e:
        print(f"❌ Eroare la adăugarea datelor demo: {e}")
        return False

def main():
    """Funcția principală"""
    print("🚀 Inițializare bază de date MySQL pentru KPI Time Tracker")
    print("=" * 60)
    
    # Verifică dacă fișierul de configurare există
    if not os.path.exists('mysql_config.ini'):
        print("❌ Fișierul mysql_config.ini nu există!")
        print("Te rog să creezi fișierul de configurare MySQL înainte de a rula acest script.")
        sys.exit(1)
    
    # Pasul 1: Creează baza de date
    print("\n📊 Pasul 1: Creare bază de date...")
    if not create_database():
        sys.exit(1)
    
    # Pasul 2: Creează tabelele
    print("\n📋 Pasul 2: Creare tabele...")
    if not init_tables():
        sys.exit(1)
    
    # Pasul 3: Adaugă date demo
    print("\n🎯 Pasul 3: Adăugare date demo...")
    if not add_demo_data():
        sys.exit(1)
    
    print("\n🎉 Inițializarea bazei de date MySQL a fost completată cu succes!")
    print("\n📝 Următorii pași:")
    print("1. Asigură-te că MySQL server rulează")
    print("2. Pornește aplicația cu: python main.py")
    print("3. Accesează aplicația în browser")

if __name__ == "__main__":
    main()
