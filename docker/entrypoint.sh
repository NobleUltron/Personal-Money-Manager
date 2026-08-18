#!/bin/bash
set -e

echo "🚀 Starting Personal Money Manager Application..."

# Remove stale host cached files from bootstrap/cache
echo "🧹 Clearing stale cache files..."
rm -f /var/www/html/bootstrap/cache/*.php || true

# Dynamic Apache Port Binding
PORT_NUM="${PORT:-80}"
echo "Configuring Apache to listen on port ${PORT_NUM}..."
sed -i "s/Listen [0-9]*/Listen ${PORT_NUM}/g" /etc/apache2/ports.conf || true
sed -i "s/<VirtualHost \*:[0-9]*>/<VirtualHost *:${PORT_NUM}>/g" /etc/apache2/sites-available/000-default.conf || true

# Ensure production .env file exists and is populated
if [ ! -f /var/www/html/.env ]; then
    echo "Creating production .env file..."
    cat <<EOF > /var/www/html/.env
APP_NAME="Personal Money Manager"
APP_ENV=production
APP_KEY="${APP_KEY:-base64:+9xomeROcyZIS8VhBeUHdRBCoaLMTdHKx7HQu1vM1bc=}"
APP_DEBUG=false
APP_URL="${APP_URL:-https://personal-money-manager.onrender.com}"
LOG_CHANNEL=stderr
DB_CONNECTION=sqlite
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
fi

# Ensure database directory and SQLite file exist
mkdir -p /var/www/html/database
if [ ! -f /var/www/html/database/database.sqlite ]; then
    echo "Creating SQLite database file..."
    touch /var/www/html/database/database.sqlite
fi
chmod -R 777 /var/www/html/database /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/.env || true

# Run database migrations
echo "📦 Running Database Migrations..."
php artisan migrate --force || true

# Package discovery and fresh cache generation
echo "⚡ Generating fresh production caches..."
php artisan package:discover --ansi || true
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

echo "✨ Web application ready! Starting Apache web server on port ${PORT_NUM}..."
exec apache2-foreground
