import { NextRequest, NextResponse } from 'next/server';
import { purgeExpiredCodes } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    // Ejecutar purga de códigos expirados
    const result = await purgeExpiredCodes();
    
    return NextResponse.json({
      success: true,
      message: `Purga completada: ${result.deleted} códigos eliminados`,
      deleted: result.deleted,
      errors: result.errors
    });
    
  } catch (error) {
    console.error('Error en purga de códigos expirados:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor durante la purga',
        details: error instanceof Error ? error.message : 'Error desconocido'
      }, 
      { status: 500 }
    );
  }
}

// GET para obtener estadísticas de códigos expirados sin eliminarlos
export async function GET(request: NextRequest) {
  try {
    // Esta función simula la purga pero no elimina nada, solo cuenta
    const { searchParams } = new URL(request.url);
    const preview = searchParams.get('preview') === 'true';
    
    if (preview) {
      // TODO: Implementar función de vista previa que cuente códigos expirados sin eliminar
      return NextResponse.json({
        success: true,
        message: 'Vista previa de purga no implementada aún',
        preview: true
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Use POST para ejecutar la purga o GET con ?preview=true para vista previa'
    }, { status: 400 });
    
  } catch (error) {
    console.error('Error en vista previa de purga:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      }, 
      { status: 500 }
    );
  }
}