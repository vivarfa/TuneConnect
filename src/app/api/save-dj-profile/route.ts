// File: src/app/api/save-dj-profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { DJProfile } from '@/lib/types';
import { saveDjProfile } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { djProfile }: { djProfile: DJProfile } = await request.json();

    if (!djProfile || !djProfile.djName) {
      return NextResponse.json({ success: false, error: 'El perfil del DJ es inválido.' }, { status: 400 });
    }

    const djSlug = djProfile.djName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim();
    if (!djSlug) {
      return NextResponse.json({ success: false, error: 'El nombre del DJ no es válido para crear un slug.' }, { status: 400 });
    }

    // Guardar el perfil usando la función de database.ts que maneja fallbacks
    await saveDjProfile(djSlug, djProfile);

    console.log(`Perfil guardado para DJ ${djProfile.djName} con slug: ${djSlug}`);

    return NextResponse.json({ success: true, djSlug });

  } catch (error) {
    console.error("Error en save-dj-profile:", error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al guardar el perfil.';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}