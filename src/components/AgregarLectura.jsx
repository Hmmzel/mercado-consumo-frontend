import React, { useState, useEffect } from "react";
import Select from "react-select";
import {
  registrarLectura,
  getUsuarios,
  getLecturasPorFecha,
  actualizarLecturaPorFecha
} from "../services/api";
import Modal from 'bootstrap/js/dist/modal';


function AgregarLectura() {
  const [fecha, setFecha] = useState("");
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [lectura, setLectura] = useState("");
  const [mantenerFecha, setMantenerFecha] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [lecturasExistentes, setLecturasExistentes] = useState([]);
  const [errores, setErrores] = useState({});
  const [idLecturaEditando, setIdLecturaEditando] = useState(null);
  const [nuevaLectura, setNuevaLectura] = useState("");
  const [usuarioEditando, setUsuarioEditando] = useState(null);


  useEffect(() => {
    getUsuarios()
      .then(setUsuarios)
      .catch((error) => console.error("Error al cargar usuarios:", error));
  }, []);

  useEffect(() => {
    if (fecha) {
      getLecturasPorFecha(fecha)
        .then((data) => setLecturasExistentes(data))
        .catch((error) => console.error("Error al cargar lecturas:", error));
    } else {
      setLecturasExistentes([]);
    }
  }, [fecha]);

  const handleSubmit = async (e) => {
  e.preventDefault();

  const nuevosErrores = {};
  if (!fecha) nuevosErrores.fecha = "⚠️ Debes seleccionar una fecha.";
  if (!usuarioSeleccionado) nuevosErrores.usuario = "⚠️ Debes seleccionar un puesto.";
  if (!lectura) nuevosErrores.lectura = "⚠️ Debes ingresar una lectura.";

  if (Object.keys(nuevosErrores).length > 0) {
    setErrores(nuevosErrores);
    return;
  }

  setErrores({}); // Limpiar errores si todo está bien

  const fechaObj = new Date(fecha);
  const año = fechaObj.getFullYear();
  const mes = fechaObj.getMonth() + 1;

  try {
    await registrarLectura({
      fecha,
      año,
      mes,
      lectura: parseFloat(lectura),
      id_usuario: usuarioSeleccionado.value,
    });

    setMensaje("✅ Lectura registrada correctamente");

    if (!mantenerFecha) setFecha("");
    setUsuarioSeleccionado(null);
    setLectura("");
    const nuevasLecturas = await getLecturasPorFecha(fecha);
    setLecturasExistentes(nuevasLecturas);
  } catch (error) {
    console.error("Error al registrar lectura:", error);
    setMensaje("❌ Error al registrar lectura");
  }
};

  const opcionesUsuarios = usuarios.map((u) => {
    const yaRegistrado = lecturasExistentes.some((l) => l.id_usuario === u.id);
    return {
      value: u.id,
      label: `${u.puesto} (${u.nombre})${yaRegistrado ? " ✔️" : ""}`,
      isDisabled: yaRegistrado,
      registrado: yaRegistrado, 
    };
  }).sort((a, b) => a.registrado - b.registrado);

  const guardarLectura = async () => {
    try {
      const lecturaEditando = lecturasExistentes.find(
        (l) => l.id === idLecturaEditando
      );
      if (!lecturaEditando) {
        throw new Error("No se encontró la lectura para editar");
      }

      await actualizarLecturaPorFecha({
        id_usuario: lecturaEditando.id_usuario,
        fecha,
        lectura: parseFloat(nuevaLectura),
      });

      const nuevasLecturas = await getLecturasPorFecha(fecha);
      setLecturasExistentes(nuevasLecturas);
      setMensaje("✅ Lectura actualizada correctamente");
      setIdLecturaEditando(null);
      setNuevaLectura("");

      const modal = Modal.getInstance(document.getElementById("modalEditarLectura"));
      modal.hide();
    } catch (error) {
      console.error("Error al actualizar lectura:", error);
      setMensaje("❌ Error al actualizar lectura");
    }
  };


  /* const abrirModalEdicion = (lectura) => {
    setIdLecturaEditando(lectura.id);
    setNuevaLectura(lectura.lectura);
    const modal = new Modal(document.getElementById("modalEditarLectura"));

    modal.show();
  }; */
  const abrirModalEdicion = (lectura) => {
    setIdLecturaEditando(lectura.id);
    setNuevaLectura(lectura.lectura);

    // Buscar el usuario asociado a esta lectura
    const usuario = usuarios.find((u) => u.id === lectura.id_usuario);
    setUsuarioEditando(usuario);

    const modal = new Modal(document.getElementById("modalEditarLectura"));
    modal.show();
  };

  return (
    <div className="container my-4">
      <div className="card shadow">
        <div className="card-body">
          <h3 className="card-title mb-4">📋 Registrar Lectura</h3>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Fecha de lectura:</label>
              <input
                type="date"
                className="form-control"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
              {errores.fecha && <div className="text-danger">{errores.fecha}</div>}
              <div className="form-check mt-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={mantenerFecha}
                  onChange={(e) => setMantenerFecha(e.target.checked)}
                  id="mantenerFecha"
                />
                <label className="form-check-label" htmlFor="mantenerFecha">
                  Mantener fecha seleccionada
                </label>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Puesto o usuario:</label>
              <Select
                value={usuarioSeleccionado}
                onChange={setUsuarioSeleccionado}
                options={opcionesUsuarios}
                placeholder="Selecciona un puesto"
                isClearable
                isSearchable
              />
              {errores.usuario && <div className="text-danger">{errores.usuario}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">Lectura actual (kWh):</label>
              <input
                type="number"
                className="form-control"
                placeholder="Ej. 156.2"
                value={lectura}
                onChange={(e) => setLectura(e.target.value)}
              />
              {errores.lectura && <div className="text-danger">{errores.lectura}</div>}

            </div>

            <button type="submit" className="btn btn-primary w-100">
              Registrar lectura
            </button>

            {mensaje && <div className="alert alert-info mt-3">{mensaje}</div>}
          </form>
        </div>
      </div>
      {/* Modal de edición de lectura */}
      <div
        className="modal fade"
        id="modalEditarLectura"
        tabIndex="-1"
        aria-labelledby="modalEditarLecturaLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="modalEditarLecturaLabel">
                Editar Lectura
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Cerrar"
              ></button>
            </div>
            <div className="modal-body">
              {usuarioEditando && (
              <>
                <div className="mb-3">
                  <label className="form-label">Puesto</label>
                  <input
                    type="text"
                    className="form-control"
                    value={usuarioEditando.puesto}
                    disabled
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    className="form-control"
                    value={usuarioEditando.nombre}
                    disabled
                  />
                </div>
              </>
            )}
            <div className="mb-3">

              <label className="form-label">Nueva lectura (kWh)</label>
              <input
                type="number"
                className="form-control"
                value={nuevaLectura}
                onChange={(e) => setNuevaLectura(e.target.value)}
              />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={guardarLectura}
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* Tabla de lecturas ya registradas */}
      {lecturasExistentes.length > 0 && (
        <div className="mt-5">
          <h4>🔍 Lecturas ya registradas el {fecha}</h4>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Puesto</th>
                  <th>Nombre</th>
                  <th>Lectura (kWh)</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {lecturasExistentes.map((l) => {
                  const usuario = usuarios.find((u) => u.id === l.id_usuario);
                  return (
                    <tr key={l.id_usuario}>
                      <td>{usuario?.puesto}</td>
                      <td>{usuario?.nombre}</td>
                      <td>{l.lectura}</td>
                      <td><button
                        className="btn btn-sm btn-warning"
                        onClick={() => abrirModalEdicion(l)}
                      >
                        Editar
                      </button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
    
  );
}

export default AgregarLectura;
