const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

type Customer = Record<string, string>;

const INPUT_CSV = path.join(__dirname, "../customers.csv");
const OUTPUT_JSON = path.join(__dirname, "../database.json");
const ERROR_LOG = path.join(__dirname, "../error_report.csv");


const isEmailValid = (email: string | undefined): boolean => {

    return typeof email === "string" && /\S+@\S+\.\S+/.test(email);
};

const cleanPhone = (phone: string | undefined): string => {
    if(!phone) return "";
    return phone.replace(/\D/g, "");
};
  
const isDateValid = (date: string | undefined): boolean => {
    if (!date) return false;
    const year = new Date(date).getFullYear();
    return /^\d{4}-\d{2}-\d{2}$/.test(date) && year >= 2000 && year <= 2025;
};

const normalizeMembership = (value: string | undefined ) => {
    const lower = (value || "").toLowerCase();
    if (lower === "basic") return "bronze";
    if (["silver", "gold"].includes(lower)) return lower;
    return "";
}

const normalizeChurned = (value: string | undefined): boolean | "" => {
    const lower = (value || "").toLowerCase();
    if (["true","yes","1","y"].includes(lower)) return true;
    if (["false","no","0","n"].includes(lower)) return false;
    return "";
};

const parseDate = (dateStr: string | undefined): string => {
    if (!dateStr) return "";

    const raw = dateStr.trim();

    const date = new Date(raw);

    if (isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = (date.getMonth()+1).toString().padStart(2,"0");
    const day = date.getDate().toString().padStart(2, "0");

    if (year < 2000 || year > 2025) return "";

    return `${year}-${month}-${day}`;

};

const processRow = (row: Customer, index: number) => {
    const errors: string[] = [];

    const id = row["customer_id"];
    const firstName = row["first_name"];
    const lastName = row["last_name"];
    const postalCode = row["postal_code"];

    const rawAge = parseInt(row["age"]);
    const age = isNaN(rawAge) ? "" : rawAge;
    if (age === "") errors.push("Invalid age");

    const email = (row["email"] || "").toLowerCase();
    if (!isEmailValid(email)) errors.push("Invalid email format");

    const gender = (row["gender"]) === "M" || row["gender"] === "F" ? row["gender"] : "";
    if(!gender) errors.push("Invalid Gender");

    const phone = cleanPhone(row["phone_number"]);
    if (phone.length < 10) errors.push("Invalid Phone Number");

    const joinedAt = parseDate(row["join_date"]);
    if (!joinedAt) errors.push ("Invalid Join Date");

    const lastPurchaseAt = parseDate(row["last_purchase_date"]);
    if (!lastPurchaseAt || new Date(lastPurchaseAt) <= new Date(joinedAt)) {
        errors.push("invalid Date");
    };

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
        email: isEmailValid(email) ? email : "",
        phone: phone.length >= 10 ? phone : "",
        membership : normalizeMembership(row["membership_status"]),
        joinedAt,
        lastPurchaseAt,
        totalSpending: parseFloat(row["total_spending"] || "0"),
        averageOrderValue: parseFloat(row["average_order_value"] || "0"),
        frequency: parseFloat(row["frequency"] || "0"),
        preferredCategory,
        churned,
    };

    return { customer, errors, rowNumber: index + 2};


};

const Customers: any[] = [];
const errorLogs: string[] = ["Row Number, Error Description"];

fs.createReadStream(INPUT_CSV)
.pipe(csv())
.on("data", (row: Customer) => {
    const { customer, errors, rowNumber} = processRow(row, Customers.length);
    Customers.push(customer);
    errors.forEach((e) => errorLogs.push(`${rowNumber},${e}`));
})
.on("end", () => {
    let existingData: { customers: any[]} = { customers: []};
    
    if (fs.existsSync(OUTPUT_JSON)) {
        try {
            const raw = fs.readFileSync(OUTPUT_JSON, "utf-8");
            existingData = JSON.parse(raw);
            if (!Array.isArray(existingData.customers)) {
                existingData.customers = [];
            }
            } catch (err) {
                console.log("Failed to Read Database")
            }
        }

    existingData.customers.push(...Customers);

    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(existingData, null, 2));
    fs.writeFileSync(ERROR_LOG, errorLogs.join("\n"));

    console.log(`${Customers.length} customers joined the database`);
    console.log(`${errorLogs.length - 1} Errors Logged`);

});