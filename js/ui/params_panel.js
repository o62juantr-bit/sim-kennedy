/**
 * Panel de Parámetros y Análisis de Sensibilidad
 * Expone controles interactivos y declara formalmente las fuentes ("POR VERIFICAR" cuando corresponda).
 */

export class ParamsPanel {
  constructor(containerId, onParamChange = null) {
    this.container = document.getElementById(containerId);
    this.onParamChange = onParamChange;
    this.currentValues = {};
    this.render();
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="params-section">
        <h3>SIMULACIÓN 1: ABASTECIMIENTO Y PROVEEDOR</h3>
        
        <div class="param-row">
          <div class="param-label">
            <span>Precio Mayorista Base (Corabastos)</span>
            <span class="source-tag verified">SIPSA 2025</span>
          </div>
          <div class="param-input-group">
            <input type="range" id="p_precio_may" min="2000" max="6000" step="100" value="3200">
            <span id="v_precio_may">3,200 COP/kg</span>
          </div>
        </div>

        <div class="param-row">
          <div class="param-label">
            <span>Precio Red Local de Huertas</span>
            <span class="source-tag unverified">POR VERIFICAR</span>
          </div>
          <div class="param-input-group">
            <input type="range" id="p_precio_loc" min="1500" max="5000" step="100" value="2700">
            <span id="v_precio_loc">2,700 COP/kg</span>
          </div>
        </div>

        <div class="param-row">
          <div class="param-label">
            <span>Fracción de Autoconsumo Huertero</span>
            <span class="source-tag unverified">POR VERIFICAR</span>
          </div>
          <div class="param-input-group">
            <input type="range" id="p_autoconsumo" min="0.10" max="0.90" step="0.05" value="0.45">
            <span id="v_autoconsumo">45%</span>
          </div>
        </div>

        <div class="param-row">
          <div class="param-label">
            <span>Capacidad Acopio E06 (kg/sem)</span>
            <span class="source-tag unverified">POR VERIFICAR</span>
          </div>
          <div class="param-input-group">
            <input type="range" id="p_cap_acopio" min="1000" max="10000" step="500" value="4000">
            <span id="v_cap_acopio">4,000 kg</span>
          </div>
        </div>
      </div>

      <div class="params-section">
        <h3>SIMULACIÓN 2: FORMACIÓN Y EXTENSIÓN BAVARIA</h3>

        <div class="param-row">
          <div class="param-label">
            <span>Cupos Mensuales en Aulas E19 (PAR11)</span>
            <span class="source-tag unverified">POR VERIFICAR</span>
          </div>
          <div class="param-input-group">
            <input type="range" id="p_cupos_bavaria" min="10" max="60" step="2" value="24">
            <span id="v_cupos_bavaria">24 personas</span>
          </div>
        </div>

        <div class="param-row">
          <div class="param-label">
            <span>Umbral Crítico de Saturación</span>
            <span class="source-tag unverified">POR VERIFICAR</span>
          </div>
          <div class="param-input-group">
            <input type="range" id="p_sat_ratio" min="5" max="30" step="1" value="15">
            <span id="v_sat_ratio">15 huertas/promotor</span>
          </div>
        </div>
      </div>

      <div class="params-section">
        <h3>SIMULACIÓN 3: CICLO DE ORGÁNICOS Y COMPOST</h3>

        <div class="param-row">
          <div class="param-label">
            <span>Desvío hacia Compostaje Barrial E10</span>
            <span class="source-tag unverified">POR VERIFICAR</span>
          </div>
          <div class="param-input-group">
            <input type="range" id="p_desvio_compost" min="0.05" max="0.80" step="0.05" value="0.35">
            <span id="v_desvio_compost">35%</span>
          </div>
        </div>
      </div>

      <div class="params-section">
        <h3>SIMULACIÓN 4: HÁBITAT Y FAUNA</h3>

        <div class="param-row">
          <div class="param-label">
            <span>Medidas Antitrampa (Vidrios UV / Luz)</span>
            <span class="source-tag verified">Diseño Biourbano</span>
          </div>
          <div class="param-input-group">
            <label class="toggle-switch">
              <input type="checkbox" id="p_antitrampa" checked>
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <div class="params-section">
        <h3>SIMULACIÓN 5 & 6: GOBERNANZA Y SUELO</h3>

        <div class="param-row">
          <div class="param-label">
            <span>Modelo de Gobernanza</span>
            <span class="source-tag verified">Propuesta Grupo</span>
          </div>
          <select id="p_modelo_gob" class="select-field">
            <option value="rotativo" selected>Heterarquía Rotativa (E11 / Bavaria)</option>
            <option value="centralizado">Centralizado Institucional</option>
            <option value="mixto">Mixto Alcaldía-Comunitario</option>
          </select>
        </div>

        <div class="param-row">
          <div class="param-label">
            <span>Protección Legal de Suelo en Baldíos</span>
            <span class="source-tag unverified">POR VERIFICAR</span>
          </div>
          <div class="param-input-group">
            <label class="toggle-switch">
              <input type="checkbox" id="p_proteccion_suelo" checked>
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
    `;

    this.attachListeners();
  }

  attachListeners() {
    const bindRange = (id, labelId, formatFn) => {
      const el = document.getElementById(id);
      const lbl = document.getElementById(labelId);
      if (!el || !lbl) return;
      el.addEventListener('input', (e) => {
        lbl.textContent = formatFn(e.target.value);
        this.emitChange();
      });
    };

    bindRange('p_precio_may', 'v_precio_may', v => `${Number(v).toLocaleString()} COP/kg`);
    bindRange('p_precio_loc', 'v_precio_loc', v => `${Number(v).toLocaleString()} COP/kg`);
    bindRange('p_autoconsumo', 'v_autoconsumo', v => `${Math.round(v * 100)}%`);
    bindRange('p_cap_acopio', 'v_cap_acopio', v => `${Number(v).toLocaleString()} kg`);
    bindRange('p_cupos_bavaria', 'v_cupos_bavaria', v => `${v} personas`);
    bindRange('p_sat_ratio', 'v_sat_ratio', v => `${v} huertas/promotor`);
    bindRange('p_desvio_compost', 'v_desvio_compost', v => `${Math.round(v * 100)}%`);

    document.getElementById('p_antitrampa')?.addEventListener('change', () => this.emitChange());
    document.getElementById('p_modelo_gob')?.addEventListener('change', () => this.emitChange());
    document.getElementById('p_proteccion_suelo')?.addEventListener('change', () => this.emitChange());
  }

  getValues() {
    return {
      precio_mayorista_kg: parseFloat(document.getElementById('p_precio_may')?.value || 3200),
      precio_local_kg: parseFloat(document.getElementById('p_precio_loc')?.value || 2700),
      tasa_autoconsumo: parseFloat(document.getElementById('p_autoconsumo')?.value || 0.45),
      capacidad_acopio_kg_sem: parseFloat(document.getElementById('p_cap_acopio')?.value || 4000),
      cupos_taller_mes: parseInt(document.getElementById('p_cupos_bavaria')?.value || 24),
      ratio_saturacion_critico: parseInt(document.getElementById('p_sat_ratio')?.value || 15),
      fraccion_desvio_compost_e10: parseFloat(document.getElementById('p_desvio_compost')?.value || 0.35),
      medidas_antitrampa: document.getElementById('p_antitrampa')?.checked ?? true,
      modelo: document.getElementById('p_modelo_gob')?.value || 'rotativo',
      proteccion_suelo_activa: document.getElementById('p_proteccion_suelo')?.checked ?? true
    };
  }

  emitChange() {
    if (typeof this.onParamChange === 'function') {
      this.onParamChange(this.getValues());
    }
  }
}
