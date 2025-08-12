# Configuración de Vercel KV para TuneConnect

Este proyecto usa Vercel KV para almacenamiento persistente en producción. Sigue estos pasos para configurarlo:

## 1. Crear una base de datos KV en Vercel

1. Ve a tu dashboard de Vercel: https://vercel.com/dashboard
2. Selecciona tu proyecto TuneConnect
3. Ve a la pestaña "Storage"
4. Haz clic en "Create Database"
5. Selecciona "KV" (Redis)
6. Dale un nombre a tu base de datos (ej: "tuneconnect-kv")
7. Selecciona la región más cercana a tus usuarios
8. Haz clic en "Create"

## 2. Conectar la base de datos a tu proyecto

1. En la página de tu base de datos KV, haz clic en "Connect Project"
2. Selecciona tu proyecto TuneConnect
3. Selecciona el entorno (Production, Preview, Development)
4. Haz clic en "Connect"

## 3. Variables de entorno (automáticas)

Vercel configurará automáticamente estas variables de entorno:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN` 
- `KV_REST_API_READ_ONLY_TOKEN`
- `KV_URL`

## 4. Desarrollo local (opcional)

Si quieres usar KV en desarrollo local:

1. Ve a la pestaña "Settings" de tu base de datos KV
2. Copia las variables de entorno
3. Crea un archivo `.env.local` en la raíz del proyecto
4. Pega las variables copiadas

## 5. Desplegar

1. Haz commit de tus cambios
2. Haz push a tu repositorio
3. Vercel desplegará automáticamente con KV configurado

## Estructura de datos en KV

El sistema almacena:
- **Códigos únicos**: `code:ABCD1234` → datos del código
- **Perfiles DJ**: `profile:dj-slug` → datos del perfil

## Fallbacks

- **Desarrollo local**: localStorage + memoria
- **Producción**: Vercel KV
- **Error en KV**: logs de error, continúa funcionando

## Verificar funcionamiento

1. Genera un código QR en tu app desplegada
2. Verifica que el código persiste después de recargar
3. Revisa los logs de Vercel para errores de KV

¡Listo! Tu app ahora tendrá almacenamiento persistente en Vercel.