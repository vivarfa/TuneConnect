// File: src/app/api/upload/route.ts

// Importa 'put' de Vercel Blob y elimina las importaciones de 'fs' (fs/promises, path, fs)
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  // Obtenemos el nombre del archivo de los parámetros de la URL
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  // Validamos que el nombre y el cuerpo del archivo existan
  if (!filename) {
    return NextResponse.json(
      { message: 'El nombre del archivo es requerido.' },
      { status: 400 }
    );
  }

  if (!request.body) {
    return NextResponse.json(
      { message: 'No se encontró el archivo a subir.' },
      { status: 400 }
    );
  }

  // ¡Esta es la línea clave!
  // Sube el archivo a Vercel Blob.
  // 'put' toma el nombre deseado para el archivo, el cuerpo del archivo,
  // y opciones como 'access: public' para que sea accesible públicamente.
  const blob = await put(filename, request.body, {
    access: 'public',
  });

  // Devolvemos directamente el objeto 'blob' que nos da Vercel.
  // Este objeto ya contiene la URL pública, el pathname, contentType, etc.
  return NextResponse.json(blob);
}