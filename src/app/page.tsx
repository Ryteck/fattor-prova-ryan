"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
	BarChart3,
	CheckCircle2,
	FileSpreadsheet,
	Search,
	TrendingUp,
	UploadCloud,
} from "lucide-react";
import Papa from "papaparse";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import Markdown from "react-markdown";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip as RTooltip,
	XAxis,
	YAxis,
} from "recharts";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import z from "zod";
import { generateAIAnalisysAction } from "@/actions/generate-ai-analisys";
import {
	type GetClientDataActionResponse,
	getClientDataAction,
} from "@/actions/get-client-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

type FaturamentoItem = { competence: string; value: number };

const searchFormSchema = z.object({
	cnpj: z.string().min(1, { message: "CNPJ é obrigatório" }),
});

const brl = (v: number) =>
	new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
		v,
	);

const pct = (v: number) => `${v.toFixed(0)}%`;

const chartConfig = {
	paid: {
		label: "Pagos",
	},
	not_paid: {
		label: "Não pagos",
	},
} satisfies ChartConfig;

export default function FattorSearch() {
	const [data, setData] = useState<GetClientDataActionResponse | null>(null);
	const [faturamento, setFaturamento] = useState<FaturamentoItem[]>([]);
	const [isGeneratingAIAnalysis, startGeneratingAIAnalysis] = useTransition();
	const [aiAnalysisResult, setAIAnalysisResult] = useState<string | null>(null);
	const [isOpenAIAnalysisDialog, setIsOpenAIAnalysisDialog] = useState(false);

	const dti = data
		? Math.min(100, (data.bCred.current_debt / data.bCred.income) * 100)
		: 0; // dívida / renda em % máximo de 100%

	const searchForm = useForm({
		resolver: zodResolver(searchFormSchema),
		defaultValues: {
			cnpj: "",
		},
	});

	async function handleSearch({ cnpj }: z.infer<typeof searchFormSchema>) {
		const promise = getClientDataAction(cnpj);

		toast.promise(promise, {
			loading: "Buscando cliente...",
			success: "Cliente encontrado com sucesso!",
			error: "Erro ao buscar cliente!",
		});

		await promise.then(setData).catch(() => null);
	}

	function handleUploadCSV(file: File) {
		Papa.parse(file, {
			header: true,
			skipEmptyLines: true,
			complete: (results) => {
				try {
					const rows = results.data.map((r) => ({
						competence: String(r.competence).trim(),
						value: Number(r.value),
					}));
					// validação básica
					const ok = rows.every((r) => r.competence && !Number.isNaN(r.value));
					if (!ok)
						throw new Error(
							"CSV inválido. Verifique colunas 'competence' e 'value'.",
						);
					setFaturamento(rows);
				} catch (e: any) {}
			},
			error: (e) => {},
		});
	}

	if (!data)
		return (
			<div className="flex flex-col items-center space-y-6">
				<h1 className="text-5xl font-bold tracking-wide">
					<span className="text-sky-300">Fattor</span> loans
				</h1>

				{/* Campo de busca */}
				<form
					onSubmit={searchForm.handleSubmit(handleSearch)}
					className="flex items-center bg-white rounded-full px-4 py-2 shadow-lg w-80 md:w-96"
				>
					<Search className="text-sky-600 mr-3" />
					<input
						type="text"
						placeholder="Digite o CNPJ..."
						className="flex-1 text-gray-800 focus:outline-none"
						{...searchForm.register("cnpj")}
					/>
				</form>
			</div>
		);

	return (
		<main className="mx-auto max-w-6xl px-4 pb-16">
			{/* Painel de análise principal */}
			<Card className="bg-sky-800/50 border-white/10 mb-6">
				<CardHeader className="flex flex-col gap-1">
					<CardTitle className="flex items-center gap-2 text-sky-100">
						<TrendingUp className="w-5 h-5 text-sky-300" /> Resultados
						preliminares da análise
					</CardTitle>
				</CardHeader>
				<CardContent>
					{data?.bCred && (
						<p className="animate-pulse text-sky-200">
							Analisando dados do cliente…
						</p>
					)}
					{data?.bCred && data?.bomPagador && (
						<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
							<div className="col-span-1">
								<div className="text-sm text-sky-300">Cliente</div>
								<div className="font-semibold ">{data.bCred.name}</div>
							</div>
							<div className="col-span-1">
								<div className="text-sm text-sky-300">Score de Crédito</div>
								<div className="text-2xl font-bold ">{data.bCred.score}</div>
							</div>
							<div className="col-span-1">
								<div className="text-sm text-sky-300">Dívida / Renda (DTI)</div>
								<div className="text-2xl font-bold ">{pct(dti)}</div>
							</div>
							<div className="col-span-1">
								<div className="text-sm text-sky-300">
									Pagamentos Pontuais (12m)
								</div>
								<div className="text-2xl font-bold ">
									{pct(
										data.bCred.payment_history.last_12_months_on_time_percent,
									)}
								</div>
							</div>
						</div>
					)}

					{/*
- Se o percentual de dívidas pagas for **inferior a 50%**, o cliente é **recusado** em qualquer operação.
- Se o percentual for **igual ou superior a 70%**, o cliente é **aprovado**.
- Se o percentual for **igual ou superior a 90%**, ele é **elegível para empréstimos de nível superior**.
					
- **P:** score acima de **400** e faturamento mensal acima de **R$ 10.000**
- **M:** score acima de **600** e faturamento mensal acima de **R$ 100.000**
- **G:** score acima de **800** e faturamento mensal acima de **R$ 1.000.000**

*/}

					<div className="full mt-8 text-sm text-sky-300 flex items-center">
						<div>
							<p>
								Situação preliminar:{" "}
								{data.bCred.payment_history.last_12_months_on_time_percent < 50
									? "Recusado"
									: data.bCred.payment_history.last_12_months_on_time_percent >=
											70
										? "Aprovado"
										: data.bCred.payment_history
													.last_12_months_on_time_percent >= 90
											? "Elegível para empréstimos de nível superior"
											: "Necessita análise manual"}
							</p>
							<br />
							<p>
								Nível de empréstimo recomendado:{" "}
								{data.bCred.score > 800
									? "G (Score acima de 800 e faturamento mensal acima de R$ 1.000.000)"
									: data.bCred.score > 600
										? "M (Score acima de 600 e faturamento mensal acima de R$ 100.000)"
										: data.bCred.income > 10000
											? "P (Score acima de 400 e faturamento mensal acima de R$ 10.000)"
											: "Não recomendado"}
							</p>
						</div>

						<Button
							variant="outline"
							className="ml-auto"
							onClick={() => {
								if (aiAnalysisResult) {
									setIsOpenAIAnalysisDialog(true);
									return;
								}

								const promise = generateAIAnalisysAction({
									bCred: data.bCred,
									bomPagador: data.bomPagador,
									faturamento: faturamento,
								});

								toast.promise(promise, {
									loading: "Gerando análise de IA...",
									success: "Análise de IA gerada com sucesso!",
									error: "Erro ao gerar análise de IA!",
								});

								startGeneratingAIAnalysis(async () => {
									await promise.then(setAIAnalysisResult).catch(() => null);
									setIsOpenAIAnalysisDialog(true);
								});
							}}
							disabled={isGeneratingAIAnalysis}
						>
							{isGeneratingAIAnalysis
								? "Gerando análise de IA..."
								: "Solicitar Análise de IA"}
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Quadros secundários (3 seções) */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* 1) Análise de Crédito */}
				<Card className="bg-sky-800/50 border-white/10">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 ">
							<BarChart3 className="w-5 h-5 text-sky-300" /> Análise de Crédito
						</CardTitle>
					</CardHeader>
					<CardContent className="text-sm space-y-2">
						<div className="grid grid-cols-2 gap-3">
							<div>
								<div className="text-sky-300">Renda</div>
								<div className="font-semibold ">{brl(data.bCred.income)}</div>
							</div>
							<div>
								<div className="text-sky-300">Dívida Atual</div>
								<div className="font-semibold ">
									{brl(data.bCred.current_debt)}
								</div>
							</div>
							<div>
								<div className="text-sky-300">Linhas de Crédito</div>
								<div className="font-semibold ">
									{data.bCred.open_credit_lines}
								</div>
							</div>
							<div>
								<div className="text-sky-300">Atrasos</div>
								<div className="font-semibold ">{data.bCred.delinquencies}</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* 2) Bom Pagador (gráfico) */}
				<Card className="bg-sky-800/50 border-white/10">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CheckCircle2 className="w-5 h-5 text-emerald-300" /> BOM_PAGADOR
							(12 meses)
						</CardTitle>
					</CardHeader>
					<CardContent className="h-64">
						<ResponsiveContainer width="100%" height="100%">
							<ChartContainer
								config={chartConfig}
								className="aspect-auto h-[250px] w-full"
							>
								<BarChart accessibilityLayer data={data.bomPagador}>
									<CartesianGrid vertical={false} />

									<XAxis
										dataKey="competence"
										tickLine={false}
										tickMargin={10}
										axisLine={false}
										tickFormatter={(value) => value.slice(0, 3)}
									/>

									<ChartTooltip content={<ChartTooltipContent hideLabel />} />
									<ChartLegend content={<ChartLegendContent />} />

									<Bar
										dataKey="paid"
										stackId="paid"
										name="Pagos"
										fill="var(--chart-2)"
										radius={[4, 4, 0, 0]}
									/>
									<Bar
										dataKey="not_paid"
										stackId="not_paid"
										name="Não pagos"
										fill="var(--chart-5)"
										radius={[4, 4, 0, 0]}
									/>
								</BarChart>
							</ChartContainer>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				{/* 3) Faturamento (upload CSV + gráfico) */}
				<Card className="bg-sky-800/50 border-white/10">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<FileSpreadsheet className="w-5 h-5 text-sky-300" /> Faturamento
							(CSV)
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center gap-3">
							<Label htmlFor="csv" className="text-sky-200 text-sm">
								Carregar CSV
							</Label>
							<div className="flex items-center gap-2">
								<Input
									id="csv"
									type="file"
									accept=".csv"
									onChange={(e) => {
										const f = e.target.files?.[0];
										if (f) handleUploadCSV(f);
									}}
								/>
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button variant="outline" className="border-white/20">
												<UploadCloud className="w-4 h-4 mr-2" /> Exemplo
											</Button>
										</TooltipTrigger>
										<TooltipContent className="max-w-xs text-xs">
											<p>Estrutura esperada:</p>
											<pre className="whitespace-pre-wrap">{`competence,value\n2025-01,10000\n2025-02,12000\n2025-03,11000\n2025-04,13000\n2025-05,14000\n2025-06,15000`}</pre>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>
						</div>

						<div className="h-56">
							{!faturamento.length ? (
								<div className="text-sky-200/80 text-sm">
									Nenhum arquivo enviado. Faça upload de um CSV para visualizar
									o gráfico de faturamento.
								</div>
							) : (
								<ResponsiveContainer width="100%" height="100%">
									<LineChart data={faturamento}>
										<XAxis dataKey="competence" tick={{ fill: "#cbd5e1" }} />
										<YAxis
											tickFormatter={(v) => brl(v)}
											tick={{ fill: "#cbd5e1" }}
										/>
										<RTooltip
											formatter={(v) => brl(Number(v))}
											contentStyle={{
												background: "#0f172a",
												border: "1px solid rgba(255,255,255,0.1)",
												color: "white",
											}}
										/>
										<Line
											type="monotone"
											dataKey="value"
											name="Faturamento"
											strokeWidth={2}
											dot={false}
										/>
									</LineChart>
								</ResponsiveContainer>
							)}
						</div>
					</CardContent>
				</Card>
			</div>

			<Dialog
				open={isOpenAIAnalysisDialog}
				onOpenChange={setIsOpenAIAnalysisDialog}
			>
				<DialogContent className="max-h-[92dvh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Análise de IA</DialogTitle>
					</DialogHeader>
					<Markdown remarkPlugins={[remarkGfm]}>{aiAnalysisResult}</Markdown>,
				</DialogContent>
			</Dialog>
		</main>
	);
}
