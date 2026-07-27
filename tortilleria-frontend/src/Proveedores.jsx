import { useState, useEffect } from 'react';

function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [nombre, setNombre] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [telefono, setTelefono] = useState('');
  const [mensaje, setMensaje] = useState('');
  
  // Estado para saber si estamos editando un proveedor (guarda su ID)
  const [editingId, setEditingId] = useState(null);

  const cargarProveedores = () => {
    fetch('http://backend-production-db840.up.railway.app/api/proveedores/')
      .then((res) => res.json())
      .then((data) => setProveedores(data))
      .catch((err) => console.error("Error al cargar proveedores:", err));
  };

  useEffect(() => {
    cargarProveedores();
  }, []);

  // Guardar o Actualizar proveedor en MySQL
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!nombre) {
      alert('Por favor ingresa el nombre del proveedor');
      return;
    }

    const proveedorData = {
      nombre,
      empresa,
      telefono
    };

    const url = editingId 
      ? `http://backend-production-db840.up.railway.app/api/proveedores/${editingId}` 
      : 'http://backend-production-db840.up.railway.app/api/proveedores';
    
    const method = editingId ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(proveedorData)
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Error al guardar el proveedor');
        }
        return res.json();
      })
      .then(() => {
        setMensaje(editingId ? '✅ ¡Proveedor actualizado exitosamente!' : '✅ ¡Proveedor guardado exitosamente!');
        setNombre('');
        setEmpresa('');
        setTelefono('');
        setEditingId(null);
        cargarProveedores();
        setTimeout(() => setMensaje(''), 4000);
      })
      .catch((err) => {
        console.error("Error:", err);
        alert(`❌ Error al procesar el proveedor: ${err.message}`);
      });
  };

  // Cargar datos al formulario para Modificar
  const handleEdit = (prov) => {
    setEditingId(prov.id);
    setNombre(prov.nombre);
    setEmpresa(prov.empresa || '');
    setTelefono(prov.telefono || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancelar la edición activa
  const handleCancelEdit = () => {
    setEditingId(null);
    setNombre('');
    setEmpresa('');
    setTelefono('');
  };

  // Eliminar proveedor
  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este proveedor?')) {
      fetch(`http://backend-production-db840.up.railway.app/api/proveedores/${id}`, {
        method: 'DELETE'
      })
        .then((res) => res.json())
        .then(() => {
          setMensaje('🗑️ Proveedor eliminado exitosamente');
          cargarProveedores();
          setTimeout(() => setMensaje(''), 4000);
        })
        .catch((err) => {
          console.error("Error al eliminar proveedor:", err);
          alert("Error al eliminar el proveedor");
        });
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="bg-white p-6 rounded-2xl shadow-md border border-[#EAE5D9]">
        <h2 className="text-2xl font-bold text-[#36452F] mb-4 border-b border-[#EAE5D9] pb-2 flex justify-between items-center">
          <span>{editingId ? '✏️ Editar Proveedor' : '🚚 Nuevo Proveedor'}</span>
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
            <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Proveedor</label>
            <input
              type="text"
              placeholder="Ej. Juan Pérez"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557345] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Empresa</label>
            <input
              type="text"
              placeholder="Ej. Distribuidora de Maíz S.A."
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557345] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Teléfono</label>
            <input
              type="text"
              placeholder="Ej. 5512345678"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
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
              {editingId ? 'Actualizar Proveedor' : 'Guardar Proveedor'}
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
          📋 Lista de Proveedores Registrados
        </h2>
        {proveedores.length === 0 ? (
          <p className="text-gray-500">No hay proveedores registrados todavía.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {proveedores.map((prov) => (
              <div key={prov.id} className="p-4 border border-[#EAE5D9] rounded-xl bg-[#F7F5EE] flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-[#36452F] text-lg mb-1">{prov.nombre}</h3>
                  <p className="text-sm text-gray-600"><span className="font-semibold">Empresa:</span> {prov.empresa || 'N/A'}</p>
                  <p className="text-sm text-gray-600 mb-3"><span className="font-semibold">Teléfono:</span> {prov.telefono || 'N/A'}</p>
                </div>

                {/* Botones de Modificar y Eliminar */}
                <div className="flex gap-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleEdit(prov)}
                    className="flex-1 bg-[#557345] hover:bg-[#445C37] text-white py-1.5 rounded-lg text-sm font-bold transition-colors shadow-sm"
                  >
                    ✏️ Modificar
                  </button>
                  <button
                    onClick={() => handleDelete(prov.id)}
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

export default Proveedores;