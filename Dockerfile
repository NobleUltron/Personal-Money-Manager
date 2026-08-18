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
    zip \
    unzip \
    git \
    curl \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_mysql pdo_pgsql pgsql gd zip bcmath \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Enable Apache ModRewrite
RUN a2enmod rewrite

# Configure Apache DocumentRoot to /var/www/html/public
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/000-default.conf \
    && sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy Project Files
COPY . .

# Copy Built Assets from Stage 1
COPY --from=node-builder /app/public/build ./public/build

# Install PHP Dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Set File Permissions for Storage and Cache
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Copy Entrypoint Script
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENV PORT=80
EXPOSE 80

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
