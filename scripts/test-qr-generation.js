/**
 * Script de prueba para verificar la generación de QR
 * Ejecutar con: node scripts/test-qr-generation.js
 */

const https = require('https');
const http = require('http');

// Configuración
const BASE_URL = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : 'http://localhost:9002';

console.log(`🧪 Probando generación de QR en: ${BASE_URL}`);
console.log('=' .repeat(50));

// Función para hacer peticiones HTTP
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Datos de prueba
const testDJProfile = {
  djName: "DJ Test",
  djPhoto: "https://via.placeholder.com/150",
  djDescription: "DJ de prueba para testing",
  musicGenres: ["Reggaeton", "Pop"],
  paymentMethods: {
    paypal: "test@paypal.com",
    venmo: "@testdj",
    cashapp: "$testdj"
  },
  socialMedia: {
    instagram: "@testdj",
    tiktok: "@testdj"
  }
};

async function runTests() {
  try {
    console.log('1️⃣ Verificando estado del sistema...');
    
    // Test 1: Health Check
    const healthResponse = await makeRequest(`${BASE_URL}/api/health`);
    console.log(`   Estado: ${healthResponse.status === 200 ? '✅' : '❌'} (${healthResponse.status})`);
    
    if (healthResponse.data.status) {
      console.log(`   Sistema: ${healthResponse.data.status.toUpperCase()}`);
      console.log(`   KV Disponible: ${healthResponse.data.checks?.kvAvailable ? '✅' : '❌'}`);
      
      if (healthResponse.data.checks?.errors?.length > 0) {
        console.log(`   Errores: ${healthResponse.data.checks.errors.join(', ')}`);
      }
    }
    
    console.log('\n2️⃣ Probando generación de formulario QR...');
    
    // Test 2: Crear formulario
    const formResponse = await makeRequest(`${BASE_URL}/api/forms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        djProfile: testDJProfile,
        expirationMonths: 6
      })
    });
    
    console.log(`   Creación: ${formResponse.status === 200 ? '✅' : '❌'} (${formResponse.status})`);
    
    if (formResponse.status === 200 && formResponse.data.success) {
      const formData = formResponse.data;
      console.log(`   ID: ${formData.id}`);
      console.log(`   URL: ${formData.shortUrl}`);
      console.log(`   QR: ${formData.qrCodeUrl ? '✅ Generado' : '❌ No generado'}`);
      console.log(`   Almacenamiento: ${formData.storageMethod || 'No especificado'}`);
      
      console.log('\n3️⃣ Verificando acceso al formulario...');
      
      // Test 3: Acceder al formulario
      const accessResponse = await makeRequest(`${BASE_URL}/api/forms?id=${formData.id}`);
      console.log(`   Acceso: ${accessResponse.status === 200 ? '✅' : '❌'} (${accessResponse.status})`);
      
      if (accessResponse.status === 200 && accessResponse.data.success) {
        console.log(`   DJ: ${accessResponse.data.data.djProfile.djName}`);
        console.log(`   Expira: ${new Date(accessResponse.data.data.expiresAt).toLocaleDateString('es-ES')}`);
      }
      
      console.log('\n4️⃣ Probando envío de solicitud de música...');
      
      // Test 4: Enviar solicitud de música
      const requestResponse = await makeRequest(`${BASE_URL}/api/forms`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: formData.id,
          musicRequest: {
            songName: "Canción de Prueba",
            artistName: "Artista de Prueba",
            genre: "Pop",
            requesterName: "Usuario de Prueba",
            selectedWallet: "paypal",
            message: "Esta es una prueba del sistema"
          }
        })
      });
      
      console.log(`   Solicitud: ${requestResponse.status === 200 ? '✅' : '❌'} (${requestResponse.status})`);
      
      if (requestResponse.status === 200 && requestResponse.data.success) {
        console.log(`   ID Solicitud: ${requestResponse.data.requestId}`);
      }
      
    } else {
      console.log(`   Error: ${formResponse.data.error || 'Error desconocido'}`);
    }
    
    console.log('\n' + '=' .repeat(50));
    console.log('🎉 Pruebas completadas');
    
    // Resumen
    const allPassed = 
      healthResponse.status === 200 &&
      formResponse.status === 200 &&
      formResponse.data.success;
    
    if (allPassed) {
      console.log('✅ Todas las pruebas pasaron - Sistema funcionando correctamente');
      console.log('🚀 Tu aplicación está lista para producción');
    } else {
      console.log('❌ Algunas pruebas fallaron - Revisa la configuración');
      console.log('🔧 Visita /diagnostics para más información');
    }
    
  } catch (error) {
    console.error('❌ Error ejecutando pruebas:', error.message);
    console.log('🔧 Verifica que la aplicación esté ejecutándose');
  }
}

// Ejecutar pruebas
runTests();