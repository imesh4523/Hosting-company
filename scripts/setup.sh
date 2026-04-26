#!/bin/bash

echo "🚀 Starting UltaHost VPS Platform Setup..."

# 1. Install dependencies for all parts
echo "📦 Installing Backend dependencies..."
cd backend && npm install
cd ..

echo "📦 Installing Frontend dependencies..."
cd frontend && npm install
cd ..

echo "📦 Installing Admin Panel dependencies..."
cd admin && npm install
cd ..

# 2. Setup Environment Variables
echo "🔑 Setting up environment variables..."
if [ ! -f .env ]; then
  cp backend/.env.example .env
  echo "✅ Created .env file. Please update it with your API keys."
fi

# 3. Database Migration
echo "🗄️ Running database migrations..."
cd backend && npx prisma migrate dev --name init
cd ..

# 4. Start Docker
echo "🐳 Starting Docker containers..."
docker-compose up -d

echo "✅ Setup complete! Platform is running at:"
echo "🌍 Customer Site: http://localhost:3000"
echo "⚙️ Admin Panel: http://localhost:3001"
echo "🛠️ Backend API: http://localhost:5000"
