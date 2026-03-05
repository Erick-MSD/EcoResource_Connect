# Script para verificar y esperar a que Docker esté listo
# Uso: .\check-docker.ps1

Write-Host "🔍 Verificando Docker Desktop..." -ForegroundColor Cyan

# Intentar conectar a Docker hasta 30 veces (2 minutos)
$maxAttempts = 30
$attempt = 0
$dockerReady = $false

while ($attempt -lt $maxAttempts -and -not $dockerReady) {
    $attempt++
    Write-Host "Intento $attempt de $maxAttempts..." -ForegroundColor Yellow
    
    try {
        $null = docker ps 2>&1
        if ($LASTEXITCODE -eq 0) {
            $dockerReady = $true
            Write-Host "✅ Docker Desktop está corriendo!" -ForegroundColor Green
        }
    } catch {
        # Docker aún no está listo
    }
    
    if (-not $dockerReady) {
        Start-Sleep -Seconds 4
    }
}

if (-not $dockerReady) {
    Write-Host "❌ Docker Desktop no se inició después de 2 minutos" -ForegroundColor Red
    Write-Host "   Por favor verifica que Docker Desktop esté instalado y ejecutándose" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Listando imágenes Docker existentes..." -ForegroundColor Cyan
docker images

Write-Host ""
Write-Host "🐳 Contenedores corriendo:" -ForegroundColor Cyan
docker ps

Write-Host ""
Write-Host "✅ Docker está listo para usar" -ForegroundColor Green
