import "./main.ts";

const values = (new URLSearchParams(location.search).get("columns") ?? "1,0.75,0.6,0.55,0.51,0.49,0.45,0.25,0.1,0")
  .split(",")
  .map(Number);

const template = document.getElementById("column") as HTMLTemplateElement;
const grid = document.getElementById("grid")!;
for (const bg of values) {
  const column = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
  column.style.setProperty("--huet-bg", String(bg));
  column.querySelector("[data-label]")!.textContent = `bg ${bg}`;
  grid.append(column);
}
