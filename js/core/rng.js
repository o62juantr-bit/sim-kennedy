/**
 * Generador de Números Pseudoaleatorios Determinista (PRNG)
 * Implementación de Mulberry32 para reproducibilidad estricta.
 */

export class RNG {
  constructor(seed = 12345) {
    this.initialSeed = seed;
    this.state = seed | 0;
  }

  // Genera un número decimal en [0, 1)
  random() {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Flotante en rango [min, max)
  range(min, max) {
    return min + (max - min) * this.random();
  }

  // Entero en rango [min, max] (inclusivo)
  int(min, max) {
    return Math.floor(this.range(min, max + 1));
  }

  // Selección aleatoria de un elemento
  choice(array) {
    if (!array || array.length === 0) return null;
    const idx = Math.floor(this.random() * array.length);
    return array[idx];
  }

  // Distribución normal (Box-Muller)
  gaussian(mean = 0, std = 1) {
    let u1 = this.random();
    let u2 = this.random();
    while (u1 === 0) u1 = this.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + z0 * std;
  }

  // Booleano con probabilidad p
  chance(p) {
    return this.random() < p;
  }

  // Reinicia el generador con su semilla inicial o una nueva
  reset(newSeed = null) {
    if (newSeed !== null) {
      this.initialSeed = newSeed;
    }
    this.state = this.initialSeed | 0;
  }
}
