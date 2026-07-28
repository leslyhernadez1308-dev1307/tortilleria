import { useState, useEffect } from 'react';

// Manejo dinámico de la URL mediante variable de entorno con respaldo
const BASE_URL = import.meta.env.VITE_API_URL || 'https://backend-production-4d48.up.railway.app';
const API_BASE = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

const Clientes = () => {
  // Función auxiliar para obtener la fecha actual en formato YYYY-MM-DD
  const obtenerFechaActual = () => new Date().toISOString().split('T')[0];

  // Función para limpiar cualquier formato de fecha y dejar solo YYYY-MM-DD
  const formatearFechaInput = (fecha) => {
    if (!fecha) return obtenerFechaActual();
    if (typeof fecha === 'string') {
      return fecha.split('T')[0].split(' ')[0];
    }
    if (fecha instanceof Date) {
      return fecha.toISOString().split('T')[0];
    }
    return String(fecha).split('T')[0].split(' ')[0];
  };

  // Estado para el formulario con los campos de la base de datos
  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    email: '',
    fecha_registro: obtenerFechaActual()
  });

  // Estado para almacenar la lista de clientes
  const [clientes, setClientes] = useState([]);

  // Estado para la barra de búsqueda en tiempo real
  const [busqueda, setBusqueda] = useState('');

  // Estado para saber si estamos editando un cliente
  const [editandoId, setEditandoId] = useState(null);

  // 1. Obtener todos los clientes desde el backend
  const obtenerClientes = async () => {
    try {
      const respuesta = await fetch(`${API_BASE}/clientes`);
      if (!respuesta.ok) throw new Error('Error al obtener la lista de clientes');
      const datos = await respuesta.json();
      setClientes(Array.isArray(datos) ? datos : []);
    } catch (error) {
      console.error('Error al obtener los clientes:', error);
      setClientes([]);
    }
  };

  useEffect(() => {
    obtenerClientes();
  }, []);

  // Limpiar y resetear formulario
  const resetearFormulario = () => {
    setForm({
      nombre: '',
      telefono: '',
      email: '',
      fecha_registro: obtenerFechaActual()
    });
    setEditandoId(null);
  };

  // 2. Manejar cambios en los inputs del formulario
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // 3. Enviar el formulario (Guardar nuevo o Actualizar existente)
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editandoId
        ? `${API_BASE}/clientes/${editandoId}`
        : `${API_BASE}/clientes`;

      const metodo = editandoId ? 'PUT' : 'POST';

      // Asegurar que la fecha se envíe limpia en formato YYYY-MM-DD
      const datosAEnviar = {
        ...form,
        fecha_registro: formatearFechaInput(form.fecha_registro)
      };

      const respuesta = await fetch(url, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosAEnviar)
      });

      const resultado = await respuesta.json();

      if (respuesta.ok) {
        alert(editandoId ? 'Cliente actualizado exitosamente' : 'Cliente guardado exitosamente');
        resetearFormulario();
        obtenerClientes();
      } else {
        alert('Error: ' + (resultado.error || resultado.message || 'No se pudo procesar la solicitud'));
      }
    } catch (error) {
      console.error('Error al guardar el cliente:', error);
      alert('Ocurrió un error al conectar con el servidor.');
    }
  };

  // 4. Preparar formulario para Editar un cliente
  const iniciarEdicion = (cliente) => {
    setForm({
      nombre: cliente.nombre || '',
      telefono: cliente.telefono || '',
      email: cliente.email || cliente.correo || '',
      fecha_registro: formatearFechaInput(cliente.fecha_registro)
    });
    setEditandoId(cliente.id_cliente);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 5. Eliminar un cliente
  const eliminarCliente = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) return;

    try {
      const respuesta = await fetch(`${API_BASE}/clientes/${id}`, {
        method: 'DELETE'
      });

      if (respuesta.ok) {
        alert('Cliente eliminado correctamente');
        obtenerClientes();
      } else {
        const resultado = await respuesta.json();
        alert('Error al eliminar: ' + (resultado.error || resultado.message || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error al eliminar el cliente:', error);
      alert('Ocurrió un error al conectar con el servidor.');
    }
  };

  // Filtrar clientes para la búsqueda en tiempo real
  const clientesFiltrados = clientes.filter((cliente) => {
    const texto = busqueda.toLowerCase();
    const nombre = (cliente.nombre || '').toLowerCase();
    const email = (cliente.email || cliente.correo || '').toLowerCase();
    const telefono = (cliente.telefono || '').toLowerCase();
    const id = String(cliente.id_cliente || '');

    return nombre.includes(texto) || email.includes(texto) || telefono.includes(texto) || id.includes(texto);
  });

  return (
    <div className="space-y-8 w-full text-[#36452F] max-w-5xl mx-auto pb-12">
      {/* Formulario de Alta / Edición de Clientes */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-md border border-[#EAE5D9] w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-4 border-b border-[#EAE5D9] gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#36452F] flex items-center gap-3">
              <span>👥</span>
              {editandoId ? 'Actualizar Datos del Cliente' : 'Gestión y Registro de Clientes'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {editandoId ? `Modificando la información del cliente ID: #${editandoId}` : 'Ingrese la información personal y de contacto para registrar un nuevo cliente.'}
            </p>
          </div>
          {editandoId && (
            <span className="bg-[#EAE5D9] text-[#36452F] font-bold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider">
              Modo Edición Activado
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre Completo / Razón Social */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Nombre Completo / Razón Social
            </label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Ej. Juan Pérez o Comercializadora S.A."
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557345] focus:outline-none bg-white text-[#36452F]"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Teléfono */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Teléfono de Contacto
              </label>
              <input
                type="text"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                placeholder="Ej. 555-0192"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557345] focus:outline-none bg-white text-[#36452F]"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Correo Electrónico (Email)
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Ej. correo@cliente.com"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557345] focus:outline-none bg-white text-[#36452F]"
              />
            </div>

            {/* Fecha de Registro */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Fecha de Registro
              </label>
              <input
                type="date"
                name="fecha_registro"
                value={form.fecha_registro}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557345] focus:outline-none bg-white text-[#36452F]"
                required
              />
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-[#EAE5D9]">
            <button
              type="submit"
              className={`w-full sm:flex-1 py-3 px-6 rounded-xl text-white font-bold transition-colors shadow text-sm ${
                editandoId
                  ? 'bg-[#445C37] hover:bg-[#34472A]'
                  : 'bg-[#557345] hover:bg-[#445C37]'
              }`}
            >
              {editandoId ? 'Guardar Cambios del Cliente' : 'Guardar Nuevo Cliente'}
            </button>

            {editandoId && (
              <button
                type="button"
                onClick={resetearFormulario}
                className="w-full sm:w-auto px-6 py-3 bg-gray-400 hover:bg-gray-500 text-white rounded-xl font-bold transition-colors text-sm shadow"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Directorio General de Clientes */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-md border border-[#EAE5D9] w-full space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#EAE5D9]">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#36452F] flex items-center gap-2">
              <span>📋</span> Directorio General de Clientes
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Busque, consulte y administre la cartera de clientes registrados en el sistema.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
            {/* Barra de Búsqueda */}
            <div className="relative w-full sm:w-72">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                🔍
              </span>
              <input
                type="text"
                placeholder="Buscar por nombre, correo, teléfono..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-[#EAE5D9] rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#557345] focus:outline-none text-[#36452F] shadow-sm"
              />
            </div>

            {/* Contador de Clientes */}
            <div className="bg-[#EAE5D9] text-[#36452F] font-bold text-xs px-4 py-3 rounded-xl text-center whitespace-nowrap">
              Total: {clientesFiltrados.length}
            </div>
          </div>
        </div>

        {/* Tabla de Clientes */}
        <div className="overflow-x-auto rounded-xl border border-[#EAE5D9] bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#EAE5D9]/60 text-[#36452F] text-xs font-bold uppercase tracking-wider border-b border-[#EAE5D9]">
                <th className="p-4">ID</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Teléfono</th>
                <th className="p-4">Email</th>
                <th className="p-4">Fecha Registro</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-[#EAE5D9]">
              {clientesFiltrados.map((cliente) => {
                const emailCliente = cliente.email || cliente.correo;
                return (
                  <tr key={cliente.id_cliente} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-mono text-gray-500 font-bold">#{cliente.id_cliente}</td>
                    <td className="p-4 font-bold text-[#36452F]">{cliente.nombre}</td>
                    <td className="p-4 text-gray-600 font-medium">
                      {cliente.telefono ? (
                        <span className="flex items-center gap-1.5">
                          <span className="text-gray-400">📞</span> {cliente.telefono}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Sin registrar</span>
                      )}
                    </td>
                    <td className="p-4 text-gray-600 font-medium">
                      {emailCliente ? (
                        <span className="text-[#557345] hover:underline font-semibold">
                          {emailCliente}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Sin registrar</span>
                      )}
                    </td>
                    <td className="p-4 text-gray-600">
                      {cliente.fecha_registro ? new Date(cliente.fecha_registro).toLocaleDateString() : 'Sin fecha'}
                    </td>
                    <td className="p-4 text-center space-x-2">
                      <button
                        onClick={() => iniciarEdicion(cliente)}
                        className="bg-[#557345] hover:bg-[#445C37] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => eliminarCliente(cliente.id_cliente)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
              {clientesFiltrados.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-500 font-medium text-sm">
                    No se encontraron clientes registrados que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Clientes;