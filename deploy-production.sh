#!/bin/bash

# Script de deploy pentru producție
# Time Management System

# Configurație
SERVER_HOST="your-server.com"
SERVER_USER="deploy"
SERVER_PATH="/var/www/time-management"
LOCAL_BUILD_DIR="production"

echo "🚀 Deploying Time Management System to Production..."

# Verifică dacă directorul de build există
if [ ! -d "$LOCAL_BUILD_DIR" ]; then
    echo "❌ Production build directory not found!"
    echo "🔧 Run './build-production.sh' first to create the production build"
    exit 1
fi

# Creează backup-ul versiunii anterioare
echo "💾 Creating backup of previous version..."
ssh $SERVER_USER@$SERVER_HOST "mkdir -p $SERVER_PATH/backup-$(date +%Y%m%d-%H%M%S)"

# Oprește serviciile
echo "⏹️  Stopping services..."
ssh $SERVER_USER@$SERVER_HOST "sudo systemctl stop time-management-backend || true"
ssh $SERVER_USER@$SERVER_HOST "sudo systemctl stop time-management-frontend || true"

# Face backup-ul versiunii curente
echo "📦 Backing up current version..."
ssh $SERVER_USER@$SERVER_HOST "cp -r $SERVER_PATH/* $SERVER_PATH/backup-$(date +%Y%m%d-%H%M%S)/ || true"

# Upload noile fișiere
echo "📤 Uploading new files..."
rsync -avz --delete $LOCAL_BUILD_DIR/ $SERVER_USER@$SERVER_HOST:$SERVER_PATH/

# Setează permisiunile corecte
echo "🔐 Setting correct permissions..."
ssh $SERVER_USER@$SERVER_HOST "chmod +x $SERVER_PATH/start.sh"
ssh $SERVER_USER@$SERVER_HOST "chmod -R 755 $SERVER_PATH"

# Configurează serviciile systemd
echo "⚙️  Configuring systemd services..."

# Backend service
ssh $SERVER_USER@$SERVER_HOST "sudo tee /etc/systemd/system/time-management-backend.service > /dev/null << 'EOF'
[Unit]
Description=Time Management Backend API
After=network.target mysql.service

[Service]
Type=simple
User=$SERVER_USER
WorkingDirectory=$SERVER_PATH/backend
Environment=NODE_ENV=production
Environment=DB_HOST=localhost
Environment=DB_USER=time_management
Environment=DB_PASSWORD=your_secure_password
Environment=DB_NAME=kpi_tracker_prod
Environment=LOG_FILE=/var/log/time-management/backend.log
ExecStart=/usr/bin/python3 main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF"

# Frontend service (nginx)
ssh $SERVER_USER@$SERVER_HOST "sudo tee /etc/nginx/sites-available/time-management > /dev/null << 'EOF'
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    root $SERVER_PATH;
    index index.html;
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location /security/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF"

# Activează site-ul nginx
ssh $SERVER_USER@$SERVER_HOST "sudo ln -sf /etc/nginx/sites-available/time-management /etc/nginx/sites-enabled/"
ssh $SERVER_USER@$SERVER_HOST "sudo nginx -t && sudo systemctl reload nginx"

# Creează directorul pentru log-uri
ssh $SERVER_USER@$SERVER_HOST "sudo mkdir -p /var/log/time-management"
ssh $SERVER_USER@$SERVER_HOST "sudo chown $SERVER_USER:$SERVER_USER /var/log/time-management"

# Reîncarcă și pornește serviciile
echo "🔄 Reloading and starting services..."
ssh $SERVER_USER@$SERVER_HOST "sudo systemctl daemon-reload"
ssh $SERVER_USER@$SERVER_HOST "sudo systemctl enable time-management-backend"
ssh $SERVER_USER@$SERVER_HOST "sudo systemctl start time-management-backend"

# Verifică statusul serviciilor
echo "🔍 Checking service status..."
ssh $SERVER_USER@$SERVER_HOST "sudo systemctl status time-management-backend --no-pager"

echo "✅ Deploy completed successfully!"
echo "🌐 Application should be available at: http://your-domain.com"
echo "🔧 Backend API: http://your-domain.com/api/"
echo "📊 Check logs: sudo journalctl -u time-management-backend -f"
