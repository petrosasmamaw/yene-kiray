Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\For you\.gemini\antigravity-ide\brain\59e81675-dbea-4e8a-bb29-666d55cce90e\.user_uploaded\media_1791975219972.jpg"
$outDir = "c:\Users\For you\OneDrive\Desktop\folders\website\Client_PROJECTS1\yene-kiray\frontend\public"

$orig = [System.Drawing.Bitmap]::FromFile($srcPath)

# 1. Full square crop (960x960)
$cropX = 32
$cropY = 50
$cropSize = 960

$croppedSquare = New-Object System.Drawing.Bitmap($cropSize, $cropSize)
$g1 = [System.Drawing.Graphics]::FromImage($croppedSquare)
$g1.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g1.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g1.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$srcRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropSize, $cropSize)
$destRect = New-Object System.Drawing.Rectangle(0, 0, $cropSize, $cropSize)
$g1.DrawImage($orig, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
$g1.Dispose()

$croppedSquare.Save("$outDir\logo.png", [System.Drawing.Imaging.ImageFormat]::Png)
$croppedSquare.Save("$outDir\logo-square.png", [System.Drawing.Imaging.ImageFormat]::Png)

# 2. Tight Emblem Crop (focusing on the glyphs and lightning, no floor reflection)
# minX = 40, minY = 100, width = 880, height = 700
$tightW = 880
$tightH = 720
$emblemBmp = New-Object System.Drawing.Bitmap($tightW, $tightH)
$gEmblem = [System.Drawing.Graphics]::FromImage($emblemBmp)
$gEmblem.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gEmblem.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gEmblem.DrawImage($orig, (New-Object System.Drawing.Rectangle(0, 0, $tightW, $tightH)), (New-Object System.Drawing.Rectangle(40, 100, $tightW, $tightH)), [System.Drawing.GraphicsUnit]::Pixel)
$gEmblem.Dispose()
$emblemBmp.Save("$outDir\logo-emblem.png", [System.Drawing.Imaging.ImageFormat]::Png)

# 3. Transparent Emblem (Tight crop, transparent background)
$tightTrans = New-Object System.Drawing.Bitmap($tightW, $tightH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
for ($y = 0; $y -lt $tightH; $y++) {
    for ($x = 0; $x -lt $tightW; $x++) {
        $c = $emblemBmp.GetPixel($x, $y)
        $maxVal = [Math]::Max($c.R, [Math]::Max($c.G, $c.B))
        if ($maxVal -le 10) {
            $tightTrans.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        } else {
            $alpha = [Math]::Min(255, [int]([Math]::Pow($maxVal / 255.0, 0.70) * 255))
            $r = [Math]::Min(255, [int]($c.R * 255 / [Math]::Max(1, $alpha)))
            $g = [Math]::Min(255, [int]($c.G * 255 / [Math]::Max(1, $alpha)))
            $b = [Math]::Min(255, [int]($c.B * 255 / [Math]::Max(1, $alpha)))
            $tightTrans.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $r, $g, $b))
        }
    }
}
$tightTrans.Save("$outDir\logo-emblem-transparent.png", [System.Drawing.Imaging.ImageFormat]::Png)

# 4. Premium Rounded Badge (Squircle with dark obsidian bg and gold glowing rim)
$badgeSize = 512
$badgeBmp = New-Object System.Drawing.Bitmap($badgeSize, $badgeSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gBadge = [System.Drawing.Graphics]::FromImage($badgeBmp)
$gBadge.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gBadge.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gBadge.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$radius = 120
$d = $radius * 2
$inset = 8
$rectW = $badgeSize - ($inset * 2)
$rectH = $badgeSize - ($inset * 2)

$path.AddArc($inset, $inset, $d, $d, 180, 90)
$path.AddArc($inset + $rectW - $d, $inset, $d, $d, 270, 90)
$path.AddArc($inset + $rectW - $d, $inset + $rectH - $d, $d, $d, 0, 90)
$path.AddArc($inset, $inset + $rectH - $d, $d, $d, 90, 90)
$path.CloseFigure()

# Background fill
$brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 10, 10, 12))
$gBadge.FillPath($brush, $path)
$brush.Dispose()

# Draw cropped logo inside
$gBadge.SetClip($path)
$gBadge.DrawImage($croppedSquare, 0, 0, $badgeSize, $badgeSize)
$gBadge.ResetClip()

# Glowing border
$pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(220, 245, 158, 11), 6)
$gBadge.DrawPath($pen, $path)
$pen.Dispose()

$badgeBmp.Save("$outDir\logo-badge.png", [System.Drawing.Imaging.ImageFormat]::Png)

# 5. Favicon (Crisp 64x64)
$favBmp = New-Object System.Drawing.Bitmap(64, 64)
$gFav = [System.Drawing.Graphics]::FromImage($favBmp)
$gFav.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gFav.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gFav.DrawImage($badgeBmp, 0, 0, 64, 64)
$gFav.Dispose()
$favBmp.Save("$outDir\favicon.png", [System.Drawing.Imaging.ImageFormat]::Png)

# Also copy favicon to root if needed
$favBmp.Save("$outDir\favicon.ico", [System.Drawing.Imaging.ImageFormat]::Png)

$orig.Dispose()
$croppedSquare.Dispose()
$emblemBmp.Dispose()
$tightTrans.Dispose()
$badgeBmp.Dispose()
$favBmp.Dispose()

Write-Host "All assets generated successfully!"
