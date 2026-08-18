#!/bin/bash
set -e

echo "🚀 Starting Personal Money Manager Application..."

# Ensure database directory and SQLite file exist if no external DB configured
mkdir -p /var/www/html/database
if [ ! -f /var/www/html/database/database.sqlite ]; then
    echo "Creating SQLite database file..."
    touch /var/www/html/database/database.sqlite
fi
chmod -R 777 /var/www/html/database /var/www/html/storage /var/www/html/bootstrap/cache || true

# Run database migrations
echo "📦 Running Database Migrations..."
php artisan migrate --force || true

# Cache configuration, routes, and views for optimal production performance
echo "⚡ Caching routes and views..."
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

echo "✨ Web application ready! Starting Apache web server..."
exec apache2-foreground
