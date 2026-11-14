import { TAMANIO } from './barcos';

// Valida si todos los barcos de la flota secreta han sido destruidos por completo
export function verificarVictoria(tableroEstado, flotaSecreta) {
  let totalPartesBarco = 0;
  let impactosAcumulados = 0;

  for (let f = 0; f < TAMANIO; f++) {
    for (let c = 0; c < TAMANIO; c++) {
      if (flotaSecreta[f][c].barcoId !== null) {
        totalPartesBarco++;
        if (tableroEstado[f][c] === 'impacto') {
          impactosAcumulados++;
        }
      }
    }
  }

  return totalPartesBarco > 0 && impactosAcumulados === totalPartesBarco;
}