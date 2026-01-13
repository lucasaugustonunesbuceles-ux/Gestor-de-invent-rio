
import { GoogleGenAI, Type } from "@google/genai";
import { InventoryItem } from "../types";

export const analyzeInventory = async (items: InventoryItem[]) => {
  // Inicialização dentro da função para garantir que process.env.API_KEY esteja disponível
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";
  
  const prompt = `Analise este inventário de materiais de escritório e forneça 3 insights estratégicos.
  Itens: ${JSON.stringify(items.map(i => ({ nome: i.name, qtd: i.quantity, cat: i.category })))}
  
  Retorne um JSON estritamente com este formato:
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
              priority: { 
                type: Type.STRING,
                enum: ['low', 'medium', 'high']
              },
            },
            required: ['title', 'description', 'priority'],
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("Resposta vazia da IA");
    return JSON.parse(text);
  } catch (error) {
    console.error("Erro detalhado na IA:", error);
    // Fallback amigável
    return [
      {
        title: "Dica de Reposição",
        description: "Verifique se há itens com quantidade baixa (menos de 2 unidades) para evitar interrupções no trabalho.",
        priority: "medium"
      },
      {
        title: "Organização",
        description: "Agrupar itens por categoria ajuda na localização rápida durante o uso diário.",
        priority: "low"
      }
    ];
  }
};
