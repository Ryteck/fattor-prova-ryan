import { faker } from "@faker-js/faker";
import z from "zod";

export const bCredSchema = z.object({
	cnpj: z.string().min(1, { message: "CNPJ é obrigatório" }),
	name: z.string().min(1, { message: "Nome é obrigatório" }),
	income: z.number().min(1, { message: "Renda é obrigatória" }),
	open_credit_lines: z
		.number()
		.min(1, { message: "Linhas de crédito ativas é obrigatória" }),
	current_debt: z.number().min(1, { message: "Débito atual é obrigatório" }),
	delinquencies: z
		.number()
		.min(1, { message: "Quantidade de atrasos é obrigatória" }),
	payment_history: z.object({
		last_12_months_on_time_percent: z.number().min(1, {
			message: "Percentual de pagamentos no último ano é obrigatório",
		}),
	}),
	score_scale: z.string().min(1, { message: "Escala de score é obrigatória" }),
	score: z.number().min(1, { message: "Score é obrigatório" }),
	generated_at: z.string().min(1, { message: "Data de geração é obrigatória" }),
});

export type BCred = z.infer<typeof bCredSchema>;

export const generateBCred = (cnpj: string): BCred => {
	return {
		cnpj,
		name: faker.person.fullName(),
		income: faker.number.float({ min: 10000, max: 20000, fractionDigits: 2 }),
		open_credit_lines: faker.number.int({ min: 1, max: 10 }),
		current_debt: faker.number.float({
			min: 0,
			max: 20000,
			fractionDigits: 2,
		}),
		delinquencies: faker.number.int({ min: 0, max: 5 }),
		payment_history: {
			last_12_months_on_time_percent: faker.number.int({ min: 50, max: 100 }),
		},
		score_scale: "0-1000",
		score: faker.number.int({ min: 0, max: 1000 }),
		generated_at: faker.date.recent().toISOString(),
	};
};
