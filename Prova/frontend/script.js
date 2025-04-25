const BASE_URL = "http://localhost:4000/api";

// Painel de métricas
fetch(`${BASE_URL}/overview`)
  .then(res => res.json())
  .then(data => {
    const ul = document.getElementById("overview-metrics");
    ul.innerHTML = `
      <li><strong>Total Customers:</strong> ${data.totalCustomers}</li>
      <li><strong>Average Age:</strong> ${data.averageAge}</li>
      <li><strong>Most Frequent Category:</strong> ${data.mostFrequentCategory}</li>
      <li><strong>Total Purchase:</strong> $${data.totalPurchaseValue.toFixed(2)}</li>
      <li><strong>Avg Order Value:</strong> $${data.averageOrderValue}</li>
      <li><strong>Purchase Frequency:</strong> ${data.averagePurchaseFrequency}</li>
    `;
  });

// Gráficos de gênero e membership
fetch(`${BASE_URL}/demographics`)
  .then(res => res.json())
  .then(data => {
    new Chart(document.getElementById("genderChart"), {
      type: "pie",
      data: {
        labels: Object.keys(data.genderCount),
        datasets: [{
          label: "Gender",
          data: Object.values(data.genderCount),
          backgroundColor: ["#ff6384", "#36a2eb", "#ccc"]
        }]
      }
    });

    new Chart(document.getElementById("membershipChart"), {
      type: "pie",
      data: {
        labels: Object.keys(data.membershipCount),
        datasets: [{
          label: "Membership",
          data: Object.values(data.membershipCount),
          backgroundColor: ["#cd7f32", "#c0c0c0", "#ffd700"]
        }]
      }
    });
  });

// Categorias + top gastadores
fetch(`${BASE_URL}/purchase-behavior`)
  .then(res => res.json())
  .then(data => {
    new Chart(document.getElementById("categoryChart"), {
      type: "bar",
      data: {
        labels: Object.keys(data.categoryCount),
        datasets: [{
          label: "Categories",
          data: Object.values(data.categoryCount),
          backgroundColor: "#82c91e"
        }]
      }
    });

    const tbody = document.querySelector("#top-spenders tbody");
    data.topSpenders.forEach(spender => {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${spender.name}</td><td>$${spender.totalSpending.toFixed(2)}</td>`;
      tbody.appendChild(row);
    });
  });
  
// Gráfico de linha de novos clientes por ano
fetch(`${BASE_URL}/trends`)
  .then(res => res.json())
  .then(data => {
    const labels = data.map(item => item.year);
    const values = data.map(item => item.count);

    new Chart(document.getElementById("trendsChart"), {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "New Customers",
          data: values,
          borderColor: "#4dabf7",
          fill: false
        }]
      }
    });
  });

