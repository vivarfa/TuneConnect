import Link from 'next/link';
import { QrCode, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-white/10 backdrop-blur-lg border-white/20 text-white">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
            <QrCode className="w-8 h-8 text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Código no encontrado</CardTitle>
          <CardDescription className="text-gray-300">
            El código QR que escaneaste no es válido o ha expirado.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-400">
            <p>Esto puede suceder si:</p>
            <ul className="mt-2 space-y-1 text-left">
              <li>• El código QR es muy antiguo</li>
              <li>• El DJ ha generado un nuevo código</li>
              <li>• Hubo un error al escanear</li>
            </ul>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Ir al inicio
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
              <Link href="javascript:history.back()">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver atrás
              </Link>
            </Button>
          </div>
          
          <div className="text-center text-xs text-gray-500 mt-6">
            <p>¿Eres DJ? <Link href="/dashboard" className="text-purple-400 hover:underline">Crea tu perfil aquí</Link></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const metadata = {
  title: 'Código no encontrado - TuneConnect',
  description: 'El código QR escaneado no es válido o ha expirado.',
};