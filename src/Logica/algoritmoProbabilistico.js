import { TAMANIO, FLOTA } from './barcos';

export function ejecutarSimulacionProbabilistica(tableroEstado) {
  const tiempoInicio = performance.now();
  const matrizProbabilidades = Array.from({ length: TAMANIO }, () => Array(TAMANIO).fill(0));
  
  // 1. MODO DESTRUCCIÓN (Target Mode): Si hay un impacto activo, priorizamos celdas adyacentes
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
            if (tableroEstado[v.fila][v.col] === null) {
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
    // 2. MODO CAZA (Hunt Mode): Conteo basado en los tamaños de los barcos de FLOTA
    const conteo = Array.from({ length: TAMANIO }, () => Array(TAMANIO).fill(0));

    for (const barco of FLOTA) {
      const tam = barco.tam; // Usamos la propiedad 'tam' de cada barco de barcos.js

      // Probar todas las posiciones posibles en horizontal
      for (let f = 0; f < TAMANIO; f++) {
        for (let c = 0; c <= TAMANIO - tam; c++) {
          let cabe = true;
          for (let i = 0; i < tam; i++) {
            if (tableroEstado[f][c + i] === 'agua') {
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

      // Probar todas las posiciones posibles en vertical
      for (let f = 0; f <= TAMANIO - tam; f++) {
        for (let c = 0; c < TAMANIO; c++) {
          let cabe = true;
          for (let i = 0; i < tam; i++) {
            if (tableroEstado[f + i][c] === 'agua') {
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
        if (tableroEstado[f][c] === null && conteo[f][c] > maxConteo) {
          maxConteo = conteo[f][c];
        }
      }
    }

    // Llenar la matriz de probabilidades normalizada y buscar la mejor celda
    for (let f = 0; f < TAMANIO; f++) {
      for (let c = 0; c < TAMANIO; c++) {
        const yaAtacada = tableroEstado[f][c] === 'agua' || tableroEstado[f][c] === 'impacto';

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

    // Plan de respaldo por si el tablero se llena demasiado
    if (mejorCelda.prob === -1) {
      const celdasLibres = [];
      for (let f = 0; f < TAMANIO; f++) {
        for (let c = 0; c < TAMANIO; c++) {
          if (tableroEstado[f][c] === null) {
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