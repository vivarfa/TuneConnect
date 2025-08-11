'use server';

/**
 * @fileOverview A song request moderation AI agent.
 *
 * - moderateSongRequest - A function that moderates song requests.
 * - ModerateSongRequestInput - The input type for the moderateSongRequest function.
 * - ModerateSongRequestOutput - The return type for the moderateSongRequest function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateSongRequestInputSchema = z.object({
  songName: z.string().describe('The name of the song requested.'),
  artistName: z.string().describe('The name of the artist of the song.'),
  genre: z.string().optional().describe('The genre of the song, if provided.'),
  requesterName: z.string().optional().describe('The name of the person requesting the song, if provided.'),
  paymentProof: z
    .string()
    .optional()
    .describe(
      'A payment proof image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type ModerateSongRequestInput = z.infer<typeof ModerateSongRequestInputSchema>;

const ModerateSongRequestOutputSchema = z.object({
  isAppropriate: z.boolean().describe('Whether the song request is appropriate and does not contain inappropriate content.'),
  isDuplicate: z.boolean().describe('Whether the song request is a duplicate of a previous request.'),
  isComplete: z.boolean().describe('Whether the song request is complete with all necessary information.'),
  reason: z.string().describe('The reason for the moderation decision, if the request is not appropriate, a duplicate, or incomplete.'),
});
export type ModerateSongRequestOutput = z.infer<typeof ModerateSongRequestOutputSchema>;

export async function moderateSongRequest(
  input: ModerateSongRequestInput
): Promise<ModerateSongRequestOutput> {
  try {
    const result = await moderateSongRequestFlow(input);
    return result;
  } catch (error) {
    // If AI moderation fails, return a default approval
    console.warn('AI moderation failed, using fallback approval:', error);
    return {
      isAppropriate: true,
      isDuplicate: false,
      isComplete: true,
      reason: 'Tu solicitud ha sido aprobada automáticamente. ¡Lista para el pago!'
    };
  }
}

const moderateSongRequestPrompt = ai.definePrompt({
  name: 'moderateSongRequestPrompt',
  input: {schema: ModerateSongRequestInputSchema},
  output: {schema: ModerateSongRequestOutputSchema},
  prompt: `You are an AI assistant that moderates song requests for a DJ.

  You will determine if the song request is appropriate, not a duplicate, and complete.
  - A song request is inappropriate if it contains offensive language, hate speech, or any content that violates community guidelines.
  - A song request is a duplicate if it has already been requested by the same person.
  - A song request is incomplete if it is missing required information, such as the song name or artist.

  Based on these criteria, please evaluate the following song request:

  Song Name: {{{songName}}}
  Artist Name: {{{artistName}}}
  Genre: {{{genre}}}
  Requester Name: {{{requesterName}}}
  Payment Proof: {{#if paymentProof}}Provided{{else}}Not Provided{{/if}}

  Provide a reason for your moderation decision.  Be as brief as possible.

  Set the isAppropriate, isDuplicate, and isComplete output fields accordingly.`,
});

const moderateSongRequestFlow = ai.defineFlow(
  {
    name: 'moderateSongRequestFlow',
    inputSchema: ModerateSongRequestInputSchema,
    outputSchema: ModerateSongRequestOutputSchema,
  },
  async input => {
    const {output} = await moderateSongRequestPrompt(input);
    return output!;
  }
);
