/**
 * Verificador y Auditor de Balance de Masa
 * Regla dura: el alimento y los orgánicos no se crean ni se destruyen sin regla explícita.
 */

export class MassBalanceTracker {
  constructor() {
    this.historial = [];
    this.tolerancia = 0.001; // Tolerancia de 1 gramo por precisión de punto flotante
  }

  reset() {
    this.historial = [];
  }

  /**
   * Audita el balance de masa de alimentos para la semana actual
   */
  auditarAlimentos({
    semana,
    stockInicialKg,
    stockFinalKg,
    produccionHuertasKg,
    comprasMayoristaKg = 0,
    autoconsumoKg,
    ventasTiendasKg,
    ventasFeriaKg,
    entregasComedoresKg,
    mermasHuertaKg,
    mermasAcopioKg
  }) {
    const entradasTotal = produccionHuertasKg + comprasMayoristaKg;
    const salidasTotal = autoconsumoKg + ventasTiendasKg + ventasFeriaKg + entregasComedoresKg + mermasHuertaKg + mermasAcopioKg;
    const deltaStockReal = stockFinalKg - stockInicialKg;
    const deltaStockEsperado = entradasTotal - salidasTotal;
    const discrepancia = Math.abs(deltaStockReal - deltaStockEsperado);

    const registro = {
      tipo: 'ALIMENTOS',
      semana,
      entradas: entradasTotal,
      salidas: salidasTotal,
      deltaStockReal,
      deltaStockEsperado,
      discrepancia,
      cumple: discrepancia <= this.tolerancia
    };

    this.historial.push(registro);
    if (!registro.cumple) {
      console.warn(`[BALANCE DE MASA VIOLADO - ALIMENTOS] Sem ${semana}: Discrepancia = ${discrepancia.toFixed(4)} kg`);
    }
    return registro;
  }

  /**
   * Audita el balance de masa de residuos orgánicos y compostaje
   */
  auditarOrganicos({
    semana,
    stockInicialBioKg,
    stockFinalBioKg,
    generacionHogaresKg,
    generacionComerciosKg,
    residuosHuertasKg,
    rutaAseoOrdinarioKg, // Fracción no desviada que sale de la localidad (ej. Doña Juana)
    ingresoEstacionCompostKg,
    ingresoDistritoHongosKg,
    perdidaHumedadGasesCompostKg,
    compostMaduroProducidoKg
  }) {
    const generacionTotal = generacionHogaresKg + generacionComerciosKg + residuosHuertasKg;
    const distribucionTotal = rutaAseoOrdinarioKg + ingresoEstacionCompostKg + ingresoDistritoHongosKg;
    const discrepanciaGeneracion = Math.abs(generacionTotal - distribucionTotal);

    // Balance de transformación en la pila de compostaje:
    // masa que entra a compostar = masa compost final + pérdida de agua/CO2 por respiración aerobia
    const discrepanciaProcesoCompost = Math.abs(ingresoEstacionCompostKg - (compostMaduroProducidoKg + perdidaHumedadGasesCompostKg));

    const registro = {
      tipo: 'ORGANICOS',
      semana,
      generacionTotal,
      distribucionTotal,
      discrepanciaGeneracion,
      discrepanciaProcesoCompost,
      cumple: discrepanciaGeneracion <= this.tolerancia && discrepanciaProcesoCompost <= this.tolerancia
    };

    this.historial.push(registro);
    if (!registro.cumple) {
      console.warn(`[BALANCE DE MASA VIOLADO - ORGÁNICOS] Sem ${semana}: Generación discrepancia = ${discrepanciaGeneracion.toFixed(4)} kg, Proceso = ${discrepanciaProcesoCompost.toFixed(4)} kg`);
    }
    return registro;
  }

  getEstadoGeneral() {
    const fallos = this.historial.filter(r => !r.cumple);
    return {
      totalAuditorias: this.historial.length,
      fallos: fallos.length,
      esValido: fallos.length === 0,
      maxDiscrepancia: this.historial.reduce((max, r) => Math.max(max, r.discrepancia || r.discrepanciaGeneracion || 0), 0)
    };
  }
}
