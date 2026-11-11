# Sub-modelo 1: Abastecimiento Alimentario y Elección de Proveedor

## 1. Pregunta Central de Investigación
¿Qué transformaciones territoriales ocurren en la dependencia alimentaria, los precios al consumidor y los niveles de desabastecimiento barrial en Kennedy cuando se reorganizan las relaciones entre productores locales (huertas E01–E05), nodos de acopio/ferias (E06, E08) y tiendas de barrio (E07) frente al oligopolio mayorista de Corabastos (E17)?

---

## 2. Agentes Involucrados

| Agente / Espacio | Rol y Dinámica |
|---|---|
| **Huertas Urbanas (E01–E05)** | Producen hortalizas y aromáticas según área productiva efectiva, horas semanales de mano de obra y factores climáticos estacionales. Priorizan autoconsumo familiar (20-30%) y canalizan excedentes a acopio (E06) y ferias (E08). |
| **Tiendas de Barrio (E07)** | Establecimientos minoristas que consolidan la demanda de los hogares. Cada semana evalúan y eligen su canasta de abastecimiento entre Corabastos (E17) y el canal local/acopio (E06). |
| **Proveedor Mayorista (E17 - Corabastos)** | Agente exógeno con capacidad ilimitada de suministro, precio de referencia de mercado mayorista, condiciones crediticias comerciales pero menor frescura y trazabilidad. |
| **Centro de Acopio (E06)** | Agrupa excedentes de las huertas, gestiona mermas de poscosecha y redistribuye a tiendas y comedores. |
| **Ferias Barriales (E08)** | Espacios quincenales/semanales de intercambio directo, trueque y comercialización alternativa. |
| **Comedores Comunitarios (E09)** | Demanda institucional fija que recibe donaciones de excedentes y compra preferencialmente a la red local. |
| **Hogares Consumidores (E15)** | Demanda agregada per cápita basada en la canasta básica de hortalizas frescas. |

---

## 3. Formalización Matemática y Reglas de Decisión

### 3.1 Función de Producción Agrícola de Huertas
La cosecha semanal $Y_{i,t}$ (en kg) de la huerta $i$ en la semana $t$ responde a una función de rendimientos decrecientes tipo Cobb-Douglas con factor estacional de lluvia:

$$Y_{i,t} = A_i \cdot \phi_i \cdot (L_{i,t})^\alpha \cdot \text{Clima}(t) \cdot (1 + \beta \cdot K_{i,t})$$

Donde:
- $A_i$: Área efectiva cultivada ($m^2$).
- $\phi_i$: Rendimiento base promedio ($kg/m^2 \cdot \text{semana}$).
- $L_{i,t}$: Horas-hombre efectivas dedicadas al cultivo.
- $\alpha$: Elasticidad del trabajo ($\alpha = 0.65$, `"fuente": "POR VERIFICAR"`).
- $\text{Clima}(t)$: Factor climático bimodal andino (entre 0.70 en sequía y 1.25 en lluvias óptimas).
- $K_{i,t}$: Nivel de conocimiento agroecológico adquirido desde Bavaria Común (E19).
- $\beta$: Coeficiente de transferencia tecnológica ($\beta = 0.35$).

### 3.2 Elección Multicriterio de Proveedor (Modelo Logit Multinomial)
Las tiendas de barrio (E07) deciden la proporción de compra al proveedor local ($P_{local}$) frente a Corabastos ($P_{mayorista}$) mediante una función de utilidad multicriterio:

$$U_k = w_p \cdot (-Precio_k) + w_c \cdot Credito_k + w_v \cdot (-VolMin_k) + w_h \cdot Horario_k + w_{conf} \cdot Confianza_{k,t}$$

$$\sum w_j = 1$$

La probabilidad de elección $P(local)$ se modela como:

$$P(local) = \frac{e^{U_{local} / \tau}}{e^{U_{local} / \tau} + e^{U_{mayorista} / \tau}}$$

Donde $\tau$ es el parámetro de dispersión térmica / sensibilidad a la utilidad.

### 3.3 Auditoría de Balance de Masa
Para cada período $t$, el inventario de alimentos verifica estrictamente:

$$\Delta \text{Stock}_{alim} = \text{CosechaTotal}_t + \text{ImportaciónMayorista}_t - \text{ConsumoHogares}_t - \text{Comedores}_t - \text{MermasPoscosecha}_t$$

Si $|\text{Discrepancia}| > 10^{-4}\text{ kg}$, el sistema emite una alerta de ruptura de conservación.

---

## 4. Tabla de Parámetros y Fuentes

| Parámetro | Valor por Defecto | Rango de Sensibilidad | Fuente / Justificación |
|---|---|---|---|
| Dependencia inicial Corabastos | 94.0 % | 80.0 % - 99.0 % | **SIPSA 2025 / Alcaldía Mayor** (`"fuente": "SIPSA 2025 (Alcaldía de Bogotá)"`) |
| Rendimiento base huerta ($E01$) | 0.22 kg/m²/sem | 0.10 - 0.45 kg/m²/sem | `"fuente": "POR VERIFICAR"` (Estimación huertas populares) |
| Rendimiento base huerta ($E03$) | 0.30 kg/m²/sem | 0.15 - 0.60 kg/m²/sem | `"fuente": "POR VERIFICAR"` (Lotes baldíos con suelo mejorado) |
| Rendimiento base huerta ($E04$) | 0.25 kg/m²/sem | 0.10 - 0.50 kg/m²/sem | `"fuente": "POR VERIFICAR"` (Borde de humedal) |
| Autoconsumo familiar huertas | 25.0 % | 10.0 % - 50.0 % | `"fuente": "POR VERIFICAR"` |
| Mermas en acopio y transporte | 4.5 % | 1.0 % - 12.0 % | `"fuente": "POR VERIFICAR"` |
| Ponderador precio ($w_p$) | 0.35 | 0.10 - 0.60 | `"fuente": "POR VERIFICAR"` (Encuesta comercial) |
| Ponderador confianza ($w_{conf}$) | 0.25 | 0.05 - 0.50 | `"fuente": "POR VERIFICAR"` (Capital social barrial) |
| Ponderador crédito ($w_c$) | 0.20 | 0.05 - 0.40 | `"fuente": "POR VERIFICAR"` |

---

## 5. Escenarios Simulados

1. **Línea Base (Sin Intervención):** Las huertas operan de manera aislada sin acopio ni feria. Dependencia externa $>94\%$. Alta vulnerabilidad a volatilidades de precio en Corabastos.
2. **Escenario 1 (Solo Huertas):** Aumento del área cultivada en las 4 tipologías. El autoconsumo se satisface, pero los excedentes se pierden o subutilizan por falta de logística.
3. **Escenario 2 (Huertas + Intercambio Barrial):** Se articulan el centro de acopio E06 y ferias E08. Las tiendas aumentan su abastecimiento local al 12-18%.
4. **Escenario 3 (Propuesta Integral + Bavaria E19):** El clúster Bavaria Común aporta bioinsumos y asistencia técnica constante, duplicando el rendimiento por m² y alcanzando hasta 28-35% de autonomía local en hortalizas perecederas.

---

## 6. Limitaciones del Módulo
- No se modelan cadenas de frío industrializadas (las huertas abastecen productos de consumo inmediato dentro del radio barrial de 15 minutos).
- La demanda agregada asume estabilidad demográfica base salvo cuando se activa el choque de estrés poblacional (+30%).
