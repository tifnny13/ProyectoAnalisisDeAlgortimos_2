import { useState, useEffect } from 'react';
import { crearTablero } from './Logica/tablero';
import { colocarFlotaAleatoria } from './Logica/colocacionBarcos';
import TableroJugador from './componentes/TableroJugador';
import './App.css';

export default function App() {
  const [tablero, setTablero] = useState([]);

  useEffect(() => {
    generarTablero();
  }, []);

  const generarTablero = () => {
    const nuevo = crearTablero();
    colocarFlotaAleatoria(nuevo);
    setTablero(nuevo);
  };

  return (
    <div className="pantalla">
      <h1 className="titulo">⚓ Gran Batalla Naval ⚓</h1>

      {tablero.length > 0 && (
        <TableroJugador tablero={tablero} random={generarTablero} />
      )}
    </div>
  );
}