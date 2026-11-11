/**
 * Definición de Escenarios de Simulación
 * Comparables lado a lado con parámetros configurables.
 */

export const ESCENARIOS = {
  // === SIMULACIÓN 1: ABASTECIMIENTO Y PROVEEDOR ===
  s1_sin_intervencion: {
    id: 's1_sin_intervencion',
    modulo: 1,
    nombre: 'Línea Base: Sin Intervención (Dependencia Corabastos)',
    descripcion: 'Abastecimiento tradicional hegemónico. Tiendas y comedores dependen en más del 94% de Corabastos.',
    parametros: {
      huertas_iniciales_e01: 5,
      huertas_iniciales_e02: 2,
      huertas_iniciales_e03: 0,
      huertas_iniciales_e04: 0,
      huertas_iniciales_e05: 15,
      acopio_activo: false,
      feria_activa: false,
      bavaria_activo: false,
      precio_mayorista_kg: 3200, // COP/kg
      precio_local_kg: 3400,
      capacidad_acopio_kg_sem: 0,
      confianza_inicial_local: 0.15,
      tasa_autoconsumo: 0.70
    }
  },

  s1_solo_huertas: {
    id: 's1_solo_huertas',
    modulo: 1,
    nombre: 'Escenario 1: Solo Huertas (Autoproducción sin Circuito)',
    descripcion: 'Se abren huertas en las 4 tipologías pero sin logística barrial; los excedentes se autoconsumen o se pierden.',
    parametros: {
      huertas_iniciales_e01: 40,
      huertas_iniciales_e02: 25,
      huertas_iniciales_e03: 1,
      huertas_iniciales_e04: 8,
      huertas_iniciales_e05: 35,
      acopio_activo: false,
      feria_activa: false,
      bavaria_activo: false,
      precio_mayorista_kg: 3200,
      precio_local_kg: 3000,
      capacidad_acopio_kg_sem: 0,
      confianza_inicial_local: 0.20,
      tasa_autoconsumo: 0.65
    }
  },

  s1_huertas_intercambio: {
    id: 's1_huertas_intercambio',
    modulo: 1,
    nombre: 'Escenario 2: Huertas + Intercambio Barrial (Acopio E06 y Feria E08)',
    descripcion: 'Se activa el punto de acopio y ferias semanales. Las tiendas y comedores empiezan a comprar excedentes locales.',
    parametros: {
      huertas_iniciales_e01: 60,
      huertas_iniciales_e02: 45,
      huertas_iniciales_e03: 1,
      huertas_iniciales_e04: 12,
      huertas_iniciales_e05: 50,
      acopio_activo: true,
      feria_activa: true,
      bavaria_activo: false,
      precio_mayorista_kg: 3200,
      precio_local_kg: 2700,
      capacidad_acopio_kg_sem: 3500,
      confianza_inicial_local: 0.40,
      tasa_autoconsumo: 0.45
    }
  },

  s1_mas_bavaria: {
    id: 's1_mas_bavaria',
    modulo: 1,
    nombre: 'Escenario 3: Propuesta Integral (+ Bavaria Común E19 y Distrito E12)',
    descripcion: 'Bavaria Común aporta extensión, semillas del banco E15, compostaje barrial y proteína de hongos, maximizando la autonomía.',
    parametros: {
      huertas_iniciales_e01: 83,
      huertas_iniciales_e02: 70,
      huertas_iniciales_e03: 1,
      huertas_iniciales_e04: 19,
      huertas_iniciales_e05: 62,
      acopio_activo: true,
      feria_activa: true,
      bavaria_activo: true,
      precio_mayorista_kg: 3200,
      precio_local_kg: 2500,
      capacidad_acopio_kg_sem: 6000,
      confianza_inicial_local: 0.60,
      tasa_autoconsumo: 0.40
    }
  },

  // === ESCENARIOS DE ESTRÉS TRANSVERSAL ===
  estres_choque_corabastos: {
    id: 'estres_choque_corabastos',
    modulo: 'transversal',
    nombre: 'Estrés Transversal: Choque de Precios / Bloqueo en Corabastos',
    descripcion: 'Simula paro agrario o crisis en la central: precio mayorista sube +65% y el volumen de Corabastos cae -55%, disparando el desabastecimiento.',
    parametros_estres: {
      tipo: 'choque_corabastos',
      semana_inicio: 15,
      duracion_semanas: 35,
      factor_precio_mayorista: 1.65,
      factor_disponibilidad_mayorista: 0.45
    }
  },

  estres_sequia: {
    id: 'estres_sequia',
    modulo: 'transversal',
    nombre: 'Estrés Transversal: Sequía Prolongada (Fenómeno de El Niño)',
    descripcion: 'Déficit hídrico del 70% en lluvia durante 35 semanas. Pone a prueba la retención de humedad por compostaje y bioinsumos de Bavaria.',
    parametros_estres: {
      tipo: 'sequia',
      semana_inicio: 15,
      duracion_semanas: 35,
      factor_lluvia: 0.30,
      impacto_sin_compost: 0.40 // Huertas sin compost pierden 60% de cosecha
    }
  },

  estres_crecimiento_poblacional: {
    id: 'estres_crecimiento_poblacional',
    modulo: 'transversal',
    nombre: 'Estrés Transversal: Crecimiento Acelerado de la Demanda (+35%)',
    descripcion: 'Incremento del 35% en hogares demandantes en Kennedy (de 25,000 kg a 33,750 kg/sem) a partir de la semana 15.',
    parametros_estres: {
      tipo: 'crecimiento_poblacional',
      semana_inicio: 15,
      duracion_semanas: 90,
      factor_demanda: 1.35
    }
  }
};
