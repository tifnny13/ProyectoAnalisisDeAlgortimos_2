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
    <div className="tarjeta-jugador">
      {/* Cabecera */}
      <div className="cabecera-jugador">
        <h2 className="subtitulo-panel">Tu Tablero</h2>

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
      </div>

      {/* Cuerpo: Controles a la izquierda + Tablero a la derecha */}
      <div className="cuerpo-jugador">
        <div className="barra-lateral">
          <div className="leyenda-estados">
            <div className="fila-estado">
              <span className="cuadrito-estado celda-impacto" />
              <span>= Impacto</span>
            </div>
            <div className="fila-estado">
              <span className="cuadrito-estado celda-agua" />
              <span>= Agua</span>
            </div>
          </div>

          <div className="rejilla-botones">
            <div className="item-boton">
              <button
                className="btn-circular"
                onClick={() => {
                  setSeleccionadoId(null);
                  random();
                }}
                disabled={!puedeMover}
              >
                🎲
              </button>
              <span>Random</span>
            </div>

            <div className="item-boton">
              <button
                className="btn-circular"
                onClick={() => manejarDesplazar(-1, 0)}
                disabled={!puedeMover || !seleccionadoId}
              >
                ⬆️
              </button>
              <span>Arriba</span>
            </div>

            <div className="item-boton">
              <button
                className="btn-circular"
                onClick={() => manejarDesplazar(1, 0)}
                disabled={!puedeMover || !seleccionadoId}
              >
                ⬇️
              </button>
              <span>Abajo</span>
            </div>

            <div className="item-boton">
              <button
                className="btn-circular"
                onClick={() => manejarDesplazar(0, -1)}
                disabled={!puedeMover || !seleccionadoId}
              >
                ⬅️
              </button>
              <span>Izq</span>
            </div>

            <div className="item-boton">
              <button
                className="btn-circular"
                onClick={() => manejarDesplazar(0, 1)}
                disabled={!puedeMover || !seleccionadoId}
              >
                ➡️
              </button>
              <span>Der</span>
            </div>

            <div className="item-boton">
              <button
                className="btn-circular"
                onClick={manejarRotar}
                disabled={!puedeMover || !seleccionadoId}
              >
                🔄
              </button>
              <span>Rotar</span>
            </div>
          </div>
        </div>

        {/* Cuadrícula del juego */}
        <div className="marco-tablero">
          <div className="rejilla">
            {tablero.map((fila, f) =>
              fila.map((celda, c) => {
                const ataqueIA = ataquesRecibidos ? ataquesRecibidos[f][c] : null;

                let clasesCelda = 'celda';
                if (celda.barcoId) clasesCelda += ` barco-${celda.barcoId}`;
                if (ataqueIA === 'agua') clasesCelda += ' celda-agua';
                else if (ataqueIA === 'impacto') clasesCelda += ' celda-impacto';
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
      </div>
    </div>
  );
}