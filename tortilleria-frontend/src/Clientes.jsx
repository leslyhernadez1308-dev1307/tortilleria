import { useState, useEffect } from 'react';

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [mensaje, setMensaje] = useState('');
  
  // Estado para saber si estamos editando un cliente (guarda su ID)
  const [editingId, setEditingId] = useState(null);

  const cargarClientes = () => {
    fetch('http://localhost:5000/api/clientes')
      .then((res) => res.json())
      .then((data) => setClientes(data))
      .catch((err) => console.error("Error al cargar clientes:", err));
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  // Guardar o Actualizar cliente en MySQL
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!nombre) {
      alert('Por favor ingresa el nombre del cliente');
      return;
    }

    const clienteData = {
      nombre,
      telefono,
      direccion
    };

    const url = editingId 
      ? `http://localhost:5000/api/clientes/${editingId}` 
      : 'http://localhost:5000/api/clientes';
    
    const method = editingId ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(clienteData)
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Error al guardar el cliente');
        }
        return res.json();
      })
      .then(() => {
        setMensaje(editingId ? '✅ ¡Cliente actualizado exitosamente!' : '✅ ¡Cliente guardado exitosamente!');
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
      fetch(`http://localhost:5000/api/clientes/${id}`, {
        method: 'DELETE'
      })
        .then((res) => res.json())
        .then(() => {
          setMensaje('🗑️ Cliente eliminado exitosamente');
          cargarClientes();
          setTimeout(() => setMensaje(''), 4000);
        })
        .catch((err) => {
          console.error("Error al eliminar cliente:", err);
          alert("Error al eliminar el cliente");
        });
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="bg-white p-6 rounded-2xl shadow-md border border-[#EAE5D9]">
        <h2 className="text-2xl font-bold text-[#36452F] mb-4 border-b border-[#EAE5D9] pb-2 flex justify-between items-center">
          <span>{editingId ? '✏️ Editar Cliente' : '👥 Nuevo Cliente'}</span>
          {editingId && (
            <span className="text-xs bg-[#EAE5D9] text-[#36452F] px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
              Modo Edición Activado
            </span>
          )}
        </h2>

        {mensaje && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 font-bold rounded-lg border border-green-200">
            {mensaje}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Cliente</label>
            <input
              type="text"
              placeholder="Ej. María López"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557345] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Teléfono</label>
            <input
              type="text"
              placeholder="Ej. 5587654321"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557345] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Dirección</label>
            <input
              type="text"
              placeholder="Ej. Calle Principal #123"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557345] focus:outline-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className={`flex-1 font-bold py-3 rounded-xl shadow transition-colors text-white ${
                editingId ? 'bg-[#445C37] hover:bg-[#34472A]' : 'bg-[#557345] hover:bg-[#445C37]'
              }`}
            >
              {editingId ? 'Actualizar Cliente' : 'Guardar Cliente'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-6 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-xl shadow transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-md border border-[#EAE5D9]">
        <h2 className="text-xl font-bold text-[#36452F] mb-4 border-b border-[#EAE5D9] pb-2">
          📋 Lista de Clientes Registrados
        </h2>
        {clientes.length === 0 ? (
          <p className="text-gray-500">No hay clientes registrados todavía.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clientes.map((cli) => (
              <div key={cli.id} className="p-4 border border-[#EAE5D9] rounded-xl bg-[#F7F5EE] flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-[#36452F] text-lg mb-1">{cli.nombre}</h3>
                  <p className="text-sm text-gray-600"><span className="font-semibold">Teléfono:</span> {cli.telefono || 'N/A'}</p>
                  <p className="text-sm text-gray-600 mb-3"><span className="font-semibold">Dirección:</span> {cli.direccion || 'N/A'}</p>
                </div>

                {/* Botones de Modificar y Eliminar */}
                <div className="flex gap-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleEdit(cli)}
                    className="flex-1 bg-[#557345] hover:bg-[#445C37] text-white py-1.5 rounded-lg text-sm font-bold transition-colors shadow-sm"
                  >
                    ✏️ Modificar
                  </button>
                  <button
                    onClick={() => handleDelete(cli.id)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-1.5 rounded-lg text-sm font-bold transition-colors shadow-sm"
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