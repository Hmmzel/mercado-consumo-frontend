import React, { useEffect, useState } from "react";
import { generarConsumos } from "../services/api";
import GenerarBoletas from "../components/GenerarBoletas";


function ConsumoTable() {
  const [consumos, setConsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroPuesto, setFiltroPuesto] = useState("");
  const [filtroMes, setFiltroMes] = useState("");
  const consumosFiltrados = consumos
  .filter(c => {
    const fecha = new Date(c.fecha);
    const mes = fecha.getMonth() + 1;
    const año = fecha.getFullYear();

    if (filtroPuesto && c.puesto !== filtroPuesto) return false;

    if (filtroMes) {
      const [anioFiltro, mesFiltro] = filtroMes.split("-");
      if (Number(anioFiltro) !== año || Number(mesFiltro) !== mes) return false;
    }

    return true;
  })
  .sort((a, b) => {
  // 1) ordenar por categoría usando collation en español (maneja la Ñ correctamente)
  const catCompare = a.categoria.localeCompare(b.categoria, "es", { sensitivity: "base" });
  if (catCompare !== 0) return catCompare;

  // 2) si la categoría es la misma, intentar ordenar por número del puesto (Z1 -> 1, Z13 -> 13)
  const numA = parseInt((a.puesto.match(/\d+/) || ["0"])[0], 10);
  const numB = parseInt((b.puesto.match(/\d+/) || ["0"])[0], 10);
  if (!isNaN(numA) && !isNaN(numB) && numA !== numB) return numA - numB;

  // 3) fallback: comparar por puesto como string (también con localeCompare)
  return a.puesto.localeCompare(b.puesto, "es", { numeric: true, sensitivity: "base" });
});



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
        {consumosFiltrados.map((item, index) => (

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
    <label>Filtrar por Mes: </label>
    <input 
      type="month" 
      value={filtroMes} 
      onChange={e => setFiltroMes(e.target.value)} 
    />

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
