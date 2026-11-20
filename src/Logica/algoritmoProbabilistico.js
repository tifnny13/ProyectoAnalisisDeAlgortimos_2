import { TAMANIO, FLOTA } from './barcos';
import { ORIENTACIONES, calcularCeldas } from './colocacionBarcos';
/**
 * Corre la simulación de Monte Carlo para calcular qué tan probable es que haya un barco en cada casilla
 * Prueba un montón de tableros aleatorios respetando los tiros que ya se hicieron (agua, impactos y hundidos)
 * y se queda con la casilla libre que más veces salió ocupada
 *
 * @param {Array<Array<string|null>>} tableroEstado - Matriz 10x10 con lo que se ve en el tablero enemigo
 * @param {number} [numSimulaciones=1000] - Cuántas veces se repite la simulación (100, 1000, 5000 o 10000)
 * @returns {object} Devuelve la matriz de probabilidades, cuántas configuraciones sirvieron, cuánto tardó y la mejor casilla para disparar.
 */
export function ejecutarSimulacionProbabilistica(tableroEstado, numSimulaciones = 1000) {
  const tiempoInicio = performance.now();
  const matrizConteo = Array.from({ length: TAMANIO }, () => Array(TAMANIO).fill(0)); // contador de cuantas veces cada celda fue ocupada en configuraciones válidas
  const matrizProbabilidades = Array.from({ length: TAMANIO }, () => Array(TAMANIO).fill(0));// matriz final de probabilidades para cada celda

  // Identificar celdas con impacto activo (que aún no pertenecen a un barco hundido)
  const impactosActivos = [];
  for (let f = 0; f < TAMANIO; f++) {
    for (let c = 0; c < TAMANIO; c++) {
      if (tableroEstado[f][c] === 'impacto') {
        impactosActivos.push(`${f},${c}`);
      }
    }
  }

  let configuracionesValidas = 0;

  // Ejecutar N simulaciones (100, 1000, 5000, 10000)
  for (let sim = 0; sim < numSimulaciones; sim++) {
    const tableroSimulado = Array.from({ length: TAMANIO }, () => Array(TAMANIO).fill(false)); // marca si hay un barco en esa celda en la simulación actual
    let flotaValida = true;

    // Intentar colocar los 5 barcos sin superposición y respetando agua/hundidos
    for (const barco of FLOTA) {
      let colocado = false;
      // Intentamos hasta 40 ubicaciones aleatorias por barco para encontrar una válida
      for (let intento = 0; intento < 40; intento++) {
        const orientacion = ORIENTACIONES[Math.floor(Math.random() * ORIENTACIONES.length)];
        const fInicio = Math.floor(Math.random() * (orientacion === 'horizontal' ? TAMANIO : TAMANIO - barco.tam + 1));
        const cInicio = Math.floor(Math.random() * (orientacion === 'horizontal' ? TAMANIO - barco.tam + 1 : TAMANIO));
        const celdas = calcularCeldas(barco.tam, fInicio, cInicio, orientacion);

        let posicionValida = true;
        for (const [f, c] of celdas) {
          if (f < 0 || f >= TAMANIO || c < 0 || c >= TAMANIO) {
            posicionValida = false;
            break;
          }
          const estadoReal = tableroEstado[f][c];

          // No puede superponerse con otro barco simulado, ni caer en agua o barco ya hundido
          if (tableroSimulado[f][c] || estadoReal === 'agua' || estadoReal === 'hundido') {
            posicionValida = false;
            break;
          }
        }

        if (posicionValida) {
          for (const [f, c] of celdas) {
            tableroSimulado[f][c] = true;
          }
          colocado = true;
          break;
        }
      }

      if (!colocado) {
        flotaValida = false;
        break;
      }
    }

    // Verificar que la configuración generada cubra todos los impactos activos que ya estan conocidos
    if (flotaValida && impactosActivos.length > 0) {
      for (const coord of impactosActivos) {
        const [f, c] = coord.split(',').map(Number);
        if (!tableroSimulado[f][c]) {
          flotaValida = false;
          break;
        }
      }
    }

    // Si la configuración completa pasó todas las reglas la guardamos y contamos las celdas ocupadas
    if (flotaValida) {
      configuracionesValidas++;
      for (let f = 0; f < TAMANIO; f++) {
        for (let c = 0; c < TAMANIO; c++) {
          if (tableroSimulado[f][c]) {
            matrizConteo[f][c]++;
          }
        }
      }
    }
  }

  // Calcular las configuraciones válidas con barco en c / Total configuraciones válidas
  let mejorCelda = { fila: 0, col: 0, prob: -1 };
  const celdasLibres = [];

  for (let f = 0; f < TAMANIO; f++) {
    for (let c = 0; c < TAMANIO; c++) {
      const estado = tableroEstado[f][c];
      const yaAtacada = estado === 'agua' || estado === 'impacto' || estado === 'hundido';

      if (!yaAtacada) {
        celdasLibres.push({ fila: f, col: c });
        const prob = configuracionesValidas > 0 ? matrizConteo[f][c] / configuracionesValidas : 0;
        matrizProbabilidades[f][c] = prob;

        if (prob > mejorCelda.prob) {
          mejorCelda = { fila: f, col: c, prob };
        }
      }
    }
  }

  // Respaldo si las simulaciones aleatorias no lograron encajar todos los impactos activos
  if (configuracionesValidas === 0 && celdasLibres.length > 0) {
    const az = celdasLibres[Math.floor(Math.random() * celdasLibres.length)];
    mejorCelda = { fila: az.fila, col: az.col, prob: 0.1 };
    matrizProbabilidades[az.fila][az.col] = 0.1;
  }

  const tiempoEjecucion = performance.now() - tiempoInicio;

  return {
    matrizProbabilidades,
    configuracionesValidas,
    tiempoEjecucion,
    mejorCelda,
  };
}