/**
 * Módulo Simulación 2: Difusión del Conocimiento desde Bavaria Común
 * Pregunta: ¿Cómo se propaga el conocimiento agroecológico y qué ocurre cuando se satura el acompañamiento?
 */

export class Sim2Conocimiento {
  constructor(config = {}) {
    this.id = 'sim2_conocimiento';
    this.nombre = 'Difusión del Conocimiento y Extensión';
    this.config = Object.assign({
      hogares_candidatos_total: 450,       // Población potencial de huerteros en el área
      facilitadores_bavaria: 6,            // N-19 Formadores de planta en E19
      cupos_taller_mes: 24,                // PAR11 Cupos mensuales en E19
      ratio_saturacion_critico: 15,        // Huertas por promotor antes de perder calidad
      tasa_abandono_base: 0.015,           // 1.5% abandono mensual por causas externas
      prob_imitacion_vecinal: 0.035,       // Contagio social por ver huertas activas
      apoyo_antena_e15: true,              // Si existe antena en E15 (Banco de semillas Tingua Azul)
      es_cluster: true                     // Clúster completo (E19, E20, E12, E13, E10) vs nodo aislado
    }, config);

    this.estado = {};
    this.reset();
  }

  reset(paramsOverride = {}) {
    const p = Object.assign({}, this.config, paramsOverride);
    this.params = p;

    this.estado = {
      promotoresActivos: p.facilitadores_bavaria * (p.es_cluster ? 2 : 1),
      huertasActivas: 25,
      hogaresAdoptantes: 25,
      hogaresNoAdoptantes: p.hogares_candidatos_total - 25,
      stockConocimiento: 0.35, // Índice 0-1
      saturacionAcompanamiento: 1.0, // Ratio huertas/promotor
      tasaSupervivenciaPct: 95.0,
      huertasAbandonadasAcum: 0,
      tiempoMedioAdopcionSemanas: 0
    };
  }

  step(clock, rng) {
    const sem = clock.week;
    const p = this.params;

    // 1. Formación de nuevos promotores en Bavaria (E19)
    // Cada mes (4 semanas) egresan nuevos promotores si hay cupo y formadores disponibles
    const esFinDeMes = sem % 4 === 0;
    if (esFinDeMes && p.facilitadores_bavaria > 0) {
      const formadosMes = Math.floor(rng.range(2, Math.min(6, p.cupos_taller_mes / 4)));
      this.estado.promotoresActivos += formadosMes;
      // Desgaste o retiro de promotores por sobrecarga (bucle B1)
      if (this.estado.saturacionAcompanamiento > p.ratio_saturacion_critico) {
        const bajasPromotores = Math.floor(this.estado.promotoresActivos * 0.08);
        this.estado.promotoresActivos = Math.max(2, this.estado.promotoresActivos - bajasPromotores);
      }
    }

    // 2. Cálculo del ratio de saturación (huertas por promotor)
    const ratioActual = this.estado.promotoresActivos > 0 ? this.estado.huertasActivas / this.estado.promotoresActivos : 99;
    this.estado.saturacionAcompanamiento = ratioActual;

    // Factor de calidad del acompañamiento (decae si supera el ratio crítico)
    let calidadAcompanamiento = 1.0;
    if (ratioActual > p.ratio_saturacion_critico) {
      calidadAcompanamiento = Math.max(0.25, p.ratio_saturacion_critico / ratioActual);
    }

    // Si cuenta con antena local en E15 (Tingua Azul), la cercanía mitiga un 30% la saturación
    if (p.apoyo_antena_e15) {
      calidadAcompanamiento = Math.min(1.0, calidadAcompanamiento * 1.30);
    }

    // 3. Adopción de nuevas huertas (Efecto Bavaria + Efecto Imitación Vecinal)
    const tasaAdopcionBavaria = (this.estado.promotoresActivos * 0.35 * calidadAcompanamiento) / Math.max(1, this.estado.hogaresNoAdoptantes);
    const fraccionHuertasActivas = this.estado.huertasActivas / p.hogares_candidatos_total;
    const tasaImitacion = p.prob_imitacion_vecinal * fraccionHuertasActivas;

    const probAdopcionTotal = Math.min(0.12, tasaAdopcionBavaria + tasaImitacion);

    let nuevosAdoptantes = 0;
    for (let i = 0; i < Math.min(30, this.estado.hogaresNoAdoptantes); i++) {
      if (rng.chance(probAdopcionTotal)) {
        nuevosAdoptantes++;
      }
    }

    nuevosAdoptantes = Math.min(nuevosAdoptantes, this.estado.hogaresNoAdoptantes);
    this.estado.huertasActivas += nuevosAdoptantes;
    this.estado.hogaresAdoptantes += nuevosAdoptantes;
    this.estado.hogaresNoAdoptantes -= nuevosAdoptantes;

    // 4. Abandono de huertas (Falta de acompañamiento o pérdidas)
    let tasaAbandonoSemanal = p.tasa_abandono_base / 4;
    // Si la calidad de acompañamiento cae, el abandono sube hasta 4 veces
    if (calidadAcompanamiento < 0.6) {
      tasaAbandonoSemanal *= (1 + (0.6 - calidadAcompanamiento) * 5);
    }

    let huertasCerradas = 0;
    for (let i = 0; i < this.estado.huertasActivas; i++) {
      if (rng.chance(tasaAbandonoSemanal)) {
        huertasCerradas++;
      }
    }

    this.estado.huertasActivas = Math.max(0, this.estado.huertasActivas - huertasCerradas);
    this.estado.huertasAbandonadasAcum += huertasCerradas;

    // 5. Índice de conocimiento compartido en la red (STK07)
    // Aumenta con talleres y promotores, decae ligeramente por rotación
    const incrementoConocimiento = (this.estado.promotoresActivos * 0.005) + (p.es_cluster ? 0.008 : 0.002);
    const perdidaConocimiento = 0.003;
    this.estado.stockConocimiento = Math.min(1.0, Math.max(0.1, this.estado.stockConocimiento + incrementoConocimiento - perdidaConocimiento));

    // 6. Supervivencia acumulada
    const totalHistorico = this.estado.huertasActivas + this.estado.huertasAbandonadasAcum;
    this.estado.tasaSupervivenciaPct = totalHistorico > 0 ? (this.estado.huertasActivas / totalHistorico) * 100 : 100;

    return {
      semana: sem,
      huertas_activas: this.estado.huertasActivas,
      promotores_activos: this.estado.promotoresActivos,
      ratio_huertas_promotor: Number(this.estado.saturacionAcompanamiento.toFixed(1)),
      stock_conocimiento: Number(this.estado.stockConocimiento.toFixed(3)),
      tasa_supervivencia_pct: Number(this.estado.tasaSupervivenciaPct.toFixed(1)),
      huertas_abandonadas: this.estado.huertasAbandonadasAcum
    };
  }
}
