import { useState, useEffect } from 'react';
import { TAMANIO } from '../Logica/barcos';
import { ejecutarSimulacionProbabilistica } from '../Logica/algoritmoProbabilistico';
import { verificarVictoria } from '../Logica/juego';

export default function TableroEnemigo({ flotaSecreta, onReiniciar }) {
  const [tableroEstado, setTableroEstado] = useState(
    Array.from({ length: TAMANIO }, () => Array(TAMANIO).fill(null))
  );

  const [resultadoAlgoritmo, setResultadoAlgoritmo] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [juegoTerminado, setJuegoTerminado] = useState(false);

  // Reiniciar estado visual del tablero enemigo cada vez que cambie la flota secreta externa
  useEffect(() => {
    setTableroEstado(Array.from({ length: TAMANIO }, () => Array(TAMANIO).fill(null)));
    setJuegoTerminado(false);
  }, [flotaSecreta]);

  // Recalcular probabilidades cada vez que cambia el tablero o el estado de la partida
  useEffect(() => {
    if (tableroEstado.length > 0 && !juegoTerminado) {
      calcularProbabilidades();
    }
  }, [tableroEstado, juegoTerminado]);

  const calcularProbabilidades = () => {
    setCargando(true);
    setTimeout(() => {
      const resultado = ejecutarSimulacionProbabilistica(tableroEstado);
      setResultadoAlgoritmo(resultado);
      setCargando(false);
    }, 10);
  };

  const handleDisparar = (fila, col) => {
    if (juegoTerminado || tableroEstado[fila][col] !== null) return;

    const hayBarco = flotaSecreta[fila][col].barcoId !== null;
    const resultadoDisparo = hayBarco ? 'impacto' : 'agua';

    const nuevoTablero = tableroEstado.map((f, fIdx) =>
      f.map((c, cIdx) => {
        if (fIdx === fila && cIdx === col) {
          return resultadoDisparo;
        }
        return c;
      })
    );

    setTableroEstado(nuevoTablero);

    // Validar si con este disparo se ganó la partida
    if (verificarVictoria(nuevoTablero, flotaSecreta)) {
      setJuegoTerminado(true);
    }
  };

  const usarRecomendacion = () => {
    if (resultadoAlgoritmo && resultadoAlgoritmo.mejorCelda && !juegoTerminado) {
      const { fila, col } = resultadoAlgoritmo.mejorCelda;
      handleDisparar(fila, col);
    }
  };

  return (
    <div className="panel-enemigo">
      {juegoTerminado ? (
        <div className="caja-estadisticas" style={{ backgroundColor: '#22c55e', color: 'white' }}>
          <h2 style={{ margin: '0 0 8px 0' }}>¡VICTORIA!</h2>
          <p style={{ margin: '0 0 12px 0' }}>¡Has hundido toda la flota enemiga con éxito!</p>
          <button className="btn-recomendar" onClick={onReiniciar}>
            Reiniciar Partida
          </button>
        </div>
      ) : (
        resultadoAlgoritmo && (
          <div className="caja-estadisticas">
            <div>
              Objetivo recomendado:{' '}
              <span className="txt-destacado">
                {String.fromCharCode(65 + resultadoAlgoritmo.mejorCelda.fila)}
                {resultadoAlgoritmo.mejorCelda.col + 1}
              </span>{' '}
              ({(resultadoAlgoritmo.mejorCelda.prob * 100).toFixed(1)}%)
            </div>
            <div className="txt-secundario">
              Tiempo: {resultadoAlgoritmo.tiempoEjecucion.toFixed(2)} ms
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '8px' }}>
              <button className="btn-recomendar" onClick={usarRecomendacion}>
                Disparar a Recomendación
              </button>
              <button className="btn-sim" onClick={onReiniciar}>
                Reiniciar Flota
              </button>
            </div>
          </div>
        )
      )}

      {cargando && !juegoTerminado && <div className="txt-secundario">Calculando probabilidades...</div>}

      <div className="marco-tablero">
        <div className="rejilla">
          {tableroEstado.map((fila, fIdx) =>
            fila.map((estadoCelda, cIdx) => {
              const prob = resultadoAlgoritmo
                ? resultadoAlgoritmo.matrizProbabilidades[fIdx][cIdx]
                : 0;

              const esRecomendada =
                !juegoTerminado &&
                resultadoAlgoritmo &&
                resultadoAlgoritmo.mejorCelda.fila === fIdx &&
                resultadoAlgoritmo.mejorCelda.col === cIdx;

              const fondoDinamico =
                estadoCelda === 'agua'
                  ? '#64748b'
                  : estadoCelda === 'impacto'
                  ? '#ef4444'
                  : `rgba(239, 68, 68, ${Math.max(prob * 0.9, 0.05)})`;

              return (
                <div
                  key={`${fIdx}-${cIdx}`}
                  className={`celda celda-enemigo ${esRecomendada ? 'celda-recomendada' : ''}`}
                  style={{ backgroundColor: fondoDinamico, cursor: juegoTerminado ? 'default' : 'pointer' }}
                  onClick={() => handleDisparar(fIdx, cIdx)}
                  title={`Probabilidad: ${(prob * 100).toFixed(1)}%`}
                >
                  {estadoCelda === null && !juegoTerminado && `${(prob * 100).toFixed(0)}%`}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}