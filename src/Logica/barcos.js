export const TAMANIO = 10; // tamaño del tablero (10x10)

export const FLOTA = [ //  lista de los 5 barcos
  { id: 'portaaviones', nombre: 'Portaaviones', tam: 5 },
  { id: 'acorazado',    nombre: 'Acorazado',    tam: 4 },
  { id: 'crucero',      nombre: 'Crucero',      tam: 3 },
  { id: 'submarino',    nombre: 'Submarino',    tam: 3 },
  { id: 'destructor',   nombre: 'Destructor',   tam: 2 },
];
 //Posibles estados de los barcos
export const ESTADOS = { 
  VACIO: 'vacio',       // Casilla sin disparar
  AGUA: 'agua',         // Disparo fallido
  IMPACTO: 'impacto',   // Acierto en barco 
  HUNDIDO: 'hundido',   // Barco destruido
};