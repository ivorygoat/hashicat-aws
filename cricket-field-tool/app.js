const field = document.getElementById("field");
const markerLayer = document.getElementById("marker-layer");
const positionSelect = document.getElementById("position-select");
const markerTemplate = document.getElementById("marker-template");

const positions = [
  "WK", "Slip", "Gully", "Point", "Cover", "Mid-off", "Mid-on", "Square Leg", "Fine Leg", "Third Man", "Deep Point", "Long-off", "Long-on", "Deep Midwicket", "Deep Cover", "Leg Slip"
];

const presets = {
  powerplay: [
    { label: "WK", x: 500, y: 675 },
    { label: "Slip", x: 430, y: 690 },
    { label: "Point", x: 270, y: 420 },
    { label: "Cover", x: 350, y: 300 },
    { label: "Mid-off", x: 450, y: 230 },
    { label: "Mid-on", x: 555, y: 230 },
    { label: "Square Leg", x: 750, y: 465 },
    { label: "Fine Leg", x: 800, y: 615 },
    { label: "Third Man", x: 250, y: 700 },
    { label: "Long-off", x: 370, y: 100 },
    { label: "Long-on", x: 620, y: 100 },
  ],
  defensive: [
    { label: "WK", x: 500, y: 680 },
    { label: "Slip", x: 440, y: 700 },
    { label: "Point", x: 220, y: 460 },
    { label: "Deep Point", x: 120, y: 430 },
    { label: "Cover", x: 330, y: 320 },
    { label: "Deep Cover", x: 210, y: 200 },
    { label: "Mid-off", x: 455, y: 240 },
    { label: "Mid-on", x: 540, y: 245 },
    { label: "Square Leg", x: 770, y: 470 },
    { label: "Fine Leg", x: 860, y: 650 },
    { label: "Third Man", x: 140, y: 760 },
  ],
  attacking: [
    { label: "WK", x: 500, y: 670 },
    { label: "Slip", x: 430, y: 690 },
    { label: "Leg Slip", x: 575, y: 690 },
    { label: "Point", x: 305, y: 420 },
    { label: "Cover", x: 375, y: 315 },
    { label: "Mid-off", x: 470, y: 245 },
    { label: "Mid-on", x: 530, y: 245 },
    { label: "Square Leg", x: 710, y: 475 },
    { label: "Fine Leg", x: 790, y: 620 },
    { label: "Third Man", x: 240, y: 700 },
    { label: "Gully", x: 350, y: 540 },
  ],
};

let markers = [];
let draggingId = null;

positions.forEach((position) => {
  const option = document.createElement("option");
  option.value = position;
  option.textContent = position;
  positionSelect.append(option);
});

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function clampToField(x, y) {
  const cx = 500;
  const cy = 500;
  const radius = 448;
  const dx = x - cx;
  const dy = y - cy;
  const distance = Math.hypot(dx, dy);

  if (distance <= radius) return { x, y };

  const ratio = radius / distance;
  return {
    x: cx + dx * ratio,
    y: cy + dy * ratio,
  };
}

function createMarker(label, x, y, id = uid()) {
  markers.push({ id, label, x, y });
  render();
}

function removeAllMarkers() {
  markers = [];
  render();
}

function getSvgPoint(event) {
  const point = field.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  const transformed = point.matrixTransform(field.getScreenCTM().inverse());
  return clampToField(transformed.x, transformed.y);
}

function markerTitle(label) {
  return label
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

function render() {
  markerLayer.innerHTML = "";

  for (const marker of markers) {
    const markerNode = markerTemplate.content.firstElementChild.cloneNode(true);
    markerNode.dataset.id = marker.id;
    markerNode.setAttribute("transform", `translate(${marker.x}, ${marker.y})`);
    markerNode.querySelector("text").textContent = markerTitle(marker.label);
    markerNode.querySelector("circle").setAttribute("aria-label", marker.label);
    markerLayer.append(markerNode);
  }
}

field.addEventListener("dblclick", (event) => {
  const { x, y } = getSvgPoint(event);
  createMarker(positionSelect.value, x, y);
});

field.addEventListener("pointerdown", (event) => {
  const marker = event.target.closest(".marker");
  if (!marker) return;

  draggingId = marker.dataset.id;
  marker.classList.add("dragging");
  marker.setPointerCapture(event.pointerId);
});

field.addEventListener("pointermove", (event) => {
  if (!draggingId) return;
  const current = markers.find((entry) => entry.id === draggingId);
  if (!current) return;

  const { x, y } = getSvgPoint(event);
  current.x = x;
  current.y = y;
  render();
});

field.addEventListener("pointerup", (event) => {
  const marker = event.target.closest(".marker");
  if (marker) marker.classList.remove("dragging");
  draggingId = null;
});

document.getElementById("add-at-cursor").addEventListener("click", () => {
  createMarker(positionSelect.value, 500, 500);
});

document.getElementById("clear-all").addEventListener("click", removeAllMarkers);

document.getElementById("download-json").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(markers, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "cricket-field.json";
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById("upload-json").addEventListener("change", async (event) => {
  const [file] = event.target.files;
  if (!file) return;

  const parsed = JSON.parse(await file.text());
  if (!Array.isArray(parsed)) return;

  markers = parsed
    .filter((entry) => entry && typeof entry.label === "string")
    .map((entry) => {
      const safePoint = clampToField(Number(entry.x) || 500, Number(entry.y) || 500);
      return {
        id: uid(),
        label: entry.label,
        x: safePoint.x,
        y: safePoint.y,
      };
    });

  render();
  event.target.value = "";
});

document.querySelectorAll("[data-preset]").forEach((button) => {
  button.addEventListener("click", () => {
    const preset = presets[button.dataset.preset];
    if (!preset) return;
    markers = preset.map((entry) => ({ ...entry, id: uid() }));
    render();
  });
});

createMarker("WK", 500, 675);
