// File: src/app/api/upload/route.ts

import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Esta función se activa cuando se recibe una petición POST a /api/upload
export async function POST(request: Request): Promise<NextResponse> {
  try {
    // Obtenemos el nombre del archivo de los parámetros de la URL
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    // Validamos que el nombre y el cuerpo del archivo existan
    if (!filename || !request.body) {
      return NextResponse.json(
        { message: 'No se encontró el archivo a subir.' },
        { status: 400 }
      );
    }

    // Convertir el archivo a buffer
    const arrayBuffer = await request.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Crear directorio de uploads si no existe
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }
    
    // Generar nombre único para el archivo
    const uniqueFilename = `${Date.now()}-${filename}`;
    const filePath = join(uploadsDir, uniqueFilename);
    
    // Guardar el archivo en el sistema de archivos
    await writeFile(filePath, buffer);
    
    // Crear URL pública para acceder al archivo
    const publicUrl = `/uploads/${uniqueFilename}`;
    
    // Determinar el tipo MIME basado en la extensión del archivo
    const extension = filename.split('.').pop()?.toLowerCase();
    let mimeType = 'image/jpeg'; // default
    
    if (extension === 'png') mimeType = 'image/png';
    else if (extension === 'gif') mimeType = 'image/gif';
    else if (extension === 'webp') mimeType = 'image/webp';

    // Devolvemos la respuesta JSON con la URL pública
    return NextResponse.json({
      url: publicUrl,
      pathname: uniqueFilename,
      contentType: mimeType,
      contentDisposition: `inline; filename="${filename}"`,
      size: buffer.length
    });
    
  } catch (error) {
    console.error('Error processing upload:', error);
    return NextResponse.json(
      { message: 'Error al procesar el archivo.' },
      { status: 500 }
    );
  }
}