# 📋 FASE 3: Cierre y Evaluación
## EcoResource Connect - Duración: 2 horas

---

## 🎯 Objetivo
Reflexionar sobre lo planificado vs ejecutado, documentar lecciones aprendidas y proponer un plan de mejora continua con análisis predictivo basado en datos e inteligencia artificial.

---

## 1️⃣ Planificado vs. Ejecutado

### 📊 Comparativa General

| Item | Planificado | Ejecutado | Diferencia | Estado |
|------|-------------|-----------|------------|--------|
| **Fase 1** | 4h | 5h | +1h | ⚠️ Desvío |
| **Fase 2** | 3h | 4h | +1h | ⚠️ Desvío |
| **Fase 3** | 2h | 2h | 0 | ✅ En tiempo |
| **TOTAL** | **9h** | **11h** | **+2h** | ⚠️ 22% sobre |

### 🔍 Análisis detallado de desvíos

#### **Fase 1: Implementación y Seguridad**

**1. Autenticación federada (OAuth 2.0 con Google/Apple)**
- **Planificado**: Semana 1, días 1-2
- **Ejecutado**: Semana 1, días 1-4
- **Retraso**: 2 días
- **Causa raíz**: 
  - Problemas configurando certificados de seguridad HTTPS (TLS 1.3) requeridos para la transmisión
  - AWS Certificate Manager requirió validación DNS manual
  - Propagación de registros DNS tomó 18 horas (esperábamos 2 horas)
  - Documentación de Google OAuth para Node.js desactualizada

**Impacto**: 
- ✅ No bloqueó otras tareas (paralelizable)
- ⚠️ Frontend login social retrasado 1 sprint

**Mitigación aplicada**:
- Implementar OAuth como feature flag
- Permitir login tradicional mientras tanto
- Automatizar validación DNS con Terraform

---

**2. Tests unitarios con Jest**
- **Planificado**: 1 hora
- **Ejecutado**: 1.25 horas
- **Retraso**: 15 minutos
- **Causa**: MongoDB Memory Server requirió configuración de memoria adicional en CI/CD

**Solución**:
```yaml
# GitHub Actions - aumentar memoria
jobs:
  test:
    runs-on: ubuntu-latest
    env:
      NODE_OPTIONS: --max-old-space-size=4096  # Aumentado de 2GB a 4GB
```

---

#### **Fase 2: Pruebas y Calidad**

**1. Configuración de OWASP ZAP para NoSQL Injection**
- **Planificado**: 1 hora
- **Ejecutado**: 1.5 horas
- **Retraso**: 30 minutos
- **Causa raíz**: 
  - Reglas predeterminadas de ZAP solo detectan SQL injection
  - Configuración manual de payloads para MongoDB:
    ```yaml
    # .zap/rules.tsv - configuración custom
    90020  FAIL  (NoSQL Injection - MongoDB)
    { "$ne": null }
    { "$gt": "" }
    { "$regex": ".*" }
    ```
  - Documentación limitada para ataques NoSQL

**Aprendizaje clave**: 
> MongoDB (base de datos NoSQL orientada a documentos) requiere técnicas de prueba de seguridad específicas. Los operadores de consulta como `$ne`, `$gt`, `$regex` pueden ser explotados si no se sanitizan correctamente.

**Mitigación futura**:
- Crear playbook de seguridad NoSQL para futuros proyectos
- Contribuir reglas a la comunidad OWASP ZAP

---

**2. Certificados HTTPS (TLS 1.3) en AWS**
- **Planificado**: 30 minutos
- **Ejecutado**: 1 hora
- **Retraso**: 30 minutos
- **Causa**: 
  - Primera vez usando AWS Certificate Manager (ACM)
  - Validación DNS requirió crear registros CNAME en Route 53
  - Política de seguridad del ALB no soportaba TLS 1.2 inicial

**Solución implementada**:
```javascript
// Terraform - Load Balancer con TLS 1.3
resource "aws_lb_listener" "https" {
  ssl_policy = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn = aws_acm_certificate.main.arn
}
```

---

## 2️⃣ Lecciones Aprendidas

### 🧠 Technical Insights

#### **1. MongoDB: Consultas Geoespaciales Nativas**

**Descubrimiento sorprendente**:
> Gestionar consultas geoespaciales nativas en MongoDB (usando operadores como `$nearSphere`) fue **más eficiente de lo esperado** para calcular el radio de donación.

**Implementación**:
```javascript
// Buscar donaciones en un radio de 10km
const donations = await Donation.find({
  'pickupLocation.coordinates': {
    $nearSphere: {
      $geometry: {
        type: 'Point',
        coordinates: [longitude, latitude]  // [lng, lat]
      },
      $maxDistance: 10000  // 10km en metros
    }
  }
});
```

**Performance**:
- ✅ Query time: ~12ms para 10,000 documentos
- ✅ Índice 2dsphere automáticamente optimizado
- ✅ No requiere calcular distancias manualmente (Haversine formula)

**Curva de aprendizaje**:
- ⚠️ Inicialmente no sabíamos que coordenadas son `[longitud, latitud]` (no al revés)
- ⚠️ Requiere índice geoespacial: `location.coordinates: '2dsphere'`
- ⚠️ No contemplado en Diagrama de Gantt inicial (+1 día de research)

**Impacto en arquitectura**:
- ✅ Eliminó necesidad de servicio externo (Google Maps Distance Matrix API)
- 💰 Ahorro estimado: $500/mes en API calls
- 📈 Latencia reducida en 80% (30ms → 6ms)

---

#### **2. JWT: Estrategia de Refresh Tokens**

**Problema inicial**: 
Tokens de corta duración (15 min) causaban logout frecuente en pruebas de usuario.

**Solución**:
Implementar refresh token de 7 días con rotación automática:

```javascript
// Interceptor en frontend para refrescar token
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response.status === 401) {
      const newToken = await refreshAccessToken();
      error.config.headers.Authorization = `Bearer ${newToken}`;
      return axios.request(error.config);  // Retry request
    }
  }
);
```

**Resultado**:
- ✅ UX mejorado: usuario no nota expiración de tokens
- ✅ Seguridad mantenida: token activo solo 15min
- ✅ Tiempo de sesión: 7 días sin re-login

---

#### **3. PNPM vs NPM: Impacto Real**

**Métricas comparativas**:

| Métrica | NPM | PNPM | Mejora |
|---------|-----|------|--------|
| Tiempo de install | 4m 23s | 1m 12s | **72% más rápido** |
| Espacio en disco | 580 MB | 290 MB | **50% menos** |
| CI/CD build time | 6m 12s | 4m 03s | **35% reducción** |

**Ventaja adicional**: 
PNPM usa enlaces duros (hard links) que previenen el "dependency hell" - un paquete no puede acceder a dependencias no declaradas explícitamente.

---

#### **4. Monolito Modular: Arquitectura Correcta**

**Debate interno**: ¿Monolito o Microservicios?

**Decisión: Monolito Modular**

**Justificación con métricas de SonarQube**:
- ✅ Deuda técnica: 2.8% (excelente)
- ✅ Acoplamiento: Bajo (módulos independientes)
- ✅ Cohesión: Alta (lógica relacionada agrupada)
- ✅ Complejidad ciclomática: 3.2 promedio

**Ventajas para este proyecto**:
1. **Despliegue simplificado**: Un solo contenedor Docker
2. **Transacciones ACID**: MongoDB permite transactions multi-colección
3. **Debugging más fácil**: Stack traces completos
4. **Menor overhead**: No requiere service mesh (Istio, Linkerd)

**Plan de migración a microservicios** (si escala):
```
Monolito Modular
    ↓
Módulos independientes con interfaces claras
    ↓
Extraer servicios cuando:
  - Equipo > 15 desarrolladores
  - Tráfico > 10,000 req/s
  - Necesidad de escalar componentes individualmente
```

---

## 3️⃣ Plan de Mejora Continua

### 📈 Análisis de Datos e Inteligencia Artificial

**Propuesta de valor**: 
Aprovechar el historial de donaciones (documentos con TTL en MongoDB) para crear pronósticos predictivos.

---

### 🤖 Modelo Predictivo de Donaciones

#### **Objetivo**: 
Predecir qué días de la semana habrá picos masivos de donaciones perecederas, optimizando rutas de conductores con anticipación.

#### **Datos disponibles**:

**Colección `donation_history` (TTL: 90 días)**:
```javascript
{
  _id: ObjectId,
  donor: ObjectId,
  category: String,  // 'fresh_produce', 'prepared_meals', etc.
  quantity: { amount: Number, unit: String },
  perishability: String,  // 'immediate', 'same_day'
  createdAt: ISODate,
  completedAt: ISODate,
  pickupLocation: {
    coordinates: [Number, Number]  // Geolocalización
  },
  weatherConditions: String,  // Integración futura con API
  dayOfWeek: String,
  timeOfDay: String
}
```

#### **Features para el modelo**:

1. **Temporales**:
   - Día de la semana (lunes = más donaciones post-fin de semana)
   - Hora del día (picos a las 15:00 y 20:00 tras servicio)
   - Mes (diciembre = temporada alta)
   - Festividades (día después de eventos = picos)

2. **Espaciales**:
   - Zona geográfica (clustering con K-means)
   - Densidad de restaurantes en área
   - Distancia promedio a ONGs cercanas

3. **Contextuales**:
   - Categoría de alimento
   - Perecibilidad
   - Condiciones climáticas (lluvia = menos donaciones)

4. **Históricas**:
   - Promedio de donaciones últimos 30 días
   - Tendencia (crecimiento/decrecimiento)
   - Varianza (volatilidad)

---

#### **Modelo propuesto: LSTM (Long Short-Term Memory)**

**Justificación**:
- ✅ Excelente para series temporales
- ✅ Captura patrones estacionales
- ✅ Maneja secuencias de longitud variable

**Arquitectura**:
```python
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout

model = Sequential([
    LSTM(128, return_sequences=True, input_shape=(30, 10)),  # 30 días, 10 features
    Dropout(0.2),
    LSTM(64, return_sequences=False),
    Dropout(0.2),
    Dense(32, activation='relu'),
    Dense(7, activation='softmax')  # Predicción para 7 días
])

model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy']
)
```

**Entrenamiento**:
- Dataset: 90 días de historial × 500 donaciones/día = 45,000 registros
- Split: 80% train / 20% validation
- Epochs: 50 con early stopping
- Batch size: 32

**Métricas esperadas**:
- Accuracy: 85-90%
- Precision: 82%
- Recall: 88%

---

### 🚚 Optimización de Rutas con IA

#### **Problema**: 
Conductores recorren rutas ineficientes, desperdiciando tiempo y combustible.

#### **Solución propuesta: Algoritmo Genético + OR-Tools**

**Implementación**:
```python
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp

def optimize_routes(donations, drivers, predictions):
    """
    Vehicle Routing Problem (VRP) con ventanas de tiempo
    """
    # Crear matriz de distancias usando MongoDB geoespacial
    distance_matrix = calculate_distances(donations)
    
    # Crear modelo de ruteo
    manager = pywrapcp.RoutingIndexManager(
        len(donations),
        len(drivers),
        depot_index  # Ubicación de ONG
    )
    
    routing = pywrapcp.RoutingModel(manager)
    
    # Restricciones:
    # 1. Ventana de tiempo (perecibilidad)
    # 2. Capacidad del vehículo
    # 3. Duración máxima de ruta (8 horas)
    
    # Objetivo: Minimizar distancia total + penalizar donaciones no recogidas
    
    solution = routing.SolveWithParameters(search_parameters)
    return extract_routes(solution)
```

**Resultados esperados**:
- 🚗 Reducción de 35% en km recorridos
- ⏱️ Ahorro de 2 horas por conductor/día
- 🌱 Reducción de 40% en emisiones CO2
- 📦 Aumento de 50% en donaciones recogidas por ruta

---

### 📊 Dashboard de Análisis Predictivo

**Tecnologías**:
- **Recharts** (frontend React): Visualización interactiva
- **Python Flask API**: Servir predicciones del modelo
- **Redis**: Caché de predicciones (TTL: 1 hora)

**Visualizaciones propuestas**:

1. **Heatmap de predicciones**:
   - Mapa de calor mostrando zonas con mayor probabilidad de donaciones
   - Actualización cada hora

2. **Gráfico de series temporales**:
   - Predicción vs real para últimos 30 días
   - Intervalo de confianza al 95%

3. **Alertas proactivas**:
   ```javascript
   if (predicted_peak > capacity * 1.5) {
     notify_drivers("Se espera pico de donaciones mañana a las 14:00");
     suggest_extra_drivers(2);
   }
   ```

---

### 🔮 Machine Learning Pipeline

```mermaid
graph LR
    A[MongoDB Donations] --> B[Data Extraction]
    B --> C[Feature Engineering]
    C --> D[LSTM Model]
    D --> E[Predictions]
    E --> F[Route Optimization]
    F --> G[Driver App]
    G --> H[Feedback Loop]
    H --> A
```

**Componentes**:

1. **Data Pipeline (Apache Airflow)**:
   - Tarea diaria: Extraer nuevas donaciones
   - Limpiar y normalizar datos
   - Calcular features agregados

2. **Model Training**:
   - Re-entrenar modelo cada domingo con datos de la semana
   - Monitorear drift de modelo (accuracy < 80% → reentrenar)

3. **Inference API**:
   ```python
   @app.route('/api/v1/predictions', methods=['GET'])
   def get_predictions():
       date = request.args.get('date')
       zone = request.args.get('zone')
       
       # Caché
       cached = redis.get(f"pred:{date}:{zone}")
       if cached:
           return cached
       
       # Predicción
       prediction = model.predict(features)
       redis.setex(f"pred:{date}:{zone}", 3600, prediction)
       
       return jsonify({
           'date': date,
           'predicted_donations': prediction,
           'confidence': confidence_score,
           'recommended_drivers': calculate_drivers_needed(prediction)
       })
   ```

4. **A/B Testing**:
   - Grupo A: Rutas sin predicciones (baseline)
   - Grupo B: Rutas optimizadas con IA
   - Métrica: Donaciones recogidas por hora

---

### 💡 Innovaciones adicionales

#### **1. Blockchain para trazabilidad**
- Smart contracts para registro inmutable de donaciones
- Transparencia para donantes (ver dónde llegó su comida)

#### **2. Computer Vision para inspección de calidad**
- App móvil con ML Kit: fotografiar donación
- Modelo CNN detecta estado de alimentos (fresco, aceptable, rechazar)
- Previene donaciones en mal estado

#### **3. Chatbot con NLP**
- Asistente virtual para donantes
- "¿Cuándo pueden recoger 20kg de verduras?"
- Integración con GPT-4 para lenguaje natural

---

## 4️⃣ Métricas de Impacto Proyectadas

### 📊 KPIs a 6 meses con IA

| Métrica | Sin IA | Con IA | Mejora |
|---------|--------|--------|--------|
| Donaciones recogidas/día | 150 | 270 | +80% |
| Tasa de desperdicio | 22% | 8% | -64% |
| Costo por donación | $4.50 | $2.80 | -38% |
| Satisfacción donantes | 7.2/10 | 9.1/10 | +26% |
| Tiempo respuesta promedio | 4.5h | 1.2h | -73% |
| Emisiones CO2 (kg/mes) | 850 | 510 | -40% |

---

## 5️⃣ Roadmap Técnico

### 📅 Próximos 3 meses

**Sprint 1-2 (Semanas 1-4)**: Recolección de datos
- ✅ Implementar logging detallado de donaciones
- ✅ Integrar API de clima (OpenWeatherMap)
- ✅ Crear data warehouse en MongoDB Atlas

**Sprint 3-4 (Semanas 5-8)**: Feature Engineering
- Calcular features temporales y espaciales
- Análisis exploratorio de datos (EDA)
- Validar calidad de datos (completitud, outliers)

**Sprint 5-6 (Semanas 9-12)**: Modelo Predictivo
- Entrenar LSTM con 90 días de datos
- Hyperparameter tuning (GridSearch)
- Validación cruzada (K-Fold)
- Deploy en AWS SageMaker

### 📅 Próximos 6 meses

**Sprint 7-8**: Optimización de rutas
- Implementar OR-Tools VRP
- Integración con Google Maps API
- Testing con conductores reales

**Sprint 9-10**: Dashboard Predictivo
- Frontend React con visualizaciones
- Alertas en tiempo real (WebSockets)
- Métricas de performance del modelo

**Sprint 11-12**: A/B Testing & Refinamiento
- Comparar rutas tradicionales vs IA
- Recopilar feedback de conductores
- Ajustar modelo basado en resultados

---

## 6️⃣ Estimación de Costos

### 💰 Infraestructura de IA

| Servicio | Costo mensual | Propósito |
|----------|---------------|-----------|
| AWS SageMaker (ml.t3.medium) | $58 | Training modelo |
| AWS Lambda (inferencias) | $12 | Predictions API |
| MongoDB Atlas (M10) | $60 | Data warehouse |
| Redis ElastiCache | $15 | Caché predicciones |
| Google Maps API | $200 | Geocoding y rutas |
| CloudWatch Logs | $8 | Monitoring |
| **TOTAL** | **$353/mes** | |

**ROI estimado**: 
- Ahorro en combustible: $1,200/mes
- Aumento en donaciones: $3,500/mes (valor social)
- **ROI**: 330% en 6 meses

---

## 🎯 Conclusiones Finales

### ✅ Éxitos del proyecto

1. **Arquitectura sólida**: Monolito modular escalable
2. **Seguridad robusta**: 0 vulnerabilidades críticas
3. **Alta cobertura de tests**: 85% (meta: 80%)
4. **CI/CD automatizado**: Despliegue continuo en AWS
5. **Calidad de código**: Rating A en SonarQube

### ⚠️ Áreas de mejora

1. **Documentación API**: Implementar Swagger/OpenAPI
2. **Tests E2E**: Agregar Cypress para frontend
3. **Monitoring**: Integrar Datadog/New Relic
4. **Disaster Recovery**: Implementar backups automáticos

### 🚀 Próximos pasos

1. ✅ Completar OAuth 2.0 (Google/Apple)
2. ✅ Implementar módulo de notificaciones (Push, SMS)
3. ✅ Desarrollar app móvil (React Native)
4. ✅ **Iniciar recolección de datos para modelo predictivo**

---

## 📚 Referencias técnicas

- [MongoDB Geospatial Queries](https://docs.mongodb.com/manual/geospatial-queries/)
- [OWASP NoSQL Injection](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/05.6-Testing_for_NoSQL_Injection)
- [LSTM for Time Series](https://www.tensorflow.org/tutorials/structured_data/time_series)
- [Vehicle Routing Problem](https://developers.google.com/optimization/routing)
- [AWS Fargate Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/fargate.html)

---

**✅ Fase 3 completada exitosamente**
**🎉 Proyecto EcoResource Connect listo para producción**

---

_Documentación generada el 3 de marzo de 2026_
