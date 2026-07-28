import { useState, useEffect } from 'react';

// Manejo dinámico de la URL mediante variable de entorno con respaldo al backend en Railway
const BASE_URL = import.meta.env.VITE_API_URL || 'https://backend-production-db840.up.railway.app';
const API_BASE = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [mensaje, setMensaje] = useState('');
  
  // Estado para saber si estamos editando un cliente (guarda su ID)
  const [editingId, setEditingId] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  const cargarClientes = () => {
    fetch(`${API_BASE}/clientes`)
      .then((res) => res.json())
      .then((data) => setClientes(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error al cargar clientes:", err));
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  // Guardar o Actualizar cliente en MySQL
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!nombre.trim()) {
      alert('Por favor ingresa el nombre del cliente');
      return;
    }

    const clienteData = {
      nombre,
      telefono,
      direccion
    };

    const url = editingId 
      ? `${API_BASE}/clientes/${editingId}` 
      : `${API_BASE}/clientes`;
    
    const method = editingId ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(clienteData)
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || data.message || 'Error al guardar el cliente');
        }
        return data;
      })
      .then((data) => {
        setMensaje(data.message || (editingId ? '✅ ¡Cliente actualizado exitosamente!' : '✅ ¡Cliente guardado exitosamente!'));
        setNombre('');
        setTelefono('');
        setDireccion('');
        setEditingId(null);
        cargarClientes();
        setTimeout(() => setMensaje(''), 4000);
      })
      .catch((err) => {
        console.error("Error:", err);
        alert(`❌ Error al procesar el cliente: ${err.message}`);
      });
  };

  // Cargar datos al formulario para Modificar
  const handleEdit = (cli) => {
    setEditingId(cli.id);
    setNombre(cli.nombre);
    setTelefono(cli.telefono || '');
    setDireccion(cli.direccion || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancelar la edición activa
  const handleCancelEdit = () => {
    setEditingId(null);
    setNombre('');
    setTelefono('');
    setDireccion('');
  };

  // Eliminar cliente
  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
      fetch(`${API_BASE}/clientes/${id}`, {
        method: 'DELETE'
      })
        .then(async (res) => {
          if (!res.ok) throw new Error('No se pudo eliminar el registro');
          return res.json();
        })
        .then((data) => {
          setMensaje(data.message || '🗑️ Cliente eliminado exitosamente');
          cargarClientes();
          setTimeout(() => setMensaje(''), 4000);
        })
        .catch((err) => {
          console.error("Error al eliminar cliente:", err);
          alert(`❌ Error al eliminar el cliente: ${err.message}`);
        });
    }
  };

  const clientesFiltrados = (Array.isArray(clientes) ? clientes : []).filter((cli) => {
    const texto = busqueda.toLowerCase();
    const nombreCli = (cli.nombre || '').toLowerCase();
    const telefonoCli = (cli.telefono || '').toLowerCase();
    const direccionCli = (cli.direccion || '').toLowerCase();
    return nombreCli.includes(texto) || telefonoCli.includes(texto) || direccionCli.includes(texto);
  });

  return (
    <div className="space-y-8 w-full text-[#36452F] max-w-4xl mx-auto">
      {/* Formulario Estilo Clásico */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-md border border-[#EAE5D9] w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-4 border-b border-[#EAE5D9] gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#36452F] flex items-center gap-3">
              <span>👥</span> 
              {editingId ? 'Editar Cliente' : 'Agregar Nuevo Cliente'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {editingId ? `Modificando cliente ID: #${editingId}` : 'Ingrese los datos generales del nuevo cliente.'}
            </p>
          </div>
          {editingId && (
            <span className="bg-[#EAE5D9] text-[#36452F] font-bold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider">
              Modo Edición Activado
            </span>
          )}
        </div>

        {mensaje && (
          <div className="mb-6 p-4 bg-green-100 text-green-800 font-bold rounded-lg border border-green-200 text-sm">
            {mensaje}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Nombre del Cliente
            </label>
            <input
              type="text"
              placeholder="Ej. María López"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557345] focus:outline-none bg-white text-[#36452F]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Teléfono
            </label>
            <input
              type="text"
              placeholder="Ej. 5587654321"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557345] focus:outline-none bg-white text-[#36452F]"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Dirección
            </label>
            <input
              type="text"
              placeholder="Ej. Calle Principal #123"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557345] focus:outline-none bg-white text-[#36452F]"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-[#EAE5D9]">
            <button
              type="submit"
              className={`w-full sm:flex-1 py-3 px-6 rounded-xl text-white font-bold transition-colors shadow text-sm ${
                editingId 
                  ? 'bg-[#445C37] hover:bg-[#34472A]' 
                  : 'bg-[#557345] hover:bg-[#445C37]'
              }`}
            >
              {editingId ? 'Actualizar Datos del Cliente' : 'Guardar Cliente'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="w-full sm:w-auto px-6 py-3 bg-gray-400 hover:bg-gray-500 text-white rounded-xl font-bold transition-colors text-sm shadow"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Lista de Clientes Registrados */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-md border border-[#EAE5D9] w-full space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#EAE5D9]">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#36452F] flex items-center gap-2">
              <span>📋</span> Lista de Clientes Registrados
            </h2>
            <p className="text-sm text-gray-500 mt-1">Directorio y control general de clientes del sistema.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
            {/* Barra de Búsqueda */}
            <div className="relative w-full sm:w-72">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                🔍
              </span>
              <input
                type="text"
                placeholder="Buscar por nombre, teléfono..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-[#EAE5D9] rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#557345] focus:outline-none text-[#36452F] shadow-sm"
              />
            </div>

            <div className="bg-[#EAE5D9] text-[#36452F] font-bold text-xs px-4 py-3 rounded-xl text-center">
              Total: {clientesFiltrados.length}
            </div>
          </div>
        </div>

        {clientesFiltrados.length === 0 ? (
          <p className="text-center py-12 text-gray-500 font-medium text-sm">
            No hay clientes registrados todavía o coincidentes con la búsqueda.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {clientesFiltrados.map((cli) => (
              <div key={cli.id} className="p-5 border border-[#EAE5D9] rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-[#36452F] text-lg">{cli.nombre}</h3>
                    <span className="bg-[#EAE5D9] text-[#36452F] font-mono text-xs px-2.5 py-1 rounded-full font-bold">
                      ID #{cli.id}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="font-semibold text-gray-700">📞 Teléfono:</span> {cli.telefono || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="font-semibold text-gray-700">📍 Dirección:</span> {cli.direccion || 'N/A'}
                  </p>
                </div>

                {/* Botones de Modificar y Eliminar */}
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleEdit(cli)}
                    className="flex-1 bg-[#557345] hover:bg-[#445C37] text-white py-2 rounded-lg text-xs font-bold transition-colors shadow-sm"
                  >
                    ✏️ Modificar
                  </button>
                  <button
                    onClick={() => handleDelete(cli.id)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-xs font-bold transition-colors shadow-sm"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Clientes;