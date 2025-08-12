import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import QRCode from 'qrcode';
import { isKVAvailable } from '@/lib/database';

// Almacenamiento en memoria para desarrollo local
const memoryForms = new Map<string, any>();

// Función para generar un ID único de 8 caracteres
function generateUniqueId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Función para crear un slug del nombre del DJ
function createDjSlug(djName: string): string {
  return djName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/-+/g, '-') // Remover guiones múltiples
    .replace(/^-+|-+$/g, ''); // Remover guiones al inicio y final
}

// POST - Crear nuevo formulario DJ
export async function POST(request: NextRequest) {
  try {
    const { djProfile, expirationMonths = 6 } = await request.json();
    
    // Validaciones
    if (!djProfile || !djProfile.djName || djProfile.djName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Nombre del DJ es requerido' },
        { status: 400 }
      );
    }
    
    // Generar ID único
    // Verificar disponibilidad de KV primero
    const kvAvailable = await isKVAvailable();
    
    let uniqueId = '';
    let attempts = 0;
    
    do {
      uniqueId = generateUniqueId();
      attempts++;
      
      // Verificar si el ID ya existe
      let existing = null;
      if (kvAvailable) {
        try {
          existing = await kv.get(`form:${uniqueId}`);
        } catch (error) {
          console.log('⚠️ Error verificando ID en KV, usando memoria:', error);
          existing = memoryForms.get(uniqueId);
        }
      } else {
        existing = memoryForms.get(uniqueId);
      }
      
      if (!existing) break;
      
    } while (attempts < 10);
    
    if (attempts >= 10) {
      return NextResponse.json(
        { error: 'No se pudo generar un ID único' },
        { status: 500 }
      );
    }
    
    // Crear slug del DJ
    const djSlug = createDjSlug(djProfile.djName.trim());
    
    // Calcular fecha de expiración
    const createdAt = new Date();
    const expiresAt = new Date(createdAt);
    expiresAt.setMonth(expiresAt.getMonth() + expirationMonths);
    
    // Datos a almacenar
    const formData = {
      id: uniqueId,
      djProfile: djProfile,
      djSlug: djSlug,
      createdAt: createdAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      expirationMonths,
      requests: [] // Array para almacenar solicitudes de música
    };
    let storageMethod = 'memory';
    
    if (kvAvailable) {
      try {
        await kv.set(`form:${uniqueId}`, formData);
        storageMethod = 'vercel-kv';
        console.log(`Form ${uniqueId} saved to Vercel KV`);
      } catch (error) {
        console.error('Failed to save to KV, using memory fallback:', error);
        // Los datos ya están en formData, continuamos
      }
    } else {
       console.warn(`Form ${uniqueId} saved to memory storage (KV not available)`);
       // Guardar en memoria como fallback
       memoryForms.set(uniqueId, formData);
     }
    
    // Crear URL corta
    const baseUrl = request.nextUrl.origin;
    const shortUrl = `${baseUrl}/form/${uniqueId}`;
    
    // Generar código QR con configuración optimizada
    const qrCodeDataUrl = await QRCode.toDataURL(shortUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });
    
    return NextResponse.json({
      success: true,
      id: uniqueId,
      shortUrl,
      qrCodeUrl: qrCodeDataUrl,
      djSlug,
      expiresAt: expiresAt.toISOString(),
      storageMethod // Informar qué método de almacenamiento se usó
    });
    
  } catch (error) {
    console.error('Error creando formulario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET - Obtener formulario por ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID es requerido' },
        { status: 400 }
      );
    }
    
    // Intentar obtener datos del formulario desde KV primero
    let formData = null;
    const kvAvailable = await isKVAvailable();
    
    if (kvAvailable) {
      try {
        formData = await kv.get(`form:${id}`);
      } catch (error) {
        console.error('Error getting form from KV:', error);
      }
    }
    
    // Si no se encontró en KV, buscar en memoria
    if (!formData) {
      formData = memoryForms.get(id);
    }
    
    if (!formData) {
      return NextResponse.json(
        { error: 'Formulario no encontrado' },
        { status: 404 }
      );
    }
    
    // Verificar si ha expirado
    const now = new Date();
    const expiresAt = new Date((formData as any).expiresAt);
    
    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Este formulario ha expirado' },
        { status: 410 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: formData
    });
    
  } catch (error) {
    console.error('Error obteniendo formulario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Agregar solicitud de música
export async function PUT(request: NextRequest) {
  try {
    const { id, musicRequest } = await request.json();
    
    if (!id || !musicRequest) {
      return NextResponse.json(
        { error: 'ID y solicitud de música son requeridos' },
        { status: 400 }
      );
    }
    
    // Obtener datos del formulario con fallback
    let formData = null;
    const kvAvailable = await isKVAvailable();
    
    if (kvAvailable) {
      try {
        formData = await kv.get(`form:${id}`) as any;
      } catch (error) {
        console.error('Error getting form from KV for update:', error);
      }
    }
    
    // Si no se encontró en KV, buscar en memoria
    if (!formData) {
      formData = memoryForms.get(id);
    }
    
    if (!formData) {
      return NextResponse.json(
        { error: 'Formulario no encontrado' },
        { status: 404 }
      );
    }
    
    // Verificar si ha expirado
    const now = new Date();
    const expiresAt = new Date(formData.expiresAt);
    
    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Este formulario ha expirado' },
        { status: 410 }
      );
    }
    
    // Agregar solicitud con timestamp
    const newRequest = {
      ...musicRequest,
      id: generateUniqueId(),
      timestamp: new Date().toISOString(),
      status: 'pending' // pending, accepted, rejected
    };
    
    formData.requests = formData.requests || [];
    formData.requests.push(newRequest);
    
    // Actualizar en el almacenamiento disponible
    if (kvAvailable) {
      try {
        await kv.set(`form:${id}`, formData);
        console.log(`Form ${id} updated in Vercel KV`);
      } catch (error) {
        console.error('Error updating form in KV:', error);
        // Actualizar en memoria como fallback
        memoryForms.set(id, formData);
      }
    } else {
      // Actualizar en memoria
      memoryForms.set(id, formData);
      console.log(`Form ${id} updated in memory storage`);
    }
    
    return NextResponse.json({
      success: true,
      requestId: newRequest.id
    });
    
  } catch (error) {
    console.error('Error agregando solicitud:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}