#!/bin/bash
set -e

echo "======================================"
echo "  DocTools – Setup Script"
echo "======================================"

# Backend
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install
cp -n .env.example .env || true
echo "✅ Backend ready"

# Frontend
echo ""
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install
cp -n .env.example .env || true
echo "✅ Frontend ready"

echo ""
echo "======================================"
echo "  ✅ Setup complete!"
echo ""
echo "  Next steps:"
echo "  1. Add your Stripe keys to backend/.env and frontend/.env"
echo "  2. Run:  cd backend && npm run dev"
echo "  3. Run:  cd frontend && npm start   (in a new terminal)"
echo "======================================"
