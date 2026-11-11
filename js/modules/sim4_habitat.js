/**
 * Módulo Simulación 4: Hábitat y Biodiversidad Urbana de Huertas
 * Evalúa la conectividad paisajística, los polinizadores y la fauna benéfica urbana, evitando trampas ecológicas.
 */

import { ESPACIOS, distanciaEspacios } from '../core/spaces.js';

export class Sim4Habitat {
  constructor(config = {}) {
    this.id = 'sim4_habitat';
    this.nombre = 'Hábitat y Biodiversidad Urbana';
    this.config = Object.assign({
      especies: {
        polinizadores_nativos: { nombre: 'Abejas nativas y polinizadores (Hymenoptera)', gremio: 'polinizador', radio_disp_m: 800, poblacion_base: 500, fuente: 'POR VERIFICAR' },
        colibri_chillon: { nombre: 'Colibrí chillón (Colibri coruscans)', gremio: 'nectarivoro', radio_disp_m: 2200, poblacion_base: 140, fuente: 'POR VERIFICAR' },
        copeton: { nombre: 'Copetón (Zonotrichia capensis)', gremio: 'percha_semillero', radio_disp_m: 1500, poblacion_base: 320, fuente: 'POR VERIFICAR' },
        mirla_patiamarilla: { nombre: 'Mirla patiamarilla (Turdus fuscater)', gremio: 'frugivoro_generalista', radio_disp_m: 1800, poblacion_base: 260, fuente: 'POR VERIFICAR' }
      },
      medidas_antitrampa: true,           // Señalización de vidrios con cintas UV y apantallamiento de luminarias
      huertas_en_borde_e04: true          // Si se cultivan franjas de amortiguación en E04
    }, config);

    this.estado = {};
    this.reset();
  }

  reset(paramsOverride = {}) {
    const p = Object.assign({}, this.config, paramsOverride);
    this.params = p;

    // Poblaciones iniciales
    this.poblaciones = {};
    for (const [id, esp] of Object.entries(p.especies)) {
      this.poblaciones[id] = esp.poblacion_base;
    }

    // Parches ecológicos en la red
    this.parches = ['E18', 'E04', 'E05', 'E01', 'E02', 'E03', 'E20'];

    this.estado = {
      poblaciones: Object.assign({}, this.poblaciones),
      indiceConectividad: 0.55,
      tasaOcupacionParchesPct: 65.0,
      mortalidadPorTrampas: 0,
      areaEcologicaActivaM2: 8500,
      biodiversidadPolinizadores: 68
    };
  }

  step(clock, rng) {
    const sem = clock.week;
    const p = this.params;

    // 1. Cálculo de conectividad entre el núcleo verde (E18 / E16) y las huertas
    let conectividadSuma = 0;
    let enlacesViables = 0;

    for (const dest of this.parches) {
      if (dest === 'E18') continue;
      const d = distanciaEspacios('E18', dest);
      const probConexion = Math.exp(-d / 1400);
      conectividadSuma += probConexion;
      if (probConexion > 0.35) enlacesViables++;
    }

    const indiceConectividad = Math.min(1.0, conectividadSuma / (this.parches.length - 1));
    this.estado.indiceConectividad = indiceConectividad;

    // 2. Dinámica de polinizadores y fauna benéfica
    let muertesTrampaSemana = 0;
    let parchesOcupadosConteo = 0;

    for (const [id, esp] of Object.entries(p.especies)) {
      let pop = this.estado.poblaciones[id];

      let factorNatalidad = 0.015 * (1 + indiceConectividad * 0.5);
      let factorMortalidad = 0.010;

      // Trampas ecológicas (colisión contra ventanales no tratados en altura E02)
      if (!p.medidas_antitrampa) {
        const factorRiesgo = (esp.gremio === 'nectarivoro' || esp.gremio === 'percha_semillero') ? 0.022 : 0.005;
        const bajas = Math.floor(pop * factorRiesgo);
        pop -= bajas;
        muertesTrampaSemana += bajas;
      }

      // Variación estocástica
      const delta = pop * (factorNatalidad - factorMortalidad) + rng.gaussian(0, pop * 0.015);
      pop = Math.max(10, Math.round(pop + delta));
      this.estado.poblaciones[id] = pop;

      if (pop > esp.poblacion_base * 0.5) parchesOcupadosConteo++;
    }

    this.estado.mortalidadPorTrampas += muertesTrampaSemana;
    this.estado.tasaOcupacionParchesPct = (parchesOcupadosConteo / Object.keys(p.especies).length) * 100;
    
    // Índice consolidado de polinizadores (escala 0-100)
    const ratioPoli = this.estado.poblaciones['polinizadores_nativos'] / p.especies.polinizadores_nativos.poblacion_base;
    this.estado.biodiversidadPolinizadores = Math.min(100, Math.round(ratioPoli * 65 * (1 + indiceConectividad * 0.5)));

    return {
      semana: sem,
      indice_conectividad: Number(indiceConectividad.toFixed(3)),
      ocupacion_parches_pct: Number(this.estado.tasaOcupacionParchesPct.toFixed(1)),
      biodiversidad_polinizadores: this.estado.biodiversidadPolinizadores,
      poblacion_colibri: this.estado.poblaciones['colibri_chillon'],
      poblacion_copeton: this.estado.poblaciones['copeton'],
      mortalidad_trampas_acum: this.estado.mortalidadPorTrampas
    };
  }
}
