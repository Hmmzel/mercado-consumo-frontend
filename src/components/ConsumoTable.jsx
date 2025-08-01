import React, { useEffect, useState } from "react";
import { generarConsumos } from "../services/api";
import GenerarBoletas from "../components/GenerarBoletas";


function ConsumoTable() {
  const [consumos, setConsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroPuesto, setFiltroPuesto] = useState("");
  const consumosFiltrados = filtroPuesto
    ? consumos.filter(c => c.puesto === filtroPuesto)
    : consumos;

  useEffect(() => {
    generarConsumos()
      .then(data => {
        setConsumos(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error al cargar consumos:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Cargando consumos...</p>;



  return (
    <>
    <GenerarBoletas consumos={consumosFiltrados} />

    <table border="1" cellPadding="5">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Puesto</th>
          <th>Cantidad Puestos</th>
          <th>Categoría</th>
          <th>Lectura Anterior</th>
          <th>Lectura Actual</th>
          <th>Diferencia</th>
          <th>Energía</th>
          <th>Iluminación</th>
          <th>G.Administrativos</th>
          <th>Toma Lectura</th>
          <th>Otros</th>
          <th>IGV</th>
          <th>Total Mes</th>
          <th>Fecha</th>
        </tr>
      </thead>
      <tbody>
        {consumos.map((item, index) => (
          <tr key={index}>
            <td>{item.nombre}</td>
            <td>{item.puesto}</td>
            <td>{item.cantidad_puestos}</td>
            <td>{item.categoria}</td>
            <td>{item.lectura_anterior}</td>
            <td>{item.lectura_actual}</td>
            <td>{item.diferencia}</td>
            <td>{item.energia}</td>
            <td>{item.iluminacion}</td>
            <td>{item.gastos_adm}</td>
            <td>{item.toma_lectura}</td>
            <td>{item.otros}</td>
            <td>S/{item.igv}</td>
            <td>S/{item.total_mes}</td>
            <td>{new Date(item.fecha).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <label>Filtrar por Puesto: </label>
  <select value={filtroPuesto} onChange={e => setFiltroPuesto(e.target.value)}>
    <option value="">Todos</option>
    {[...new Set(consumos.map(c => c.puesto))].map((puesto, i) => (
      <option key={i} value={puesto}>{puesto}</option>
    ))}
  </select>

    </>
  );
}

export default ConsumoTable;
