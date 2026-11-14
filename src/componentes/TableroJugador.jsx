import { FLOTA } from '../Logica/barcos';

export default function TableroJugador({ tablero, ataquesRecibidos, random }) {
  // 3 a la izquierda, 2 a la derecha
  const izquierda = FLOTA.slice(0, 3); // Portaaviones, Acorazado, Crucero
  const derecha = FLOTA.slice(3, 5);   // Submarino, Destructor

  return (
    <div className="contenedor">
      {/* 1. Cajita de colores arriba */}
      <div className="caja-leyenda">
        <div className="columna">
          {izquierda.map((barco) => (
            <div key={barco.id} className="fila-barco">
              <span className={`cuadrito barco-${barco.id}`} />
              <span>{barco.nombre}</span>
            </div>
          ))}
        </div>

        <div className="columna">
          {derecha.map((barco) => (
            <div key={barco.id} className="fila-barco">
              <span className={`cuadrito barco-${barco.id}`} />
              <span>{barco.nombre}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Cuadrícula del juego */}
      <div className="marco-tablero">
        <div className="rejilla">
          {tablero.map((fila, f) =>
            fila.map((celda, c) => {
              // Verificamos si la IA atacó esta celda específica
              const ataqueIA = ataquesRecibidos ? ataquesRecibidos[f][c] : null;

              let clasesCelda = 'celda';
              if (celda.barcoId) {
                clasesCelda += ` barco-${celda.barcoId}`;
              }

              if (ataqueIA === 'agua') {
                clasesCelda += ' celda-agua';
              } else if (ataqueIA === 'impacto') {
                clasesCelda += ' celda-impacto';
              }

              return <div key={`${f}-${c}`} className={clasesCelda} />;
            })
          )}
        </div>
      </div>

      {/* 3. Botón redondo abajo */}
      <button className="btn-random" onClick={random}>
        <span className="dado">🎲</span>
        <span className="texto-btn">Random</span>
      </button>
    </div>
  );
}