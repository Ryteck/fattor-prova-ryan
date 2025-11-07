"use server";

import { type BCred, generateBCred } from "@/mocks/b-cred";
import { type BomPagador, generateBomPagador } from "@/mocks/bom-pagador";

export interface GetClientDataActionResponse {
	bCred: BCred;
	bomPagador: BomPagador[];
}

export async function getClientDataAction(
	cnpj: string,
): Promise<GetClientDataActionResponse> {
	const bCred = generateBCred(cnpj);
	const bomPagador = generateBomPagador();

	return {
		bCred,
		bomPagador,
	};
}
