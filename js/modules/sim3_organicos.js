/**
 * Módulo Simulación 3: Ciclo de Orgánicos y Compostaje
 * Pregunta: ¿Cuánta biomasa orgánica se puede desviar del relleno sanitario y retornar como fertilidad a las huertas?
 */

export class Sim3Organicos {
  constructor(config = {}) {
    this.id = 'sim3_organicos';
    this.nombre = 'Ciclo de Orgánicos y Compostaje';
    this.config = Object.assign({
      hogares_generadores: 1200,            // Hogares en perímetro de estudio
      tiendas_generadoras: 45,               // Tiendas y fruterías
      generacion_kg_hogar_sem: 4.8,         // kg de bio-residuos por hogar/semana (DANE/UAESP)
      generacion_kg_tienda_sem: 35.0,       // kg de mermas orgánicas por tienda/semana
      fraccion_desvio_compost_e10: 0.35,    // Fracción que se logra separar y llevar a E10
      fraccion_desvio_hongos_e12: 0.08,     // Fracción de borra/sustrato limpio a salas de cultivo E12
      factor_perdida_respiracion: 0.55,     // 55% de pérdida por evaporación y CO2 en compost termófilo
      tiempo_maduracion_semanas: 8          // Tiempo de fermentación y maduración del compost
    }, config);

    this.estado = {};
    this.reset();
  }

  reset(paramsOverride = {}) {
    const p = Object.assign({}, this.config, paramsOverride);
    this.params = p;

    // Buffer de maduración por semanas (cola FIFO para compost en proceso)
    this.pilaCompostProceso = new Array(p.tiempo_maduracion_semanas).fill(0);

    this.estado = {
      stockCompostMaduroKg: 500, // Stock inicial listo para repartir
      organicosGeneradosSemanaKg: 0,
      desviadosCompostE10Kg: 0,
      desviadosHongosE12Kg: 0,
      rutaAseoOrdinarioKg: 0,
      compostProducidoSemanaKg: 0,
      compostRetornadoHuertasKg: 0,
      toneladasDesviadasAcumuladas: 0,
      tasaDesvioPct: 0
    };
  }

  step(clock, rng, massTracker) {
    const sem = clock.week;
    const p = this.params;

    // 1. Generación total de residuos orgánicos en la semana
    const genHogares = p.hogares_generadores * p.generacion_kg_hogar_sem * rng.gaussian(1.0, 0.05);
    const genTiendas = p.tiendas_generadoras * p.generacion_kg_tienda_sem * rng.gaussian(1.0, 0.08);
    const genTotal = Math.max(0, genHogares + genTiendas);

    // 2. Separación y desvío hacia rutas de aprovechamiento
    const desviadoE10 = genTotal * p.fraccion_desvio_compost_e10;
    const desviadoE12 = genTotal * p.fraccion_desvio_hongos_e12;
    // El resto sigue la ruta del camión de aseo ordinario hacia el relleno sanitario Doña Juana
    const rutaOrdinario = Math.max(0, genTotal - desviadoE10 - desviadoE12);

    // 3. Proceso biológico en la pila de compostaje (Estación E10)
    // Ingresa a la cola de semanas de maduración
    this.pilaCompostProceso.push(desviadoE10);
    const maduradoEstaSemanaBruto = this.pilaCompostProceso.shift() || 0;

    // Reducción de masa por respiración aerobia y pérdida de humedad
    const perdidaHumedad = maduradoEstaSemanaBruto * p.factor_perdida_respiracion;
    const compostMaduroNeto = maduradoEstaSemanaBruto - perdidaHumedad;

    this.estado.stockCompostMaduroKg += compostMaduroNeto;

    // 4. Retorno del compost a las huertas (E01 a E05)
    // Demanda de abonado semanal de las huertas
    const demandaAbonadoHuertas = 850; // kg/semana
    const entregaHuertas = Math.min(this.estado.stockCompostMaduroKg, demandaAbonadoHuertas);
    this.estado.stockCompostMaduroKg -= entregaHuertas;

    // 5. Acumuladores e indicadores
    const desviadoSemanaKg = desviadoE10 + desviadoE12;
    this.estado.toneladasDesviadasAcumuladas += (desviadoSemanaKg / 1000);
    const tasaDesvio = genTotal > 0 ? (desviadoSemanaKg / genTotal) * 100 : 0;

    this.estado.organicosGeneradosSemanaKg = genTotal;
    this.estado.desviadosCompostE10Kg = desviadoE10;
    this.estado.desviadosHongosE12Kg = desviadoE12;
    this.estado.rutaAseoOrdinarioKg = rutaOrdinario;
    this.estado.compostProducidoSemanaKg = compostMaduroNeto;
    this.estado.compostRetornadoHuertasKg = entregaHuertas;
    this.estado.tasaDesvioPct = tasaDesvio;

    // 6. Auditoría estricta de balance de masa de bio-residuos
    if (massTracker) {
      massTracker.auditarOrganicos({
        semana: sem,
        stockInicialBioKg: 0,
        stockFinalBioKg: 0,
        generacionHogaresKg: genHogares,
        generacionComerciosKg: genTiendas,
        residuosHuertasKg: 0,
        rutaAseoOrdinarioKg: rutaOrdinario,
        ingresoEstacionCompostKg: desviadoE10,
        ingresoDistritoHongosKg: desviadoE12,
        perdidaHumedadGasesCompostKg: perdidaHumedad,
        compostMaduroProducidoKg: compostMaduroNeto
      });
    }

    return {
      semana: sem,
      generacion_total_kg: Math.round(genTotal),
      desviado_compost_kg: Math.round(desviadoE10),
      desviado_hongos_kg: Math.round(desviadoE12),
      ruta_ordinaria_relleno_kg: Math.round(rutaOrdinario),
      compost_maduro_kg: Math.round(compostMaduroNeto),
      compost_retornado_huertas_kg: Math.round(entregaHuertas),
      tasa_desvio_pct: Number(tasaDesvio.toFixed(1)),
      toneladas_desviadas_acum: Number(this.estado.toneladasDesviadasAcumuladas.toFixed(2))
    };
  }
}
