<?php

$dir = __DIR__ . '/../public/icons';
if (!is_dir($dir)) {
    mkdir($dir, 0777, true);
}

// 1. Generate SVG Icon
$svgContent = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4f46e5"/>
      <stop offset="50%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#9333ea"/>
    </linearGradient>
    <linearGradient id="coinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#312e81" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Background Squircle -->
  <rect width="512" height="512" rx="128" fill="url(#bgGrad)"/>
  
  <!-- Subtle Inner Glow Border -->
  <rect x="8" y="8" width="496" height="496" rx="120" fill="none" stroke="white" stroke-width="4" stroke-opacity="0.2"/>

  <!-- Main Wallet Body -->
  <g filter="url(#shadow)">
    <!-- Wallet Back -->
    <rect x="116" y="160" width="280" height="192" rx="36" fill="white" fill-opacity="0.95"/>
    
    <!-- Wallet Flap / Detail -->
    <path d="M116 200h280" stroke="#e0e7ff" stroke-width="8" stroke-linecap="round"/>
    
    <!-- Wallet Card / Note Peek -->
    <rect x="148" y="128" width="160" height="48" rx="14" fill="#a5b4fc" fill-opacity="0.8"/>
    <rect x="168" y="144" width="80" height="10" rx="5" fill="white" fill-opacity="0.9"/>
    
    <!-- Wallet Clasp Pocket -->
    <rect x="296" y="224" width="116" height="64" rx="20" fill="url(#bgGrad)"/>
    <circle cx="372" cy="256" r="14" fill="url(#coinGrad)"/>
    <circle cx="372" cy="256" r="8" fill="white" fill-opacity="0.6"/>
  </g>
</svg>
SVG;

file_put_contents(__DIR__ . '/../public/icons/icon.svg', $svgContent);

function createPngIcon($size, $filename) {
    $img = imagecreatetruecolor($size, $size);
    imagealphablending($img, false);
    imagesavealpha($img, true);

    $transparent = imagecolorallocatealpha($img, 0, 0, 0, 127);
    imagefill($img, 0, 0, $transparent);
    imagealphablending($img, true);

    // Draw background rounded rectangle
    $radius = (int)($size * 0.25);
    
    // Gradient simulation
    for ($y = 0; $y < $size; $y++) {
        $factor = $y / $size;
        $r = (int)(79 + (147 - 79) * $factor);
        $g = (int)(70 + (51 - 70) * $factor);
        $b = (int)(229 + (234 - 229) * $factor);
        $color = imagecolorallocate($img, $r, $g, $b);

        // Draw line with rounded corners
        $minX = 0;
        $maxX = $size - 1;

        if ($y < $radius) {
            $dy = $radius - $y;
            $dx = (int)($radius - sqrt($radius * $radius - $dy * $dy));
            $minX = $dx;
            $maxX = $size - 1 - $dx;
        } elseif ($y > $size - 1 - $radius) {
            $dy = $y - ($size - 1 - $radius);
            $dx = (int)($radius - sqrt($radius * $radius - $dy * $dy));
            $minX = $dx;
            $maxX = $size - 1 - $dx;
        }

        if ($minX <= $maxX) {
            imageline($img, $minX, $y, $maxX, $y, $color);
        }
    }

    // Draw Wallet shape
    $wX = (int)($size * 0.22);
    $wY = (int)($size * 0.31);
    $wW = (int)($size * 0.56);
    $wH = (int)($size * 0.38);
    $wR = (int)($size * 0.07);

    $white = imagecolorallocate($img, 255, 255, 255);
    $lightIndigo = imagecolorallocate($img, 199, 210, 254);
    $gold = imagecolorallocate($img, 245, 158, 11);
    $deepIndigo = imagecolorallocate($img, 99, 102, 241);

    // Inner card peek
    imagefilledrectangle($img, (int)($size * 0.28), (int)($size * 0.24), (int)($size * 0.60), (int)($size * 0.33), $lightIndigo);

    // Wallet body
    imagefilledrectangle($img, $wX, $wY, $wX + $wW, $wY + $wH, $white);

    // Flap shadow line
    imagesetthickness($img, max(2, (int)($size * 0.015)));
    imageline($img, $wX, (int)($size * 0.40), $wX + $wW, (int)($size * 0.40), $lightIndigo);

    // Clasp pocket
    $claspX = (int)($size * 0.58);
    $claspY = (int)($size * 0.44);
    $claspW = (int)($size * 0.22);
    $claspH = (int)($size * 0.13);
    imagefilledrectangle($img, $claspX, $claspY, $claspX + $claspW, $claspY + $claspH, $deepIndigo);

    // Gold coin lock
    $coinX = (int)($size * 0.72);
    $coinY = (int)($size * 0.505);
    $coinR = max(3, (int)($size * 0.03));
    imagefilledellipse($img, $coinX, $coinY, $coinR * 2, $coinR * 2, $gold);
    imagefilledellipse($img, $coinX, $coinY, (int)($coinR * 1.1), (int)($coinR * 1.1), $white);

    imagepng($img, $filename);
    imagedestroy($img);
}

// Generate all sizes
createPngIcon(512, __DIR__ . '/../public/icons/icon-512x512.png');
createPngIcon(192, __DIR__ . '/../public/icons/icon-192x192.png');
createPngIcon(180, __DIR__ . '/../public/apple-touch-icon.png');
createPngIcon(180, __DIR__ . '/../public/icons/apple-touch-icon.png');
createPngIcon(64, __DIR__ . '/../public/favicon-64x64.png');
createPngIcon(32, __DIR__ . '/../public/favicon-32x32.png');

echo "Icons generated successfully!\n";
