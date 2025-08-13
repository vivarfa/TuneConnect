import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 1. RECIBIMOS LA URL DE LA IMAGEN DESDE EL FRONTEND
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (jsonError) {
      console.error('Error parsing JSON:', jsonError);
      return NextResponse.json(
        { error: 'Invalid JSON format in request body' },
        { status: 400 }
      );
    }
    
    const { url: imageUrl } = requestBody;
    
    if (!imageUrl) {
      return NextResponse.json({ error: 'La URL de la imagen es requerida.' }, { status: 400 });
    }

    // --- LA CORRECCIÓN PRINCIPAL ESTÁ AQUÍ ---

    // 2. CONSTRUIMOS LA URL DE DESTINO CORRECTA QUE IRÁ DENTRO DEL QR
    // Esta será una página en tu propio sitio que mostrará la imagen.
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    
    if (!baseUrl) {
      // Este error es importante si olvidas poner la variable de entorno en Vercel
      throw new Error("Error crítico: La variable de entorno NEXT_PUBLIC_BASE_URL no está configurada en Vercel.");
    }

    // Creamos la URL a la página de visualización, por ejemplo: /show-qr
    const targetUrl = new URL('/show-qr', baseUrl); 
    
    // Añadimos la URL de la imagen como un parámetro de búsqueda seguro
    targetUrl.searchParams.set('imageUrl', imageUrl);

    // Este es el string final y VÁLIDO que se codificará en el QR
    const finalUrlToEncode = targetUrl.toString();

    // ---------------------------------------------


    // 3. USAMOS LA NUEVA URL PARA GENERAR EL QR CON LOS SERVICIOS EXTERNOS
    const qrServices = [
      {
        name: 'qr-server',
        url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&format=png&ecc=M&data=${encodeURIComponent(finalUrlToEncode)}`
      },
      {
        name: 'qrcode-monkey',
        url: `https://api.qrserver.com/v1/create-qr-code/?size=400x400&format=png&ecc=H&data=${encodeURIComponent(finalUrlToEncode)}`
      }
    ];

    let lastError = null;
    
    for (const service of qrServices) {
      try {
        console.log(`Intentando servicio de QR: ${service.name}`);
        const response = await fetch(service.url);
        
        if (response.ok) {
          const imageBuffer = await response.arrayBuffer();
          const base64Image = Buffer.from(imageBuffer).toString('base64');
          const dataUrl = `data:image/png;base64,${base64Image}`;
          
          console.log(`QR generado exitosamente con ${service.name}`);
          
          return NextResponse.json({ 
            qrCodeUrl: dataUrl,
            originalUrl: finalUrlToEncode, // Devolvemos la URL correcta que se usó
            success: true
          });
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
      } catch (serviceError) {
        console.log(`Servicio ${service.name} falló:`, serviceError);
        lastError = serviceError;
        continue;
      }
    }
    
    throw new Error(`Todos los servicios de QR fallaron. Último error: ${lastError}`);
    
  } catch (error) {
    console.error('Error al generar el código QR:', error);
    return NextResponse.json(
      { 
        error: 'Falló la generación del código QR', 
        details: error instanceof Error ? error.message : 'Error desconocido',
        success: false
      }, 
      { status: 500 }
    );
  }
}