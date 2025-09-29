# 🗄️ Ghid Configurare MySQL pentru KPI Time Tracker

## 📋 Cerințe

Pentru ca aplicația să funcționeze, ai nevoie de:

1. **MySQL Server** instalat și configurat
2. **Utilizator MySQL** cu permisiuni pentru a crea baze de date
3. **Fișierul de configurare** `mysql_config.ini` completat

## 🚀 Instalare MySQL

### Windows:

#### Opțiunea 1: MySQL Server (Recomandat)
1. Descarcă MySQL Server de la: https://dev.mysql.com/downloads/mysql/
2. Instalează cu configurarea standard
3. Notează parola root pe care o setezi

#### Opțiunea 2: XAMPP (Simplu pentru dezvoltare)
1. Descarcă XAMPP de la: https://www.apachefriends.org/
2. Instalează și pornește MySQL din XAMPP Control Panel
3. MySQL va rula pe portul 3306

### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

### macOS:
```bash
brew install mysql
brew services start mysql
```

## ⚙️ Configurare Aplicație

### 1. Editează fișierul `mysql_config.ini`:

```ini
[mysql]
# Configurare MySQL pentru KPI Time Tracker
host = localhost
port = 3306
user = root
password = PAROLA_TA_MYSQL
database = kpi_tracker
charset = utf8mb4
autocommit = true
```

### 2. Înlocuiește `PAROLA_TA_MYSQL` cu parola reală:

**Pentru MySQL Server:**
- Parola pe care ai setat-o la instalare

**Pentru XAMPP:**
- Parola este de obicei goală (`password = `)
- Sau `password = root` dacă ai setat-o

### 3. Verifică configurarea:

```bash
# Testează conexiunea MySQL
mysql -h localhost -u root -p
# Introdu parola când ești întrebat
```

## 🔧 Verificare Configurare

### 1. Verifică dacă MySQL rulează:

**Windows:**
```cmd
net start mysql
# sau pentru XAMPP
# Pornește MySQL din XAMPP Control Panel
```

**Linux/macOS:**
```bash
sudo systemctl status mysql
# sau
brew services list | grep mysql
```

### 2. Testează conexiunea:

```bash
mysql -h localhost -u root -p -e "SHOW DATABASES;"
```

### 3. Verifică permisiunile utilizatorului:

```sql
-- Conectează-te la MySQL
mysql -u root -p

-- Verifică permisiunile
SHOW GRANTS FOR 'root'@'localhost';

-- Dacă nu are permisiuni, acordă-le:
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;
```

## 🚀 Pornire Aplicație

### 1. Asigură-te că MySQL rulează

### 2. Pornește backend-ul:
```bash
cd backend
python main.py
```

### 3. Verifică log-urile:
```
Conectare la MySQL: localhost:3306
Utilizator: root
Baza de date: kpi_tracker
Baza de date 'kpi_tracker' creată/verificată
Tabel 'users' creat/verificat
Tabel 'projects' creat/verificat
Tabel 'tasks' creat/verificat
✅ MySQL database initialized successfully
```

## 🔒 Configurare Securitate (Producție)

Pentru mediul de producție, folosește un utilizator dedicat:

### 1. Creează utilizator dedicat:
```sql
-- Conectează-te ca root
mysql -u root -p

-- Creează utilizatorul
CREATE USER 'kpi_user'@'localhost' IDENTIFIED BY 'parola_puternica';

-- Acordă permisiuni doar pentru baza de date KPI
GRANT ALL PRIVILEGES ON kpi_tracker.* TO 'kpi_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Actualizează `mysql_config.ini`:
```ini
[mysql]
host = localhost
port = 3306
user = kpi_user
password = parola_puternica
database = kpi_tracker
charset = utf8mb4
autocommit = true
```

## 🐛 Depanare Probleme

### Eroarea: "Can't connect to MySQL server"

**Cauze posibile:**
1. MySQL nu rulează
2. Portul 3306 este blocat
3. Credențialele sunt greșite

**Soluții:**
```bash
# Verifică dacă MySQL rulează
netstat -an | findstr :3306

# Pornește MySQL
net start mysql

# Testează conexiunea
mysql -h localhost -u root -p
```

### Eroarea: "Access denied for user"

**Cauze posibile:**
1. Parola greșită
2. Utilizatorul nu există
3. Permisiuni insuficiente

**Soluții:**
```sql
-- Resetare parolă root (dacă ai uitat-o)
-- Oprește MySQL
-- Pornește în mod sigur
mysqld --skip-grant-tables

-- În alt terminal:
mysql -u root
UPDATE mysql.user SET authentication_string=PASSWORD('noua_parola') WHERE User='root';
FLUSH PRIVILEGES;
```

### Eroarea: "Database doesn't exist"

**Soluție:**
```sql
-- Creează manual baza de date
mysql -u root -p
CREATE DATABASE kpi_tracker;
```

## 📊 Structura Bazei de Date

Aplicația va crea automat următoarele tabele:

### `users`
- `id` - ID unic utilizator
- `name` - Numele utilizatorului
- `email` - Email unic
- `role` - Rolul (User/Admin)
- `total_hours` - Total ore lucrate
- `created_at` - Data creării

### `projects`
- `id` - ID unic proiect
- `name` - Numele proiectului
- `description` - Descrierea
- `module_type` - Tipul modulului (proiecte/evom/operational)
- `status` - Statusul (active/inactive)
- `total_hours` - Total ore lucrate pe proiect
- `created_at` - Data creării

### `tasks`
- `id` - ID unic task
- `user_id` - ID utilizator (FK)
- `project_id` - ID proiect (FK)
- `description` - Descrierea task-ului
- `hours` - Orele lucrate
- `date` - Data lucrării
- `created_at` - Data creării

## ✅ Verificare Finală

După configurare, aplicația ar trebui să:

1. ✅ Se conecteze la MySQL fără erori
2. ✅ Creeze automat baza de date și tabelele
3. ✅ Funcționeze cu toate endpoint-urile API
4. ✅ Suporte export JSON, XML și Excel

## 📞 Suport

Dacă întâmpini probleme:

1. Verifică log-urile backend-ului
2. Testează conexiunea MySQL manual
3. Verifică configurarea din `mysql_config.ini`
4. Asigură-te că MySQL rulează și este accesibil

---

**🎉 Succes! Aplicația KPI Time Tracker este configurată să folosească doar MySQL!**
