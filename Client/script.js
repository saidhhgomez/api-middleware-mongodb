const API_URL = 'http://197.168.1.7:5559/libros';

document.addEventListener("DOMContentLoaded", () => {
  configurarNavegacion();
  configurarEventos();
  listarLibros();

  // Auto-refresh si no hay búsqueda activa
  setInterval(() => {
    const termino = document.getElementById("busqueda").value.trim();
    const modalAgregarAbierto = document.getElementById("modal-agregar").style.display === "flex";
    const modalEditarAbierto = document.getElementById("modal-editar").style.display === "flex";

    if (termino === "" && !modalAgregarAbierto && !modalEditarAbierto) {
      listarLibros();
    }
  }, 2000);
});

// ========================
// Navegación entre secciones
// ========================
function configurarNavegacion() {
  const secciones = {
    buscar: document.getElementById("seccion-buscar"),
  };

  document.querySelectorAll("nav a").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const texto = link.textContent.toLowerCase();
      const accion = texto.includes("buscar") ? "buscar" : null;

      if (accion && secciones[accion]) {
        Object.keys(secciones).forEach(key => {
          secciones[key].style.display = (key === accion) ? "block" : "none";
        });
      }
    });
  });
}

// ========================
// Eventos
// ========================
function configurarEventos() {
  document.getElementById("form-modal-agregar").addEventListener("submit", agregarLibro);
  document.getElementById("form-modal-editar").addEventListener("submit", guardarEdicion);
  document.getElementById("form-busqueda").addEventListener("submit", buscarLibros);
}

// ========================
// CRUD - Agregar libro
// ========================
async function agregarLibro(e) {
  e.preventDefault();
  const datos = obtenerDatosFormulario("nuevo");

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });

    if (!res.ok) throw new Error("No se pudo agregar");

    cerrarModalAgregar();
    listarLibros();
    Swal.fire({
      icon: "success",
      title: "Libro agregado correctamente",
      showConfirmButton: false,
      timer: 1500
    });
  } catch (err) {
    console.error(err);
    Swal.fire("Error", "No se pudo agregar el libro", "error");
  }
}

// ========================
// CRUD - Listar libros
// ========================
async function listarLibros() {
  try {
    const res = await fetch(API_URL);
    const libros = await res.json();
    renderizarLibros(libros);
  } catch (error) {
    console.error("Error al listar libros:", error);
  }
}

// ========================
// CRUD - Eliminar libro
// ========================
async function eliminarLibro(id) {
  const resultado = await Swal.fire({
    title: "¿Estás seguro?",
    text: "¡No podrás revertir esto!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  });

  if (resultado.isConfirmed) {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Error al eliminar");

      await listarLibros();
      Swal.fire("¡Eliminado!", "El libro ha sido eliminado.", "success");
    } catch (error) {
      console.error("Error al eliminar:", error);
      Swal.fire("Error", "No se pudo eliminar el libro", "error");
    }
  }
}

// ========================
// CRUD - Editar libro
// ========================
function abrirModalEditar(libro) {
  if (typeof libro === "string") libro = JSON.parse(libro);

  document.getElementById("modal-id").value = libro._id || '';
  document.getElementById("modal-titulo").value = libro.titulo || '';
  document.getElementById("modal-autor").value = libro.autor || '';
  document.getElementById("modal-categoria").value = libro.categoria || '';
  document.getElementById("modal-editorial").value = libro.editorial || '';
  document.getElementById("modal-anio").value = libro.anio_publicacion || libro.anio || '';
  document.getElementById("modal-isbn").value = libro.isbn || '';
  document.getElementById("modal-stock").value = libro.stock ?? '';

  document.getElementById("modal-editar").style.display = "flex";
}

async function guardarEdicion(e) {
  e.preventDefault();

  const confirmacion = await Swal.fire({
    title: "¿Deseas guardar los cambios?",
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: "Guardar",
    denyButtonText: "No guardar",
    cancelButtonText: "Cancelar"
  });

  if (confirmacion.isConfirmed) {
    const id = document.getElementById("modal-id").value;
    const datos = obtenerDatosFormulario("modal");

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
      });

      if (!res.ok) throw new Error("Error al guardar");

      cerrarModalEditar();
      listarLibros();

      Swal.fire("¡Guardado!", "Los cambios han sido guardados correctamente.", "success");
    } catch (error) {
      console.error("Error al editar libro:", error);
      Swal.fire("Error", "No se pudo guardar el libro.", "error");
    }
  } else if (confirmacion.isDenied) {
    Swal.fire("Cambios descartados", "No se ha guardado nada.", "info");
    cerrarModalEditar();
  }
}

// ========================
// Buscar libros
// ========================
async function buscarLibros(e) {
  e.preventDefault();
  const termino = document.getElementById("busqueda").value.trim().toLowerCase();

  try {
    const res = await fetch(API_URL);
    const libros = await res.json();

    if (!termino) return listarLibros();

    const filtrados = libros.filter(libro =>
      (libro.titulo && libro.titulo.toLowerCase().includes(termino)) ||
      (libro.autor && libro.autor.toLowerCase().includes(termino))
    );

    if (filtrados.length === 0) {
      Swal.fire("Sin resultados", "No se encontraron coincidencias.", "info");
      renderizarLibros([]);
    } else {
      renderizarLibros(filtrados);
    }
  } catch (err) {
    console.error("Error en búsqueda:", err);
  }
}

// ========================
// Renderizado
// ========================
function renderizarLibros(libros) {
  const tabla = document.getElementById("tabla-resultados");
  tabla.innerHTML = '';

  libros.forEach(libro => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${libro.titulo}</td>
      <td>${libro.autor}</td>
      <td>${libro.categoria || '-'}</td>
      <td>${libro.editorial || '-'}</td>
      <td>${libro.anio_publicacion || libro.anio || '-'}</td>
      <td>${libro.isbn || '-'}</td>
      <td>${libro.stock ?? '-'}</td>
      <td>
        <button onclick='abrirModalEditar(${JSON.stringify(libro)})'>Editar</button>
        <button onclick="eliminarLibro('${libro._id}')">Eliminar</button>
      </td>
    `;
    tabla.appendChild(fila);
  });
}

// ========================
// Utilidades
// ========================
function obtenerDatosFormulario(prefix) {
  return {
    titulo: document.getElementById(`${prefix}-titulo`).value,
    autor: document.getElementById(`${prefix}-autor`).value,
    categoria: document.getElementById(`${prefix}-categoria`).value,
    editorial: document.getElementById(`${prefix}-editorial`).value,
    anio_publicacion: parseInt(document.getElementById(`${prefix}-anio`).value),
    isbn: document.getElementById(`${prefix}-isbn`).value,
    stock: parseInt(document.getElementById(`${prefix}-stock`).value),
  };
}

// ========================
// Control de Modales
// ========================
function abrirModalAgregar() {
  document.getElementById("form-modal-agregar").reset();
  document.getElementById("modal-agregar").style.display = "flex";
}

function cerrarModalAgregar() {
  document.getElementById("modal-agregar").style.display = "none";
}

function cerrarModalEditar() {
  document.getElementById("modal-editar").style.display = "none";
}