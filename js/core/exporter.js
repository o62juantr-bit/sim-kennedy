/**
 * Exportador de Resultados y Series Temporales
 * Genera archivos CSV estructurados y JSON de corridas y análisis Monte Carlo.
 */

export class Exporter {
  /**
   * Exporta resultados agregados de Monte Carlo (Media, Mediana, Q1, Q3, IQR) a CSV
   */
  static exportMonteCarloToCSV(mcResults, filename = null) {
    if (!mcResults || !mcResults.series || mcResults.series.length === 0) return;

    const escenario = mcResults.escenario || 'escenario';
    const fname = filename || `sim_kennedy_montecarlo_${escenario}_${mcResults.nSeeds}semillas.csv`;

    const headers = ['semana', 'metrica', 'media', 'mediana', 'q1', 'q3', 'iqr', 'std', 'min', 'max'];
    const rows = [headers.join(',')];

    for (const p of mcResults.series) {
      const sem = p.semana;
      for (const [metrica, stats] of Object.entries(p.variables)) {
        rows.push([
          sem,
          metrica,
          stats.media,
          stats.mediana,
          stats.q1,
          stats.q3,
          stats.iqr,
          stats.std,
          stats.min,
          stats.max
        ].join(','));
      }
    }

    const csvContent = rows.join('\n');
    this.downloadFile(csvContent, fname, 'text/csv;charset=utf-8;');
  }

  /**
   * Exporta corrida individual semanal a CSV
   */
  static exportRunToCSV(history, scenarioId = 'corrida', seed = 0) {
    if (!history || history.length === 0) return;

    const fname = `sim_kennedy_${scenarioId}_semilla${seed}.csv`;
    const headers = [
      'semana',
      // Sim 1
      'produccion_kg', 'autoconsumo_kg', 'ventas_locales_kg', 'compras_mayorista_kg', 'desabastecimiento_kg', 'participacion_local_pct', 'dependencia_corabastos_pct', 'mermas_total_kg',
      // Sim 2
      'huertas_activas', 'promotores_activos', 'ratio_huertas_promotor', 'stock_conocimiento', 'tasa_supervivencia_pct',
      // Sim 3
      'generacion_organicos_kg', 'desviado_compost_kg', 'compost_maduro_kg', 'tasa_desvio_pct', 'ton_desviadas_acum',
      // Sim 4
      'indice_conectividad', 'ocupacion_parches_pct', 'biodiversidad_polinizadores', 'poblacion_copeton', 'mortalidad_trampas_acum',
      // Sim 5
      'tiempo_decision_sem', 'concentracion_poder_hhi', 'necesidades_atendidas_pct', 'conflictos_activos',
      // Sim 6
      'precio_suelo_m2', 'presion_inmobiliaria_indice', 'permanencia_residentes_pct', 'baldios_en_cultivo'
    ];

    const rows = [headers.join(',')];

    for (const snap of history) {
      rows.push([
        snap.semana,
        snap.sim1.produccion_kg,
        snap.sim1.autoconsumo_kg,
        snap.sim1.ventas_locales_kg,
        snap.sim1.compras_mayorista_kg,
        snap.sim1.desabastecimiento_kg,
        snap.sim1.participacion_local_pct,
        snap.sim1.dependencia_corabastos_pct,
        snap.sim1.mermas_total_kg,
        snap.sim2.huertas_activas,
        snap.sim2.promotores_activos,
        snap.sim2.ratio_huertas_promotor,
        snap.sim2.stock_conocimiento,
        snap.sim2.tasa_supervivencia_pct,
        snap.sim3.generacion_total_kg,
        snap.sim3.desviado_compost_kg,
        snap.sim3.compost_maduro_kg,
        snap.sim3.tasa_desvio_pct,
        snap.sim3.toneladas_desviadas_acum,
        snap.sim4.indice_conectividad,
        snap.sim4.ocupacion_parches_pct,
        snap.sim4.biodiversidad_polinizadores,
        snap.sim4.poblacion_copeton,
        snap.sim4.mortalidad_trampas_acum,
        snap.sim5.tiempo_decision_sem,
        snap.sim5.concentracion_poder_hhi,
        snap.sim5.necesidades_atendidas_pct,
        snap.sim5.conflictos_activos,
        snap.sim6.precio_suelo_m2,
        snap.sim6.presion_inmobiliaria_indice,
        snap.sim6.permanencia_residentes_pct,
        snap.sim6.baldios_en_cultivo
      ].join(','));
    }

    const csvContent = rows.join('\n');
    this.downloadFile(csvContent, fname, 'text/csv;charset=utf-8;');
  }

  static downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 2000);
  }
}
