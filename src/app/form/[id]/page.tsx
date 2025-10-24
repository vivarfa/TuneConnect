'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Music, Send, User, CreditCard, Clock, CheckCircle, AlertCircle, Loader2, ArrowLeft, ArrowRight, Upload, MessageCircle, DollarSign, Camera } from 'lucide-react';
import { DJProfile } from '@/lib/types';

interface FormData {
  id: string;
  djProfile: DJProfile;
  djSlug: string;
  createdAt: string;
  expiresAt: string;
  expirationMonths: number;
  requests: any[];
}

interface MusicRequest {
  songName: string;
  artistName: string;
  genre: string;
  requesterName: string;
  selectedWallet: string;
  paymentAmount: string;
  paymentProof?: string;
  message?: string;
}

const musicGenres = [
  'Reggaeton', 'Salsa', 'Bachata', 'Merengue', 'Pop', 'Rock', 'Hip Hop',
  'Electronic', 'House', 'Techno', 'Cumbia', 'Vallenato', 'Rock en Español',
  'Pop Latino', 'Trap', 'R&B', 'Jazz', 'Blues', 'Country', 'Otro'
];

// Configuración de monedas por país
const digitalWalletsByCountry = {
  "Perú": {
    currency: "Sol (S/)",
    symbol: "S/",
    wallets: ["Yape", "Plin", "Tunki", "Ligo", "Agora PAY"]
  },
  "Brasil": {
    currency: "Real Brasileño (R$)",
    symbol: "R$",
    wallets: ["Pix", "PicPay", "Mercado Pago"]
  },
  "Colombia": {
    currency: "Peso Colombiano ($)",
    symbol: "$",
    wallets: ["Nequi", "DaviPlata", "RappiPay"]
  },
  "Argentina": {
    currency: "Peso Argentino ($)",
    symbol: "$",
    wallets: ["Mercado Pago", "MODO", "Ualá", "Naranja X"]
  },
  "México": {
    currency: "Peso Mexicano ($)",
    symbol: "$",
    wallets: ["CoDi", "Dimo", "Mercado Pago"]
  },
  "Estados Unidos": {
    currency: "Dólar Estadounidense ($ / USD)",
    symbol: "$",
    wallets: ["Venmo", "Zelle", "Cash App", "Apple Pay", "Google Pay"]
  }
};

export default function DynamicFormPage() {
  const params = useParams();
  const formId = params.id as string;
  
  const [formData, setFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [customization, setCustomization] = useState<any>(null);
  
  const [musicRequest, setMusicRequest] = useState<MusicRequest>({
    songName: '',
    artistName: '',
    genre: '',
    requesterName: '',
    selectedWallet: '',
    paymentAmount: '',
    paymentProof: '',
    message: ''
  });

  const totalSteps = 4;
  const stepTitles = [
    'Información de la Canción',
    'Método de Pago',
    'Comprobante de Pago',
    'Enviar por WhatsApp'
  ];

  // Cargar datos del formulario
  useEffect(() => {
    const loadFormData = async () => {
      try {
        const response = await fetch(`/api/forms?id=${formId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Formulario no encontrado');
        }
        
        const result = await response.json();
        setFormData(result.data);
        
        // Cargar personalización desde localStorage
        if (result.data?.djSlug) {
          const savedCustomization = localStorage.getItem(`djFormCustomization_${result.data.djSlug}`);
          console.log(`🎨 Cargando personalización para ${result.data.djSlug}:`, savedCustomization);
          
          if (savedCustomization) {
            try {
              const parsed = JSON.parse(savedCustomization);
              console.log('✅ Personalización parseada:', parsed);
              setCustomization(parsed);
            } catch (error) {
              console.error('❌ Error parsing customization:', error);
            }
          } else {
            console.log(`⚠️ No se encontró personalización para ${result.data.djSlug}`);
          }
        }
        
      } catch (error) {
        console.error('Error cargando formulario:', error);
        setError(error instanceof Error ? error.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    if (formId) {
      loadFormData();
    }
  }, [formId]);

  const handleInputChange = (field: keyof MusicRequest, value: string) => {
    setMusicRequest(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploadingProof(true);
    setError('');
    
    try {
      // Generar nombre único para el archivo
      const timestamp = Date.now();
      const filename = `${timestamp}-${file.name}`;
      
      // Enviar archivo directamente como binary data con filename en URL
      const response = await fetch(`/api/upload?filename=${encodeURIComponent(filename)}`, {
        method: 'POST',
        body: file
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error subiendo archivo');
      }
      
      const result = await response.json();
      handleInputChange('paymentProof', result.url);
      
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      setError(error instanceof Error ? error.message : 'Error subiendo el comprobante. Inténtalo de nuevo.');
    } finally {
      setUploadingProof(false);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(musicRequest.songName.trim() && musicRequest.artistName.trim() && 
                 musicRequest.genre && musicRequest.requesterName.trim());
      case 2:
        return !!musicRequest.selectedWallet; // Solo requiere método de pago seleccionado
      case 3:
        return !!musicRequest.paymentProof; // El paso 3 requiere el comprobante
      case 4:
        return true; // El paso 4 es para enviar por WhatsApp
      default:
        return false;
    }
  };

  const sendWhatsAppMessage = () => {
    if (!formData) return;
    
    const djProfile = formData.djProfile;
    const whatsappNumber = djProfile.notifications?.whatsappNumber?.replace(/[^0-9]/g, '');
    
    if (!whatsappNumber) {
      setError('No se encontró número de WhatsApp del DJ');
      return;
    }
    
    const message = `🎵 *Nueva Solicitud de Música*\n\n` +
      `*Canción:* ${musicRequest.songName}\n` +
      `*Artista:* ${musicRequest.artistName}\n` +
      `*Género:* ${musicRequest.genre}\n` +
      `*Solicitado por:* ${musicRequest.requesterName}\n` +
      `*Método de pago:* ${musicRequest.selectedWallet}\n` +
      `*Monto:* $${musicRequest.paymentAmount}\n` +
      (musicRequest.message ? `*Mensaje:* ${musicRequest.message}\n` : '') +
      (musicRequest.paymentProof ? `*Comprobante:* ${musicRequest.paymentProof}\n` : '') +
      `\n¡Gracias por usar TuneConnect! 🎶`;
    
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData) return;
    
    // Validaciones completas
    if (!musicRequest.songName.trim() || !musicRequest.artistName.trim() || 
        !musicRequest.requesterName.trim() || !musicRequest.genre || 
        !musicRequest.selectedWallet || !musicRequest.paymentAmount.trim()) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    setSubmitting(true);
    setError('');
    
    try {
      const response = await fetch('/api/forms', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: formId,
          musicRequest
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error enviando solicitud');
      }

      // Enviar mensaje por WhatsApp
      sendWhatsAppMessage();
      setSubmitted(true);
      
    } catch (error) {
      console.error('Error enviando solicitud:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Cargando formulario...</p>
        </div>
      </div>
    );
  }

  if (error && !formData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Formulario no disponible</h2>
            <p className="text-gray-700 mb-4">{error}</p>
            <p className="text-sm text-gray-600">
              Este formulario puede haber expirado o no existir.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!formData) return null;

  const djProfile = formData.djProfile;
  const isDarkMode = djProfile.theme?.mode === 'dark';
  
  // Aplicar colores del tema del DJ o personalización guardada
  const themeColors = customization ? {
    primary: customization.primaryColor || '#7c3aed',
    background: customization.backgroundColor || '#121212',
    accent: djProfile.colors?.accent || '#a78bfa',
    text: customization.textColor || '#ffffff'
  } : {
    primary: djProfile.colors?.primary || '#7c3aed',
    background: djProfile.colors?.background || '#121212',
    accent: djProfile.colors?.accent || '#a78bfa',
    text: djProfile.colors?.text || '#ffffff'
  };

  // Utilidades simples para contraste basado en el color de fondo del input
  const parseColorToRGB = (color?: string) => {
    if (!color) return null;
    const c = color.trim();
    if (c.startsWith('#')) {
      let hex = c.slice(1);
      if (hex.length === 3) hex = hex.split('').map(ch => ch + ch).join('');
      const int = parseInt(hex, 16);
      return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
    }
    const rgbMatch = c.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
    if (rgbMatch) {
      return { r: parseInt(rgbMatch[1]), g: parseInt(rgbMatch[2]), b: parseInt(rgbMatch[3]) };
    }
    return null;
  };
  const isColorLight = (color?: string) => {
    const rgb = parseColorToRGB(color);
    if (!rgb) return false;
    const luminance = 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b; // 0-255
    return luminance > 186; // umbral típico para claro
  };
  // Fondo efectivo del input: usa personalización si existe, de lo contrario un valor seguro por tema
  const effectiveInputBg = customization?.inputBackgroundColor ?? (isDarkMode ? '#374151' : '#ffffff');
  const inputBgIsLight = isColorLight(effectiveInputBg);
  const inputTextClass = inputBgIsLight ? 'text-gray-900' : 'text-white';
  const placeholderTextClass = inputBgIsLight ? 'placeholder:text-gray-600' : 'placeholder:text-gray-300';
  const getContrastingText = (bg?: string) => (isColorLight(bg) ? '#111827' : '#ffffff');

  // Obtener el símbolo de moneda correcto
  const selectedCountryData = digitalWalletsByCountry[djProfile.payment?.country as keyof typeof digitalWalletsByCountry || 'Perú'];
  const currencySymbol = djProfile.payment?.customCurrencySymbol || selectedCountryData?.symbol || '$';

  if (submitted) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: themeColors.background }}
      >
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#ffffff' }}>
              ¡Solicitud enviada!
            </h2>
            <p className="text-gray-700 mb-4">
              Tu solicitud de música ha sido enviada a {djProfile.djName}.
            </p>
            <p className="text-sm text-gray-600">
              El DJ revisará tu solicitud y la reproducirá cuando sea posible.
            </p>
            <Button 
              onClick={() => {
                setSubmitted(false);
                setCurrentStep(1);
                setMusicRequest({
                  songName: '',
                  artistName: '',
                  genre: '',
                  requesterName: '',
                  selectedWallet: '',
                  paymentAmount: '',
                  paymentProof: '',
                  message: ''
                });
              }}
              className="mt-4"
              style={{ backgroundColor: themeColors.primary }}
            >
              Enviar otra solicitud
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-2 sm:p-4 lg:p-6 relative overflow-hidden"
      style={{ 
        backgroundColor: themeColors.background,
        fontFamily: customization?.fontFamily,
        fontSize: customization ? `${customization.fontSize}px` : undefined
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
        e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
      }}
    >
      {/* Fondo interactivo con partículas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="particles-container">
          {[...Array(80)].map((_, i) => {
            const size = Math.random() * 3 + 1; // Tamaños variados entre 1-4px
            const opacity = Math.random() * 0.4 + 0.1; // Opacidad entre 0.1-0.5
            return (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  backgroundColor: themeColors.primary,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: opacity,
                  animationDelay: `${Math.random() * 20}s`,
                  animationDuration: `${15 + Math.random() * 15}s`,
                  boxShadow: `0 0 ${size * 2}px ${themeColors.primary}40`
                }}
              />
            );
          })}
        </div>
      </div>
      
      {/* Efecto de iluminación del mouse */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-500 ease-out"
        style={{
          background: `radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${themeColors.primary}25, ${themeColors.primary}10 30%, transparent 60%)`
        }}
      />
      
      {/* Segundo efecto de brillo más sutil */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-700 ease-out"
        style={{
          background: `radial-gradient(1200px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${themeColors.primary}08, transparent 50%)`
        }}
      />
      
      <div className="max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl mx-auto relative z-10">
        {/* Header del DJ */}
        <Card 
          className={`mb-4 sm:mb-6 card-hover animate-slide-in transform transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] ${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/10 backdrop-blur-md border-white/20'}`}
          style={customization ? {
            borderRadius: `${customization.borderRadius}px`
          } : {}}
        >
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-4 text-center sm:text-left">
              <Avatar className="w-12 h-12 sm:w-16 sm:h-16 transform transition-transform duration-300 hover:scale-110">
                <AvatarImage src={djProfile.profilePictureUrl} alt={djProfile.djName} />
                <AvatarFallback>
                  <User className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold transition-all duration-300 hover:scale-105" style={{ color: '#ffffff' }}>
                  {djProfile.djName}
                </h1>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{djProfile.bio}</p>
              </div>
            </div>
            
            {djProfile.welcomeMessage && (
              <div 
                className="p-4 rounded-lg mb-4"
                style={{ backgroundColor: `${themeColors.primary}20`, borderLeft: `4px solid ${themeColors.primary}` }}
              >
                <p style={{ color: '#ffffff' }}>{djProfile.welcomeMessage}</p>
              </div>
            )}
            
            <div className="flex flex-wrap gap-1 sm:gap-2 justify-center sm:justify-start">
              <Badge variant="secondary">
                <Music className="w-3 h-3 mr-1" /> Solicitudes abiertas
              </Badge>
              <Badge variant="outline" style={{ color: '#ffffff' }}>
                <Clock className="w-3 h-3 mr-1" /> 
                Expira: {new Date(formData.expiresAt).toLocaleDateString('es-ES')}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Formulario de solicitud con pasos */}
        <Card 
          className={`card-hover animate-slide-in transform transition-all duration-500 hover:shadow-2xl hover:scale-[1.01] ${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/10 backdrop-blur-md border-white/20'} overflow-hidden`}
          style={customization ? {
            borderRadius: `${customization.borderRadius}px`
          } : {}}
        >
          {/* Header con progreso */}
          <div className="relative">
            <div 
              className="h-2 transition-all duration-500 ease-out"
              style={{ 
                background: `linear-gradient(to right, ${themeColors.primary} ${(currentStep / totalSteps) * 100}%, ${isDarkMode ? '#374151' : '#e5e7eb'} ${(currentStep / totalSteps) * 100}%)` 
              }}
            />
            <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-3 sm:gap-0 text-center sm:text-left">
                <div>
                  <CardTitle className={`flex items-center justify-center sm:justify-start gap-2 text-lg sm:text-xl ${isDarkMode ? 'text-white' : 'text-white'}`}>
                    {currentStep === 1 && <Music className="w-5 h-5" />}
                    {currentStep === 2 && <DollarSign className="w-5 h-5" />}
                    {currentStep === 3 && <Upload className="w-5 h-5" />}
                    {currentStep === 4 && <MessageCircle className="w-5 h-5" />}
                    {stepTitles[currentStep - 1]}
                  </CardTitle>
                  <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-200'}>
                    Paso {currentStep} de {totalSteps}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-white'}`}>
                    {Math.round((currentStep / totalSteps) * 100)}%
                  </div>
                  <div className={`text-xs ${isDarkMode ? 'text-white' : 'text-white'}`}>
                    Completado
                  </div>
                </div>
              </div>
            </CardHeader>
          </div>
          
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6" style={{ color: '#ffffff' }}>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Paso 1: Información de la canción */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right-5 duration-300">
                  <div className="text-center mb-4 sm:mb-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full flex items-center justify-center transform transition-all duration-300 hover:scale-110 hover:rotate-12" style={{ backgroundColor: `${themeColors.primary}20` }}>
                      <Music className="w-8 h-8" style={{ color: themeColors.primary }} />
                    </div>
                    <h3 className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-white'} transition-all duration-300 hover:scale-105`}>
                      ¿Qué canción quieres escuchar?
                    </h3>
                    <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-200'}`}>
                      Completa la información de tu canción favorita
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2 transform transition-all duration-300 hover:scale-105">
                      <Label className={`font-medium ${isDarkMode ? 'text-white' : 'text-white'} transition-colors duration-200`}>Nombre de la canción *</Label>
                      <Input
                        value={musicRequest.songName}
                        onChange={(e) => handleInputChange('songName', e.target.value)}
                        placeholder="Ej: Blinding Lights"
                        className="h-10 sm:h-12 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] focus:scale-[1.02] focus:shadow-xl placeholder:text-gray-600"
                        style={{
                          backgroundColor: '#ffffff',
                          color: '#000000',
                          borderColor: customization?.inputBorderColor || (isDarkMode ? '#4b5563' : '#d1d5db'),
                          borderRadius: customization ? `${customization.borderRadius}px` : '0.5rem',
                          fontSize: customization ? `${customization.fontSize}px` : undefined
                        }}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2 transform transition-all duration-300 hover:scale-105">
                      <Label className={`font-medium ${isDarkMode ? 'text-white' : 'text-white'} transition-colors duration-200`}>Artista *</Label>
                      <Input
                        value={musicRequest.artistName}
                        onChange={(e) => handleInputChange('artistName', e.target.value)}
                        placeholder="Ej: The Weeknd"
                        className="h-10 sm:h-12 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] focus:scale-[1.02] focus:shadow-xl placeholder:text-gray-600"
                        style={{
                          backgroundColor: '#ffffff',
                          color: '#000000',
                          borderColor: customization?.inputBorderColor || (isDarkMode ? '#4b5563' : '#d1d5db'),
                          borderRadius: customization ? `${customization.borderRadius}px` : '0.5rem',
                          fontSize: customization ? `${customization.fontSize}px` : undefined
                        }}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2 transform transition-all duration-300 hover:scale-105">
                    <Label className={`font-medium ${isDarkMode ? 'text-white' : 'text-white'} transition-colors duration-200`}>Género *</Label>
                    <Select value={musicRequest.genre} onValueChange={(value) => handleInputChange('genre', value)}>
                      <SelectTrigger 
                        className="h-10 sm:h-12 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] focus:scale-[1.02] focus:shadow-xl"
                         style={{
                           backgroundColor: '#ffffff',
                           color: '#000000',
                           borderColor: customization?.inputBorderColor || (isDarkMode ? '#4b5563' : '#d1d5db'),
                           borderRadius: customization ? `${customization.borderRadius}px` : '0.5rem',
                           fontSize: customization ? `${customization.fontSize}px` : undefined
                         }}
                      >
                        <SelectValue placeholder="Selecciona un género" />
                      </SelectTrigger>
                      <SelectContent className="animate-in slide-in-from-top-2 duration-200">
                        {musicGenres.map((genre) => (
                          <SelectItem key={genre} value={genre} className="transition-colors duration-150 hover:bg-opacity-80">{genre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 transform transition-all duration-300 hover:scale-105">
                    <Label className={`font-medium ${isDarkMode ? 'text-white' : 'text-white'} transition-colors duration-200`}>Tu nombre *</Label>
                    <Input
                      value={musicRequest.requesterName}
                      onChange={(e) => handleInputChange('requesterName', e.target.value)}
                      placeholder="¿Cómo te llamas?"
                      className="h-12 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] focus:scale-[1.02] focus:shadow-xl placeholder:text-gray-600"
                      style={{
                        backgroundColor: '#ffffff',
                        color: '#000000',
                        borderColor: customization?.inputBorderColor || (isDarkMode ? '#4b5563' : '#d1d5db'),
                        borderRadius: customization ? `${customization.borderRadius}px` : '0.5rem',
                        fontSize: customization ? `${customization.fontSize}px` : undefined
                      }}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Paso 2: Método de pago */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-5 duration-300">
                  {/* Fondo con partículas animadas */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-indigo-500/10 animate-pulse"></div>
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-1 bg-white/20 rounded-full animate-bounce"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          animationDelay: `${Math.random() * 2}s`,
                          animationDuration: `${2 + Math.random() * 3}s`
                        }}
                      ></div>
                    ))}
                  </div>

                  {/* Encabezado de pago eliminado: mostramos directamente el monto de propina */}

                  {/* Monto de propina - Mostrar primero */}
                  <div className="text-center space-y-4 mb-6 relative z-10">
                    <div className={`p-6 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] ${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/10 backdrop-blur-md border-white/20'}`}
                         style={{ 
                           boxShadow: `0 8px 32px ${themeColors.primary}20`
                         }}>
                      <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-white'}`}>
                        Monto de Propina
                      </h3>
                      <div className="text-4xl font-bold" style={{ color: '#ffffff' }}>
                        {currencySymbol}{djProfile.payment?.minTip || '5'}
                      </div>
                      <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-200'}`}>
                        Propina sugerida para tu solicitud
                      </p>
                      <Input
                        type="hidden"
                        value={djProfile.payment?.minTip || '5'}
                        onChange={(e) => handleInputChange('paymentAmount', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Logo del DJ con efectos */}
                  <div className="text-center mb-6 relative z-10">
                    <div className="relative inline-block">
                      <Avatar className="w-24 h-24 mx-auto mb-4 border-4 transition-all duration-300 hover:scale-105" 
                              style={{ 
                                borderColor: themeColors.primary,
                                boxShadow: `0 0 30px ${themeColors.primary}60`
                              }}>
                        <AvatarImage src={djProfile.profilePictureUrl} alt={djProfile.djName} />
                        <AvatarFallback className="text-2xl">
                          <User className="w-12 h-12" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                    </div>
                    <h4 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {djProfile.djName}
                    </h4>
                  </div>

                  <div className="space-y-6 relative z-10">
                    <div className="space-y-2">
                      <Label className={`font-medium ${isDarkMode ? 'text-white' : 'text-white'}`}>Método de pago *</Label>
                      <Select value={musicRequest.selectedWallet} onValueChange={(value) => {
                        handleInputChange('selectedWallet', value);
                        const tipAmount = djProfile?.payment?.minTip || '5';
                        handleInputChange('paymentAmount', tipAmount.toString());
                      }}>
                        <SelectTrigger 
                          className="h-12 transition-all duration-300 hover:shadow-lg"
                          style={{
                            backgroundColor: '#ffffff',
                            color: '#000000',
                            borderColor: customization?.inputBorderColor || (isDarkMode ? '#4b5563' : '#d1d5db'),
                            borderRadius: customization ? `${customization.borderRadius}px` : '0.5rem'
                          }}
                        >
                          <SelectValue placeholder="Selecciona método de pago" />
                        </SelectTrigger>
                        <SelectContent>
                          {djProfile.payment?.paypalEnabled && (
                            <SelectItem value="paypal">
                              <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4" />
                                PayPal - {djProfile.payment.paypalEmail}
                              </div>
                            </SelectItem>
                          )}
                          {djProfile.payment?.digitalWallets?.map((wallet: { name: string; account: string; qrCodeUrl?: string }, index: number) => (
                            <SelectItem key={index} value={wallet.name}>
                              <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4" />
                                {wallet.name} - {wallet.account}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Mostrar información específica del método de pago seleccionado */}
                    {musicRequest.selectedWallet && (
                      <div className="mt-6 p-6 rounded-xl transition-all duration-500 transform hover:scale-[1.02]" 
                           style={{ 
                             background: `linear-gradient(135deg, ${themeColors.primary}20, ${themeColors.accent}20)`,
                             border: `2px solid ${themeColors.primary}40`,
                             boxShadow: `0 8px 32px ${themeColors.primary}20`
                           }}>
                        {musicRequest.selectedWallet === 'paypal' ? (
                          <div className="text-center space-y-4">
                            <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" 
                                 style={{ backgroundColor: '#0070ba' }}>
                              <CreditCard className="w-8 h-8 text-white" />
                            </div>
                            <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              PayPal
                            </h4>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                              Email: {djProfile.payment?.paypalEmail}
                            </p>
                            {djProfile.payment?.paypalMeLink && (
                               <div className="mt-4">
                                 <a 
                                   href={djProfile.payment.paypalMeLink}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="inline-flex items-center gap-2 px-6 py-3 bg-[#0070ba] text-white rounded-lg font-medium transition-all duration-300 hover:bg-[#005ea6] hover:scale-105 hover:shadow-lg"
                                 >
                                   <CreditCard className="w-4 h-4" />
                                   Pagar con PayPal
                                 </a>
                               </div>
                             )}
                          </div>
                        ) : (
                          // Mostrar QR para billeteras digitales
                          (() => {
                            const selectedWalletData = djProfile.payment?.digitalWallets?.find((w: { name: string; account: string; qrCodeUrl?: string }) => w.name === musicRequest.selectedWallet);
                            return selectedWalletData && (
                              <div className="text-center space-y-4">
                                <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" 
                                     style={{ backgroundColor: themeColors.primary }}>
                                  <CreditCard className="w-8 h-8 text-white" />
                                </div>
                                <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {selectedWalletData.name}
                                </h4>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                  Cuenta: {selectedWalletData.account}
                                </p>
                                {selectedWalletData.qrCodeUrl && (
                                  <div className="mt-4">
                                    <div className="inline-block p-4 bg-white rounded-xl shadow-lg transition-all duration-300 hover:scale-105">
                                      <img 
                                        src={selectedWalletData.qrCodeUrl} 
                                        alt={`QR ${selectedWalletData.name}`}
                                        className="w-48 h-48 mx-auto rounded-lg"
                                      />
                                    </div>
                                    <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                      Escanea este código QR para realizar el pago
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          })()
                        )}
                      </div>
                    )}


                  </div>
                </div>
              )}

              {/* Paso 3: Comprobante de pago */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right-5 duration-300">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${themeColors.primary}20` }}>
                      <MessageCircle className="w-8 h-8" style={{ color: themeColors.primary }} />
                    </div>
                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-white'}`}>
                      Enviar Solicitud por WhatsApp
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-white'}`}>
                      Sube tu comprobante de pago para verificar la transacción
                    </p>
                  </div>

                  <div className="space-y-4">
                    {!musicRequest.paymentProof ? (
                      <div 
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                          isDarkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'
                        }`}
                        style={{ borderColor: uploadingProof ? themeColors.primary : undefined }}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file);
                          }}
                          className="hidden"
                          id="file-upload"
                          disabled={uploadingProof}
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <div className="space-y-4">
                            {uploadingProof ? (
                              <Loader2 className="w-12 h-12 mx-auto animate-spin" style={{ color: themeColors.primary }} />
                            ) : (
                              <Camera className="w-12 h-12 mx-auto" style={{ color: themeColors.primary }} />
                            )}
                            <div>
                              <p className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-white'}`}>
                                {uploadingProof ? 'Subiendo...' : 'Seleccionar archivo'}
                              </p>
                              <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-white'}`}>
                                PNG, JPG hasta 10MB
                              </p>
                            </div>
                          </div>
                        </label>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative">
                          <img 
                            src={musicRequest.paymentProof} 
                            alt="Comprobante de pago" 
                            className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleInputChange('paymentProof', '')}
                            className={`absolute top-2 right-2 ${isDarkMode ? 'bg-white text-black border-gray-300 hover:bg-gray-100' : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-100'}`}
                          >
                            Cambiar
                          </Button>
                        </div>
                        <div className="text-center">
                          <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
                          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Comprobante subido correctamente
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Paso 4: Enviar por WhatsApp */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-in slide-in-from-right-5 duration-300">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${themeColors.primary}20` }}>
                      <MessageCircle className="w-8 h-8" style={{ color: themeColors.primary }} />
                    </div>
                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-white'}`}>
                      Enviar Solicitud por WhatsApp
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-white'}`}>
                      Revisa tu solicitud y envíala directamente al DJ
                    </p>
                  </div>

                  {/* Resumen de la solicitud */}
                  <div className={`rounded-lg p-6 space-y-4 bg-white border border-gray-200`}>
                    <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Resumen de tu solicitud:</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Canción:</span>
                        <p className={`text-black`}>{musicRequest.songName}</p>
                      </div>
                      <div>
                        <span className={`font-medium text-gray-700`}>Artista:</span>
                        <p className={`text-black`}>{musicRequest.artistName}</p>
                      </div>
                      <div>
                        <span className={`font-medium text-gray-700`}>Género:</span>
                        <p className={`text-black`}>{musicRequest.genre}</p>
                      </div>
                      <div>
                        <span className={`font-medium text-gray-700`}>Solicitado por:</span>
                        <p className={`text-black`}>{musicRequest.requesterName}</p>
                      </div>
                      <div>
                        <span className={`font-medium text-gray-700`}>Método de pago:</span>
                        <p className={`text-black`}>{musicRequest.selectedWallet}</p>
                      </div>
                      <div>
                        <span className={`font-medium text-gray-700`}>Monto:</span>
                        <p className={`text-black`}>{currencySymbol}{musicRequest.paymentAmount}</p>
                      </div>
                    </div>
                  </div>

                  {/* Mensaje adicional */}
                  <div className="space-y-2">
                    <Label className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Mensaje adicional (opcional)</Label>
                    <Textarea
                      value={musicRequest.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Algún mensaje especial para el DJ..."
                      className="transition-all duration-300"
                      style={{
                        backgroundColor: '#ffffff',
                        color: '#000000',
                        borderColor: customization?.inputBorderColor || (isDarkMode ? '#4b5563' : '#d1d5db'),
                        borderRadius: customization ? `${customization.borderRadius}px` : '0.5rem'
                      }}
                      rows={3}
                    />
                  </div>

                  {/* Botón de WhatsApp */}
                  <div className="text-center">
                    <Button
                      type="button"
                      onClick={() => {
                        sendWhatsAppMessage();
                        setSubmitted(true);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                      size="lg"
                    >
                      <MessageCircle className="w-6 h-6 mr-3" />
                      Enviar por WhatsApp
                    </Button>
                    <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-200'}`}>
                      Se abrirá WhatsApp con tu solicitud lista para enviar
                    </p>
                  </div>
                </div>
              )}

              {/* Mensaje de finalización después de subir comprobante */}
              {submitted && (
                <div className="space-y-6 animate-slide-in">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: `${themeColors.primary}20` }}>
                      <CheckCircle className="w-10 h-10" style={{ color: themeColors.primary }} />
                    </div>
                    <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-white'} mb-2`}>
                      ¡Solicitud Enviada!
                    </h3>
                    <p className={`text-lg ${isDarkMode ? 'text-gray-200' : 'text-gray-200'} mb-6`}>
                      Tu solicitud de música ha sido enviada exitosamente
                    </p>
                    
                    <div className={`rounded-lg p-6 bg-white text-left max-w-md mx-auto`}>
                      <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-white'} mb-3`}>Resumen:</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className={'text-gray-700'}>Canción:</span>
                          <span className={'text-black'}>{musicRequest.songName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={'text-gray-700'}>Artista:</span>
                          <span className={'text-black'}>{musicRequest.artistName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={'text-gray-700'}>Monto:</span>
                          <span className={'text-black'}>{currencySymbol}{musicRequest.paymentAmount}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-500/10 backdrop-blur-md border border-green-400/30'}`}>
                      <p className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                        ✅ Datos enviados por WhatsApp<br/>
                        ✅ Comprobante de pago subido<br/>
                        ✅ El DJ revisará tu solicitud pronto
                      </p>
                    </div>
                    
                    <Button
                      onClick={() => window.location.reload()}
                      className="mt-4 sm:mt-6 w-full sm:w-auto transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                      style={{ backgroundColor: themeColors.primary }}
                    >
                      Hacer otra solicitud
                    </Button>
                  </div>
                </div>
              )}
              
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Botones de navegación */}
              {!submitted && (
                <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 pt-4 sm:pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className={`${currentStep === 1 ? 'invisible' : ''} w-full sm:w-auto transform transition-all duration-300 hover:scale-105 hover:shadow-md`}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Anterior
                  </Button>
                  
                  {currentStep < 4 && (
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={!validateStep(currentStep)}
                      className="w-full sm:w-auto transform transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:hover:scale-100 disabled:hover:shadow-none"
                      style={{ backgroundColor: themeColors.primary }}
                    >
                      Siguiente
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              )}
            </form>
          </CardContent>
        </Card>
        

      </div>
    </div>
  );
}