/**
 * Visualizador de Gráficas y Analítica Territorial
 * Implementación en Canvas HTML5 pura (sin dependencias externas).
 * Grafica series de tiempo de corridas individuales y bandas de dispersión Monte Carlo (Mediana + IQR).
 */

export class ChartRenderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.activeMetric = 'participacion_local_pct';
    this.setupResize();
  }

  setupResize() {
    const ro = new ResizeObserver(() => this.resize());
    if (this.canvas.parentElement) ro.observe(this.canvas.parentElement);
    this.resize();
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = this.canvas.width = rect.width;
    this.height = this.canvas.height = rect.height;
  }

  setMetric(metricKey) {
    this.activeMetric = metricKey;
  }

  /**
   * Renderiza el gráfico
   * Soporta tanto corridas individuales (historial) como corridas Monte Carlo (series agregadas con IQR)
   */
  render(data, isMonteCarlo = false) {
    if (!this.ctx || !data || data.length === 0) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    const pad = { top: 28, right: 35, bottom: 32, left: 55 };
    const chartW = this.width - pad.left - pad.right;
    const chartH = this.height - pad.top - pad.bottom;

    if (chartW <= 0 || chartH <= 0) return;

    // 1. Extraer serie de datos según métrica seleccionada
    const points = [];
    let yMin = Infinity;
    let yMax = -Infinity;

    if (isMonteCarlo) {
      // data son series con variables[metricKey] = { media, mediana, q1, q3, iqr, min, max }
      for (const p of data) {
        const v = p.variables[this.activeMetric];
        if (v) {
          points.push({ semana: p.semana, med: v.mediana, q1: v.q1, q3: v.q3, min: v.min, max: v.max });
          yMin = Math.min(yMin, v.min, v.q1);
          yMax = Math.max(yMax, v.max, v.q3);
        }
      }
    } else {
      // corrida individual (history)
      for (const snap of data) {
        let val = 0;
        if (snap.sim1 && snap.sim1[this.activeMetric] !== undefined) val = snap.sim1[this.activeMetric];
        else if (snap.sim2 && snap.sim2[this.activeMetric] !== undefined) val = snap.sim2[this.activeMetric];
        else if (snap.sim3 && snap.sim3[this.activeMetric] !== undefined) val = snap.sim3[this.activeMetric];
        else if (snap.sim4 && snap.sim4[this.activeMetric] !== undefined) val = snap.sim4[this.activeMetric];
        else if (snap.sim5 && snap.sim5[this.activeMetric] !== undefined) val = snap.sim5[this.activeMetric];
        else if (snap.sim6 && snap.sim6[this.activeMetric] !== undefined) val = snap.sim6[this.activeMetric];

        points.push({ semana: snap.semana, med: val });
        yMin = Math.min(yMin, val);
        yMax = Math.max(yMax, val);
      }
    }

    if (points.length === 0) return;

    // Normalizar escalas
    if (yMin === Infinity) yMin = 0;
    if (yMax === -Infinity || yMax === yMin) yMax = yMin + 1;
    // Margen superior e inferior
    const ySpan = yMax - yMin;
    yMin = Math.max(0, yMin - ySpan * 0.08);
    yMax = yMax + ySpan * 0.08;

    const xToPx = (sem) => pad.left + ((sem - 1) / Math.max(1, points.length - 1)) * chartW;
    const yToPx = (val) => pad.top + (1 - (val - yMin) / (yMax - yMin)) * chartH;

    // 2. Grilla y ejes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';

    // 5 líneas horizontales
    for (let i = 0; i <= 4; i++) {
      const frac = i / 4;
      const val = yMin + (yMax - yMin) * (1 - frac);
      const y = pad.top + frac * chartH;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + chartW, y);
      ctx.stroke();
      ctx.fillText(this.formatVal(val), pad.left - 8, y + 3);
    }

    // Eje X (semanas)
    ctx.textAlign = 'center';
    const xTicks = [1, 26, 52, 78, 104];
    for (const sem of xTicks) {
      if (sem <= points.length) {
        const x = xToPx(sem);
        ctx.beginPath();
        ctx.moveTo(x, pad.top + chartH);
        ctx.lineTo(x, pad.top + chartH + 5);
        ctx.stroke();
        ctx.fillText(`S${sem}`, x, pad.top + chartH + 16);
      }
    }

    // 3. Si es Monte Carlo: Dibujar Banda de Dispersión IQR (Q1 a Q3)
    if (isMonteCarlo) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';
      ctx.beginPath();
      // Borde superior (Q3)
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const x = xToPx(p.semana);
        const y = yToPx(p.q3);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      // Borde inferior (Q1) en reversa
      for (let i = points.length - 1; i >= 0; i--) {
        const p = points[i];
        const x = xToPx(p.semana);
        const y = yToPx(p.q1);
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    }

    // 4. Dibujar Línea de Mediana / Valor
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const x = xToPx(p.semana);
      const y = yToPx(p.med);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // 5. Título y Leyenda
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'left';
    const titulo = this.getMetricLabel(this.activeMetric);
    ctx.fillText(titulo, pad.left, pad.top - 10);

    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    if (isMonteCarlo) {
      ctx.fillStyle = '#7dd3fc';
      ctx.fillText('— Mediana  ░░ Rango IQR (Q1-Q3)', pad.left + chartW, pad.top - 10);
    } else {
      ctx.fillStyle = '#34d399';
      ctx.fillText('Corrida Individual (Semilla activa)', pad.left + chartW, pad.top - 10);
    }
  }

  formatVal(val) {
    if (Math.abs(val) >= 1000000) return (val / 1000000).toFixed(1) + 'M';
    if (Math.abs(val) >= 1000) return (val / 1000).toFixed(0) + 'k';
    return val.toFixed(1);
  }

  getMetricLabel(key) {
    const labels = {
      participacion_local_pct: 'Participación Volumen Local (%)',
      dependencia_corabastos_pct: 'Dependencia de Corabastos (%)',
      produccion_kg: 'Cosecha Total Huertas (kg/semana)',
      desabastecimiento_kg: 'Alimentos Desatendidos (kg/semana)',
      huertas_activas: 'Número de Huertas Activas',
      stock_conocimiento: 'Índice de Conocimiento Compartido (0-1)',
      toneladas_desviadas_acum: 'Bio-residuos Desviados Acumulados (Ton)',
      compost_retornado_kg: 'Compost Maduro Retornado a Huertas (kg/sem)',
      indice_conectividad: 'Índice de Conectividad de Paisaje (0-1)',
      poblacion_tingua: 'Población Tingua Bogotana (individuos)',
      mortalidad_trampas_acum: 'Bajas por Trampas Ecológicas (acum)',
      tiempo_decision_sem: 'Tiempo Medio de Decisión (semanas)',
      concentracion_poder_hhi: 'Concentración de Poder (Índice HHI)',
      permanencia_residentes_pct: 'Tasa de Permanencia de Residentes (%)',
      precio_suelo_m2: 'Precio Promedio del Suelo (COP/m²)'
    };
    return labels[key] || key;
  }
}
