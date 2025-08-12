import { NextRequest, NextResponse } from 'next/server';
import { getDjProfileBySlug } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ djId: string }> }
) {
  try {
    const { djId } = await params;
    
    if (!djId) {
      return NextResponse.json(
        { error: 'ID del DJ es requerido' },
        { status: 400 }
      );
    }
    
    // Buscar el perfil del DJ por djId
    const djProfile = await getDjProfileBySlug(djId);
    
    if (!djProfile) {
      return NextResponse.json(
        { error: 'Perfil del DJ no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      djProfile
    });
    
  } catch (error) {
    console.error('Error obteniendo perfil del DJ:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}