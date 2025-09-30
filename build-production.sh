#!/bin/bash

# Script de build pentru producție
# Time Management System

echo "🚀 Building Time Management System for Production..."

# Verifică dacă Node.js este instalat
if ! command -v node &> /dev/null; then
    echo "❌ Node.js nu este instalat!"
    exit 1
fi

# Verifică dacă Python este instalat
if ! command -v python &> /dev/null; then
    echo "❌ Python nu este instalat!"
    exit 1
fi

# Instalează dependențele frontend
echo "📦 Installing frontend dependencies..."
npm install

# Build frontend pentru producție
echo "🔨 Building frontend for production..."
npm run build

# Verifică dacă build-ul a reușit
if [ ! -d "build" ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi

echo "✅ Frontend build completed successfully!"

# Instalează dependențele backend
echo "📦 Installing backend dependencies..."
cd backend
pip install -r requirements.txt

# Verifică configurația bazei de date
echo "🔍 Checking database configuration..."
if [ ! -f "mysql_config.ini" ]; then
    echo "⚠️  mysql_config.ini not found. Please configure database settings."
fi

echo "✅ Backend dependencies installed!"

# Creează directorul pentru producție
echo "📁 Creating production directory..."
cd ..
mkdir -p production
cp -r build/* production/
cp -r backend production/
cp package.json production/
cp README.md production/

# Creează scriptul de pornire pentru producție
cat > production/start.sh << 'EOF'
#!/bin/bash

# Script de pornire pentru producție
echo "🚀 Starting Time Management System..."

# Setează variabilele de mediu pentru producție
export NODE_ENV=production
export LOG_LEVEL=info

# Pornește backend-ul
echo "🔧 Starting backend server..."
cd backend
python main.py &

# Pornește serverul static pentru frontend
echo "🌐 Starting frontend server..."
cd ..
python -m http.server 8080 --directory . &

echo "✅ Time Management System started!"
echo "🌐 Frontend: http://localhost:8080"
echo "🔧 Backend: http://localhost:8000"
EOF

chmod +x production/start.sh

echo "✅ Production build completed!"
echo "📁 Production files are in the 'production' directory"
echo "🚀 Run './production/start.sh' to start the application"
