import { useState, useEffect } from 'react';
import { crearTablero } from './Logica/tablero';
import { colocarFlotaAleatoria, moverBarco } from './Logica/colocacionBarcos';
import { verificarVictoria } from './Logica/juego';
import { TAMANIO } from './Logica/barcos';
import { calcularAtaqueIA } from './Logica/jugadorIA'; 
import TableroJugador from './componentes/TableroJugador';
import TableroEnemigo from './componentes/TableroEnemigo';
import './App.css';

export default function App() {
  const [flotaJugador, setFlotaJugador] = useState([]);
  const [flotaEnemigaOculta, setFlotaEnemigaOculta] = useState([]);

  const [disparosIAEnJugador, setDisparosIAEnJugador] = useState(
    Array.from({ length: TAMANIO }, () => Array(TAMANIO).fill(null))
  );

  const [turno, setTurno] = useState('jugador');
  const [estadoPartida, setEstadoPartida] = useState('jugando');
  const [barcosJugador, setBarcosJugador] = useState([]);
  const [partidaIniciada, setPartidaIniciada] = useState(false);

  // Estadísticas ampliadas según la Sección 9 del documento oficial
  const [estadisticas, setEstadisticas] = useState({
    disparosJugador: 0,
    impactosJugador: 0,
    fallidosJugador: 0,
    disparosIA: 0,
    impactosIA: 0,
    fallidosIA: 0,
  });

  useEffect(() => {
    reiniciarJuegoCompleto();
  }, []);

  const reiniciarJuegoCompleto = () => {
    const nuevoJugador = crearTablero();
    const listaBarcosJugador = colocarFlotaAleatoria(nuevoJugador);
    setFlotaJugador(nuevoJugador);
    setBarcosJugador(listaBarcosJugador);

    const nuevoEnemigo = crearTablero();
    colocarFlotaAleatoria(nuevoEnemigo);
    setFlotaEnemigaOculta(nuevoEnemigo);

    setDisparosIAEnJugador(Array.from({ length: TAMANIO }, () => Array(TAMANIO).fill(null)));
    setTurno('jugador');
    setEstadoPartida('jugando');
    setPartidaIniciada(false);
    setEstadisticas({
      disparosJugador: 0,
      impactosJugador: 0,
      fallidosJugador: 0,
      disparosIA: 0,
      impactosIA: 0,
      fallidosIA: 0,
    });
  };

  const [reinicios, setReinicios] = useState(0); //esto reinicia el juego, pero no reinicia laos datos del juego, solo reinicia el tablero y la flota.

  const reiniciarPartida = () => {
    setBarcosJugador(prev => prev.map(b => ({ ...b, hundido: false })));
    setDisparosIAEnJugador(Array.from({ length: TAMANIO }, () => Array(TAMANIO).fill(null)));
    setTurno('jugador');
    setEstadoPartida('jugando');
    setPartidaIniciada(false);
    setEstadisticas({
      disparosJugador: 0, impactosJugador: 0, fallidosJugador: 0,
      disparosIA: 0, impactosIA: 0, fallidosIA: 0,
    });
    setReinicios(r => r + 1);
  };

  // Turno automático de la IA
  useEffect(() => {
    if (turno === 'ia' && estadoPartida === 'jugando') {
      const timer = setTimeout(() => {
        const { nuevoDisparosIA } = calcularAtaqueIA(disparosIAEnJugador, flotaJugador);
        
        let esImpacto = false;
        let esAgua = false;
        let filaImpactada = -1;
        let colImpactada = -1;

        for (let f = 0; f < TAMANIO; f++) {
          for (let c = 0; c < TAMANIO; c++) {
            if (disparosIAEnJugador[f][c] === null && nuevoDisparosIA[f][c] === 'impacto') {
              esImpacto = true;
              filaImpactada = f;
              colImpactada = c;
            }
            if (disparosIAEnJugador[f][c] === null && nuevoDisparosIA[f][c] === 'agua') {
              esAgua = true;
            }
          }
        }

       // Si la IA acertó, actualizamos el estado de los barcos del jugador
        if (esImpacto) {
          setBarcosJugador(prevBarcos =>
            prevBarcos.map(barco => {
              // Verificamos si la celda impactada pertenece a este barco
              const pertenece = barco.celdas.some(
                c => (c.fila ?? c[0]) === filaImpactada && (c.col ?? c[1]) === colImpactada
              );

              if (!pertenece) return barco;

              // Actualizamos las celdas del barco marcando la impactada
              const celdasActualizadas = barco.celdas.map(c => {
                const fC = c.fila ?? c[0];
                const cC = c.col ?? c[1];
                const esEstaCelda = fC === filaImpactada && cC === colImpactada;
                return {
                  ...c,
                  impactado: c.impactado || esEstaCelda
                };
              });

              // Comprobamos si TODAS las celdas de este barco están impactadas
              // O validamos cruzando directamente con la matriz de ataques de la IA
              const estaHundido = celdasActualizadas.every(c => {
                if (c.impactado) return true;
                const fC = c.fila ?? c[0];
                const cC = c.col ?? c[1];
                return nuevoDisparosIA[fC][cC] === 'impacto';
              });

              return {
                ...barco,
                celdas: celdasActualizadas,
                hundido: estaHundido
              };
            })
          );
        }

        setDisparosIAEnJugador(nuevoDisparosIA);
        setEstadisticas(prev => ({
          ...prev,
          disparosIA: prev.disparosIA + 1,
          impactosIA: esImpacto ? prev.impactosIA + 1 : prev.impactosIA,
          fallidosIA: esAgua ? prev.fallidosIA + 1 : prev.fallidosIA,
        }));

        if (verificarVictoria(nuevoDisparosIA, flotaJugador)) {
          setEstadoPartida('victoria_ia');
        } else {
          setTurno('jugador');
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [turno, estadoPartida, disparosIAEnJugador, flotaJugador]);

  const handleDispararJugador = (nuevoTableroEnemigo, juegoTerminadoEnemigo, resultado) => {
    setPartidaIniciada(true);
    const esImpacto = resultado === 'impacto' || resultado === 'hundido';
    const esAgua = resultado === 'agua';

    setEstadisticas(prev => ({
      ...prev,
      disparosJugador: prev.disparosJugador + 1,
      impactosJugador: esImpacto ? prev.impactosJugador + 1 : prev.impactosJugador,
      fallidosJugador: esAgua ? prev.fallidosJugador + 1 : prev.fallidosJugador,
    }));

    if (juegoTerminadoEnemigo) {
      setEstadoPartida('victoria_jugador');
    } else {
      setTurno('ia');
    }
  };

  const manejarMoverBarco = (barcoId, nuevaFila, nuevaCol, nuevaOrientacion) => {
    if (partidaIniciada) return;

    const copiaTablero = flotaJugador.map(fila => fila.map(celda => ({ ...celda })));
    const copiaBarcos = barcosJugador.map(b => ({ ...b, celdas: [...b.celdas] }));

    if (moverBarco(copiaTablero, copiaBarcos, barcoId, nuevaFila, nuevaCol, nuevaOrientacion)) {
      setFlotaJugador(copiaTablero);
      setBarcosJugador(copiaBarcos);
    }
  };

  const barcosVivosJugador = barcosJugador.filter(b => !b.hundido).length;
  const barcosHundidosJugador = barcosJugador.filter(b => b.hundido).length;

  return (
    <div className="pantalla">
      <h1 className="titulo">Batalla Naval Probabilística</h1>

      {/* Panel completo de estadísticas (Sección 9) */}
      <div style={{
        backgroundColor: '#1e2636',
        border: '1px solid #334155',
        borderRadius: '14px',
        padding: '16px 24px',
        marginBottom: '20px',
        width: '100%',
        maxWidth: '1180px',
        boxSizing: 'border-box',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '12px',
        fontSize: '13px'
      }}>
        <div><b>Disparos Jugador:</b> <span style={{ color: '#38bdf8' }}>{estadisticas.disparosJugador}</span> (Aciertos: {estadisticas.impactosJugador} | Fallidos: {estadisticas.fallidosJugador})</div>
        <div><b>Disparos IA:</b> <span style={{ color: '#ef4444' }}>{estadisticas.disparosIA}</span> (Aciertos: {estadisticas.impactosIA} | Fallidos: {estadisticas.fallidosIA})</div>
        <div><b>Tus Barcos:</b> Vivos: <span style={{ color: '#22c55e' }}>{barcosVivosJugador}</span> | Hundidos: <span style={{ color: '#ef4444' }}>{barcosHundidosJugador}</span></div>
        <div><b>Algoritmo:</b> Heurístico | <b>Config. Válidas:</b> 1</div>
      </div>

      <div className="indicador-turno" style={{ textAlign: 'center', marginBottom: '20px', fontSize: '1.2rem', fontWeight: 'bold' }}>
        {estadoPartida === 'victoria_jugador' && <span style={{ color: '#22c55e' }}>¡VICTORIA! Has derrotado a la IA.</span>}
        {estadoPartida === 'victoria_ia' && <span style={{ color: '#ef4444' }}>¡DERROTA! La IA ha hundido tu flota.</span>}
        {estadoPartida === 'jugando' && (
          <span>Turno de: {turno === 'jugador' ? 'Tu turno (Ataca al enemigo)' : 'La IA está pensando su ataque...'}</span>
        )}
      </div>

      <div className="contenedor-tableros">
        {flotaJugador.length > 0 && (
          <TableroJugador 
            tablero={flotaJugador} 
            barcos={barcosJugador}
            ataquesRecibidos={disparosIAEnJugador} 
            random={reiniciarJuegoCompleto}
            onMoverBarco={manejarMoverBarco}
            puedeMover={!partidaIniciada && estadoPartida === 'jugando'}
          />
        )}

        <div className="tarjeta-enemigo">
          <h2 className="subtitulo-panel">Tablero Enemigo</h2>
          {flotaEnemigaOculta.length > 0 && (
            <TableroEnemigo 
              key={reinicios}
              flotaSecreta={flotaEnemigaOculta} 
              onReiniciar={reiniciarJuegoCompleto}
              onReiniciarPartida={reiniciarPartida}
              turnoJugador={turno === 'jugador' && estadoPartida === 'jugando'}
              onDispararRealizado={handleDispararJugador}
            />
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', marginTop: '24px', marginBottom: '20px' }}>
        <button className="btn-sim" onClick={reiniciarJuegoCompleto}>
          Generar Nueva Partida
        </button>
        <button className="btn-sim" onClick={reiniciarPartida}>
          Reiniciar Partida
        </button>

      </div>
    </div>
  );
}