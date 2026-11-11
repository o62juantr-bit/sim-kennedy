/**
 * Módulo Simulación 5: Gobernanza y Toma de Decisiones
 * Pregunta: ¿Cómo afecta la estructura de toma de decisiones (centralizada vs. heterarquía rotativa vs. mixta) la resolución de conflictos y la concentración de poder?
 */

export class Sim5Gobernanza {
  constructor(config = {}) {
    this.id = 'sim5_gobernanza';
    this.nombre = 'Gobernanza y Heterarquía Barrial';
    this.config = Object.assign({
      modelo: 'rotativo',              // 'centralizado' | 'rotativo' | 'mixto'
      frecuencia_rotacion_semanas: 8,  // Relevo de vocerías cada 2 meses (PAR10)
      quorum_minimo_pct: 60,           // Porcentaje de delegados para validar acuerdos
      tasa_generacion_solicitudes: 4.5,// Nuevas demandas/conflictos por semana
      capacidad_deliberacion_semanal: 5
    }, config);

    this.estado = {};
    this.reset();
  }

  reset(paramsOverride = {}) {
    const p = Object.assign({}, this.config, paramsOverride);
    this.params = p;

    this.historialVocerias = {
      bavaria: 0,
      jac_patio_bonito: 0,
      colectivos_huertas: 0,
      tenderos_comercio: 0,
      custodios_humedal: 0
    };

    this.estado = {
      semanaUltimaRotacion: 0,
      voceriaActual: 'colectivos_huertas',
      solicitudesPendientes: 3,
      conflictosActivos: 1,
      totalDecisionesTomadas: 0,
      tiempoMedioResolucionSem: 2.0,
      concentracionPoderHHI: 0.20, // Índice Herfindahl (0 = distribuido perfecto, 1 = monopolio)
      tasaNecesidadesAtendidasPct: 80.0
    };
  }

  step(clock, rng) {
    const sem = clock.week;
    const p = this.params;

    // 1. Dinámica de Rotación de Vocerías (Heterarquía en E11 / Bavaria E19)
    if (p.modelo === 'rotativo') {
      if ((sem - this.estado.semanaUltimaRotacion) >= p.frecuencia_rotacion_semanas) {
        const grupos = ['bavaria', 'jac_patio_bonito', 'colectivos_huertas', 'tenderos_comercio', 'custodios_humedal'];
        // Rota al siguiente grupo evitando reelección inmediata
        const idxActual = grupos.indexOf(this.estado.voceriaActual);
        this.estado.voceriaActual = grupos[(idxActual + 1) % grupos.length];
        this.estado.semanaUltimaRotacion = sem;
      }
      this.historialVocerias[this.estado.voceriaActual]++;
    } else if (p.modelo === 'centralizado') {
      // En el modelo centralizado, Bavaria o la Alcaldía retienen permanentemente la vocería
      this.estado.voceriaActual = 'bavaria';
      this.historialVocerias['bavaria']++;
    } else { // Mixto
      // Rotación entre institución y delegados barriales
      this.estado.voceriaActual = (sem % 12 < 6) ? 'bavaria' : 'colectivos_huertas';
      this.historialVocerias[this.estado.voceriaActual]++;
    }

    // 2. Llegada de necesidades y quejas (insumos, uso de suelo, precios, aguas)
    const nuevasSolicitudes = Math.max(1, Math.round(rng.gaussian(p.tasa_generacion_solicitudes, 1.2)));
    this.estado.solicitudesPendientes += nuevasSolicitudes;

    // 3. Capacidad de resolución y tiempo de decisión según modelo
    let tiempoResolucionBase = 2.0;
    let eficaciaResolucion = 0.85;

    if (p.modelo === 'centralizado') {
      // Las decisiones centralizadas tardan más (burocracia) pero tienen alta concentración
      tiempoResolucionBase = 5.2; // ~5 semanas para aprobar un permiso o subsidio
      eficaciaResolucion = 0.60;  // Menor sintonía con las necesidades locales
    } else if (p.modelo === 'rotativo') {
      // Las decisiones en asamblea heterárquica son rápidas a nivel de barrio
      tiempoResolucionBase = 1.8;
      eficaciaResolucion = 0.90;  // Alta pertinencia comunitaria
    } else { // Mixto
      tiempoResolucionBase = 3.0;
      eficaciaResolucion = 0.80;
    }

    const resueltasEstaSemana = Math.min(this.estado.solicitudesPendientes, Math.round(p.capacidad_deliberacion_semanal * eficaciaResolucion));
    this.estado.solicitudesPendientes -= resueltasEstaSemana;
    this.estado.totalDecisionesTomadas += resueltasEstaSemana;

    // Generación de conflictos si hay solicitudes acumuladas por más de 3 semanas
    if (this.estado.solicitudesPendientes > 8) {
      this.estado.conflictosActivos += 1;
    } else if (this.estado.conflictosActivos > 0 && resueltasEstaSemana > 3) {
      this.estado.conflictosActivos -= 1;
    }

    // 4. Cálculo de concentración de poder (Índice Herfindahl-Hirschman HHI)
    const totalSemanas = Object.values(this.historialVocerias).reduce((s, v) => s + v, 0);
    let hhi = 0;
    for (const v of Object.values(this.historialVocerias)) {
      const share = totalSemanas > 0 ? (v / totalSemanas) : 0.2;
      hhi += (share * share);
    }
    this.estado.concentracionPoderHHI = hhi;

    const totalDemandas = resueltasEstaSemana + this.estado.solicitudesPendientes;
    const tasaAtencion = totalDemandas > 0 ? (resueltasEstaSemana / totalDemandas) * 100 : 100;
    this.estado.tasaNecesidadesAtendidasPct = tasaAtencion;
    this.estado.tiempoMedioResolucionSem = tiempoResolucionBase + (this.estado.solicitudesPendientes * 0.15);

    return {
      semana: sem,
      modelo_gobernanza: p.modelo,
      voceria_activa: this.estado.voceriaActual,
      tiempo_decision_sem: Number(this.estado.tiempoMedioResolucionSem.toFixed(1)),
      concentracion_poder_hhi: Number(hhi.toFixed(3)),
      necesidades_atendidas_pct: Number(tasaAtencion.toFixed(1)),
      conflictos_activos: this.estado.conflictosActivos,
      solicitudes_pendientes: this.estado.solicitudesPendientes
    };
  }
}
