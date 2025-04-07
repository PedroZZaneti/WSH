const container = document.querySelector(".img-compare-container");
const afterImg = document.querySelector(".img-wrapper.after");
const splitter = document.querySelector(".splitter");

const moveSplitter = (x) => {
  const rect = container.getBoundingClientRect();
  let offset = x - rect.left;
  offset = Math.max(0, Math.min(offset, rect.width));
  const percent = (offset / rect.width) * 100;
  afterImg.style.width = `${percent}%`;
  splitter.style.left = `${percent}%`;
};

let isDragging = false;

container.addEventListener("mousedown", (e) => {
  isDragging = true;
  moveSplitter(e.clientX);
});

window.addEventListener("mousemove", (e) => {
  if (isDragging) moveSplitter(e.clientX);
});

window.addEventListener("mouseup", () => {
  isDragging = false;
});

container.addEventListener("click", (e) => {
  moveSplitter(e.clientX);
});
