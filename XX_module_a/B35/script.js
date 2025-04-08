const canvas = document.getElementById("fractalCanvas");
const ctx = canvas.getContext("2d");
const iterationsInput = document.getElementById("iterations");
const drawButton = document.getElementById("drawButton");

// Configurações do desenho
const padding = 10;
const triangleSize = Math.min(canvas.width, canvas.height) - 2 * padding;
const centerX = canvas.width / 2;
const topY = padding;

// Função para desenhar o triângulo fractal
function drawSierpinski(iterations) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Coordenadas do triângulo equilátero principal
  const height = (triangleSize * Math.sqrt(3)) / 2;
  const bottomY = topY + height;

  const points = [
    { x: centerX, y: topY }, // Topo
    { x: centerX - triangleSize / 2, y: bottomY }, // Esquerda
    { x: centerX + triangleSize / 2, y: bottomY }, // Direita
  ];

  drawTriangle(points, iterations);
}

// Função recursiva para desenhar triângulos
function drawTriangle(points, depth) {
  if (depth === 0) {
    // Desenha o triângulo atual
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    ctx.lineTo(points[2].x, points[2].y);
    ctx.closePath();
    ctx.stroke();
  } else {
    // Calcula os pontos médios
    const mid01 = {
      x: (points[0].x + points[1].x) / 2,
      y: (points[0].y + points[1].y) / 2,
    };

    const mid12 = {
      x: (points[1].x + points[2].x) / 2,
      y: (points[1].y + points[2].y) / 2,
    };

    const mid20 = {
      x: (points[2].x + points[0].x) / 2,
      y: (points[2].y + points[0].y) / 2,
    };

    // Desenha os 3 sub-triângulos recursivamente
    drawTriangle([points[0], mid01, mid20], depth - 1);
    drawTriangle([mid01, points[1], mid12], depth - 1);
    drawTriangle([mid20, mid12, points[2]], depth - 1);
  }
}

// Event listener para o botão
drawButton.addEventListener("click", () => {
  const iterations = parseInt(iterationsInput.value);
  if (isNaN(iterations) || iterations < 0) {
    alert("Por favor, insira um número válido de iterações (≥ 0)");
    return;
  }

  drawSierpinski(iterations);
});

// Desenha inicialmente com 0 iterações
drawSierpinski(0);
