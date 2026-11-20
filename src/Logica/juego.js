import { TAMANIO } from './barcos';
/**
 * // Valida si todos los barcos de la flota secreta han sido destruidos por completo para asi determinar si hay  ganador
 *
 * @param {Array<Array<string|null>>} tableroEstado matriz 10x10 con los disparos hechos (agua, impacto, hundido o null)
 * @param {Array<Array<object>>} flotaSecreta matriz 10x10 con la ubicación real de los barcos
 * @returns {boolean} True si todas las casillas con barco ya recibieron disparo, y false si todavía queda alguna viva
 */
export function verificarVictoria(tableroEstado, flotaSecreta) {
  let totalPartesBarco = 0;
  let impactosAcumulados = 0;

  for (let f = 0; f < TAMANIO; f++) {
    for (let c = 0; c < TAMANIO; c++) {
      if (flotaSecreta[f][c].barcoId !== null) {
        totalPartesBarco++;
        const estadoCelda = tableroEstado[f][c];
        if (estadoCelda === 'impacto' || estadoCelda === 'hundido') {
          impactosAcumulados++;
        }
      }
    }
  }

  return totalPartesBarco > 0 && impactosAcumulados === totalPartesBarco;
}