const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

type Customer = Record<string, string>;

const INPUT_CSV = path.join(__dirname, "../customers.csv");
const OUTPUT_JSON = path.join(__dirname, "../database.json");
const ERROR_LOG = path.join(__dirname, "../error_report.csv");

const isValidEmail = (email: string | undefined): boolean =>
  typeof email === "string" && /\S+@\S+\.\S+/.test(email);

const cleanPhone = (phone: string | undefined): string => {
  if (!phone) return "";
  return phone.replace(/\D/g, "");
};

const isValidDate = (date: string | undefined): boolean => {
  if (!date) return false;
  const year = new Date(date).getFullYear();
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && year >= 2000 && year <= 2025;
};

const normalizeMembership = (value: string | undefined) => {
  const lower = (value || "").toLowerCase();
  if (lower === "basic") return "bronze";
  if (["silver", "gold"].includes(lower)) return lower;
  return "";
};

const normalizeChurned = (value: string | undefined): boolean | "" => {
  const lower = (value || "").toLowerCase();
  if (["true", "yes", "1", "y"].includes(lower)) return true;
  if (["false", "no", "0", "n"].includes(lower)) return false;
  return "";
};

// Função principal de transformação e validação da linha CSV
const parseDate = (dateStr: string | undefined): string => {
  if (!dateStr) return "";

  const raw = dateStr.trim();

  // Tenta converter usando o objeto Date
  const date = new Date(raw);

  if (isNaN(date.getTime())) return ""; // Data inválida

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  if (year < 2000 || year > 2025) return "";

  return `${year}-${month}-${day}`; // Formato final: YYYY-MM-DD
};

const processRow = (row: Customer, index: number) => {
  const errors: string[] = [];

  // Campos renomeados conforme CSV original
  const id = row["customer_id"];
  const firstName = row["first_name"];
  const lastName = row["last_name"];
  const postalCode = row["postal_code"];

  const rawAge = parseInt(row["age"]);
  const age = isNaN(rawAge) ? "" : rawAge;
  if (age === "") errors.push("Invalid age");

  const email = (row["email"] || "").toLowerCase();
  if (!isValidEmail(email)) errors.push("Invalid email format");

  const gender = row["gender"] === "M" || row["gender"] === "F" ? row["gender"] : "";
  if (!gender) errors.push("Invalid gender");

  const phone = cleanPhone(row["phone_number"]);
  if (phone.length < 10) errors.push("Phone number too short");

  const joinedAt = parseDate(row["join_date"]);
  const lastPurchaseAt = parseDate(row["last_purchase_date"]);

  if (!joinedAt) errors.push("Invalid join date");
  if (!lastPurchaseAt || new Date(lastPurchaseAt) <= new Date(joinedAt)) {
    errors.push("Invalid or earlier last purchase date");
  }

  const preferredCategory = ["Unknown", "TBD", "To Be Determined", "N/A"].includes(
    (row["preferred_category"] || "").trim()
  )
    ? ""
    : row["preferred_category"];

  const churned = normalizeChurned((row["churned"] || "").trim());

  const customer = {
    id,
    firstName,
    lastName,
    age,
    gender,
    postalCode,
    email: isValidEmail(email) ? email : "",
    phone: phone.length >= 10 ? phone : "",
    membership: normalizeMembership(row["membership_status"]),
    joinedAt,
    lastPurchaseAt,
    totalSpending: parseFloat(row["total_spending"] || "0"),
    averageOrderValue: parseFloat(row["average_order_value"] || "0"),
    frequency: parseFloat(row["frequency"] || "0"),
    preferredCategory,
    churned,
  };

  return { customer, errors, rowNumber: index + 2 };
};

const customers: any[] = [];
const errorLogs: string[] = ["Row Number,Error Description"];

fs.createReadStream(INPUT_CSV)
  .pipe(csv())
  .on("data", (row: Customer) => {
    const { customer, errors, rowNumber } = processRow(row, customers.length);
    customers.push(customer);
    errors.forEach((e) => errorLogs.push(`${rowNumber},${e}`));
  })
  .on("end", () => {
    let existingData: { customers: any[] } = { customers: [] };

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

    existingData.customers.push(...customers);

    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(existingData, null, 2));
    fs.writeFileSync(ERROR_LOG, errorLogs.join("\n"));

    console.log(" Importação finalizada com sucesso!");
    console.log(` ${customers.length} registros adicionados.`);
    console.log(
      ` ${errorLogs.length - 1} erros registrados em error_report.csv`
    );
  });
