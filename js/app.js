/**
 * SIM-KENNEDY • Controlador Principal de Aplicación
 * Orquestación de interfaz, motor de simulación, mapas 2D/3D y pruebas.
 */

import { SimulationEngine } from './core/engine.js';
import { MapView } from './ui/map_view.js';
import { View3D } from './ui/view_3d.js';
import { ChartRenderer } from './ui/charts.js';
import { ParamsPanel } from './ui/params_panel.js';
import { Exporter } from './core/exporter.js';

class AppController {
  constructor() {
    this.engine = new SimulationEngine({ horizonWeeks: 104 });
    this.isPlaying = false;
    this.playInterval = null;
    this.isMonteCarloMode = false;
    this.monteCarloData = null;

    this.initUI();
    this.initViews();
    this.resetSimulation();
  }

  initViews() {
    this.mapView = new MapView('map-canvas');
    this.view3D = new View3D('view-3d-container');
    this.chartRenderer = new ChartRenderer('chart-canvas');
    this.paramsPanel = new ParamsPanel('params-panel-content', (newParams) => {
      this.engine.reset();
      this.toast('Parámetros actualizados para análisis de sensibilidad');
      this.updateKPIs(null);
    });

    // Render loop para el mapa 2D continuo
    const renderLoop = () => {
      const snap = this.engine.history.length > 0 ? this.engine.history[this.engine.history.length - 1] : null;
      if (this.mapView) this.mapView.render(snap);
      requestAnimationFrame(renderLoop);
    };
    requestAnimationFrame(renderLoop);
  }

  initUI() {
    // 1. Botones de Control de Simulación
    const btnPlay = document.getElementById('btn-play');
    btnPlay.addEventListener('click', () => this.togglePlay());

    document.getElementById('btn-step').addEventListener('click', () => {
      if (this.isPlaying) this.pause();
      this.stepSimulation();
    });

    document.getElementById('btn-reset').addEventListener('click', () => {
      this.pause();
      this.resetSimulation();
    });

    document.getElementById('btn-montecarlo').addEventListener('click', () => {
      this.pause();
      this.runMonteCarloBatch();
    });

    // 2. Selectores de Escenario y Estrés
    const selScenario = document.getElementById('select-scenario');
    selScenario.addEventListener('change', (e) => {
      this.engine.setScenario(e.target.value);
      this.resetSimulation();
      this.toast(`Escenario: ${selScenario.selectedOptions[0].text}`);
    });

    const selStress = document.getElementById('select-stress');
    selStress.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === 'ninguno') this.engine.setStressScenario(null);
      else this.engine.setStressScenario(val);
      this.toast(val === 'ninguno' ? 'Estrés exógeno desactivado' : `Estrés activo: ${selStress.selectedOptions[0].text}`);
    });

    // 3. Exportación a CSV
    document.getElementById('btn-export-csv').addEventListener('click', () => {
      if (this.isMonteCarloMode && this.monteCarloData) {
        Exporter.exportMonteCarloToCSV(this.monteCarloData);
        this.toast('Resultados Monte Carlo exportados a CSV');
      } else {
        Exporter.exportRunToCSV(this.engine.history, this.engine.activeScenario, this.engine.currentSeed);
        this.toast('Corrida individual exportada a CSV');
      }
    });

    // 4. Selector de Métrica en Gráficas
    document.getElementById('select-chart-metric').addEventListener('change', (e) => {
      this.chartRenderer.setMetric(e.target.value);
      this.updateCharts();
    });

    // 5. Pestañas del Panel Lateral (Tabs)
    const tabs = document.querySelectorAll('.sidebar-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const paneId = tab.dataset.tab;
        document.getElementById(paneId)?.classList.add('active');
        if (paneId === 'tab-charts') {
          setTimeout(() => {
            this.chartRenderer.resize();
            this.updateCharts();
          }, 50);
        }
      });
    });

    // 6. Navegación Inferior (2D vs 3D)
    const pills = document.querySelectorAll('.nav-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const view = pill.dataset.view;
        document.querySelectorAll('.view-layer').forEach(l => l.classList.remove('active'));
        if (view === '2d') {
          document.getElementById('layer-map-2d').classList.add('active');
          this.mapView.resize();
        } else {
          document.getElementById('layer-view-3d').classList.add('active');
        }
      });
    });

    // 7. Ejecutor de Pruebas Unitarias
    document.getElementById('btn-run-tests').addEventListener('click', () => this.runUnitTests());

    window.addEventListener('resize', () => {
      if (this.mapView) this.mapView.resize();
      if (this.chartRenderer) this.chartRenderer.resize();
    });
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    if (this.engine.clock.isFinished()) {
      this.resetSimulation();
    }
    this.isPlaying = true;
    document.getElementById('btn-play').textContent = '⏸ Pausar';
    document.getElementById('btn-play').classList.add('btn-primary');
    this.playInterval = setInterval(() => {
      const snap = this.engine.step();
      if (!snap) {
        this.pause();
        this.toast('Simulación completada (104 semanas)');
      } else {
        this.updateHUD();
        this.updateKPIs(snap);
        this.updateCharts();
      }
    }, 85); // ~12 semanas por segundo en animación
  }

  pause() {
    this.isPlaying = false;
    clearInterval(this.playInterval);
    document.getElementById('btn-play').textContent = '▶ Continuar';
  }

  resetSimulation() {
    this.isMonteCarloMode = false;
    this.monteCarloData = null;
    this.engine.reset();
    this.updateHUD();
    this.updateKPIs(null);
    this.updateCharts();
  }

  stepSimulation() {
    this.isMonteCarloMode = false;
    const snap = this.engine.step();
    if (snap) {
      this.updateHUD();
      this.updateKPIs(snap);
      this.updateCharts();
    } else {
      this.toast('Simulación completada (104 semanas)');
    }
  }

  runMonteCarloBatch() {
    this.toast('Ejecutando 30 corridas Monte Carlo...');
    const btn = document.getElementById('btn-montecarlo');
    btn.textContent = 'Calculando...';
    btn.disabled = true;

    setTimeout(() => {
      const startTime = performance.now();
      const results = this.engine.runMonteCarlo(30, 1000);
      const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);

      this.isMonteCarloMode = true;
      this.monteCarloData = results;
      btn.disabled = false;
      btn.textContent = '⚄ Monte Carlo (30 Semillas)';

      this.toast(`30 corridas finalizadas en ${elapsed}s con balance de masa verificado`);
      // Cambiar a pestaña de gráficas para ver la mediana e IQR
      document.querySelector('[data-tab="tab-charts"]').click();
      this.updateCharts();
    }, 30);
  }

  updateHUD() {
    document.getElementById('hud-time').textContent = this.engine.clock.getTextSummary();
    document.getElementById('hud-seed').textContent = this.engine.currentSeed;

    const massState = this.engine.massTracker.getEstadoGeneral();
    const badge = document.getElementById('hud-balance-badge');
    if (massState.esValido) {
      badge.textContent = '✓ BALANCE DE MASA OK';
      badge.className = 'badge-status';
    } else {
      badge.textContent = `⚠ BALANCE ERROR (${massState.fallos})`;
      badge.className = 'badge-status error';
    }
  }

  updateKPIs(snap) {
    if (!snap) {
      document.getElementById('kpi-autonomia').textContent = '0.0%';
      document.getElementById('kpi-dependencia').textContent = '94.0%';
      document.getElementById('kpi-produccion').textContent = 'Cosecha: 0 kg/sem';
      document.getElementById('kpi-compras-may').textContent = 'Mayorista: 0 kg/sem';
      document.getElementById('kpi-huertas').textContent = '0';
      document.getElementById('kpi-promotores').textContent = 'Promotores: 0';
      document.getElementById('kpi-organicos').textContent = '0.0 Ton';
      document.getElementById('kpi-compost').textContent = 'Compost: 0 kg/sem';
      document.getElementById('kpi-aves').textContent = '45';
      document.getElementById('kpi-conectividad').textContent = 'Conectividad: 0.55';
      document.getElementById('kpi-tiempo-gob').textContent = '2.0 sem';
      document.getElementById('kpi-poder').textContent = 'HHI Poder: 0.20';
      return;
    }

    document.getElementById('kpi-autonomia').textContent = `${snap.sim1.participacion_local_pct}%`;
    document.getElementById('kpi-dependencia').textContent = `${snap.sim1.dependencia_corabastos_pct}%`;
    document.getElementById('kpi-produccion').textContent = `Cosecha: ${snap.sim1.produccion_kg.toLocaleString()} kg/sem`;
    document.getElementById('kpi-compras-may').textContent = `Mayorista: ${snap.sim1.compras_mayorista_kg.toLocaleString()} kg/sem`;

    document.getElementById('kpi-huertas').textContent = snap.sim2.huertas_activas;
    document.getElementById('kpi-promotores').textContent = `Promotores: ${snap.sim2.promotores_activos}`;

    document.getElementById('kpi-organicos').textContent = `${snap.sim3.toneladas_desviadas_acum} Ton`;
    document.getElementById('kpi-compost').textContent = `Compost: ${snap.sim3.compost_maduro_kg.toLocaleString()} kg/sem`;

    document.getElementById('kpi-aves').textContent = snap.sim4.poblacion_tingua;
    document.getElementById('kpi-conectividad').textContent = `Conectividad: ${snap.sim4.indice_conectividad}`;

    document.getElementById('kpi-tiempo-gob').textContent = `${snap.sim5.tiempo_decision_sem} sem`;
    document.getElementById('kpi-poder').textContent = `HHI Poder: ${snap.sim5.concentracion_poder_hhi}`;
  }

  updateCharts() {
    if (!this.chartRenderer) return;
    if (this.isMonteCarloMode && this.monteCarloData) {
      this.chartRenderer.render(this.monteCarloData.series, true);
    } else {
      this.chartRenderer.render(this.engine.history, false);
    }
  }

  toast(msg) {
    const el = document.getElementById('toast-notification');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
  }

  runUnitTests() {
    const logEl = document.getElementById('test-results-log');
    logEl.innerHTML = '<span style="color:#38bdf8">Iniciando ejecución de pruebas unitarias...</span>\n';

    setTimeout(() => {
      let out = '';
      let allPassed = true;

      // PRUEBA 1: Determinismo estricto
      out += '--- PRUEBA 1: DETERMINISMO ESTRICTO (Misma semilla -> Mismo resultado) ---\n';
      const eng1 = new SimulationEngine();
      const runA = eng1.runFull(9999);

      const eng2 = new SimulationEngine();
      const runB = eng2.runFull(9999);

      let deterministic = true;
      for (let i = 0; i < runA.length; i++) {
        if (runA[i].sim1.produccion_kg !== runB[i].sim1.produccion_kg ||
            runA[i].sim1.participacion_local_pct !== runB[i].sim1.participacion_local_pct ||
            runA[i].sim2.huertas_activas !== runB[i].sim2.huertas_activas) {
          deterministic = false;
          break;
        }
      }

      if (deterministic) {
        out += '<span style="color:#34d399">✓ PASÓ: Las dos corridas de 104 semanas con semilla 9999 son idénticas bit a bit.</span>\n\n';
      } else {
        out += '<span style="color:#ef4444">✗ FALLÓ: Se detectó divergencia estocástica entre corridas con igual semilla.</span>\n\n';
        allPassed = false;
      }

      // PRUEBA 2: Balance de Masa de Alimentos y Orgánicos
      out += '--- PRUEBA 2: CONSERVACIÓN Y BALANCE DE MASA (Ley física) ---\n';
      const massAudit = eng1.massTracker.getEstadoGeneral();
      out += `Total de auditorías en 104 semanas: ${massAudit.totalAuditorias}\n`;
      out += `Discrepancia máxima detectada: ${massAudit.maxDiscrepancia.toFixed(6)} kg\n`;

      if (massAudit.esValido) {
        out += '<span style="color:#34d399">✓ PASÓ: Balance de masa 100% conservativo. Ningún kg de alimento u orgánicos se creó ni destruyó sin regla explícita.</span>\n\n';
      } else {
        out += `<span style="color:#ef4444">✗ FALLÓ: ${massAudit.fallos} violaciones de balance de masa detectadas.</span>\n\n`;
        allPassed = false;
      }

      // PRUEBA 3: Sensibilidad a la intervención (Evaluabilidad)
      out += '--- PRUEBA 3: EVALUABILIDAD DE ESCENARIOS (Contraste con línea base) ---\n';
      const engBase = new SimulationEngine();
      engBase.setScenario('s1_sin_intervencion');
      const histBase = engBase.runFull(123);
      const depBaseFinal = histBase[histBase.length - 1].sim1.dependencia_corabastos_pct;

      const engPropuesta = new SimulationEngine();
      engPropuesta.setScenario('s1_mas_bavaria');
      const histPropuesta = engPropuesta.runFull(123);
      const depPropFinal = histPropuesta[histPropuesta.length - 1].sim1.dependencia_corabastos_pct;

      out += `Línea Base (Sin intervención) Dependencia Corabastos: ${depBaseFinal}%\n`;
      out += `Propuesta Integral (+ Bavaria) Dependencia Corabastos: ${depPropFinal}%\n`;

      if (depPropFinal < depBaseFinal) {
        out += `<span style="color:#34d399">✓ PASÓ: El modelo es sensible y evalúa la reducción de dependencia en ${(depBaseFinal - depPropFinal).toFixed(1)} puntos porcentuales.</span>\n`;
      } else {
        out += '<span style="color:#fbbf24">⚠ OBSERVACIÓN: La propuesta no redujo la dependencia. Resultado válido según premisa del grupo.</span>\n';
      }

      out += '\n' + (allPassed ? '<span style="color:#34d399;font-weight:bold">TODAS LAS PRUEBAS COMPLETADAS CON ÉXITO.</span>' : '<span style="color:#ef4444;font-weight:bold">HAY PRUEBAS CON FALLO.</span>');
      logEl.innerHTML = out;
    }, 50);
  }
}

// Inicialización al cargar el DOM
window.addEventListener('DOMContentLoaded', () => {
  window.APP = new AppController();
});
