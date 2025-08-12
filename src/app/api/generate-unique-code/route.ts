import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { getCodeData, setCodeData, codeExists } from '@/lib/database';

// Función para generar un código único de 8 caracteres
function generateUniqueCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Función para crear un slug del nombre del DJ
function createDjSlug(djName: string): string {
  return djName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/-+/g, '-') // Remover guiones múltiples
    .replace(/^-+|-+$/g, ''); // Remover guiones al inicio y final
}

export async function POST(request: NextRequest) {
  try {
    const { 
      djName, 
      djProfile, 
      expirationMonths = 6,
      // Nuevos campos para el convertidor QR
      originalContent,
      contentType,
      qrSettings
    } = await request.json();
    
    // Determinar si es para DJ o para convertidor QR
    const isQrConverter = originalContent && contentType;
    
    if (isQrConverter) {
      // Validación para convertidor QR
      if (!originalContent || typeof originalContent !== 'string' || originalContent.trim().length === 0) {
        return NextResponse.json(
          { error: 'Contenido original es requerido' },
          { status: 400 }
        );
      }
      
      if (!['text', 'url', 'image'].includes(contentType)) {
        return NextResponse.json(
          { error: 'Tipo de contenido debe ser text, url o image' },
          { status: 400 }
        );
      }
    } else {
      // Validación para DJ
      if (!djName || typeof djName !== 'string' || djName.trim().length === 0) {
        return NextResponse.json(
          { error: 'Nombre del DJ es requerido' },
          { status: 400 }
        );
      }
      
      if (!djProfile) {
        return NextResponse.json(
          { error: 'Perfil del DJ es requerido' },
          { status: 400 }
        );
      }
    }
    
    // Validar período de expiración (6 o 12 meses)
    if (![6, 12].includes(expirationMonths)) {
      return NextResponse.json(
        { error: 'El período de expiración debe ser 6 o 12 meses' },
        { status: 400 }
      );
    }
    
    // Generar código único (intentar hasta 10 veces para evitar duplicados)
    let uniqueCode = '';
    let attempts = 0;
    
    do {
      uniqueCode = generateUniqueCode();
      attempts++;
    } while (await codeExists(uniqueCode) && attempts < 10);
  
    if (attempts >= 10) {
      return NextResponse.json(
        { error: 'No se pudo generar un código único' },
        { status: 500 }
      );
    }
    
    // Calcular fecha de expiración
    const createdAt = new Date();
    const expiresAt = new Date(createdAt);
    expiresAt.setMonth(expiresAt.getMonth() + expirationMonths);
    
    const baseUrl = request.nextUrl.origin;
    let dataToStore: any;
    let responseData: any;
    
    if (isQrConverter) {
      // Para convertidor QR
      dataToStore = {
        type: 'qr-converter',
        originalContent: originalContent.trim(),
        contentType,
        qrSettings: qrSettings || {},
        createdAt,
        expiresAt,
        expirationMonths
      };
      
      const shortUrl = `${baseUrl}/qr/${uniqueCode}`;
      
      // Generar QR con configuraciones personalizadas
      const qrOptions = {
        width: qrSettings?.size || 256,
        margin: 2,
        color: {
          dark: qrSettings?.foregroundColor || '#000000',
          light: qrSettings?.backgroundColor || '#FFFFFF'
        },
        errorCorrectionLevel: qrSettings?.errorCorrectionLevel || 'M'
      };
      
      const qrCodeDataUrl = await QRCode.toDataURL(shortUrl, qrOptions);
      
      responseData = {
        success: true,
        uniqueCode,
        shortUrl,
        qrCodeUrl: qrCodeDataUrl,
        originalContent: originalContent.trim(),
        contentType
      };
    } else {
      // Para DJ (lógica original)
      const djSlug = createDjSlug(djName.trim());
      
      dataToStore = {
        type: 'dj-profile',
        djName: djName.trim(),
        djSlug,
        djProfile: djProfile,
        createdAt,
        expiresAt,
        expirationMonths
      };
      
      const requestUrl = `${baseUrl}/request/${djSlug}`;
      const shortUrl = `${baseUrl}/r/${uniqueCode}`;
      
      // Generar QR usando la librería qrcode (solo con la URL corta)
      const qrCodeDataUrl = await QRCode.toDataURL(shortUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      
      responseData = {
        success: true,
        uniqueCode,
        djSlug,
        requestUrl,
        shortUrl,
        qrCodeUrl: qrCodeDataUrl
      };
    }
    
    // Almacenar el código
    await setCodeData(uniqueCode, dataToStore);
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Error generando código único:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Función para obtener información de un código
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    
    if (!code) {
      return NextResponse.json(
        { error: 'Código es requerido' },
        { status: 400 }
      );
    }
    
    const codeInfo = await getCodeData(code);
    
    if (!codeInfo) {
      return NextResponse.json(
        { error: 'Código no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      djName: codeInfo.djName,
      djSlug: codeInfo.djSlug,
      djProfile: codeInfo.djProfile,
      createdAt: codeInfo.createdAt
    });
    
  } catch (error) {
    console.error('Error obteniendo código:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Función para obtener códigos almacenados (usando Vercel KV)
export async function getStoredCodes() {
  // Esta función ahora usa Vercel KV en lugar de memoria
  // Se puede implementar si es necesario listar todos los códigos
  return [];
}