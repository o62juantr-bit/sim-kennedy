/**
 * Módulo Simulación 4: Hábitat y Fauna Urbana
 * Pregunta: ¿Cómo influye la red de huertas en la conectividad y persistencia de la avifauna nativa, y cómo evitar trampas ecológicas?
 */

import { ESPACIOS, distanciaEspacios } from '../core/spaces.js';

export class Sim4Habitat {
  constructor(config = {}) {
    this.id = 'sim4_habitat';
    this.nombre = 'Hábitat y Avifauna Nativa';
    this.config = Object.assign({
      especies: {
        colibri_chillon: { nombre: 'Colibrí chillón (Colibri coruscans)', gremio: 'nectarivoro', radio_disp_m: 2200, poblacion_base: 120, sensibilidad_luz_ruido: 0.25, fuente: 'POR VERIFICAR' },
        copeton: { nombre: 'Copetón (Zonotrichia capensis)', gremio: 'percha_semillero', radio_disp_m: 1500, poblacion_base: 310, sensibilidad_luz_ruido: 0.30, fuente: 'POR VERIFICAR' },
        garza_blanca: { nombre: 'Garza blanca (Ardea alba)', gremio: 'humedal_acuatico', radio_disp_m: 2800, poblacion_base: 25, sensibilidad_luz_ruido: 0.70, fuente: 'POR VERIFICAR' },
        mirla_patiamarilla: { nombre: 'Mirla patiamarilla (Turdus fuscater)', gremio: 'frugivoro_generalista', radio_disp_m: 1800, poblacion_base: 240, sensibilidad_luz_ruido: 0.20, fuente: 'POR VERIFICAR' }
      },
      medidas_antitrampa: true,           // Señalización de vidrios con cintas UV y apantallamiento de luminarias
      control_sinantropia_granos: true,   // Gestión de tolvas para no atraer chamones parásitos (Molothrus bonariensis)
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

    // Estado de ocupación de parches (E18 Humedal, E04 Borde, E05 Huerta existente, E01, E02, E03, E20)
    this.parches = ['E18', 'E04', 'E05', 'E01', 'E02', 'E03', 'E20'];

    this.estado = {
      poblaciones: Object.assign({}, this.poblaciones),
      indiceConectividad: 0.55,      // Índice de permeabilidad del paisaje 0-1
      tasaOcupacionParchesPct: 65.0, // Porcentaje de parches con presencia
      mortalidadPorTrampas: 0,       // Choques contra vidrios y estrés lumínico
      tasaParasitismoCriaPct: 12.0   // Afectación por chamón en nidos de copetón
    };
  }

  step(clock, rng) {
    const sem = clock.week;
    const p = this.params;

    // 1. Evaluación de calidad del hábitat por parche
    // El Humedal E18 es el nodo fuente primario
    const calidadE18 = 0.90;
    // La huerta de borde E04 aporta amortiguación si no tiene agroquímicos, pero puede perturbar si hay ruido
    const calidadE04 = p.huertas_en_borde_e04 ? 0.75 : 0.85;

    // 2. Cálculo de conectividad entre el núcleo del humedal (E18) y las huertas
    let conectividadSuma = 0;
    let enlacesViables = 0;

    for (const dest of this.parches) {
      if (dest === 'E18') continue;
      const d = distanciaEspacios('E18', dest);
      // Probabilidad de enlace según distancia media de dispersión de avifauna (~1500 m)
      const probConexion = Math.exp(-d / 1400);
      conectividadSuma += probConexion;
      if (probConexion > 0.35) enlacesViables++;
    }

    const indiceConectividad = Math.min(1.0, conectividadSuma / (this.parches.length - 1));
    this.estado.indiceConectividad = indiceConectividad;

    // 3. Dinámica poblacional y trampas ecológicas
    let muertesTrampaSemana = 0;
    let parchesOcupadosConteo = 0;

    for (const [id, esp] of Object.entries(p.especies)) {
      let pop = this.estado.poblaciones[id];

      // Tasa intrínseca semanal de natalidad / forrajeo
      let factorNatalidad = 0.012 * (1 + indiceConectividad * 0.4);
      let factorMortalidad = 0.010;

      // Efecto de trampa ecológica:
      // Si NO hay medidas antitrampa, las huertas en vivienda de altura E02 y techos generan colisiones
      if (!p.medidas_antitrampa) {
        const factorRiesgoVidrios = (esp.gremio === 'percha_semillero' || esp.gremio === 'nectarivoro') ? 0.025 : 0.005;
        const bajasColision = Math.floor(pop * factorRiesgoVidrios);
        pop -= bajasColision;
        muertesTrampaSemana += bajasColision;
      }

      // Parasitismo de cría por chamón (afecta al copetón si hay desperdicio de granos en acopio o ferias)
      if (id === 'copeton') {
        const tasaParasitismo = p.control_sinantropia_granos ? 0.08 : 0.32;
        factorNatalidad *= (1 - tasaParasitismo);
        this.estado.tasaParasitismoCriaPct = tasaParasitismo * 100;
      }

      // Sensibilidad al disturbio en especies dependientes del humedal (Garza, etc.)
      if (esp.sensibilidad_luz_ruido > 0.6) {
        // Si hay sobreocupación sin barrera en E04, sufren estrés
        if (p.huertas_en_borde_e04 && !p.medidas_antitrampa) {
          factorMortalidad += 0.008;
        }
      }

      // Actualización de población estocástica
      const delta = pop * (factorNatalidad - factorMortalidad) + rng.gaussian(0, pop * 0.02);
      pop = Math.max(5, Math.round(pop + delta));
      this.estado.poblaciones[id] = pop;

      if (pop > esp.poblacion_base * 0.4) {
        parchesOcupadosConteo++;
      }
    }

    this.estado.mortalidadPorTrampas += muertesTrampaSemana;
    this.estado.tasaOcupacionParchesPct = (parchesOcupadosConteo / Object.keys(p.especies).length) * 100;

    return {
      semana: sem,
      indice_conectividad: Number(indiceConectividad.toFixed(3)),
      ocupacion_parches_pct: Number(this.estado.tasaOcupacionParchesPct.toFixed(1)),
      poblacion_colibri: this.estado.poblaciones['colibri_chillon'],
      poblacion_copeton: this.estado.poblaciones['copeton'],
      poblacion_garza: this.estado.poblaciones['garza_blanca'],
      mortalidad_trampas_acum: this.estado.mortalidadPorTrampas,
      parasitismo_cria_pct: Number(this.estado.tasaParasitismoCriaPct.toFixed(1))
    };
  }
}
