#!/bin/bash
set -e

echo "🚀 Starting Personal Money Manager Application..."

# Cache configuration, routes, and views for optimal production performance
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

# Run database migrations if database URL or host is set
if [ -n "$DB_HOST" ] || [ -n "$DATABASE_URL" ]; then
    echo "📦 Running Database Migrations..."
    php artisan migrate --force || true
fi

echo "✨ Web application ready! Starting Apache web server..."
exec apache2-foreground
