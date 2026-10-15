param(
    [string]$DestinationZip = "Yene_Kiray_Source_Code.zip"
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "📦 Creating Yene Kiray Source Code Zip Archive..." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$rootPath = (Get-Item -Path ".").FullName
$zipFullPath = Join-Path $rootPath $DestinationZip

if (Test-Path $zipFullPath) {
    Write-Host "Removing existing $DestinationZip..." -ForegroundColor Yellow
    Remove-Item $zipFullPath -Force
}

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$zipStream = [System.IO.File]::Open($zipFullPath, [System.IO.FileMode]::Create)
$archive = New-Object System.IO.Compression.ZipArchive($zipStream, [System.IO.Compression.ZipArchiveMode]::Create)

# Folders and root files to include
$foldersToInclude = @("frontend", "server", "scripts")
$filesToInclude = @("workflow.md", "Yene_Kiray_Project_Workflow.docx", "README.md", ".gitignore")

$fileCount = 0

# 1. Add specified root files
foreach ($fileName in $filesToInclude) {
    $filePath = Join-Path $rootPath $fileName
    if (Test-Path $filePath) {
        $entryName = "yene-kiray/$fileName"
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $filePath, $entryName, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
        $fileCount++
        Write-Host "  + Added root file: $entryName" -ForegroundColor Green
    }
}

# 2. Add folders while strictly excluding node_modules, .git, and build artifacts
foreach ($folder in $foldersToInclude) {
    $folderPath = Join-Path $rootPath $folder
    if (-not (Test-Path $folderPath)) { continue }

    Write-Host "`nScanning and packaging folder: $folder/ [excluding node_modules]..." -ForegroundColor Yellow

    $allFiles = Get-ChildItem -Path $folderPath -Recurse -File -Force

    foreach ($file in $allFiles) {
        $relPath = $file.FullName.Substring($rootPath.Length + 1).Replace("\", "/")

        # Exclude node_modules, .git, .gemini, etc.
        if ($relPath -match "node_modules" -or $relPath -match "\.git\b" -or $relPath -match "dist/") {
            continue
        }

        $entryName = "yene-kiray/$relPath"
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $file.FullName, $entryName, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
        $fileCount++
    }
}

$archive.Dispose()
$zipStream.Dispose()

$zipItem = Get-Item $zipFullPath
$sizeMB = [math]::Round($zipItem.Length / 1MB, 2)

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "🎉 SUCCESS! Archive created successfully." -ForegroundColor Green
Write-Host "📁 File Name:     $DestinationZip" -ForegroundColor Cyan
Write-Host "📍 Full Path:     $zipFullPath" -ForegroundColor Cyan
Write-Host "📊 Total Files:   $fileCount files included" -ForegroundColor White
Write-Host "⚖️ Archive Size:  $sizeMB MB (Clean source code, zero node_modules)" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Green
