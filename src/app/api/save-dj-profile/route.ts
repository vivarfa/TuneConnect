import { NextRequest, NextResponse } from 'next/server';
import { saveDjProfile } from '@/lib/database';

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
    const { djProfile } = await request.json();
    
    if (!djProfile || !djProfile.djName) {
      return NextResponse.json(
        { error: 'Perfil del DJ y nombre son requeridos' },
        { status: 400 }
      );
    }
    
    // Crear slug del nombre del DJ
    const djSlug = createDjSlug(djProfile.djName.trim());
    
    // Asignar el slug como ID si no existe
    const profileToSave = {
      ...djProfile,
      id: djSlug
    };
    
    // Guardar el perfil
    await saveDjProfile(djSlug, profileToSave);
    
    console.log(`✅ Perfil guardado para ${djProfile.djName} con slug: ${djSlug}`);
    
    return NextResponse.json({
      success: true,
      djSlug,
      message: 'Perfil guardado exitosamente'
    });
    
  } catch (error) {
    console.error('Error guardando perfil del DJ:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}