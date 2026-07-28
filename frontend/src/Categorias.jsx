import React, { useEffect, useState } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://backend-production-db840.up.railway.app';
const API_BASE = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [idEditando, setIdEditando] = useState(null);
  const [formCategoria, setFormCategoria] = useState({ nombre: '', descripcion: '' });
  const [busqueda, setBusqueda] = useState('');

  const cargarCategorias = () => {
    setCargando(true);
    fetch(`${API_BASE}/categorias`)
      .then((res) => res.json())
      .then((data) => {
        setCategorias(Array.isArray(data) ? data : []);
        setCargando(false);
      })
      .catch((err) => {
        console.error('Error al cargar categorías:', err);
        setCategorias([]);
        setCargando(false);
      });
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const resetearFormulario = () => {
    setFormCategoria({ nombre: '', descripcion: '' });
    setIdEditando(null);
  };

  const handleEditarClick = (cat) => {
    setIdEditando(cat.id);
    setFormCategoria({
      nombre: cat.nombre || '',
      descripcion: cat.descripcion || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEliminarClick = (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta categoría? Si hay productos asociados, la operación podría requerir reasignación.')) {
      fetch(`${API_BASE}/categorias/${id}`, {
        method: 'DELETE'
      })
        .then(async (res) => {
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(data.error || data.message || 'No se pudo eliminar la categoría');
          }
          return data;
        })
        .then((data) => {
          alert(data.message || 'Categoría eliminada exitosamente');
          cargarCategorias();
        })
        .catch((err) => {
          console.error('Error al eliminar categoría:', err);
          alert(`❌ No se pudo eliminar: ${err.message}`);
        });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formCategoria.nombre.trim()) {
      alert('El nombre de la categoría es obligatorio.');
      return;
    }

    const url = idEditando ? `${API_BASE}/categorias/${idEditando}` : `${API_BASE}/categorias`;
    const method = idEditando ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formCategoria)
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || data.message || 'Error en el servidor');
        }
        return data;
      })
      .then((data) => {
        alert(data.message || (idEditando ? 'Categoría actualizada' : 'Categoría registrada'));
        resetearFormulario();
        cargarCategorias();
      })
      .catch((err) => {
        console.error('Error al guardar categoría:', err);
        alert(`❌ Error: ${err.message}`);
      });
  };

  const categoriasFiltradas = categorias.filter((cat) =>
    (cat.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (cat.descripcion || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-8 w-full text-[#36452F] max-w-5xl mx-auto pb-12">
      {/* Formulario de Categorías */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-md border border-[#EAE5D9] w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-4 border-b border-[#EAE5D9] gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#36452F] flex items-center gap-3">
              <span>🏷️</span>
              {idEditando ? 'Actualizar Categoría' : 'Gestión de Categorías'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {idEditando ? `Modificando categoría ID: #${idEditando}` : 'Añade y organiza las clasificaciones de productos.'}
            </p>
          </div>
          {idEditando && (
            <span className="bg-[#EAE5D9] text-[#36452F] font-bold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider">
              Modo Edición Activado
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Nombre de la Categoría
              </label>
              <input
                type="text"
                placeholder="Ej. Derivados de Maíz, Bebidas..."
                required
                value={formCategoria.nombre}
                onChange={(e) => setFormCategoria({ ...formCategoria, nombre: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557345] focus:outline-none bg-white text-[#36452F]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Descripción / Detalles
              </label>
              <input
                type="text"
                placeholder="Ej. Tortillas frescas del día y masas"
                value={formCategoria.descripcion}
                onChange={(e) => setFormCategoria({ ...formCategoria, descripcion: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557345] focus:outline-none bg-white text-[#36452F]"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-[#EAE5D9]">
            <button
              type="submit"
              className={`w-full sm:flex-1 py-3 px-6 rounded-xl text-white font-bold transition-colors shadow text-sm ${
                idEditando 
                  ? 'bg-[#445C37] hover:bg-[#34472A]' 
                  : 'bg-[#557345] hover:bg-[#445C37]'
              }`}
            >
              {idEditando ? 'Guardar Cambios de Categoría' : 'Guardar Nueva Categoría'}
            </button>

            {idEditando && (
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

      {/* Listado de Categorías */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-md border border-[#EAE5D9] w-full space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#EAE5D9]">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#36452F] flex items-center gap-2">
              <span>📋</span> Listado de Categorías
            </h2>
            <p className="text-sm text-gray-500 mt-1">Clasificaciones actuales registradas en la base de datos.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-72">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Buscar categoría..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-[#EAE5D9] rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#557345] focus:outline-none text-[#36452F] shadow-sm"
              />
            </div>

            <div className="bg-[#EAE5D9] text-[#36452F] font-bold text-xs px-4 py-3 rounded-xl text-center whitespace-nowrap">
              Total: {categoriasFiltradas.length}
            </div>
          </div>
        </div>

        {cargando ? (
          <p className="text-gray-500 font-medium text-center py-8">Cargando categorías...</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#EAE5D9] bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#EAE5D9]/60 text-[#36452F] text-xs font-bold uppercase tracking-wider border-b border-[#EAE5D9]">
                  <th className="p-4">ID</th>
                  <th className="p-4">Nombre</th>
                  <th className="p-4">Descripción</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-[#EAE5D9]">
                {categoriasFiltradas.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-mono text-gray-500 font-bold">#{cat.id}</td>
                    <td className="p-4 font-bold text-[#36452F]">{cat.nombre}</td>
                    <td className="p-4 text-gray-600 font-medium">{cat.descripcion || 'Sin descripción'}</td>
                    <td className="p-4 text-center space-x-2">
                      <button
                        onClick={() => handleEditarClick(cat)}
                        className="bg-[#557345] hover:bg-[#445C37] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminarClick(cat.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {categoriasFiltradas.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-12 text-gray-500 font-medium text-sm">
                      No se encontraron categorías registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Categorias;