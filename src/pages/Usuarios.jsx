import * as XLSX from "xlsx";
import { actualizarUsuario, getUsuarios, registrarUsuariosMasivo } from "../services/api";
import { useEffect, useState } from "react";
import AgregarUsuario from "../components/AgregarUsuario";

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [excelData, setExcelData] = useState([]); // 🆕 para almacenar los usuarios cargados del Excel
  const [editandoId, setEditandoId] = useState(null);
  const [usuarioEditado, setUsuarioEditado] = useState({});
  // Obtener usuarios existentes
  useEffect(() => {
    getUsuarios()
      .then((data) => setUsuarios(data))
      .catch((error) => console.error("Error al cargar usuarios:", error));
  }, [] );

  const manejarEditar = (usuario) => {
    setEditandoId(usuario.id);
    setUsuarioEditado(usuario);
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setUsuarioEditado((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const guardarCambios = async () => {
    try {
      const actualizado = await actualizarUsuario(editandoId, usuarioEditado);
      const nuevosUsuarios = usuarios.map((u) =>
        u.id === editandoId ? actualizado : u
      );
      setUsuarios(nuevosUsuarios);
      setEditandoId(null);
    } catch (error) {
      alert("Error al actualizar usuario");
    }
  };

  
  // Agregar a la lista visual (en pantalla)
  const agregarUsuarioEnLista = (nuevoUsuario) => {
    setUsuarios((prev) => [...prev, nuevoUsuario]);
  };

  // Cargar archivo Excel pero NO enviar aún
  const handleExcelUpload = async (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

   reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    const usuariosFormateados = jsonData.map((row) => ({
      nombre: row.nombre,
      puesto: row.puesto,
      cantidad_puestos: row.cantidad_puestos,
      categoria: row.categoria,
    }));

    setExcelData(usuariosFormateados);
  };


    reader.readAsArrayBuffer(file);
  };

  // Enviar al backend
  const registrarDesdeExcel = async () => {
    if (excelData.length === 0) {
      alert("Primero debes cargar un archivo Excel válido.");
      return;
    }

    try {
      const resultado = await registrarUsuariosMasivo(excelData);

      if (resultado?.errores?.length > 0) {
        console.warn("Errores durante la carga:", resultado.errores);
        alert("Algunos usuarios no se pudieron registrar. Revisa la consola.");
      }

      // 🔄 Recargar usuarios desde el backend para asegurar sincronización
      const nuevosUsuarios = await getUsuarios();
      setUsuarios(nuevosUsuarios);

      // Limpiar archivo cargado
      setExcelData([]);

    } catch (error) {
      console.error("Error fatal al registrar usuarios:", error);
      alert("Ocurrió un error grave al registrar los usuarios.");
    }
  };

  return (
    <div className="container py-4">

      <h2 className="mb-4">Lista de Usuarios</h2>

      {/* Cargar archivo Excel */}
      <input type="file" accept=".xlsx, .xls" onChange={handleExcelUpload} className="form-control my-3 w-100"/>

      {/* Mostrar botón solo si se cargaron usuarios */}
      {excelData.length > 0 && (
        <button className="btn btn-success my-3 w-100 w-md-auto" onClick={registrarDesdeExcel}>Registrar usuarios desde Excel</button>
      )}

      <AgregarUsuario onUsuarioAgregado={agregarUsuarioEnLista} />

      {/* Modal para editar usuario */}
      <div className="modal fade" id="modalEditar" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Editar Usuario</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <input type="text" className="form-control mb-2" name="nombre" value={usuarioEditado.nombre || ""} onChange={manejarCambio} placeholder="Nombre" />
              <input type="text" className="form-control mb-2" name="puesto" value={usuarioEditado.puesto || ""} onChange={manejarCambio} placeholder="Puesto" />
              <input type="number" className="form-control mb-2" name="cantidad_puestos" value={usuarioEditado.cantidad_puestos || ""} onChange={manejarCambio} placeholder="Cantidad de puestos" />
              <input type="text" className="form-control mb-2" name="categoria" value={usuarioEditado.categoria || ""} onChange={manejarCambio} placeholder="Categoría" />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" className="btn btn-primary" onClick={guardarCambios} data-bs-dismiss="modal">Guardar cambios</button>
            </div>
          </div>
        </div>
      </div>
    <div className="table-responsive">
      <table className="table table-striped table-hover table-bordered">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Puesto</th>
            <th>Cantidad de puestos</th>
            <th>Categoría</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.length === 0 ? (
            <tr>
              <td colSpan={5} className="no-usuarios">No hay usuarios disponibles</td>
            </tr>
          ) : (
            usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.nombre}</td>
                <td>{u.puesto}</td>
                <td>{u.cantidad_puestos}</td>
                <td>{u.categoria}</td>
                <td>
                  <button
                    className="btn btn-sm btn-warning"
                    data-bs-toggle="modal"
                    data-bs-target="#modalEditar"
                    onClick={() => manejarEditar(u)}
                  >
                    ✏️
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>


      </table>
    </div>
    </div>
  );
}

export default Usuarios;
