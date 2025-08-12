import { NextRequest, NextResponse } from 'next/server';
import { getCodeData } from '@/lib/database';

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

    // Buscar el código en la base de datos
    const codeData = await getCodeData(id.toUpperCase());
    
    if (!codeData || !codeData.djSlug) {
      return NextResponse.json(
        { error: 'Código no encontrado' },
        { status: 404 }
      );
    }
    
    // Redirigir al formulario de solicitud del DJ
    return NextResponse.redirect(
      new URL(`/request/${codeData.djSlug}`, request.url)
    );
  } catch (error) {
    console.error('Error en unique-request route:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}