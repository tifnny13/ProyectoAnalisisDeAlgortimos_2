import { useState, useEffect } from 'react';
import { crearTablero } from './Logica/tablero';
import { colocarFlotaAleatoria } from './Logica/colocacionBarcos';
import TableroJugador from './componentes/TableroJugador';
import TableroEnemigo from './componentes/TableroEnemigo';
import './App.css';

export default function App() {
  const [tableroJugador, setTableroJugador] = useState([]);
  const [flotaEnemigaOculta, setFlotaEnemigaOculta] = useState([]);

  useEffect(() => {
    reiniciarJuegoCompleto();
  }, []);

  const reiniciarJuegoCompleto = () => {
    // 1. Generar tablero del jugador
    const nuevoJugador = crearTablero();
    colocarFlotaAleatoria(nuevoJugador);
    setTableroJugador(nuevoJugador);

    // 2. Generar flota secreta del enemigo
    const nuevoEnemigo = crearTablero();
    colocarFlotaAleatoria(nuevoEnemigo);
    setFlotaEnemigaOculta(nuevoEnemigo);
  };

  return (
    <div className="pantalla">
      <h1 className="titulo">⚓ Batalla Naval Probabilística ⚓</h1>

      <div className="contenedor-tableros" style={{ display: 'flex', gap: '40px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {/* Tablero Propio (Jugador) */}
        <div>
          {tableroJugador.length > 0 && (
            <TableroJugador tablero={tableroJugador} random={reiniciarJuegoCompleto} />
          )}
        </div>

        {/* Tablero Enemigo (Recibe la flota oculta y la función de reinicio por props) */}
        <div>
          {flotaEnemigaOculta.length > 0 && (
            <TableroEnemigo 
              flotaSecreta={flotaEnemigaOculta} 
              onReiniciar={reiniciarJuegoCompleto} 
            />
          )}
        </div>
      </div>
    </div>
  );
}