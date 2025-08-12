"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { QrCode, Type, Link, Camera, Upload, Download, Copy, RefreshCw, Home, ArrowLeft, Image, Facebook, Twitter, MessageCircle, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";

export default function QrConverterPage() {
    const router = useRouter();
    const [inputType, setInputType] = useState<'text' | 'url' | 'image'>('text');
    const [inputValue, setInputValue] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [originalContent, setOriginalContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState('');

    const [qrSize, setQrSize] = useState(256);
    const [errorCorrectionLevel, setErrorCorrectionLevel] = useState('M');
    const [qrColor, setQrColor] = useState('#000000');
    const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
    
    // Función para subir imagen y obtener URL pública
    const uploadImageToBlob = async (file: File): Promise<string> => {
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
            // La URL de Vercel Blob ya es completa, no necesita concatenación
            return blob.url;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    };

    // Generar código QR
    const generateQrCode = async () => {
        // Validar que hay contenido para generar
        if (inputType === 'image' && !imageFile) {
            alert('Por favor selecciona una imagen');
            return;
        }
        if ((inputType === 'text' || inputType === 'url') && !inputValue.trim()) {
            alert('Por favor ingresa el contenido a convertir');
            return;
        }
        
        setIsGenerating(true);
        try {
            let dataToEncode = inputValue.trim();
            
            if (inputType === 'image' && imageFile) {
                // Subir imagen y obtener URL pública
                dataToEncode = await uploadImageToBlob(imageFile);
            }
            
            // Validar URL si es tipo URL
            if (inputType === 'url' && dataToEncode) {
                if (!dataToEncode.startsWith('http://') && !dataToEncode.startsWith('https://')) {
                    dataToEncode = 'https://' + dataToEncode;
                }
            }
            
            // Verificar que el contenido no sea demasiado largo para QR
            // Para imágenes en Base64, aumentamos el límite
            const maxLength = inputType === 'image' ? 10000 : 2000;
            if (dataToEncode.length > maxLength) {
                alert(`El contenido es demasiado largo para un código QR. Límite: ${maxLength} caracteres.`);
                setIsGenerating(false);
                return;
            }
            
            // Guardar el contenido original
            setOriginalContent(dataToEncode);
            
            // Generar QR usando la librería qrcode
            const qrDataUrl = await QRCode.toDataURL(dataToEncode, {
                width: qrSize,
                margin: 2,
                color: {
                    dark: qrColor,
                    light: backgroundColor
                },
                errorCorrectionLevel: errorCorrectionLevel as 'L' | 'M' | 'Q' | 'H'
            });
            
            setQrCodeUrl(qrDataUrl);
            
        } catch (error) {
            console.error('Error generando QR:', error);
            alert('Error al generar el código QR. Por favor intenta de nuevo.');
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
        if (qrCodeUrl) {
            const link = document.createElement('a');
            link.href = qrCodeUrl;
            link.download = `qr-code-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };
    
    // Copiar contenido original
    const copyOriginalContent = () => {
        if (originalContent) {
            navigator.clipboard.writeText(originalContent);
            alert('Contenido copiado al portapapeles');
        }
    };
    
    // Copiar QR URL
    const copyQrUrl = () => {
        if (qrCodeUrl) {
            navigator.clipboard.writeText(qrCodeUrl);
            alert('URL del QR copiada al portapapeles');
        }
    };

    // Funciones para compartir en redes sociales
    const shareOnFacebook = () => {
        const shareUrl = encodeURIComponent(originalContent || '');
        const text = encodeURIComponent('¡Mira este código QR que generé!');
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${text}`, '_blank');
    };

    const shareOnTwitter = () => {
        const shareUrl = encodeURIComponent(originalContent || '');
        const text = encodeURIComponent('¡Mira este código QR que generé! ');
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`, '_blank');
    };

    const shareOnWhatsApp = () => {
        const shareUrl = encodeURIComponent(originalContent || '');
        const text = encodeURIComponent('¡Mira este código QR que generé! ');
        window.open(`https://wa.me/?text=${text}${shareUrl}`, '_blank');
    };

    const shareGeneric = () => {
        if (navigator.share && originalContent) {
            navigator.share({
                title: 'Código QR generado',
                text: '¡Mira este código QR que generé!',
                url: originalContent
            }).catch(console.error);
        } else {
            copyOriginalContent();
        }
    };
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
            {/* Elementos decorativos de fondo con animaciones */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>
            {/* Header */}
            <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 relative z-10 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <QrCode className="w-8 h-8 text-blue-400" />
                            <h1 className="text-xl font-bold text-white drop-shadow-lg">Convertidor QR Profesional</h1>
                        </div>
                        <Button
                            onClick={() => router.push('/')}
                            variant="outline"
                            className="border-white/20 text-black bg-white/90 hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105"
                        >
                            <Home className="w-4 h-4 mr-2" />
                            Inicio
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
             <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 relative z-10">
                 <Card className="bg-white/10 backdrop-blur-sm border-white/20 transition-all duration-500 hover:bg-white/15 hover:shadow-2xl animate-fade-in-scale">
                    <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-2 text-white font-bold drop-shadow-lg">
                            <QrCode className="w-6 h-6" /> Convertidor QR Profesional
                        </CardTitle>
                        <CardDescription className="text-gray-200 font-medium">
                            Convierte texto, URLs o imágenes a códigos QR personalizados con opciones avanzadas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-6">
                            {/* Selector de tipo de entrada */}
                            <div className="space-y-3 sm:space-y-4 animate-fade-in-up">
                                <Label className="font-bold text-white text-base sm:text-lg drop-shadow-md">Tipo de contenido</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                                    <Button
                                        variant={inputType === 'text' ? 'default' : 'outline'}
                                        onClick={() => setInputType('text')}
                                        className={`flex items-center justify-center gap-2 h-10 sm:h-auto transition-all duration-300 transform hover:scale-105 animate-fade-in-up delay-100 ${inputType === 'text' ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg' : 'border-gray-300 bg-white/90 text-gray-900 hover:bg-gray-100'}`}
                                    >
                                        <Type className="w-4 h-4" /> <span className="text-sm sm:text-base">Texto</span>
                                    </Button>
                                    <Button
                                        variant={inputType === 'url' ? 'default' : 'outline'}
                                        onClick={() => setInputType('url')}
                                        className={`flex items-center justify-center gap-2 h-10 sm:h-auto transition-all duration-300 transform hover:scale-105 animate-fade-in-up delay-200 ${inputType === 'url' ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg' : 'border-gray-300 bg-white/90 text-gray-900 hover:bg-gray-100'}`}
                                    >
                                        <Link className="w-4 h-4" /> <span className="text-sm sm:text-base">URL</span>
                                    </Button>
                                    <Button
                                        variant={inputType === 'image' ? 'default' : 'outline'}
                                        onClick={() => setInputType('image')}
                                        className={`flex items-center justify-center gap-2 h-10 sm:h-auto transition-all duration-300 transform hover:scale-105 animate-fade-in-up delay-300 ${inputType === 'image' ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg' : 'border-gray-300 bg-white/90 text-gray-900 hover:bg-gray-100'}`}
                                    >
                                        <Camera className="w-4 h-4" /> <span className="text-sm sm:text-base">Imagen</span>
                                    </Button>
                                </div>
                            </div>

                            {/* Contenido principal */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                            {/* Panel de entrada */}
                            <div className="space-y-4 animate-fade-in-up delay-400">
                                <Label className="font-bold text-white text-lg drop-shadow-md">
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
                                        {imagePreview ? (
                                            <div className="w-full h-32 flex items-center justify-center bg-transparent rounded-lg border-2 border-dashed border-white/30">
                                                <img src={imagePreview} alt="Preview" className="max-h-24 max-w-full object-contain" />
                                            </div>
                                        ) : (
                                            <Button
                                            variant="outline"
                                            onClick={() => document.getElementById('image-upload')?.click()}
                                            className="w-full h-32 border-2 border-dashed border-white/30 hover:border-white/50 text-white hover:bg-white/10 bg-white/5 transition-all duration-300 transform hover:scale-105"
                                        >
                                                <div className="flex flex-col items-center gap-2">
                                                    <Upload className="w-8 h-8 text-white" />
                                                    <span className="text-white font-medium text-lg">Seleccionar imagen</span>
                                                </div>
                                            </Button>
                                        )}

                                    </div>
                                ) : (
                                    <Textarea
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder={inputType === 'text' ? 'Escribe tu texto aquí...' : 'https://ejemplo.com'}
                                        className="min-h-32 bg-white/90 border-gray-300 text-gray-900 placeholder:text-gray-500"
                                    />
                                )}
                                
                                {/* Opciones de personalización */}
                                <div className="p-4 rounded-lg space-y-4 bg-white/5 border border-white/10 animate-fade-in-up delay-600">
                                    <h4 className="font-bold text-white text-lg drop-shadow-md">Personalización</h4>
                                    
                                    {/* Tamaño */}
                                    <div className="space-y-2 animate-fade-in-up delay-700">
                                        <Label className="text-sm text-white font-semibold">Tamaño: {qrSize}px</Label>
                                        <Slider
                                            value={[qrSize]}
                                            onValueChange={(value) => setQrSize(value[0])}
                                            min={128}
                                            max={512}
                                            step={32}
                                            className="w-full transition-all duration-300"
                                        />
                                    </div>
                                    
                                    {/* Nivel de corrección de errores */}
                                    <div className="space-y-2 animate-fade-in-up delay-800">
                                        <Label className="text-sm text-white font-semibold">Corrección de errores</Label>
                                        <Select value={errorCorrectionLevel} onValueChange={setErrorCorrectionLevel}>
                                            <SelectTrigger className="bg-white/90 border-gray-300 text-gray-900 transition-all duration-300 hover:bg-white">
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
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in-up delay-900">
                                        <div className="space-y-2">
                                            <Label className="text-sm text-white font-semibold">Color QR</Label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={qrColor}
                                                    onChange={(e) => setQrColor(e.target.value)}
                                                    className="w-8 h-8 rounded border transition-all duration-300 hover:scale-110 cursor-pointer"
                                                />
                                                <Input
                                                    value={qrColor}
                                                    onChange={(e) => setQrColor(e.target.value)}
                                                    className="flex-1 bg-white/90 border-gray-300 text-gray-900 transition-all duration-300 hover:bg-white"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm text-white font-semibold">Color fondo</Label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={backgroundColor}
                                                    onChange={(e) => setBackgroundColor(e.target.value)}
                                                    className="w-8 h-8 rounded border transition-all duration-300 hover:scale-110 cursor-pointer"
                                                />
                                                <Input
                                                    value={backgroundColor}
                                                    onChange={(e) => setBackgroundColor(e.target.value)}
                                                    className="flex-1 bg-white/90 border-gray-300 text-gray-900 transition-all duration-300 hover:bg-white"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Botón generar */}
                                <Button
                                    onClick={generateQrCode}
                                    disabled={isGenerating}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:transform-none disabled:hover:scale-100"
                                >
                                    {isGenerating ? (
                                        <>
                                            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                                            Generando...
                                        </>
                                    ) : (
                                        <>
                                            <QrCode className="w-5 h-5 mr-2" />
                                            Generar QR
                                        </>
                                    )}
                                </Button>
                            </div>
                            
                            {/* Panel de resultado */}
                            <div className="space-y-4 animate-fade-in-up delay-500">
                                <Label className="font-bold text-white text-lg drop-shadow-md">Código QR generado</Label>
                                
                                <div className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed min-h-80 border-white/30 bg-white/5">
                                    {qrCodeUrl ? (
                                        <div className="text-center space-y-4 animate-fade-in">
                                            <div className="bg-white p-4 rounded-lg shadow-lg inline-block transition-all duration-300 transform hover:scale-105">
                                                <img src={qrCodeUrl} alt="QR Code" className="max-w-full h-auto" />
                                            </div>
                                            
                                            {/* Acciones del QR */}
                                            <div className="flex flex-col gap-3 animate-fade-in-up">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    <Button
                                                        onClick={downloadQrCode}
                                                        variant="outline"
                                                        className="h-10 border-gray-300 bg-white/90 text-gray-900 hover:bg-gray-100 flex items-center justify-center transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                                                    >
                                                        <Download className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                                                        Descargar
                                                    </Button>
                                                    <Button
                                                        onClick={copyQrUrl}
                                                        variant="outline"
                                                        className="h-10 border-gray-300 bg-white/90 text-gray-900 hover:bg-gray-100 flex items-center justify-center transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                                                    >
                                                        <Copy className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                                                        Copiar imagen
                                                    </Button>
                                                </div>
                                                <Button
                                                    onClick={copyOriginalContent}
                                                    variant="outline"
                                                    className="h-10 border-gray-300 bg-white/90 text-gray-900 hover:bg-gray-100 flex items-center justify-center transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                                                >
                                                    <Copy className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                                                    Copiar contenido original
                                                </Button>
                                                
                                                {/* Botones de redes sociales */}
                                                <div className="border-t border-white/20 pt-3 animate-fade-in-up delay-200">
                                                    <p className="text-white text-sm font-medium mb-2 text-center animate-fade-in">Compartir en redes sociales</p>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                        {/* WhatsApp */}
                                                        <Button
                                                            variant="outline"
                                                            onClick={shareOnWhatsApp}
                                                            className="group relative overflow-hidden border-2 border-green-500 bg-green-50 hover:bg-green-500 text-green-700 hover:text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/25 animate-fade-in-up delay-300"
                                                        >
                                                            <div className="flex items-center justify-center gap-2">
                                                                <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:rotate-12" viewBox="0 0 24 24" fill="currentColor">
                                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                                                                </svg>
                                                                <span className="text-xs sm:text-sm font-medium">WhatsApp</span>
                                                            </div>
                                                        </Button>

                                                        {/* X (Twitter) */}
                                                        <Button
                                                            variant="outline"
                                                            onClick={shareOnTwitter}
                                                            className="group relative overflow-hidden border-2 border-black bg-gray-50 hover:bg-black text-black hover:text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-black/25 animate-fade-in-up delay-400"
                                                        >
                                                            <div className="flex items-center justify-center gap-2">
                                                                <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:rotate-12" viewBox="0 0 24 24" fill="currentColor">
                                                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                                                </svg>
                                                                <span className="text-xs sm:text-sm font-medium">X</span>
                                                            </div>
                                                        </Button>

                                                        {/* Facebook */}
                                                        <Button
                                                            variant="outline"
                                                            onClick={shareOnFacebook}
                                                            className="group relative overflow-hidden border-2 border-blue-600 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-600/25 animate-fade-in-up delay-500"
                                                        >
                                                            <div className="flex items-center justify-center gap-2">
                                                                <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:rotate-12" viewBox="0 0 24 24" fill="currentColor">
                                                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                                                </svg>
                                                                <span className="text-xs sm:text-sm font-medium">Facebook</span>
                                                            </div>
                                                        </Button>

                                                        {/* Instagram */}
                                                        <Button
                                                            variant="outline"
                                                            onClick={shareGeneric}
                                                            className="group relative overflow-hidden border-2 border-pink-500 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-500 hover:to-pink-500 text-pink-600 hover:text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-pink-500/25 animate-fade-in-up delay-600"
                                                        >
                                                            <div className="flex items-center justify-center gap-2">
                                                                <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:rotate-12" viewBox="0 0 24 24" fill="currentColor">
                                                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                                                </svg>
                                                                <span className="text-xs sm:text-sm font-medium">Instagram</span>
                                                            </div>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-400">
                                            <QrCode className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                            <p className="text-lg font-medium">Tu código QR aparecerá aquí</p>
                                            <p className="text-sm">Completa los campos y presiona "Generar QR"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* Tips de uso */}
                        <div className="mt-8 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
                            <h4 className="font-bold text-blue-200 mb-3 flex items-center gap-2">
                                <QrCode className="w-5 h-5" />
                                Tips de uso
                            </h4>
                            <ul className="text-blue-100 text-sm space-y-1 list-disc list-inside">
                                <li>Los códigos QR pueden contener hasta 2000 caracteres aproximadamente</li>
                                <li>Para URLs, asegúrate de incluir "https://" al inicio</li>
                                <li>Las imágenes se procesan automáticamente para generar el código QR</li>
                                <li>Usa mayor corrección de errores si el QR se imprimirá en superficies irregulares</li>
                                <li>Los colores muy claros pueden dificultar la lectura del código</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}