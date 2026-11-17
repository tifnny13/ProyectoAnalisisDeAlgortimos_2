import { TAMANIO, FLOTA } from './barcos';

export function ejecutarSimulacionProbabilistica(tableroEstado) {
  const tiempoInicio = performance.now();
  const matrizProbabilidades = Array.from({ length: TAMANIO }, () => Array(TAMANIO).fill(0));
  
  // Función auxiliar para verificar si una celda ya fue atacada o descartada
  const celdaAtacadaOInvalida = (f, c) => {
    const estado = tableroEstado[f][c];
    return estado === 'agua' || estado === 'impacto' || estado === 'hundido';
  };

  // 1. MODO DESTRUCCIÓN (Target Mode): Si hay un impacto activo, priorizamos celdas adyacentes libres
  const celdasAdyacentes = [];
  for (let f = 0; f < TAMANIO; f++) {
    for (let c = 0; c < TAMANIO; c++) {
      if (tableroEstado[f][c] === 'impacto') {
        const vecinos = [
          { fila: f - 1, col: c },
          { fila: f + 1, col: c },
          { fila: f, col: c - 1 },
          { fila: f, col: c + 1 }
        ];
        for (const v of vecinos) {
          if (v.fila >= 0 && v.fila < TAMANIO && v.col >= 0 && v.col < TAMANIO) {
            if (!celdaAtacadaOInvalida(v.fila, v.col)) {
              if (!celdasAdyacentes.some(cell => cell.fila === v.fila && cell.col === v.col)) {
                celdasAdyacentes.push(v);
              }
            }
          }
        }
      }
    }
  }

  let mejorCelda = { fila: 0, col: 0, prob: -1 };

  if (celdasAdyacentes.length > 0) {
    // Si hay impactos, atacamos directamente a los vecinos con máxima prioridad
    const objetivo = celdasAdyacentes[Math.floor(Math.random() * celdasAdyacentes.length)];
    matrizProbabilidades[objetivo.fila][objetivo.col] = 1.0;
    mejorCelda = { fila: objetivo.fila, col: objetivo.col, prob: 1.0 };
  } else {
    // 2. MODO CAZA (Hunt Mode)
    const conteo = Array.from({ length: TAMANIO }, () => Array(TAMANIO).fill(0));

    for (const barco of FLOTA) {
      const tam = barco.tam;

      // Horizontal
      for (let f = 0; f < TAMANIO; f++) {
        for (let c = 0; c <= TAMANIO - tam; c++) {
          let cabe = true;
          for (let i = 0; i < tam; i++) {
            // Se descarta si hay agua o un barco hundido bloqueando
            if (tableroEstado[f][c + i] === 'agua' || tableroEstado[f][c + i] === 'hundido') {
              cabe = false;
              break;
            }
          }
          if (cabe) {
            for (let i = 0; i < tam; i++) {
              conteo[f][c + i]++;
            }
          }
        }
      }

      // Vertical
      for (let f = 0; f <= TAMANIO - tam; f++) {
        for (let c = 0; c < TAMANIO; c++) {
          let cabe = true;
          for (let i = 0; i < tam; i++) {
            if (tableroEstado[f + i][c] === 'agua' || tableroEstado[f + i][c] === 'hundido') {
              cabe = false;
              break;
            }
          }
          if (cabe) {
            for (let i = 0; i < tam; i++) {
              conteo[f + i][c]++;
            }
          }
        }
      }
    }

    // Encontrar el valor máximo para normalizar los porcentajes entre 0 y 1
    let maxConteo = 0;
    for (let f = 0; f < TAMANIO; f++) {
      for (let c = 0; c < TAMANIO; c++) {
        if (!celdaAtacadaOInvalida(f, c) && conteo[f][c] > maxConteo) {
          maxConteo = conteo[f][c];
        }
      }
    }

    for (let f = 0; f < TAMANIO; f++) {
      for (let c = 0; c < TAMANIO; c++) {
        const yaAtacada = celdaAtacadaOInvalida(f, c);

        if (!yaAtacada && maxConteo > 0) {
          matrizProbabilidades[f][c] = conteo[f][c] / maxConteo;
        } else {
          matrizProbabilidades[f][c] = 0;
        }

        if (!yaAtacada && matrizProbabilidades[f][c] > mejorCelda.prob) {
          mejorCelda = { fila: f, col: c, prob: matrizProbabilidades[f][c] };
        }
      }
    }

    // Plan de respaldo si no encuentra nada óptimo
    if (mejorCelda.prob === -1) {
      const celdasLibres = [];
      for (let f = 0; f < TAMANIO; f++) {
        for (let c = 0; c < TAMANIO; c++) {
          if (!celdaAtacadaOInvalida(f, c)) {
            celdasLibres.push({ fila: f, col: c });
            matrizProbabilidades[f][c] = 0.10;
          }
        }
      }
      if (celdasLibres.length > 0) {
        const az = celdasLibres[Math.floor(Math.random() * celdasLibres.length)];
        mejorCelda = { fila: az.fila, col: az.col, prob: 0.10 };
      }
    }
  }

  const tiempoEjecucion = performance.now() - tiempoInicio;

  return {
    matrizProbabilidades,
    configuracionesValidas: 1,
    tiempoEjecucion,
    mejorCelda,
  };
}