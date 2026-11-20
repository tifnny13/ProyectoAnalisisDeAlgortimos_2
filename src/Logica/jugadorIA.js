import { ejecutarSimulacionProbabilistica } from './algoritmoProbabilistico';
import { TAMANIO } from './barcos';

/**
 * Decide y ejecuta el siguiente disparo de la IA contra el tablero del jugador usando la simulación probabilística
 *
 * @param {Array<Array<string|null>>} disparosIAEnJugador matriz 10x10 con los tiros que ya hizo la IA (agua, impacto, hundido o null)
 * @param {Array<Array<object>>} flotaJugador matriz 10x10 con la posición real de los barcos del jugador
 * @param {number} [numSimulaciones=1000] la cantidad de simulaciones Monte Carlo que usa la IA para elegir casilla
 * @returns {{
 *   nuevoDisparosIA: Array<Array<string|null>>,
 *   decision: {
 *     coordenada: string,
 *     probabilidad: string,
 *     resultado: string,
 *     configuracionesValidas: number,
 *     tiempo: string
 *   }
 * }} Devuelve el tablero actualizado con el disparo y los datos de la jugada 
 */
export function calcularAtaqueIA(disparosIAEnJugador, flotaJugador, numSimulaciones = 1000) {
  // el análisis probabilístico
  const resultadoIA = ejecutarSimulacionProbabilistica(disparosIAEnJugador, numSimulaciones);
  let { fila, col, prob } = resultadoIA.mejorCelda;

  // la validación de seguridad para evitar celdas repetidas
  if (disparosIAEnJugador[fila][col] !== null) {
    let encontrada = false;
    for (let f = 0; f < TAMANIO && !encontrada; f++) {
      for (let c = 0; c < TAMANIO && !encontrada; c++) {
        if (disparosIAEnJugador[f][c] === null) {
          fila = f;
          col = c;
          prob = 0;
          encontrada = true;
        }
      }
    }
  }

  // determinar impacto o agua
  const hayBarco = flotaJugador[fila][col].barcoId !== null;
  const resultadoDisparo = hayBarco ? 'impacto' : 'agua';

  // construir la nueva matriz de disparos de la IA
  const nuevoDisparosIA = disparosIAEnJugador.map((f, fIdx) =>
    f.map((c, cIdx) => (fIdx === fila && cIdx === col ? resultadoDisparo : c))
  );

  const coordenada = `${String.fromCharCode(65 + fila)}${col + 1}`;

  return {
    nuevoDisparosIA,
    decision: {
      coordenada,
      probabilidad: (prob * 100).toFixed(1),
      resultado: resultadoDisparo,
      configuracionesValidas: resultadoIA.configuracionesValidas,
      tiempo: resultadoIA.tiempoEjecucion.toFixed(2),
    },
  };
}