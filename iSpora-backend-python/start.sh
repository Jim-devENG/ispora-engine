#!/bin/bash

echo "🚀 Starting iSpora Python Backend..."
echo

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    echo "Please install Python 3.8+ from https://python.org"
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "📦 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

echo
echo "🚀 Starting server..."
echo "📊 Health check: http://localhost:3001/health"
echo "🌍 Environment: development"
echo "🔗 Frontend URL: http://localhost:5173"
echo

python run.py
