# Configuración de Vercel para TuneConnect

## Problema Actual
La aplicación funciona correctamente en desarrollo local, pero en Vercel no se generan los códigos QR porque faltan las variables de entorno de Vercel KV.

## Solución: Configurar Vercel KV

### Paso 1: Crear base de datos KV en Vercel

1. Ve a tu dashboard de Vercel: https://vercel.com/dashboard
2. Selecciona tu proyecto TuneConnect
3. Ve a la pestaña **"Storage"**
4. Haz clic en **"Create Database"**
5. Selecciona **"KV"** (Redis)
6. Dale un nombre: `tuneconnect-kv`
7. Selecciona la región más cercana
8. Haz clic en **"Create"**

### Paso 2: Conectar la base de datos

1. En la página de tu base de datos KV, haz clic en **"Connect Project"**
2. Selecciona tu proyecto TuneConnect
3. Selecciona **"Production"** y **"Preview"**
4. Haz clic en **"Connect"**

### Paso 3: Verificar variables de entorno

Vercel configurará automáticamente estas variables:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`
- `KV_URL`

Puedes verificarlas en:
1. Ve a tu proyecto en Vercel
2. Pestaña **"Settings"**
3. **"Environment Variables"**

### Paso 4: Redesplegar

1. Haz un nuevo commit (puede ser vacío):
   ```bash
   git commit --allow-empty -m "Trigger redeploy for KV setup"
   git push
   ```

2. O redespliega manualmente desde el dashboard de Vercel

## Verificación

Después de configurar KV:
1. Ve a tu aplicación en Vercel
2. Intenta generar un código QR
3. Debería funcionar sin errores

## Notas Importantes

- **En desarrollo local**: La app usa localStorage como fallback
- **En Vercel**: Requiere KV configurado para persistencia
- **Las variables KV se configuran automáticamente** al conectar la base de datos

## Si sigues teniendo problemas

1. Verifica que las variables de entorno estén en Vercel
2. Revisa los logs de deployment en Vercel
3. Asegúrate de que la base de datos KV esté conectada al proyecto correcto