
"use server";

import { moderateSongRequest, ModerateSongRequestInput, ModerateSongRequestOutput } from '@/ai/flows/moderate-song-requests';
import { z } from 'zod';

const songRequestSchema = z.object({
  songName: z.string().min(1, "El nombre de la canción es obligatorio."),
  artistName: z.string().min(1, "El nombre del artista es obligatorio."),
  genre: z.string().optional(),
  requesterName: z.string().optional(),
});

export type FormState = {
  success: boolean;
  message: string;
  moderation?: ModerateSongRequestOutput;
  request?: z.infer<typeof songRequestSchema>;
}

export async function submitSongRequest(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  
  const data: ModerateSongRequestInput = {
    songName: formData.get('songName') as string,
    artistName: formData.get('artistName') as string,
    genre: formData.get('genre') as string,
    requesterName: formData.get('requesterName') as string,
  };

  const parsed = songRequestSchema.safeParse(data);

  if (!parsed.success) {
    const error = parsed.error.flatten().fieldErrors;
    const errorMessage = Object.values(error).flat().join(", ");
    return { success: false, message: `Entrada inválida: ${errorMessage}` };
  }
  
  try {
    // Usar moderación rápida con timeout para evitar demoras
    const moderationPromise = moderateSongRequest(parsed.data);
    const timeoutPromise = new Promise<ModerateSongRequestOutput>((resolve) => {
      setTimeout(() => {
        resolve({
          isAppropriate: true,
          isDuplicate: false,
          isComplete: true,
          reason: 'Tu solicitud ha sido aprobada rápidamente. ¡Lista para el pago!'
        });
      }, 2000); // Timeout de 2 segundos
    });
    
    const moderationResult = await Promise.race([moderationPromise, timeoutPromise]);
    
    if (!moderationResult.isAppropriate) {
      return { 
        success: false, 
        message: `Solicitud rechazada: ${moderationResult.reason}`,
        moderation: moderationResult,
        request: parsed.data,
      };
    }
    
    // In a real app, save to DB here.
    return { 
        success: true,
        message: 'Solicitud enviada para moderación.',
        moderation: moderationResult,
        request: parsed.data,
    };
  } catch (error) {
    console.error(error);
    // Fallback rápido en caso de error
    return { 
      success: true, 
      message: 'Solicitud aprobada automáticamente.',
      moderation: {
        isAppropriate: true,
        isDuplicate: false,
        isComplete: true,
        reason: 'Tu solicitud ha sido aprobada automáticamente. ¡Lista para el pago!'
      },
      request: parsed.data,
    };
  }
}
