import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI, GenerativeModel } from "https://esm.sh/@google/generative-ai";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function dataUrlToGenerativePart(dataUrl: string) {
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) {
    throw new Error("Formato de data URL inválido");
  }
  const mimeType = match[1];
  const base64Data = match[2];
  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();
    if (!image) {
      return new Response(JSON.stringify({ error: 'No se proporcionó ninguna imagen' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
        throw new Error("La variable de entorno GEMINI_API_KEY no está configurada.");
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    
    let model: GenerativeModel;
    try {
      // Intento 1: Usar el modelo que solicitaste
      model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
      console.log("Intentando con el modelo: gemini-2.5-pro");
    } catch (error) {
      // Fallback: Si el primer modelo no existe, usar el modelo de respaldo
      console.warn("El modelo 'gemini-2.5-pro' no se encontró. Usando 'gemini-1.5-pro' como respaldo.", error.message);
      model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    }

    const prompt = `
      Eres un experto en análisis de imágenes de georadar (GPR). Analiza la siguiente imagen GPR.
      Tu respuesta DEBE ser un objeto JSON con la siguiente estructura:
      {
        "description": "Una descripción detallada de la imagen, identificando anomalías, capas del subsuelo y objetos potenciales de interés. Proporciona una interpretación clara y concisa para un no experto.",
        "volumen_3d": [
          {
            "type": "pipe" | "cavity" | "metal" | "cable" | "rock",
            "position": { "x": number, "y": number, "z": number },
            "size": { "width": number, "height": number, "depth": number }
          }
        ]
      }
      - Las coordenadas (x, y, z) y el tamaño (width, height, depth) deben ser valores numéricos entre 0 y 100, representando porcentajes relativos dentro del volumen total.
      - 'x' es la posición horizontal, 'y' es la profundidad, y 'z' es la distancia desde el frente.
      - Identifica al menos 3-5 objetos si es posible. Si no hay objetos claros, devuelve un array "volumen_3d" vacío.
      - No incluyas nada más en tu respuesta, solo el objeto JSON.
    `;

    const imagePart = dataUrlToGenerativePart(image);

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const jsonText = response.text().replace(/```json|```/g, '').trim();
    const analysisData = JSON.parse(jsonText);

    return new Response(JSON.stringify(analysisData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error("Error detallado en la función de análisis:", JSON.stringify(error, null, 2));
    return new Response(JSON.stringify({ error: `Error en el servidor: ${error.message}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});