# ===============================================
# COMANDOS PARA VERIFICAR Y BUILD DE IMAGENES
# ===============================================

# PASO 1: Verificar que Docker funciona
Write-Host "=== VERIFICANDO DOCKER ===" -ForegroundColor Green
docker --version
docker ps

Write-Host ""
Write-Host "=== IMAGENES EXISTENTES ===" -ForegroundColor Green
docker images

Write-Host ""
Write-Host "Si no aparece ninguna imagen, necesitas hacer el BUILD primero" -ForegroundColor Yellow

Write-Host ""
Write-Host "=== CONFIGURAR VARIABLES ===" -ForegroundColor Green
$PROJECT_ID = "ecoresource-connect"
$SERVICE_NAME = "ecoresource-backend"
$IMAGE_NAME = "gcr.io/$PROJECT_ID/$SERVICE_NAME"

Write-Host "Project ID: $PROJECT_ID"
Write-Host "Service Name: $SERVICE_NAME"
Write-Host "Nombre de imagen completo: $IMAGE_NAME"

Write-Host ""
Write-Host "=== SIGUIENTE PASO ===" -ForegroundColor Cyan
Write-Host "Si no tienes la imagen, ejecuta:"
Write-Host "  docker build -t ${IMAGE_NAME}:latest ." -ForegroundColor Yellow
Write-Host ""
Write-Host "Si ya tienes la imagen, ejecuta:"
Write-Host "  docker push ${IMAGE_NAME}:latest" -ForegroundColor Yellow
