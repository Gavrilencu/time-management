# Configurare MySQL pentru KPI Time Tracker

## Variabile de Mediu

Creează un fișier `.env` în directorul `backend/` cu următoarele variabile:

```env
# Configurare MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password_here
MYSQL_DATABASE=kpi_tracker
```

## Instalare MySQL

### Windows:
1. Descarcă MySQL Server de la https://dev.mysql.com/downloads/mysql/
2. Instalează MySQL Server
3. Configurează parola pentru utilizatorul `root`
4. Asigură-te că serviciul MySQL rulează

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
mysql_secure_installation
```

## Configurare Baza de Date

1. **Conectează-te la MySQL:**
```bash
mysql -u root -p
```

2. **Creează baza de date (opțional - aplicația o creează automat):**
```sql
CREATE DATABASE IF NOT EXISTS kpi_tracker;
```

3. **Creează un utilizator dedicat (opțional):**
```sql
CREATE USER 'kpi_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON kpi_tracker.* TO 'kpi_user'@'localhost';
FLUSH PRIVILEGES;
```

## Instalare Dependințe Python

```bash
cd backend
pip install -r requirements.txt
```

## Testare Conexiune

1. **Verifică că MySQL rulează:**
```bash
# Windows
net start mysql

# Linux/macOS
sudo systemctl status mysql
# sau
brew services list | grep mysql
```

2. **Testează conexiunea:**
```bash
mysql -u root -p -e "SHOW DATABASES;"
```

## Rulare Aplicație

1. **Configurează variabilele de mediu** în `.env`
2. **Rulează backend-ul:**
```bash
cd backend
python main.py
```

3. **Backend-ul va:**
   - Crea automat baza de date `kpi_tracker` dacă nu există
   - Crea automat tabelele necesare
   - Porni serverul pe `http://localhost:8000`

## Verificare Funcționare

Testează API-ul:
```bash
curl http://localhost:8000/api/users
```

Ar trebui să returneze o listă goală `[]` dacă nu există utilizatori.

## Migrare de la SQLite

Dacă ai date în SQLite și vrei să le migrezi:

1. **Exportă datele din SQLite:**
```bash
sqlite3 kpi_tracker.db .dump > backup.sql
```

2. **Adaptează fișierul pentru MySQL** (înlocuiește `INTEGER PRIMARY KEY AUTOINCREMENT` cu `INT AUTO_INCREMENT PRIMARY KEY`)

3. **Importă în MySQL:**
```bash
mysql -u root -p kpi_tracker < backup.sql
```

## Troubleshooting

### Eroare de conexiune:
- Verifică că MySQL rulează
- Verifică credențialele din `.env`
- Verifică că portul 3306 este deschis

### Eroare de permisiuni:
- Asigură-te că utilizatorul are permisiuni pe baza de date
- Verifică că baza de date există

### Eroare de charset:
- MySQL folosește `utf8mb4` pentru suport complet Unicode
- Verifică că tabelele sunt create cu charset corect

## Configurare Producție

Pentru producție, folosește:
- Utilizator dedicat (nu `root`)
- Parolă puternică
- Configurare SSL
- Backup regulat
- Monitorizare performanță
