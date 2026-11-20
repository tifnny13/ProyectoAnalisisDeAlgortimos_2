import { ejecutarSimulacionProbabilistica } from './algoritmoProbabilistico';
import { TAMANIO } from './barcos';

export function calcularAtaqueIA(disparosIAEnJugador, flotaJugador, numSimulaciones = 1000) {
  // 1. Análisis probabilístico
  const resultadoIA = ejecutarSimulacionProbabilistica(disparosIAEnJugador, numSimulaciones);
  let { fila, col, prob } = resultadoIA.mejorCelda;

  // 2. Validación de seguridad para evitar celdas repetidas
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

  // 3. Determinar impacto o agua
  const hayBarco = flotaJugador[fila][col].barcoId !== null;
  const resultadoDisparo = hayBarco ? 'impacto' : 'agua';

  // 4. Construir la nueva matriz de disparos de la IA
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