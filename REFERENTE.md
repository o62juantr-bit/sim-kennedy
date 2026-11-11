# Análisis Técnico y Arquitectónico del Referente: REN3D Kennedy

**URL analizada:** `https://anasoficasca-code.github.io/REN3D-realista/index.html?modo=kennedy`  
**Fecha de inspección:** 11 de noviembre de 2026  
**Documento de Fase 0:** Proyecto de Simulación y Modelamiento Territorial para Kennedy (Bogotá).

---

## 1. Tecnologías y Librerías Identificadas

A través de la inspección de `<script type="importmap">`, del código modular y del DOM del referente, se identificaron las siguientes tecnologías:

1. **Motor de Renderizado 3D Principal:**
   - **Three.js (`v0.160.0`):** Utilizado como núcleo de escena, cámaras, luces, materiales, mallas instanciadas (`InstancedMesh`) y shaders procedurales.
   - **Post-processing (`v6.36.0`):** Empleado para pases de post-procesado de cámara (efectos térmicos FLIR, visión nocturna NVG, CRT vintage).
   - **N8AO (`v1.8.2`):** Algoritmo eficiente de Screen Space Ambient Occlusion (SSAO) para sombrear esquinas y contacto de edificios y árboles.
   - **Gaussian Splats 3D (`@mkkellogg/gaussian-splats-3d v0.4.7`):** Usado para renderizar nubes de puntos de radiancia (`humedal-v3.splat` y `humedal-hd.splat`) para visualización fotogramétrica realista de sectores del humedal.
   - **3D Tiles Renderer (`3d-tiles-renderer v0.3.45`):** Soporte para streaming de Google Photorealistic 3D Tiles / OGC 3D Tiles.

2. **Librería de Mapas y Cartografía (2D/Vectorial):**
   - **MapLibre GL JS (Reemplazado por Proxy):** En versiones previas el proyecto integraba MapLibre; sin embargo, en la versión actual de la Maqueta 3D, el autor reemplazó la instancia completa de mapa por un objeto `Proxy` virtual (`const map = new Proxy({}, ...)`), delegando el 100% del renderizado a un lienzo Three.js (`#todo3d canvas`). Esto se hizo explícitamente para optimizar recursos y evitar que el motor de mapas 2D se ejecutara en segundo plano sin verse.
   - **Tilesets Vectoriales:** Estilo Mapbox/MapLibre v8 consumiendo OpenFreeMap (`https://tiles.openfreemap.org/planet`) para huellas de edificios (`building`), uso de suelo (`landcover`) y masas de agua (`water`).
   - **Tilesets Ráster:** Esri World Imagery (`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`) con respaldo en CARTO Voyager.

---

## 2. Carga de Datos y Arquitectura de Red

1. **Gestión de Peticiones y Caché en Memoria:**
   - Implementa un patrón singleton funcional de caché:
     ```javascript
     window.cargarJSON = window.cargarJSON || ((c) => (u) => c[u] || (c[u] = fetch(u).then(r => {
       if (!r.ok) throw new Error(u + ' ' + r.status);
       return r.json();
     })))({});
     ```
   - Cada archivo (`giro_sim.json`, `trees.json`, `estrategias.json`, `biotica.json`, `actores.json`, `bavaria.json`) se solicita una sola vez mediante `fetch()` asíncrono y se comparte entre módulos, evitando descargas redundantes.

2. **Carga Modular Dinámica (ES Modules):**
   - El código se fragmenta en módulos temáticos que se importan bajo demanda mediante `import('./data3d/...')`:
     - `giro_sim.js`: Motor de sintaxis espacial y simulación de agentes urbanos.
     - `biotica.js`: Red biológica de aves, flora, fauna e interacciones ecosistémicas.
     - `actores.js`: Visualización espacial de las redes de actores humanos y no humanos del Excel.
     - `estrategias.js`: Capas volumétricas y de suelo para las propuestas territoriales E1–E9.
     - `bavaria_plan.js` y `corabastos_plan.js`: Submodelos de intervención arquitectónica en naves y plataformas.
     - `cielo.js`: Iluminación diurna/nocturna coordinada con reloj de 24 horas.

3. **Geometrías Procedurales / Lazy Geometry:**
   - Las geometrías de las estrategias (techos triangulados con `THREE.ShapeUtils.triangulateShape` y surcos hidropónicos) no se compilan al arrancar, sino únicamente la primera vez que el usuario enciende el toggle respectivo.

---

## 3. Sistema de Coordenadas y Transformaciones

El proyecto maneja dos sistemas coordinados acoplados mediante una proyección plana local optimizada:

1. **Coordenadas Geográficas (WGS84 EPSG:4326):**
   - Centro de referencia Kennedy: Longitud `-74.1620`, Latitud `4.6252`, Elevación ~2.550 msnm.
2. **Sistema Cartesiano Local Métrico (Three.js):**
   - Ejes: $X$ = Este (metros), $Y$ = Altura/Vertical (metros), $Z$ = Sur/Norte (metros).
   - Conversión de grados a metros calculada en el origen local:
     $$\text{MX} = 111320 \cdot \cos(\text{lat} \cdot \pi / 180) \approx 110.954\text{ m/grado longitud}$$
     $$\text{MY} = 110540\text{ m/grado latitud}$$
   - Matriz de calibración contra la malla vial de OpenStreetMap:
     `GEO = { LAT0: 4.63, LNG0: -74.17, EX: -5193.24, EY: -2090.06 }`
   - Transformación de espacio 3D a coordenadas geográficas:
     `dataToLL(x, y) = [LNG0 + (x + EX) / MXg, LAT0 + (y + EY) / MYg]`
   - Origen relativo para submodelos: `OX = 2095.67, OZ = -109.06, Y0 = 2.0`.

---

## 4. Estructura de Capas

El visor organiza el territorio en estratos independientes con control de render order:

1. **Capa Terreno Base:**
   - Foto base 3D fotorrealista (malla de Google Tiles / fotogrametría) alternable con un botón de interfaz (`#fb-btn`).
   - Malla de agua procedural: elipses georreferenciadas (Lago Timiza, Humedal El Burro, Capellanía) con shader animado de ondas superficiales (`uTime`, `uSize`).
2. **Capa Edificaciones:**
   - Huellas de edificios extruidas según atributos OpenStreetMap (`levels * 3.2 m` o `render_height`).
3. **Capa Vegetación (Arbolado Urbano):**
   - Instanciación masiva (`InstancedMesh`) basada en rectángulos con conteos específicos y datos del censo SIGAU de arbolado urbano del Jardín Botánico.
4. **Capa de Propuestas Territoriales (Estrategias E1–E9):**
   - Lotes a ras del suelo, huertas en cubiertas a la cota del techo de cada edificio, puntos de equipamiento (postes con esferas coloreadas) y texturas de bancales.
5. **Capa de Redes de Actores:**
   - Nodos representados como esferas 3D situadas sobre las coordenadas de los espacios (E01–E20), con radio dependiente del grado de conectividad y color según clase (`Rol previo`, `Rol propuesto`, `Organismo`, `Recurso`, `Infraestructura`, `Entorno`). Aristas curvadas con pulsos de partículas direccionales.
6. **Capa Biótica y Fauna:**
   - Agentes biológicos móviles y aristas de interacción ecológica temporales entre especies de aves, polinizadores, árboles y humedales.

---

## 5. Convenciones de Interfaz (HUD, Paneles, Toggles)

1. **HUD Táctico Superior:**
   - Esquina superior izquierda (`#hud-l`): Identificador del modelo, modo activo (`#modebadge`), descripción sintética.
   - Esquina superior derecha (`#hud-r`): Telemetría en tiempo real (coordenadas del punto observado, rumbo, elevación de cámara, GSD).
2. **Barra de Navegación y Modos:**
   - Botonera inferior flotante con estética de recorte poligonal (`clip-path: polygon(...)`), fondo translúcido con desenfoque (`backdrop-filter: blur(10px)`), tipografía monoespaciada con estilo técnico y acentos en tonos cian (`#7dd3fc`) y esmeralda (`#34d399`).
   - Modos de visualización conmutables: *Maqueta*, *Render / Foto base*, *Árboles*, *Agua*, *Aves / Biótica*, *Noche / Día*, *Vista general*, *Modo a pie / Pájaro*.
3. **Control de Vuelo y Cámara:**
   - Controles híbridos: OrbitControls para vista orbital y motor de vuelo en primera persona con teclas `WASD` / flechas para traslación, `Q`/`E` o `Espacio`/`C` para elevación vertical, `Shift` para aceleración e interpolación suave (`lerp`).
4. **Paneles Laterales Desplegables:**
   - Paneles flotantes scrollables (`.gs-pan`, `#gevUI`) con listas de POIs, toggles de capas de estrategias, controles de reproducción temporal (play, pausa, velocidad x1 a x10) y leyendas jerárquicas.
5. **Sistema de Notificaciones (Toasts):**
   - Cartel central superior con autodestrucción por temporizador para orientar al usuario en cada cambio de vista o evento.

---

## 6. Implementación del Tráfico y las Aves

### A. Simulación de Tráfico Urbano (`simulador.js` / `giro_sim.js`)
- **Base Teórica:** Utiliza **Sintaxis Espacial** (análisis angular de segmentos derivado de *DepthmapX*, Bill Hillier). Las calles contienen valores precalculados de *integración* (accesibilidad global/peatonal) y *elección* (flujo vehicular pasante / *betweenness*).
- **Regla de Movimiento:** En cada nodo o intersección vial, los vehículos (carros, motos, camiones, bicis) evalúan los tramos salientes y seleccionan el siguiente con probabilidad ponderada por su valor de elección y la continuidad angular del giro.
- **Reloj y Jornadas:** La demanda vehicular varía según una curva de horarios de 24 horas (`JORNADAS`), simulando horas pico matutinas, diurnas y nocturnas.
- **Representación Gráfica:** Bloques instanciados procedurales que siguen las coordenadas de los ejes viales con seguimiento de velocidad media y cálculo de detenciones.

### B. Simulación de Aves y Fauna (`biotica.js`)
- **Base Teórica:** Basado en arquetipos de ecología del comportamiento y modelos multi-agente (Boids de Couzin 2002, Teorema del Valor Marginal de Charnov, Forrajeo de Lugar Central).
- **Tipología de Agentes de Avifauna:**
  - *Aves de percha* (Copetón, Mirla, Monjita, Torcaza): Ciclo de estado posado ⇄ vuelo; al despegar reclutan convecinas de su especie (bandada) con zona de repulsión y atracción direccional hacia especies vegetales asociadas en la red trófica.
  - *Colibríes:* Vuelo rápido directo a parches florales, cernido durante la manipulación y salida del parche cuando el néctar decae.
  - *Aves acuáticas* (Tingua bogotana, Pato turrio, Garza blanca): Patrón de caminata correlacionada en orillas y balsas de nado con dinámicas de alineación.
  - *Rapaces:* Planeo térmico circular en altura y picadas sobre presas (persecución dirigida con evasión).
- **Visualización de la Red Trófica:** Se trazan aristas dinámicas entre el agente animal y el parche/árbol con el que interactúa, coloreadas según el tipo de interacción (alimentación, refugio, dispersión de semillas, polinización).

---

## 7. Lo que NO se Pudo Determinar (Límites de la Inspección Externa)

De acuerdo con las reglas de honestidad metodológica, se declaran los siguientes aspectos que no pueden extraerse del frontend público:

1. **Generación del Servicio de 3D Tiles de Google:**
   - El endpoint o token que alimenta el streaming del modelo fotorrealista 3D de Google está encapsulado a través del renderizador compilado; no es accesible el script de ingestión original ni la infraestructura de proxy que resuelve las cuotas de API de Google.
2. **Scripts Offline de Preprocesamiento de Red:**
   - Los archivos `tools/kennedy_sim_datos.py` y `tools/biotica_build.js` mencionados en los encabezados son procesos ejecutados fuera de línea; el código de cálculo espacial directo en Python que extrajo la sintaxis espacial de las líneas de OpenStreetMap no está alojado en el cliente web.
3. **Modelo Digital de Terreno (DEM) Continuo:**
   - El código fuente incluye la nota explícita: *«sin fuente de relieve (los DEM gratuitos bloquean CORS); Kennedy es plano (~2.550 m)»*. Por lo tanto, no hay una malla tridimensional real de curvas de nivel del suelo; la cota es un plano horizontal simplificado a $Y = 0$.
4. **Calibración Empírica de Poblaciones de Aves:**
   - Varios parámetros de conteos y tiempos de forrajeo en `giro_sim.js` y `biotica.js` están etiquetados explícitamente en el código con el tag `[SUP]` (*Supuestos de escala para discutir*), indicando que no provienen de censos biológicos calibrados en terreno sino de estimaciones paramétricas del autor.

---

## 8. Conclusiones para Nuestro Simulador `sim-kennedy`

El referente demuestra que es posible lograr una experiencia visual inmersiva de alto impacto combinando un mapa base y renderizado 3D ligero. No obstante, para los requerimientos específicos de **Modelamiento Dinámico y Simulación** solicitados por la profesora:
- El modelo debe priorizar la **transparencia de las reglas**, el **balance de masa estricto**, la **reproducibilidad por semillas (Monte Carlo)** y la **evaluabilidad de los escenarios de soberanía alimentaria y abastecimiento**.
- Por ende, el núcleo del simulador debe ser desacoplado del motor visual: la lógica de agentes y stocks/flujos correrá de forma agnóstica a la vista, permitiendo visualización en mapa 2D interactivo inmediato (y capa 3D opcional inspirada en el referente), panel de parámetros para análisis de sensibilidad y exportación formal a CSV.
