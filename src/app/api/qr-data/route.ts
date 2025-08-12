import { NextRequest, NextResponse } from 'next/server';
import { getCodeData } from '@/lib/database';

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
    
    // Verificar si es un código del convertidor QR
    if (codeInfo.type !== 'qr-converter') {
      return NextResponse.json(
        { error: 'Este código no corresponde a un QR del convertidor' },
        { status: 400 }
      );
    }
    
    // Verificar si ha expirado
    const now = new Date();
    const expiresAt = new Date(codeInfo.expiresAt);
    
    if (now > expiresAt) {
      return NextResponse.json(
        { 
          success: true,
          qrData: {
            originalContent: codeInfo.originalContent,
            contentType: codeInfo.contentType,
            createdAt: codeInfo.createdAt,
            expiresAt: codeInfo.expiresAt
          },
          expired: true
        }
      );
    }
    
    return NextResponse.json({
      success: true,
      qrData: {
        originalContent: codeInfo.originalContent,
        contentType: codeInfo.contentType,
        createdAt: codeInfo.createdAt,
        expiresAt: codeInfo.expiresAt
      }
    });
    
  } catch (error) {
    console.error('Error obteniendo datos del QR:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}