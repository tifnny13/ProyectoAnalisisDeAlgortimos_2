import { useState, useEffect } from 'react';
import { crearTablero } from './Logica/tablero';
import { colocarFlotaAleatoria } from './Logica/colocacionBarcos';
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

  useEffect(() => {
    reiniciarJuegoCompleto();
  }, []);

  const reiniciarJuegoCompleto = () => {
    const nuevoJugador = crearTablero();
    colocarFlotaAleatoria(nuevoJugador);
    setFlotaJugador(nuevoJugador);

    const nuevoEnemigo = crearTablero();
    colocarFlotaAleatoria(nuevoEnemigo);
    setFlotaEnemigaOculta(nuevoEnemigo);

    setDisparosIAEnJugador(Array.from({ length: TAMANIO }, () => Array(TAMANIO).fill(null)));
    setTurno('jugador');
    setEstadoPartida('jugando');
  };

  // Turno automático de la IA
  useEffect(() => {
    if (turno === 'ia' && estadoPartida === 'jugando') {
      const timer = setTimeout(() => {
        const { nuevoDisparosIA } = calcularAtaqueIA(disparosIAEnJugador, flotaJugador);
        
        setDisparosIAEnJugador(nuevoDisparosIA);

        if (verificarVictoria(nuevoDisparosIA, flotaJugador)) {
          setEstadoPartida('victoria_ia');
        } else {
          setTurno('jugador');
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [turno, estadoPartida]);

  const handleDisparoJugador = (nuevoTableroEnemigo, juegoTerminadoEnemigo) => {
    if (juegoTerminadoEnemigo) {
      setEstadoPartida('victoria_jugador');
    } else {
      setTurno('ia');
    }
  };

  return (
    <div className="pantalla">
      <h1 className="titulo">⚓ Batalla Naval Probabilística ⚓</h1>

      <div className="indicador-turno" style={{ textAlign: 'center', marginBottom: '20px', fontSize: '1.2rem', fontWeight: 'bold' }}>
        {estadoPartida === 'victoria_jugador' && <span style={{ color: '#22c55e' }}>¡VICTORIA! Has derrotado a la IA.</span>}
        {estadoPartida === 'victoria_ia' && <span style={{ color: '#ef4444' }}>¡DERROTA! La IA ha hundido tu flota.</span>}
        {estadoPartida === 'jugando' && (
          <span>Turno de: {turno === 'jugador' ? 'Tu turno (Ataca al enemigo)' : 'La IA está pensando su ataque...'}</span>
        )}
      </div>

      <div className="contenedor-tableros" style={{ display: 'flex', gap: '40px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <div>
          <h3>Tu Tablero</h3>
          {flotaJugador.length > 0 && (
            <TableroJugador 
              tablero={flotaJugador} 
              ataquesRecibidos={disparosIAEnJugador} 
              random={reiniciarJuegoCompleto} 
            />
          )}
        </div>

        <div>
          <h3>Tablero Enemigo</h3>
          {flotaEnemigaOculta.length > 0 && (
            <TableroEnemigo 
              flotaSecreta={flotaEnemigaOculta} 
              onReiniciar={reiniciarJuegoCompleto}
              turnoJugador={turno === 'jugador' && estadoPartida === 'jugando'}
              onDispararRealizado={handleDisparoJugador}
            />
          )}
        </div>
      </div>
    </div>
  );
}