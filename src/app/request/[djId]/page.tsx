'use client';

import { RequestForm } from '@/components/request/RequestForm';
import { DJProfile } from '@/lib/types';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Función para generar un perfil de DJ por defecto basado en el ID
function generateDefaultDjProfile(djId: string): DJProfile {
  // Extraer solo la parte del slug del DJ, eliminando el ID aleatorio si existe
  let cleanDjSlug = djId;
  
  // Detectar si el djId contiene un ID aleatorio al final (patrón: slug-randomId)
  // Los IDs aleatorios suelen ser largos y alfanuméricos
  const parts = djId.split('-');
  if (parts.length > 2) {
    const lastPart = parts[parts.length - 1];
    // Si la última parte es muy larga (más de 8 caracteres) y alfanumérica, probablemente es un ID aleatorio
    if (lastPart.length > 8 && /^[a-zA-Z0-9]+$/.test(lastPart)) {
      // Remover la última parte (ID aleatorio)
      cleanDjSlug = parts.slice(0, -1).join('-');
    }
  }
  
  // Convertir el slug limpio de vuelta a un nombre legible
  const djName = cleanDjSlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return {
    id: djId,
    djName: djName,
    bio: `¡Trayendo los mejores ritmos a tu noche. Escanea, solicita y que comience la fiesta!`,
    welcomeMessage: `¡Bienvenido a la cabina de ${djName}! ¿Qué quieres escuchar?`,
    profilePictureUrl: 'https://placehold.co/128x128.png',
    logoUrl: 'https://placehold.co/100x40.png',
    colors: {
      primary: '#7c3aed',
      background: '#121212',
      accent: '#a78bfa',
      text: '#ffffff',
    },
    theme: {
      mode: 'dark',
      fontSize: 16,
    fontFamily: 'inter',
    borderRadius: 8,
      animations: true,
    },
    payment: {
      minTip: 9,
      paypalEnabled: true,
      paypalEmail: 'dj@example.com',
      paypalMeLink: 'https://paypal.me/djexample',
      paypalQrUrl: '',
      yapeQrUrl: 'https://placehold.co/300x300.png',
      yapePhoneNumber: '+51 987 654 321',
      digitalWallets: [
        {
          name: 'Yape',
          account: '+51 987 654 321',
          qrCodeUrl: 'https://placehold.co/300x300.png'
        }
      ],
    },
    notifications: {
      whatsappNumber: '1234567890',
    },
  };
}

export default function RequestPage({ params, searchParams }: { params: Promise<{ djId: string }>, searchParams: Promise<{ preview?: string }> }) {
  const [djProfile, setDjProfile] = useState<DJProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [djId, setDjId] = useState<string>('');
  const [isPreview, setIsPreview] = useState(false);
  const [customization, setCustomization] = useState<any>(null);
  const router = useRouter();

  // Estado para partículas animadas
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, opacity: number, vx: number, vy: number, size: number, pulseSpeed: number}>>([]);

  // Cargar configuración de personalización desde localStorage
  useEffect(() => {
    if (djId) {
      // Crear slug del DJ para buscar la personalización específica
      const djSlug = djId
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      const savedCustomization = localStorage.getItem(`djFormCustomization_${djSlug}`);
      console.log(`🎨 Cargando personalización para ${djSlug} desde localStorage:`, savedCustomization);
      
      if (savedCustomization) {
        try {
          const parsed = JSON.parse(savedCustomization);
          console.log('✅ Personalización parseada:', parsed);
          setCustomization(parsed);
        } catch (error) {
          console.error('❌ Error parsing customization:', error);
        }
      } else {
        console.log(`⚠️ No se encontró personalización para ${djSlug} en localStorage`);
      }
    }
  }, [djId]);

  useEffect(() => {
    // Crear partículas de fondo
    const createParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 80; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
          y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
          opacity: Math.random() * 0.6 + 0.2,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2,
          size: Math.random() * 3 + 1,
          pulseSpeed: Math.random() * 0.02 + 0.01
        });
      }
      setParticles(newParticles);
    };
    
    if (typeof window !== 'undefined') {
      createParticles();
    }
    
    // Animar partículas independientemente
    const animateParticles = () => {
      setParticles(prev => prev.map(particle => {
        // Movimiento independiente sin seguir el mouse
        let newVx = particle.vx;
        let newVy = particle.vy;
        
        // Agregar un poco de variación aleatoria al movimiento
        newVx += (Math.random() - 0.5) * 0.02;
        newVy += (Math.random() - 0.5) * 0.02;
        
        // Aplicar fricción suave
        newVx *= 0.995;
        newVy *= 0.995;
        
        // Calcular nueva posición
        let newX = particle.x + newVx;
        let newY = particle.y + newVy;
        
        const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
        const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
        
        // Rebotar en los bordes suavemente
        if (newX < 0 || newX > windowWidth) {
          newVx *= -0.8;
          newX = Math.max(0, Math.min(windowWidth, newX));
        }
        if (newY < 0 || newY > windowHeight) {
          newVy *= -0.8;
          newY = Math.max(0, Math.min(windowHeight, newY));
        }
        
        return {
           ...particle,
           x: newX,
           y: newY,
           vx: newVx,
           vy: newVy,
           opacity: Math.sin(Date.now() * particle.pulseSpeed + particle.id) * 0.3 + 0.4
         };
      }));
    };
    
    const interval = setInterval(animateParticles, 16); // 60fps
    return () => clearInterval(interval);
  }, []);
  
  // Efecto para redimensionar partículas cuando cambia el tamaño de ventana
  useEffect(() => {
    const handleResize = () => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: Math.min(particle.x, window.innerWidth),
        y: Math.min(particle.y, window.innerHeight)
      })));
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Función para cargar el perfil del DJ desde la API
  const loadDjProfile = async (slug: string) => {
    try {
      const response = await fetch(`/api/dj-profile/${slug}`);
      
      if (!response.ok) {
        // Si no se encuentra el perfil, usar el perfil por defecto
        console.log('Perfil no encontrado en API, usando perfil por defecto');
        return generateDefaultDjProfile(slug);
      }
      
      const data = await response.json();
      
      if (data.success && data.djProfile) {
        console.log('✅ Perfil cargado desde API:', data.djProfile);
        return data.djProfile;
      } else {
        console.log('❌ Respuesta de API inválida, usando perfil por defecto');
        return generateDefaultDjProfile(slug);
      }
    } catch (error) {
      console.error('Error cargando perfil del DJ:', error);
      return generateDefaultDjProfile(slug);
    }
  };

  useEffect(() => {
    // Resolver params de forma asíncrona
    const loadParams = async () => {
      const resolvedParams = await params;
      const resolvedSearchParams = await searchParams;
      setDjId(resolvedParams.djId);
      setIsPreview(resolvedSearchParams.preview === 'true');
      
      // Cargar el perfil del DJ desde la API
      try {
        const profile = await loadDjProfile(resolvedParams.djId);
        setDjProfile(profile);
      } catch (error) {
        console.error('Error loading DJ profile:', error);
        setDjProfile(generateDefaultDjProfile(resolvedParams.djId));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadParams();
  }, [params, searchParams]);



  if (isLoading || !djProfile) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300"
        style={{
          backgroundColor: customization?.backgroundColor || '#000000',
          color: customization?.textColor || '#ffffff'
        }}
      >
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{
            borderColor: customization?.primaryColor || '#7c3aed'
          }}
        ></div>
        <p 
          className="mt-4 text-lg"
          style={{
            color: customization?.textColor || '#d1d5db'
          }}
        >
          Cargando perfil del DJ...
        </p>
      </div>
    );
  }
  
  // Create inline styles from DJ's color choices
  const pageStyle = {
    '--page-background': djProfile.colors.background,
    '--page-text': djProfile.colors.text,
    '--page-primary': djProfile.colors.primary,
    '--page-accent': djProfile.colors.accent,
  } as React.CSSProperties;

  return (
    <div 
      className="min-h-screen text-white relative overflow-hidden"
      style={{
        backgroundColor: customization?.backgroundColor || '#000000',
        color: customization?.textColor || '#ffffff'
      }}
    >
      {/* Fondo animado con partículas */}
      <div className="fixed inset-0 z-0">
        {/* Gradiente de fondo dinámico */}
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${customization?.backgroundColor || '#000000'} 0%, ${customization?.backgroundColor || '#000000'}90 30%, ${customization?.primaryColor || '#7c3aed'}15 70%, ${customization?.backgroundColor || '#000000'} 100%)`
          }}
        ></div>
        
        {/* Capa de animación de fondo */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at 20% 50%, ${customization?.primaryColor || '#7c3aed'}20 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${customization?.primaryColor || '#7c3aed'}15 0%, transparent 50%), radial-gradient(circle at 40% 80%, ${customization?.primaryColor || '#7c3aed'}10 0%, transparent 50%)`,
            animation: 'pulse 4s ease-in-out infinite alternate'
          }}
        ></div>
        
        {/* Partículas flotantes independientes */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              backgroundColor: customization?.primaryColor || '#a78bfa',
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              opacity: particle.opacity,
              transform: 'translate(-50%, -50%)',
              boxShadow: `0 0 ${particle.size * 2}px ${customization?.primaryColor || '#a78bfa'}60, 0 0 ${particle.size * 4}px ${customization?.primaryColor || '#a78bfa'}30`,
              filter: 'brightness(1.2)'
            }}
          />
        ))}
        
        {/* Efectos de gradiente estáticos de fondo */}
        <div
          className="absolute w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{
            background: `radial-gradient(circle, ${customization?.primaryColor || '#7c3aed'}40, transparent)`,
            left: '20%',
            top: '30%',
            animation: 'floatSoft 8s ease-in-out infinite'
          }}
        />
        <div
          className="absolute w-64 h-64 rounded-full blur-2xl pointer-events-none opacity-15"
          style={{
            background: `radial-gradient(circle, ${customization?.primaryColor || '#7c3aed'}50, transparent)`,
            right: '15%',
            bottom: '25%',
            animation: 'floatGentle 10s ease-in-out infinite reverse'
          }}
        />
      </div>

      <div className="flex flex-col items-center p-4 md:p-8 relative z-10">
        <header className="w-full max-w-2xl mb-8">
            <div className="text-center py-12">
              {/* Enhanced Profile Picture with modern design */}
              <div className="relative mb-12 group">
                <div className="relative w-40 h-40 mx-auto">
                  {/* Animated background rings */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-spin opacity-60 blur-md group-hover:opacity-80 transition-opacity duration-500"></div>
                  <div className="absolute inset-2 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 animate-spin-reverse opacity-40 blur-sm group-hover:opacity-60 transition-opacity duration-500" style={{animationDuration: '8s'}}></div>
                  
                  {/* Main avatar container with enhanced styling */}
                  <Avatar className="relative w-full h-full border-4 border-white/30 shadow-2xl transition-all duration-700 hover:scale-110 hover:shadow-cyan-500/50 hover:border-white/50 backdrop-blur-sm">
                        <AvatarImage 
                          src={djProfile.profilePictureUrl} 
                          alt={djProfile.djName} 
                          className="object-cover transition-all duration-700 hover:brightness-110 hover:contrast-110"
                        />
                        <AvatarFallback 
                          className="text-5xl font-bold transition-all duration-700 hover:scale-110 bg-gradient-to-br from-purple-600 to-pink-600" 
                          style={{ 
                            background: `linear-gradient(135deg, ${customization?.primaryColor || djProfile.colors.primary}, ${customization?.primaryColor || djProfile.colors.primary}dd)`,
                            color: customization?.textColor || djProfile.colors.text 
                          }}
                        >
                          {djProfile.djName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                   </Avatar>
                  
                  {/* Floating particles effect */}
                  <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg animate-ping"></div>
                  <div className="absolute top-1/4 right-1/4 w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
                  <div className="absolute bottom-1/4 left-1/4 w-1 h-1 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '2s'}}></div>
                </div>
              </div>

              {/* DJ Name with friendly modern typography */}
              <div className="text-center space-y-6">
                <h1 
                   className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight transition-all duration-700 hover:scale-105 bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-2xl" 
                   style={{ 
                     fontFamily: '"Poppins", "Inter", "Segoe UI", system-ui, sans-serif',
                     fontSize: `clamp(2.5rem, ${(customization?.fontSize || 16) * 3}px, 4.5rem)`,
                     textShadow: '0 0 60px rgba(168, 85, 247, 0.8), 0 0 100px rgba(236, 72, 153, 0.4)',
                     letterSpacing: '-0.02em',
                     lineHeight: '1.1'
                   }}
                 >
                    {djProfile.djName}
                </h1>
                
                {/* Enhanced animated underline with glow */}
                <div className="relative mx-auto w-24 h-1.5">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full blur-sm opacity-75"></div>
                  <div className="relative w-full h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full transition-all duration-500 hover:scale-x-150"></div>
                </div>
                
                {/* Welcome message with friendly typography */}
                <p 
                   className="mt-8 text-xl md:text-2xl font-medium transition-all duration-700 hover:scale-105 opacity-90 hover:opacity-100 max-w-lg mx-auto leading-relaxed text-shadow-lg"
                   style={{
                     color: customization?.textColor || '#f1f5f9',
                     fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                     fontSize: `clamp(1.1rem, ${(customization?.fontSize || 16) * 1.3}px, 1.5rem)`,
                     textShadow: '0 4px 20px rgba(0, 0, 0, 0.6), 0 0 40px rgba(168, 85, 247, 0.3)',
                     letterSpacing: '0.01em',
                     fontWeight: '500'
                   }}
                 >
                    {djProfile.welcomeMessage}
                </p>
                
                {/* Enhanced decorative elements with music theme */}
                <div className="flex justify-center items-center space-x-4 mt-8">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50" style={{animationDelay: '0ms'}}></div>
                  <div className="w-2 h-6 bg-purple-500 rounded-full animate-bounce shadow-lg shadow-purple-500/50" style={{animationDelay: '200ms'}}></div>
                  <div className="w-4 h-4 bg-pink-400 rounded-full animate-pulse shadow-lg shadow-pink-400/50" style={{animationDelay: '400ms'}}></div>
                  <div className="w-2 h-5 bg-cyan-300 rounded-full animate-bounce shadow-lg shadow-cyan-300/50" style={{animationDelay: '600ms'}}></div>
                  <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse shadow-lg shadow-purple-400/50" style={{animationDelay: '800ms'}}></div>
                </div>
              </div>
            </div>
        </header>

        <main className="w-full max-w-2xl">
            <RequestForm djProfile={djProfile} isPreview={isPreview} customization={customization} />
        </main>
      </div>
    </div>
  );
}