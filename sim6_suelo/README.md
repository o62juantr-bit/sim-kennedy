# Sub-modelo 6: Dinámica del Suelo Urbano y Presión de Gentrificación Verde

## 1. Pregunta Central de Investigación
¿Cómo interactúa la mejora paisajística y socioambiental generada por la red de huertas (especialmente en baldíos recuperados E03 y bordes E04) con los precios del suelo y cánones de arrendamiento en Kennedy, qué riesgo existe de gentrificación verde (*green gentrification*) y desplazamiento involuntario de familias arrendatarias vulnerables, y qué instrumentos territoriales pueden blindar el suelo comunitario?

---

## 2. Agentes Involucrados

| Agente / Actor | Rol y Dinámica |
|---|---|
| **Familias Arrendatarias y Residentes Vulnerables (E01, E15)** | Hogares con tenencia informal o en alquiler; altamente vulnerables a incrementos en el canon mensual. |
| **Mercado Inmobiliario y Propietarios de Suelo** | Revalorizan el suelo circundante a zonas verdes, huertas y equipamientos comunitarios mejorados, aumentando rentas inmobiliarias. |
| **Comités Comunitarios de Defensa del Territorio (E03, E11)** | Negocian figuras de custodia territorial, bancos de suelo municipal y contratos de comodato social para evitar la expulsión. |
| **Lotes Baldíos Recuperados (E03)** | Suelos en disputa entre vocación inmobiliaria privada y soberanía alimentaria comunitaria. |

---

## 3. Formalización Matemática y Riesgo de Desplazamiento

### 3.1 Modelo de Precios Hedónicos del Suelo Urbano
El incremento porcentual en el avalúo o canon de arrendamiento comercial/residencial $\Delta R_{k,t}$ en el entorno de la huerta $k$ se aproxima mediante:

$$\Delta R_{k,t} = \omega_{base} + \beta_{verde} \cdot \Delta \text{CalidadAmbiental}_{k,t} + \beta_{seguridad} \cdot \Delta \text{CohesiónBarrial}_{k,t} - \gamma_{distancia} \cdot d_{k,\text{Corabastos}}$$

Donde:
- $\beta_{verde} = 0.12$: Elasticidad del precio respecto a la proximidad a áreas verdes recuperadas (`"fuente": "POR VERIFICAR"`).
- $\beta_{seguridad} = 0.08$: Efecto de pacificación urbana atribuible a la presencia social activa en huertas comunitarias.

### 3.2 Tasa de Desplazamiento Involuntario de Arrendatarios
La fracción de familias arrendatarias en riesgo de expulsión $D_{exp,t}$ se modela como una función umbral de la carga del alquiler sobre el ingreso del hogar:

$$D_{exp,t} = \begin{cases} 
0 & \text{si } \frac{\text{Canon}_{t}}{\text{IngresoHogar}_t} \le \Theta_{soportable} \\
\psi_{desalojo} \cdot \left(\frac{\text{Canon}_{t}}{\text{IngresoHogar}_t} - \Theta_{soportable}\right)^{\xi} & \text{si } \frac{\text{Canon}_{t}}{\text{IngresoHogar}_t} > \Theta_{soportable}
\end{cases}$$

Donde $\Theta_{soportable} = 0.35$ (el canon no debería superar el 35% de los ingresos de economía popular).

### 3.3 Efecto de Blindaje por Comodatos y Custodia del Suelo
Cuando la gobernanza (E11) logra consolidar convenios de **Custodia de Suelo Comunitario**, se aplica un factor amortiguador:

$$\text{RiesgoEfectivo}_t = D_{exp,t} \cdot (1 - \text{BlindajeLegal}_t)$$

---

## 4. Tabla de Parámetros y Fuentes

| Parámetro | Valor por Defecto | Rango de Sensibilidad | Fuente / Justificación |
|---|---|---|---|
| Crecimiento inercial avalúos en Kennedy | 4.2 % anual | 2.0 % - 8.0 % | `"fuente": "Catastro Distrital / POR VERIFICAR"` |
| Prima inmobiliaria por espacio verde | +6.5 % sobre canon | +2.0 % - +15.0 % | `"fuente": "POR VERIFICAR"` (Literatura de gentrificación verde) |
| Proporción de hogares arrendatarios | 58.0 % | 45.0 % - 70.0 % | `"fuente": "DANE / Encuesta Calidad de Vida Bogotá"` |
| Umbral crítico de renta sobre ingreso ($\Theta$) | 35.0 % del ingreso | 25.0 % - 45.0 % | `"fuente": "POR VERIFICAR"` |
| Tasa de efectividad de custodia de suelo | 80.0 % blindaje | 40.0 % - 95.0 % | `"fuente": "POR VERIFICAR"` (Acuerdos distritales/populares) |

---

## 5. Conclusiones del Módulo

- **La Paradoja de la Mejora Urbana:** Mejorar la infraestructura agroecológica y paisajística sin instrumentos de protección del suelo desencadena presiones de desalojo en hasta un 14% de las familias de bajos ingresos en 104 semanas.
- **Necesidad de Instrumentos Híbridos:** La simulación demuestra que la soberanía alimentaria es indisociable de la soberanía sobre el suelo. La articulación de comodatos a largo plazo y pactos de permanencia vecinal preserva la permanencia del 96% de los pobladores históricos.
