import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

interface PageProps {
  params: Promise<{
    code: string;
  }>;
}

// Función para obtener información del código desde la API
async function getCodeInfo(code: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
    const response = await fetch(`${baseUrl}/api/generate-unique-code?code=${code}`, {
      cache: 'no-store' // No cachear para obtener datos actualizados
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error obteniendo información del código:', error);
    return null;
  }
}

export default async function RedirectPage({ params }: PageProps) {
  const { code } = await params;
  
  // Validar formato del código (8 caracteres alfanuméricos)
  if (!code || code.length !== 8 || !/^[A-Z0-9]+$/i.test(code)) {
    redirect('/404');
  }
  
  // Obtener información del código
  const codeInfo = await getCodeInfo(code.toUpperCase());
  
  if (!codeInfo || !codeInfo.success) {
    redirect('/404');
  }
  
  // Redirigir al formulario del DJ con parámetro de vista previa
  redirect(`/request/${codeInfo.djSlug}?preview=true`);
}

// Generar metadata dinámicamente
export async function generateMetadata({ params }: PageProps) {
  const { code } = await params;
  const codeInfo = await getCodeInfo(code.toUpperCase());
  
  if (codeInfo && codeInfo.success) {
    return {
      title: `Solicitar canción a ${codeInfo.djName} - TuneConnect`,
      description: `Solicita tu canción favorita a ${codeInfo.djName} de forma rápida y sencilla.`,
    };
  }
  
  return {
    title: 'Código no encontrado - TuneConnect',
    description: 'El código QR que escaneaste no es válido o ha expirado.',
  };
}