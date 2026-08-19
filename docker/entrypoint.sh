#!/bin/bash
set -e

echo "🚀 Starting Personal Money Manager Application..."

# Purge any stale cache files from bootstrap/cache
rm -f /var/www/html/bootstrap/cache/*.php || true

# Dynamic Apache Port Binding
PORT_NUM="${PORT:-80}"
echo "Configuring Apache to listen on port ${PORT_NUM}..."
sed -i "s/Listen [0-9]*/Listen ${PORT_NUM}/g" /etc/apache2/ports.conf || true
sed -i "s/<VirtualHost \*:[0-9]*>/<VirtualHost *:${PORT_NUM}>/g" /etc/apache2/sites-available/000-default.conf || true

# Ensure all storage and database directories exist with full write permissions
mkdir -p /var/www/html/storage/framework/sessions \
         /var/www/html/storage/framework/views \
         /var/www/html/storage/framework/cache/data \
         /var/www/html/storage/logs \
         /var/www/html/database \
         /var/www/html/bootstrap/cache

# Detect Database Connection
if [ -n "$DATABASE_URL" ]; then
    echo "🐘 PostgreSQL connection detected via DATABASE_URL!"
    DB_CONN="pgsql"
else
    DB_CONN="${DB_CONNECTION:-sqlite}"
    echo "📁 Using SQLite database connection..."
fi

# Always dynamically generate the production .env file to ensure correct DATABASE_URL and SESSION_DRIVER
echo "Writing production .env file with DB_CONNECTION=${DB_CONN}..."
cat <<EOF > /var/www/html/.env
APP_NAME="Personal Money Manager"
APP_ENV=production
APP_KEY="${APP_KEY:-base64:+9xomeROcyZIS8VhBeUHdRBCoaLMTdHKx7HQu1vM1bc=}"
APP_DEBUG="${APP_DEBUG:-true}"
APP_URL="${APP_URL:-https://personal-money-manager.onrender.com}"
LOG_CHANNEL=stderr
DB_CONNECTION=${DB_CONN}
DATABASE_URL="${DATABASE_URL:-}"
DB_DATABASE=/var/www/html/database/database.sqlite
SESSION_DRIVER=file
QUEUE_CONNECTION=sync
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=nobleultron@gmail.com
MAIL_PASSWORD=ohbsixlueyuaugni
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=nobleultron@gmail.com
MAIL_FROM_NAME="Personal Money Manager"
EOF

# Ensure SQLite database file exists if sqlite is used
if [ "$DB_CONN" = "sqlite" ] && [ ! -f /var/www/html/database/database.sqlite ]; then
    echo "Creating SQLite database file..."
    touch /var/www/html/database/database.sqlite
fi

# Set permissions
chmod -R 777 /var/www/html/storage /var/www/html/database /var/www/html/bootstrap/cache /var/www/html/.env || true

# Clear and rebuild caches
php artisan config:clear || true
php artisan route:clear || true
php artisan view:clear || true

# Run database migrations
echo "📦 Running Database Migrations..."
php artisan migrate --force || true

# Generate production caches
echo "⚡ Generating production caches..."
php artisan package:discover --ansi || true
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

echo "✨ Web application ready! Starting Apache web server on port ${PORT_NUM}..."
exec apache2-foreground
