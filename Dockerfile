# ==========================================
# STAGE 1: Build Frontend Assets (React/Vite)
# ==========================================
FROM node:20-alpine AS node-builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ==========================================
# STAGE 2: Production PHP Apache Runtime
# ==========================================
FROM php:8.3-apache

# Install System Dependencies & PHP Extensions
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    libpq-dev \
    libsqlite3-dev \
    zip \
    unzip \
    git \
    curl \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_mysql pdo_pgsql pgsql pdo_sqlite gd zip bcmath opcache \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Enable Apache Performance Modules
RUN a2enmod rewrite deflate expires headers

# Configure High-Performance PHP OPcache
RUN echo "opcache.enable=1\n\
opcache.enable_cli=1\n\
opcache.memory_consumption=128\n\
opcache.interned_strings_buffer=16\n\
opcache.max_accelerated_files=10000\n\
opcache.validate_timestamps=0\n\
opcache.save_comments=1\n\
opcache.fast_shutdown=1" > /usr/local/etc/php/conf.d/opcache-recommended.ini

# Configure Apache VirtualHost with Gzip Compression and Browser Asset Caching
RUN echo '<VirtualHost *:80>\n\
    DocumentRoot /var/www/html/public\n\
    <Directory /var/www/html/public>\n\
        Options -Indexes +FollowSymLinks\n\
        AllowOverride All\n\
        Require all granted\n\
    </Directory>\n\
    \n\
    # Enable Gzip Compression for text, html, javascript, css, xml, json\n\
    <IfModule mod_deflate.c>\n\
        AddOutputFilterByType DEFLATE text/plain text/html text/xml text/css application/xml application/xhtml+xml application/rss+xml application/javascript application/x-javascript application/json image/svg+xml\n\
    </IfModule>\n\
    \n\
    # Aggressive Static Asset Caching\n\
    <IfModule mod_expires.c>\n\
        ExpiresActive On\n\
        ExpiresByType image/jpg "access plus 1 year"\n\
        ExpiresByType image/jpeg "access plus 1 year"\n\
        ExpiresByType image/gif "access plus 1 year"\n\
        ExpiresByType image/png "access plus 1 year"\n\
        ExpiresByType image/svg+xml "access plus 1 year"\n\
        ExpiresByType text/css "access plus 1 year"\n\
        ExpiresByType application/javascript "access plus 1 year"\n\
        ExpiresByType application/x-javascript "access plus 1 year"\n\
        ExpiresByType font/woff2 "access plus 1 year"\n\
    </IfModule>\n\
    \n\
    ErrorLog /dev/stderr\n\
    CustomLog /dev/stdout combined\n\
</VirtualHost>' > /etc/apache2/sites-available/000-default.conf \
    && sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy Project Files
COPY . .

# Copy Built Assets from Stage 1
COPY --from=node-builder /app/public/build ./public/build

# Install PHP Dependencies with Classmap Optimization
RUN composer install --no-dev --optimize-autoloader --classmap-authoritative --no-interaction

# Create and set permissions for storage directories
RUN mkdir -p /var/www/html/storage/framework/sessions \
             /var/www/html/storage/framework/views \
             /var/www/html/storage/framework/cache/data \
             /var/www/html/storage/logs \
             /var/www/html/database \
             /var/www/html/bootstrap/cache \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/database /var/www/html/bootstrap/cache \
    && chmod -R 777 /var/www/html/storage /var/www/html/database /var/www/html/bootstrap/cache

# Copy Entrypoint Script
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENV PORT=80
EXPOSE 80

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
