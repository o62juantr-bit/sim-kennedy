# SIM-KENNEDY • Simulador Territorial de Soberanía Alimentaria y Soporte Socioecológico

Simulador territorial multi-agente y dinámico para la localidad de Kennedy (Bogotá D.C., Colombia), enfocado en la transición socioecológica, soberanía alimentaria, red comunitaria de huertas urbanas, distrito biotecnológico en Bavaria Común y gobernanza heterárquica.

Desarrollado para el curso de **Modelamiento Dinámico y Simulación** (Pontificia Universidad Javeriana).

---

## 1. Contexto y Objetivos del Proyecto

### 1.1 Objetivo General
Diseñar y evaluar un modelo territorial de soberanía alimentaria y soporte socioecológico para el intercambio de alimentos, subproductos orgánicos y saberes agroecológicos en la localidad de Kennedy.

### 1.2 Objetivos Específicos
1. **Instituto Biotecnológico de Bavaria Común:** Consolidar Bavaria Común (E19/E20) como clúster de conocimiento, biotecnología aplicada (cultivo de hongos comestibles/medicinales E12, laboratorio de bioinsumos E13 y empaque/distribución E14) y compostaje comunitario (E10).
2. **Red Descentralizada de Autoproducción y Comercio:** Fortalecer 4 tipologías de huertas urbanas (E01 asentamientos informales, E02 vivienda en altura, E03 baldíos urbanos y E04 ronda/borde del humedal La Vaca y Techo) articuladas a centros de acopio (E06), ferias itinerantes (E08), comedores comunitarios (E09) y tiendas de barrio.
3. **Restauración del Hábitat Ecosistémico:** Incrementar la conectividad paisajística y el índice de cobertura vegetal para proteger y fortalecer los corredores biológicos y la biodiversidad urbana nativa.

> **Principio de Evaluación:** El modelo es formal, explícito y evaluable. Está diseñado como herramienta de experimentación ("probar hipótesis y límites, no tener la razón"). Si una propuesta produce tensiones, cuellos de botella o desabastecimiento, ese resultado es académicamente riguroso y analizado como tal.

---

## 2. Arquitectura del Simulador

El sistema se compone de un **núcleo común** y **seis sub-modelos acoplados**:

```
                                 ┌────────────────────────┐
                                 │   SIM-KENNEDY CORE     │
                                 │ Reloj (t=1..104 sem)   │
                                 │ PRNG Mulberry32        │
                                 │ Espacios E01-E20       │
                                 │ Balance de Masa        │
                                 └───────────┬────────────┘
                                             │
      ┌──────────────────────┬───────────────┼───────────────┬──────────────────────┐
      │                      │               │               │                      │
┌─────▼──────┐         ┌─────▼──────┐  ┌─────▼──────┐  ┌─────▼──────┐         ┌─────▼──────┐
│  Módulo 1  │         │  Módulo 2  │  │  Módulo 3  │  │  Módulo 4  │         │ Módulos 5/6│
│Abastecim.  │◄───────►│Conocimiento│◄─┤ Residuos   │  │ Hábitat &  │         │Gobernanza &│
│y Comercio  │ kg alim.│ y Adopción │  │  Orgánicos │  │ Conectivid.│         │Suelo Urbano│
└────────────┘         └────────────┘  └────────────┘  └────────────┘         └────────────┘
```

### Núcleo Común
- **Paso de tiempo:** $\Delta t = 1$ semana. Horizonte estándar: 104 semanas (2 años agrícolas).
- **Estacionalidad:** Modelo bimodal andino de Bogotá (temporadas secas en ene-feb / jul-ago y lluviosas en mar-may / sep-nov).
- **Semilla pseudo-aleatoria:** Generador determinístico Mulberry32. Dos corridas con la misma semilla son idénticas bit a bit.
- **Monte Carlo:** Corridas estocásticas con $\ge 30$ semillas independientes, reportando la mediana y el rango intercuartílico (IQR: Q1 a Q3).
- **Balance de Masa Estricto:** Toda materia vegetal y bio-residuo está sujeto a conservación:
  $$\text{Stock}_{t} = \text{Stock}_{t-1} + \text{Entradas}_{t} - \text{Salidas}_{t} - \text{Pérdidas}_{t}$$

---

## 3. Catálogo Espacial (E01 - E20)

Integrado formalmente a partir de la `Matriz_final_Kennedy.xlsx`:

| ID | Nombre del Espacio | UPZ / Sector | Rol en el Sistema |
|---|---|---|---|
| **E01** | Huerta Asentamiento Informal | UPZ 80 Corabastos / El Amparo | Autoconsumo, resiliencia alimentaria |
| **E02** | Huerta Vivienda en Altura | UPZ 47 Kennedy Central | Micro-huertas de balcón, aromáticas |
| **E03** | Huerta Lote Baldío Recuperado | UPZ 80 Corabastos | Producción comunitaria en suelo recuperado |
| **E04** | Huerta Borde / Ronda Humedal | UPZ 82 Tintal Norte (La Vaca) | Buffer agroecológico y hábitat de aves |
| **E05** | Huerta Urbana Preexistente | UPZ 45 Carvajal | Nodo pionero comunitario |
| **E06** | Centro de Acopio y Transformación | UPZ 47 Kennedy Central | Consolidación, empaque y distribución |
| **E07** | Tienda de Barrio / Micromercado | UPZ 80 / UPZ 47 | Elección multicriterio de proveedor |
| **E08** | Plaza / Feria Barrial de Intercambio | UPZ 47 Kennedy Central | Trueque, bonos locales, venta directa |
| **E09** | Comedor Comunitario | UPZ 80 Corabastos | Demanda social prioritaria |
| **E10** | Centro Comunitario de Compostaje | UPZ 45 Carvajal | Tratamiento termofílico de bio-residuos |
| **E11** | Nodo de Gobernanza Heterárquica | UPZ 47 Kennedy Central | Asambleas rotativas y asignación de fondos |
| **E12** | Módulo Fúngico (Orellanas/Setas) | UPZ 44 Las Americas (Bavaria) | Valorización de bagazo y sustrato lignocelulósico |
| **E13** | Biofábrica / Lab de Bioinsumos | UPZ 44 Las Americas (Bavaria) | Microorganismos de montaña, biofertilizantes |
| **E14** | Planta de Empaque y Logística Verde | UPZ 44 Las Americas (Bavaria) | Distribución de bajo impacto (bicicargos) |
| **E15** | Hogares y Consumidores | Localidad de Kennedy | Generación de residuos y demanda final |
| **E16** | Corredor Ecosistémico Río Fucha/Tunjuelo | Cuenca Fucha-Tunjuelo | Matriz conectora biótica |
| **E17** | Corabastos (Mayorista Exógeno) | UPZ 80 Corabastos | Proveedor convencional (>94% base) |
| **E18** | Parque Metropolitano Timiza | UPZ 48 Timiza | Núcleo de biodiversidad avifaunística |
| **E19** | Instituto Biotecnológico Bavaria Común | UPZ 44 Las Americas | Formación campesino-popular y extensión |
| **E20** | Distrito de Innovación Agroalimentaria | UPZ 44 Las Americas | Articulación institucional |

---

## 4. Estructura de Directorios

```
sim-kennedy/
├── index.html                   # Interfaz de usuario (HUD táctico, 2D Canvas, 3D View, paneles)
├── style.css                    # Estilos visuales con paleta cian/esmeralda inspirada en REN3D
├── REFERENTE.md                 # Análisis del referente de diseño y arquitectura
├── README.md                    # Documento principal del repositorio
├── js/
│   ├── app.js                   # Controlador maestro de la aplicación web
│   ├── core/                    # Núcleo de simulación
│   │   ├── rng.js               # Generador determinístico Mulberry32
│   │   ├── clock.js             # Reloj simulación y estaciones bimodales
│   │   ├── spaces.js            # Nodos E01-E20 y distancias geográficas
│   │   ├── mass_balance.js      # Auditoría estricta de conservación de masa
│   │   ├── engine.js            # Motor de simulación y Monte Carlo (30 semillas)
│   │   └── exporter.js          # Exportación de series temporales a CSV
│   ├── data/
│   │   ├── matrix_data.js       # Topología de enlaces espaciales y Bavaria
│   │   └── scenarios.js         # Definición de 4 escenarios y 3 choques de estrés
│   ├── modules/                 # Sub-modelos de simulación
│   │   ├── sim1_abastecimiento.js
│   │   ├── sim2_conocimiento.js
│   │   ├── sim3_organicos.js
│   │   ├── sim4_habitat.js
│   │   ├── sim5_gobernanza.js
│   │   └── sim6_suelo.js
│   └── ui/                      # Visualización e interacción
│       ├── map_view.js          # Mapa 2D de Kennedy con partículas de flujo
│       ├── view_3d.js           # Maqueta territorial 3D interactiva Three.js
│       ├── charts.js            # Gráficas canvas con intervalos IQR
│       └── params_panel.js      # Sliders de sensibilidad con etiquetas de fuentes
├── sim1_abastecimiento/
│   └── README.md
├── sim2_conocimiento/
│   └── README.md
├── sim3_organicos/
│   └── README.md
├── sim4_habitat/
│   └── README.md
├── sim5_gobernanza/
│   └── README.md
└── sim6_suelo/
    └── README.md
```

---

## 5. Cómo Ejecutar Localmente

El simulador no requiere compiladores, bases de datos ni claves externas. Es una aplicación web moderna basada en módulos ES6 estándar:

1. Clonar o descargar la carpeta `sim-kennedy/`.
2. Servir la carpeta con cualquier servidor HTTP local (necesario por políticas CORS de módulos ES6):
   - Con Python: `python -m http.server 8080`
   - Con extensión Live Server en VSCode / Antigravity IDE.
3. Abrir `http://localhost:8080` en el navegador.

---

## 6. Verificación Automática y Reglas Duras

El simulador cuenta con una suite de pruebas integrada en la pestaña **"Verificación"**:
1. **Determinismo:** Comprueba que dos simulaciones independientes de 104 semanas con la misma semilla generen exactamente los mismos valores numéricos.
2. **Conservación de Masa:** Monitorea que la discrepancia de balance de masa en alimentos y bio-residuos sea menor a 0.001 kg.
3. **Contraste de Escenarios:** Verifica que las intervenciones generen diferencias medibles respecto a la línea base sin forzamiento artificial.
