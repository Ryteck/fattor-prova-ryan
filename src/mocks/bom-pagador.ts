import { faker } from "@faker-js/faker";
import z from "zod";

const bomPagadorSchema = z.object({
	competence: z.string().min(1, { message: "Competência é obrigatória" }),
	paid: z.number({ error: "Valor pago é obrigatório" }),
	not_paid: z.number({ error: "Valor não pago é obrigatório" }),
});

export type BomPagador = z.infer<typeof bomPagadorSchema>;

export const generateBomPagador = (): BomPagador[] => {
	return Array.from({ length: 12 }).map((_, index) => {
		const date = new Date();
		date.setMonth(date.getMonth() - index);
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const year = date.getFullYear();
		const competence = `${year}-${month}`;

		return {
			competence,
			paid: faker.number.float({ min: 0, max: 10000, fractionDigits: 2 }),
			not_paid: faker.number.float({ min: 0, max: 10000, fractionDigits: 2 }),
		};
	});
};
