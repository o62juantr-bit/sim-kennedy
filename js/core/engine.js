/**
 * Motor Central de Simulación (Simulation Engine)
 * Coordina el reloj, PRNG determinista, balance de masa y los 6 módulos.
 * Ejecuta análisis Monte Carlo (30 semillas) calculando media, mediana y rango intercuartílico (IQR).
 */

import { SimClock } from './clock.js';
import { RNG } from './rng.js';
import { MassBalanceTracker } from './mass_balance.js';
import { Sim1Abastecimiento } from '../modules/sim1_abastecimiento.js';
import { Sim2Conocimiento } from '../modules/sim2_conocimiento.js';
import { Sim3Organicos } from '../modules/sim3_organicos.js';
import { Sim4Habitat } from '../modules/sim4_habitat.js';
import { Sim5Gobernanza } from '../modules/sim5_gobernanza.js';
import { Sim6Suelo } from '../modules/sim6_suelo.js';
import { ESCENARIOS } from '../data/scenarios.js';

export class SimulationEngine {
  constructor(config = {}) {
    this.horizonWeeks = config.horizonWeeks || 104;
    this.clock = new SimClock(this.horizonWeeks);
    this.massTracker = new MassBalanceTracker();

    // Instanciación de módulos
    this.modulos = {
      sim1: new Sim1Abastecimiento(),
      sim2: new Sim2Conocimiento(),
      sim3: new Sim3Organicos(),
      sim4: new Sim4Habitat(),
      sim5: new Sim5Gobernanza(),
      sim6: new Sim6Suelo()
    };

    this.activeScenario = 's1_mas_bavaria';
    this.stressScenario = null;
    this.userParamOverrides = {};
    this.currentSeed = 42;
    this.rng = new RNG(this.currentSeed);

    this.history = []; // Historial de la corrida activa
  }

  setScenario(scenarioId) {
    if (ESCENARIOS[scenarioId]) {
      this.activeScenario = scenarioId;
    }
  }

  setStressScenario(stressId) {
    this.stressScenario = ESCENARIOS[stressId] ? ESCENARIOS[stressId].parametros_estres : null;
  }

  setUserParamOverrides(params) {
    this.userParamOverrides = Object.assign(this.userParamOverrides || {}, params);
  }

  setSeed(seed) {
    this.currentSeed = seed;
    this.rng.reset(seed);
  }

  reset() {
    this.clock.reset();
    this.massTracker.reset();
    this.rng.reset(this.currentSeed);
    this.history = [];

    const sc = ESCENARIOS[this.activeScenario] || {};
    const baseParams = sc.parametros || {};
    const params = Object.assign({}, baseParams, this.userParamOverrides || {});

    // Resetear cada módulo con los parámetros del escenario y del usuario
    this.modulos.sim1.reset(params);
    this.modulos.sim2.reset(params);
    this.modulos.sim3.reset(params);
    this.modulos.sim4.reset(params);
    this.modulos.sim5.reset(params);
    this.modulos.sim6.reset(params);
  }

  /**
   * Ejecuta un paso de tiempo (1 semana)
   */
  step() {
    if (!this.clock.step()) {
      return null; // Simulación completada
    }

    const sem = this.clock.week;

    // 1. Ejecutar Simulación 2 (Conocimiento y Huertas Activas)
    const resSim2 = this.modulos.sim2.step(this.clock, this.rng);

    // 2. Ejecutar Simulación 1 (Abastecimiento y Proveedor con balance de masa)
    // Se sincroniza el número de huertas activas con la difusión de conocimiento
    this.modulos.sim1.huertas.E01.n = Math.round(resSim2.huertas_activas * 0.40);
    this.modulos.sim1.huertas.E02.n = Math.round(resSim2.huertas_activas * 0.30);
    this.modulos.sim1.huertas.E04.n = Math.round(resSim2.huertas_activas * 0.15);
    const resSim1 = this.modulos.sim1.step(this.clock, this.rng, this.massTracker, this.stressScenario);

    // 3. Ejecutar Simulación 3 (Orgánicos y Compostaje con balance de masa)
    const resSim3 = this.modulos.sim3.step(this.clock, this.rng, this.massTracker);

    // 4. Ejecutar Simulación 4 (Hábitat y Fauna)
    const resSim4 = this.modulos.sim4.step(this.clock, this.rng);

    // 5. Ejecutar Simulación 5 (Gobernanza)
    const resSim5 = this.modulos.sim5.step(this.clock, this.rng);

    // 6. Ejecutar Simulación 6 (Suelo y Presión Inmobiliaria)
    const resSim6 = this.modulos.sim6.step(this.clock, this.rng, { huertasActivas: resSim2.huertas_activas });

    // Registro consolidado de la semana
    const snapshot = {
      semana: sem,
      sim1: resSim1,
      sim2: resSim2,
      sim3: resSim3,
      sim4: resSim4,
      sim5: resSim5,
      sim6: resSim6,
      balanceMasaValido: this.massTracker.getEstadoGeneral().esValido
    };

    this.history.push(snapshot);
    return snapshot;
  }

  /**
   * Ejecuta una corrida completa de 104 semanas
   */
  runFull(seed = null) {
    if (seed !== null) this.setSeed(seed);
    this.reset();
    while (!this.clock.isFinished()) {
      this.step();
    }
    return this.history;
  }

  /**
   * Ejecución Monte Carlo (mínimo 30 semillas)
   * Retorna series temporales agregadas con Media, Mediana, Q1, Q3, IQR y DesvEst.
   */
  runMonteCarlo(nSeeds = 30, baseSeed = 1000) {
    const rawRuns = [];
    for (let s = 0; s < nSeeds; s++) {
      const seedVal = baseSeed + s * 37;
      const runData = this.runFull(seedVal);
      rawRuns.push(runData);
    }

    // Agregación estadística por cada semana [0..horizonte-1]
    const agregadas = [];
    const nWeeks = rawRuns[0].length;

    for (let w = 0; w < nWeeks; w++) {
      const sem = w + 1;
      const punto = { semana: sem, variables: {} };

      // Lista de métricas numéricas clave a tabular
      const metricasClave = [
        ['participacion_local_pct', r => r.sim1.participacion_local_pct],
        ['dependencia_corabastos_pct', r => r.sim1.dependencia_corabastos_pct],
        ['produccion_kg', r => r.sim1.produccion_kg],
        ['desabastecimiento_kg', r => r.sim1.desabastecimiento_kg],
        ['huertas_activas', r => r.sim2.huertas_activas],
        ['stock_conocimiento', r => r.sim2.stock_conocimiento],
        ['toneladas_desviadas_acum', r => r.sim3.toneladas_desviadas_acum],
        ['compost_retornado_kg', r => r.sim3.compost_retornado_huertas_kg],
        ['indice_conectividad', r => r.sim4.indice_conectividad],
        ['mortalidad_trampas_acum', r => r.sim4.mortalidad_trampas_acum],
        ['tiempo_decision_sem', r => r.sim5.tiempo_decision_sem],
        ['concentracion_poder_hhi', r => r.sim5.concentracion_poder_hhi],
        ['permanencia_residentes_pct', r => r.sim6.permanencia_residentes_pct],
        ['precio_suelo_m2', r => r.sim6.precio_suelo_m2]
      ];

      for (const [key, getter] of metricasClave) {
        const valores = rawRuns.map(run => getter(run[w])).sort((a, b) => a - b);
        const n = valores.length;
        const media = valores.reduce((a, b) => a + b, 0) / n;
        const mediana = n % 2 === 0 ? (valores[n / 2 - 1] + valores[n / 2]) / 2 : valores[Math.floor(n / 2)];
        const q1 = valores[Math.floor(n * 0.25)];
        const q3 = valores[Math.floor(n * 0.75)];
        const iqr = q3 - q1;
        const varianza = valores.reduce((acc, v) => acc + Math.pow(v - media, 2), 0) / n;
        const std = Math.sqrt(varianza);

        punto.variables[key] = {
          media: Number(media.toFixed(2)),
          mediana: Number(mediana.toFixed(2)),
          q1: Number(q1.toFixed(2)),
          q3: Number(q3.toFixed(2)),
          iqr: Number(iqr.toFixed(2)),
          std: Number(std.toFixed(2)),
          min: Number(valores[0].toFixed(2)),
          max: Number(valores[n - 1].toFixed(2))
        };
      }

      agregadas.push(punto);
    }

    return {
      nSeeds,
      escenario: this.activeScenario,
      horizonteSemanas: this.horizonWeeks,
      series: agregadas,
      balanceMasaValido: this.massTracker.getEstadoGeneral().esValido
    };
  }
}
