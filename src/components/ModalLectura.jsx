import React from "react";

const ModalLectura = ({
  lecturaSeleccionada,
  usuario,
  onClose,
  onChangeLectura,
  onGuardar,
}) => {
  if (!lecturaSeleccionada || !usuario) return null;

  return (
    <div className="modal d-block" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Editar Lectura</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p><strong>Puesto:</strong> {usuario.puesto}</p>
            <p><strong>Nombre:</strong> {usuario.nombre}</p>
            <div className="mb-3">
              <label className="form-label">Lectura (kWh):</label>
              <input
                type="number"
                className="form-control"
                value={lecturaSeleccionada.lectura || ""}
                onChange={(e) =>
                  onChangeLectura(parseFloat(e.target.value))
                }
              />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn btn-success" onClick={onGuardar}>
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalLectura;
