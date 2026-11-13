/**
 * Visualizador Territorial 2D • Estética Collage Arquitectónico (Kennedy ABM)
 * Con navegación interactiva fluida (Pan & Zoom centrado en cursor).
 * Integra nodos E01-E20, siluetas de collage, pabellón central isométrico y flujos dinámicos reales.
 */

import { ESPACIOS } from '../core/spaces.js';
import { DATOS_MATRIZ } from '../data/matrix_data.js';

export class MapView {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // Bounding box geográfico base de Kennedy
    this.bbox = {
      minLon: -74.178,
      maxLon: -74.132,
      minLat: 4.612,
      maxLat: 4.658
    };

    // Estado de Navegación (Pan & Zoom)
    this.view = {
      panX: 0,
      panY: 0,
      zoom: 1.0
    };

    this.hoveredSpace = null;
    this.animTime = 0;

    // Imagen base Sentinel-2 L2A (True Color, 2026-08-10)
    this.sentinelImg = null;
    this.sentinelLoaded = false;
    this._cargarSentinel();

    this.setupEvents();
    this.resize();
  }

  /** Carga asíncrona del basemap Sentinel-2 */
  _cargarSentinel() {
    const img = new Image();
    img.onload = () => {
      this.sentinelImg = img;
      this.sentinelLoaded = true;
    };
    img.onerror = () => {
      console.warn('[MapView] No se pudo cargar sentinel_kennedy.png — se usa fondo de papel.');
    };
    img.src = 'img/sentinel_kennedy.png';
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = this.canvas.width = rect.width;
    this.height = this.canvas.height = rect.height;
  }

  // Conversión geográfica base (sin pan ni zoom)
  baseGeoToPixel(lat, lon) {
    const padX = this.width * 0.08;
    const padY = this.height * 0.08;
    const w = this.width - padX * 2;
    const h = this.height - padY * 2;
    const x = padX + ((lon - this.bbox.minLon) / (this.bbox.maxLon - this.bbox.minLon)) * w;
    const y = padY + ((this.bbox.maxLat - lat) / (this.bbox.maxLat - this.bbox.minLat)) * h;
    return { x, y };
  }

  // Conversión geográfica interactiva a píxeles de pantalla (con pan & zoom)
  geoToPixel(lat, lon) {
    const base = this.baseGeoToPixel(lat, lon);
    return {
      x: base.x * this.view.zoom + this.view.panX,
      y: base.y * this.view.zoom + this.view.panY
    };
  }

  // Conversión inversa de píxeles de pantalla a coordenadas geográficas WGS84
  pixelToGeo(screenX, screenY) {
    const baseX = (screenX - this.view.panX) / this.view.zoom;
    const baseY = (screenY - this.view.panY) / this.view.zoom;
    const padX = this.width * 0.08;
    const padY = this.height * 0.08;
    const w = this.width - padX * 2;
    const h = this.height - padY * 2;
    const lon = this.bbox.minLon + ((baseX - padX) / w) * (this.bbox.maxLon - this.bbox.minLon);
    const lat = this.bbox.maxLat - ((baseY - padY) / h) * (this.bbox.maxLat - this.bbox.minLat);
    return { lat, lon };
  }

  /**
   * Configuración de interacciones de ratón y táctiles (Pan, Zoom, Hover)
   */
  setupEvents() {
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;

    this.canvas.style.cursor = 'grab';

    // Mouse Down (Iniciar arrastre)
    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        this.canvas.style.cursor = 'grabbing';
      }
    });

    // Mouse Move (Arrastrar mapa o detectar hover sobre nodos)
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (isDragging) {
        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;
        this.view.panX += dx;
        this.view.panY += dy;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        return;
      }

      // Detección de hover sobre espacios teniendo en cuenta la vista actual
      let found = null;
      for (const [id, esp] of Object.entries(ESPACIOS)) {
        const pt = this.geoToPixel(esp.lat, esp.lon);
        const dist = Math.hypot(mouseX - pt.x, mouseY - pt.y);
        if (dist <= 24) {
          found = esp;
          break;
        }
      }
      this.hoveredSpace = found;
      this.canvas.style.cursor = found ? 'pointer' : 'grab';
    });

    // Mouse Up / Window Leave (Finalizar arrastre)
    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        this.canvas.style.cursor = this.hoveredSpace ? 'pointer' : 'grab';
      }
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.hoveredSpace = null;
    });

    // Rueda del ratón: Zoom centrado exactamente en el cursor
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const factor = e.deltaY < 0 ? 1.15 : 0.87;
      this.zoomAtPoint(mouseX, mouseY, factor);
    }, { passive: false });

    // Doble clic para acercar hacia la posición del ratón
    this.canvas.addEventListener('dblclick', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.zoomAtPoint(e.clientX - rect.left, e.clientY - rect.top, 1.45);
    });

    // Soporte táctil (Pan y Pinch-to-zoom)
    let touchStartDist = 0;
    let touchStartCenter = null;

    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        dragStartX = e.touches[0].clientX;
        dragStartY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        isDragging = false;
        touchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        touchStartCenter = {
          x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          y: (e.touches[0].clientY + e.touches[1].clientY) / 2
        };
      }
    });

    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && isDragging) {
        const dx = e.touches[0].clientX - dragStartX;
        const dy = e.touches[0].clientY - dragStartY;
        this.view.panX += dx;
        this.view.panY += dy;
        dragStartX = e.touches[0].clientX;
        dragStartY = e.touches[0].clientY;
      } else if (e.touches.length === 2 && touchStartDist > 0) {
        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const factor = currentDist / touchStartDist;
        const rect = this.canvas.getBoundingClientRect();
        this.zoomAtPoint(touchStartCenter.x - rect.left, touchStartCenter.y - rect.top, factor);
        touchStartDist = currentDist;
      }
    });

    this.canvas.addEventListener('touchend', () => {
      isDragging = false;
      touchStartDist = 0;
    });
  }

  /**
   * Zoom matemático centrado en un punto de la pantalla
   */
  zoomAtPoint(screenX, screenY, factor) {
    const minZoom = 0.55;
    const maxZoom = 14.0;
    const newZoom = Math.min(maxZoom, Math.max(minZoom, this.view.zoom * factor));
    if (newZoom === this.view.zoom) return;

    this.view.panX = screenX - (screenX - this.view.panX) * (newZoom / this.view.zoom);
    this.view.panY = screenY - (screenY - this.view.panY) * (newZoom / this.view.zoom);
    this.view.zoom = newZoom;
    this.updateZoomBadge();
  }

  zoomIn() {
    this.zoomAtPoint(this.width / 2, this.height / 2, 1.30);
  }

  zoomOut() {
    this.zoomAtPoint(this.width / 2, this.height / 2, 0.77);
  }

  resetView() {
    this.view.panX = 0;
    this.view.panY = 0;
    this.view.zoom = 1.0;
    this.updateZoomBadge();
  }

  updateZoomBadge() {
    const el = document.getElementById('zoom-level-badge');
    if (el) el.textContent = `${Math.round(this.view.zoom * 100)}%`;
  }

  /**
   * Bucle principal de renderizado en Canvas (60 FPS, ultra-fluido)
   */
  render(simSnapshot = null) {
    if (!this.ctx) return;
    this.animTime += 0.025;
    const ctx = this.ctx;

    // 1. Fondo de papel arquitectónico blanco cálido (fallback si no carga Sentinel)
    ctx.fillStyle = '#faf9f5';
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Imagen base Sentinel-2 L2A georeferenciada (True Color Kennedy, 2026-08-10)
    this.renderSentinelBasemap(ctx);

    // 3. Grilla milimétrica sutil (sobre la imagen satelital)
    this.renderTechnicalGrid(ctx);

    // 4. Huella y contornos de humedales (La Vaca, El Burro, Techo)
    this.renderHumedalesCad(ctx);

    // 5. Red de enlaces topológicos y flujos vivos de la simulación
    this.renderRedYFlujos(ctx, simSnapshot);

    // 6. Pabellón central isométrico (Bavaria Común E19 / Distrito E20)
    this.renderPabellonBavaria(ctx, simSnapshot);

    // 7. Nodos de la red con siluetas e iconografía de collage arquitectónico
    this.renderNodosCollage(ctx, simSnapshot);

    // 8. Indicadores territoriales y alertas de estrés en curso
    this.renderIndicadoresTerritoriales(ctx, simSnapshot);

    // 9. Tooltip informativo arquitectónico al posar el cursor
    if (this.hoveredSpace) {
      this.renderTooltip(ctx, this.hoveredSpace, simSnapshot);
    }
  }

  /**
   * Renderiza la imagen base Sentinel-2 georeferenciada sobre el bbox de Kennedy.
   * Respeta pan & zoom porque usa geoToPixel() en las esquinas.
   */
  renderSentinelBasemap(ctx) {
    if (!this.sentinelLoaded || !this.sentinelImg) return;
    const tl = this.geoToPixel(this.bbox.maxLat, this.bbox.minLon); // esquina superior-izquierda
    const br = this.geoToPixel(this.bbox.minLat, this.bbox.maxLon); // esquina inferior-derecha
    const drawW = br.x - tl.x;
    const drawH = br.y - tl.y;
    if (drawW <= 0 || drawH <= 0) return;
    ctx.save();
    ctx.globalAlpha = 0.88; // leve transparencia para que el collage respire
    ctx.drawImage(this.sentinelImg, tl.x, tl.y, drawW, drawH);
    ctx.globalAlpha = 1.0;
    // Vignette muy suave en los bordes para integrar el paper background
    const grad = ctx.createRadialGradient(
      tl.x + drawW / 2, tl.y + drawH / 2, drawH * 0.28,
      tl.x + drawW / 2, tl.y + drawH / 2, drawH * 0.72
    );
    grad.addColorStop(0, 'rgba(250,249,245,0)');
    grad.addColorStop(1, 'rgba(250,249,245,0.55)');
    ctx.fillStyle = grad;
    ctx.fillRect(tl.x, tl.y, drawW, drawH);
    ctx.restore();
  }

  /**
   * Retícula técnica de fondo (papel de arquitectura milimetrado) — sutil sobre satélite
   */
  renderTechnicalGrid(ctx) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)'; // blanco tenue sobre satélite
    ctx.lineWidth = 0.5;

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

    // Cruces de registro técnico en esquinas de la ventana
    ctx.strokeStyle = 'rgba(200,200,200,0.7)';
    ctx.lineWidth = 1;
    const crosses = [
      { x: 30, y: 30 },
      { x: this.width - 30, y: 30 },
      { x: 30, y: this.height - 30 },
      { x: this.width - 30, y: this.height - 30 }
    ];
    for (const c of crosses) {
      ctx.beginPath();
      ctx.moveTo(c.x - 8, c.y);
      ctx.lineTo(c.x + 8, c.y);
      ctx.moveTo(c.x, c.y - 8);
      ctx.lineTo(c.x, c.y + 8);
      ctx.stroke();
    }

    // Marca cartográfica y escala
    ctx.fillStyle = 'rgba(100, 116, 139, 0.45)';
    ctx.font = '9px monospace';
    const scaleText = `LOCALIDAD DE KENNEDY • CONSTELACIÓN TERRITORIAL Y RED SOCIOECOLÓGICA • ZOOM: ${Math.round(this.view.zoom * 100)}%`;
    ctx.fillText(scaleText, 30, this.height - 14);
    ctx.restore();
  }

  /**
   * Humedales y zonas de amortiguación en estilo delineado técnico
   */
  renderHumedalesCad(ctx) {
    ctx.save();
    const humedales = [
      { n: 'HUMEDAL EL BURRO', lat: 4.6405, lon: -74.1500, rx: 65, ry: 26, rot: -0.25 },
      { n: 'HUMEDAL LA VACA', lat: 4.6273, lon: -74.1603, rx: 48, ry: 20, rot: 0.18 },
      { n: 'HUMEDAL DE TECHO', lat: 4.6465, lon: -74.1425, rx: 42, ry: 18, rot: 0.35 }
    ];

    for (const h of humedales) {
      const p = this.geoToPixel(h.lat, h.lon);
      const scaledRx = h.rx * this.view.zoom;
      const scaledRy = h.ry * this.view.zoom;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(h.rot);

      ctx.fillStyle = 'rgba(224, 242, 254, 0.50)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = Math.max(1.2, 2.0 * Math.min(1.5, this.view.zoom));
      ctx.setLineDash([4, 3]);

      ctx.beginPath();
      ctx.ellipse(0, 0, scaledRx, scaledRy, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.setLineDash([]);
      ctx.fillStyle = '#0369a1';
      ctx.shadowColor = 'rgba(255,255,255,0.9)';
      ctx.shadowBlur = 3;
      ctx.font = `bold ${Math.max(8, 8.5 * Math.min(1.4, this.view.zoom))}px monospace`;
      ctx.fillText(h.n, -scaledRx + 10, 3);
      ctx.shadowBlur = 0;
      ctx.restore();
    }
    ctx.restore();
  }

  /**
   * Enlaces y flujos de red: El grosor y velocidad representan los kg y saberes reales
   */
  renderRedYFlujos(ctx, snap) {
    ctx.save();
    const enlaces = DATOS_MATRIZ.enlaces_geo;

    const prodKg = snap ? snap.sim1.produccion_kg : 1500;
    const ventasKg = snap ? snap.sim1.ventas_locales_kg : 800;
    const comprasMayKg = snap ? snap.sim1.compras_mayorista_kg : 4500;
    const compostKg = snap ? snap.sim3.compost_maduro_kg : 600;
    const desabastecimientoKg = snap ? snap.sim1.desabastecimiento_kg : 0;
    const estresActivo = snap ? snap.estresActivo : false;

    for (const lk of enlaces) {
      const o = ESPACIOS[lk.origen];
      const d = ESPACIOS[lk.destino];
      if (!o || !d) continue;

      const p1 = this.geoToPixel(o.lat, o.lon);
      const p2 = this.geoToPixel(d.lat, d.lon);

      let strokeColor = '#94a3b8';
      let lineWidth = 1;
      let isDashed = false;
      let particleColor = '#475569';
      let speedFactor = 1.0;

      if (lk.prioridad_bavaria) {
        strokeColor = '#b45309';
        lineWidth = 1.6;
        particleColor = '#d97706';
        speedFactor = 0.8;
      } else if (lk.flujo === 'EXCEDENTES') {
        strokeColor = '#16a34a';
        lineWidth = Math.min(3.5, 1.2 + (ventasKg / 2500));
        particleColor = '#22c55e';
        speedFactor = 1.2;
      } else if (lk.flujo === 'ORGANICOS' || lk.flujo === 'COMPOST RETORNO') {
        strokeColor = '#854d0e';
        lineWidth = Math.min(3.0, 1.0 + (compostKg / 1200));
        particleColor = '#a16207';
        isDashed = true;
      } else if (lk.origen === 'E17' || lk.destino === 'E17') {
        if (estresActivo && desabastecimientoKg > 1000) {
          strokeColor = '#dc2626';
          lineWidth = 2.0;
          isDashed = true;
          particleColor = '#ef4444';
          speedFactor = 0.4;
        } else {
          strokeColor = '#475569';
          lineWidth = Math.min(3.5, 1.5 + (comprasMayKg / 5000));
          particleColor = '#1e293b';
        }
      }

      ctx.beginPath();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = Math.max(0.6, lineWidth * Math.min(1.6, this.view.zoom));
      if (isDashed) {
        ctx.setLineDash([4, 4]);
      } else {
        ctx.setLineDash([]);
      }
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      ctx.setLineDash([]);
      const nParticles = lk.prioridad_bavaria ? 2 : 1;
      for (let i = 0; i < nParticles; i++) {
        const offset = (i / nParticles);
        const t = (this.animTime * speedFactor + (lk.dist_m % 100) * 0.02 + offset) % 1.0;
        const px = p1.x + (p2.x - p1.x) * t;
        const py = p1.y + (p2.y - p1.y) * t;

        ctx.fillStyle = particleColor;
        ctx.beginPath();
        ctx.arc(px, py, Math.max(2, 2.8 * Math.min(1.4, this.view.zoom)), 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  /**
   * Renderiza el pabellón arquitectónico isométrico central en Bavaria Común (E19)
   */
  renderPabellonBavaria(ctx, snap) {
    const bav = ESPACIOS['E19'];
    if (!bav) return;
    const p = this.geoToPixel(bav.lat, bav.lon);

    ctx.save();
    ctx.translate(p.x, p.y);

    const scale = Math.min(2.0, Math.max(0.7, this.view.zoom));
    ctx.scale(scale, scale);

    const activo = snap ? snap.sim1.participacion_local_pct > 5 : true;

    if (activo) {
      const ringRadius = 45 + Math.sin(this.animTime * 2.5) * 6;
      ctx.strokeStyle = 'rgba(217, 119, 6, 0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    const bw = 90;
    const bh = 42;
    const bx = -bw / 2;
    const by = -bh / 2;

    // Sombra proyectada
    ctx.fillStyle = 'rgba(30, 41, 59, 0.14)';
    ctx.beginPath();
    ctx.moveTo(bx + 10, by + bh + 4);
    ctx.lineTo(bx + bw + 15, by + bh + 4);
    ctx.lineTo(bx + bw + 25, by + bh + 16);
    ctx.lineTo(bx + 20, by + bh + 16);
    ctx.closePath();
    ctx.fill();

    // Pared frontal
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.4;
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeRect(bx, by, bw, bh);

    // Azotea cuadriculada con lucernarios
    const cols = 5;
    const rows = 3;
    const cellW = bw / cols;
    const cellH = bh / rows;
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.65)';
    ctx.lineWidth = 0.8;

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const cx = bx + c * cellW;
        const cy = by + r * cellH;
        ctx.strokeRect(cx + 2, cy + 2, cellW - 4, cellH - 4);
        if ((c + r) % 2 === 0) {
          ctx.fillStyle = 'rgba(203, 213, 225, 0.4)';
          ctx.fillRect(cx + 2, cy + 2, cellW - 4, cellH - 4);
        }
      }
    }

    // Puerta y muelle
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(bx + bw * 0.4, by + bh - 10, bw * 0.2, 10);

    // Etiqueta tipográfica
    ctx.fillStyle = '#0f172a';
    ctx.shadowColor = 'rgba(255,255,255,0.9)';
    ctx.shadowBlur = 4;
    ctx.font = 'bold 9px monospace';
    ctx.fillText('BAVARIA COMÚN • NODO E19', bx, by - 8);
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  /**
   * Nodos con siluetas de collage arquitectónico
   */
  renderNodosCollage(ctx, snap) {
    for (const [id, esp] of Object.entries(ESPACIOS)) {
      if (id === 'E19') continue;

      const p = this.geoToPixel(esp.lat, esp.lon);
      const isHovered = this.hoveredSpace && this.hoveredSpace.id === id;

      ctx.save();
      ctx.translate(p.x, p.y);

      const nodeScale = Math.min(1.8, Math.max(0.75, this.view.zoom * 0.95));
      ctx.scale(nodeScale, nodeScale);

      if (isHovered) {
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.stroke();
      }

      this.drawCollageIcon(ctx, id, esp, isHovered, snap);

      // Etiqueta del nodo con sombra blanca para legibilidad sobre satélite
      ctx.shadowColor = 'rgba(255,255,255,0.95)';
      ctx.shadowBlur = 4;
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 8.5px monospace';
      ctx.fillText(id, -8, 22);
      ctx.shadowBlur = 0;

      this.drawNodeMetric(ctx, id, snap);

      ctx.restore();
    }
  }

  drawCollageIcon(ctx, id, esp, isHovered, snap) {
    ctx.save();
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.2;

    switch (id) {
      case 'E01': { // Huerta Asentamiento Informal: agricultor popular
        ctx.beginPath();
        ctx.arc(0, -10, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.moveTo(0, -6);
        ctx.lineTo(-4, 2);
        ctx.lineTo(-8, 6);
        ctx.stroke();
        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.arc(-8, 6, 3, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'E02': { // Huerta Vivienda Altura: balcones verdes
        ctx.strokeRect(-8, -14, 16, 22);
        ctx.fillStyle = '#15803d';
        ctx.fillRect(-6, -10, 12, 3);
        ctx.fillRect(-6, -2, 12, 3);
        ctx.fillRect(-6, 4, 12, 3);
        break;
      }
      case 'E03': { // Lote Baldío: escalera de mano y huacales
        ctx.beginPath();
        ctx.moveTo(-6, -14); ctx.lineTo(-6, 8);
        ctx.moveTo(-2, -14); ctx.lineTo(-2, 8);
        for (let y = -12; y <= 6; y += 4) {
          ctx.moveTo(-6, y); ctx.lineTo(-2, y);
        }
        ctx.stroke();
        ctx.strokeRect(1, -4, 9, 12);
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(2, -7, 7, 3);
        break;
      }
      case 'E04': { // Borde Humedal: juncos y brote
        ctx.strokeStyle = '#0284c7';
        ctx.beginPath();
        ctx.moveTo(-6, 8); ctx.lineTo(-4, -10);
        ctx.moveTo(-2, 8); ctx.lineTo(0, -14);
        ctx.moveTo(2, 8); ctx.lineTo(4, -8);
        ctx.stroke();
        ctx.fillStyle = '#059669';
        ctx.beginPath();
        ctx.arc(0, -12, 2.5, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'E05': { // Huerta Existente: árbol frutal
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(0, -6, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 1); ctx.lineTo(0, 8);
        ctx.stroke();
        break;
      }
      case 'E06': { // Acopio: balanza de pesaje y carretilla
        ctx.beginPath();
        ctx.arc(-4, -6, 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.moveTo(-4, -6); ctx.lineTo(-2, -8);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-9, 4); ctx.lineTo(1, 4);
        ctx.stroke();
        ctx.strokeRect(3, 0, 7, 5);
        ctx.beginPath();
        ctx.arc(8, 7, 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'E07': { // Tienda de Barrio: mostrador
        ctx.strokeRect(-8, -8, 16, 16);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-6, -4, 12, 6);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(-4, 4, 8, 3);
        break;
      }
      case 'E08': { // Feria Barrial: puesto con sombrilla
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(0, -6, 9, Math.PI, 0);
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.beginPath();
        ctx.moveTo(0, -6); ctx.lineTo(0, 8);
        ctx.stroke();
        ctx.strokeRect(-7, 2, 14, 5);
        break;
      }
      case 'E09': { // Comedor: olla comunitaria
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI);
        ctx.fill();
        ctx.fillRect(-7, -2, 14, 2);
        ctx.strokeStyle = '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(-2, -5); ctx.lineTo(-2, -9);
        ctx.moveTo(2, -5); ctx.lineTo(2, -9);
        ctx.stroke();
        break;
      }
      case 'E10': { // Compostaje Carvajal: pila
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.moveTo(-9, 7); ctx.lineTo(0, -5); ctx.lineTo(9, 7);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -8); ctx.lineTo(0, 2);
        ctx.stroke();
        break;
      }
      case 'E11': { // Gobernanza: silla comunitaria
        ctx.lineWidth = 1.2;
        ctx.strokeRect(-5, -12, 10, 7);
        ctx.fillRect(-6, -5, 12, 2);
        ctx.beginPath();
        ctx.moveTo(-5, -3); ctx.lineTo(-5, 8);
        ctx.moveTo(5, -3); ctx.lineTo(5, 8);
        ctx.stroke();
        break;
      }
      case 'E12': { // Módulo Fúngico: setas
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(-3, -4, 4, Math.PI, 0);
        ctx.arc(3, -6, 5, Math.PI, 0);
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.beginPath();
        ctx.moveTo(-3, -4); ctx.lineTo(-3, 6);
        ctx.moveTo(3, -6); ctx.lineTo(3, 6);
        ctx.stroke();
        break;
      }
      case 'E13': { // Biofábrica: matraz
        ctx.strokeStyle = '#0284c7';
        ctx.beginPath();
        ctx.moveTo(-2, -10); ctx.lineTo(2, -10);
        ctx.moveTo(0, -10); ctx.lineTo(0, -4);
        ctx.lineTo(-6, 6); ctx.lineTo(6, 6);
        ctx.lineTo(0, -4);
        ctx.stroke();
        break;
      }
      case 'E14': { // Logística: bicicargo
        ctx.strokeStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(-6, 4, 3, 0, Math.PI * 2);
        ctx.arc(6, 4, 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeRect(-3, -3, 6, 6);
        break;
      }
      case 'E15': { // Hogares: persona caminando con bolsa
        ctx.beginPath();
        ctx.arc(0, -10, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(0, -7); ctx.lineTo(0, 2);
        ctx.lineTo(-3, 8);
        ctx.moveTo(0, 2); ctx.lineTo(3, 8);
        ctx.stroke();
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(3, -2, 4, 5);
        break;
      }
      case 'E17': { // Corabastos: portón mayorista
        const estres = snap ? snap.estresActivo : false;
        ctx.strokeStyle = estres ? '#dc2626' : '#0f172a';
        ctx.lineWidth = 1.6;
        ctx.strokeRect(-12, -8, 24, 16);
        ctx.beginPath();
        ctx.moveTo(-12, -8); ctx.lineTo(0, -14); ctx.lineTo(12, -8);
        ctx.stroke();
        if (estres) {
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(-8, -4, 16, 8);
        }
        break;
      }
      default: {
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
    }
    ctx.restore();
  }

  drawNodeMetric(ctx, id, snap) {
    if (!snap) return;
    ctx.save();
    ctx.shadowColor = 'rgba(255,255,255,0.9)';
    ctx.shadowBlur = 3;
    ctx.font = '8px monospace';
    ctx.fillStyle = '#64748b';

    if (id === 'E01' || id === 'E02' || id === 'E03' || id === 'E04' || id === 'E05') {
      const cosechaKg = snap.sim1.produccion_kg;
      ctx.fillStyle = '#15803d';
      ctx.fillText(`${Math.round(cosechaKg / 5)} kg`, -12, 32);
    } else if (id === 'E06') {
      ctx.fillStyle = '#0284c7';
      ctx.fillText(`${snap.sim1.stock_acopio_kg} kg`, -12, 32);
    } else if (id === 'E07') {
      ctx.fillStyle = '#b45309';
      ctx.fillText(`${snap.sim1.participacion_local_pct}% loc`, -16, 32);
    } else if (id === 'E10') {
      ctx.fillStyle = '#78350f';
      ctx.fillText(`${snap.sim3.compost_maduro_kg} kg comp`, -18, 32);
    } else if (id === 'E17') {
      if (snap.estresActivo && snap.sim1.desabastecimiento_kg > 500) {
        ctx.fillStyle = '#dc2626';
        ctx.fillText(`! PARO/CHOQUE`, -24, 32);
      } else {
        ctx.fillText(`${snap.sim1.compras_mayorista_kg} kg`, -16, 32);
      }
    }
    ctx.restore();
  }

  renderIndicadoresTerritoriales(ctx, snap) {
    if (!snap) return;
    ctx.save();

    if (snap.estresActivo) {
      ctx.fillStyle = 'rgba(254, 242, 242, 0.95)';
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 1.2;
      ctx.fillRect(this.width / 2 - 170, 16, 340, 28);
      ctx.strokeRect(this.width / 2 - 170, 16, 340, 28);

      ctx.fillStyle = '#b91c1c';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('⚠ CONDICIÓN DE ESTRÉS EXÓGENO EN CURSO', this.width / 2 - 130, 33);
    }

    ctx.restore();
  }

  renderTooltip(ctx, esp, snap) {
    const p = this.geoToPixel(esp.lat, esp.lon);
    const boxW = 240;
    const boxH = 96;
    let bx = p.x + 18;
    let by = p.y - 48;
    if (bx + boxW > this.width) bx = p.x - boxW - 18;
    if (by + boxH > this.height) by = this.height - boxH - 10;
    if (by < 10) by = 10;

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.97)';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.roundRect(bx, by, boxW, boxH, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`${esp.id} • ${esp.nombre.slice(0, 24)}`, bx + 10, by + 18);

    ctx.fillStyle = '#475569';
    ctx.font = '9.5px sans-serif';
    ctx.fillText(`${esp.upz} • ${esp.barrio}`, bx + 10, by + 34);

    ctx.fillStyle = '#334155';
    ctx.font = '9.5px sans-serif';
    ctx.fillText(`Área típica: ${esp.area_tipica_m2} m² • ${esp.cota_msnm} msnm`, bx + 10, by + 50);

    ctx.fillStyle = '#059669';
    ctx.font = 'bold 9.5px monospace';
    ctx.fillText(`COORD: [${esp.lat.toFixed(4)}, ${esp.lon.toFixed(4)}]`, bx + 10, by + 68);

    if (snap) {
      ctx.fillStyle = '#0284c7';
      ctx.font = '9px monospace';
      ctx.fillText(`Semana ${snap.semana} • Red activa`, bx + 10, by + 84);
    }

    ctx.restore();
  }
}
