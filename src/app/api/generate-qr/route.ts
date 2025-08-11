import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Usar múltiples servicios de QR como fallback
    const qrServices = [
      {
        name: 'qr-server',
        url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&format=png&ecc=M&data=${encodeURIComponent(url)}`
      },
      {
        name: 'qrcode-monkey',
        url: `https://api.qrserver.com/v1/create-qr-code/?size=400x400&format=png&ecc=H&data=${encodeURIComponent(url)}`
      }
    ];

    let lastError = null;
    
    for (const service of qrServices) {
      try {
        console.log(`Trying QR service: ${service.name}`);
        
        const response = await fetch(service.url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (response.ok) {
          // Convertir la imagen a base64
          const imageBuffer = await response.arrayBuffer();
          const base64Image = Buffer.from(imageBuffer).toString('base64');
          const dataUrl = `data:image/png;base64,${base64Image}`;
          
          console.log(`QR generated successfully with ${service.name}`);
          
          return NextResponse.json({ 
            qrCodeUrl: dataUrl,
            originalUrl: url,
            method: service.name,
            success: true
          });
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
      } catch (serviceError) {
        console.log(`Service ${service.name} failed:`, serviceError);
        lastError = serviceError;
        continue;
      }
    }
    
    // Si todos los servicios fallan, devolver error
    throw new Error(`All QR services failed. Last error: ${lastError}`);
    
  } catch (error) {
    console.error('Error generating QR code:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate QR code', 
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }, 
      { status: 500 }
    );
  }
}