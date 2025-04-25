import express, { Request, Response } from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
const PORT = 4000;

app.use(cors());

const DB_PATH = path.join(__dirname, "../database.json");

// Função que carrega os dados do JSON
const loadData = () => {
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw).customers || [];
};

// Função auxiliar para extrair o ano de uma data
const getYear = (date: string): number => new Date(date).getFullYear();

// Rota: /api/overview → métricas gerais
app.get("/api/overview", (req: Request, res: Response) => {
  const customers = loadData();

  const total = customers.length;
  const ages = customers.map((c: any) => c.age).filter((a: any) => a !== "");
  const averageAge = Math.round(ages.reduce((a: number, b: number) => a + b, 0) / ages.length);

  const categoryCount: Record<string, number> = {};
  customers.forEach((c: any) => {
    if (!c.preferredCategory) return;
    categoryCount[c.preferredCategory] = (categoryCount[c.preferredCategory] || 0) + 1;
  });
  const mostFrequentCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0];

  const totalSpending = customers.reduce((sum: number, c: any) => sum + (c.totalSpending || 0), 0);
  const averageOrderValue = totalSpending / total;
  const purchaseFrequency = customers.reduce((sum: number, c: any) => sum + (c.frequency || 0), 0) / total;

  res.json({
    totalCustomers: total,
    averageAge,
    mostFrequentCategory,
    totalPurchaseValue: totalSpending,
    averageOrderValue: averageOrderValue.toFixed(2),
    averagePurchaseFrequency: purchaseFrequency.toFixed(2)
  });
});

// Rota: /api/demographics → distribuição de gênero e membership
app.get("/api/demographics", (req: Request, res: Response) => {
  const customers = loadData();

  const genderCount: Record<string, number> = { M: 0, F: 0, Unknown: 0 };
  const membershipCount: Record<string, number> = { bronze: 0, silver: 0, gold: 0 };

  customers.forEach((c: any) => {
    const genderKey = c.gender || "Unknown";
    genderCount[genderKey] = (genderCount[genderKey] || 0) + 1;

    if (membershipCount[c.membership] !== undefined) {
      membershipCount[c.membership] += 1;
    }
  });

  res.json({ genderCount, membershipCount });
});

// Rota: /api/purchase-behavior → categorias + top 10 gastadores
app.get("/api/purchase-behavior", (req: Request, res: Response) => {
  const customers = loadData();

  const categoryCount: Record<string, number> = {};
  customers.forEach((c: any) => {
    const cat = c.preferredCategory;
    if (!cat) return;
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });

  const topSpenders = [...customers]
    .sort((a: any, b: any) => b.totalSpending - a.totalSpending)
    .slice(0, 10)
    .map((c: any) => ({
      name: `${c.firstName} ${c.lastName}`,
      totalSpending: c.totalSpending
    }));

  res.json({ categoryCount, topSpenders });
});

// Rota: /api/trends → novos clientes por ano
app.get("/api/trends", (req: Request, res: Response) => {
  const customers = loadData();
  const yearlyCount: Record<number, number> = {};

  customers.forEach((c: any) => {
    const year = getYear(c.joinedAt);
    if (year >= 2000 && year <= 2025) {
      yearlyCount[year] = (yearlyCount[year] || 0) + 1;
    }
  });

  const sorted = Object.entries(yearlyCount)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([year, count]) => ({ year: Number(year), count }));

  res.json(sorted);
});

console.log(">> Lendo de:", DB_PATH);
// Inicia o servidor na porta definida
app.listen(PORT, () => {
  console.log(` Dashboard API rodando em http://localhost:${PORT}`);
});
