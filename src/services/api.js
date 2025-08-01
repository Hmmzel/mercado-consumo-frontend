// services/api.js ejemplo básico con fetch
import axios from 'axios';

const API_URL = "https://mercado-consumo-back.onrender.com/api"; // Ajusta el puerto si es diferente

export async function getUsuarios() {
  const res = await axios.get(`${API_URL}/usuarios`);
  return res.data;
}

export async function getLecturas() {
  const res = await axios.get(`${API_URL}/lecturas`);
  return res.json();
}

export async function generarConsumos() {
  try {
    const res = await axios.get(`${API_URL}/consumos/generar`);
    return res.data.consumos;  // <-- Aquí extraemos el array consumos del objeto respuesta
  } catch (error) {
    console.error('Error al obtener consumos:', error);
    return [];
  }
}


export const obtenerUsuarios = async () => {
  try {
    const res = await axios.get(`${API_URL}/usuarios`);
    return res.data;
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    return [];
  }
};

export async function fetchConsumos() {
  const response = await axios.get(`${API_URL}/consumos/generar`);
  if (!response.ok) throw new Error("Error al obtener datos");
  return await response.json();
}

export async function agregarUsuario(usuario) {
  try {
    const response = await axios.post(`${API_URL}/usuarios`, usuario);
    return response.data;
  } catch (error) {
    console.error("Error al agregar usuario:", error);
    throw error;
  }
}

export async function registrarLectura(data) {
  try {
  const response = await axios.post(`${API_URL}/lecturas`, data);
  return response.data;
  } catch (error) {
    console.error("Error al agregar Lectura:", error);
    throw error;
  }
}


export async function registrarUsuariosMasivo(listaUsuarios) {
  try {
    // 🔍 Mostrar en consola lo que se va a enviar
    console.log("Usuarios que se enviarán al backend:");
    console.log(JSON.stringify(listaUsuarios, null, 2));

    const response = await axios.post(`${API_URL}/usuarios/bulk`, listaUsuarios);

    console.log("Respuesta del backend:", response.data);
    return response.data; // { insertados: [], errores: [] }
  } catch (error) {
    console.error("❌ Error al registrar usuarios masivamente:", error.response?.data || error.message);
    throw error;
  }
}


export async function getLecturasPorFecha(fecha) {
  try {
    const res = await fetch(`${API_URL}/lecturas/por-fecha?fecha=${fecha}`);
    if (!res.ok) throw new Error("Error al obtener lecturas por fecha");
    return await res.json();
  } catch (error) {
    console.error("❌ Error en getLecturasPorFecha:", error);
    return [];
  }
}

// Editar usuario por ID
export async function actualizarUsuario(id, datosActualizados) {
  try {
    const response = await axios.put(`${API_URL}/usuarios/${id}`, datosActualizados);
    return response.data;
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    throw error;
  }
}

// Editar lectura por fecha y usuario
export async function actualizarLectura({ fecha, id_usuario, nuevaLectura }) {
  const response = await axios.put(`${API_URL}/lecturas`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fecha, id_usuario, nuevaLectura }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error?.error || "Error al actualizar lectura");
  }
  return await response.json();
}

export async function obtenerLecturasPorFechaYManzana(fechaSeleccionada, manzana) {
  try {
    const response = await axios.get(`${API_URL}/lecturas/por-fecha?fecha=${fechaSeleccionada}`);
    if (!response.ok) throw new Error("Error al obtener lecturas");

    const datos = await response.json();

    // Filtramos por manzana exacta
    const lecturasFiltradas = datos.filter((lectura) => lectura.categoria === manzana);
    return lecturasFiltradas;
  } catch (error) {
    console.error("Error al consumir el endpoint:", error);
    return [];
  }
}

export const actualizarLecturaPorFecha = async ({ id_usuario, fecha, lectura }) => {
  const res = await fetch("https://mercado-consumo-back.onrender.com/api/lecturas/actualizar", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ id_usuario, fecha, lectura })
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Error al actualizar lectura");
  }

  return res.json();
};

export const obtenerLecturasPorFechaYCategoria = async (fecha, categoria) => {
  const res = await axios.get(`${API_URL}/lecturas/por-fecha-categoria`, {
    params: { fecha, categoria },
  });
  return res.data;
};

export const obtenerCategorias = async () => {
  const res = await axios.get(`${API_URL}/usuarios/categorias`);
  return res.data;
};