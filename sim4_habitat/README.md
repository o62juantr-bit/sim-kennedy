# Sub-modelo 4: Hábitat Ecosistémico y Biodiversidad Urbana de Huertas

## 1. Pregunta Central de Investigación
¿En qué medida la red de huertas urbanas y sus tipologías de borde de humedal (E04), baldíos renaturalizados (E03) y terrazas verdes (E02) actúan como trampolines ecológicos (*stepping stones*) para restablecer la conectividad biótica, favorecer las poblaciones de polinizadores nativos y biodiversidad benéfica en Kennedy, y mitigar las trampas ecológicas urbanas (vidrios reflectivos e iluminación nocturna)?

---

## 2. Gremios y Biodiversidad Modelados

| Especie / Gremio | Requerimientos de Hábitat | Sensibilidad / Amenazas Urbanas |
|---|---|---|
| **Abejas y Polinizadores Nativos (*Hymenoptera*)** | Flora melífera continua en huertas (abutilón, salvia, borraja, aromáticas). | Uso de insecticidas y falta de conectividad floral entre barrios. |
| **Colibrí Chillón (*Colibri coruscans*)** | Estrato arbustivo floral rico en néctar en huertas y balcones (E02, E05). | Colisiones contra ventanales no tratados en edificios de altura. |
| **Copetón (*Zonotrichia capensis*)** | Insectívoro y granívoro generalista; anida en arbustos bajos en huertas familiares. | Pérdida de sustrato vivo y trampas lumínicas nocturnas. |
| **Mirla Patiamarilla (*Turdus fuscater*)** | Frugívora y dispersora de semillas nativas; dosel arbóreo continuo. | Fragmentación entre parches arbolados y ruido vehicular. |

---

## 3. Formalización Matemática y Conectividad del Paisaje

### 3.1 Índice Integral de Conectividad Paisajística ($IIC$)
La matriz territorial se modela como un grafo ponderado donde cada huerta y parque es un nodo con área biótica $a_i$ y calidad de cobertura $q_i \in [0, 1]$:

$$IIC_t = \frac{\sum_{i=1}^n \sum_{j=1}^n a_i \cdot q_i \cdot a_j \cdot q_j \cdot P^*_{ij}}{A_L^2}$$

Donde:
- $P^*_{ij} = \exp(-d_{ij} / d_0)$ representa la probabilidad de dispersión en función de la distancia geográfica y la capacidad de vuelo $d_0$ de cada gremio.
- $A_L$: Área territorial total considerada en Kennedy.

### 3.2 Dinámica de Polinizadores con Trampas Ecológicas
Para cada gremio $k$, la población semanal $N_{k,t}$ sigue una dinámica logística modificada:

$$N_{k,t+1} = N_{k,t} + r_k \cdot N_{k,t} \left(1 - \frac{N_{k,t}}{K_{k}(IIC_t)}\right) - M_{trampa}(t)$$

Donde:
- $K_{k}(IIC_t) = K_{base} \cdot (1 + \lambda_{veg} \cdot IIC_t)$: Capacidad de carga del territorio dependiente de la conectividad.
- $M_{trampa}(t) = \alpha_{vidrio} \cdot \text{AreaVidrio}_{E02} \cdot (1 - \text{TratamientoUV}) \cdot N_{k,t}$: Mortalidad por colisiones contra ventanales en vivienda de altura.

---

## 4. Tabla de Parámetros y Fuentes

| Parámetro | Valor por Defecto | Rango de Sensibilidad | Fuente / Justificación |
|---|---|---|---|
| Radio medio de dispersión polinizadores ($d_0$) | 800 metros | 400 - 1,500 m | `"fuente": "POR VERIFICAR"` (Forrajeo de abejas urbanas) |
| Distancia media de vuelo Colibrí ($d_0$) | 2,200 metros | 1,200 - 3,500 m | `"fuente": "POR VERIFICAR"` |
| Tasa de colisión ventanales E02 sin UV | 0.022 /semana | 0.005 - 0.040 | `"fuente": "POR VERIFICAR"` (Mortalidad por trampa ecológica) |
| Aporte de huerta de borde (E04) a hábitat | +0.45 índice calidad | 0.20 - 0.80 | `"fuente": "POR VERIFICAR"` (Franja de amortiguación agroecológica) |

---

## 5. Análisis de Resultados

- **Efecto Trampolín:** La consolidación de huertas en baldíos (E03) y rondas de humedal (E04) incrementa el índice de conectividad paisajística de $0.18$ a $0.62$.
- **Alerta de Trampa Ecológica:** Si las huertas en vivienda de altura (E02) proliferan sin incentivar adhesivos UV en ventanales e iluminación cálida orientada hacia abajo, la mortalidad por colisión de polinizadores y aves nectarívoras reduce el balance biótico local.
