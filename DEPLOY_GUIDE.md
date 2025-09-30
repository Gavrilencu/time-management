# 🚀 Deploy Guide - Time Management System

## 📋 Prerequisituri

### Server Requirements
- **OS**: Ubuntu 20.04+ sau CentOS 8+
- **RAM**: Minimum 2GB, recomandat 4GB+
- **Storage**: Minimum 10GB liber
- **CPU**: Minimum 2 cores

### Software Requirements
- **Node.js**: v18+ (pentru build)
- **Python**: v3.8+ (pentru backend)
- **MySQL**: v8.0+ (pentru baza de date)
- **Nginx**: v1.18+ (pentru reverse proxy)
- **Git**: Pentru deploy automat

## 🔧 Instalare și Configurare

### 1. Pregătirea Serverului

```bash
# Actualizează sistemul
sudo apt update && sudo apt upgrade -y

# Instalează dependențele
sudo apt install -y nginx mysql-server python3 python3-pip nodejs npm git

# Creează utilizatorul pentru deploy
sudo useradd -m -s /bin/bash deploy
sudo usermod -aG sudo deploy
```

### 2. Configurarea Bazei de Date

```bash
# Conectează-te la MySQL
sudo mysql -u root -p

# Creează baza de date și utilizatorul
CREATE DATABASE kpi_tracker_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'time_management'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON kpi_tracker_prod.* TO 'time_management'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Configurarea Aplicației

```bash
# Clonează repository-ul
sudo -u deploy git clone https://github.com/your-repo/time-management.git /var/www/time-management

# Setează permisiunile
sudo chown -R deploy:deploy /var/www/time-management
sudo chmod -R 755 /var/www/time-management
```

### 4. Configurarea Variabilelor de Mediu

```bash
# Creează fișierul de configurație pentru producție
sudo -u deploy tee /var/www/time-management/.env.production > /dev/null << 'EOF'
NODE_ENV=production
VITE_API_URL=https://your-domain.com
VITE_APP_NAME=Time Management System
VITE_APP_VERSION=1.0.0

DB_HOST=localhost
DB_USER=time_management
DB_PASSWORD=your_secure_password
DB_NAME=kpi_tracker_prod
DB_PORT=3306

JWT_SECRET=your_super_secure_jwt_secret_key_here
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com

LOG_LEVEL=info
LOG_FILE=/var/log/time-management/app.log

RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
EOF
```

## 🏗️ Build și Deploy

### Metoda 1: Deploy Automat

```bash
# Rulează scriptul de build
./build-production.sh

# Rulează scriptul de deploy
./deploy-production.sh
```

### Metoda 2: Deploy Manual

```bash
# Build frontend
npm install
npm run build

# Instalează dependențele backend
cd backend
pip3 install -r requirements.txt

# Copiază fișierele pe server
rsync -avz --delete build/ deploy@your-server.com:/var/www/time-management/
rsync -avz --delete backend/ deploy@your-server.com:/var/www/time-management/backend/
```

## ⚙️ Configurarea Serviciilor

### 1. Nginx Configuration

```bash
# Copiază configurația nginx
sudo cp nginx-time-management.conf /etc/nginx/sites-available/time-management

# Activează site-ul
sudo ln -s /etc/nginx/sites-available/time-management /etc/nginx/sites-enabled/

# Testează configurația
sudo nginx -t

# Reîncarcă nginx
sudo systemctl reload nginx
```

### 2. Systemd Service

```bash
# Copiază configurația systemd
sudo cp systemd-time-management-backend.service /etc/systemd/system/time-management-backend.service

# Reîncarcă systemd
sudo systemctl daemon-reload

# Activează serviciul
sudo systemctl enable time-management-backend
sudo systemctl start time-management-backend
```

## 🔒 Securitate

### 1. Firewall Configuration

```bash
# Configurează UFW
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 2. SSL Certificate (Let's Encrypt)

```bash
# Instalează Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obține certificatul SSL
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Configurează auto-renewal
sudo crontab -e
# Adaugă: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 3. Database Security

```bash
# Configurează MySQL pentru securitate
sudo mysql_secure_installation

# Configurează bind-address în /etc/mysql/mysql.conf.d/mysqld.cnf
bind-address = 127.0.0.1
```

## 📊 Monitoring și Logging

### 1. Log Files

```bash
# Log-uri aplicație
tail -f /var/log/time-management/app.log

# Log-uri nginx
tail -f /var/log/nginx/time-management.access.log
tail -f /var/log/nginx/time-management.error.log

# Log-uri systemd
sudo journalctl -u time-management-backend -f
```

### 2. Monitoring

```bash
# Status servicii
sudo systemctl status time-management-backend
sudo systemctl status nginx

# Resurse sistem
htop
df -h
free -h
```

## 🔄 Update și Maintenance

### 1. Update Aplicație

```bash
# Backup
sudo -u deploy cp -r /var/www/time-management /var/www/time-management-backup-$(date +%Y%m%d)

# Pull changes
cd /var/www/time-management
sudo -u deploy git pull origin main

# Rebuild
sudo -u deploy npm run build

# Restart servicii
sudo systemctl restart time-management-backend
sudo systemctl reload nginx
```

### 2. Database Backup

```bash
# Backup zilnic
mysqldump -u time_management -p kpi_tracker_prod > /var/backups/kpi_tracker_$(date +%Y%m%d).sql

# Restore
mysql -u time_management -p kpi_tracker_prod < /var/backups/kpi_tracker_20240101.sql
```

## 🚨 Troubleshooting

### Probleme Comune

1. **Backend nu pornește**
   ```bash
   sudo journalctl -u time-management-backend -n 50
   ```

2. **Frontend nu se încarcă**
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

3. **Erori de bază de date**
   ```bash
   mysql -u time_management -p -e "SHOW DATABASES;"
   ```

4. **Probleme de permisiuni**
   ```bash
   sudo chown -R deploy:deploy /var/www/time-management
   sudo chmod -R 755 /var/www/time-management
   ```

## 📞 Support

Pentru probleme sau întrebări:
- **Email**: support@your-domain.com
- **Documentație**: https://docs.your-domain.com
- **Issues**: https://github.com/your-repo/time-management/issues
