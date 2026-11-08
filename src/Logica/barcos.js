export const TAMANIO = 10;

export const FLOTA = [
  { id: 'portaaviones', nombre: 'Portaaviones', tam: 5 },
  { id: 'acorazado',    nombre: 'Acorazado',    tam: 4 },
  { id: 'crucero',      nombre: 'Crucero',      tam: 3 },
  { id: 'submarino',    nombre: 'Submarino',    tam: 3 },
  { id: 'destructor',   nombre: 'Destructor',   tam: 2 },
];

export const ESTADOS = {
  VACIO: 'vacio',       // Casilla sin disparar
  AGUA: 'agua',         // Disparo fallido
  IMPACTO: 'impacto',   // Acierto en barco 
  HUNDIDO: 'hundido',   // Barco destruido
};