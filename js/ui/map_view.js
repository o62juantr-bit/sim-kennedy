/**
 * Visualizador Territorial 2D
 * Renderiza los 20 espacios de Kennedy (E01–E20), sus radios de capacidad y los flujos activos.
 */

import { ESPACIOS } from '../core/spaces.js';
import { DATOS_MATRIZ } from '../data/matrix_data.js';

export class MapView {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // Bounding box geográfico de Kennedy (con margen)
    this.bbox = {
      minLon: -74.175,
      maxLon: -74.135,
      minLat: 4.615,
      maxLat: 4.655
    };

    this.hoveredSpace = null;
    this.animTime = 0;
    this.setupEvents();
    this.resize();
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = this.canvas.width = rect.width;
    this.height = this.canvas.height = rect.height;
  }

  // Conversión geográfica WGS84 -> Coordenadas de Canvas (X, Y)
  geoToPixel(lat, lon) {
    const x = ((lon - this.bbox.minLon) / (this.bbox.maxLon - this.bbox.minLon)) * this.width;
    // En canvas Y crece hacia abajo, latitud crece hacia el norte
    const y = ((this.bbox.maxLat - lat) / (this.bbox.maxLat - this.bbox.minLat)) * this.height;
    return { x, y };
  }

  pixelToGeo(px, py) {
    const lon = this.bbox.minLon + (px / this.width) * (this.bbox.maxLon - this.bbox.minLon);
    const lat = this.bbox.maxLat - (py / this.height) * (this.bbox.maxLat - this.bbox.minLat);
    return { lat, lon };
  }

  setupEvents() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      let found = null;
      for (const [id, esp] of Object.entries(ESPACIOS)) {
        const pt = this.geoToPixel(esp.lat, esp.lon);
        const dist = Math.hypot(mouseX - pt.x, mouseY - pt.y);
        if (dist <= 16) {
          found = esp;
          break;
        }
      }
      this.hoveredSpace = found;
      this.canvas.style.cursor = found ? 'pointer' : 'default';
    });
  }

  render(simSnapshot = null) {
    if (!this.ctx) return;
    this.animTime += 0.03;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Fondo de cuadrícula urbana sutil
    this.renderGrid(ctx);

    // 2. Límites y polígonos de humedales (El Burro, Techo, La Vaca)
    this.renderHumedales(ctx);

    // 3. Enlaces geográficos y flujos de red (ENLACES_GEO)
    this.renderEnlaces(ctx, simSnapshot);

    // 4. Nodos espaciales (E01 a E20)
    this.renderNodos(ctx, simSnapshot);

    // 5. Tooltip flotante si hay hover
    if (this.hoveredSpace) {
      this.renderTooltip(ctx, this.hoveredSpace, simSnapshot);
    }
  }

  renderGrid(ctx) {
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.lineWidth = 1;
    const step = 40;
    for (let x = 0; x < this.width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }
  }

  renderHumedales(ctx) {
    // Esbozo cartográfico de los tres humedales principales
    const humedales = [
      { n: 'El Burro', lat: 4.6405, lon: -74.1500, rx: 55, ry: 24, rot: -0.3 },
      { n: 'La Vaca', lat: 4.6273, lon: -74.1603, rx: 40, ry: 18, rot: 0.2 },
      { n: 'Techo', lat: 4.6465, lon: -74.1425, rx: 35, ry: 15, rot: 0.4 }
    ];

    ctx.fillStyle = 'rgba(14, 165, 233, 0.15)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.40)';
    ctx.lineWidth = 1.5;

    for (const h of humedales) {
      const p = this.geoToPixel(h.lat, h.lon);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(h.rot);
      ctx.beginPath();
      ctx.ellipse(0, 0, h.rx, h.ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(125, 211, 252, 0.55)';
      ctx.font = '10px sans-serif';
      ctx.fillText(h.n, -18, 4);
      ctx.restore();
    }
  }

  renderEnlaces(ctx, snap) {
    const enlaces = DATOS_MATRIZ.enlaces_geo;
    for (const lk of enlaces) {
      const o = ESPACIOS[lk.origen];
      const d = ESPACIOS[lk.destino];
      if (!o || !d) continue;

      const p1 = this.geoToPixel(o.lat, o.lon);
      const p2 = this.geoToPixel(d.lat, d.lon);

      // Color según flujo
      let col = 'rgba(148, 163, 184, 0.20)';
      if (lk.prioridad_bavaria) col = 'rgba(234, 179, 8, 0.35)'; // Enlaces amarillos Bavaria
      else if (lk.flujo === 'EXCEDENTES') col = 'rgba(34, 197, 94, 0.30)'; // Verde alimentos
      else if (lk.flujo === 'ORGANICOS' || lk.flujo === 'COMPOST RETORNO') col = 'rgba(180, 83, 9, 0.30)'; // Marrón compost
      else if (lk.origen === 'E17') col = 'rgba(239, 68, 68, 0.25)'; // Rojo Corabastos

      ctx.strokeStyle = col;
      ctx.lineWidth = lk.prioridad_bavaria ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      // Partícula en movimiento que ilustra el flujo
      const t = (this.animTime + (lk.dist_m % 10) * 0.1) % 1.0;
      const px = p1.x + (p2.x - p1.x) * t;
      const py = p1.y + (p2.y - p1.y) * t;

      ctx.fillStyle = lk.prioridad_bavaria ? '#facc15' : (lk.flujo === 'EXCEDENTES' ? '#4ade80' : '#38bdf8');
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  renderNodos(ctx, snap) {
    for (const [id, esp] of Object.entries(ESPACIOS)) {
      const p = this.geoToPixel(esp.lat, esp.lon);
      const isHovered = this.hoveredSpace && this.hoveredSpace.id === id;

      // Tamaño de nodo proporcional a importancia
      let radius = 6;
      if (id === 'E19' || id === 'E17') radius = 10;
      else if (id === 'E06' || id === 'E10' || id === 'E12') radius = 8;
      if (isHovered) radius += 4;

      // Halo pulsante
      ctx.fillStyle = esp.color + '33';
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius + 4 + Math.sin(this.animTime * 3) * 2, 0, Math.PI * 2);
      ctx.fill();

      // Nodo central
      ctx.fillStyle = esp.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Etiqueta de código
      ctx.fillStyle = '#f1f5f9';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(id, p.x + radius + 3, p.y + 3);
    }
  }

  renderTooltip(ctx, esp, snap) {
    const p = this.geoToPixel(esp.lat, esp.lon);
    const boxW = 220;
    const boxH = 90;
    let bx = p.x + 15;
    let by = p.y - 45;
    if (bx + boxW > this.width) bx = p.x - boxW - 15;
    if (by + boxH > this.height) by = this.height - boxH - 10;
    if (by < 10) by = 10;

    ctx.fillStyle = 'rgba(10, 18, 30, 0.94)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(bx, by, boxW, boxH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(`${esp.id} • ${esp.nombre.slice(0, 26)}`, bx + 10, by + 18);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.fillText(`${esp.upz} • ${esp.barrio}`, bx + 10, by + 34);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '10px sans-serif';
    ctx.fillText(`Área típica: ${esp.area_tipica_m2} m² • Cota: ${esp.cota_msnm} msnm`, bx + 10, by + 50);

    ctx.fillStyle = '#4ade80';
    ctx.font = '9.5px monospace';
    ctx.fillText(`Lat: ${esp.lat.toFixed(4)}, Lon: ${esp.lon.toFixed(4)}`, bx + 10, by + 68);
  }
}
