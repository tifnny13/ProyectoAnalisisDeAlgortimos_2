import { TAMANIO, FLOTA } from './barcos';

// pasos para calcular las celdas ocupadas por un barco según su dirección
const PASOS = {
  horizontal: { pasoFila: 0, pasoCol: 1 },
  vertical:   { pasoFila: 1, pasoCol: 0 },
};

//Calcula las coordenadas [fila, col] que ocupara el barco
export function calcularCeldas(tam, fila, col, orientacion) {
  const { pasoFila, pasoCol } = PASOS[orientacion];
  return Array.from({ length: tam }, (_, i) => [
    fila + i * pasoFila,
    col + i * pasoCol,
  ]);
}

export function cabeBarco(tablero, celdas, miId = null) {
  return celdas.every(([f, c]) => {
    const dentroTablero = f >= 0 && f < TAMANIO && c >= 0 && c < TAMANIO;
    if (!dentroTablero) return false;

    const ocupadoPor = tablero[f][c].barcoId;
    return ocupadoPor === null || ocupadoPor === miId;
  });
}


//Coloca aleatoriamente los 5 barcos
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
      const orientacion = Math.random() < 0.5 ? 'horizontal' : 'vertical';
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

//Mueve o rota un barco cuando el usuario lo desee
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

