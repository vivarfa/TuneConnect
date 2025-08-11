"use client";

import { useState, useEffect } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Logo } from "@/components/Logo";
import { User, CreditCard, QrCode, Music, Eye, Upload } from "lucide-react";

// Mock Data
const mockRequestsData = [
  {
    id: "1",
    songName: "Blinding Lights",
    artistName: "The Weeknd",
    requesterName: "Alice",
    status: "accepted",
    date: new Date().toISOString(),
  },
  {
    id: "2",
    songName: "Levitating",
    artistName: "Dua Lipa",
    requesterName: "Bob",
    status: "pending",
    date: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
  {
    id: "3",
    songName: "Good 4 U",
    artistName: "Olivia Rodrigo",
    requesterName: "Charlie",
    status: "rejected",
    date: new Date(Date.now() - 7200 * 1000).toISOString(),
  },
];

interface SongRequest {
    id: string;
    songName: string;
    artistName: string;
    requesterName: string;
    status: string;
    date: string;
}

export function DashboardClient() {
  const [isClient, setIsClient] = useState(false);
  const [mockRequests, setMockRequests] = useState<SongRequest[]>([]);
  
  useEffect(() => {
    setIsClient(true);
    setMockRequests(mockRequestsData);
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card p-4 flex flex-col justify-between">
          <div className="p-4">
            <Logo />
          </div>
        <nav className="mt-10">
          <Button variant="ghost" className="w-full justify-start text-lg mb-4">
            <User className="mr-2" /> Perfil
          </Button>
          <Button variant="ghost" className="w-full justify-start text-lg mb-4">
            <CreditCard className="mr-2" /> Pagos
          </Button>
          <Button variant="ghost" className="w-full justify-start text-lg mb-4">
            <Music className="mr-2" /> Solicitudes
          </Button>
           <Button variant="ghost" className="w-full justify-start text-lg">
            <QrCode className="mr-2" /> Código QR
          </Button>
        </nav>
        <div className="p-4 mt-auto">
          {/* Footer content if any */}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Tu Perfil de DJ</CardTitle>
            <CardDescription>
              Personaliza tu página pública de solicitud de canciones.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="djName">Nombre del DJ</Label>
                    <Input id="djName" placeholder="Tu nombre artístico" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp (con código de país)</Label>
                    <Input id="whatsapp" type="tel" placeholder="+51999888777" />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="bio">Biografía Corta</Label>
                <Textarea id="bio" placeholder="Cuéntanos un poco sobre ti..." />
            </div>
             <div className="space-y-2">
                <Label htmlFor="welcomeMessage">Mensaje de Bienvenida</Label>
                <Textarea id="welcomeMessage" placeholder="¡Hola! Solicita tu canción favorita..." />
            </div>

            <div className="flex gap-8 items-end">
                <div className="space-y-2">
                    <Label>Foto de Perfil</Label>
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                        <User className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <Button variant="outline"><Upload className="mr-2"/>Subir</Button>
                </div>
                 <div className="space-y-2">
                    <Label>Logo del DJ (Opcional)</Label>
                    <div className="w-40 h-24 bg-muted flex items-center justify-center">
                        <Music className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <Button variant="outline"><Upload className="mr-2"/>Subir</Button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="primaryColor">Color Principal</Label>
                    <Input id="primaryColor" type="color" defaultValue="#6d28d9" className="p-1 h-12"/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Color Secundario</Label>
                    <Input id="secondaryColor" type="color" defaultValue="#4c1d95" className="p-1 h-12"/>
                </div>
            </div>
            
            <div className="flex justify-between items-center pt-4">
                <Button size="lg" className="font-bold">Guardar y Continuar</Button>
                 <Button variant="outline"><Eye className="mr-2"/> Vista Previa</Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-8">
            <SongRequestsTable requests={mockRequests} isClient={isClient} />
        </div>
      </main>
    </div>
  );
}


function SongRequestsTable({requests, isClient}: {requests: SongRequest[], isClient: boolean}){
    return (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Solicitudes de Canciones</CardTitle>
            <CardDescription>
              Gestiona las solicitudes de canciones de tu audiencia.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Canción</TableHead>
                  <TableHead>Artista</TableHead>
                  <TableHead>Solicitante</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{req.songName}</TableCell>
                    <TableCell>{req.artistName}</TableCell>
                    <TableCell>{req.requesterName}</TableCell>
                    <TableCell>
                      {isClient ? new Date(req.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '...'}
                    </TableCell>
                    <TableCell>
                      <Select defaultValue={req.status}>
                        <SelectTrigger className="w-[120px]">
                           <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">
                            <Badge variant="secondary" className="mr-2">Pendiente</Badge>
                          </SelectItem>
                          <SelectItem value="accepted">
                            <Badge className="bg-green-600 mr-2">Aceptada</Badge>
                          </SelectItem>
                          <SelectItem value="rejected">
                            <Badge variant="destructive" className="mr-2">Rechazada</Badge>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    )
}
