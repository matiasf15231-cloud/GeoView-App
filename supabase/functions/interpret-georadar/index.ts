import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${GEMINI_API_KEY}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();

    if (!image) {
      return new Response(JSON.stringify({ error: "No se proporcionó ninguna imagen." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // La imagen viene como un data URL (e.g., "data:image/png;base64,iVBORw..."), 
    // necesitamos extraer solo la parte de base64.
    const base64ImageData = image.split(',')[1];

    const prompt = `
      Eres un experto en análisis de datos de Georadar (GPR). Tu tarea es interpretar la imagen GPR proporcionada para identificar objetos y anomalías del subsuelo.
      Analiza las siguientes características en la imagen: patrones de eco, hipérbolas, zonas de densidad y cualquier otra anomalía significativa.
      A partir de tu análisis, debes generar un objeto JSON con la siguiente estructura exacta y nada más. No incluyas ningún formato markdown como \`\`\`json.

      {
        "objetos_detectados": [
          {
            "tipo": "string",
            "descripcion_simple": "string",
            "profundidad_estimada_cm": "number"
          }
        ],
        "volumen_3d": {
          "terreno": {
            "forma": "cubo",
            "dimensiones": { "ancho": 100, "alto": 1, "profundidad": 100 },
            "posicion": { "x": 0, "y": 0, "z": 0 }
          },
          "objetos": [
            {
              "id": "string",
              "tipo": "string",
              "forma": "string",
              "posicion": { "x": "number", "y": "number", "z": "number" },
              "dimensiones": {},
              "rotacion": { "x": 0, "y": 0, "z": 0 }
            }
          ]
        }
      }

      Ejemplo de un objeto en la lista 'objetos':
      - Para un cilindro (tubería): { "id": "tuberia_1", "tipo": "tubería", "forma": "cilindro", "posicion": { "x": 10, "y": -20, "z": 5 }, "dimensiones": { "radio": 5, "altura": 80 }, "rotacion": { "x": 1.57, "y": 0, "z": 0 } }
      - Para un cubo (roca): { "id": "roca_1", "tipo": "roca", "forma": "cubo", "posicion": { "x": -15, "y": -30, "z": -10 }, "dimensiones": { "ancho": 15, "alto": 15, "profundidad": 15 }, "rotacion": { "x": 0, "y": 0.5, "z": 0 } }
      - Para una esfera (vacío): { "id": "vacio_1", "tipo": "vacío", "forma": "esfera", "posicion": { "x": 0, "y": -50, "z": 20 }, "dimensiones": { "radio": 10 }, "rotacion": { "x": 0, "y": 0, "z": 0 } }

      Las posiciones 'y' deben ser negativas para indicar profundidad. El terreno tiene un ancho y profundidad de 100 unidades. Las posiciones x y z de los objetos deben estar dentro del rango de -50 a 50.
      Analiza la imagen proporcionada y devuelve solo el objeto JSON.
    `;

    const body = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64ImageData,
              },
            },
          ],
        },
      ],
    };

    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error en la API de Gemini: ${errorText}`);
    }

    const data = await response.json();
    const jsonString = data.candidates[0].content.parts[0].text;
    const result = JSON.parse(jsonString);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});