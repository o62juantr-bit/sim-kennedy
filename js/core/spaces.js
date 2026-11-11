/**
 * Catálogo de Espacios Georreferenciados (E01 a E20)
 * Fuente: Matriz final · Kennedy (Hojas Espacios, PARAM_GEO y ENLACES_GEO)
 */

export const ESPACIOS = {
  E01: {
    id: 'E01',
    nombre: 'Huerta en vivienda de asentamiento informal',
    tipo: 'huerta_asentamiento',
    categoria: 'Producción',
    upz: 'UPZ 80 Corabastos',
    barrio: 'Patio Bonito II',
    lat: 4.6248,
    lon: -74.1662,
    cota_msnm: 2548,
    area_tipica_m2: 60, // rango 40 - 80 m²
    n_nodos_red: 83,
    color: '#16a34a',
    descripcion: 'Cultivo en patios, techos y lotes de viviendas informales; producción para autoconsumo y excedentes.'
  },
  E02: {
    id: 'E02',
    nombre: 'Huerta en vivienda de altura',
    tipo: 'huerta_altura',
    categoria: 'Producción',
    upz: 'UPZ 78 Tintal Norte',
    barrio: 'Ciudad Tintal',
    lat: 4.6415,
    lon: -74.1538,
    cota_msnm: 2547,
    area_tipica_m2: 250, // rango 150 - 400 m²
    n_nodos_red: 70,
    color: '#22c55e',
    descripcion: 'Cultivo en cubiertas, balcones y zonas comunes de conjuntos en propiedad horizontal.'
  },
  E03: {
    id: 'E03',
    nombre: 'Huerta en terreno baldío',
    tipo: 'huerta_baldio',
    categoria: 'Producción',
    upz: 'UPZ 80 Corabastos',
    barrio: 'Dindalito',
    lat: 4.6342,
    lon: -74.1585,
    cota_msnm: 2546,
    area_tipica_m2: 900, // rango 600 - 1200 m²
    n_nodos_red: 1,
    color: '#84cc16',
    descripcion: 'Cultivo comunitario en lotes vacíos con uso temporal acordado con propietarios o distrito.'
  },
  E04: {
    id: 'E04',
    nombre: 'Huerta en el borde de la ronda del humedal',
    tipo: 'huerta_borde',
    categoria: 'Producción / Amortiguación',
    upz: 'UPZ 78 Tintal Norte',
    barrio: 'Borde Humedal El Burro',
    lat: 4.6398,
    lon: -74.1512,
    cota_msnm: 2545,
    area_tipica_m2: 450, // franja 15 - 30 m de amortiguación
    n_nodos_red: 19,
    color: '#059669',
    descripcion: 'Franja de amortiguación agroecológica sujeta a norma ambiental; sin agroquímicos y sin invadir el núcleo.'
  },
  E05: {
    id: 'E05',
    nombre: 'Huerta comunitaria o escolar existente',
    tipo: 'huerta_existente',
    categoria: 'Producción / Nodo Semilla',
    upz: 'UPZ 78 Tintal Norte',
    barrio: 'Hospital Pediátrico Tintal / Tingua Azul',
    lat: 4.6421,
    lon: -74.1568,
    cota_msnm: 2547,
    area_tipica_m2: 1100, // rango 800 - 1500 m²
    n_nodos_red: 62,
    color: '#15803d',
    descripcion: 'Núcleo de formación, custodia de semillas y bancales consolidados de la red existente.'
  },
  E06: {
    id: 'E06',
    nombre: 'Punto de acopio y distribución de excedentes',
    tipo: 'logistica_acopio',
    categoria: 'Distribución',
    upz: 'UPZ 80 Corabastos',
    barrio: 'Patio Bonito Central',
    lat: 4.6315,
    lon: -74.1610,
    cota_msnm: 2546,
    area_tipica_m2: 180, // rango 120 - 250 m²
    n_nodos_red: 22,
    color: '#0284c7',
    descripcion: 'Recepción, pesaje, control de calidad y despacho de los excedentes agrícolas de las huertas.'
  },
  E07: {
    id: 'E07',
    nombre: 'Tienda de barrio compradora',
    tipo: 'comercio_tienda',
    categoria: 'Comercio',
    upz: 'UPZ 80 Corabastos',
    barrio: 'Llano Grande',
    lat: 4.6288,
    lon: -74.1635,
    cota_msnm: 2548,
    area_tipica_m2: 45, // rango 30 - 60 m²
    n_nodos_red: 72,
    color: '#38bdf8',
    descripcion: 'Puntos de venta minorista que eligen entre el proveedor mayorista (Corabastos) y la red de huertas.'
  },
  E08: {
    id: 'E08',
    nombre: 'Punto de venta directa (feria barrial)',
    tipo: 'comercio_feria',
    categoria: 'Comercio',
    upz: 'UPZ 80 Corabastos',
    barrio: 'Parque Vecinal Patio Bonito',
    lat: 4.6318,
    lon: -74.1605,
    cota_msnm: 2546,
    area_tipica_m2: 400, // rango 300 - 600 m²
    n_nodos_red: 7,
    color: '#06b6d4',
    descripcion: 'Espacio de plaza efímera semanal para venta directa y trueque entre huerteros y hogares.'
  },
  E09: {
    id: 'E09',
    nombre: 'Comedor comunitario o escolar',
    tipo: 'consumo_institucional',
    categoria: 'Consumo',
    upz: 'UPZ 79 Calandaima',
    barrio: 'Colegio Distrital Calandaima',
    lat: 4.6360,
    lon: -74.1550,
    cota_msnm: 2547,
    area_tipica_m2: 280, // rango 200 - 350 m²
    n_nodos_red: 4,
    color: '#f59e0b',
    descripcion: 'Receptor institucional de alimentos frescos de huertas y proteína fúngica de Bavaria.'
  },
  E10: {
    id: 'E10',
    nombre: 'Estación de compostaje barrial',
    tipo: 'gestion_organicos',
    categoria: 'Transformación',
    upz: 'UPZ 78 Tintal Norte',
    barrio: 'Área de servicios aislada',
    lat: 4.6435,
    lon: -74.1580,
    cota_msnm: 2546,
    area_tipica_m2: 350, // rango 250 - 500 m²
    n_nodos_red: 37,
    color: '#b45309',
    descripcion: 'Centro de transformación aerobia termófila y vermicompostaje de bio-residuos de hogares y huertas.'
  },
  E11: {
    id: 'E11',
    nombre: 'Salón de deliberación (salón comunal)',
    tipo: 'gobernanza_asamblea',
    categoria: 'Gobierno',
    upz: 'UPZ 80 Corabastos',
    barrio: 'Salón Comunal Patio Bonito',
    lat: 4.6302,
    lon: -74.1620,
    cota_msnm: 2548,
    area_tipica_m2: 180, // rango 150 - 220 m²
    n_nodos_red: 77,
    color: '#8b5cf6',
    descripcion: 'Sede de la Mesa de la Red de Huertas: rendición de cuentas, concertación de precios y rotación de vocerías.'
  },
  E12: {
    id: 'E12',
    nombre: 'Distrito biotecnológico: cultivo de hongos',
    tipo: 'biotecnologia_hongos',
    categoria: 'Biotecnología',
    upz: 'UPZ 45 Carvajal',
    barrio: 'Complejo Bavaria Común',
    lat: 4.6475,
    lon: -74.1450,
    cota_msnm: 2550,
    area_tipica_m2: 500, // rango 300 - 800 m²
    n_nodos_red: 29,
    color: '#ec4899',
    descripcion: 'Salas con temperatura y humedad controlada para cultivo de micelio y setas orellanas comestibles.'
  },
  E13: {
    id: 'E13',
    nombre: 'Distrito biotecnológico: laboratorio y control de calidad',
    tipo: 'biotecnologia_lab',
    categoria: 'Biotecnología',
    upz: 'UPZ 45 Carvajal',
    barrio: 'Módulo técnico Bavaria',
    lat: 4.6478,
    lon: -74.1448,
    cota_msnm: 2550,
    area_tipica_m2: 150, // rango 120 - 200 m²
    n_nodos_red: 13,
    color: '#d946ef',
    descripcion: 'Análisis microbiológico por lote y garantía de inocuidad de la proteína fúngica y compost.'
  },
  E14: {
    id: 'E14',
    nombre: 'Distrito biotecnológico: empaque y venta',
    tipo: 'biotecnologia_empaque',
    categoria: 'Biotecnología',
    upz: 'UPZ 45 Carvajal',
    barrio: 'Módulo exterior Bavaria',
    lat: 4.6472,
    lon: -74.1455,
    cota_msnm: 2550,
    area_tipica_m2: 300, // rango 250 - 450 m²
    n_nodos_red: 5,
    color: '#a855f7',
    descripcion: 'Deshidratado, empaque institucional y distribución de proteína de hongos a precio social.'
  },
  E15: {
    id: 'E15',
    nombre: 'Banco de semillas y centro de formación',
    tipo: 'conocimiento_semillas',
    categoria: 'Conocimiento',
    upz: 'UPZ 78 Tintal Norte',
    barrio: 'Anexo Huerta Tingua Azul',
    lat: 4.6423,
    lon: -74.1565,
    cota_msnm: 2547,
    area_tipica_m2: 100, // rango 80 - 140 m²
    n_nodos_red: 13,
    color: '#10b981',
    descripcion: 'Custodia comunitaria de semillas nativas y criollas; actúa como antena local conectada con Bavaria.'
  },
  E16: {
    id: 'E16',
    nombre: 'Calles y corredores de reparto barrial',
    tipo: 'red_vial',
    categoria: 'Conectividad',
    upz: 'UPZ 78-79-80 (Inter-UPZ)',
    barrio: 'Eje conector Tintal-Corabastos',
    lat: 4.6350,
    lon: -74.1570,
    cota_msnm: 2546,
    area_tipica_m2: 12000,
    n_nodos_red: 46,
    color: '#64748b',
    descripcion: 'Malla vial barrial y ciclorrutas para transporte en bici-cargos y tracción liviana sin emisión.'
  },
  E17: {
    id: 'E17',
    nombre: 'Corabastos (Proveedor Mayorista Exógeno)',
    tipo: 'mayorista_central',
    categoria: 'Abastecimiento Hegemónico',
    upz: 'UPZ 80 Corabastos',
    barrio: 'Corabastos Puertas 4 y 6',
    lat: 4.6285,
    lon: -74.1555,
    cota_msnm: 2548,
    area_tipica_m2: 420000,
    n_nodos_red: 72,
    color: '#ef4444',
    descripcion: 'Central mayorista de la cual depende actualmente el 94% del abastecimiento; fija precios y volumen.'
  },
  E18: {
    id: 'E18',
    nombre: 'Núcleo del humedal (sin uso productivo)',
    tipo: 'reserva_ecologica',
    categoria: 'Ecosistema',
    upz: 'UPZ 78 Tintal Norte',
    barrio: 'ZMPA Humedal El Burro',
    lat: 4.6405,
    lon: -74.1500,
    cota_msnm: 2544,
    area_tipica_m2: 188000, // 18.8 hectáreas
    n_nodos_red: 61,
    color: '#0284c7',
    descripcion: 'Cuerpo de agua y juncales protegidos; hábitat estricto de avifauna donde NO se cultiva.'
  },
  E19: {
    id: 'E19',
    nombre: 'Bavaria Común: nodo de conocimiento',
    tipo: 'conocimiento_bavaria',
    categoria: 'Estrategia Principal',
    upz: 'UPZ 45 Carvajal',
    barrio: 'Predio Cervecería Bavaria',
    lat: 4.6481,
    lon: -74.1452,
    cota_msnm: 2550,
    area_tipica_m2: 2500,
    n_nodos_red: 82,
    color: '#eab308',
    descripcion: 'Aulas-taller, extensión agroecológica y asamblea: forma promotores y envía conocimiento a E01–E05.'
  },
  E20: {
    id: 'E20',
    nombre: 'Bavaria Común: huerta-vivero demostrativo',
    tipo: 'vivero_demostrativo',
    categoria: 'Estrategia Principal',
    upz: 'UPZ 45 Carvajal',
    barrio: 'Predio Cervecería Bavaria',
    lat: 4.6469,
    lon: -74.1447,
    cota_msnm: 2550,
    area_tipica_m2: 3000,
    n_nodos_red: 11,
    color: '#ca8a04',
    descripcion: 'Prototipos de las cuatro tipologías de huertas, ensayos de compost y multiplicación de plántulas.'
  }
};

// Cálculo de distancia ortodrómica en metros (fórmula de Haversine)
export function distanciaMetros(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Radio de la Tierra en metros
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function distanciaEspacios(idA, idB) {
  const a = ESPACIOS[idA];
  const b = ESPACIOS[idB];
  if (!a || !b) return 0;
  return distanciaMetros(a.lat, a.lon, b.lat, b.lon);
}
