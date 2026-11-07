import { TAMANIO, ESTADOS } from './barcos';

//crea el tablero 
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


//registra el disparo
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