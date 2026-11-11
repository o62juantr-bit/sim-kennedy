/**
 * Módulo Simulación 1 (Núcleo): Abastecimiento y Elección de Proveedor
 * Pregunta: ¿Qué pasa cuando cambian las relaciones entre quienes producen y distribuyen?
 */

import { ESPACIOS } from '../core/spaces.js';

export class Sim1Abastecimiento {
  constructor(config = {}) {
    this.id = 'sim1_abastecimiento';
    this.nombre = 'Abastecimiento y Elección de Proveedor';
    this.config = Object.assign({
      precio_mayorista_base: 3200,      // COP/kg - fuente: SIPSA 2025 / Corabastos
      precio_local_base: 2700,          // COP/kg - "fuente": "POR VERIFICAR"
      demanda_total_semanal_kg: 25000,  // Demanda estimada de producto fresco en área de estudio (Kennedy)
      peso_precio: 0.35,                // Ponderación de precio en tiendas
      peso_credito: 0.20,               // Capacidad de dar crédito a 15 días
      peso_vol_minimo: 0.15,            // Facilidad de pedidos pequeños
      peso_horario: 0.10,               // Puntualidad y entrega en franja deseada
      peso_confianza: 0.20,             // Relación histórica acumulada
      tasa_merma_huerta: 0.05,          // 5% de merma en cosecha
      tasa_merma_acopio: 0.04           // 4% de merma en transporte y acopio
    }, config);

    this.estado = {};
    this.reset();
  }

  reset(paramsOverride = {}) {
    const p = Object.assign({}, this.config, paramsOverride);
    this.params = p;

    // Inicialización de huertas por tipología según parámetros del escenario
    this.huertas = {
      E01: { n: p.huertas_iniciales_e01 ?? 40, area_m2: 60, rendimiento_kg_m2: 0.15 },
      E02: { n: p.huertas_iniciales_e02 ?? 25, area_m2: 250, rendimiento_kg_m2: 0.18 },
      E03: { n: p.huertas_iniciales_e03 ?? 1, area_m2: 900, rendimiento_kg_m2: 0.22 },
      E04: { n: p.huertas_iniciales_e04 ?? 8, area_m2: 450, rendimiento_kg_m2: 0.12 },
      E05: { n: p.huertas_iniciales_e05 ?? 35, area_m2: 1100, rendimiento_kg_m2: 0.25 }
    };

    // Parámetros dinámicos
    this.estado = {
      stockAcopioKg: 0,
      capacidadAcopioKg: p.capacidad_acopio_kg_sem ?? 4000,
      confianzaLocal: p.confianza_inicial_local ?? 0.30,
      precioMayorista: p.precio_mayorista_kg ?? p.precio_mayorista_base,
      precioLocal: p.precio_local_kg ?? p.precio_local_base,
      tasaAutoconsumo: p.tasa_autoconsumo ?? 0.50,
      acopioActivo: p.acopio_activo ?? true,
      feriaActiva: p.feria_activa ?? true,
      bavariaActivo: p.bavaria_activo ?? false,

      // Acumuladores de desempeño
      produccionSemanalKg: 0,
      autoconsumoSemanalKg: 0,
      volumenLocalVendidoKg: 0,
      volumenMayoristaCompradoKg: 0,
      demandaDesatendidaKg: 0,
      participacionLocalPct: 0,
      dependenciaCorabastosPct: 94.0,
      mermasTotalKg: 0
    };
  }

  step(clock, rng, massTracker, estres = null) {
    const sem = clock.week;
    const season = clock.season;

    // 1. Aplicación de factores de estrés transversal (si aplican en la semana)
    let factorPrecioMay = 1.0;
    let factorDispMay = 1.0;
    let factorLluvia = season.factorLluvia;
    let demandaTotal = this.params.demanda_total_semanal_kg;
    let hayEstresSemana = false;
    let tipoEstresSemana = null;

    if (estres) {
      const dentroPeriodo = sem >= estres.semana_inicio && sem < (estres.semana_inicio + estres.duracion_semanas);
      if (dentroPeriodo) {
        hayEstresSemana = true;
        tipoEstresSemana = estres.tipo;
        if (estres.tipo === 'choque_corabastos') {
          factorPrecioMay = estres.factor_precio_mayorista || 1.65;
          factorDispMay = estres.factor_disponibilidad_mayorista || 0.45;
        }
        if (estres.tipo === 'sequia') {
          factorLluvia = estres.factor_lluvia || 0.30;
        }
        if (estres.tipo === 'crecimiento_poblacional') {
          demandaTotal = Math.round(demandaTotal * (estres.factor_demanda || 1.35));
        }
      }
    }

    const precioMayActual = this.estado.precioMayorista * factorPrecioMay;
    const precioLocActual = this.estado.precioLocal;

    // 2. Producción agrícola en las huertas de las 4 tipologías
    let cosechaTotalSemana = 0;
    const stockInicialAcopio = this.estado.stockAcopioKg;

    // Efecto de Bavaria Común si está activo (mejora rendimiento por técnica y biofertilización)
    const factorBavaria = this.estado.bavariaActivo ? 1.35 : 1.0;

    for (const [id, h] of Object.entries(this.huertas)) {
      if (h.n <= 0) continue;
      // Resiliencia hídrica: huertas conectadas a Bavaria y con compost sufren mucho menos en sequía
      let lluviaEfectiva = factorLluvia;
      if (tipoEstresSemana === 'sequia') {
        lluviaEfectiva = this.estado.bavariaActivo ? Math.max(0.70, factorLluvia * 1.7) : (factorLluvia * 0.55);
      }
      const rendimientoClima = h.rendimiento_kg_m2 * lluviaEfectiva * factorBavaria;
      // Ruido estocástico controlado (variación de microclima y plagas ±8%)
      const factorAleatorio = rng.gaussian(1.0, 0.08);
      const prodPorHuerta = Math.max(0, h.area_m2 * rendimientoClima * factorAleatorio);
      cosechaTotalSemana += prodPorHuerta * h.n;
    }

    // 3. Destino de la cosecha (Autoconsumo, Mermas y Excedentes)
    const autoconsumoKg = cosechaTotalSemana * this.estado.tasaAutoconsumo;
    const remanente = cosechaTotalSemana - autoconsumoKg;
    const mermasHuertaKg = remanente * this.params.tasa_merma_huerta;
    const excedenteNetoHuertas = remanente - mermasHuertaKg;

    // 4. Recepción en Centro de Acopio E06
    let excedenteIngresadoAcopio = 0;
    let mermaExcedenteNoAcopiado = 0;

    if (this.estado.acopioActivo) {
      const espacioDisponible = Math.max(0, this.estado.capacidadAcopioKg - this.estado.stockAcopioKg);
      excedenteIngresadoAcopio = Math.min(excedenteNetoHuertas, espacioDisponible);
      mermaExcedenteNoAcopiado = excedenteNetoHuertas - excedenteIngresadoAcopio; // Cuello de botella logístico
    } else {
      // Sin acopio formal, solo se logra colocar un 20% en venta informal directa
      excedenteIngresadoAcopio = excedenteNetoHuertas * 0.20;
      mermaExcedenteNoAcopiado = excedenteNetoHuertas * 0.80;
    }

    let stockTotalParaVenta = this.estado.stockAcopioKg + excedenteIngresadoAcopio;
    const mermasAcopioKg = stockTotalParaVenta * this.params.tasa_merma_acopio;
    stockTotalParaVenta -= mermasAcopioKg;

    // 5. Ventas institucionales (Comedores comunitarios E09) y Feria E08
    let ventasComedoresKg = 0;
    let ventasFeriaKg = 0;

    if (this.estado.feriaActiva) {
      // Feria semanal absorbe hasta un 25% del stock disponible
      ventasFeriaKg = Math.min(stockTotalParaVenta * 0.25, 1200);
      stockTotalParaVenta -= ventasFeriaKg;
    }

    // Comedores comunitarios tienen demanda prioritaria de hortalizas frescas
    const demandaComedores = 1500;
    ventasComedoresKg = Math.min(stockTotalParaVenta * 0.35, demandaComedores);
    stockTotalParaVenta -= ventasComedoresKg;

    // 6. Elección de Proveedor por parte de Tiendas de Barrio (E07)
    // Función de utilidad multicriterio
    const pMax = 5000;
    const volRef = 500;

    const uMayorista = (
      this.params.peso_precio * (1 - precioMayActual / pMax) +
      this.params.peso_credito * 0.70 +      // Mayoristas ofrecen crédito informal
      this.params.peso_vol_minimo * 0.40 +   // Exigen comprar por bulto/huacal
      this.params.peso_horario * 0.85 +      // Corabastos abre a las 2:00 AM
      this.params.peso_confianza * 0.80      // Relación comercial histórica
    );

    const uLocal = (
      this.params.peso_precio * (1 - precioLocActual / pMax) +
      this.params.peso_credito * (this.estado.bavariaActivo ? 0.65 : 0.25) + // Bavaria fondea crédito rotativo
      this.params.peso_vol_minimo * 0.90 +   // Huertas permiten comprar pequeñas canastillas
      this.params.peso_horario * (this.estado.acopioActivo ? 0.75 : 0.30) +
      this.params.peso_confianza * this.estado.confianzaLocal
    );

    // Modelo Logit Multinomial (probabilidad de elección de la red local)
    const tau = 0.22; // Parámetro de dispersión de elección
    const expLocal = Math.exp(uLocal / tau);
    const expMay = Math.exp(uMayorista / tau);
    const probComprarLocal = expLocal / (expLocal + expMay);

    // Demanda neta de tiendas de barrio
    const demandaTiendasKg = Math.max(0, demandaTotal - ventasComedoresKg - ventasFeriaKg);
    const demandaTiendasLocalDeseada = demandaTiendasKg * probComprarLocal;

    // Asignación real según disponibilidad en stock de acopio
    const ventasTiendasKg = Math.min(stockTotalParaVenta, demandaTiendasLocalDeseada);
    stockTotalParaVenta -= ventasTiendasKg;

    // El faltante que las tiendas querían de la red local pero no había stock se va al mayorista o queda desatendido
    const deficitLocal = demandaTiendasLocalDeseada - ventasTiendasKg;
    const demandaTiendasMayoristaDeseada = (demandaTiendasKg * (1 - probComprarLocal)) + deficitLocal;

    // Disponibilidad mayorista afectada por choques
    const comprasMayoristaKg = demandaTiendasMayoristaDeseada * factorDispMay;
    const desabastecimientoKg = demandaTiendasMayoristaDeseada - comprasMayoristaKg;

    // Stock final en acopio
    const stockFinalAcopio = Math.max(0, stockTotalParaVenta);
    this.estado.stockAcopioKg = stockFinalAcopio;

    // 7. Dinámica de confianza comercial
    if (demandaTiendasLocalDeseada > 0) {
      const tasaCumplimiento = ventasTiendasKg / demandaTiendasLocalDeseada;
      if (tasaCumplimiento >= 0.90) {
        this.estado.confianzaLocal = Math.min(0.95, this.estado.confianzaLocal + 0.015);
      } else {
        this.estado.confianzaLocal = Math.max(0.10, this.estado.confianzaLocal - 0.025);
      }
    }

    // 8. Cálculo de indicadores globales
    const volumenLocalTotalConsumido = autoconsumoKg + ventasTiendasKg + ventasFeriaKg + ventasComedoresKg;
    const volumenTotalConsumidoEnKennedy = volumenLocalTotalConsumido + comprasMayoristaKg;
    const participacionLocalPct = volumenTotalConsumidoEnKennedy > 0 ? (volumenLocalTotalConsumido / volumenTotalConsumidoEnKennedy) * 100 : 0;
    const dependenciaCorabastosPct = 100 - participacionLocalPct;
    const tasaDesabastecimientoPct = demandaTotal > 0 ? (desabastecimientoKg / demandaTotal) * 100 : 0;

    const mermasTotalKg = mermasHuertaKg + mermasAcopioKg + mermaExcedenteNoAcopiado;

    // Actualización de estado
    this.estado.produccionSemanalKg = cosechaTotalSemana;
    this.estado.autoconsumoSemanalKg = autoconsumoKg;
    this.estado.volumenLocalVendidoKg = ventasTiendasKg + ventasFeriaKg + ventasComedoresKg;
    this.estado.volumenMayoristaCompradoKg = comprasMayoristaKg;
    this.estado.demandaDesatendidaKg = desabastecimientoKg;
    this.estado.participacionLocalPct = participacionLocalPct;
    this.estado.dependenciaCorabastosPct = dependenciaCorabastosPct;
    this.estado.tasaDesabastecimientoPct = tasaDesabastecimientoPct;
    this.estado.mermasTotalKg = mermasTotalKg;

    // 9. Verificación estricta de balance de masa
    if (massTracker) {
      massTracker.auditarAlimentos({
        semana: sem,
        stockInicialKg: stockInicialAcopio,
        stockFinalKg: stockFinalAcopio,
        produccionHuertasKg: cosechaTotalSemana,
        comprasMayoristaKg: 0, // El flujo mayorista no entra a la bodega del acopio local
        autoconsumoKg,
        ventasTiendasKg,
        ventasFeriaKg,
        entregasComedoresKg: ventasComedoresKg,
        mermasHuertaKg: mermasHuertaKg + mermaExcedenteNoAcopiado,
        mermasAcopioKg
      });
    }

    return {
      semana: sem,
      produccion_kg: Math.round(cosechaTotalSemana),
      autoconsumo_kg: Math.round(autoconsumoKg),
      ventas_locales_kg: Math.round(this.estado.volumenLocalVendidoKg),
      compras_mayorista_kg: Math.round(comprasMayoristaKg),
      desabastecimiento_kg: Math.round(desabastecimientoKg),
      participacion_local_pct: Number(participacionLocalPct.toFixed(2)),
      dependencia_corabastos_pct: Number(dependenciaCorabastosPct.toFixed(2)),
      confianza_local: Number(this.estado.confianzaLocal.toFixed(3)),
      stock_acopio_kg: Math.round(stockFinalAcopio),
      mermas_total_kg: Math.round(mermasTotalKg),
      estres_activo: hayEstresSemana,
      tipo_estres: tipoEstresSemana,
      precio_mayorista_actual: Math.round(precioMayActual),
      precio_local_actual: Math.round(precioLocActual),
      demanda_total_kg: Math.round(demandaTotal)
    };
  }
}
