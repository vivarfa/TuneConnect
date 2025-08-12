// Simulamos una base de datos usando localStorage cuando está disponible
// En producción, esto debería ser una base de datos real

// Función para verificar si estamos en el cliente
function isClient() {
  return typeof window !== 'undefined';
}

// Función para obtener datos del localStorage
function getFromStorage(key: string) {
  if (!isClient()) return null;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

// Función para guardar datos en localStorage
function saveToStorage(key: string, data: any) {
  if (!isClient()) return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Silenciar errores de localStorage
  }
}

// Fallback en memoria para el servidor
export const uniqueCodes = new Map<string, { 
  djName: string, 
  djSlug: string, 
  djProfile: any, 
  createdAt: Date 
}>();

export const djProfiles = new Map<string, any>();

// Función para obtener un código específico
export function getCodeData(code: string) {
  const upperCode = code.toUpperCase();
  
  // Intentar obtener del localStorage primero
  if (isClient()) {
    const storedCodes = getFromStorage('uniqueCodes') || {};
    if (storedCodes[upperCode]) {
      return {
        ...storedCodes[upperCode],
        createdAt: new Date(storedCodes[upperCode].createdAt)
      };
    }
  }
  
  // Fallback a memoria
  return uniqueCodes.get(upperCode);
}

// Función para almacenar un nuevo código
export function setCodeData(code: string, data: { djName: string, djSlug: string, djProfile: any, createdAt: Date }) {
  const upperCode = code.toUpperCase();
  
  // Guardar en localStorage si está disponible
  if (isClient()) {
    const storedCodes = getFromStorage('uniqueCodes') || {};
    storedCodes[upperCode] = data;
    saveToStorage('uniqueCodes', storedCodes);
  }
  
  // También guardar en memoria como fallback
  uniqueCodes.set(upperCode, data);
}

// Función para buscar perfil por slug
export function getDjProfileBySlug(slug: string) {
  // Primero buscar en perfiles guardados directamente
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
export function saveDjProfile(slug: string, profile: any) {
  // Guardar en localStorage si está disponible
  if (isClient()) {
    const storedProfiles = getFromStorage('djProfiles') || {};
    storedProfiles[slug] = profile;
    saveToStorage('djProfiles', storedProfiles);
  }
  
  // También guardar en memoria como fallback
  djProfiles.set(slug, profile);
}

// Función para obtener todos los perfiles de DJ
export function getAllDjProfiles() {
  const allProfiles = new Map();
  
  // Obtener de localStorage si está disponible
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
export function codeExists(code: string): boolean {
  const upperCode = code.toUpperCase();
  
  // Verificar en localStorage si está disponible
  if (isClient()) {
    const storedCodes = getFromStorage('uniqueCodes') || {};
    return upperCode in storedCodes;
  }
  
  // Fallback a memoria
  return uniqueCodes.has(upperCode);
}