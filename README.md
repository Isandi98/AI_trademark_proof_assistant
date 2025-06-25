# Asistente AI para Pruebas de Marcas

Una aplicación web potente para encontrar evidencias de uso de marcas comerciales usando búsqueda directa de Google y tecnología AI.

## 🌐 Demo en Vivo

**Accede a la aplicación aquí:** [https://isandi98.github.io/AI_trademark_proof_assistant/](https://isandi98.github.io/AI_trademark_proof_assistant/)

## 🚀 Características

- **Búsqueda Directa de Google**: Usa Google Custom Search API para obtener hasta 100+ resultados por búsqueda
- **Verificación Verbatim**: Filtra automáticamente solo artículos que mencionen la marca exactamente como se escribió
- **Filtros Estrictos**: Solo muestra artículos con fecha válida dentro del rango especificado
- **Sistema de Relevancia**: Calificación con estrellas (1-5⭐) basada en frecuencia y contexto
- **Detección Avanzada de Fechas**: Extrae fechas de metadatos, contenido y código fuente
- **Agrupación por Años**: Organiza los resultados por año de publicación
- **Respaldo con IA**: Si Google Search no encuentra resultados, automáticamente usa Gemini AI como respaldo
- **Interfaz en Español**: Completamente localizada para usuarios hispanohablantes
- **Filtros Avanzados**: Por idioma, país, y rango de fechas
- **Deployment Automático**: Configurado para GitHub Pages con CI/CD

## 📋 Requisitos Previos

### APIs Necesarias

1. **Google Custom Search API**
   - Crea un proyecto en [Google Cloud Console](https://console.cloud.google.com/)
   - Habilita "Custom Search API"
   - Genera una API Key
   - Crea un Programmable Search Engine en [programmablesearchengine.google.com](https://programmablesearchengine.google.com/)

2. **Google Gemini API** (opcional, como respaldo)
   - API Key de Gemini para casos donde Google Search no devuelve resultados

## ⚙️ Configuración

### 1. Fork y Configuración de Secrets

1. **Fork este repositorio** en tu cuenta de GitHub
2. **Configura los Secrets** en tu repositorio:
   - Ve a `Settings` > `Secrets and variables` > `Actions`
   - Agrega estos secrets:
     ```
     VITE_GOOGLE_SEARCH_API_KEY=tu_google_api_key
     VITE_GOOGLE_SEARCH_CX=tu_custom_search_cx
     VITE_GEMINI_API_KEY=tu_gemini_api_key (opcional)
     ```

### 2. Desarrollo Local

Para desarrollo local, crea un archivo `.env`:

```env
# Solo para desarrollo local - NO subir a GitHub
VITE_GOOGLE_SEARCH_API_KEY=tu_google_api_key
VITE_GOOGLE_SEARCH_CX=tu_custom_search_cx
VITE_GEMINI_API_KEY=tu_gemini_api_key
```

### 3. Instalación

```bash
npm install
npm run dev
```

### 4. Deployment Automático

El proyecto se despliega automáticamente a GitHub Pages cuando haces push a la rama `main`. El workflow de GitHub Actions:
- Instala dependencias
- Construye el proyecto usando las API keys de los Secrets
- Despliega a GitHub Pages

### 3. Configuración del Programmable Search Engine

1. Ve a [programmablesearchengine.google.com](https://programmablesearchengine.google.com/)
2. Crea un nuevo buscador
3. En "Sitios a buscar" escribe `*` (para buscar en toda la web)
4. Ve a "Configuración" → "Búsqueda básica" → marca "Incluir toda la Web"
5. Copia el "ID del buscador" (es tu CX)

## 🎯 Cómo Usar

1. **Ingresa el Nombre de la Marca**: Escribe exactamente como quieres que aparezca mencionada
2. **Selecciona Rango de Fechas**: Define el período de búsqueda
3. **Elige Idioma y País**: Filtra por región geográfica o idioma específico
4. **Buscar**: El sistema hará búsquedas automáticas en Google para obtener máximos resultados

### Ejemplo de Uso

```
Marca: "Apple"
Desde: 2020-01-01
Hasta: 2024-12-31
Idioma: Español
País: España
```

**Nota**: El sistema está optimizado para mostrar la máxima cantidad de artículos que cumplan todos los criterios: mención exacta de la marca, fecha válida dentro del rango especificado.

### ⚠️ **Filtros Aplicados Automáticamente**

1. **Filtro de Fecha Obligatorio**: 
   - ❌ Se excluyen automáticamente artículos sin fecha válida
   - ✅ Solo se muestran artículos con fecha de publicación confirmada
   - ✅ Solo artículos dentro del rango de fechas especificado

2. **Verificación de Marca Exacta**:
   - Solo se incluyen artículos que mencionen la marca exactamente como se escribió
   - Búsqueda optimizada con parámetros de fecha para máxima eficiencia
   - Máximos resultados respetando todos los criterios

## 📊 Resultados

Los artículos se muestran agrupados por año:

- **2024** (15 artículos)
- **2023** (23 artículos)  
- **2022** (18 artículos)

Cada artículo incluye:
- ✅ **Titular enlazado** al artículo original
- ✅ **Fecha de publicación** (con fuente: metadatos, contenido, código fuente)
- ✅ **Extracto** con la marca resaltada
- ✅ **Relevancia con estrellas** (1-5⭐)
- ✅ **Metadatos** (idioma, país)

## 🔧 Tecnologías

- **Frontend**: React + TypeScript + Tailwind CSS
- **APIs**: Google Custom Search API + Google Gemini API
- **Build**: Vite
- **Deployment**: GitHub Pages con GitHub Actions
- **CI/CD**: Workflow automático para build y deploy

## 📈 Límites de Uso

### Google Custom Search API
- **Gratis**: 100 consultas/día
- **De pago**: Hasta 10,000 consultas/día (~$5 USD/1000 consultas)

### Optimizaciones Implementadas
- Máximo 10 páginas por búsqueda (100 resultados)
- Delays entre requests para evitar rate limiting
- Fallback automático a Gemini si Google falla
- Filtrado verbatim para relevancia máxima
- Filtros de fecha estrictos para resultados precisos
- Búsqueda optimizada con parámetros temporales

## 🐛 Solución de Problemas

### Error: "Google Search API credentials not configured"
- Verifica que tu `.env` tenga las variables correctas
- Asegúrate que la API Key sea válida
- Confirma que el CX corresponda al buscador correcto

### Sin Resultados
- Amplía el rango de fechas
- Verifica que la marca esté escrita exactamente como aparece en los artículos
- Intenta con variaciones del nombre si no hay resultados
- El sistema automáticamente probará con Gemini como respaldo

### Rate Limiting
- Espera unos minutos antes de hacer otra búsqueda
- Considera el plan de pago de Google si necesitas muchas consultas

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una branch para tu feature
3. Commit tus cambios
4. Push a la branch
5. Abre un Pull Request

## 📄 Licencia

MIT License - ver archivo LICENSE para detalles.

---

**Nota**: Los resultados son para fines informativos. Consulta con un abogado especializado en marcas para asesoría legal específica.
