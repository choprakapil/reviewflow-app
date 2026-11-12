import QRCode from "qrcode";

export interface QRCodeOptions {
  url: string;
  foregroundColor?: string;
  backgroundColor?: string;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  width?: number;
}

export class QRGeneratorService {
  /**
   * Generates a scalable vector SVG string for crisp print rendering.
   */
  static async generateSvg(options: QRCodeOptions): Promise<string> {
    const {
      url,
      foregroundColor = "#000000",
      backgroundColor = "#FFFFFF",
      errorCorrectionLevel = "M",
    } = options;

    return await QRCode.toString(url, {
      type: "svg",
      errorCorrectionLevel,
      color: {
        dark: foregroundColor,
        light: backgroundColor,
      },
      margin: 1,
    });
  }

  /**
   * Generates a high-resolution base64 PNG data URL for digital download.
   */
  static async generateDataUrl(options: QRCodeOptions): Promise<string> {
    const {
      url,
      foregroundColor = "#000000",
      backgroundColor = "#FFFFFF",
      errorCorrectionLevel = "M",
      width = 1024,
    } = options;

    return await QRCode.toDataURL(url, {
      errorCorrectionLevel,
      width,
      margin: 1,
      color: {
        dark: foregroundColor,
        light: backgroundColor,
      },
    });
  }
}

