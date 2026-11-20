import { useState } from 'react';
import { FLOTA } from '../Logica/barcos';
import { ORIENTACIONES } from '../Logica/colocacionBarcos';

/**
 * muestra el tablero del jugador con su flota, permite mover o rotar los barcos antes de iniciar
 * y pinta los disparos que va recibiendo de la IA (agua, impacto o hundido)
 *
 * @param {object} props propiedades del componente
 * @param {Array<Array<object>>} props.tablero matriz 10x10 con la posición de los barcos del jugador
 * @param {Array<object>} [props.barcos=[]] lista con la información de cada barco (celdas, orientación y estado)
 * @param {Array<Array<string|null>>} props.ataquesRecibidos matriz 10x10 con los disparos que ha hecho la IA sobre este tablero
 * @param {Function} props.random función para acomodar todos los barcos del jugador al azar
 * @param {Function} props.onMoverBarco callback que valida y actualiza la nueva posición u orientación de un barco
 * @param {boolean} [props.puedeMover=true] habilita o bloquea mover y rotar barcos (se bloquea cuando inicia la partida)
 */
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

  /**
   * Selecciona un barco al hacer clic sobre él, o mueve el barco ya seleccionado hacia una casilla libre
   *
   * @param {number} f fila de la casilla tocada.
   * @param {number} c columna de la casilla tocada.
   */
  const manejarRotar = () => {
    if (!puedeMover || !seleccionadoId || !onMoverBarco) return;
    const barco = barcos.find((b) => b.id === seleccionadoId);
    if (!barco) return;

    const [filaInicio, colInicio] = barco.celdas[0];
    const idxActual = ORIENTACIONES.indexOf(barco.orientacion);
    const nuevaOrientacion = ORIENTACIONES[(idxActual + 1) % ORIENTACIONES.length];
    onMoverBarco(seleccionadoId, filaInicio, colInicio, nuevaOrientacion);
  };

  /** Gira el barco seleccionado entre las 4 direcciones disponibles (horizontal, vertical y diagonales). */
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
                let clasesCelda = 'celda';
                
                const ataqueIA = ataquesRecibidos ? ataquesRecibidos[f][c] : null;
                const barcoAsociado = celda.barcoId ? barcos.find(b => b.id === celda.barcoId) : null;
                
                // Verificación doble, comprueba si el barco ya está marcado como hundido 
                // O si todas las casillas de sus celdas ya registran 'impacto' en la matriz de la IA
                const estaHundido = barcoAsociado && (
                  barcoAsociado.hundido || 
                  barcoAsociado.celdas.every(celdaBarco => {
                    const fCoord = celdaBarco.fila ?? celdaBarco[0];
                    const cCoord = celdaBarco.col ?? celdaBarco[1];
                    return ataquesRecibidos && ataquesRecibidos[fCoord] && ataquesRecibidos[fCoord][cCoord] === 'impacto';
                  })
                );

                // Prioridad máxima, Si el barco está hundido, se pinta de hundido
                if (estaHundido) {
                  clasesCelda += ' celda-hundido';
                } else {
                  if (celda.barcoId) clasesCelda += ` barco-${celda.barcoId}`;

                  if (ataqueIA === 'agua') {
                    clasesCelda += ' celda-agua';
                  } else if (ataqueIA === 'impacto') {
                    clasesCelda += ' celda-impacto';
                  }
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
      </div>
    </div>
  );
}