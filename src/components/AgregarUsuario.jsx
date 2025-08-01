import React, { useState } from "react";
import { agregarUsuario } from "../services/api";

function AgregarUsuario({ onUsuarioAgregado }) {
  const [nombre, setNombre] = useState("");
  const [puesto, setPuesto] = useState("");
  const [cantidadPuestos, setCantidadPuestos] = useState("");
  const [categoria, setCategoria] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre || !puesto || !cantidadPuestos || !categoria) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const nuevoUsuario = await agregarUsuario({
        nombre,
        puesto,
        cantidad_puestos: parseInt(cantidadPuestos),
        categoria,
      });

      setNombre("");
      setPuesto("");
      setCantidadPuestos("");
      setCategoria("");
      onUsuarioAgregado(nuevoUsuario);
      alert("Usuario agregado correctamente");
    } catch (err) {
      setError("Error al agregar usuario.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">Agregar Nuevo Usuario</h4>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Puesto</label>
              <input
                type="text"
                className="form-control"
                placeholder="Puesto"
                value={puesto}
                onChange={(e) => setPuesto(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Cantidad de Puestos</label>
              <input
                type="number"
                className="form-control"
                placeholder="Cantidad de puestos"
                value={cantidadPuestos}
                onChange={(e) => setCantidadPuestos(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Categoría</label>
              <input
                type="text"
                className="form-control"
                placeholder="Categoría (ej. Manzana A)"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-success"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Agregar Usuario"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AgregarUsuario;
