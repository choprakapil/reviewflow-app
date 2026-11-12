import { QRGeneratorService } from "./qr-generator.service";

export interface TableTentConfig {
  businessName: string;
  category?: string;
  landingUrl: string;
  foregroundColor?: string;
  backgroundColor?: string;
  callToAction?: string;
  instructions?: string;
}

export class PDFGeneratorService {
  /**
   * Generates a print-optimized, vector-sharp HTML document for Table Tents.
   * Can be rendered directly in a print dialog or converted to PDF.
   */
  public static async generateTableTentHtml(config: TableTentConfig): Promise<string> {
    const {
      businessName,
      category = "Valued Customer Service",
      landingUrl,
      foregroundColor = "#000000",
      backgroundColor = "#FFFFFF",
      callToAction = "Scan to Review Us on Google",
      instructions = "Point your camera at the QR code, tap the banner, and easily copy your genuine review draft to Google!",
    } = config;

    const qrSvg = await QRGeneratorService.generateSvg({
      url: landingUrl,
      foregroundColor,
      backgroundColor,
      errorCorrectionLevel: "H",
    });

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Table Tent - ${businessName}</title>
  <style>
    @page {
      size: letter portrait;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .sheet {
      width: 8.5in;
      height: 11in;
      background: #ffffff;
      padding: 0.75in;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
    }
    .fold-container {
      border: 2px dashed #cbd5e1;
      border-radius: 24px;
      padding: 2.5rem 2rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
    }
    .badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 9999px;
      background: #eff6ff;
      color: #1d4ed8;
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 1rem;
    }
    .title {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.025em;
      color: #0f172a;
      margin-bottom: 0.5rem;
    }
    .subtitle {
      font-size: 16px;
      color: #64748b;
      margin-bottom: 2rem;
    }
    .qr-frame {
      width: 280px;
      height: 280px;
      padding: 16px;
      background: #ffffff;
      border-radius: 20px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.08);
      margin-bottom: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .qr-frame svg {
      width: 100%;
      height: 100%;
    }
    .cta {
      font-size: 22px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 0.75rem;
    }
    .instructions {
      max-width: 420px;
      font-size: 14px;
      line-height: 1.5;
      color: #475569;
    }
    .footer {
      font-size: 11px;
      color: #94a3b8;
      text-align: center;
      margin-top: 1rem;
    }
    @media print {
      body {
        background: transparent;
      }
      .sheet {
        box-shadow: none;
        width: 100%;
        height: 100%;
        padding: 0.5in;
      }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="fold-container">
      <div class="badge">${category}</div>
      <h1 class="title">${businessName}</h1>
      <p class="subtitle">Your feedback shapes our quality & service</p>
      
      <div class="qr-frame">
        ${qrSvg}
      </div>

      <div class="cta">${callToAction}</div>
      <p class="instructions">${instructions}</p>
    </div>
    <div class="footer">
      Powered by ReviewFlow &bull; Unrestricted Genuine Google Review Assistant &bull; Fold along dashed boundary for tabletop display
    </div>
  </div>
</body>
</html>`;
  }
}

