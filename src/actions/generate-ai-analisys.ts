"use server";

import { GoogleGenAI } from "@google/genai";
import type { GetClientDataActionResponse } from "./get-client-data";

type FaturamentoItem = { competence: string; value: number };

interface GenerateAIAnalisysParams extends GetClientDataActionResponse {
	faturamento: FaturamentoItem[];
}

export async function generateAIAnalisysAction(
	params: GenerateAIAnalisysParams,
): Promise<string> {
	const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });

	const response = await ai.models.generateContent({
		model: "gemini-2.5-flash",
		config: {
			systemInstruction: `

                            Você é um assistente técnico que sempre responde em português.
							Você faz parte da Fattor, uma empresa financeira que realiza operações de empréstimo.
							Você deve analisar os dados do cliente e o faturamento mensal e recomendar o nível de empréstimo adequado.
						
							Os níveis de empréstimo são:
							- P: Score acima de 400 e faturamento mensal acima de R$ 10.000
							- M: Score acima de 600 e faturamento mensal acima de R$ 100.000
							- G: Score acima de 800 e faturamento mensal acima de R$ 1.000.000

	                        - Recusado: Percentual de dívidas pagas for inferior a 50%
	                        - Aprovado: Percentual de dívidas pagas for igual ou superior a 70%
	                        - Elegível para empréstimos de nível superior: Percentual de dívidas pagas for igual ou superior a 90%

	                        Faça uma analise completa e detalhada, considerando todos os dados disponíveis.
	                        Responda sempre em MARKDOWN

	                        Os dados do cliente serão enviados em JSON, e devem ser considerados na analise.
            
            `,
		},
		contents: JSON.stringify(params, null, 2),
	});

	return response.text;
}
