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
    .trim('-'); // Remover guiones al inicio y final
}

export async function POST(request: NextRequest) {
  try {
    const { djName, djProfile } = await request.json();
    
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
    
    // Generar código único (intentar hasta 10 veces para evitar duplicados)
      let uniqueCode = '';
      let attempts = 0;
      
      do {
        uniqueCode = generateUniqueCode();
        attempts++;
      } while (codeExists(uniqueCode) && attempts < 10);
    
    if (attempts >= 10) {
      return NextResponse.json(
        { error: 'No se pudo generar un código único' },
        { status: 500 }
      );
    }
    
    const djSlug = createDjSlug(djName.trim());
    
    // Almacenar el código
    setCodeData(uniqueCode, {
      djName: djName.trim(),
      djSlug,
      djProfile,
      createdAt: new Date()
    });
    
    // Construir URLs
    const baseUrl = request.nextUrl.origin;
    const requestUrl = `${baseUrl}/request/${djSlug}`;
    const shortUrl = `${baseUrl}/r/${uniqueCode}`;
    
    return NextResponse.json({
      success: true,
      uniqueCode,
      djSlug,
      requestUrl,
      shortUrl,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shortUrl)}`
    });
    
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
    
    const codeInfo = getCodeData(code);
    
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

// Exportar la función para acceso desde otras partes de la aplicación
export function getStoredCodes() {
  return Array.from(uniqueCodes.entries()).map(([code, info]) => ({
    code,
    ...info
  }));
}