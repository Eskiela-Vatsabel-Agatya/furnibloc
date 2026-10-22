/// <reference path="../.astro/types.d.ts" />

declare module 'qrcode' {
  const QRCode: {
    toString(text: string, opts?: { type?: 'svg' | 'utf8' | 'terminal'; errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'; margin?: number; color?: { dark?: string; light?: string } }): Promise<string>;
  };
  export default QRCode;
}
