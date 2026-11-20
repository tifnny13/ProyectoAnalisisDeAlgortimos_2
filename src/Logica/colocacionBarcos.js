import { TAMANIO, FLOTA } from './barcos';

// pasos para calcular las celdas ocupadas por un barco según su dirección
const PASOS = {
  horizontal: { pasoFila: 0, pasoCol: 1 },
  vertical:   { pasoFila: 1, pasoCol: 0 },
  diagonalDer:  { pasoFila: 1, pasoCol: 1 },   // Baja hacia la derecha (\)
  diagonalIzq:  { pasoFila: 1, pasoCol: -1 },  // Baja hacia la izquierda (/)
};

//lista de todas las orientaciones posibles para los barcos
export const ORIENTACIONES = Object.keys(PASOS);

/**
 * Calcula las coordenadas [fila, col] que ocupara el barco
 * @param {number} tam largo del barco (cantidad de casillas)
 * @param {number} fila Fila donde empieza el barco
 * @param {number} col columna donde empieza el barco
 * @param {string} orientacion Dirección del barco (horizontal, vertical, diagonalDer o diagonalIzq)
 * @returns {Array<number[]>} Lista de [fila, col] con todas las casillas que ocupa el barco
 */
export function calcularCeldas(tam, fila, col, orientacion) {
  const { pasoFila, pasoCol } = PASOS[orientacion] || PASOS.horizontal;
  return Array.from({ length: tam }, (_, i) => [
    fila + i * pasoFila,
    col + i * pasoCol,
  ]);
}


/**
 * Revisa si un conjunto de casillas cabe dentro del tablero y no choca con otros barcos
 *
 * @param {Array<Array<object>>} tablero Matriz 10x10 del tablero actual
 * @param {Array<number[]>} celdas Lista de coordenadas [fila, col] a validar
 * @param {string|null} [miId=null]  ID del barco que se está moviendo (para no chocar consigo mismo)
 * @returns {boolean} True si todas las casillas están dentro y libres, y  false si algo estorba o se sale
 */
export function cabeBarco(tablero, celdas, miId = null) {
  return celdas.every(([f, c]) => {
    const dentroTablero = f >= 0 && f < TAMANIO && c >= 0 && c < TAMANIO;
    if (!dentroTablero) return false;

    const ocupadoPor = tablero[f][c].barcoId;
    return ocupadoPor === null || ocupadoPor === miId;
  });
}

/**
 * Limpia el tablero y coloca los 5 barcos de la flota en forma aleatoria
 *
 * @param {Array<Array<object>>} tablero matriz 10x10 donde se van a colocar los barcos
 * @returns {Array<object>} lista de los 5 barcos ya colocados con sus celdas y estado inicial
 */

export function colocarFlotaAleatoria(tablero) {
//Limpiar tablero
  for (let f = 0; f < TAMANIO; f++) {
    for (let c = 0; c < TAMANIO; c++) {
      tablero[f][c].barcoId = null;
    }
  }

  const barcos = [];

  for (const barco of FLOTA) {
    let colocado = false;

    while (!colocado) {
      const orientacion = ORIENTACIONES[Math.floor(Math.random() * ORIENTACIONES.length)]; //elige una orientación aleatoria
      const fila = Math.floor(Math.random() * TAMANIO);
      const col = Math.floor(Math.random() * TAMANIO);

      const celdas = calcularCeldas(barco.tam, fila, col, orientacion);

      if (cabeBarco(tablero, celdas)) {
        for (const [f, c] of celdas) {
          tablero[f][c].barcoId = barco.id;
        }

        barcos.push({
          ...barco,
          celdas,
          orientacion,
          hundido: false,
        });

        colocado = true;
      }
    }
  }

  return barcos;
}

/**
 * Mueve o rota un barco en el tablero si la nueva posición lo permite 
 *
 * @param {Array<Array<object>>} tablero Matriz 10x10 del tablero del jugador
 * @param {Array<object>} barcos llista de barcos actuales en el tablero
 * @param {string} barcoId  ID del barco que se quiere mover o rotar
 * @param {number} nuevaFila  Nueva fila inicial
 * @param {number} nuevaCol  Nueva columna inicial
 * @param {string} nuevaOrientacion  Nueva dirección del barco
 * @returns {boolean} True si se pudo mover/rotar, y false si se salía o chocaba con otro barco
 */
export function moverBarco(tablero, barcos, barcoId, nuevaFila, nuevaCol, nuevaOrientacion) {
  const barco = barcos.find(b => b.id === barcoId);
  if (!barco) return false;

  const nuevasCeldas = calcularCeldas(barco.tam, nuevaFila, nuevaCol, nuevaOrientacion);

//Si se sale o choca con otro barco, cancela el movimiento
  if (!cabeBarco(tablero, nuevasCeldas, barcoId)) return false;

//Limpiar las celdas anteriores
  for (const [f, c] of barco.celdas) {
    tablero[f][c].barcoId = null;
  }

//Marcar celdas nuevas
  for (const [f, c] of nuevasCeldas) {
    tablero[f][c].barcoId = barco.id;
  }

  barco.celdas = nuevasCeldas;
  barco.orientacion = nuevaOrientacion;
  return true;
}

