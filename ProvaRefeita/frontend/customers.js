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

    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(c => 
        (c.firstName + "" + c.lastName).toLowerCase().includes(searchTerm) ||
        (c.email || "").toLowerCase().includes(searchTerm)
        );
    }

    if (filterMembership.value) {
        filtered.sort((a, b) => {
            if (sortField.value === "firstName"){
                return (a.firstName + a.lastName).localeCompare(b.firstName + b.lastName); 
            } else {
                return (a[sortField.value] || 0) - (b[sortField.value] || 0);
            }
        });
    }

    const totalPages = Math.ceil(filtered.length / pageSize);
    if (currentPage > totalPages) currentPage = totalPages;
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageData = filtered.slice(start, end);

    customersTable.innerHTML = pageData.map(c =>`
        <tr>
            <td>${c.id}</td>
            <td>${c.firstName}</td>
            <td>${c.lastName}</td>
            <td>${c.age}</td>
            <td>${c.gender}</td>
            <td>${c.postalCode}</td>
            <td>${c.emai}</td>
            <td>${c.phone}</td>
            <td>${c.membership}</td>
            <td>${c.joinedAt}</td>
            <td>${c.lastPurchaseAt}</td>
            <td>${c.totalSpending.toFixed(2)}</td>
            <td>${c.averageOrderValue.toFixed(2)}</td>
            <td>${c.frequency}</td>
            <td>${c.preferredCategory}</td>
            <td>${c.churned ? "yes" : "no"}</td>
        </tr>`).join("");

}
