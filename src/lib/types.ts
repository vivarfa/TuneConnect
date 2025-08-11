export interface DJProfile {
  id: string;
  djName: string;
  bio: string;
  welcomeMessage: string;
  profilePictureUrl: string;
  logoUrl: string;
  colors: {
    primary: string;
    background: string;
    accent: string;
    text: string;
  };
  theme: {
    mode: 'light' | 'dark';
    fontSize: number;
    fontFamily: 'inter' | 'poppins' | 'roboto' | 'playfair';
    borderRadius: number;
    animations: boolean;
  };
  payment: {
    minTip: number;
    country?: string;
    customCurrencySymbol?: string;
    paypalEnabled: boolean;
    paypalEmail: string;
    paypalMeLink: string;
    paypalQrUrl: string;
    yapeQrUrl: string;
    yapePhoneNumber: string;
    digitalWallets: Array<{
      name: string;
      account: string;
      qrCodeUrl?: string;
    }>;
  };
  notifications: {
    whatsappNumber: string;
  };
}

export interface SongRequest {
  id: string;
  djId: string;
  songName: string;
  artistName: string;
  genre?: string;
  requesterName?: string;
  paymentProofUrl?: string;
  status: 'pending' | 'accepted' | 'rejected';
  requestedAt: Date;
}
