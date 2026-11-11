/**
 * Visualizador Territorial 2D • Estética Collage Arquitectónico (Kennedy ABM)
 * Inspirado en planimetrías axonométricas y fotomontajes de arquitectura editorial.
 * Integra nodos E01-E20, siluetas de collage, pabellón central isométrico y flujos dinámicos reales.
 */

import { ESPACIOS } from '../core/spaces.js';
import { DATOS_MATRIZ } from '../data/matrix_data.js';

export class MapView {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // Bounding box geográfico de Kennedy
    this.bbox = {
      minLon: -74.178,
      maxLon: -74.132,
      minLat: 4.612,
      maxLat: 4.658
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

  geoToPixel(lat, lon) {
    const padX = this.width * 0.08;
    const padY = this.height * 0.08;
    const w = this.width - padX * 2;
    const h = this.height - padY * 2;

    const x = padX + ((lon - this.bbox.minLon) / (this.bbox.maxLon - this.bbox.minLon)) * w;
    const y = padY + ((this.bbox.maxLat - lat) / (this.bbox.maxLat - this.bbox.minLat)) * h;
    return { x, y };
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
        if (dist <= 22) {
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
    this.animTime += 0.025;
    const ctx = this.ctx;

    // 1. Fondo de papel arquitectónico blanco cálido
    ctx.fillStyle = '#faf9f5';
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Grilla milimétrica y retícula sutil de dibujo técnico
    this.renderTechnicalGrid(ctx);

    // 3. Huella y contornos de humedales (La Vaca, El Burro, Techo)
    this.renderHumedalesCad(ctx);

    // 4. Red de enlaces topológicos y flujos vivos de la simulación
    this.renderRedYFlujos(ctx, simSnapshot);

    // 5. Pabellón central isométrico (Bavaria Común E19 / Distrito E20)
    this.renderPabellonBavaria(ctx, simSnapshot);

    // 6. Nodos de la red con siluetas e iconografía de collage arquitectónico
    this.renderNodosCollage(ctx, simSnapshot);

    // 7. Notificaciones dinámicas sobre el plano (alertas de choque/estrés)
    this.renderIndicadoresTerritoriales(ctx, simSnapshot);

    // 8. Tooltip informativo arquitectónico
    if (this.hoveredSpace) {
      this.renderTooltip(ctx, this.hoveredSpace, simSnapshot);
    }
  }

  /**
   * Retícula técnica de fondo (papel de arquitectura milimetrado)
   */
  renderTechnicalGrid(ctx) {
    ctx.save();
    ctx.strokeStyle = 'rgba(210, 205, 195, 0.45)';
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

    // Cruces de registro técnico en esquinas
    ctx.strokeStyle = '#9ca3af';
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

    // Marca de agua cartográfica
    ctx.fillStyle = 'rgba(100, 116, 139, 0.35)';
    ctx.font = '9px monospace';
    ctx.fillText('LOCALIDAD DE KENNEDY • CONSTELACIÓN TERRITORIAL Y RED SOCIOECOLÓGICA • ESC 1:15,000', 30, this.height - 14);
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
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(h.rot);

      // Relleno sutil con achurado diagonal
      ctx.fillStyle = 'rgba(224, 242, 254, 0.55)';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 3]);

      ctx.beginPath();
      ctx.ellipse(0, 0, h.rx, h.ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Achurado de agua
      ctx.setLineDash([]);
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.25)';
      ctx.lineWidth = 0.8;
      for (let x = -h.rx + 10; x < h.rx; x += 12) {
        ctx.beginPath();
        ctx.moveTo(x, -h.ry * 0.6);
        ctx.lineTo(x + 10, h.ry * 0.6);
        ctx.stroke();
      }

      ctx.fillStyle = '#0369a1';
      ctx.font = 'bold 8.5px monospace';
      ctx.fillText(h.n, -h.rx + 10, 3);
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

    // Métricas dinámicas para modular los flujos
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

      // Determinar estilo de línea según tipo de flujo
      let strokeColor = '#94a3b8';
      let lineWidth = 1;
      let isDashed = false;
      let particleColor = '#475569';
      let speedFactor = 1.0;

      if (lk.prioridad_bavaria) {
        // Enlaces de extensión y saber agroecológico desde Bavaria E19
        strokeColor = '#b45309';
        lineWidth = 1.6;
        particleColor = '#d97706';
        speedFactor = 0.8;
      } else if (lk.flujo === 'EXCEDENTES') {
        // Alimentos frescos desde huertas a acopio o tiendas
        strokeColor = '#16a34a';
        lineWidth = Math.min(3.5, 1.2 + (ventasKg / 2500));
        particleColor = '#22c55e';
        speedFactor = 1.2;
      } else if (lk.flujo === 'ORGANICOS' || lk.flujo === 'COMPOST RETORNO') {
        // Residuos y retorno de compost
        strokeColor = '#854d0e';
        lineWidth = Math.min(3.0, 1.0 + (compostKg / 1200));
        particleColor = '#a16207';
        isDashed = true;
      } else if (lk.origen === 'E17' || lk.destino === 'E17') {
        // Flujo mayorista Corabastos
        if (estresActivo && desabastecimientoKg > 1000) {
          // Bloqueo o crisis en Corabastos: línea roja punteada
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

      // Dibujar línea base arquitectónica
      ctx.beginPath();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      if (isDashed) {
        ctx.setLineDash([4, 4]);
      } else {
        ctx.setLineDash([]);
      }
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      // Partículas animadas de flujo direccional
      ctx.setLineDash([]);
      const nParticles = lk.prioridad_bavaria ? 2 : 1;
      for (let i = 0; i < nParticles; i++) {
        const offset = (i / nParticles);
        const t = (this.animTime * speedFactor + (lk.dist_m % 100) * 0.02 + offset) % 1.0;
        const px = p1.x + (p2.x - p1.x) * t;
        const py = p1.y + (p2.y - p1.y) * t;

        ctx.fillStyle = particleColor;
        ctx.beginPath();
        ctx.arc(px, py, 2.8, 0, Math.PI * 2);
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
   * Siguiendo fielmente la composición del referente de la imagen de usuario
   */
  renderPabellonBavaria(ctx, snap) {
    const bav = ESPACIOS['E19'];
    if (!bav) return;
    const p = this.geoToPixel(bav.lat, bav.lon);

    ctx.save();
    ctx.translate(p.x, p.y);

    const activo = snap ? snap.sim1.participacion_local_pct > 5 : true;

    // Resplandor de conocimiento radiante
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

    // === DIBUJO AXONOMÉTRICO DE PABELLÓN ARQUITECTÓNICO ===
    // Fachada principal y volumetría en prisma isométrico
    const bw = 90;
    const bh = 42;
    const bx = -bw / 2;
    const by = -bh / 2;

    // Sombra proyectada en el suelo
    ctx.fillStyle = 'rgba(30, 41, 59, 0.14)';
    ctx.beginPath();
    ctx.moveTo(bx + 10, by + bh + 4);
    ctx.lineTo(bx + bw + 15, by + bh + 4);
    ctx.lineTo(bx + bw + 25, by + bh + 16);
    ctx.lineTo(bx + 20, by + bh + 16);
    ctx.closePath();
    ctx.fill();

    // Pared frontal (blanco técnico con borde nítido)
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.4;
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeRect(bx, by, bw, bh);

    // Cubierta / Azotea modular cuadriculada (como en el edificio del referente)
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
        // Módulos con lucernarios bioclimáticos
        ctx.strokeRect(cx + 2, cy + 2, cellW - 4, cellH - 4);
        if ((c + r) % 2 === 0) {
          ctx.fillStyle = 'rgba(203, 213, 225, 0.4)';
          ctx.fillRect(cx + 2, cy + 2, cellW - 4, cellH - 4);
        }
      }
    }

    // Puerta de acceso y muelle de carga
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(bx + bw * 0.4, by + bh - 10, bw * 0.2, 10);

    // Etiqueta tipográfica arquitectónica
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('BAVARIA COMÚN • NODO E19', bx, by - 8);

    ctx.restore();
  }

  /**
   * Nodos representados con siluetas e iconografía de collage arquitectónico
   */
  renderNodosCollage(ctx, snap) {
    for (const [id, esp] of Object.entries(ESPACIOS)) {
      if (id === 'E19') continue; // Ya dibujado como pabellón central

      const p = this.geoToPixel(esp.lat, esp.lon);
      const isHovered = this.hoveredSpace && this.hoveredSpace.id === id;

      ctx.save();
      ctx.translate(p.x, p.y);

      // Halo de selección
      if (isHovered) {
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Dibujar silueta específica de collage según la tipología del espacio
      this.drawCollageIcon(ctx, id, esp, isHovered, snap);

      // Etiqueta técnica minimalista del nodo
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 8.5px monospace';
      ctx.fillText(id, -8, 22);

      // Métrica viva bajo el nodo
      this.drawNodeMetric(ctx, id, snap);

      ctx.restore();
    }
  }

  /**
   * Dibuja siluetas gráficas en el estilo de collage editorial de la imagen del usuario
   */
  drawCollageIcon(ctx, id, esp, isHovered, snap) {
    ctx.save();
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.2;

    switch (id) {
      // E01: Huerta Asentamiento Informal -> Figura de agricultor popular agachado con planta
      case 'E01': {
        ctx.beginPath();
        // Cabeza y sombrero
        ctx.arc(0, -10, 3.5, 0, Math.PI * 2);
        ctx.fill();
        // Cuerpo agachado y azadón
        ctx.moveTo(0, -6);
        ctx.lineTo(-4, 2);
        ctx.lineTo(-8, 6);
        ctx.stroke();
        // Planta / brote verde
        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.arc(-8, 6, 3, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      // E02: Huerta Vivienda en Altura -> Fachada con balcones verdes y escaleras
      case 'E02': {
        ctx.strokeRect(-8, -14, 16, 22);
        ctx.fillStyle = '#15803d';
        ctx.fillRect(-6, -10, 12, 3);
        ctx.fillRect(-6, -2, 12, 3);
        ctx.fillRect(-6, 4, 12, 3);
        break;
      }

      // E03: Lote Baldío Recuperado -> Escalera de mano y huacales/cajas apiladas (como en el referente)
      case 'E03': {
        // Escalera vertical
        ctx.beginPath();
        ctx.moveTo(-6, -14);
        ctx.lineTo(-6, 8);
        ctx.moveTo(-2, -14);
        ctx.lineTo(-2, 8);
        for (let y = -12; y <= 6; y += 4) {
          ctx.moveTo(-6, y);
          ctx.lineTo(-2, y);
        }
        ctx.stroke();
        // Huacal de madera con hortalizas
        ctx.strokeRect(1, -4, 9, 12);
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(2, -7, 7, 3);
        break;
      }

      // E04: Borde de Humedal -> Juncos, vegetación palustre y ave
      case 'E04': {
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

      // E05: Huerta Existente -> Árbol frutal y bancal agrícola
      case 'E05': {
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(0, -6, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 1);
        ctx.lineTo(0, 8);
        ctx.stroke();
        break;
      }

      // E06: Centro de Acopio -> Balanza de reloj tradicional y carretilla (como en el referente)
      case 'E06': {
        // Balanza circular de pesaje
        ctx.beginPath();
        ctx.arc(-4, -6, 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.moveTo(-4, -6);
        ctx.lineTo(-2, -8);
        ctx.stroke();
        // Plato de la balanza
        ctx.beginPath();
        ctx.moveTo(-9, 4);
        ctx.lineTo(1, 4);
        ctx.stroke();
        // Carretilla
        ctx.strokeRect(3, 0, 7, 5);
        ctx.beginPath();
        ctx.arc(8, 7, 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      // E07: Tienda de Barrio -> Mostrador de tienda con canastilla
      case 'E07': {
        ctx.strokeRect(-8, -8, 16, 16);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-6, -4, 12, 6);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(-4, 4, 8, 3);
        break;
      }

      // E08: Feria Barrial -> Puesto con sombrilla / parasol de mercado (como en el referente)
      case 'E08': {
        // Sombrilla de mercado
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(0, -6, 9, Math.PI, 0);
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(0, 8);
        ctx.stroke();
        // Mesa del puesto
        ctx.strokeRect(-7, 2, 14, 5);
        break;
      }

      // E09: Comedor Comunitario -> Olla comunitaria y mesa
      case 'E09': {
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI);
        ctx.fill();
        ctx.fillRect(-7, -2, 14, 2);
        // Vapor ascendente
        ctx.strokeStyle = '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(-2, -5); ctx.lineTo(-2, -9);
        ctx.moveTo(2, -5); ctx.lineTo(2, -9);
        ctx.stroke();
        break;
      }

      // E10: Compostaje Carvajal -> Pila de compost y carretilla de volteo
      case 'E10': {
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.moveTo(-9, 7);
        ctx.lineTo(0, -5);
        ctx.lineTo(9, 7);
        ctx.closePath();
        ctx.fill();
        // Termómetro de control
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.lineTo(0, 2);
        ctx.stroke();
        break;
      }

      // E11: Gobernanza Heterárquica -> Silla de asamblea comunitaria (como en el referente)
      case 'E11': {
        ctx.lineWidth = 1.2;
        // Respaldo de la silla
        ctx.strokeRect(-5, -12, 10, 7);
        // Asiento
        ctx.fillRect(-6, -5, 12, 2);
        // Patas de la silla
        ctx.beginPath();
        ctx.moveTo(-5, -3); ctx.lineTo(-5, 8);
        ctx.moveTo(5, -3); ctx.lineTo(5, 8);
        ctx.stroke();
        break;
      }

      // E12: Módulo Fúngico -> Setas / Orellanas
      case 'E12': {
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

      // E13: Biofábrica / Lab -> Matraz de laboratorio
      case 'E13': {
        ctx.strokeStyle = '#0284c7';
        ctx.beginPath();
        ctx.moveTo(-2, -10); ctx.lineTo(2, -10);
        ctx.moveTo(0, -10); ctx.lineTo(0, -4);
        ctx.lineTo(-6, 6);
        ctx.lineTo(6, 6);
        ctx.lineTo(0, -4);
        ctx.stroke();
        break;
      }

      // E14: Empaque y Logística -> Bicicargo de reparto
      case 'E14': {
        ctx.strokeStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(-6, 4, 3, 0, Math.PI * 2);
        ctx.arc(6, 4, 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeRect(-3, -3, 6, 6);
        break;
      }

      // E15: Hogares / Consumidores -> Persona caminando con bolsa de mercado (como en el referente)
      case 'E15': {
        // Cabeza
        ctx.beginPath();
        ctx.arc(0, -10, 3, 0, Math.PI * 2);
        ctx.fill();
        // Tronco y piernas
        ctx.beginPath();
        ctx.moveTo(0, -7); ctx.lineTo(0, 2);
        ctx.lineTo(-3, 8);
        ctx.moveTo(0, 2); ctx.lineTo(3, 8);
        ctx.stroke();
        // Bolsa de mercado
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(3, -2, 4, 5);
        break;
      }

      // E17: Corabastos -> Portón monumental de carga mayorista
      case 'E17': {
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

  /**
   * Métrica viva renderizada dinámicamente bajo el nodo
   */
  drawNodeMetric(ctx, id, snap) {
    if (!snap) return;
    ctx.save();
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

  /**
   * Indicadores de alerta y estado sobre el lienzo
   */
  renderIndicadoresTerritoriales(ctx, snap) {
    if (!snap) return;
    ctx.save();

    // Banner de alerta si hay estrés activo
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

  /**
   * Tooltip técnico con datos geográficos y simulación
   */
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
