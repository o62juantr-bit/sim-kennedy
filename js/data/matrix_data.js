/**
 * Integración de Datos de la Matriz final · Kennedy
 * Hojas: NODOS_RED, ARISTAS_RED, ENLACES_GEO, PARAM_GEO, VARIABLES_DS, ENLACES_CAUSALES
 */

export const DATOS_MATRIZ = {
  meta: {
    estrategia_principal: 'Bavaria Común como nodo de conocimiento y extensión (D12/D13)',
    objetivo_general: 'Modelo territorial de soberanía alimentaria y soporte socioecológico en Kennedy',
    nodo_hegemonico_actual: 'Corabastos E17 (abastece >94% de alimentos según SIPSA 2025)'
  },

  // Parámetros geográficos y umbrales (PARAM_GEO)
  parametros_geo: {
    dmax_junto_obligatoria_m: { valor: 150, unidad: 'm', fuente: 'POR VERIFICAR' },
    dmax_junto_deseable_m: { valor: 500, unidad: 'm', fuente: 'Isócrona caminable 5-7 min' },
    dmin_separado_m: { valor: 250, unidad: 'm', fuente: 'POR VERIFICAR' },
    dmax_con_barrera_m: { valor: 150, unidad: 'm', fuente: 'POR VERIFICAR' },
    dmin_separado_con_conector_m: { valor: 50, unidad: 'm', fuente: 'POR VERIFICAR' }
  },

  // Enlaces georreferenciados principales (muestra de ENLACES_GEO)
  enlaces_geo: [
    { id: 'LK-001', origen: 'E01', destino: 'E06', flujo: 'EXCEDENTES', modo: 'A PIE CARRETA', dist_m: 942, prioridad_bavaria: false },
    { id: 'LK-002', origen: 'E02', destino: 'E06', flujo: 'EXCEDENTES', modo: 'BICICLETA CARGA', dist_m: 1369, prioridad_bavaria: false },
    { id: 'LK-003', origen: 'E03', destino: 'E06', flujo: 'EXCEDENTES', modo: 'A PIE CARRETA', dist_m: 409, prioridad_bavaria: false },
    { id: 'LK-004', origen: 'E04', destino: 'E06', flujo: 'EXCEDENTES', modo: 'A PIE CARRETA', dist_m: 1425, prioridad_bavaria: false },
    { id: 'LK-005', origen: 'E05', destino: 'E06', flujo: 'EXCEDENTES', modo: 'BICICLETA CARGA', dist_m: 1267, prioridad_bavaria: false },
    { id: 'LK-006', origen: 'E05', destino: 'E10', flujo: 'ORGANICOS', modo: 'A PIE', dist_m: 205, prioridad_bavaria: false },
    { id: 'LK-008', origen: 'E06', destino: 'E08', flujo: 'EXCEDENTES', modo: 'A PIE', dist_m: 65, prioridad_bavaria: false },
    { id: 'LK-009', origen: 'E06', destino: 'E07', flujo: 'EXCEDENTES', modo: 'BICI-CARGO', dist_m: 409, prioridad_bavaria: false },
    { id: 'LK-010', origen: 'E06', destino: 'E09', flujo: 'EXCEDENTES', modo: 'BICI-CARGO', dist_m: 832, prioridad_bavaria: false },
    { id: 'LK-011', origen: 'E17', destino: 'E07', flujo: 'INSUMOS CENTRAL', modo: 'VEHICULO LIVIANO', dist_m: 887, prioridad_bavaria: false },
    { id: 'LK-012', origen: 'E17', destino: 'E09', flujo: 'INSUMOS CENTRAL', modo: 'VEHICULO LIVIANO', dist_m: 836, prioridad_bavaria: false },
    { id: 'LK-013', origen: 'E04', destino: 'E18', flujo: 'FAUNA / AMORTIGUACIÓN', modo: 'LIBRE', dist_m: 154, prioridad_bavaria: false },
    { id: 'LK-015', origen: 'E12', destino: 'E13', flujo: 'MATERIAL EN PROCESO', modo: 'ESCLUSA', dist_m: 40, prioridad_bavaria: false },
    { id: 'LK-016', origen: 'E13', destino: 'E14', flujo: 'PROTEÍNA AUTORIZADA', modo: 'ZONA LIMPIA', dist_m: 102, prioridad_bavaria: false },
    { id: 'LK-019', origen: 'E14', destino: 'E07', flujo: 'PROTEÍNA HONGOS', modo: 'VEHICULO LIVIANO', dist_m: 2858, prioridad_bavaria: false },
    { id: 'LK-020', origen: 'E14', destino: 'E09', flujo: 'PROTEÍNA HONGOS', modo: 'VEHICULO LIVIANO', dist_m: 1631, prioridad_bavaria: false },
    { id: 'LK-021', origen: 'E10', destino: 'E05', flujo: 'COMPOST RETORNO', modo: 'A PIE', dist_m: 205, prioridad_bavaria: false },
    { id: 'LK-022', origen: 'E10', destino: 'E12', flujo: 'SUSTRATO PASTEURIZADO', modo: 'VEHICULO LIVIANO', dist_m: 1508, prioridad_bavaria: false },
    { id: 'LK-024', origen: 'E15', destino: 'E05', flujo: 'SEMILLAS CONOCIMIENTO', modo: 'A PIE', dist_m: 40, prioridad_bavaria: false },
    // Enlaces de Extensión de Bavaria Común (Prioridad Bavaria)
    { id: 'LK-025', origen: 'E19', destino: 'E01', flujo: 'CONOCIMIENTO FORMADORES', modo: 'EXTENSION', dist_m: 3483, prioridad_bavaria: true },
    { id: 'LK-026', origen: 'E19', destino: 'E02', flujo: 'CONOCIMIENTO FORMADORES', modo: 'EXTENSION', dist_m: 1203, prioridad_bavaria: true },
    { id: 'LK-027', origen: 'E19', destino: 'E03', flujo: 'CONOCIMIENTO FORMADORES', modo: 'EXTENSION', dist_m: 2136, prioridad_bavaria: true },
    { id: 'LK-028', origen: 'E19', destino: 'E04', flujo: 'CONOCIMIENTO FORMADORES', modo: 'EXTENSION', dist_m: 1138, prioridad_bavaria: true },
    { id: 'LK-029', origen: 'E19', destino: 'E05', flujo: 'CONOCIMIENTO FORMADORES', modo: 'EXTENSION', dist_m: 1448, prioridad_bavaria: true },
    { id: 'LK-030', origen: 'E01', destino: 'E19', flujo: 'INFORMACION RETORNO', modo: 'REGISTROS', dist_m: 3483, prioridad_bavaria: true },
    { id: 'LK-031', origen: 'E02', destino: 'E19', flujo: 'INFORMACION RETORNO', modo: 'REGISTROS', dist_m: 1203, prioridad_bavaria: true },
    { id: 'LK-035', origen: 'E19', destino: 'E20', flujo: 'CONOCIMIENTO PRACTICA', modo: 'A PIE', dist_m: 144, prioridad_bavaria: true },
    { id: 'LK-038', origen: 'E19', destino: 'E15', flujo: 'CONOCIMIENTO SEMILLAS', modo: 'BICI-ENLACE', dist_m: 1409, prioridad_bavaria: true },
    { id: 'LK-040', origen: 'E19', destino: 'E11', flujo: 'CONOCIMIENTO GOBIERNO', modo: 'ASAMBLEA', dist_m: 2726, prioridad_bavaria: true }
  ],

  // Parámetros y variables de Dinámica de Sistemas (VARIABLES_DS)
  variables_ds: {
    STK01: { nombre: 'Huertas activas', unidad: 'huertas', tipo: 'Stock' },
    STK02: { nombre: 'Cosecha disponible', unidad: 'kg', tipo: 'Stock' },
    STK03: { nombre: 'Producto en acopio', unidad: 'kg', tipo: 'Stock' },
    STK04: { nombre: 'Capacidad de acopio', unidad: 'kg/sem', tipo: 'Stock' },
    STK05: { nombre: 'Participantes activos', unidad: 'personas', tipo: 'Stock' },
    STK06: { nombre: 'Fondo reinversión excedentes', unidad: 'COP', tipo: 'Stock' },
    STK07: { nombre: 'Conocimiento compartido', unidad: 'índice 0-1', tipo: 'Stock' },
    STK08: { nombre: 'Orgánicos en compostaje', unidad: 'kg', tipo: 'Stock' },
    STK09: { nombre: 'Inventario proteína hongos', unidad: 'kg', tipo: 'Stock' },
    STK10: { nombre: 'Presión sobre humedal', unidad: 'índice 0-1', tipo: 'Stock' },
    STK11: { nombre: 'Promotores formados activos', unidad: 'personas', tipo: 'Stock' }
  }
};
