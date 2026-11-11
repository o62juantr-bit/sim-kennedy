/**
 * Reloj de Simulación Territorial
 * Paso de tiempo: 1 semana.
 * Horizonte por defecto: 104 semanas (2 años), configurable.
 */

export class SimClock {
  constructor(horizonWeeks = 104) {
    this.horizonWeeks = horizonWeeks;
    this.currentTick = 0; // Semana 0: inicialización
  }

  reset() {
    this.currentTick = 0;
  }

  step() {
    if (!this.isFinished()) {
      this.currentTick++;
      return true;
    }
    return false;
  }

  isFinished() {
    return this.currentTick >= this.horizonWeeks;
  }

  get week() {
    return this.currentTick;
  }

  get weekOfYear() {
    return ((this.currentTick - 1) % 52) + 1;
  }

  get year() {
    return Math.floor((this.currentTick - 1) / 52) + 1;
  }

  // Estacionalidad bimodal típica de la Sabana de Bogotá
  // Temporada seca: Dic-Feb (sem 48-52, 1-8), Jun-Ago (sem 23-35)
  // Temporada de lluvias: Mar-May (sem 9-22), Sep-Nov (sem 36-47)
  get season() {
    const w = this.weekOfYear;
    if ((w >= 1 && w <= 8) || (w >= 48 && w <= 52)) {
      return { id: 'seca_principal', nombre: 'Seca / Heladas (Ene-Feb)', factorLluvia: 0.45 };
    } else if (w >= 9 && w <= 22) {
      return { id: 'lluvias_primeras', nombre: 'Lluvias 1 (Mar-May)', factorLluvia: 1.35 };
    } else if (w >= 23 && w <= 35) {
      return { id: 'seca_veranillo', nombre: 'Seca / Vientos (Jun-Ago)', factorLluvia: 0.65 };
    } else {
      return { id: 'lluvias_segundas', nombre: 'Lluvias 2 (Sep-Nov)', factorLluvia: 1.40 };
    }
  }

  getProgressFraction() {
    return Math.min(1.0, this.currentTick / this.horizonWeeks);
  }

  getTextSummary() {
    if (this.currentTick === 0) return 'Semana 0 (Estado Inicial)';
    return `Semana ${this.currentTick} / ${this.horizonWeeks} • Año ${this.year} • ${this.season.nombre}`;
  }
}
