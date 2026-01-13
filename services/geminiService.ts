
import { GoogleGenAI, Type } from "@google/genai";
import { InventoryItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const analyzeInventory = async (items: InventoryItem[]) => {
  const model = "gemini-3-flash-preview";
  const prompt = `Analise a seguinte lista de materiais de escritório e forneça 3 insights estratégicos em formato JSON. 
  Considere itens que podem estar em falta, sugestões de organização ou categorias.
  
  Itens: ${JSON.stringify(items.map(i => ({ name: i.name, qty: i.quantity, cat: i.category })))}
  
  Responda apenas com o JSON seguindo o esquema:
  Array<{ title: string, description: string, priority: 'low' | 'medium' | 'high' }>`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              priority: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
            },
            required: ['title', 'description', 'priority'],
          },
        },
      },
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Erro ao analisar inventário:", error);
    return [
      {
        title: "Dica de Estoque",
        description: "Mantenha sempre uma reserva de grampos para evitar interrupções.",
        priority: "medium"
      }
    ];
  }
};
