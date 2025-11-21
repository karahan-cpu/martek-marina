#!/bin/bash
# Script to add DATABASE_URL to Vercel
# Get your connection string from: https://app.supabase.com/project/qvgciezihmcprqoybhdx/settings/database

echo "Adding DATABASE_URL to Vercel..."
echo "Please enter your Supabase PostgreSQL connection string:"
echo "You can find it at: https://app.supabase.com/project/qvgciezihmcprqoybhdx/settings/database"
echo ""
read -p "DATABASE_URL: " DATABASE_URL

if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL cannot be empty"
    exit 1
fi

echo "$DATABASE_URL" | vercel env add DATABASE_URL production
echo "$DATABASE_URL" | vercel env add DATABASE_URL preview
echo "$DATABASE_URL" | vercel env add DATABASE_URL development

echo ""
echo "✅ DATABASE_URL added to all environments!"
echo "Redeploy your project for changes to take effect."

