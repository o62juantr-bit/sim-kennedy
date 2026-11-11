/**
 * SIM-KENNEDY • Visualizador Territorial 2D
 * Estética de Plano y Collage Arquitectónico (Inspirado en fotomontaje/cartografía conceptual)
 * Renderiza los 20 espacios de Kennedy, el bloque central de Bavaria Común,
 * pictogramas arquitectónicos en nodos y flujos simulados físicamente fieles (no aleatorios).
 */

import { ESPACIOS } from '../core/spaces.js';
import { DATOS_MATRIZ } from '../data/matrix_data.js';

export class MapView {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // Bounding box geográfico de Kennedy con margen equilibrado
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
    const y = ((this.bbox.maxLat - lat) / (this.bbox.maxLat - this.bbox.minLat)) * this.height;
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

    window.addEventListener('resize', () => this.resize());
  }

  render(simSnapshot = null) {
    if (!this.ctx) return;
    this.animTime += 0.025;
    const ctx = this.ctx;

    // 1. Fondo de papel arquitectónico / cartografía artística clara
    this.renderArchitecturalPaper(ctx);

    // 2. Elementos geográficos de base (humedales y rondas de agua)
    this.renderHumedales(ctx);

    // 3. Complejo arquitectónico central de Bavaria Común (E19/E20/E12/E13)
    this.renderBavariaCentralIsometric(ctx, simSnapshot);

    // 4. Enlaces de red y flujos físicos simulados (derivados de los kg reales)
    this.renderEnlacesYFlujos(ctx, simSnapshot);

    // 5. Nodos territoriales (E01–E20) con siluetas/pictogramas arquitectónicos
    this.renderNodosArquitectonicos(ctx, simSnapshot);

    // 6. Rótulos arquitectónicos de plano y advertencias de estrés activo
    this.renderCartelaArquitectonica(ctx, simSnapshot);

    // 7. Tooltip técnico detallado si el cursor está sobre un nodo
    if (this.hoveredSpace) {
      this.renderTooltip(ctx, this.hoveredSpace, simSnapshot);
    }
  }

  /**
   * Fondo estilo plano arquitectónico: papel mate marfil, cuadrícula milimétrica sutil y cruces técnicas
   */
  renderArchitecturalPaper(ctx) {
    // Fondo base marfil / papel de dibujo
    ctx.fillStyle = '#f6f5ef';
    ctx.fillRect(0, 0, this.width, this.height);

    // Trama de retícula técnica
    ctx.strokeStyle = 'rgba(28, 38, 50, 0.04)';
    ctx.lineWidth = 1;
    const gridStep = 45;

    for (let x = 0; x < this.width; x += gridStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.height; y += gridStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }

    // Cruces de registro topográfico en intersecciones
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.15)';
    ctx.lineWidth = 1;
    for (let x = gridStep * 2; x < this.width; x += gridStep * 3) {
      for (let y = gridStep * 2; y < this.height; y += gridStep * 3) {
        ctx.beginPath();
        ctx.moveTo(x - 4, y);
        ctx.lineTo(x + 4, y);
        ctx.moveTo(x, y - 4);
        ctx.lineTo(x, y + 4);
        ctx.stroke();
      }
    }

    // Delimitación de UPZ sutil en tipografía técnica
    ctx.fillStyle = 'rgba(71, 85, 105, 0.35)';
    ctx.font = '8.5px monospace';
    const upzLabels = [
      { text: 'UPZ 80 CORABASTOS / EL AMPARO', x: this.width * 0.15, y: this.height * 0.45 },
      { text: 'UPZ 47 KENNEDY CENTRAL', x: this.width * 0.50, y: this.height * 0.60 },
      { text: 'UPZ 44 LAS AMÉRICAS (CLÚSTER BAVARIA)', x: this.width * 0.62, y: this.height * 0.25 },
      { text: 'UPZ 82 TINTAL NORTE (LA VACA)', x: this.width * 0.28, y: this.height * 0.80 },
      { text: 'UPZ 45 CARVAJAL', x: this.width * 0.72, y: this.height * 0.75 }
    ];
    for (const upz of upzLabels) {
      ctx.fillText(upz.text, upz.x, upz.y);
    }
  }

  /**
   * Humedales y cuerpos de agua con textura cartográfica
   */
  renderHumedales(ctx) {
    const humedales = [
      { n: 'HUMEDAL EL BURRO', lat: 4.6405, lon: -74.1500, rx: 65, ry: 26, rot: -0.28 },
      { n: 'HUMEDAL LA VACA', lat: 4.6273, lon: -74.1603, rx: 48, ry: 20, rot: 0.22 },
      { n: 'HUMEDAL DE TECHO', lat: 4.6465, lon: -74.1425, rx: 42, ry: 16, rot: 0.38 }
    ];

    for (const h of humedales) {
      const p = this.geoToPixel(h.lat, h.lon);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(h.rot);

      // Mancha de agua / acuarela tenue
      ctx.fillStyle = 'rgba(215, 232, 242, 0.65)';
      ctx.strokeStyle = 'rgba(100, 149, 180, 0.50)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 3]);

      ctx.beginPath();
      ctx.ellipse(0, 0, h.rx, h.ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Borde de juncales / franja agroecológica
      ctx.strokeStyle = 'rgba(74, 124, 89, 0.35)';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.stroke();

      ctx.fillStyle = '#476579';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(h.n, -h.rx * 0.65, 3);
      ctx.restore();
    }
  }

  /**
   * NODO CENTRAL: BAVARIA COMÚN (E19/E20/E12/E13)
   * Renderizado como volumen isométrico arquitectónico detallado en collage monocromo
   */
  renderBavariaCentralIsometric(ctx, snap) {
    const e19 = ESPACIOS['E19'];
    if (!e19) return;
    const center = this.geoToPixel(e19.lat, e19.lon);

    ctx.save();
    ctx.translate(center.x, center.y);

    // Halo de radiación de conocimiento agroecológico (pulso radial hacia la red)
    const bavariaActivo = snap ? snap.sim1.participacion_local_pct > 0 || snap.sim2.stock_conocimiento > 0.4 : true;
    if (bavariaActivo) {
      const pulse = (this.animTime * 0.8) % 1.0;
      ctx.strokeStyle = `rgba(180, 83, 9, ${0.4 * (1 - pulse)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 45 + pulse * 60, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Sombra proyectada del complejo arquitectónico
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.beginPath();
    ctx.ellipse(8, 22, 60, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // DIBUJO ISOMÉTRICO DEL PABELLÓN BAVARIA COMÚN
    // Bloque 1: Nave principal (fábrica/hangar de formación)
    ctx.fillStyle = '#e2e0d8';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.4;

    // Fachada frontal
    ctx.beginPath();
    ctx.moveTo(-35, 10);
    ctx.lineTo(5, 25);
    ctx.lineTo(5, -5);
    ctx.lineTo(-35, -20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Ventanales tipo fábrica / taller
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 4; i++) {
      const vx = -30 + i * 8;
      const vy = 5 + i * 3;
      ctx.strokeRect(vx, vy - 15, 5, 8);
    }

    // Fachada lateral derecha
    ctx.fillStyle = '#cac6b8';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(5, 25);
    ctx.lineTo(45, 10);
    ctx.lineTo(45, -20);
    ctx.lineTo(5, -5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Muelle de carga / portón
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(15, 17);
    ctx.lineTo(35, 9);
    ctx.lineTo(35, -2);
    ctx.lineTo(15, 6);
    ctx.closePath();
    ctx.fill();

    // Techo shed / dientes de sierra industrial
    ctx.fillStyle = '#f8f8f5';
    ctx.beginPath();
    ctx.moveTo(-35, -20);
    ctx.lineTo(5, -5);
    ctx.lineTo(45, -20);
    ctx.lineTo(5, -35);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Módulos solares y lucernarios en el techo
    ctx.fillStyle = '#334155';
    for (let k = 0; k < 3; k++) {
      const tx = -20 + k * 16;
      const ty = -18 + k * 4;
      ctx.fillRect(tx, ty, 8, 4);
    }

    // Bloque 2: Invernadero y Biofábrica / Módulo Fúngico (E12/E13) anexo
    ctx.fillStyle = 'rgba(210, 235, 220, 0.85)';
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-50, 0);
    ctx.lineTo(-35, 8);
    ctx.lineTo(-35, -12);
    ctx.lineTo(-50, -20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Rótulo identificativo de arquitectura
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 9.5px monospace';
    ctx.fillText('[NODO CENTRAL: BAVARIA COMÚN]', -60, -42);
    ctx.fillStyle = '#b45309';
    ctx.font = '8px monospace';
    ctx.fillText('E19 INSTITUTO • E12 BIOFÁBRICA • E14 LOGÍSTICA', -70, -32);

    ctx.restore();
  }

  /**
   * Enlaces de la red y partículas de flujo basadas estrictamente en los valores simulados
   */
  renderEnlacesYFlujos(ctx, snap) {
    const enlaces = DATOS_MATRIZ.enlaces_geo;

    // Métricas clave de la semana actual para calibrar flujos
    const prodKg = snap ? snap.sim1.produccion_kg : 2500;
    const ventasLocKg = snap ? snap.sim1.ventas_locales_kg : 1800;
    const desvioOrgKg = snap ? snap.sim3.desviado_compost_kg : 400;
    const compostRetKg = snap ? snap.sim3.compost_maduro_kg : 180;
    const choqueCorabastos = snap ? (snap.sim1.estres_activo && snap.sim1.tipo_estres === 'choque_corabastos') : false;
    const sequia = snap ? (snap.sim1.estres_activo && snap.sim1.tipo_estres === 'sequia') : false;

    for (const lk of enlaces) {
      const o = ESPACIOS[lk.origen];
      const d = ESPACIOS[lk.destino];
      if (!o || !d) continue;

      const p1 = this.geoToPixel(o.lat, o.lon);
      const p2 = this.geoToPixel(d.lat, d.lon);

      // Determinación del tipo de flujo y su estilo gráfico
      let strokeStyle = 'rgba(30, 41, 59, 0.22)';
      let lineWidth = 1;
      let dashPattern = [];
      let particleColor = '#1e293b';
      let particleRate = 0.5; // Densidad / velocidad del flujo

      if (lk.flujo === 'EXCEDENTES') {
        // Alimentos frescos de huertas hacia acopio E06
        strokeStyle = 'rgba(21, 128, 61, 0.40)';
        lineWidth = 1.8;
        particleColor = '#15803d'; // Verde cosecha
        particleRate = Math.min(2.5, Math.max(0.3, prodKg / 2000));
        if (sequia) {
          strokeStyle = 'rgba(180, 83, 9, 0.35)'; // Tono seco
          dashPattern = [4, 4];
          particleRate *= 0.4; // Flujo mermado
        }
      } else if (lk.origen === 'E06' && (lk.destino === 'E07' || lk.destino === 'E09')) {
        // Alimentos distribuidos a tiendas y comedores
        strokeStyle = 'rgba(15, 118, 110, 0.45)';
        lineWidth = 2.0;
        particleColor = '#0f766e'; // Esmeralda / distribución
        particleRate = Math.min(2.5, Math.max(0.3, ventasLocKg / 1500));
      } else if (lk.origen === 'E17') {
        // Flujo mayorista desde Corabastos
        if (choqueCorabastos) {
          strokeStyle = 'rgba(220, 38, 38, 0.70)'; // Alerta roja choque
          lineWidth = 2.2;
          dashPattern = [6, 4];
          particleColor = '#dc2626';
          particleRate = 0.3; // Suministro trabado
        } else {
          strokeStyle = 'rgba(100, 116, 139, 0.35)';
          lineWidth = 1.4;
          particleColor = '#475569';
          particleRate = 1.0;
        }
      } else if (lk.flujo === 'ORGANICOS') {
        // Bio-residuos hacia compost E10 y hongos E12
        strokeStyle = 'rgba(180, 83, 9, 0.35)';
        lineWidth = 1.4;
        dashPattern = [5, 3];
        particleColor = '#b45309'; // Marrón orgánicos
        particleRate = Math.min(2.0, Math.max(0.2, desvioOrgKg / 300));
      } else if (lk.flujo === 'COMPOST RETORNO') {
        // Retorno de compost maduro a las huertas
        strokeStyle = 'rgba(67, 56, 202, 0.35)';
        lineWidth = 1.6;
        particleColor = '#4338ca';
        particleRate = Math.min(2.0, Math.max(0.2, compostRetKg / 150));
      } else if (lk.prioridad_bavaria) {
        // Enlace de conocimiento desde Bavaria
        strokeStyle = 'rgba(202, 138, 4, 0.45)';
        lineWidth = 1.6;
        particleColor = '#ca8a04';
        particleRate = 1.2;
      }

      // Dibujo de la línea técnica de conexión
      ctx.save();
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = lineWidth;
      ctx.setLineDash(dashPattern);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.restore();

      // PARTÍCULA FÍSICA SIMULADA (Refleja el movimiento del flujo)
      const t = (this.animTime * particleRate + (lk.dist_m % 17) * 0.1) % 1.0;
      const px = p1.x + (p2.x - p1.x) * t;
      const py = p1.y + (p2.y - p1.y) * t;

      // Forma tipo caja/huacal o paquete de intercambio
      ctx.save();
      ctx.translate(px, py);
      ctx.fillStyle = particleColor;
      ctx.fillRect(-2.5, -2.5, 5, 5);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 0.6;
      ctx.strokeRect(-2.5, -2.5, 5, 5);
      ctx.restore();
    }
  }

  /**
   * Nodos espaciales (E01 a E20) con pictogramas/siluetas arquitectónicas
   */
  renderNodosArquitectonicos(ctx, snap) {
    for (const [id, esp] of Object.entries(ESPACIOS)) {
      // E19 y E20 ya están ilustrados en el complejo isométrico central
      if (id === 'E19' || id === 'E20') continue;

      const p = this.geoToPixel(esp.lat, esp.lon);
      const isHovered = this.hoveredSpace && this.hoveredSpace.id === id;

      ctx.save();
      ctx.translate(p.x, p.y);

      // Dibuja la silueta arquitectónica específica del nodo
      this.drawNodeSilhouette(ctx, id, esp, snap, isHovered);

      // Etiqueta tipográfica arquitectónica
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(`[${id}]`, 12, -4);

      // Micro-badge de estado dinámico simulado
      this.drawNodeDynamicBadge(ctx, id, snap);

      ctx.restore();
    }
  }

  /**
   * Siluetas/pictogramas vectoriales monocromos inspirados en el collage del usuario
   * (carretilla, personas cargando canastas, básculas, sombrillas de feria, bicicargos, etc.)
   */
  drawNodeSilhouette(ctx, id, esp, snap, isHovered) {
    const scale = isHovered ? 1.25 : 1.0;
    ctx.scale(scale, scale);

    // Fondo circular de apoyo
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#1e293b';

    switch (id) {
      // E06: Carretilla de mano (hand truck / carretilla de acopio - presente en la imagen del referente)
      case 'E06':
        ctx.lineWidth = 1.2;
        // Mango y estructura
        ctx.beginPath();
        ctx.moveTo(-4, -8);
        ctx.lineTo(-4, 6);
        ctx.lineTo(4, 6);
        ctx.stroke();
        // Rueda
        ctx.beginPath();
        ctx.arc(-4, 7, 2, 0, Math.PI * 2);
        ctx.fill();
        // Cajas apiladas
        ctx.fillRect(-2, -3, 6, 7);
        break;

      // E07: Báscula / Balanza de tienda tradicional (como la balanza circular del referente)
      case 'E07':
        ctx.lineWidth = 1.0;
        // Base y vástago
        ctx.fillRect(-1, -2, 2, 8);
        ctx.fillRect(-5, 6, 10, 2);
        // Plato / esfera de reloj de pesaje
        ctx.beginPath();
        ctx.arc(0, -4, 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -4);
        ctx.lineTo(2, -5);
        ctx.stroke();
        break;

      // E08: Sombrilla de feria / puesto callejero (como el parasol del referente)
      case 'E08':
        ctx.lineWidth = 1.0;
        // Poste
        ctx.beginPath();
        ctx.moveTo(0, -1);
        ctx.lineTo(0, 8);
        ctx.stroke();
        // Cúpula sombrilla
        ctx.beginPath();
        ctx.arc(0, -1, 7, Math.PI, 0);
        ctx.fill();
        break;

      // E01, E05: Persona caminando con canasta / huacal de cosecha (como la figura humana del referente)
      case 'E01':
      case 'E05':
        // Cabeza
        ctx.beginPath();
        ctx.arc(0, -6, 2.2, 0, Math.PI * 2);
        ctx.fill();
        // Cuerpo y piernas
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, -4);
        ctx.lineTo(0, 2);
        ctx.lineTo(-3, 8);
        ctx.moveTo(0, 2);
        ctx.lineTo(3, 8);
        ctx.stroke();
        // Canasta cargada
        ctx.fillRect(2, -2, 4, 4);
        break;

      // E02: Vivienda en altura (fachada arquitectónica vertical con balcones verdes)
      case 'E02':
        ctx.strokeRect(-5, -8, 10, 16);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-3, -6, 2, 2);
        ctx.fillRect(1, -6, 2, 2);
        ctx.fillRect(-3, -1, 2, 2);
        ctx.fillRect(1, -1, 2, 2);
        ctx.fillStyle = '#15803d'; // Balcón verde
        ctx.fillRect(-4, 3, 8, 2);
        break;

      // E03, E04: Bancales de cultivo / huerta comunitaria de suelo
      case 'E03':
      case 'E04':
        ctx.lineWidth = 1.1;
        // Surcos de cultivo
        ctx.strokeRect(-6, -5, 12, 10);
        ctx.beginPath();
        ctx.moveTo(-6, -1); ctx.lineTo(6, -1);
        ctx.moveTo(-6, 2); ctx.lineTo(6, 2);
        ctx.stroke();
        // Brote vegetal
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(0, -5, 2, 0, Math.PI * 2);
        ctx.fill();
        break;

      // E10: Pila de compostaje comunitario / contenedor biológico
      case 'E10':
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.moveTo(-7, 6);
        ctx.lineTo(7, 6);
        ctx.lineTo(4, -3);
        ctx.lineTo(-4, -3);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#1e293b';
        ctx.stroke();
        break;

      // E11: Asamblea / Silla de diálogo heterárquico (como la silla del referente)
      case 'E11':
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-4, -7); ctx.lineTo(-4, 7); // Respaldo
        ctx.moveTo(-4, 0); ctx.lineTo(4, 0);   // Asiento
        ctx.moveTo(4, 0); ctx.lineTo(4, 7);    // Pata
        ctx.stroke();
        break;

      // E12: Módulo Fúngico (setas / hongos orellanas)
      case 'E12':
        // Tallo
        ctx.fillRect(-1.5, 0, 3, 7);
        // Sombrerillo de seta
        ctx.beginPath();
        ctx.arc(0, 0, 6, Math.PI, 0);
        ctx.fill();
        break;

      // E14: Bicicleta de carga / bicicargo (como la bicicleta del referente)
      case 'E14':
        ctx.lineWidth = 1.1;
        // Ruedas
        ctx.beginPath();
        ctx.arc(-5, 4, 3, 0, Math.PI * 2);
        ctx.arc(5, 4, 3, 0, Math.PI * 2);
        ctx.stroke();
        // Cuadro y caja
        ctx.beginPath();
        ctx.moveTo(-5, 4); ctx.lineTo(0, 0); ctx.lineTo(5, 4);
        ctx.stroke();
        ctx.fillRect(-1, -4, 5, 4);
        break;

      // E09: Comedor Comunitario (olla popular de alimento)
      case 'E09':
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.arc(0, 2, 5, 0, Math.PI);
        ctx.fill();
        ctx.fillRect(-6, 0, 12, 2);
        // Vapor ascendente
        ctx.beginPath();
        ctx.moveTo(-2, -4); ctx.lineTo(-1, -1);
        ctx.moveTo(2, -4); ctx.lineTo(1, -1);
        ctx.stroke();
        break;

      // E17: Corabastos (Camión de carga pesada)
      case 'E17':
        ctx.fillRect(-7, -4, 8, 8); // Cabina
        ctx.strokeRect(1, -6, 7, 10); // Tolva
        ctx.beginPath();
        ctx.arc(-4, 5, 2, 0, Math.PI * 2);
        ctx.arc(5, 5, 2, 0, Math.PI * 2);
        ctx.fill();
        break;

      // E18: Parque Timiza (Arbolado / área verde)
      case 'E18':
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(0, -2, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-1, 2, 2, 5);
        break;

      default:
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
  }

  /**
   * Etiquetas dinámicas en tiempo real con datos simulados sobre cada nodo
   */
  drawNodeDynamicBadge(ctx, id, snap) {
    if (!snap) return;

    ctx.font = '8px monospace';
    let label = '';
    let col = '#475569';

    if (id === 'E01' || id === 'E02' || id === 'E03' || id === 'E04' || id === 'E05') {
      // Muestra cosecha real estimada de esa huerta
      const nHuertas = snap.sim2.huertas_activas || 50;
      const kgAprox = Math.round(snap.sim1.produccion_kg / Math.max(1, nHuertas));
      label = `${kgAprox} kg/sem`;
      col = snap.sim1.estres_activo && snap.sim1.tipo_estres === 'sequia' ? '#b45309' : '#15803d';
    } else if (id === 'E06') {
      label = `Stock: ${snap.sim1.stock_acopio_kg} kg`;
      col = '#0f766e';
    } else if (id === 'E07') {
      if (snap.sim1.desabastecimiento_kg > 0) {
        label = `Déficit: -${snap.sim1.desabastecimiento_kg}kg`;
        col = '#dc2626';
      } else {
        label = `100% abastecido`;
        col = '#15803d';
      }
    } else if (id === 'E10') {
      label = `${snap.sim3.compost_maduro_kg} kg comp`;
      col = '#78350f';
    } else if (id === 'E17') {
      if (snap.sim1.estres_activo && snap.sim1.tipo_estres === 'choque_corabastos') {
        label = `🚨 CHOQUE: $${snap.sim1.precio_mayorista_actual}`;
        col = '#dc2626';
      } else {
        label = `$${snap.sim1.precio_mayorista_actual}/kg`;
        col = '#64748b';
      }
    }

    if (label) {
      ctx.fillStyle = col;
      ctx.fillText(label, 12, 6);
    }
  }

  /**
   * Cartela técnica de arquitectura y alertas de estrés en el plano
   */
  renderCartelaArquitectonica(ctx, snap) {
    // 1. Cartela de Plano en la esquina superior izquierda
    ctx.save();
    ctx.translate(14, 14);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.90)';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.2;
    ctx.fillRect(0, 0, 275, 48);
    ctx.strokeRect(0, 0, 275, 48);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 9.5px monospace';
    ctx.fillText('PLANO DE RED TERRITORIAL • KENNEDY', 8, 14);

    ctx.fillStyle = '#475569';
    ctx.font = '8px monospace';
    ctx.fillText('SOBERANÍA ALIMENTARIA, COMPOSTAJE Y GOBERNANZA', 8, 26);

    const sem = snap ? snap.semana : 0;
    ctx.fillStyle = '#b45309';
    ctx.font = 'bold 8.5px monospace';
    ctx.fillText(`TIEMPO SIMULADO: SEMANA ${sem} / 104 • ESCALA 1:15.000`, 8, 38);
    ctx.restore();

    // 2. Banner de Estrés Exógeno Activo (si aplica en la simulación)
    if (snap && snap.sim1.estres_activo) {
      ctx.save();
      const bannerW = 340;
      const bx = this.width / 2 - bannerW / 2;
      const by = 14;

      ctx.fillStyle = '#fee2e2';
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 1.5;
      ctx.fillRect(bx, by, bannerW, 30);
      ctx.strokeRect(bx, by, bannerW, 30);

      ctx.fillStyle = '#991b1b';
      ctx.font = 'bold 9px monospace';
      let msg = 'ALERTA DE ESTRÉS ACTIVO';
      if (snap.sim1.tipo_estres === 'choque_corabastos') {
        msg = '🚨 CHOQUE EN CORABASTOS: PRECIO MAYORISTA +65% / DISP -55%';
      } else if (snap.sim1.tipo_estres === 'sequia') {
        msg = '⚠️ SEQUÍA PROLONGADA (EL NIÑO): DÉFICIT DE LLUVIA -70%';
      } else if (snap.sim1.tipo_estres === 'crecimiento_poblacional') {
        msg = '📈 PRESIÓN DEMOGRÁFICA: DEMANDA BARRIAL +35%';
      }
      ctx.fillText(msg, bx + 10, by + 19);
      ctx.restore();
    }
  }

  /**
   * Tooltip técnico con datos completos al pasar el cursor sobre un espacio
   */
  renderTooltip(ctx, esp, snap) {
    const p = this.geoToPixel(esp.lat, esp.lon);
    const boxW = 240;
    const boxH = 95;
    let bx = p.x + 15;
    let by = p.y - 45;
    if (bx + boxW > this.width) bx = p.x - boxW - 15;
    if (by + boxH > this.height) by = this.height - boxH - 10;
    if (by < 10) by = 10;

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.4;
    ctx.fillRect(bx, by, boxW, boxH);
    ctx.strokeRect(bx, by, boxW, boxH);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`${esp.id} • ${esp.nombre}`, bx + 10, by + 16);

    ctx.fillStyle = '#475569';
    ctx.font = '8.5px monospace';
    ctx.fillText(`UPZ: ${esp.upz} • ${esp.barrio}`, bx + 10, by + 30);
    ctx.fillText(`Área típica: ${esp.area_tipica_m2} m² • Cota: ${esp.cota_msnm} msnm`, bx + 10, by + 44);

    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.beginPath();
    ctx.moveTo(bx + 10, by + 50);
    ctx.lineTo(bx + boxW - 10, by + 50);
    ctx.stroke();

    ctx.fillStyle = '#15803d';
    ctx.font = 'bold 8.5px monospace';
    if (snap) {
      if (esp.id.startsWith('E01') || esp.id.startsWith('E02') || esp.id.startsWith('E03') || esp.id.startsWith('E04') || esp.id.startsWith('E05')) {
        ctx.fillText(`Cosecha Total Red: ${snap.sim1.produccion_kg.toLocaleString()} kg/sem`, bx + 10, by + 64);
        ctx.fillText(`Autoconsumo: ${snap.sim1.autoconsumo_kg.toLocaleString()} kg/sem`, bx + 10, by + 76);
      } else if (esp.id === 'E06') {
        ctx.fillText(`Stock Acopio: ${snap.sim1.stock_acopio_kg} kg / Capacidad: 4,000 kg`, bx + 10, by + 64);
        ctx.fillText(`Ventas Red Local: ${snap.sim1.ventas_locales_kg.toLocaleString()} kg/sem`, bx + 10, by + 76);
      } else if (esp.id === 'E10') {
        ctx.fillText(`Compost Maduro: ${snap.sim3.compost_maduro_kg} kg/sem`, bx + 10, by + 64);
        ctx.fillText(`Bio-residuos Desviados: ${snap.sim3.toneladas_desviadas_acum} Ton`, bx + 10, by + 76);
      } else {
        ctx.fillText(`Participación Local: ${snap.sim1.participacion_local_pct}%`, bx + 10, by + 64);
        ctx.fillText(`Dependencia Corabastos: ${snap.sim1.dependencia_corabastos_pct}%`, bx + 10, by + 76);
      }
    } else {
      ctx.fillText(`Coordenadas: Lat ${esp.lat.toFixed(4)}, Lon ${esp.lon.toFixed(4)}`, bx + 10, by + 64);
    }

    ctx.restore();
  }
}
