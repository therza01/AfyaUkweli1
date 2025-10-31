#!/bin/bash

# AfyaUkweli - Quick GitHub Deployment Script
# This script helps you push your code to GitHub

echo "🚀 AfyaUkweli - GitHub Deployment Helper"
echo "========================================"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing git repository..."
    git init
    echo "✅ Git initialized"
    echo ""
fi

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "📝 Adding all files to git..."
    git add .
    echo "✅ Files added"
    echo ""

    echo "💾 Committing changes..."
    git commit -m "AfyaUkweli - Hedera Hashgraph Project - Ready for deployment"
    echo "✅ Changes committed"
    echo ""
else
    echo "✅ No new changes to commit"
    echo ""
fi

# Check if remote origin exists
if git remote | grep -q "origin"; then
    echo "🔗 Remote 'origin' already exists"
    echo "Current remote URL:"
    git remote get-url origin
    echo ""

    echo "🔄 Do you want to push to this remote? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo "📤 Pushing to GitHub..."
        git branch -M main
        git push -u origin main
        echo "✅ Code pushed to GitHub!"
        echo ""
    else
        echo "⏭️  Skipping push"
        echo ""
    fi
else
    echo "⚠️  No remote repository configured"
    echo ""
    echo "Please create a GitHub repository first:"
    echo "1. Go to https://github.com/new"
    echo "2. Repository name: afyaukweli"
    echo "3. Visibility: Public"
    echo "4. Do NOT initialize with README"
    echo "5. Click 'Create repository'"
    echo ""
    echo "Then run these commands:"
    echo ""
    echo "  git remote add origin https://github.com/YOUR_USERNAME/afyaukweli.git"
    echo "  git branch -M main"
    echo "  git push -u origin main"
    echo ""
fi

echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. ✅ Your code is committed to git"
echo ""
echo "2. 🌐 Create GitHub repository (if not done):"
echo "   → Visit: https://github.com/new"
echo "   → Name: afyaukweli"
echo "   → Visibility: Public"
echo "   → Click 'Create'"
echo ""
echo "3. 🔗 Connect your repo (if not done):"
echo "   git remote add origin https://github.com/YOUR_USERNAME/afyaukweli.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "4. ☁️  Deploy to Vercel:"
echo "   → Visit: https://vercel.com"
echo "   → Click 'Add New...' → 'Project'"
echo "   → Import your GitHub repository"
echo "   → Add environment variables:"
echo ""
echo "     NEXT_PUBLIC_SUPABASE_URL=https://eucbioblmhdifclgvzqr.supabase.co"
echo ""
echo "     NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1Y2Jpb2JsbWhkaWZjbGd2enFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MDk1MDAsImV4cCI6MjA3NzM4NTUwMH0.PK2WlB-b4E2M7L0PAQEl3tYXzaZkybcAisvbgay5Nq4"
echo ""
echo "     HEDERA_MOCK=true"
echo ""
echo "   → Click 'Deploy'"
echo "   → Wait 2-3 minutes"
echo "   → Copy your deployment URL!"
echo ""
echo "5. 🧪 Test your deployment:"
echo "   → Login as: akinyi.otieno@afya.ke / demo123"
echo "   → Submit a task and verify it works"
echo ""
echo "6. 🎯 Submit your URL to Hedera course!"
echo ""
echo "✅ You're ready! Good luck! 🚀"
echo ""
