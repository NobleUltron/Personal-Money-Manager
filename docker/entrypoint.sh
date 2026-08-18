#!/bin/bash
set -e

echo "🚀 Starting Personal Money Manager Application..."

# Fallback production environment variables if not set in cloud host
export APP_KEY="${APP_KEY:-base64:+9xomeROcyZIS8VhBeUHdRBCoaLMTdHKx7HQu1vM1bc=}"
export APP_ENV="${APP_ENV:-production}"
export APP_DEBUG="true"
export DB_CONNECTION="${DB_CONNECTION:-sqlite}"
export DB_DATABASE="${DB_DATABASE:-/var/www/html/database/database.sqlite}"
export SESSION_DRIVER="${SESSION_DRIVER:-file}"
export LOG_CHANNEL="${LOG_CHANNEL:-stderr}"

# Ensure database directory and SQLite file exist
mkdir -p /var/www/html/database
if [ ! -f /var/www/html/database/database.sqlite ]; then
    echo "Creating SQLite database file..."
    touch /var/www/html/database/database.sqlite
fi
chmod -R 777 /var/www/html/database /var/www/html/storage /var/www/html/bootstrap/cache || true

# Clear cached config so environment changes take effect immediately
php artisan config:clear || true
php artisan route:clear || true
php artisan view:clear || true

# Run database migrations
echo "📦 Running Database Migrations..."
php artisan migrate --force || true

echo "✨ Web application ready! Starting Apache web server..."
exec apache2-foreground
