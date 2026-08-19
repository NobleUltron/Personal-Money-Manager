<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <title inertia>{{ config('app.name', 'Personal Money Manager') }}</title>
    
    <!-- Modern SVG Favicon -->
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%236366f1'/%3E%3Cstop offset='100%25' stop-color='%23a855f7'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100' height='100' rx='28' fill='url(%23g)'/%3E%3Cpath d='M26 36h48c4.4 0 8 3.6 8 8v24c0 4.4-3.6 8-8 8H26c-4.4 0-8-3.6-8-8V44c0-4.4 3.6-8 8-8z' fill='none' stroke='white' stroke-width='6' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M18 48h64' stroke='white' stroke-width='5' stroke-linecap='round'/%3E%3Ccircle cx='62' cy='58' r='5' fill='white'/%3E%3C/svg%3E">
    <link rel="apple-touch-icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%236366f1'/%3E%3Cstop offset='100%25' stop-color='%23a855f7'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100' height='100' rx='28' fill='url(%23g)'/%3E%3Cpath d='M26 36h48c4.4 0 8 3.6 8 8v24c0 4.4-3.6 8-8 8H26c-4.4 0-8-3.6-8-8V44c0-4.4 3.6-8 8-8z' fill='none' stroke='white' stroke-width='6' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M18 48h64' stroke='white' stroke-width='5' stroke-linecap='round'/%3E%3Ccircle cx='62' cy='58' r='5' fill='white'/%3E%3C/svg%3E">

    <!-- PWA Web App Meta Tags -->
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#6366f1">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="MoneyManager">

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    
    @viteReactRefresh
    @vite(['resources/js/app.jsx'])
    @inertiaHead
  </head>
  <body class="font-sans antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 h-full selection:bg-indigo-500 selection:text-white">
    @inertia

    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
          navigator.serviceWorker.register('/sw.js').catch(function(err) {
            console.log('ServiceWorker registration failed: ', err);
          });
        });
      }
    </script>
  </body>
</html>
