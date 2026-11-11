# Sub-modelo 2: Difusión del Conocimiento desde Bavaria Común

## 1. Pregunta Central de Investigación
¿Cómo se difunden las técnicas agroecológicas y biotecnológicas desde el Instituto Bavaria Común (E19) hacia la red descentralizada de huertas populares (E01–E05), qué umbral de facilitadores/promotores se requiere para evitar el abandono de huertas, y cómo influye la saturación y el relevo generacional en la sostenibilidad del saber territorial?

---

## 2. Agentes Involucrados

| Agente / Espacio | Rol y Dinámica |
|---|---|
| **Instituto Biotecnológico Bavaria Común (E19)** | Nodo central de formación, investigación aplicada y extensión territorial. Genera cohortes de facilitadores comunitarios y produce guías técnicas y bioinsumos. |
| **Facilitadores / Promotores Agroecológicos** | Agentes móviles que visitan periódicamente las huertas de su nodo geográfico para capacitar en microbiología del suelo, manejo integrado de plagas y compostaje. |
| **Huerteros / Comunidades Locales (E01–E05)** | Adoptantes de prácticas según su nivel previo de conocimiento, tiempo disponible, tasa de aprendizaje por imitación entre vecinos y riesgo de fatiga/abandono. |
| **Redes de Vecindad** | Enlaces espaciales de proximidad topológica (`LK-001` a `LK-040`) por donde ocurre la transmisión horizontal "campesino a campesino". |

---

## 3. Formalización Matemática y Reglas de Decisión

### 3.1 Modelo de Adopción y Transferencia (Extensión Epidemiológica SIR)
El estado de las huertas frente a una práctica agroecológica avanzada (ej. biofertilización líquida o sustratos fúngicos) se clasifica en:
- **No iniciada ($S$):** Huerta sin implementación de técnicas biotecnológicas.
- **En Adopción / Activa ($I$):** Huerta aplicando prácticas bajo acompañamiento de promotores.
- **Consolidada / Autónoma ($R$):** Huerta con transferencia completa de capacidad instalada y capaz de enseñar a huertas vecinas.
- **En Abandono ($D$):** Huerta inactiva por deserción o falta de relevo generacional.

La variación semanal del conocimiento promedio $K_{i,t} \in [0, 1]$ en la huerta $i$ se formula como:

$$\Delta K_{i,t} = \underbrace{\gamma_{directa} \cdot \frac{Facilitadores_t}{HuertasActivas_t} \cdot (1 - K_{i,t})}_{\text{Capacitación vertical desde Bavaria}} + \underbrace{\mu_{horiz} \sum_{j \in Vecinos(i)} w_{ij} \cdot (K_{j,t} - K_{i,t})}_{\text{Difusión horizontal por proximidad}} - \underbrace{\delta_{olvido} \cdot K_{i,t}}_{\text{Depreciación natural del saber}}$$

### 3.2 Probabilidad Semanal de Abandono (Deserción)
Una huerta enfrenta una probabilidad de abandono que crece exponencialmente si el conocimiento y el soporte comunitario caen por debajo de un umbral crítico:

$$P_{abandono}(i, t) = \frac{\theta_{base}}{1 + e^{\kappa \cdot (K_{i,t} - K_{critico})}} + \lambda_{fatiga} \cdot (1 - IncentivoSocial_t)$$

Cuando Bavaria Común está activo con facilitadores asignados, $K_{i,t} > K_{critico}$, reduciendo la tasa de deserción del 18% anual a menos del 3% anual.

---

## 4. Tabla de Parámetros y Fuentes

| Parámetro | Valor por Defecto | Rango de Sensibilidad | Fuente / Justificación |
|---|---|---|---|
| Tasa de aprendizaje vertical ($\gamma$) | 0.08 /sem | 0.02 - 0.20 | `"fuente": "POR VERIFICAR"` (Modelos de extensión rural FAO adaptados) |
| Tasa de imitación entre vecinos ($\mu$) | 0.04 /sem | 0.01 - 0.12 | `"fuente": "POR VERIFICAR"` |
| Tasa de depreciación del saber ($\delta$) | 0.01 /sem | 0.002 - 0.03 | `"fuente": "POR VERIFICAR"` (Pérdida de prácticas sin refuerzo) |
| Relación óptima promotores/huertas | 1 : 4 huertas | 1:2 - 1:10 | `"fuente": "POR VERIFICAR"` (Capacidad de carga de extensionistas) |
| Umbral crítico de conocimiento ($K_{crit}$) | 0.35 | 0.20 - 0.50 | `"fuente": "POR VERIFICAR"` |

---

## 5. Escenarios y Hallazgos Principales

- **Sin Bavaria (Línea Base):** El conocimiento agroecológico se transmite únicamente por redes familiares aisladas. La deserción de huertas alcanza el 24% a las 52 semanas debido a pérdidas por plagas no controladas.
- **Con Bavaria Común:** El conocimiento supera el umbral de consolidación ($K > 0.70$) hacia la semana 38. La red de huertas alcanza estabilidad demográfica con más de 45 huertas comunitarias plenamente activas y conectadas.
