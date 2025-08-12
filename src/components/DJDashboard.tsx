"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Image from "next/image";
import { DJProfile } from "@/lib/types";
import { User, CreditCard, QrCode, Palette, Upload, ArrowRight, ArrowLeft, Moon, Sun, Type, Zap, Settings, Link, Copy, RefreshCw, Plus, Trash2, Eye, Edit, Camera, Phone, Mail, Globe, ChevronLeft, ChevronRight, Check, X, Download, Building2, RotateCcw, Save, Sparkles, ExternalLink, Clock, CalendarIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription } from "./ui/alert";
import FormCreator from "@/components/FormCreator";

// Datos de billeteras digitales por país
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
  "China": {
    currency: "Yuan / Renminbi (¥ / CN¥)",
    symbol: "¥",
    wallets: ["Alipay", "WeChat Pay"]
  },
  "India": {
    currency: "Rupia India (₹)",
    symbol: "₹",
    wallets: ["Paytm", "Google Pay (Tez)", "PhonePe"]
  },
  "Corea del Sur": {
    currency: "Won Surcoreano (₩)",
    symbol: "₩",
    wallets: ["Kakao Pay", "Naver Pay", "Toss"]
  },
  "Japón": {
    currency: "Yen Japonés (¥)",
    symbol: "¥",
    wallets: ["Line Pay", "Rakuten Pay"]
  },
  "Tailandia": {
    currency: "Baht Tailandés (฿)",
    symbol: "฿",
    wallets: ["TrueMoney Wallet", "GrabPay"]
  },
  "España": {
    currency: "Euro (€)",
    symbol: "€",
    wallets: ["Bizum"]
  },
  "Reino Unido": {
    currency: "Libra Esterlina (£)",
    symbol: "£",
    wallets: ["Monzo", "Revolut"]
  },
  "Alemania": {
    currency: "Euro (€)",
    symbol: "€",
    wallets: ["Paydirekt"]
  },
  "Estados Unidos": {
    currency: "Dólar Estadounidense ($ / USD)",
    symbol: "$",
    wallets: ["Venmo", "Zelle", "Cash App", "Apple Pay", "Google Pay"]
  },
  "Canadá": {
    currency: "Dólar Canadiense ($ / CAD)",
    symbol: "$",
    wallets: ["Interac e-Transfer"]
  },
  "Kenia": {
    currency: "Chelín Keniano (KSh)",
    symbol: "KSh",
    wallets: ["M-Pesa"]
  },
  "Nigeria": {
    currency: "Naira (₦)",
    symbol: "₦",
    wallets: ["OPay", "Paga"]
  },
  "Sudáfrica": {
    currency: "Rand Sudafricano (R)",
    symbol: "R",
    wallets: ["Vodacom Pay", "MTN MoMo"]
  },
  "Australia": {
    currency: "Dólar Australiano ($ / AUD)",
    symbol: "$",
    wallets: ["Beem It", "Apple Pay", "Google Pay"]
  },
  "Nueva Zelanda": {
    currency: "Dólar Neozelandés ($ / NZD)",
    symbol: "$",
    wallets: ["ANZ GoPoS", "Dosh"]
  }
};

const initialDjProfile: DJProfile = {
  id: '',
  djName: '',
  bio: '',
  welcomeMessage: '',
  profilePictureUrl: '',
  logoUrl: '',
  colors: {
    primary: '#6D28D9',
    background: '#F3F4F6',
    accent: '#A78BFA',
    text: '#111827',
  },
  theme: {
    mode: 'light',
    fontSize: 16,
      fontFamily: 'inter',
      borderRadius: 8,
    animations: true,
  },
  payment: {
    minTip: 1,
    paypalEnabled: false,
    paypalEmail: '',
    paypalMeLink: '',
    paypalQrUrl: '',
    yapeQrUrl: '',
    yapePhoneNumber: '',
    digitalWallets: [],
  },
  notifications: {
    whatsappNumber: '',
  },
};

const navItems = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'payments', label: 'Configuración de Pagos', icon: CreditCard },
    { id: 'preview', label: 'Vista Previa', icon: Eye },
    { id: 'qr-code', label: 'Generar QR y Link', icon: QrCode },
];

export default function DJDashboard() {
    const [activeTab, setActiveTab] = useState('profile');
    const [djProfile, setDjProfile] = useState<DJProfile>(initialDjProfile);
    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
    const [profileImagePreview, setProfileImagePreview] = useState<string>('');
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const [uniquePageUrl, setUniquePageUrl] = useState<string>('');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    // Funciones de manejo
    const handleProfileChange = (field: keyof DJProfile, value: any) => {
        setDjProfile(prev => ({ ...prev, [field]: value }));
    };

    const handlePaymentChange = (field: keyof DJProfile['payment'], value: any) => {
        setDjProfile(prev => ({
            ...prev,
            payment: { ...prev.payment, [field]: value }
        }));
    };

    const handleColorChange = (colorType: keyof DJProfile['colors'], value: string) => {
        setDjProfile(prev => ({
            ...prev,
            colors: { ...prev.colors, [colorType]: value }
        }));
    };

    const handleThemeChange = (field: keyof DJProfile['theme'], value: any) => {
        setDjProfile(prev => ({
            ...prev,
            theme: { ...prev.theme, [field]: value }
        }));
    };

    const handleDigitalWalletAdd = (wallet: { name: string; account: string; qrCodeUrl?: string; }) => {
        setDjProfile(prev => ({
            ...prev,
            payment: {
                ...prev.payment,
                digitalWallets: [...prev.payment.digitalWallets, wallet]
            }
        }));
    };

    const handleDigitalWalletRemove = (index: number) => {
        setDjProfile(prev => ({
            ...prev,
            payment: {
                ...prev.payment,
                digitalWallets: prev.payment.digitalWallets.filter((_, i) => i !== index)
            }
        }));
    };

    const handleProfileImageSelect = async (file: File) => {
        setProfileImageFile(file);
        
        // Mostrar preview inmediato
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            setProfileImagePreview(result);
        };
        reader.readAsDataURL(file);
        
        // Subir imagen al servidor
        try {
            const filename = `${Date.now()}-${file.name}`;
            const response = await fetch(`/api/upload?filename=${encodeURIComponent(filename)}`, {
                method: 'POST',
                body: file,
            });
            
            if (!response.ok) {
                throw new Error('Error al subir la imagen');
            }
            
            const blob = await response.json();
            // Actualizar el perfil con la URL pública de la imagen
            setDjProfile(prev => ({ ...prev, profilePictureUrl: blob.url }));
            
        } catch (error) {
            console.error('Error uploading profile image:', error);
            alert('Error al subir la imagen. Inténtalo de nuevo.');
        }
    };

const generateQrAndLink = async () => {
    setIsLoading(true);
    setProgress(0);
    
    try {
        // PASO 1 (NUEVO): Asegurarnos de que el perfil más reciente está guardado
        // Esto subirá la imagen a Vercel Blob y guardará la URL en KV.
        setProgress(25);
        const saveResponse = await fetch('/api/save-dj-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ djProfile })
        });

        if (!saveResponse.ok) {
            const saveErrorData = await saveResponse.json();
            if (saveErrorData.error?.includes('Vercel KV not configured')) {
                throw new Error('⚠️ Para generar códigos QR en producción, necesitas configurar Vercel KV. Consulta CONFIGURACION_VERCEL.md para instrucciones.');
            }
            throw new Error('No se pudo guardar el perfil antes de generar el QR.');
        }
        setProgress(50);
        
        // PASO 2: Ahora llamamos a la API para generar el código, enviando el perfil completo.
        const response = await fetch('/api/generate-unique-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ djName: djProfile.djName, djProfile: djProfile })
        });
        
        setProgress(80);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error generando código único');
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Error desconocido');
        }
        
        setProgress(100);
        
        setUniquePageUrl(data.shortUrl);
        setQrCodeUrl(data.qrCodeUrl);
        
    } catch (error) {
        console.error('Error generando QR y link:', error);
        alert(`Error: ${error instanceof Error ? error.message : 'Inténtalo de nuevo.'}`);
    } finally {
        setIsLoading(false);
    }
};

    // Función para guardar el perfil automáticamente
    const saveProfileAutomatically = async () => {
        // Solo guardar si el perfil tiene al menos el nombre del DJ
        if (!djProfile.djName.trim()) {
            return;
        }

        try {
            const response = await fetch('/api/save-dj-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ djProfile })
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Perfil guardado automáticamente: ${data.djSlug}`);
            } else {
                const errorData = await response.json();
                if (errorData.error?.includes('Vercel KV not configured')) {
                    console.warn('⚠️ Vercel KV no configurado - usando almacenamiento local');
                } else {
                    console.error('Error guardando perfil:', errorData.error);
                }
            }
        } catch (error) {
            console.error('Error guardando perfil automáticamente:', error);
        }
    };

    // Validaciones
    const isProfileStepValid = useMemo(() => {
        return djProfile.djName.trim() !== '' && 
               djProfile.notifications.whatsappNumber.trim() !== '' && 
               profileImagePreview !== '';
    }, [djProfile.djName, djProfile.notifications.whatsappNumber, profileImagePreview]);

    const isPaymentStepValid = useMemo(() => {
        const hasPaypal = djProfile.payment.paypalEnabled && 
                         djProfile.payment.paypalEmail.trim() !== '';
        const hasDigitalWallets = djProfile.payment.digitalWallets.length > 0;
        return hasPaypal || hasDigitalWallets;
    }, [djProfile.payment]);

    const canNavigateToTab = (tab: string) => {
        switch (tab) {
            case 'profile':
                return true;
            case 'payments':
                return isProfileStepValid;
            case 'preview':
                return isProfileStepValid && isPaymentStepValid;
            case 'qr-code':
                return isProfileStepValid && isPaymentStepValid;
            default:
                return false;
        }
    };

    // Reset profile when component mounts
    useEffect(() => {
        setDjProfile(initialDjProfile);
    }, []);

    // Set dark mode based on theme
    useEffect(() => {
        setIsDarkMode(djProfile.theme.mode === 'dark');
    }, [djProfile.theme.mode]);

    // Guardar perfil automáticamente cuando cambie
    useEffect(() => {
        // Debounce para evitar demasiadas llamadas
        const timeoutId = setTimeout(() => {
            saveProfileAutomatically();
        }, 1000); // Esperar 1 segundo después del último cambio

        return () => clearTimeout(timeoutId);
    }, [djProfile.djName, djProfile.notifications.whatsappNumber, djProfile.bio, djProfile.welcomeMessage, djProfile.payment, djProfile.profilePictureUrl]);

    const toggleTheme = () => {
        const newMode = isDarkMode ? 'light' : 'dark';
        handleThemeChange('mode', newMode);
        setIsDarkMode(!isDarkMode);
    };

    return (
        <div className={`min-h-screen transition-all duration-500 ${
            isDarkMode ? 'bg-gradient-to-br from-slate-900 via-gray-900 to-black' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
        }`}>
            {/* Animated background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute inset-0 animate-pulse ${
                    isDarkMode ? 'bg-gradient-to-br from-blue-900/10 via-purple-900/10 to-cyan-900/10' : 'bg-gradient-to-br from-blue-50/30 via-purple-50/30 to-cyan-50/30'
                }`}></div>
            </div>
            <div className="flex flex-col lg:flex-row">
                {/* Sidebar */}
                <SidebarNav 
                    activeTab={activeTab} 
                    setActiveTab={setActiveTab} 
                    djProfile={djProfile}
                    canNavigateToTab={canNavigateToTab}
                    isDarkMode={isDarkMode}
                />
                
                {/* Main Content */}
                <div className="flex-1 p-4 sm:p-6 lg:p-8 relative">
                    {/* Header con toggle de tema */}
                    <div className="max-w-6xl mx-auto mb-4 sm:mb-6 lg:mb-8">
                        <div className={`backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl ${
                            isDarkMode ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white/80 border border-gray-200/50'
                        }`}>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 animate-in slide-in-from-top-5 duration-700">
                                <div className="flex items-center gap-3 sm:gap-4 group">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:rotate-3">
                                        <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white transition-transform duration-300 group-hover:rotate-180" />
                                    </div>
                                    <div className="transition-all duration-300 group-hover:translate-x-2">
                                        <h1 className={`text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent transition-all duration-300 group-hover:from-blue-300 group-hover:to-purple-300`}>
                                            Panel de Control DJ
                                        </h1>
                                        <p className={`text-xs sm:text-sm mt-1 transition-colors duration-300 ${
                                            isDarkMode ? 'text-slate-400 group-hover:text-slate-300' : 'text-gray-600 group-hover:text-gray-500'
                                        }`}>
                                            <span className="hidden sm:inline">Configura tu perfil y genera tu código QR personalizado</span>
                                            <span className="sm:hidden">Configura tu perfil</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center sm:justify-end">
                                    <div className={`flex items-center gap-2 sm:gap-3 rounded-lg sm:rounded-xl p-2 sm:p-3 transition-all duration-300 hover:scale-105 hover:shadow-lg group ${
                                        isDarkMode ? 'bg-slate-700/50 border border-slate-600/50 hover:bg-slate-700/70' : 'bg-gray-100/50 border border-gray-300/50 hover:bg-gray-100/70'
                                    }`}>
                                        <Sun className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                                        <Switch
                                            checked={isDarkMode}
                                            onCheckedChange={toggleTheme}
                                            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-purple-600 transition-all duration-300 scale-75 sm:scale-100"
                                        />
                                        <Moon className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-12" />
                                        <span className={`text-xs font-medium ml-1 sm:ml-2 transition-colors duration-300 hidden sm:inline ${
                                            isDarkMode ? 'text-slate-300' : 'text-gray-700'
                                        }`}>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="max-w-6xl mx-auto">
                        <div className="transition-all duration-700 ease-in-out">
                            {activeTab === 'profile' && (
                                <div className="animate-in slide-in-from-right-5 fade-in duration-700 delay-100">
                                    <div className="transform transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl">
                                        <ProfileSettings 
                                            djProfile={djProfile} 
                                            onProfileChange={handleProfileChange}
                                            onNotificationsChange={(field, value) => {
                                                setDjProfile(prev => ({
                                                    ...prev,
                                                    notifications: { ...prev.notifications, [field]: value }
                                                }));
                                            }}
                                            onProfileImageSelect={handleProfileImageSelect}
                                            profileImagePreview={profileImagePreview}
                                            profileImageFile={profileImageFile}
                                            onNext={() => setActiveTab('payments')}
                                            isStepValid={isProfileStepValid}
                                            isDarkMode={isDarkMode}
                                        />
                                    </div>
                                </div>
                            )}
                        
                            {activeTab === 'payments' && (
                                <div className="animate-in slide-in-from-left-5 fade-in duration-700 delay-100">
                                    <div className="transform transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl">
                                        <PaymentSettings 
                                            djProfile={djProfile} 
                                            onPaymentChange={handlePaymentChange}
                                            onNext={() => setActiveTab('preview')}
                                            onPrevious={() => setActiveTab('profile')}
                                            isStepValid={isPaymentStepValid}
                                            isDarkMode={isDarkMode}
                                        />
                                    </div>
                                </div>
                            )}
                            
                            {activeTab === 'preview' && (
                                <div className="animate-in slide-in-from-bottom-5 fade-in duration-700 delay-100">
                                    <div className="transform transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl">
                                        <PreviewPage 
                                            djProfile={djProfile}
                                            onNext={() => setActiveTab('qr-code')}
                                            onPrevious={() => setActiveTab('payments')}
                                            isDarkMode={isDarkMode}
                                        />
                                    </div>
                                </div>
                            )}
                            
                            {activeTab === 'qr-code' && (
                                <div className="animate-in slide-in-from-top-5 fade-in duration-700 delay-100">
                                    <div className="transform transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl">
                                        <QrCodeSection 
                                            djProfile={djProfile}
                                            onPrevious={() => setActiveTab('preview')}
                                            isDarkMode={isDarkMode}
                                        />
                                    </div>
                                </div>
                            )}
                            

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SidebarNav({ activeTab, setActiveTab, djProfile, canNavigateToTab, isDarkMode }: { 
  activeTab: string, 
  setActiveTab: (tab: string) => void,
  djProfile: DJProfile,
  canNavigateToTab: (tab: string) => boolean,
  isDarkMode: boolean
}) {
    return (
        <div className={`w-full lg:w-64 backdrop-blur-sm lg:border-r border-b lg:border-b-0 p-3 sm:p-4 lg:p-6 relative min-h-[200px] lg:min-h-screen ${
            isDarkMode ? 'bg-slate-800/90 border-slate-700/50' : 'bg-white/90 border-gray-200/50'
        }`}>
            {/* Gradient overlay */}
            <div className={`absolute inset-0 pointer-events-none ${
                isDarkMode ? 'bg-gradient-to-b from-slate-800/50 to-slate-900/50' : 'bg-gradient-to-b from-gray-50/30 to-white/30'
            }`}></div>
            
            {/* Logo/Brand section - Más compacto en móvil */}
            <div className="relative mb-4 sm:mb-6 lg:mb-8 animate-in slide-in-from-left-5 duration-700">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 group">
                    <div className="relative w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-md sm:rounded-lg lg:rounded-xl overflow-hidden shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
                        <Image 
                            src="/logo.png" 
                            alt="TuneConnect Logo" 
                            width={48} 
                            height={48} 
                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="transition-all duration-300 group-hover:translate-x-1">
                        <h2 className={`font-bold text-sm sm:text-base lg:text-lg transition-colors duration-300 ${
                            isDarkMode ? 'text-white group-hover:text-blue-300' : 'text-gray-900 group-hover:text-blue-600'
                        }`}>TuneConnect</h2>
                        <p className={`text-xs transition-colors duration-300 ${
                            isDarkMode ? 'text-slate-400 group-hover:text-purple-300' : 'text-gray-600 group-hover:text-purple-600'
                        }`}>Panel DJ</p>
                    </div>
                </div>
            </div>
            
            {/* Navigation items - Grid en móvil, lista en desktop */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:flex lg:flex-col lg:space-y-2 relative">
                {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    const canNavigate = canNavigateToTab(item.id);
                    
                    return (
                        <button
                            key={item.id}
                            onClick={() => canNavigate && setActiveTab(item.id)}
                            disabled={!canNavigate}
                            className={`w-full flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-1 sm:gap-2 lg:gap-3 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-3 rounded-lg sm:rounded-xl text-center lg:text-left transition-all duration-300 transform hover:scale-105 lg:hover:translate-x-2 group relative overflow-hidden animate-in slide-in-from-left-5 ${
                                isActive 
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 scale-105' 
                                    : canNavigate 
                                        ? isDarkMode 
                                            ? 'text-slate-300 hover:bg-slate-700/50 hover:text-white hover:shadow-lg' 
                                            : 'text-gray-700 hover:bg-gray-100/50 hover:text-gray-900 hover:shadow-lg'
                                        : isDarkMode 
                                            ? 'text-slate-500 cursor-not-allowed opacity-50'
                                            : 'text-gray-400 cursor-not-allowed opacity-50'
                            }`}
                            style={{
                                animationDelay: `${(index + 2) * 150}ms`,
                                animationDuration: '600ms'
                            }}
                        >
                            {/* Active indicator */}
                            {isActive && (
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 animate-pulse"></div>
                            )}
                            
                            {/* Hover effect */}
                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                                isDarkMode ? 'bg-gradient-to-r from-slate-600/10 to-slate-500/10' : 'bg-gradient-to-r from-gray-200/30 to-gray-100/30'
                            }`}></div>
                            
                            <Icon className={`w-4 h-4 sm:w-5 sm:h-5 relative z-10 transition-transform duration-300 ${
                                isActive ? 'scale-110' : 'group-hover:scale-110'
                            }`} />
                            <span className="relative z-10 font-medium text-xs sm:text-sm lg:text-base leading-tight">{item.label}</span>
                            
                            {/* Hover effect */}
                            {canNavigate && !isActive && (
                                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                                    isDarkMode ? 'bg-gradient-to-r from-slate-600/0 via-slate-600/10 to-slate-600/0' : 'bg-gradient-to-r from-gray-300/0 via-gray-300/10 to-gray-300/0'
                                }`}></div>
                            )}
                        </button>
                    );
                })}
            </div>
            
            {/* Bottom section with DJ info - Oculto en móvil pequeño */}
            <div className="hidden sm:block absolute bottom-4 sm:bottom-6 left-3 sm:left-4 lg:left-6 right-3 sm:right-4 lg:right-6 animate-in slide-in-from-bottom-5 duration-700 delay-300">
                <div className={`backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 border transition-all duration-300 hover:scale-105 hover:shadow-lg group ${
                    isDarkMode ? 'bg-slate-700/50 border-slate-600/50 hover:bg-slate-700/70' : 'bg-gray-100/50 border-gray-300/50 hover:bg-gray-100/70'
                }`}>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="relative w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-md sm:rounded-lg overflow-hidden shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                            {djProfile.profilePictureUrl ? (
                                <Image 
                                    src={djProfile.profilePictureUrl} 
                                    alt={djProfile.djName || 'DJ Profile'} 
                                    width={40} 
                                    height={40} 
                                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center transition-all duration-300 group-hover:from-green-400 group-hover:to-emerald-500">
                                    <span className="text-white text-xs sm:text-sm font-bold">
                                        {djProfile.djName ? djProfile.djName.charAt(0).toUpperCase() : 'D'}
                                    </span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div className="flex-1 min-w-0 transition-all duration-300 group-hover:translate-x-1">
                            <p className="text-xs sm:text-sm font-medium truncate transition-colors duration-300" style={{ color: '#ffffff' }}>
                                {djProfile.djName || 'DJ Name'}
                            </p>
                            <p className={`text-xs truncate transition-colors duration-300 hidden lg:block ${
                                isDarkMode ? 'text-slate-400 group-hover:text-emerald-300' : 'text-gray-600 group-hover:text-emerald-600'
                            }`}>
                                {djProfile.bio ? djProfile.bio.substring(0, 20) + '...' : 'Configurar perfil'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProfileSettings({ djProfile, onProfileChange, onNotificationsChange, onProfileImageSelect, profileImagePreview, profileImageFile, onNext, isStepValid, isDarkMode }: { 
    djProfile: DJProfile, 
    onProfileChange: (field: keyof DJProfile, value: any) => void,
    onNotificationsChange: (field: keyof DJProfile['notifications'], value: any) => void,
    onProfileImageSelect: (file: File) => void,
    profileImagePreview: string,
    profileImageFile: File | null,
    onNext: () => void,
    isStepValid: boolean,
    isDarkMode: boolean
}) {
    return (
        <Card className={`max-w-4xl mx-auto ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <CardHeader className="p-4 sm:p-6">
                <CardTitle className={`font-headline text-xl sm:text-2xl flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <User className="w-5 h-5 sm:w-6 sm:h-6" /> Configuración del Perfil
                </CardTitle>
                <CardDescription className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Completa toda la información obligatoria para continuar. Todos los campos marcados con * son requeridos.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                {/* Foto de Perfil - OBLIGATORIO */}
                <div className="space-y-2">
                    <Label htmlFor="profilePicture" className={`font-semibold text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Foto de Perfil o Logo del DJ *
                    </Label>
                    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                        <div className="relative">
                            <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-dashed border-gray-300">
                                {profileImagePreview ? (
                                    <AvatarImage src={profileImagePreview} alt="Preview" className="object-cover" />
                                ) : (
                                    <AvatarFallback className="bg-gray-100">
                                        <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                                    </AvatarFallback>
                                )}
                            </Avatar>
                            {!profileImagePreview && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Upload className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 w-full sm:w-auto">
                            <div className="relative">
                                <input 
                                    id="profilePicture" 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) onProfileImageSelect(file);
                                    }}
                                    className="hidden"
                                    required
                                />
                                <Button 
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => document.getElementById('profilePicture')?.click()}
                                    className={`inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm w-full sm:w-auto justify-center ${isDarkMode ? 'border-gray-600 text-black hover:bg-gray-700' : 'border-gray-300 text-black hover:bg-gray-50'}`}
                                >
                                    <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="hidden sm:inline">{profileImagePreview ? 'Cambiar imagen' : 'Seleccionar imagen'}</span>
                                    <span className="sm:hidden">{profileImagePreview ? 'Cambiar' : 'Seleccionar'}</span>
                                </Button>
                            </div>
                            <p className={`text-xs sm:text-sm mt-1 text-center sm:text-left ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Sube una imagen de perfil o logo. Este campo es obligatorio.
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Nombre del DJ - OBLIGATORIO */}
                <div className="space-y-2">
                    <Label htmlFor="djName" className={`font-semibold text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Nombre del DJ *
                    </Label>
                    <Input 
                        id="djName" 
                        placeholder="Ingresa tu nombre artístico" 
                        value={djProfile.djName} 
                        onChange={(e) => onProfileChange('djName', e.target.value)}
                        className={`text-sm sm:text-base ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : ''}`}
                        required
                    />
                </div>
                
                {/* WhatsApp - OBLIGATORIO */}
                <div className="space-y-2">
                    <Label htmlFor="whatsappNumber" className={`font-semibold text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Número de WhatsApp (con código de país) *
                    </Label>
                    <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                        <Input 
                            id="whatsappNumber" 
                            placeholder="+51 987654321" 
                            value={djProfile.notifications.whatsappNumber} 
                            onChange={(e) => onNotificationsChange('whatsappNumber', e.target.value)}
                            className={`text-sm sm:text-base ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : ''}`}
                            required
                        />
                    </div>
                    <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Incluye el código de país. Ejemplo: +51 987654321
                    </p>
                </div>
                
                {/* Biografía - OPCIONAL */}
                <div className="space-y-2">
                    <Label htmlFor="bio" className={`font-semibold text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Biografía (Opcional)
                    </Label>
                    <Textarea 
                        id="bio" 
                        placeholder="Cuéntanos sobre ti y tu música..." 
                        value={djProfile.bio} 
                        onChange={(e) => onProfileChange('bio', e.target.value)}
                        className={`text-sm sm:text-base ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : ''}`}
                        rows={3}
                    />
                </div>
                
                {/* Mensaje de Bienvenida - OPCIONAL */}
                <div className="space-y-2">
                    <Label htmlFor="welcomeMessage" className={`font-semibold text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Mensaje a Mostrar en el Formulario (Opcional)
                    </Label>
                    <Textarea 
                        id="welcomeMessage" 
                        placeholder="¡Hola! Solicita tu canción favorita y hagamos que esta noche sea inolvidable..." 
                        value={djProfile.welcomeMessage} 
                        onChange={(e) => onProfileChange('welcomeMessage', e.target.value)}
                        className={`text-sm sm:text-base ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : ''}`}
                        rows={2}
                    />
                </div>

                {/* Configuración de Tema */}
                <div className={`space-y-3 sm:space-y-4 p-3 sm:p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center gap-2">
                        <Palette className="h-4 w-4 sm:h-5 sm:w-5" />
                        <Label className={`font-semibold text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Configuración de Tema
                        </Label>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {/* Tamaño de Fuente */}
                        <div className="space-y-2">
                            <Label className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Tamaño de Fuente
                            </Label>
                            <Select 
                                value={djProfile.theme.fontSize.toString()} 
                                onValueChange={(value) => onProfileChange('theme', {...djProfile.theme, fontSize: parseInt(value)})}
                            >
                                <SelectTrigger className={`text-xs sm:text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="14">Pequeño</SelectItem>
                                    <SelectItem value="16">Mediano</SelectItem>
                                    <SelectItem value="18">Grande</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Familia de Fuente */}
                        <div className="space-y-2">
                            <Label className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Tipo de Fuente
                            </Label>
                            <Select 
                                value={djProfile.theme.fontFamily} 
                                onValueChange={(value) => onProfileChange('theme', {...djProfile.theme, fontFamily: value})}
                            >
                                <SelectTrigger className={`text-xs sm:text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="inter">Inter</SelectItem>
                                    <SelectItem value="poppins">Poppins</SelectItem>
                                    <SelectItem value="roboto">Roboto</SelectItem>
                                    <SelectItem value="playfair">Playfair Display</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Border Radius */}
                        <div className="space-y-2">
                            <Label className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Bordes Redondeados
                            </Label>
                            <Select 
                                value={djProfile.theme.borderRadius.toString()} 
                                onValueChange={(value) => onProfileChange('theme', {...djProfile.theme, borderRadius: parseInt(value)})}
                            >
                                <SelectTrigger className={`text-xs sm:text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">Sin bordes</SelectItem>
                                    <SelectItem value="4">Pequeños</SelectItem>
                                    <SelectItem value="8">Medianos</SelectItem>
                                    <SelectItem value="12">Grandes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Animaciones */}
                        <div className="space-y-2">
                            <Label className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Animaciones
                            </Label>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    checked={djProfile.theme.animations}
                                    onCheckedChange={(checked) => onProfileChange('theme', {...djProfile.theme, animations: checked})}
                                />
                                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {djProfile.theme.animations ? 'Activadas' : 'Desactivadas'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Validación */}
                {!isStepValid && (
                    <Alert className="border-red-200 bg-red-50">
                        <AlertDescription className="text-red-800">
                            Por favor completa todos los campos obligatorios (*) para continuar al siguiente paso.
                        </AlertDescription>
                    </Alert>
                )}
                
                <div className="flex justify-end pt-4">
                    <Button size="lg" className="font-bold" onClick={onNext} disabled={!isStepValid}>
                        Siguiente <ArrowRight className="ml-2"/>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function QrConverterSection({ isDarkMode }: {
    isDarkMode: boolean
}) {
    const [inputType, setInputType] = useState<'text' | 'url' | 'image'>('text');
    const [inputValue, setInputValue] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState('');
    const [qrSize, setQrSize] = useState(256);
    const [errorCorrectionLevel, setErrorCorrectionLevel] = useState('M');
    const [qrColor, setQrColor] = useState('#000000');
    const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
    
    // Generar código QR
    const generateQrCode = async () => {
        if (!inputValue.trim() && !imageFile) return;
        
        setIsGenerating(true);
        try {
            let dataToEncode = inputValue;
            
            if (inputType === 'image' && imageFile) {
                // Convertir imagen a base64
                const reader = new FileReader();
                dataToEncode = await new Promise((resolve) => {
                    reader.onload = (e) => resolve(e.target?.result as string);
                    reader.readAsDataURL(imageFile);
                });
            }
            
            // Usar API de QR Code Generator
            const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(dataToEncode)}&ecc=${errorCorrectionLevel}&color=${qrColor.replace('#', '')}&bgcolor=${backgroundColor.replace('#', '')}`;
            setQrCodeUrl(qrApiUrl);
        } catch (error) {
            console.error('Error generando QR:', error);
        } finally {
            setIsGenerating(false);
        }
    };
    
    // Manejar selección de imagen
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    // Descargar QR
    const downloadQrCode = () => {
        if (!qrCodeUrl) return;
        
        const link = document.createElement('a');
        link.href = qrCodeUrl;
        link.download = `qr-code-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    // Copiar QR URL
    const copyQrUrl = () => {
        if (qrCodeUrl) {
            navigator.clipboard.writeText(qrCodeUrl);
        }
    };
    
    return (
        <Card className={`max-w-6xl mx-auto ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <CardHeader>
                <CardTitle className={`font-headline text-2xl flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <QrCode className="w-6 h-6" /> Convertidor QR Profesional
                </CardTitle>
                <CardDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Convierte texto, URLs o imágenes a códigos QR personalizados con opciones avanzadas.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Selector de tipo de entrada */}
                <div className="space-y-3">
                    <Label className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Tipo de contenido</Label>
                    <div className="grid grid-cols-3 gap-3">
                        <Button
                            variant={inputType === 'text' ? 'default' : 'outline'}
                            onClick={() => setInputType('text')}
                            className={`flex items-center gap-2 ${inputType === 'text' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                        >
                            <Type className="w-4 h-4" /> Texto
                        </Button>
                        <Button
                            variant={inputType === 'url' ? 'default' : 'outline'}
                            onClick={() => setInputType('url')}
                            className={`flex items-center gap-2 ${inputType === 'url' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                        >
                            <Link className="w-4 h-4" /> URL
                        </Button>
                        <Button
                            variant={inputType === 'image' ? 'default' : 'outline'}
                            onClick={() => setInputType('image')}
                            className={`flex items-center gap-2 ${inputType === 'image' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                        >
                            <Camera className="w-4 h-4" /> Imagen
                        </Button>
                    </div>
                </div>
                
                {/* Área de entrada */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Panel de entrada */}
                    <div className="space-y-4">
                        <Label className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {inputType === 'text' ? 'Texto a convertir' : inputType === 'url' ? 'URL a convertir' : 'Imagen a convertir'}
                        </Label>
                        
                        {inputType === 'image' ? (
                            <div className="space-y-3">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                    id="image-upload"
                                />
                                <Button
                                    variant="outline"
                                    onClick={() => document.getElementById('image-upload')?.click()}
                                    className={`w-full h-32 border-2 border-dashed ${isDarkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'}`}
                                >
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="max-h-24 max-w-full object-contain" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <Upload className="w-8 h-8" />
                                            <span>Seleccionar imagen</span>
                                        </div>
                                    )}
                                </Button>
                            </div>
                        ) : (
                            <Textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={inputType === 'text' ? 'Escribe tu texto aquí...' : 'https://ejemplo.com'}
                                className={`min-h-32 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                            />
                        )}
                        
                        {/* Opciones de personalización */}
                        <div className={`p-4 rounded-lg space-y-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Personalización</h4>
                            
                            {/* Tamaño */}
                            <div className="space-y-2">
                                <Label className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tamaño: {qrSize}px</Label>
                                <Slider
                                    value={[qrSize]}
                                    onValueChange={(value) => setQrSize(value[0])}
                                    min={128}
                                    max={512}
                                    step={32}
                                    className="w-full"
                                />
                            </div>
                            
                            {/* Nivel de corrección de errores */}
                            <div className="space-y-2">
                                <Label className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Corrección de errores</Label>
                                <Select value={errorCorrectionLevel} onValueChange={setErrorCorrectionLevel}>
                                    <SelectTrigger className={isDarkMode ? 'bg-gray-600 border-gray-500' : ''}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="L">Bajo (7%)</SelectItem>
                                        <SelectItem value="M">Medio (15%)</SelectItem>
                                        <SelectItem value="Q">Alto (25%)</SelectItem>
                                        <SelectItem value="H">Muy Alto (30%)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            {/* Colores */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Color QR</Label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={qrColor}
                                            onChange={(e) => setQrColor(e.target.value)}
                                            className="w-8 h-8 rounded border"
                                        />
                                        <Input
                                            value={qrColor}
                                            onChange={(e) => setQrColor(e.target.value)}
                                            className={`flex-1 ${isDarkMode ? 'bg-gray-600 border-gray-500' : ''}`}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Color fondo</Label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={backgroundColor}
                                            onChange={(e) => setBackgroundColor(e.target.value)}
                                            className="w-8 h-8 rounded border"
                                        />
                                        <Input
                                            value={backgroundColor}
                                            onChange={(e) => setBackgroundColor(e.target.value)}
                                            className={`flex-1 ${isDarkMode ? 'bg-gray-600 border-gray-500' : ''}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Botón generar */}
                        <Button
                            onClick={generateQrCode}
                            disabled={isGenerating || (!inputValue.trim() && !imageFile)}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                        >
                            {isGenerating ? (
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <QrCode className="w-4 h-4 mr-2" />
                            )}
                            {isGenerating ? 'Generando...' : 'Generar QR'}
                        </Button>
                    </div>
                    
                    {/* Panel de resultado */}
                    <div className="space-y-4">
                        <Label className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Código QR generado</Label>
                        
                        <div className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed min-h-80 ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'}`}>
                            {qrCodeUrl ? (
                                <div className="text-center space-y-4">
                                    <div className="bg-white p-4 rounded-lg shadow-lg inline-block">
                                        <img
                                            src={qrCodeUrl}
                                            alt="Código QR generado"
                                            className="max-w-full h-auto"
                                            style={{ width: `${Math.min(qrSize, 300)}px`, height: `${Math.min(qrSize, 300)}px` }}
                                        />
                                    </div>
                                    
                                    {/* Acciones del QR */}
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <Button
                                            onClick={downloadQrCode}
                                            variant="outline"
                                            className="flex-1"
                                        >
                                            <Download className="w-4 h-4 mr-2" /> Descargar
                                        </Button>
                                        <Button
                                            onClick={copyQrUrl}
                                            variant="outline"
                                            className="flex-1"
                                        >
                                            <Copy className="w-4 h-4 mr-2" /> Copiar URL
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <QrCode className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                    <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Tu código QR aparecerá aquí
                                    </p>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                        Ingresa contenido y haz clic en "Generar QR"
                                    </p>
                                </div>
                            )}
                        </div>
                        
                        {/* Información adicional */}
                        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-700'}`}>
                            <h4 className="font-semibold mb-2">💡 Consejos de uso:</h4>
                            <ul className="text-sm space-y-1">
                                <li>• Usa alta corrección de errores para QR que se imprimirán</li>
                                <li>• Mantén buen contraste entre colores para mejor legibilidad</li>
                                <li>• Tamaños más grandes son mejores para distancias largas</li>
                                <li>• Prueba el QR antes de usarlo en producción</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Placeholder para los otros componentes - estos necesitarían ser implementados completamente
function PaymentSettings({ djProfile, onPaymentChange, onNext, onPrevious, isStepValid, isDarkMode }: {
    djProfile: DJProfile,
    onPaymentChange: (field: keyof DJProfile['payment'], value: any) => void,
    onNext: () => void,
    onPrevious: () => void,
    isStepValid: boolean,
    isDarkMode: boolean
}) {
    const [newWallet, setNewWallet] = useState({ name: '', account: '', qrCodeUrl: '' });
    const [showAddWallet, setShowAddWallet] = useState(false);
    const [qrPreview, setQrPreview] = useState<string>('');
    const [showCustomCountry, setShowCustomCountry] = useState(false);
    const [customCountry, setCustomCountry] = useState({ name: '', symbol: '', wallets: [''] });
    const [showCustomWallet, setShowCustomWallet] = useState(false);
    const [customWalletName, setCustomWalletName] = useState('');
    
    const selectedCountryData = digitalWalletsByCountry[djProfile.payment.country as keyof typeof digitalWalletsByCountry || 'Perú'];
    const displaySymbol = djProfile.payment.customCurrencySymbol || selectedCountryData?.symbol || '$';
    
    const addDigitalWallet = () => {
        if (newWallet.name && newWallet.account) {
            const updatedWallets = [...djProfile.payment.digitalWallets, {
                name: newWallet.name,
                account: newWallet.account,
                qrCodeUrl: qrPreview
            }];
            onPaymentChange('digitalWallets', updatedWallets);
            setNewWallet({ name: '', account: '', qrCodeUrl: '' });
            setQrPreview('');
            setShowAddWallet(false);
        }
    };
    
    const removeDigitalWallet = (index: number) => {
        const updatedWallets = djProfile.payment.digitalWallets.filter((_, i) => i !== index);
        onPaymentChange('digitalWallets', updatedWallets);
    };
    
    const handleQrImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            // Mostrar preview inmediato
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setQrPreview(result);
            };
            reader.readAsDataURL(file);
            
            // Subir imagen al servidor
            try {
                const filename = `${Date.now()}-${file.name}`;
                const response = await fetch(`/api/upload?filename=${encodeURIComponent(filename)}`, {
                    method: 'POST',
                    body: file,
                });
                
                if (!response.ok) {
                    throw new Error('Error al subir la imagen');
                }
                
                const blob = await response.json();
                // Actualizar el preview con la URL pública
                setQrPreview(blob.url);
                
            } catch (error) {
                console.error('Error uploading QR image:', error);
                alert('Error al subir la imagen QR. Inténtalo de nuevo.');
            }
        }
    };
    
    const addCustomCountry = () => {
        if (customCountry.name && customCountry.symbol) {
            // Agregar el país personalizado temporalmente
            const newCountryData = {
                currency: `${customCountry.name} (${customCountry.symbol})`,
                symbol: customCountry.symbol,
                wallets: customCountry.wallets.filter(w => w.trim() !== '')
            };
            
            // Actualizar el país seleccionado
            onPaymentChange('country', customCountry.name);
            onPaymentChange('customCurrencySymbol', customCountry.symbol);
            
            // Resetear el formulario
            setCustomCountry({ name: '', symbol: '', wallets: [''] });
            setShowCustomCountry(false);
        }
    };
    
    const addCustomWallet = () => {
        if (customWalletName.trim()) {
            const selectedCountryData = digitalWalletsByCountry[djProfile.payment.country as keyof typeof digitalWalletsByCountry || 'Perú'];
            if (selectedCountryData && selectedCountryData.wallets) {
                // Agregar la billetera personalizada a la lista del país
                selectedCountryData.wallets.push(customWalletName.trim());
            }
            setCustomWalletName('');
            setShowCustomWallet(false);
        }
    };
    
    return (
        <Card className={`max-w-4xl mx-auto ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <CardHeader className="p-4 sm:p-6">
                <CardTitle className={`font-headline text-lg sm:text-xl lg:text-2xl flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" /> Configuración de Pagos
                </CardTitle>
                <CardDescription className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Configura tus métodos de pago para recibir propinas de tus fans.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                {/* País y Configuración de Moneda */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                        <Label className={`text-sm sm:text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>País *</Label>
                        <Select value={djProfile.payment.country || ''} onValueChange={(value) => {
                            if (value === 'Otro') {
                                setShowCustomCountry(true);
                            } else {
                                onPaymentChange('country', value);
                            }
                        }}>
                            <SelectTrigger className={`text-sm sm:text-base ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}>
                                <SelectValue placeholder="Selecciona tu país" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.keys(digitalWalletsByCountry).map((country) => (
                                    <SelectItem key={country} value={country}>{country}</SelectItem>
                                ))}
                                <SelectItem value="Otro">Otro (Configurar manualmente)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="space-y-2">
                        <Label className={`text-sm sm:text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Símbolo de Moneda
                        </Label>
                        <Input
                            type="text"
                            maxLength={3}
                            value={djProfile.payment.customCurrencySymbol || ''}
                            onChange={(e) => onPaymentChange('customCurrencySymbol', e.target.value)}
                            className={`text-sm sm:text-base ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                            placeholder={selectedCountryData?.symbol || '$'}
                        />
                    </div>
                </div>
                
                {/* Monto mínimo de propina */}
                <div className="space-y-3">
                    <Label className={`font-semibold text-base sm:text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        💰 Monto mínimo de propina
                    </Label>
                    <div className="relative">
                        <div className={`absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-base sm:text-lg font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            {displaySymbol}
                        </div>
                        <Input
                            type="number"
                            min="1"
                            value={djProfile.payment.minTip}
                            onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (isNaN(value) || value < 1) {
                                    onPaymentChange('minTip', 1);
                                } else {
                                    onPaymentChange('minTip', value);
                                }
                            }}
                            onBlur={(e) => {
                                const value = parseInt(e.target.value);
                                if (isNaN(value) || value < 1) {
                                    onPaymentChange('minTip', 1);
                                }
                            }}
                            placeholder="1"
                            className={`pl-8 sm:pl-12 text-base sm:text-lg font-bold text-center transition-all duration-300 hover:scale-105 focus:scale-105 ${
                                isDarkMode 
                                    ? 'bg-gray-700/80 border-gray-500 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20' 
                                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                            } shadow-lg hover:shadow-xl focus:shadow-xl`}
                            style={{
                                borderRadius: '12px',
                                fontWeight: '700',
                                letterSpacing: '0.5px'
                            }}
                        />
                        <div className={`absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            mín.
                        </div>
                    </div>

                </div>
                
                {/* Configuración personalizada de país */}
                {showCustomCountry && (
                    <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                        <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Configurar País Personalizado</h3>
                        <div className="space-y-3">
                            <div>
                                <Label className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Nombre del País</Label>
                                <Input
                                    value={customCountry.name}
                                    onChange={(e) => setCustomCountry({...customCountry, name: e.target.value})}
                                    placeholder="Ej: Venezuela"
                                    className={isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : ''}
                                />
                            </div>
                            <div>
                                <Label className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Símbolo de Moneda</Label>
                                <Input
                                    value={customCountry.symbol}
                                    onChange={(e) => setCustomCountry({...customCountry, symbol: e.target.value})}
                                    placeholder="Ej: Bs, ₡, etc."
                                    className={isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : ''}
                                />
                            </div>
                            <div>
                                <Label className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Billeteras Digitales (separadas por coma)</Label>
                                <Input
                                    value={customCountry.wallets.join(', ')}
                                    onChange={(e) => setCustomCountry({...customCountry, wallets: e.target.value.split(',').map(w => w.trim())})}
                                    placeholder="Ej: Pago Móvil, Zelle, Binance Pay"
                                    className={isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : ''}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={addCustomCountry} className="flex-1">
                                    <Check className="w-4 h-4 mr-2" />
                                    Agregar País
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        setShowCustomCountry(false);
                                        setCustomCountry({ name: '', symbol: '', wallets: [''] });
                                    }}
                                    className="flex-1"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* PayPal */}
                <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center space-x-2">
                        <Switch
                            checked={djProfile.payment.paypalEnabled}
                            onCheckedChange={(checked) => onPaymentChange('paypalEnabled', checked)}
                        />
                        <Label className={`text-sm sm:text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Habilitar PayPal</Label>
                    </div>
                    
                    {djProfile.payment.paypalEnabled && (
                        <div className="space-y-3 sm:space-y-4 pl-4 sm:pl-6">
                            <div className="space-y-2">
                                <Label className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email de PayPal</Label>
                                <Input
                                    type="email"
                                    value={djProfile.payment.paypalEmail}
                                    onChange={(e) => onPaymentChange('paypalEmail', e.target.value)}
                                    placeholder="tu-email@paypal.com"
                                    className={`text-sm sm:text-base ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Link de PayPal.me</Label>
                                <Input
                                    value={djProfile.payment.paypalMeLink}
                                    onChange={(e) => onPaymentChange('paypalMeLink', e.target.value)}
                                    placeholder="https://paypal.me/tunombre"
                                    className={`text-sm sm:text-base ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                />
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Billeteras Digitales */}
                {djProfile.payment.country && (
                    <div className="space-y-3 sm:space-y-4">
                        <Label className={`text-sm sm:text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Billeteras Digitales ({selectedCountryData?.currency || 'Moneda no especificada'})
                        </Label>
                        
                        {djProfile.payment.digitalWallets.map((wallet, index) => (
                            <div key={index} className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{wallet.name}</div>
                                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{wallet.account}</div>
                                        {wallet.qrCodeUrl && (
                                            <div className="mt-2">
                                                <img 
                                                    src={wallet.qrCodeUrl} 
                                                    alt={`QR de ${wallet.name}`}
                                                    className="w-16 h-16 object-cover rounded border"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeDigitalWallet(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        
                        {showAddWallet ? (
                            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                                <div className="space-y-3">
                                    <Select value={newWallet.name} onValueChange={(value) => setNewWallet({...newWallet, name: value})}>
                                        <SelectTrigger className={isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : ''}>
                                            <SelectValue placeholder="Selecciona una billetera" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {selectedCountryData?.wallets?.map((wallet: string) => (
                                                <SelectItem key={wallet} value={wallet}>{wallet}</SelectItem>
                                            )) || []}
                                            <SelectItem value="custom">Otra billetera (personalizada)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    
                                    {/* Campo personalizado para billetera */}
                                    {newWallet.name === 'custom' && (
                                        <Input
                                            placeholder="Nombre de la billetera personalizada"
                                            value={customWalletName}
                                            onChange={(e) => {
                                                setCustomWalletName(e.target.value);
                                                setNewWallet({...newWallet, name: e.target.value});
                                            }}
                                            className={isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : ''}
                                        />
                                    )}
                                    <Input
                                        placeholder="Número de Teléfono o Número de Cuenta Bancaria"
                                        value={newWallet.account}
                                        onChange={(e) => setNewWallet({...newWallet, account: e.target.value})}
                                        className={isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : ''}
                                    />
                                    
                                    {/* Subir código QR */}
                                    <div className="space-y-2">
                                        <Label className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Código QR de Pago (Opcional)
                                        </Label>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1">
                                                <input
                                                    id="qr-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleQrImageSelect}
                                                    className="hidden"
                                                />
                                                <Button 
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => document.getElementById('qr-upload')?.click()}
                                                    className={`inline-flex items-center gap-2 px-3 py-2 ${isDarkMode ? 'border-gray-600 text-black hover:bg-gray-700' : 'border-gray-300 text-black hover:bg-gray-50'}`}
                                                >
                                                    <Upload className="w-4 h-4" />
                                                    {qrPreview ? 'Cambiar QR' : 'Seleccionar código QR'}
                                                </Button>
                                            </div>
                                            {qrPreview && (
                                                <div className="relative">
                                                    <img 
                                                        src={qrPreview} 
                                                        alt="Vista previa QR"
                                                        className="w-12 h-12 object-cover rounded border"
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setQrPreview('')}
                                                        className="absolute -top-1 -right-1 w-5 h-5 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <Button onClick={addDigitalWallet} size="sm">
                                            <Check className="w-4 h-4 mr-1" /> Agregar
                                        </Button>
                                        <Button variant="outline" onClick={() => {
                                            setShowAddWallet(false);
                                            setQrPreview('');
                                            setNewWallet({ name: '', account: '', qrCodeUrl: '' });
                                        }} size="sm">
                                            <X className="w-4 h-4 mr-1" /> Cancelar
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowAddWallet(true)}
                                    className={`w-full font-bold ${isDarkMode ? 'bg-white border-gray-300 text-black hover:bg-gray-100' : 'bg-white border-gray-300 text-black hover:bg-gray-100'}`}
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Agregar Billetera Digital
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowCustomWallet(true)}
                                    className={`w-full font-bold ${isDarkMode ? 'bg-white border-gray-300 text-black hover:bg-gray-100' : 'bg-white border-gray-300 text-black hover:bg-gray-100'}`}
                                >
                                    <Settings className="w-4 h-4 mr-2" /> Agregar Billetera Personalizada
                                </Button>
                            </div>
                        )}
                        
                        {/* Formulario para agregar billetera personalizada */}
                        {showCustomWallet && (
                            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                                <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Agregar Billetera Personalizada</h3>
                                <div className="space-y-3">
                                    <Input
                                        placeholder="Nombre de la billetera (ej: Binance Pay, Revolut)"
                                        value={customWalletName}
                                        onChange={(e) => setCustomWalletName(e.target.value)}
                                        className={isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : ''}
                                    />
                                    <div className="flex gap-2">
                                        <Button onClick={addCustomWallet} className="flex-1">
                                            <Check className="w-4 h-4 mr-2" />
                                            Agregar a Lista
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            onClick={() => {
                                                setShowCustomWallet(false);
                                                setCustomWalletName('');
                                            }}
                                            className="flex-1"
                                        >
                                            <X className="w-4 h-4 mr-2" />
                                            Cancelar
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                
                {/* Navegación */}
                <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 pt-4 sm:pt-6">
                    <Button variant="outline" onClick={onPrevious} className={`text-sm sm:text-base font-bold ${isDarkMode ? 'bg-white border-gray-300 text-black hover:bg-gray-100' : 'bg-white border-gray-300 text-black hover:bg-gray-100'}`}>
                        <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-2" /> Anterior
                    </Button>
                    <Button onClick={onNext} disabled={!isStepValid} className="text-sm sm:text-base">
                        Siguiente <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function PreviewPage({ djProfile, onNext, onPrevious, isDarkMode }: {
    djProfile: DJProfile,
    onNext: () => void,
    onPrevious: () => void,
    isDarkMode: boolean
}) {
    const [previewMode, setPreviewMode] = useState<'form' | 'customize'>('form');
    const [formStep, setFormStep] = useState(1);
    const [formData, setFormData] = useState({
        songName: '',
        artistName: '',
        genre: '',
        requesterName: '',
        selectedWallet: '',
        paymentProof: null as File | null,
        paymentProofUrl: ''
    });
    
    // Estilos predefinidos
    const predefinedStyles = {
        minimal: {
            fontSize: 14,
            fontFamily: 'Inter',
            textColor: '#f8fafc',
            backgroundColor: '#0f172a',
            borderRadius: 12,
            primaryColor: '#3b82f6',
            buttonStyle: 'outline' as 'solid' | 'outline' | 'ghost' | 'gradient',
            spacing: 'compact' as 'compact' | 'normal' | 'relaxed' | 'loose',
            animations: 'subtle' as 'enabled' | 'disabled' | 'subtle' | 'enhanced',
            hoverEffects: 'normal' as 'none' | 'normal' | 'glow' | 'scale',
            shadowStyle: 'subtle' as 'none' | 'subtle' | 'normal' | 'dramatic',
            transparency: 5,
            gradientStyle: 'none' as 'none' | 'subtle' | 'vibrant' | 'rainbow',
            iconStyle: 'outlined' as 'default' | 'filled' | 'outlined' | 'rounded',
            inputBackgroundColor: 'rgba(30, 41, 59, 0.8)',
            inputTextColor: '#f1f5f9',
            inputBorderColor: 'rgba(59, 130, 246, 0.3)'
        },
        modern: {
            fontSize: 16,
            fontFamily: 'Poppins',
            textColor: '#e2e8f0',
            backgroundColor: '#1e293b',
            borderRadius: 16,
            primaryColor: '#8b5cf6',
            buttonStyle: 'gradient' as 'solid' | 'outline' | 'ghost' | 'gradient',
            spacing: 'normal' as 'compact' | 'normal' | 'relaxed' | 'loose',
            animations: 'enhanced' as 'enabled' | 'disabled' | 'subtle' | 'enhanced',
            hoverEffects: 'glow' as 'none' | 'normal' | 'glow' | 'scale',
            shadowStyle: 'normal' as 'none' | 'subtle' | 'normal' | 'dramatic',
            transparency: 10,
            gradientStyle: 'subtle' as 'none' | 'subtle' | 'vibrant' | 'rainbow',
            iconStyle: 'rounded' as 'default' | 'filled' | 'outlined' | 'rounded',
            inputBackgroundColor: 'rgba(51, 65, 85, 0.6)',
            inputTextColor: '#f8fafc',
            inputBorderColor: 'rgba(139, 92, 246, 0.4)'
        },
        professional: {
            fontSize: 15,
            fontFamily: 'Roboto',
            textColor: '#cbd5e1',
            backgroundColor: '#334155',
            borderRadius: 8,
            primaryColor: '#06b6d4',
            buttonStyle: 'solid' as 'solid' | 'outline' | 'ghost' | 'gradient',
            spacing: 'relaxed' as 'compact' | 'normal' | 'relaxed' | 'loose',
            animations: 'enabled' as 'enabled' | 'disabled' | 'subtle' | 'enhanced',
            hoverEffects: 'scale' as 'none' | 'normal' | 'glow' | 'scale',
            shadowStyle: 'dramatic' as 'none' | 'subtle' | 'normal' | 'dramatic',
            transparency: 0,
            gradientStyle: 'none' as 'none' | 'subtle' | 'vibrant' | 'rainbow',
            iconStyle: 'filled' as 'default' | 'filled' | 'outlined' | 'rounded',
            inputBackgroundColor: 'rgba(71, 85, 105, 0.7)',
            inputTextColor: '#e2e8f0',
            inputBorderColor: 'rgba(6, 182, 212, 0.5)'
        },
        elegant: {
            fontSize: 16,
            fontFamily: 'Georgia',
            textColor: '#f1f5f9',
            backgroundColor: '#0c0a09',
            borderRadius: 20,
            primaryColor: '#f59e0b',
            buttonStyle: 'ghost' as 'solid' | 'outline' | 'ghost' | 'gradient',
            spacing: 'loose' as 'compact' | 'normal' | 'relaxed' | 'loose',
            animations: 'subtle' as 'enabled' | 'disabled' | 'subtle' | 'enhanced',
            hoverEffects: 'glow' as 'none' | 'normal' | 'glow' | 'scale',
            shadowStyle: 'subtle' as 'none' | 'subtle' | 'normal' | 'dramatic',
            transparency: 15,
            gradientStyle: 'vibrant' as 'none' | 'subtle' | 'vibrant' | 'rainbow',
            iconStyle: 'default' as 'default' | 'filled' | 'outlined' | 'rounded',
            inputBackgroundColor: 'rgba(41, 37, 36, 0.9)',
            inputTextColor: '#fbbf24',
            inputBorderColor: 'rgba(245, 158, 11, 0.6)'
        }
    };

    // Configuración de personalización
    const [customization, setCustomization] = useState({
        fontSize: 16,
        fontFamily: 'Inter',
        textColor: '#f8fafc',
        backgroundColor: '#0f172a',
        borderRadius: 8,
        primaryColor: '#8b5cf6',
        buttonStyle: 'solid' as 'solid' | 'outline' | 'ghost' | 'gradient',
        spacing: 'normal' as 'compact' | 'normal' | 'relaxed' | 'loose',
        animations: 'enabled' as 'enabled' | 'disabled' | 'subtle' | 'enhanced',
        hoverEffects: 'normal' as 'none' | 'normal' | 'glow' | 'scale',
        shadowStyle: 'normal' as 'none' | 'subtle' | 'normal' | 'dramatic',
        transparency: 0,
        gradientStyle: 'none' as 'none' | 'subtle' | 'vibrant' | 'rainbow',
        iconStyle: 'default' as 'default' | 'filled' | 'outlined' | 'rounded',
        inputBackgroundColor: 'rgba(30, 41, 59, 0.8)',
        inputTextColor: '#f1f5f9',
        inputBorderColor: 'rgba(139, 92, 246, 0.3)'
    });

    const applyPredefinedStyle = (styleName: keyof typeof predefinedStyles) => {
        setCustomization(predefinedStyles[styleName]);
    };
    
    const selectedCountryData = digitalWalletsByCountry[djProfile.payment.country as keyof typeof digitalWalletsByCountry || 'Perú'];
    const displaySymbol = djProfile.payment.customCurrencySymbol || selectedCountryData?.symbol || '$';
    
    const handleFormNext = () => {
        if (formStep < 4) {
            setFormStep(formStep + 1);
        }
    };
    
    const handleFormPrevious = () => {
        if (formStep > 1) {
            setFormStep(formStep - 1);
        }
    };
    
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData({ ...formData, paymentProof: file });
            const url = URL.createObjectURL(file);
            setFormData(prev => ({ ...prev, paymentProofUrl: url }));
        }
    };
    
    const sendToWhatsApp = () => {
        // Obtener el nombre del archivo del comprobante
        const receiptFileName = formData.paymentProof ? formData.paymentProof.name : 'No adjuntado';
        
        const message = `🎵 *Solicitud de Cancion*\n\n` +
            `🎶 *Cancion:* ${formData.songName}\n` +
            `🎤 *Artista:* ${formData.artistName}\n` +
            `🎼 *Genero:* ${formData.genre || 'No especificado'}\n` +
            `👤 *Solicitado por:* ${formData.requesterName || 'Anonimo'}\n` +
            `💳 *Metodo de pago:* ${formData.selectedWallet}\n` +
            `💰 *Monto:* ${displaySymbol}${djProfile.payment.minTip}\n\n` +
            `📄 *Comprobante:* ${receiptFileName}\n\n` +
            `🎧 *Enviado desde TuneConnect*`;
        
        // Limpiar el número de WhatsApp (remover espacios, guiones, etc.)
        const cleanWhatsappNumber = djProfile.notifications.whatsappNumber.replace(/[^\d+]/g, '');
        const whatsappUrl = `https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };
    
    const isStepValid = () => {
        switch (formStep) {
            case 1:
                return formData.songName.trim() !== '' && formData.artistName.trim() !== '';
            case 2:
                return formData.selectedWallet !== '';
            case 3:
                return formData.paymentProof !== null;
            case 4:
                return true;
            default:
                return false;
        }
    };
    
    if (previewMode === 'customize') {
        return (
            <Card className={`max-w-4xl mx-auto ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                <CardHeader className="p-4 sm:p-6">
                    <CardTitle className={`font-headline text-lg sm:text-xl lg:text-2xl flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        <Settings className="w-5 h-5 sm:w-6 sm:h-6" /> Personalizar Formulario
                    </CardTitle>
                    <CardDescription className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Personaliza la apariencia de tu formulario de solicitudes.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        {/* Controles de personalización */}
                        <div className="space-y-4 sm:space-y-6">
                            {/* Sección de Estilos Predefinidos */}
                            <div className={`p-3 sm:p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                <h4 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    <Palette className="h-4 w-4 sm:h-5 sm:w-5" />
                                    Estilos Predefinidos
                                </h4>
                                <p className={`text-xs sm:text-sm mb-3 sm:mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Elige entre nuestros diseños profesionales optimizados
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                    <button
                                        onClick={() => applyPredefinedStyle('minimal')}
                                        className={`p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                                            isDarkMode 
                                                ? 'bg-slate-800 border-blue-500/30 hover:border-blue-400 text-white' 
                                                : 'bg-white border-blue-200 hover:border-blue-400 text-gray-900'
                                        }`}
                                    >
                                        <div className="text-xs sm:text-sm font-medium">Minimalista</div>
                                        <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Limpio y simple</div>
                                    </button>
                                    <button
                                        onClick={() => applyPredefinedStyle('modern')}
                                        className={`p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                                            isDarkMode 
                                                ? 'bg-slate-800 border-purple-500/30 hover:border-purple-400 text-white' 
                                                : 'bg-white border-purple-200 hover:border-purple-400 text-gray-900'
                                        }`}
                                    >
                                        <div className="text-xs sm:text-sm font-medium">Moderno</div>
                                        <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Vibrante y dinámico</div>
                                    </button>
                                    <button
                                        onClick={() => applyPredefinedStyle('professional')}
                                        className={`p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                                            isDarkMode 
                                                ? 'bg-slate-800 border-cyan-500/30 hover:border-cyan-400 text-white' 
                                                : 'bg-white border-cyan-200 hover:border-cyan-400 text-gray-900'
                                        }`}
                                    >
                                        <div className="text-xs sm:text-sm font-medium">Profesional</div>
                                        <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Corporativo y elegante</div>
                                    </button>
                                    <button
                                        onClick={() => applyPredefinedStyle('elegant')}
                                        className={`p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                                            isDarkMode 
                                                ? 'bg-slate-800 border-amber-500/30 hover:border-amber-400 text-white' 
                                                : 'bg-white border-amber-200 hover:border-amber-400 text-gray-900'
                                        }`}
                                    >
                                        <div className="text-xs sm:text-sm font-medium">Elegante</div>
                                        <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sofisticado y premium</div>
                                    </button>
                                </div>
                            </div>

                            {/* Sección de Animaciones y Efectos */}
                            <div className={`p-3 sm:p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                <h4 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                                    Animaciones y Efectos
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                    <div>
                                        <Label className={`text-sm sm:text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Animaciones</Label>
                                        <select 
                                            value={customization.animations || "enabled"}
                                            onChange={(e) => setCustomization({...customization, animations: e.target.value as 'enabled' | 'disabled' | 'subtle' | 'enhanced'})}
                                            className={`w-full mt-1 sm:mt-2 p-2 text-sm sm:text-base rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                        >
                                            <option value="enabled">Habilitadas</option>
                                            <option value="disabled">Deshabilitadas</option>
                                            <option value="subtle">Sutiles</option>
                                            <option value="enhanced">Mejoradas</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Label className={`text-sm sm:text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Efectos de Hover</Label>
                                        <select 
                                            value={customization.hoverEffects || "normal"}
                                            onChange={(e) => setCustomization({...customization, hoverEffects: e.target.value as 'none' | 'normal' | 'glow' | 'scale'})}
                                            className={`w-full mt-1 sm:mt-2 p-2 text-sm sm:text-base rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                        >
                                            <option value="none">Sin efectos</option>
                                            <option value="normal">Normal</option>
                                            <option value="glow">Resplandor</option>
                                            <option value="scale">Escala</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Sección de Tema Visual */}
                            <div className={`p-3 sm:p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                <h4 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    <Palette className="h-4 w-4 sm:h-5 sm:w-5" />
                                    Tema Visual
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                    <div>
                                        <Label className={`text-sm sm:text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Estilo de Sombras</Label>
                                        <select 
                                            value={customization.shadowStyle || "normal"}
                                            onChange={(e) => setCustomization({...customization, shadowStyle: e.target.value as 'none' | 'subtle' | 'normal' | 'dramatic'})}
                                            className={`w-full mt-1 sm:mt-2 p-2 text-sm sm:text-base rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                        >
                                            <option value="none">Sin sombras</option>
                                            <option value="subtle">Sutiles</option>
                                            <option value="normal">Normal</option>
                                            <option value="dramatic">Dramáticas</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Label className={`text-sm sm:text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Transparencia</Label>
                                        <Input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={customization.transparency || 0}
                                            onChange={(e) => setCustomization({...customization, transparency: parseInt(e.target.value)})}
                                            className="mt-1 sm:mt-2"
                                        />
                                        <span className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{customization.transparency || 0}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Opciones de Estilo del Formulario */}
                            <div className="space-y-3 sm:space-y-4">
                                <h4 className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Estilo del Formulario</h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                    <div>
                                        <Label className={`text-sm sm:text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Tamaño de letra</Label>
                                        <Input
                                            type="range"
                                            min="12"
                                            max="24"
                                            value={customization.fontSize}
                                            onChange={(e) => setCustomization({...customization, fontSize: parseInt(e.target.value)})}
                                            className="mt-1 sm:mt-2"
                                        />
                                        <span className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{customization.fontSize}px</span>
                                    </div>
                                    
                                    <div>
                                        <Label className={`text-sm sm:text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Tipo de letra</Label>
                                        <select 
                                            value={customization.fontFamily}
                                            onChange={(e) => setCustomization({...customization, fontFamily: e.target.value})}
                                            className={`w-full mt-1 sm:mt-2 p-2 text-sm sm:text-base rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                        >
                                            <option value="Inter">Inter (Moderno)</option>
                                            <option value="Arial">Arial (Clásico)</option>
                                            <option value="Helvetica">Helvetica (Elegante)</option>
                                            <option value="Georgia">Georgia (Serif)</option>
                                            <option value="Times New Roman">Times New Roman</option>
                                            <option value="Poppins">Poppins (Redondeado)</option>
                                            <option value="Roboto">Roboto (Tecnológico)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                    <div>
                                        <Label className={`text-sm sm:text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Color Principal</Label>
                                        <div className="flex gap-2 mt-1 sm:mt-2">
                                            <Input
                                                type="color"
                                                value={customization.primaryColor || "#8b5cf6"}
                                                onChange={(e) => setCustomization({...customization, primaryColor: e.target.value})}
                                                className="w-12 sm:w-16 h-8 sm:h-10"
                                            />
                                            <Input
                                                type="text"
                                                value={customization.primaryColor || "#8b5cf6"}
                                                onChange={(e) => setCustomization({...customization, primaryColor: e.target.value})}
                                                className="flex-1 text-sm sm:text-base"
                                                placeholder="#8b5cf6"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <Label className={`text-sm sm:text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Color de texto</Label>
                                        <div className="flex gap-2 mt-1 sm:mt-2">
                                            <Input
                                                type="color"
                                                value={customization.textColor}
                                                onChange={(e) => setCustomization({...customization, textColor: e.target.value})}
                                                className="w-12 sm:w-16 h-8 sm:h-10"
                                            />
                                            <Input
                                                type="text"
                                                value={customization.textColor}
                                                onChange={(e) => setCustomization({...customization, textColor: e.target.value})}
                                                className="flex-1 text-sm sm:text-base"
                                                placeholder="#000000"
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                    <div>
                                        <Label className={`text-sm sm:text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Color de fondo</Label>
                                        <div className="flex gap-2 mt-1 sm:mt-2">
                                            <Input
                                                type="color"
                                                value={customization.backgroundColor}
                                                onChange={(e) => setCustomization({...customization, backgroundColor: e.target.value})}
                                                className="w-12 sm:w-16 h-8 sm:h-10"
                                            />
                                            <Input
                                                type="text"
                                                value={customization.backgroundColor}
                                                onChange={(e) => setCustomization({...customization, backgroundColor: e.target.value})}
                                                className="flex-1 text-sm sm:text-base"
                                                placeholder="#ffffff"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <Label className={`text-sm sm:text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Bordes redondeados</Label>
                                        <Input
                                            type="range"
                                            min="0"
                                            max="20"
                                            value={customization.borderRadius}
                                            onChange={(e) => setCustomization({...customization, borderRadius: parseInt(e.target.value)})}
                                            className="mt-1 sm:mt-2"
                                        />
                                        <span className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{customization.borderRadius}px</span>
                                    </div>
                                </div>
                                
                                {/* Configuración de Campos de Entrada */}
                                <div className="space-y-4">
                                    <h5 className={`text-md font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Estilo de Campos de Entrada</h5>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <Label className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Color de fondo de campos</Label>
                                            <div className="flex gap-2 mt-2">
                                                <Input
                                                    type="color"
                                                    value={customization.inputBackgroundColor}
                                                    onChange={(e) => setCustomization({...customization, inputBackgroundColor: e.target.value})}
                                                    className="w-16 h-10"
                                                />
                                                <Input
                                                    type="text"
                                                    value={customization.inputBackgroundColor}
                                                    onChange={(e) => setCustomization({...customization, inputBackgroundColor: e.target.value})}
                                                    className="flex-1"
                                                    placeholder="#374151"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <Label className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Color de texto de campos</Label>
                                            <div className="flex gap-2 mt-2">
                                                <Input
                                                    type="color"
                                                    value={customization.inputTextColor}
                                                    onChange={(e) => setCustomization({...customization, inputTextColor: e.target.value})}
                                                    className="w-16 h-10"
                                                />
                                                <Input
                                                    type="text"
                                                    value={customization.inputTextColor}
                                                    onChange={(e) => setCustomization({...customization, inputTextColor: e.target.value})}
                                                    className="flex-1"
                                                    placeholder="#ffffff"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <Label className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Color de borde de campos</Label>
                                            <div className="flex gap-2 mt-2">
                                                <Input
                                                    type="color"
                                                    value={customization.inputBorderColor}
                                                    onChange={(e) => setCustomization({...customization, inputBorderColor: e.target.value})}
                                                    className="w-16 h-10"
                                                />
                                                <Input
                                                    type="text"
                                                    value={customization.inputBorderColor}
                                                    onChange={(e) => setCustomization({...customization, inputBorderColor: e.target.value})}
                                                    className="flex-1"
                                                    placeholder="#6b7280"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Opciones Adicionales */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Estilo de Botones</Label>
                                        <select 
                                            value={customization.buttonStyle || "solid"}
                                            onChange={(e) => setCustomization({...customization, buttonStyle: e.target.value as 'outline' | 'solid' | 'ghost' | 'gradient'})}
                                            className={`w-full mt-2 p-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                        >
                                            <option value="solid">Sólido</option>
                                            <option value="outline">Contorno</option>
                                            <option value="ghost">Fantasma</option>
                                            <option value="gradient">Degradado</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <Label className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Espaciado</Label>
                                        <select 
                                            value={customization.spacing || "normal"}
                                            onChange={(e) => setCustomization({...customization, spacing: e.target.value as 'compact' | 'normal' | 'relaxed' | 'loose'})}
                                            className={`w-full mt-2 p-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                        >
                                            <option value="compact">Compacto</option>
                                            <option value="normal">Normal</option>
                                            <option value="relaxed">Relajado</option>
                                            <option value="loose">Amplio</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Configuración de Gradientes */}
                                <div>
                                    <Label className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Estilo de Gradientes</Label>
                                    <select 
                                        value={customization.gradientStyle || "none"}
                                        onChange={(e) => setCustomization({...customization, gradientStyle: e.target.value as 'subtle' | 'none' | 'vibrant' | 'rainbow'})}
                                        className={`w-full mt-2 p-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                    >
                                        <option value="none">Sin gradientes</option>
                                        <option value="subtle">Gradientes sutiles</option>
                                        <option value="vibrant">Gradientes vibrantes</option>
                                        <option value="rainbow">Gradientes arcoíris</option>
                                    </select>
                                </div>

                                {/* Configuración de Iconos */}
                                <div>
                                    <Label className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Estilo de Iconos</Label>
                                    <select 
                                        value={customization.iconStyle || "default"}
                                        onChange={(e) => setCustomization({...customization, iconStyle: e.target.value as 'default' | 'outlined' | 'filled' | 'rounded'})}
                                        className={`w-full mt-2 p-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                    >
                                        <option value="default">Por defecto</option>
                                        <option value="filled">Rellenos</option>
                                        <option value="outlined">Contorno</option>
                                        <option value="rounded">Redondeados</option>
                                    </select>
                                </div>

                                {/* Botones de Acción */}
                                <div className="flex gap-3 pt-4">
                                    <Button 
                                        onClick={() => setCustomization({
                                            fontSize: 16,
                                            fontFamily: 'Inter',
                                            textColor: djProfile.colors.text || '#000000',
                                            backgroundColor: djProfile.colors.background || '#ffffff',
                                            borderRadius: 8,
                                            primaryColor: '#8b5cf6',
                                            buttonStyle: 'solid',
                                            spacing: 'normal',
                                            animations: 'enabled',
                                            hoverEffects: 'normal',
                                            shadowStyle: 'normal',
                                            transparency: 0,
                                            gradientStyle: 'none',
                                            iconStyle: 'default',
                                            inputBackgroundColor: '#ffffff',
                                            inputTextColor: '#000000',
                                            inputBorderColor: '#d1d5db'
                                        })}
                                        variant="outline"
                                        size="sm"
                                    >
                                        <RotateCcw className="h-4 w-4 mr-2" />
                                        Restablecer
                                    </Button>
                                    <Button 
                                        onClick={() => {
                            // Crear slug del DJ para usar como clave específica
                            const djSlug = djProfile.djName
                                .toLowerCase()
                                .replace(/[^a-z0-9\s-]/g, '')
                                .replace(/\s+/g, '-')
                                .replace(/-+/g, '-')
                                .replace(/^-+|-+$/g, '');
                            
                            localStorage.setItem(`djFormCustomization_${djSlug}`, JSON.stringify(customization));
                            console.log(`🎨 Personalización guardada para ${djSlug}:`, customization);
                            
                            // Mostrar notificación temporal
                            const button = document.activeElement as HTMLButtonElement;
                            const originalText = button.textContent;
                            button.textContent = '✓ Guardado';
                            button.style.backgroundColor = '#10b981';
                            button.style.color = 'white';
                            setTimeout(() => {
                                button.textContent = originalText;
                                button.style.backgroundColor = '';
                                button.style.color = '';
                                            }, 2000);
                                        }}
                                        variant="outline"
                                        size="sm"
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        Guardar Estilo
                                    </Button>
                                </div>
                            </div>
                        </div>
                        
                        {/* Vista previa */}
                        <div className="space-y-4">
                            <Label className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Vista Previa del Formulario</Label>
                            <div 
                                className="p-6 border-2 border-dashed min-h-[500px] overflow-hidden"
                                style={{
                                    backgroundColor: customization.backgroundColor,
                                    borderRadius: `${customization.borderRadius}px`,
                                    fontFamily: customization.fontFamily,
                                    fontSize: `${customization.fontSize}px`,
                                    color: customization.textColor,
                                    borderColor: customization.primaryColor || '#8b5cf6'
                                }}
                            >
                                {/* Header simple */}
                                <div className="text-center mb-6">
                                    <div className="flex justify-center items-center gap-4 mb-4">
                                        <Avatar className="w-16 h-16">
                                            <AvatarImage src={djProfile.profilePictureUrl} alt={djProfile.djName} />
                                            <AvatarFallback style={{ backgroundColor: customization.primaryColor || '#8b5cf6', color: '#ffffff' }}>
                                                {djProfile.djName.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2">{djProfile.djName}</h2>
                                    <p className="opacity-80">¡Bienvenido a mi cabina de DJ virtual! ¿Qué quieres escuchar?</p>
                                </div>
                                
                                {/* Formulario de ejemplo con datos prellenados */}
                                <div className={`space-y-4 ${customization.spacing === 'compact' ? 'space-y-2' : customization.spacing === 'relaxed' ? 'space-y-6' : customization.spacing === 'loose' ? 'space-y-8' : 'space-y-4'}`}>
                                    <h3 className="text-lg font-semibold mb-4" style={{ color: customization.textColor }}>🎵 Información de la Canción</h3>
                                    
                                    <div>
                                        <label className="block font-medium mb-1" style={{ color: customization.textColor }}>Nombre de la Canción *</label>
                                        <input 
                                            value="Blinding Lights"
                                            readOnly
                                            className="w-full p-3 border rounded transition-all duration-300"
                                            style={{ 
                                                borderRadius: `${customization.borderRadius}px`,
                                                backgroundColor: customization.inputBackgroundColor,
                                                color: customization.inputTextColor,
                                                borderColor: customization.inputBorderColor,
                                                fontSize: `${Math.max(customization.fontSize - 2, 12)}px`
                                            }}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block font-medium mb-1" style={{ color: customization.textColor }}>Artista *</label>
                                        <input 
                                            value="The Weeknd"
                                            readOnly
                                            className="w-full p-3 border rounded transition-all duration-300"
                                            style={{ 
                                                borderRadius: `${customization.borderRadius}px`,
                                                backgroundColor: customization.inputBackgroundColor,
                                                color: customization.inputTextColor,
                                                borderColor: customization.inputBorderColor,
                                                fontSize: `${Math.max(customization.fontSize - 2, 12)}px`
                                            }}
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block font-medium mb-1" style={{ color: customization.textColor }}>Género (Opcional)</label>
                                            <input 
                                                value="Pop, Rock, Reggaeton"
                                                readOnly
                                                className="w-full p-3 border rounded transition-all duration-300"
                                                style={{ 
                                                    borderRadius: `${customization.borderRadius}px`,
                                                    backgroundColor: customization.inputBackgroundColor,
                                                    color: customization.inputTextColor,
                                                    borderColor: customization.inputBorderColor,
                                                    fontSize: `${Math.max(customization.fontSize - 2, 12)}px`
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-medium mb-1" style={{ color: customization.textColor }}>Tu Nombre (Opcional)</label>
                                            <input 
                                                value="María"
                                                readOnly
                                                className="w-full p-3 border rounded transition-all duration-300"
                                                style={{ 
                                                    borderRadius: `${customization.borderRadius}px`,
                                                    backgroundColor: customization.inputBackgroundColor,
                                                    color: customization.inputTextColor,
                                                    borderColor: customization.inputBorderColor,
                                                    fontSize: `${Math.max(customization.fontSize - 2, 12)}px`
                                                }}
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* Sección de método de pago de ejemplo */}
                                    <div className="mt-6">
                                        <h4 className="text-md font-semibold mb-3" style={{ color: customization.textColor }}>💳 Método de Pago</h4>
                                        <div className="p-4 border-2 rounded-lg" style={{ 
                                            borderRadius: `${customization.borderRadius}px`,
                                            backgroundColor: customization.inputBackgroundColor,
                                            borderColor: customization.primaryColor,
                                            opacity: 0.8
                                        }}>
                                            <div className="text-center">
                                                <p className="text-sm opacity-70" style={{ color: customization.textColor }}>Monto de propina</p>
                                                <p className="text-2xl font-bold" style={{ color: customization.primaryColor }}>S/{djProfile.payment?.minTip || '1'}</p>
                                                <p className="text-xs opacity-60 mt-1" style={{ color: customization.textColor }}>Envía exactamente esta cantidad</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Progreso del formulario */}
                                    <div className="flex items-center justify-center space-x-2 mb-4">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{ backgroundColor: customization.primaryColor }}>1</div>
                                        <div className="w-12 h-1 rounded" style={{ backgroundColor: customization.primaryColor }}></div>
                                        <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium" style={{ borderColor: customization.primaryColor, color: customization.primaryColor }}>2</div>
                                        <div className="w-12 h-1 bg-gray-300 rounded"></div>
                                        <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-sm font-medium text-gray-400">3</div>
                                        <div className="w-12 h-1 bg-gray-300 rounded"></div>
                                        <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-sm font-medium text-gray-400">4</div>
                                    </div>
                                    
                                    {/* Botón de ejemplo */}
                                    <button 
                                        className={`w-full py-3 px-6 rounded font-medium transition-all duration-300 ${
                                            customization.buttonStyle === 'outline' ? 'border-2 bg-transparent hover:bg-opacity-10' :
                                            customization.buttonStyle === 'ghost' ? 'bg-transparent hover:bg-opacity-10' :
                                            customization.buttonStyle === 'gradient' ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:shadow-lg' :
                                            'text-white hover:shadow-lg'
                                        }`}
                                        style={{
                                            borderRadius: `${customization.borderRadius}px`,
                                            backgroundColor: customization.buttonStyle === 'solid' ? (customization.primaryColor || '#8b5cf6') : 'transparent',
                                            borderColor: customization.primaryColor || '#8b5cf6',
                                            color: customization.buttonStyle === 'solid' || customization.buttonStyle === 'gradient' ? '#ffffff' : (customization.primaryColor || '#8b5cf6'),
                                            fontSize: `${customization.fontSize}px`,
                                            fontFamily: customization.fontFamily
                                        }}
                                    >
                                        🎵 Siguiente
                                    </button>
                                    
                                    {/* Información adicional */}
                                    <div className="mt-4 p-3 rounded-lg" style={{ 
                                        backgroundColor: `${customization.primaryColor}20`,
                                        borderRadius: `${customization.borderRadius}px`
                                    }}>
                                        <p className="text-sm text-center" style={{ color: customization.textColor, opacity: 0.8 }}>
                                            ✨ Tu solicitud será procesada inmediatamente
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 pt-4 sm:pt-6">
                        <Button 
                            variant="outline" 
                            onClick={() => setPreviewMode('form')}
                            className={`text-sm sm:text-base ${isDarkMode ? 'border-gray-600 text-black hover:bg-gray-700' : 'text-black'}`}
                        >
                            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-2" /> Volver al Formulario
                        </Button>
                        <Button onClick={() => {
                            // Crear slug del DJ para usar como clave específica
                            const djSlug = djProfile.djName
                                .toLowerCase()
                                .replace(/[^a-z0-9\s-]/g, '')
                                .replace(/\s+/g, '-')
                                .replace(/-+/g, '-')
                                .replace(/^-+|-+$/g, '');
                            
                            // Guardar configuración en localStorage antes de continuar
                            localStorage.setItem(`djFormCustomization_${djSlug}`, JSON.stringify(customization));
                            console.log(`🎨 Personalización guardada para ${djSlug} (Siguiente):`, customization);
                            onNext();
                        }} className="text-sm sm:text-base">
                            Siguiente <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card className={`max-w-4xl mx-auto ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <CardHeader>
                <CardTitle className={`font-headline text-2xl flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <Eye /> Vista Previa - Formulario de Solicitudes
                </CardTitle>
                <CardDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Así es como los fans podrán solicitar canciones y enviar propinas.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Indicador de pasos */}
                <div className="flex justify-center mb-6">
                    <div className="flex items-center space-x-4">
                        {[1, 2, 3, 4].map((step) => (
                            <div key={step} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                    step === formStep 
                                        ? 'bg-blue-500 text-white' 
                                        : step < formStep 
                                        ? 'bg-green-500 text-white'
                                        : isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                                }`}>
                                    {step < formStep ? <Check className="w-4 h-4" /> : step}
                                </div>
                                {step < 4 && (
                                    <div className={`w-12 h-0.5 ${
                                        step < formStep ? 'bg-green-500' : isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                                    }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Formulario simulado */}
                <div 
                    className="p-6 rounded-lg border-2 border-dashed"
                    style={{
                        backgroundColor: customization.backgroundColor,
                        borderRadius: `${customization.borderRadius}px`,
                        fontFamily: customization.fontFamily,
                        fontSize: `${customization.fontSize}px`,
                        color: customization.textColor,
                        borderColor: isDarkMode ? '#4B5563' : '#D1D5DB'
                    }}
                >
                    {/* Header del formulario */}
                    <div className="text-center mb-6">
                        <div className="flex justify-center items-center mb-4">
                            <Avatar className="w-16 h-16">
                                <AvatarImage src={djProfile.profilePictureUrl} alt={djProfile.djName} />
                                <AvatarFallback style={{ backgroundColor: djProfile.colors.primary, color: djProfile.colors.background }}>
                                    {djProfile.djName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">{djProfile.djName}</h2>
                        <p className="opacity-80">Solicita una canción</p>
                    </div>
                    
                    {/* Paso 1: Información de la canción */}
                    {formStep === 1 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold mb-4">🎵 Información de la Canción</h3>
                            <div>
                                <Label className="font-medium">Nombre de la Canción *</Label>
                                <Input
                                    value={formData.songName}
                                    onChange={(e) => setFormData({...formData, songName: e.target.value})}
                                    placeholder="Ej: Blinding Lights"
                                    className="mt-1"
                                    style={{ borderRadius: `${customization.borderRadius}px` }}
                                />
                            </div>
                            <div>
                                <Label className="font-medium">Nombre del Artista *</Label>
                                <Input
                                    value={formData.artistName}
                                    onChange={(e) => setFormData({...formData, artistName: e.target.value})}
                                    placeholder="Ej: The Weeknd"
                                    className="mt-1"
                                    style={{ borderRadius: `${customization.borderRadius}px` }}
                                />
                            </div>
                            <div>
                                <Label className="font-medium">Género (Opcional)</Label>
                                <Input
                                    value={formData.genre}
                                    onChange={(e) => setFormData({...formData, genre: e.target.value})}
                                    placeholder="Ej: Synth-pop"
                                    className="mt-1"
                                    style={{ borderRadius: `${customization.borderRadius}px` }}
                                />
                            </div>
                            <div>
                                <Label className="font-medium">Tu Nombre (Opcional)</Label>
                                <Input
                                    value={formData.requesterName}
                                    onChange={(e) => setFormData({...formData, requesterName: e.target.value})}
                                    placeholder="Ej: Alex"
                                    className="mt-1"
                                    style={{ borderRadius: `${customization.borderRadius}px` }}
                                />
                            </div>
                        </div>
                    )}
                    
                    {/* Paso 2: Método de pago */}
                    {formStep === 2 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold mb-4">💳 Método de Pago</h3>
                            
                            {/* Monto de propina prominente */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border-2 border-blue-200 text-center mb-6">
                                <p className="text-sm text-gray-600 mb-2">Monto de propina</p>
                                <p className="text-3xl font-bold text-blue-600">{displaySymbol}{djProfile.payment.minTip}</p>
                                <p className="text-xs text-gray-500 mt-1">Envía exactamente esta cantidad</p>
                            </div>
                            
                            <div className="space-y-3">
                                {djProfile.payment.paypalEnabled && djProfile.payment.paypalEmail && (
                                    <div 
                                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all group ${
                                            formData.selectedWallet === 'PayPal' 
                                                ? 'border-blue-500 bg-blue-50' 
                                                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                        }`}
                                        onClick={() => {
                                            setFormData({...formData, selectedWallet: 'PayPal'});
                                            const paypalLink = djProfile.payment.paypalMeLink || `https://paypal.me/${djProfile.payment.paypalEmail}`;
                                            window.open(paypalLink, '_blank', 'noopener,noreferrer');
                                        }}
                                        style={{ borderRadius: `${customization.borderRadius}px` }}
                                        title="Hacer clic para ir a PayPal"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded flex items-center justify-center border border-gray-200">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a9.36 9.36 0 0 1-.077.437c-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106-.32 2.027a.641.641 0 0 0 .633.74h3.94c.524 0 .968-.382 1.05-.9l.043-.27.82-5.18.053-.288c.082-.518.526-.9 1.05-.9h.66c3.743 0 6.671-1.52 7.527-5.917.358-1.837.174-3.37-.777-4.471a3.642 3.642 0 0 0-1.295-.881z" fill="#253B80"/>
                                                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a9.36 9.36 0 0 1-.077.437c-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106-.32 2.027a.641.641 0 0 0 .633.74h3.94c.524 0 .968-.382 1.05-.9l.043-.27.82-5.18.053-.288c.082-.518.526-.9 1.05-.9h.66c3.743 0 6.671-1.52 7.527-5.917.358-1.837.174-3.37-.777-4.471a3.642 3.642 0 0 0-1.295-.881z" fill="#179BD7"/>
                                                    <path d="M6.908 6.208c.08-.518.526-.9 1.05-.9h5.49c.65 0 1.26.044 1.81.132a6.5 6.5 0 0 1 1.526.473c.358-1.837.174-3.37-.777-4.471C14.897.543 12.889 0 10.318 0H2.858c-.524 0-.968.382-1.05.9L-.099 21.237a.641.641 0 0 0 .633.74h4.606l1.12-7.106.648-4.663z" fill="#253B80"/>
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                 <div className="font-medium flex items-center gap-2">
                                                     PayPal
                                                     <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Oficial</span>
                                                 </div>
                                                 <div className="text-sm opacity-70">{djProfile.payment.paypalEmail}</div>
                                             </div>
                                             <div className="flex items-center text-blue-500 group-hover:text-blue-600 transition-colors">
                                                 <ExternalLink className="w-4 h-4" />
                                             </div>
                                        </div>
                                    </div>
                                )}
                                
                                {djProfile.payment.digitalWallets.map((wallet, index) => (
                                    <div 
                                        key={index}
                                        className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                                            formData.selectedWallet === wallet.name 
                                                ? 'border-blue-500 bg-blue-50' 
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() => setFormData({...formData, selectedWallet: wallet.name})}
                                        style={{ borderRadius: `${customization.borderRadius}px` }}
                                    >
                                        {/* Nombre y número de la billetera */}
                                        <div className="text-center mb-4">
                                            <div className="font-bold text-lg">{wallet.name}</div>
                                            <div className="text-sm opacity-70 mt-1">{wallet.account}</div>
                                        </div>
                                        
                                        {/* QR Code centrado y grande */}
                                        {wallet.qrCodeUrl && (
                                            <div className="flex flex-col items-center">
                                                <div className="bg-white p-4 rounded-xl shadow-lg">
                                                    <img 
                                                        src={wallet.qrCodeUrl} 
                                                        alt={`QR de ${wallet.name}`}
                                                        className="w-48 h-48 object-cover rounded-lg"
                                                    />
                                                </div>
                                                <p className="text-sm mt-3 opacity-70 text-center">
                                                    Escanea para pagar rápidamente
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Paso 3: Comprobante */}
                    {formStep === 3 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold mb-4">📄 Comprobante de Pago</h3>
                            <div className="text-center">
                                <div className={`border-2 border-dashed rounded-lg p-8 ${formData.paymentProofUrl ? 'border-green-500' : 'border-gray-300'}`}>
                                    {formData.paymentProofUrl ? (
                                        <div>
                                            <img src={formData.paymentProofUrl} alt="Comprobante" className="max-w-full h-48 object-contain mx-auto mb-4" />
                                            <p className="text-green-600 font-medium">✅ Comprobante cargado</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                            <p className="mb-4">Sube tu comprobante de pago</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        id="payment-proof"
                                    />
                                    <Button 
                                        variant="outline"
                                        onClick={() => document.getElementById('payment-proof')?.click()}
                                        className="mt-2"
                                    >
                                        {formData.paymentProofUrl ? 'Cambiar comprobante' : 'Seleccionar archivo'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Paso 4: Confirmación */}
                    {formStep === 4 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold mb-4">✅ Confirmar y Enviar</h3>
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                <div><strong>Canción:</strong> {formData.songName}</div>
                                <div><strong>Artista:</strong> {formData.artistName}</div>
                                {formData.genre && <div><strong>Género:</strong> {formData.genre}</div>}
                                {formData.requesterName && <div><strong>Solicitado por:</strong> {formData.requesterName}</div>}
                                <div><strong>Método de pago:</strong> {formData.selectedWallet}</div>
                                <div><strong>Monto:</strong> {displaySymbol}{djProfile.payment.minTip}</div>
                            </div>
                            <Button 
                                onClick={sendToWhatsApp}
                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                            >
                                <Phone className="w-4 h-4 mr-2" />
                                Enviar solicitud por WhatsApp
                            </Button>
                        </div>
                    )}
                    
                    {/* Navegación del formulario */}
                    <div className="flex justify-between items-center pt-6 mt-6 border-t">
                        {formStep === 1 ? (
                            <div></div>
                        ) : (
                            <Button 
                                variant="outline" 
                                onClick={handleFormPrevious}
                                disabled={formStep === 1}
                                className={`font-bold ${isDarkMode ? 'bg-white border-gray-300 text-black hover:bg-gray-100' : 'bg-white border-gray-300 text-black hover:bg-gray-100'}`}
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" /> Anterior
                            </Button>
                        )}
                        
                        {/* Branding TuneConnect en el centro */}
                         <div className="flex items-center gap-2">
                             <Image 
                                 src="/logo.png" 
                                 alt="TuneConnect" 
                                 width={24} 
                                 height={24} 
                                 className="rounded"
                             />
                             <div className="font-bold text-sm">TuneConnect</div>
                         </div>
                        
                        <Button 
                            onClick={handleFormNext}
                            disabled={!isStepValid() || formStep === 4}
                        >
                            {formStep === 4 ? 'Completado' : 'Siguiente'} <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>
                
                {/* Botones de acción */}
                <div className="flex gap-4">
                    <Button 
                        variant="outline"
                        onClick={() => setPreviewMode('customize')}
                        className={`flex-1 ${isDarkMode ? 'border-gray-600 text-black hover:bg-gray-700' : 'text-black'}`}
                    >
                        <Settings className="w-4 h-4 mr-2" /> Personalizar Formulario
                    </Button>
                </div>
                
                {/* Navegación principal */}
                <div className="flex justify-between pt-6">
                    <Button variant="outline" onClick={onPrevious} className={`font-bold ${isDarkMode ? 'bg-white border-gray-300 text-black hover:bg-gray-100' : 'bg-white border-gray-300 text-black hover:bg-gray-100'}`}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Anterior
                </Button>
                    <Button onClick={onNext}>
                        Siguiente <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function QrCodeSection({ djProfile, onPrevious, isDarkMode }: {
    djProfile: DJProfile,
    onPrevious: () => void,
    isDarkMode: boolean
}) {
    return (
        <div className="max-w-4xl mx-auto">
            <FormCreator djProfile={djProfile} isDarkMode={isDarkMode} />
            
            {/* Navegación */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 pt-4 sm:pt-6">
                <Button variant="outline" onClick={onPrevious} className={`text-sm sm:text-base font-bold ${isDarkMode ? 'bg-white border-gray-300 text-black hover:bg-gray-100' : 'bg-white border-gray-300 text-black hover:bg-gray-100'}`}>
                    <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-2" /> Anterior
                </Button>
                <Button className="text-sm sm:text-base bg-green-600 hover:bg-green-700 text-white">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-2" /> ¡Completado!
                </Button>
            </div>
        </div>
    );
}