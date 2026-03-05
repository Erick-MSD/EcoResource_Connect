# ========================================
# CONFIGURAR SERVICE ACCOUNT PARA GITHUB ACTIONS
# ========================================
# Este script crea y configura el service account necesario para CI/CD

# Colores para output
$GREEN = "Green"
$CYAN = "Cyan"
$YELLOW = "Yellow"
$RED = "Red"

Write-Host ""
Write-Host "========================================" -ForegroundColor $CYAN
Write-Host "  CONFIGURAR GITHUB ACTIONS CI/CD" -ForegroundColor $CYAN
Write-Host "========================================" -ForegroundColor $CYAN
Write-Host ""

# ========================================
# 1. Verificar que gcloud está configurado
# ========================================
Write-Host "1️⃣  Verificando configuración de gcloud..." -ForegroundColor $YELLOW

$PROJECT_ID = (gcloud config get-value project 2>$null)
if (-not $PROJECT_ID) {
    Write-Host "❌ Error: No hay proyecto configurado en gcloud" -ForegroundColor $RED
    Write-Host "Ejecuta: gcloud config set project ecoresource-connect" -ForegroundColor $YELLOW
    exit 1
}

Write-Host "✅ Proyecto: $PROJECT_ID" -ForegroundColor $GREEN

# ========================================
# 2. Crear Service Account
# ========================================
Write-Host ""
Write-Host "2️⃣  Creando service account..." -ForegroundColor $YELLOW

$SA_NAME = "github-actions"
$SA_EMAIL = "${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

# Verificar si ya existe
$existingSA = gcloud iam service-accounts list --filter="email:${SA_EMAIL}" --format="value(email)" 2>$null

if ($existingSA) {
    Write-Host "⚠️  Service account ya existe: $SA_EMAIL" -ForegroundColor $YELLOW
} else {
    gcloud iam service-accounts create $SA_NAME `
        --display-name="GitHub Actions Deploy" `
        --description="Service account para CI/CD con GitHub Actions" `
        --project=$PROJECT_ID 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Service account creado: $SA_EMAIL" -ForegroundColor $GREEN
    } else {
        Write-Host "❌ Error al crear service account" -ForegroundColor $RED
        exit 1
    }
}

# ========================================
# 3. Asignar Roles
# ========================================
Write-Host ""
Write-Host "3️⃣  Asignando roles necesarios..." -ForegroundColor $YELLOW

$roles = @(
    "roles/run.admin",           # Para desplegar a Cloud Run
    "roles/storage.admin",       # Para GCR
    "roles/iam.serviceAccountUser"  # Para actuar como service account
)

foreach ($role in $roles) {
    Write-Host "   Asignando $role..." -ForegroundColor $CYAN
    
    gcloud projects add-iam-policy-binding $PROJECT_ID `
        --member="serviceAccount:${SA_EMAIL}" `
        --role=$role `
        --condition=None `
        --quiet 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ $role asignado" -ForegroundColor $GREEN
    } else {
        Write-Host "   ⚠️  Error al asignar $role (puede que ya exista)" -ForegroundColor $YELLOW
    }
}

# ========================================
# 4. Crear JSON Key
# ========================================
Write-Host ""
Write-Host "4️⃣  Generando JSON key..." -ForegroundColor $YELLOW

$KEY_FILE = "github-actions-key.json"

# Eliminar archivo existente si existe
if (Test-Path $KEY_FILE) {
    Remove-Item $KEY_FILE -Force
}

gcloud iam service-accounts keys create $KEY_FILE `
    --iam-account=$SA_EMAIL `
    --project=$PROJECT_ID 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0 -and (Test-Path $KEY_FILE)) {
    Write-Host "✅ JSON key creado: $KEY_FILE" -ForegroundColor $GREEN
} else {
    Write-Host "❌ Error al crear JSON key" -ForegroundColor $RED
    exit 1
}

# ========================================
# 5. Mostrar resumen
# ========================================
Write-Host ""
Write-Host "========================================" -ForegroundColor $GREEN
Write-Host "  ✅ CONFIGURACIÓN COMPLETADA" -ForegroundColor $GREEN
Write-Host "========================================" -ForegroundColor $GREEN
Write-Host ""
Write-Host "📋 RESUMEN:" -ForegroundColor $CYAN
Write-Host "   Project ID: $PROJECT_ID" -ForegroundColor $WHITE
Write-Host "   Service Account: $SA_EMAIL" -ForegroundColor $WHITE
Write-Host "   JSON Key: $KEY_FILE" -ForegroundColor $WHITE
Write-Host ""

# ========================================
# 6. Mostrar contenido del JSON (para copiar)
# ========================================
Write-Host "========================================" -ForegroundColor $CYAN
Write-Host "  📋 SIGUIENTE PASO: GITHUB SECRETS" -ForegroundColor $CYAN
Write-Host "========================================" -ForegroundColor $CYAN
Write-Host ""
Write-Host "Ve a tu repositorio en GitHub:" -ForegroundColor $YELLOW
Write-Host "   Settings → Secrets and variables → Actions → New repository secret" -ForegroundColor $WHITE
Write-Host ""
Write-Host "Crea los siguientes secrets:" -ForegroundColor $YELLOW
Write-Host ""

# ========================================
# GCP_PROJECT_ID
# ========================================
Write-Host "1. GCP_PROJECT_ID" -ForegroundColor $GREEN
Write-Host "   Valor:" -ForegroundColor $CYAN
Write-Host "   $PROJECT_ID" -ForegroundColor $WHITE
Write-Host ""

# ========================================
# GCP_SA_KEY
# ========================================
Write-Host "2. GCP_SA_KEY" -ForegroundColor $GREEN
Write-Host "   Valor: (TODO el contenido del JSON a continuación)" -ForegroundColor $CYAN
Write-Host ""
Write-Host "----------------------------------------" -ForegroundColor $YELLOW
Get-Content $KEY_FILE | Out-String | Write-Host -ForegroundColor $WHITE
Write-Host "----------------------------------------" -ForegroundColor $YELLOW
Write-Host ""

# ========================================
# Otros secrets necesarios
# ========================================
Write-Host "3. MONGODB_URI" -ForegroundColor $GREEN
Write-Host "   Valor: mongodb+srv://ecoresource_admin:Ec0R3s0urc3_2026%21SecureDB@ecoresource-cluster.olny8dm.mongodb.net/ecoresource_db..." -ForegroundColor $WHITE
Write-Host ""

Write-Host "4. JWT_SECRET" -ForegroundColor $GREEN
Write-Host "   Valor: 553c6070a385d8dc46efbf9ae91a2d64149f8eaf0cc2bb8b1c803ed5f90ca102" -ForegroundColor $WHITE
Write-Host ""

Write-Host "5. JWT_REFRESH_SECRET" -ForegroundColor $GREEN
Write-Host "   Valor: a5acbef91e89909c2d51cb82d69f2c069957cac880ed4c9c2e6a1b7a5450d16c" -ForegroundColor $WHITE
Write-Host ""

# ========================================
# Advertencia de seguridad
# ========================================
Write-Host "========================================" -ForegroundColor $RED
Write-Host "  ⚠️  ADVERTENCIA DE SEGURIDAD" -ForegroundColor $RED
Write-Host "========================================" -ForegroundColor $RED
Write-Host ""
Write-Host "El archivo $KEY_FILE contiene credenciales sensibles." -ForegroundColor $YELLOW
Write-Host ""
Write-Host "Después de copiarlo a GitHub Secrets:" -ForegroundColor $YELLOW
Write-Host "   1. ELIMINA el archivo local inmediatamente" -ForegroundColor $RED
Write-Host "   2. NO lo subas a Git" -ForegroundColor $RED
Write-Host "   3. NO lo compartas con nadie" -ForegroundColor $RED
Write-Host ""
Write-Host "Para eliminar el archivo ahora:" -ForegroundColor $CYAN
Write-Host "   Remove-Item $KEY_FILE -Force" -ForegroundColor $WHITE
Write-Host ""

# ========================================
# Copiar al portapapeles (opcional)
# ========================================
Write-Host "========================================" -ForegroundColor $CYAN
Write-Host "  📋 COPIAR AL PORTAPAPELES" -ForegroundColor $CYAN
Write-Host "========================================" -ForegroundColor $CYAN
Write-Host ""

$response = Read-Host "¿Copiar JSON key al portapapeles? (s/n)"
if ($response -eq "s" -or $response -eq "S") {
    Get-Content $KEY_FILE | Set-Clipboard
    Write-Host "✅ JSON copiado al portapapeles" -ForegroundColor $GREEN
    Write-Host "   Ahora ve a GitHub y pégalo como secret GCP_SA_KEY" -ForegroundColor $YELLOW
} else {
    Write-Host "⏭️  JSON no copiado. Puedes copiarlo manualmente desde $KEY_FILE" -ForegroundColor $YELLOW
}

Write-Host ""
Write-Host "========================================" -ForegroundColor $GREEN
Write-Host "  🎉 LISTO PARA CI/CD" -ForegroundColor $GREEN
Write-Host "========================================" -ForegroundColor $GREEN
Write-Host ""
Write-Host "Siguiente paso:" -ForegroundColor $CYAN
Write-Host "   git add ." -ForegroundColor $WHITE
Write-Host "   git commit -m 'feat: configure CI/CD workflows'" -ForegroundColor $WHITE
Write-Host "   git push origin main" -ForegroundColor $WHITE
Write-Host ""
Write-Host "El workflow se ejecutará automáticamente 🚀" -ForegroundColor $GREEN
Write-Host ""
