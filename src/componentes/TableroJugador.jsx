import { useState } from 'react';
import { FLOTA } from '../Logica/barcos';

export default function TableroJugador({ tablero, barcos=[], ataquesRecibidos, random, onMoverBarco, puedeMover=true }) {
  // 3 a la izquierda, 2 a la derecha
  const izquierda = FLOTA.slice(0, 3); // Portaaviones, Acorazado, Crucero
  const derecha = FLOTA.slice(3, 5);   // Submarino, Destructor

  const [seleccionadoId, setSeleccionadoId] = useState(null);

  const manejarClicCelda = (f, c) => {
    if (!puedeMover) return;
    const celda = tablero[f][c];

    if (celda.barcoId) {
      setSeleccionadoId(celda.barcoId === seleccionadoId ? null : celda.barcoId);
      return;
    }

    if (seleccionadoId && onMoverBarco) {
      const barco = barcos.find((b) => b.id === seleccionadoId);
      if (barco) onMoverBarco(seleccionadoId, f, c, barco.orientacion);
    }
  };

  const manejarRotar = () => {
    if (!puedeMover || !seleccionadoId || !onMoverBarco) return;
    const barco = barcos.find((b) => b.id === seleccionadoId);
    if (!barco) return;

    const [filaInicio, colInicio] = barco.celdas[0];
    const nuevaOrientacion = barco.orientacion === 'horizontal' ? 'vertical' : 'horizontal';
    onMoverBarco(seleccionadoId, filaInicio, colInicio, nuevaOrientacion);
  };

  const manejarDesplazar = (cambioFila, cambioCol) => {
    if (!puedeMover || !seleccionadoId || !onMoverBarco) return;
    const barco = barcos.find((b) => b.id === seleccionadoId);
    if (!barco) return;

    const [filaInicio, colInicio] = barco.celdas[0];
    onMoverBarco(
      seleccionadoId,
      filaInicio + cambioFila,
      colInicio + cambioCol,
      barco.orientacion
    );
  };

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

              if (puedeMover && celda.barcoId && celda.barcoId === seleccionadoId) {
                clasesCelda += ' celda-seleccionada';
              }

              return (
                <div 
                  key={`${f}-${c}`} 
                  className={clasesCelda}
                  onClick={() => manejarClicCelda(f, c)}
                />
              );
            })
          )}
        </div>
      </div>

      {/* 3. Botones */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center'}}>
        <button
          className="btn-random"
          onClick={() => {
            setSeleccionadoId(null);
            random();
          }}
          disabled={!puedeMover}
        >
          <span className="dado">🎲</span>
          <span className="texto-btn">Random</span>
        </button>

        {puedeMover && seleccionadoId && (
          <>
            <button className="btn-random" onClick={() => manejarDesplazar(-1, 0)}>
              <span className="dado">⬆️</span>
              <span className="texto-btn">Arriba</span>
            </button>

            <button className="btn-random" onClick={() => manejarDesplazar(1, 0)}>
              <span className="dado">⬇️</span>
              <span className="texto-btn">Abajo</span>
            </button>

            <button className="btn-random" onClick={() => manejarDesplazar(0, -1)}>
              <span className="dado">⬅️</span>
              <span className="texto-btn">Izq</span>
            </button>

            <button className="btn-random" onClick={() => manejarDesplazar(0, 1)}>
              <span className="dado">➡️</span>
              <span className="texto-btn">Der</span>
            </button>

            <button className="btn-random" onClick={manejarRotar}>
              <span className="dado">🔄</span>
              <span className="texto-btn">Rotar</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}