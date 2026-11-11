/**
 * Módulo Simulación 6: Riesgo de Valorización del Suelo y Gentrificación
 * Pregunta: ¿Cómo evitar que la mejora ambiental y alimentaria expulse a los habitantes por especulación inmobiliaria?
 */

export class Sim6Suelo {
  constructor(config = {}) {
    this.id = 'sim6_suelo';
    this.nombre = 'Valorización del Suelo y Presión Inmobiliaria';
    this.config = Object.assign({
      proteccion_suelo_activa: true,     // Acuerdos de custodia temporal de baldíos y blindaje de uso
      precio_base_suelo_m2: 1850000,     // COP/m² en sectores periféricos de Kennedy - "fuente": "POR VERIFICAR"
      tasa_apreciacion_base_anual: 0.05, // 5% de apreciación natural urbana
      sensibilidad_plusvalia_verde: 0.08,// Incremento de renta del suelo generado por áreas verdes y huertas
      hogares_arrendatarios_base: 650,   // Familias bajo régimen de alquiler vulnerable
      baldios_disponibles_base: 4        // Lotes vacíos identificados en el polígono
    }, config);

    this.estado = {};
    this.reset();
  }

  reset(paramsOverride = {}) {
    const p = Object.assign({}, this.config, paramsOverride);
    this.params = p;

    this.estado = {
      precioSueloM2: p.precio_base_suelo_m2,
      indicePresionInmobiliaria: 0.20,     // Escala 0 a 1
      permanenciaResidentesPct: 100.0,
      hogaresDesplazadosAcum: 0,
      baldiosActivosEnCultivo: p.baldios_disponibles_base,
      baldiosPerdidosEspeculacion: 0
    };
  }

  step(clock, rng, contextoRed = {}) {
    const sem = clock.week;
    const p = this.params;

    // 1. Dinámica de Valorización del Suelo:
    // La presencia de huertas activas, arbolado y mejoras en el entorno crea amenidad ambiental
    const consolidacionVerde = (contextoRed.huertasActivas || 50) / 100;
    const incrementoSemanal = (p.tasa_apreciacion_base_anual / 52) +
      (p.sensibilidad_plusvalia_verde / 52) * consolidacionVerde;

    this.estado.precioSueloM2 *= (1 + incrementoSemanal * rng.gaussian(1.0, 0.05));

    // Ratio de aumento del valor del suelo respecto al inicio
    const ratioAumento = this.estado.precioSueloM2 / p.precio_base_suelo_m2;
    this.estado.indicePresionInmobiliaria = Math.min(1.0, (ratioAumento - 1) * 2.5);

    // 2. Pérdida de huertas en baldíos (E03):
    // Si NO hay protección legal/acuerdo de custodia temporal, el propietario busca vender o cercar el lote
    if (!p.proteccion_suelo_activa && this.estado.baldiosActivosEnCultivo > 0) {
      const probDesalojoBaldio = Math.min(0.08, this.estado.indicePresionInmobiliaria * 0.06);
      if (rng.chance(probDesalojoBaldio)) {
        this.estado.baldiosActivosEnCultivo--;
        this.estado.baldiosPerdidosEspeculacion++;
      }
    }

    // 3. Desplazamiento de hogares arrendatarios en sectores informales (E01):
    // El aumento de los alquileres presiona a los hogares de menores ingresos
    let tasaDesplazamientoSemanal = 0;
    if (!p.proteccion_suelo_activa && ratioAumento > 1.10) {
      tasaDesplazamientoSemanal = (ratioAumento - 1.10) * 0.015;
    } else if (p.proteccion_suelo_activa) {
      // Con programas de arrendamiento social y permanencia, el desplazamiento es residual
      tasaDesplazamientoSemanal = 0.0005;
    }

    const desplazadosEstaSemana = Math.round(p.hogares_arrendatarios_base * tasaDesplazamientoSemanal);
    this.estado.hogaresDesplazadosAcum += desplazadosEstaSemana;

    const permanencia = Math.max(0, 100 - (this.estado.hogaresDesplazadosAcum / p.hogares_arrendatarios_base) * 100);
    this.estado.permanenciaResidentesPct = permanencia;

    return {
      semana: sem,
      precio_suelo_m2: Math.round(this.estado.precioSueloM2),
      presion_inmobiliaria_indice: Number(this.estado.indicePresionInmobiliaria.toFixed(3)),
      permanencia_residentes_pct: Number(permanencia.toFixed(1)),
      hogares_desplazados_acum: this.estado.hogaresDesplazadosAcum,
      baldios_en_cultivo: this.estado.baldiosActivosEnCultivo,
      baldios_perdidos: this.estado.baldiosPerdidosEspeculacion
    };
  }
}
