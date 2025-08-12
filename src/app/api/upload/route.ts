// File: src/app/api/upload/route.ts

import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// Función para verificar si Vercel Blob está disponible
function isBlobAvailable(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

// Función para guardar archivo localmente
async function saveFileLocally(filename: string, buffer: Buffer): Promise<{ url: string; pathname: string }> {
  try {
    // Crear directorio uploads si no existe
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });
    
    // Guardar archivo
    const filePath = path.join(uploadsDir, filename);
    await writeFile(filePath, buffer);
    
    // Retornar URL local
    const url = `/uploads/${filename}`;
    return {
      url,
      pathname: filename
    };
  } catch (error) {
    console.error('Error guardando archivo localmente:', error);
    throw new Error('Error guardando archivo');
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
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

    // Convertir el stream a buffer
    const bytes = await request.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Verificar si estamos en producción con Vercel Blob
    if (isBlobAvailable()) {
      console.log('📤 Subiendo archivo a Vercel Blob:', filename);
      
      try {
        const blob = await put(filename, buffer, {
          access: 'public',
        });
        
        console.log('✅ Archivo subido a Vercel Blob:', blob.url);
        return NextResponse.json({
          ...blob,
          storageMethod: 'vercel-blob'
        });
      } catch (blobError) {
        console.error('❌ Error con Vercel Blob, usando almacenamiento local:', blobError);
        // Fallback a almacenamiento local
      }
    }

    // Usar almacenamiento local (desarrollo o fallback)
    console.log('💾 Guardando archivo localmente:', filename);
    const localResult = await saveFileLocally(filename, buffer);
    
    console.log('✅ Archivo guardado localmente:', localResult.url);
    return NextResponse.json({
      url: localResult.url,
      pathname: localResult.pathname,
      storageMethod: 'local',
      downloadUrl: localResult.url
    });

  } catch (error) {
    console.error('❌ Error en upload:', error);
    return NextResponse.json(
      { 
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}