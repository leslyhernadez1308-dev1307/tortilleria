import { useState, useEffect } from 'react';

function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [mensaje, setMensaje] = useState('');
  
  // Estado para saber si estamos editando una categoría (guarda su ID)
  const [editingId, setEditingId] = useState(null);

  const cargarCategorias = () => {
    fetch('backend-production-db840.up.railway.app/api/categorias/')
      .then((res) => res.json())
      .then((data) => setCategorias(data))
      .catch((err) => console.error("Error al cargar categorías:", err));
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  // Guardar o Actualizar categoría en MySQL
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!nombre) {
      alert('Por favor ingresa el nombre de la categoría');
      return;
    }

    const categoriaData = {
      nombre,
      descripcion
    };

    const url = editingId 
      ? `http://backend-production-db840.up.railway.app/api/categorias/${editingId}` 
      : 'http://backend-production-db840.up.railway.app/api/categorias/';
    
    const method = editingId ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(categoriaData)
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Error al guardar la categoría');
        }
        return res.json();
      })
      .then(() => {
        setMensaje(editingId ? '✅ ¡Categoría actualizada exitosamente!' : '✅ ¡Categoría guardada exitosamente!');
        setNombre('');
        setDescripcion('');
        setEditingId(null);
        cargarCategorias();
        setTimeout(() => setMensaje(''), 4000);
      })
      .catch((err) => {
        console.error("Error:", err);
        alert(`❌ Error al procesar la categoría: ${err.message}`);
      });
  };

  // Cargar datos al formulario para Modificar
  const handleEdit = (cat) => {
    setEditingId(cat.id);
    setNombre(cat.nombre);
    setDescripcion(cat.descripcion || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancelar la edición activa
  const handleCancelEdit = () => {
    setEditingId(null);
    setNombre('');
    setDescripcion('');
  };

  // Eliminar categoría
  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta categoría?')) {
      fetch(`backend-production-db840.up.railway.app/api/categorias/${id}`, {
        method: 'DELETE'
      })
        .then((res) => res.json())
        .then(() => {
          setMensaje('🗑️ Categoría eliminada exitosamente');
          cargarCategorias();
          setTimeout(() => setMensaje(''), 4000);
        })
        .catch((err) => {
          console.error("Error al eliminar categoría:", err);
          alert("Error al eliminar la categoría");
        });
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="bg-white p-6 rounded-2xl shadow-md border border-[#EAE5D9]">
        <h2 className="text-2xl font-bold text-[#36452F] mb-4 border-b border-[#EAE5D9] pb-2 flex justify-between items-center">
          <span>{editingId ? '✏️ Editar Categoría' : '🏷️ Agregar Nueva Categoría'}</span>
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
            <label className="block text-sm font-bold text-gray-700 mb-1">Nombre de la Categoría</label>
            <input
              type="text"
              placeholder="Ej. Tortillas, Totopos, Bebidas..."
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557345] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Descripción</label>
            <textarea
              placeholder="Breve descripción de la categoría..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557345] focus:outline-none resize-none h-24"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className={`flex-1 font-bold py-3 rounded-xl shadow transition-colors text-white ${
                editingId ? 'bg-[#445C37] hover:bg-[#34472A]' : 'bg-[#557345] hover:bg-[#445C37]'
              }`}
            >
              {editingId ? 'Actualizar Categoría' : 'Guardar Categoría'}
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
          📋 Catálogo de Categorías Registradas
        </h2>
        {categorias.length === 0 ? (
          <p className="text-gray-500">No hay categorías registradas todavía.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categorias.map((cat) => (
              <div key={cat.id} className="p-4 border border-[#EAE5D9] rounded-xl bg-[#F7F5EE] flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-[#36452F] text-lg mb-1">{cat.nombre}</h3>
                  <p className="text-sm text-gray-600 mb-3"><span className="font-semibold">Descripción:</span> {cat.descripcion || 'Sin descripción'}</p>
                </div>

                {/* Botones de Modificar y Eliminar */}
                <div className="flex gap-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="flex-1 bg-[#557345] hover:bg-[#445C37] text-white py-1.5 rounded-lg text-sm font-bold transition-colors shadow-sm"
                  >
                    ✏️ Modificar
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
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

export default Categorias;