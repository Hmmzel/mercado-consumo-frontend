// src/components/HistorialLecturas.jsx
import React, { useEffect, useState } from "react";
import {
  getLecturasPorFecha as obtenerLecturasPorFecha,
  actualizarLecturaPorFecha,
  obtenerCategorias,
  obtenerLecturasPorFechaYCategoria
} from "../services/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const HistorialLecturas = () => {
  const [fechaSeleccionada, setFechaSeleccionada] = useState("");
  const [lecturas, setLecturas] = useState([]);
  const [lecturaEditando, setLecturaEditando] = useState(null);
  const [nuevaLectura, setNuevaLectura] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");


  const cargarLecturasFiltradas = async () => {
    if (!fechaSeleccionada || !categoriaSeleccionada) return;
    const data = await obtenerLecturasPorFechaYCategoria(
        formatearFechaMySQL(fechaSeleccionada),
        categoriaSeleccionada
    );
    setLecturas(data);
  };

  const buscarLecturas = async () => {
    if (!fechaSeleccionada) return;
    const datos = await obtenerLecturasPorFecha(fechaSeleccionada);
    setLecturas(datos || []);
  };

  const formatearFechaMySQL = (date) => new Date(date).toISOString().split("T")[0];


  const abrirModalEdicion = (registro) => {
    setLecturaEditando(registro);
    setNuevaLectura(registro.lectura);
  };

    const guardarEdicion = async () => {
        try {
            await actualizarLecturaPorFecha({
                id_usuario: lecturaEditando.id_usuario,
                fecha: formatearFechaMySQL(lecturaEditando.fecha),
                lectura: parseFloat(nuevaLectura),
            });

            setLecturas(lecturas.map(l =>
                l.id_usuario === lecturaEditando.id_usuario && l.fecha === lecturaEditando.fecha
                    ? { ...l, lectura: parseFloat(nuevaLectura) }
                    : l
            ));

            toast.success(`Lectura actualizada para ${lecturaEditando.nombre}`, {
                position: "top-right",
            });

            cerrarModal();
        } catch (err) {
            alert("Error al actualizar la lectura: " + err.message);
        }
    };


  const cerrarModal = () => {
    setLecturaEditando(null);
    setNuevaLectura("");
  };

  /* const formatearFecha = iso => {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
  }; */
    const formatearFecha = iso => {
    const d = new Date(iso + "T12:00:00"); // Añade hora para evitar timezone
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
  };

    useEffect(() => {
        const cargarCategorias = async () => {
            const data = await obtenerCategorias();
            setCategorias(data);
        };
        cargarCategorias();
    }, []);

  return (
    <div className="container mt-4">
      <h2>Historial de Lecturas</h2>

      <div className="mb-3">
        <label>Selecciona una fecha:</label>
        <input
          type="date"
          className="form-control"
          value={fechaSeleccionada}
          onChange={e => setFechaSeleccionada(e.target.value)}
        />
        <select
        value={categoriaSeleccionada}
        onChange={(e) => setCategoriaSeleccionada(e.target.value)}
        >
        <option value="">-- Selecciona Categoría --</option>
        {categorias.map((cat, index) => (
            <option key={index} value={cat}>{cat}</option>
        ))}
        </select>
        <button
        className="btn btn-primary mt-2"
        onClick={() => {
            if (categoriaSeleccionada) {
            cargarLecturasFiltradas();
            } else {
            buscarLecturas();
            }
        }}
        >
        Buscar
        </button>
      </div>

      {lecturas.length > 0 ? (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Puesto</th>
              <th>Lectura</th>
              <th>Fecha</th>
              <th>Categoría</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lecturas.map(l => (
              <tr key={`${l.id_usuario}-${l.fecha}`}>
                <td>{l.nombre}</td>
                <td>{l.puesto}</td>
                <td>{l.lectura}</td>
                <td>{formatearFecha(l.fecha)}</td>
                <td>{l.categoria}</td>
                <td>
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => abrirModalEdicion(l)}
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No hay lecturas para la fecha seleccionada.</p>
      )}

      {lecturaEditando && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Lectura</h5>
                <button className="btn-close" onClick={cerrarModal}></button>
              </div>
              <div className="modal-body">
                <p><strong>Usuario:</strong> {lecturaEditando.nombre}</p>
                <p><strong>Puesto:</strong> {lecturaEditando.puesto}</p>
                <p><strong>Fecha:</strong> {formatearFecha(lecturaEditando.fecha)}</p>
                <input
                  type="number"
                  className="form-control"
                  value={nuevaLectura}
                  onChange={e => setNuevaLectura(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={cerrarModal}>
                  Cancelar
                </button>
                <button className="btn btn-success" onClick={guardarEdicion}>
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />

    </div>
  );
};

export default HistorialLecturas;
