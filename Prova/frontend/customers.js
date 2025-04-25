const BASE_URL = "http://localhost:3000/customers";
let customers = [];
let currentPage = 1;
const pageSize = 25;

const searchInput = document.getElementById("searchInput");
const filterMembership = document.getElementById("filterMembership");
const filterChurned = document.getElementById("filterChurned");
const sortField = document.getElementById("sortField");
const customersTable = document.getElementById("customersTable").querySelector("tbody");
const pagination = document.getElementById("pagination");

fetch(BASE_URL)
  .then(res => res.json())
  .then(data => {
    customers = data;
    renderTable();
  });

function renderTable() {
  let filtered = [...customers];

  // Buscar
  const searchTerm = searchInput.value.toLowerCase();
  if (searchTerm) {
    filtered = filtered.filter(c =>
      (c.firstName + " " + c.lastName).toLowerCase().includes(searchTerm) ||
      (c.email || "").toLowerCase().includes(searchTerm)
    );
  }

  // Filtro Membership
  if (filterMembership.value) {
    filtered = filtered.filter(c => c.membership === filterMembership.value);
  }

  // Filtro Churned
  if (filterChurned.value) {
    filtered = filtered.filter(c => String(c.churned) === filterChurned.value);
  }

  // Ordenação
  if (sortField.value) {
    filtered.sort((a, b) => {
      if (sortField.value === "firstName") {
        return (a.firstName + a.lastName).localeCompare(b.firstName + b.lastName);
      } else {
        return (a[sortField.value] || 0) - (b[sortField.value] || 0);
      }
    });
  }

  // Paginação
  const totalPages = Math.ceil(filtered.length / pageSize);
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageData = filtered.slice(start, end);

  customersTable.innerHTML = pageData.map(c => `
    <tr>
      <td>${c.id}</td>
      <td>${c.firstName}</td>
      <td>${c.lastName}</td>
      <td>${c.age}</td>
      <td>${c.gender}</td>
      <td>${c.postalCode}</td>
      <td>${c.email}</td>
      <td>${c.phone}</td>
      <td>${c.membership}</td>
      <td>${c.joinedAt}</td>
      <td>${c.lastPurchaseAt}</td>
      <td>$${c.totalSpending.toFixed(2)}</td>
      <td>$${c.averageOrderValue.toFixed(2)}</td>
      <td>${c.frequency}</td>
      <td>${c.preferredCategory}</td>
      <td>${c.churned ? "Yes" : "No"}</td>
    </tr>
  `).join("");
  
}

function renderPagination(totalPages) {
  pagination.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.disabled = true;
    btn.addEventListener("click", () => {
      currentPage = i;
      renderTable();
    });
    pagination.appendChild(btn);
  }
}

// Atualizar lista em tempo real
[searchInput, filterMembership, filterChurned, sortField].forEach(input => {
  input.addEventListener("input", () => {
    currentPage = 1;
    renderTable();
  });
});
