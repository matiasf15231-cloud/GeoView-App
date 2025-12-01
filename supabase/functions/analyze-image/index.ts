import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai";

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
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const prompt = `Eres un experto en análisis de imágenes de georadar (GPR). Analiza la siguiente imagen GPR. Tu respuesta DEBE ser un único objeto JSON válido, sin ningún texto, explicación o markdown (\`\`\`json) adicional. El JSON debe tener dos claves principales: "description" y "volume_3d".

1.  En la clave "description", proporciona una descripción detallada de la imagen, identificando anomalías, capas del subsuelo y objetos potenciales de interés. La descripción debe ser clara y concisa para un no experto.

2.  En la clave "volume_3d", proporciona un array de objetos detectados. Cada objeto en el array debe tener las siguientes propiedades:
    *   "type": El tipo de objeto. Los valores posibles son "tuberia", "cavidad", "metalico", "cable".
    *   "position": Un array de tres números [x, y, z] que representa las coordenadas del centro del objeto en un espacio 3D normalizado de 10x10x10. El origen [0,0,0] es el centro del volumen. 'y' representa la profundidad (valores negativos).
    *   "dimensions": Un objeto con las dimensiones. Para "tuberia" usa {"radius": float, "height": float, "orientation": "horizontal-x" | "horizontal-z" | "vertical"}. Para "cavidad" usa {"radius": float}. Para "metalico" usa {"size": [width, height, depth]}. Para "cable" usa {"points": [[x,y,z], [x,y,z], ...]}.
    *   "material": El material del objeto. Los valores posibles son "metal", "roca", "pvc", "vacio".

Ejemplo de la estructura JSON de salida esperada:
{
  "description": "Se observa una anomalía hiperbólica a una profundidad media, consistente con una tubería metálica que cruza el área de escaneo. También se detecta una pequeña zona de baja reflectividad que podría indicar una cavidad o vacío.",
  "volume_3d": [
    {
      "type": "tuberia",
      "position": [0, -3, 0],
      "dimensions": { "radius": 0.2, "height": 10, "orientation": "horizontal-x" },
      "material": "metal"
    },
    {
      "type": "cavidad",
      "position": [-3, -6, 2],
      "dimensions": { "radius": 1 },
      "material": "vacio"
    }
  ]
}`;

    const imagePart = dataUrlToGenerativePart(image);

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const textResponse = response.text();

    let jsonData;
    try {
        const cleanedText = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        jsonData = JSON.parse(cleanedText);
    } catch (e) {
        console.error("Error parsing JSON from AI response:", e);
        console.error("Original AI response:", textResponse);
        throw new Error("La respuesta de la IA no es un JSON válido.");
    }

    return new Response(JSON.stringify(jsonData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});