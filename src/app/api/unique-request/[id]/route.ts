import { NextRequest, NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Validar que el ID tenga el formato correcto (8 caracteres alfanuméricos)
    if (!id || id.length !== 8 || !/^[a-zA-Z0-9]+$/.test(id)) {
      return NextResponse.json(
        { error: 'ID de URL inválido' },
        { status: 400 }
      );
    }

    // Por ahora, redirigimos a dj-vibe como ejemplo
    // En una implementación real, aquí buscarías en la base de datos
    // qué DJ corresponde a este ID único
    const djSlug = 'dj-vibe'; // Esto debería venir de la base de datos
    
    // Redirigir al formulario de solicitud del DJ
    return NextResponse.redirect(
      new URL(`/request/${djSlug}`, request.url)
    );
  } catch (error) {
    console.error('Error en unique-request route:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}