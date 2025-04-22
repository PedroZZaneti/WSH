// Importa o módulo nativo 'fs' (file system) para leitura e escrita de arquivos
const fs = require("fs");

// Importa o módulo 'path' para resolver caminhos de forma segura entre sistemas operacionais
const path = require("path");

// Importa o módulo 'csv-parser' para fazer leitura e conversão de arquivos CSV
const csv = require("csv-parser");

// Define um tipo genérico para representar uma linha do CSV como um objeto com chave string e valor string
type Customer = Record<string, string>;

// Define o caminho para o arquivo de entrada (CSV) a partir do diretório atual do script
const INPUT_CSV = path.join(__dirname, "../customers.csv");

// Define o caminho para o arquivo JSON de saída (base de dados do JSON Server)
const OUTPUT_JSON = path.join(__dirname, "../database.json");

// Define o caminho para o arquivo de log de erros
const ERROR_LOG = path.join(__dirname, "../error_report.csv");

// Função para validar formato de e-mail (precisa conter "@" e ".")
const isValidEmail = (email: string | undefined): boolean =>
  typeof email === "string" && /\S+@\S+\.\S+/.test(email);

// Função para limpar um número de telefone, removendo tudo que não for número
const cleanPhone = (phone: string | undefined): string => {
  if (!phone) return "";
  return phone.replace(/\D/g, ""); // Remove tudo que não for dígito
};

// Verifica se a data está no formato YYYY-MM-DD e no intervalo permitido (2000 a 2025)
const isValidDate = (date: string | undefined): boolean => {
  if (!date) return false;
  const year = new Date(date).getFullYear();
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && year >= 2000 && year <= 2025;
};

// Converte membership para os valores esperados: bronze, silver, gold. "basic" vira "bronze".
const normalizeMembership = (value: string | undefined | null) => {
  // Verificação mais robusta do valor de entrada
  if (value === undefined || value === null || typeof value !== "string") {
    return "";
  }
  
  // Remove espaços e converte para minúsculas
  const normalized = value.trim().toLowerCase();
  
  // Verifica os casos possíveis
  if (normalized === "basic") return "bronze";
  if (["silver", "gold"].includes(normalized)) return normalized;
  return ""
  
  
};

// Converte valores de "churned" em booleano: yes/y/1 vira true, no/n/0 vira false, qualquer outro vira ""
const normalizeChurned = (value: string | undefined): boolean | "" => {
  const lower = (value || "").toLowerCase();
  if (["y", "yes", "1"].includes(lower)) return true;
  if (["n", "no", "0"].includes(lower)) return false;
  return "";
};

// Função que processa e valida uma linha do CSV, retornando o objeto final e uma lista de erros
const processRow = (row: Customer, index: number) => {
  const errors: string[] = [];

  // Validação de idade
  const rawAge = parseInt(row.age);
  const age = isNaN(rawAge) ? "" : rawAge;
  if (age === "") errors.push("Invalid age");

  // Validação de e-mail
  const email = (row.email || "").toLowerCase();
  if (!isValidEmail(email)) errors.push("Invalid email format");

  // Validação de gênero (M ou F)
  const gender = row.gender === "M" || row.gender === "F" ? row.gender : "";
  if (!gender) errors.push("Invalid gender");

  // Validação de telefone (mínimo 10 dígitos)
  const phone = cleanPhone(row.phone);
  if (phone.length < 10) errors.push("Phone number too short");

  // Validação das datas de entrada e última compra
  const joinedAt = isValidDate(row.joinedAt) ? row.joinedAt : "";
  const lastPurchaseAt =
    isValidDate(row.lastPurchaseAt) &&
    joinedAt &&
    new Date(row.lastPurchaseAt) > new Date(joinedAt)
      ? row.lastPurchaseAt
      : "";

  if (!joinedAt) errors.push("Invalid join date");
  if (!lastPurchaseAt) errors.push("Invalid or earlier last purchase date");

  // Limpa valores de categorias inválidas
  const preferredCategory = ["Unknown", "TBD", "To Be Determined", "N/A"].includes(
    (row.preferredCategory || "").trim()
  )
    ? ""
    : row.preferredCategory;

  // Cria o objeto do cliente validado e transformado
  const customer = {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    age,
    gender,
    postalCode: row.postalCode,
    email: isValidEmail(email) ? email : "",
    phone: phone.length >= 10 ? phone : "",
    membership: normalizeMembership(row.membership),
    joinedAt,
    lastPurchaseAt,
    totalSpending: parseFloat(row.totalSpending || "0"),
    averageOrderValue: parseFloat(row.averageOrderValue || "0"),
    frequency: parseFloat(row.frequency || "0"),
    preferredCategory,
    churned: normalizeChurned(row.churned),
  };

  // Retorna o objeto e os erros encontrados, com o número da linha no CSV
  return { customer, errors, rowNumber: index + 2 }; // +2 pois o CSV começa na linha 1 e o índice começa em 0
};

// Array onde os clientes processados serão armazenados
const customers: any[] = [];

// Array de logs de erro com cabeçalho CSV
const errorLogs: string[] = ["Row Number,Error Description"];

// Inicia a leitura do arquivo CSV como stream
fs.createReadStream(INPUT_CSV)
  .pipe(csv()) // Converte as linhas do CSV em objetos
  .on("data", (row: Customer) => {
    // Para cada linha, processa e valida os dados
    const { customer, errors, rowNumber } = processRow(row, customers.length);

    // Adiciona o cliente à lista principal
    customers.push(customer);

    // Adiciona cada erro à lista de logs
    errors.forEach((e) => errorLogs.push(`${rowNumber},${e}`));
  })
  .on("end", () => {
    // Quando terminar de ler todas as linhas...

    // Inicializa os dados existentes do database.json
    let existingData: { customers: any[] } = { customers: [] };

    // Verifica se database.json já existe e carrega os dados anteriores
    if (fs.existsSync(OUTPUT_JSON)) {
      try {
        const raw = fs.readFileSync(OUTPUT_JSON, "utf-8");
        existingData = JSON.parse(raw);
        if (!Array.isArray(existingData.customers)) {
          existingData.customers = [];
        }
      } catch (err) {
        console.error("Erro ao ler database.json:", err);
      }
    }

    // Adiciona os novos clientes ao array existente
    existingData.customers.push(...customers);

    // Salva o JSON com todos os clientes (anteriores + novos)
    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(existingData, null, 2));

    // Salva o relatório de erros em CSV
    fs.writeFileSync(ERROR_LOG, errorLogs.join("\n"));

    // Mensagens de confirmação no console
    console.log(" Importação finalizada com sucesso!");
    console.log(` ${customers.length} registros adicionados.`);
    console.log(`  ${errorLogs.length - 1} erros registrados em error_report.csv`);
  });
