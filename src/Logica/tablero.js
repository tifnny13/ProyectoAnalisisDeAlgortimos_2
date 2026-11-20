import { TAMANIO, ESTADOS } from './barcos';

/**
 * Crea una matriz vacía de 10x10 casillas (el tablero) lista para empezar una partida
 *
 * @returns {Array<Array<{ fila: number, col: number, estado: string, barcoId: string|null }>>} Tablero inicial con todas las casillas vacías y sin barcos
 */ 
export function crearTablero() {
  const tablero = [];

  for (let f = 0; f < TAMANIO; f++) {
    const fila = [];
    for (let c = 0; c < TAMANIO; c++) {
      fila.push({
        fila: f,
        col: c,
        estado: ESTADOS.VACIO,
        barcoId: null,
      });
    }
    tablero.push(fila);
  }

  return tablero;
}

/**
 * Registra un disparo en la casilla [f, c] y actualiza su estado (agua, impacto o hundido)
 *
 * @param {Array<Array<object>>} tablero matriz 10x10 del tablero que recibe el disparo
 * @param {Array<object>} barcos lista de barcos colocados en ese tablero
 * @param {number} f fila donde cae el disparo
 * @param {number} c columna donde cae el disparo
 * @returns {{ tipo: string, barcoHundido: object|null }|null} Resultado del disparo (agua, impacto o hundido) y el barco si se hundió, o null si esa casilla ya había sido atacada
 */

export function recibirDisparo(tablero, barcos, f, c) {
  const celda = tablero[f][c];

  //si ya se le disparo antes
  if (celda.estado !== ESTADOS.VACIO) return null; 

  // agua, no habia barco en la celda
  if (celda.barcoId === null) {
    celda.estado = ESTADOS.AGUA;
    return { tipo: ESTADOS.AGUA, barcoHundido: null };
  }

  // Impacto porque habia un barco en la celda
  celda.estado = ESTADOS.IMPACTO;
  const barco = barcos.find((b) => b.id === celda.barcoId);

  // revisar si todas las casillas del barco ya fueron tocadas
  let todasImpactadas = true;
  for (let i = 0; i < barco.celdas.length; i++) {
    const [bf, bc] = barco.celdas[i];
    if (tablero[bf][bc].estado !== ESTADOS.IMPACTO) {
      todasImpactadas = false;
      break;
    }
  }

  // si todas fueron impactadas se hunde el barco
  if (todasImpactadas) {
    barco.hundido = true;
    for (let i = 0; i < barco.celdas.length; i++) {
      const [bf, bc] = barco.celdas[i];
      tablero[bf][bc].estado = ESTADOS.HUNDIDO;
    }
  }

  return {
    tipo: todasImpactadas ? ESTADOS.HUNDIDO : ESTADOS.IMPACTO,
    barcoHundido: todasImpactadas ? barco : null,
  };
}