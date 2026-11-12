import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api-response";
import { authenticateAdmin } from "@/lib/auth-guards";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    await authenticateAdmin(req);

    const hasGemini = Boolean(process.env.GEMINI_API_KEY);
    const hasOpenRouter = Boolean(process.env.OPENROUTER_API_KEY);

    return ApiResponse.success({
      geminiConfigured: hasGemini,
      geminiKeyMasked: hasGemini ? `AQ...${(process.env.GEMINI_API_KEY || "").slice(-6)}` : "",
      openRouterConfigured: hasOpenRouter,
      openRouterKeyMasked: hasOpenRouter ? `sk-or-...${(process.env.OPENROUTER_API_KEY || "").slice(-4)}` : "",
      primaryProvider: "GEMINI",
      primaryModel: process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
    });
  } catch (error) {
    return ApiResponse.handle(error, req);
  }
}

export async function POST(req: NextRequest) {
  try {
    await authenticateAdmin(req);
    const body = await req.json();

    const { geminiKey, openRouterKey } = body;
    const envLocalPath = path.join(process.cwd(), ".env.local");

    let envContent = "";
    if (fs.existsSync(envLocalPath)) {
      envContent = fs.readFileSync(envLocalPath, "utf8");
    }

    if (geminiKey && geminiKey.trim()) {
      process.env.GEMINI_API_KEY = geminiKey.trim();
      if (envContent.includes("GEMINI_API_KEY=")) {
        envContent = envContent.replace(/GEMINI_API_KEY=.*(\r?\n|$)/, `GEMINI_API_KEY="${geminiKey.trim()}"\n`);
      } else {
        envContent += `\nGEMINI_API_KEY="${geminiKey.trim()}"\n`;
      }
    }

    if (openRouterKey && openRouterKey.trim()) {
      process.env.OPENROUTER_API_KEY = openRouterKey.trim();
      if (envContent.includes("OPENROUTER_API_KEY=")) {
        envContent = envContent.replace(/OPENROUTER_API_KEY=.*(\r?\n|$)/, `OPENROUTER_API_KEY="${openRouterKey.trim()}"\n`);
      } else {
        envContent += `\nOPENROUTER_API_KEY="${openRouterKey.trim()}"\n`;
      }
    }

    fs.writeFileSync(envLocalPath, envContent.trim() + "\n", "utf8");

    return ApiResponse.success({
      saved: true,
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      openRouterConfigured: Boolean(process.env.OPENROUTER_API_KEY),
    });
  } catch (error) {
    return ApiResponse.handle(error, req);
  }
}
