// Simulamos una base de datos en memoria para códigos únicos
// En producción, esto debería ser una base de datos real
export const uniqueCodes = new Map<string, { 
  djName: string, 
  djSlug: string, 
  djProfile: any, 
  createdAt: Date 
}>();

// Simulamos una base de datos en memoria para perfiles de DJ guardados
export const djProfiles = new Map<string, any>();

// Función para obtener un código específico
export function getCodeData(code: string) {
  return uniqueCodes.get(code.toUpperCase());
}

// Función para almacenar un nuevo código
export function setCodeData(code: string, data: { djName: string, djSlug: string, djProfile: any, createdAt: Date }) {
  uniqueCodes.set(code.toUpperCase(), data);
}

// Función para buscar perfil por slug
export function getDjProfileBySlug(slug: string) {
  // Primero buscar en perfiles guardados directamente
  if (djProfiles.has(slug)) {
    return djProfiles.get(slug);
  }
  
  // Luego buscar en códigos únicos generados
  for (const [code, data] of uniqueCodes.entries()) {
    if (data.djSlug === slug) {
      return data.djProfile;
    }
  }
  return null;
}

// Función para guardar un perfil de DJ
export function saveDjProfile(slug: string, profile: any) {
  djProfiles.set(slug, profile);
}

// Función para obtener todos los perfiles guardados
export function getAllDjProfiles() {
  return Array.from(djProfiles.entries()).map(([slug, profile]) => ({
    slug,
    profile
  }));
}

// Función para verificar si un código existe
export function codeExists(code: string): boolean {
  return uniqueCodes.has(code.toUpperCase());
}