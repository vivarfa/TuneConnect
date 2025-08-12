// Base de datos usando Vercel KV para producción y localStorage para desarrollo
// En producción, esto usa Vercel KV para persistencia real

import { kv } from '@vercel/kv';

// Función para verificar si estamos en el cliente
function isClient() {
  return typeof window !== 'undefined';
}

// Función para verificar si estamos en producción (Vercel)
function isProduction() {
  return process.env.NODE_ENV === 'production' && process.env.VERCEL;
}

// Función para obtener datos del localStorage (desarrollo)
function getFromStorage(key: string) {
  if (!isClient()) return null;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

// Función para guardar datos en localStorage (desarrollo)
function saveToStorage(key: string, data: any) {
  if (!isClient()) return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Silenciar errores de localStorage
  }
}

// Fallback en memoria para el servidor de desarrollo
export const uniqueCodes = new Map<string, any>();

export const djProfiles = new Map<string, any>();

// Función para obtener un código específico
export async function getCodeData(code: string) {
  const upperCode = code.toUpperCase();
  
  // En producción, usar Vercel KV
  if (isProduction()) {
    try {
      const data = await kv.get(`code:${upperCode}`);
      if (data) {
        const codeData = {
          ...data,
          createdAt: new Date((data as any).createdAt),
          expiresAt: (data as any).expiresAt ? new Date((data as any).expiresAt) : undefined
        };
        
        // Verificar si el código ha expirado
        if (codeData.expiresAt && new Date() > codeData.expiresAt) {
          // Código expirado, eliminarlo automáticamente
          await kv.del(`code:${upperCode}`);
          return null;
        }
        
        return codeData;
      }
    } catch (error) {
      console.error('Error getting code from KV:', error);
    }
    return null;
  }
  
  // En desarrollo, intentar obtener del localStorage primero
  if (isClient()) {
    const storedCodes = getFromStorage('uniqueCodes') || {};
    if (storedCodes[upperCode]) {
      const codeData = {
        ...storedCodes[upperCode],
        createdAt: new Date(storedCodes[upperCode].createdAt),
        expiresAt: storedCodes[upperCode].expiresAt ? new Date(storedCodes[upperCode].expiresAt) : undefined
      };
      
      // Verificar si el código ha expirado
      if (codeData.expiresAt && new Date() > codeData.expiresAt) {
        // Código expirado, eliminarlo del localStorage
        delete storedCodes[upperCode];
        saveToStorage('uniqueCodes', storedCodes);
        return null;
      }
      
      return codeData;
    }
  }
  
  // Fallback a memoria
  const memoryData = uniqueCodes.get(upperCode);
  if (memoryData) {
    // Verificar si el código ha expirado
    if (memoryData.expiresAt && new Date() > memoryData.expiresAt) {
      // Código expirado, eliminarlo de memoria
      uniqueCodes.delete(upperCode);
      return null;
    }
  }
  
  return memoryData;
}

// Función para verificar si Vercel KV está disponible
export async function isKVAvailable(): Promise<boolean> {
  if (!isProduction()) return false;
  
  try {
    // Intentar una operación simple para verificar KV
    await kv.set('health-check', 'ok');
    await kv.del('health-check');
    return true;
  } catch (error) {
    console.warn('Vercel KV not available:', error);
    return false;
  }
}

// Función para almacenar un nuevo código
export async function setCodeData(code: string, data: any) {
  const upperCode = code.toUpperCase();
  
  // En producción, intentar usar Vercel KV primero
  if (isProduction()) {
    try {
      await kv.set(`code:${upperCode}`, data);
      console.log(`Code ${upperCode} saved to Vercel KV successfully`);
      return;
    } catch (error) {
      console.error('Error setting code in KV:', error);
      console.warn('Falling back to memory storage for code:', upperCode);
      // Continuar con fallback en lugar de lanzar error
    }
  }
  
  // En desarrollo, guardar en localStorage si está disponible
  if (isClient()) {
    const storedCodes = getFromStorage('uniqueCodes') || {};
    storedCodes[upperCode] = data;
    saveToStorage('uniqueCodes', storedCodes);
  }
  
  // También guardar en memoria como fallback
  uniqueCodes.set(upperCode, data);
  console.log(`Code ${upperCode} saved to memory storage`);
}

// Función para buscar perfil por slug
export async function getDjProfileBySlug(slug: string) {
  // En producción, usar Vercel KV
  if (isProduction()) {
    try {
      // Buscar en perfiles guardados directamente
      const profile = await kv.get(`profile:${slug}`);
      if (profile) {
        return profile;
      }
      
      // Buscar en códigos únicos generados
      const keys = await kv.keys('code:*');
      for (const key of keys) {
        const data = await kv.get(key);
        if (data && (data as any).djSlug === slug) {
          return (data as any).djProfile;
        }
      }
    } catch (error) {
      console.error('Error getting DJ profile from KV:', error);
    }
    return null;
  }
  
  // En desarrollo, buscar en localStorage
  if (isClient()) {
    const storedProfiles = getFromStorage('djProfiles') || {};
    if (storedProfiles[slug]) {
      return storedProfiles[slug];
    }
    
    // Luego buscar en códigos únicos generados
    const storedCodes = getFromStorage('uniqueCodes') || {};
    for (const [code, data] of Object.entries(storedCodes)) {
      if ((data as any).djSlug === slug) {
        return (data as any).djProfile;
      }
    }
  }
  
  // Fallback a memoria
  if (djProfiles.has(slug)) {
    return djProfiles.get(slug);
  }
  
  for (const [code, data] of uniqueCodes.entries()) {
    if (data.djSlug === slug) {
      return data.djProfile;
    }
  }
  return null;
}

// Función para guardar un perfil de DJ
export async function saveDjProfile(slug: string, profile: any) {
  // En producción, usar Vercel KV
  if (isProduction()) {
    try {
      await kv.set(`profile:${slug}`, profile);
      return;
    } catch (error) {
      console.error('Error saving DJ profile to KV:', error);
      // Si KV falla en producción, lanzar el error para que la API lo maneje
      throw new Error('Failed to save profile: Vercel KV not configured. Please set up KV database in Vercel dashboard.');
    }
  }
  
  // En desarrollo, guardar en localStorage si está disponible
  if (isClient()) {
    const storedProfiles = getFromStorage('djProfiles') || {};
    storedProfiles[slug] = profile;
    saveToStorage('djProfiles', storedProfiles);
  }
  
  // También guardar en memoria como fallback
  djProfiles.set(slug, profile);
}

// Función para obtener todos los perfiles de DJ
export async function getAllDjProfiles() {
  const allProfiles = new Map();
  
  // En producción, usar Vercel KV
  if (isProduction()) {
    try {
      // Obtener perfiles guardados directamente
      const profileKeys = await kv.keys('profile:*');
      for (const key of profileKeys) {
        const slug = key.replace('profile:', '');
        const profile = await kv.get(key);
        if (profile) {
          allProfiles.set(slug, profile);
        }
      }
      
      // Obtener perfiles de códigos únicos
      const codeKeys = await kv.keys('code:*');
      for (const key of codeKeys) {
        const data = await kv.get(key);
        if (data && !allProfiles.has((data as any).djSlug)) {
          allProfiles.set((data as any).djSlug, (data as any).djProfile);
        }
      }
    } catch (error) {
      console.error('Error getting all DJ profiles from KV:', error);
    }
    return allProfiles;
  }
  
  // En desarrollo, obtener de localStorage
  if (isClient()) {
    const storedProfiles = getFromStorage('djProfiles') || {};
    const storedCodes = getFromStorage('uniqueCodes') || {};
    
    // Agregar perfiles guardados directamente
    for (const [slug, profile] of Object.entries(storedProfiles)) {
      allProfiles.set(slug, profile);
    }
    
    // Agregar perfiles de códigos únicos
    for (const [code, data] of Object.entries(storedCodes)) {
      const codeData = data as any;
      if (!allProfiles.has(codeData.djSlug)) {
        allProfiles.set(codeData.djSlug, codeData.djProfile);
      }
    }
  } else {
    // Fallback a memoria
    // Agregar perfiles guardados directamente
    for (const [slug, profile] of djProfiles.entries()) {
      allProfiles.set(slug, profile);
    }
    
    // Agregar perfiles de códigos únicos
    for (const [code, data] of uniqueCodes.entries()) {
      if (!allProfiles.has(data.djSlug)) {
        allProfiles.set(data.djSlug, data.djProfile);
      }
    }
  }
  
  return allProfiles;
}

// Función para verificar si un código existe
export async function codeExists(code: string): Promise<boolean> {
  const upperCode = code.toUpperCase();
  
  // En producción, usar Vercel KV
  if (isProduction()) {
    try {
      const exists = await kv.exists(`code:${upperCode}`);
      return exists === 1;
    } catch (error) {
      console.error('Error checking code existence in KV:', error);
      return false;
    }
  }
  
  // En desarrollo, verificar en localStorage
  if (isClient()) {
    const storedCodes = getFromStorage('uniqueCodes') || {};
    return upperCode in storedCodes;
  }
  
  // Fallback a memoria
  return uniqueCodes.has(upperCode);
}

// Función para purgar códigos expirados (útil para mantenimiento)
export async function purgeExpiredCodes(): Promise<{ deleted: number, errors: string[] }> {
  let deletedCount = 0;
  const errors: string[] = [];
  
  // En producción, usar Vercel KV
  if (isProduction()) {
    try {
      const keys = await kv.keys('code:*');
      const now = new Date();
      
      for (const key of keys) {
        try {
          const data = await kv.get(key);
          if (data && (data as any).expiresAt) {
            const expiresAt = new Date((data as any).expiresAt);
            if (now > expiresAt) {
              await kv.del(key);
              deletedCount++;
            }
          }
        } catch (error) {
          errors.push(`Error processing ${key}: ${error}`);
        }
      }
    } catch (error) {
      errors.push(`Error accessing KV: ${error}`);
    }
  }
  
  // En desarrollo, limpiar localStorage
  if (isClient()) {
    const storedCodes = getFromStorage('uniqueCodes') || {};
    const now = new Date();
    let localDeleted = 0;
    
    for (const [code, data] of Object.entries(storedCodes)) {
      if ((data as any).expiresAt) {
        const expiresAt = new Date((data as any).expiresAt);
        if (now > expiresAt) {
          delete storedCodes[code];
          localDeleted++;
        }
      }
    }
    
    if (localDeleted > 0) {
      saveToStorage('uniqueCodes', storedCodes);
      deletedCount += localDeleted;
    }
  }
  
  // Limpiar memoria
  const now = new Date();
  let memoryDeleted = 0;
  
  for (const [code, data] of uniqueCodes.entries()) {
    if (data.expiresAt && now > data.expiresAt) {
      uniqueCodes.delete(code);
      memoryDeleted++;
    }
  }
  
  deletedCount += memoryDeleted;
  
  return { deleted: deletedCount, errors };
}