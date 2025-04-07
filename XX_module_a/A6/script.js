// // Aguarda o carregamento completo da página
// window.addEventListener("load", function () {
//     document.getElementById("loader").style.display = "none"; // esconde o loader
//     document.getElementById("content").style.display = "block"; // mostra o conteúdo
//     document.body.classList.remove("loading"); // permite rolagem
//   });
  
  window.addEventListener("load", function () {
    // Simula um carregamento mais demorado (por ex: 3 segundos)
    setTimeout(() => {
      document.getElementById("loader").style.display = "none";
      document.getElementById("content").style.display = "block";
      document.body.classList.remove("loading");
    }, 3000); // 3000ms = 3 segundos
  });
  