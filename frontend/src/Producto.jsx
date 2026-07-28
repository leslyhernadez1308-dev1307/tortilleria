import { useState, useEffect } from 'react';

// Manejo dinámico de la URL mediante variable de entorno con respaldo al backend en Railway
const BASE_URL = import.meta.env.VITE_API_URL || 'https://backend-production-db840.up.railway.app';
const API_BASE = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [idEditando, setIdEditando] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  const [formProducto, setFormProducto] = useState({
    nombre: '',
    precio: '',
    categoria_id: '',
    proveedor_id: ''
  });

  // Cargar productos, categorías y proveedores desde la API
  const cargarDatos = () => {
    setCargando(true);

    // 1. Cargar Productos
    fetch(`${API_BASE}/productos`)
      .then((res) => res.json())
      .then((data) => {
        setProductos(Array.isArray(data) ? data : []);
        setCargando(false);
      })
      .catch((err) => {
        console.error('Error al cargar productos:', err);
        setProductos([]);
        setCargando(false);
      });

    // 2. Cargar Categorías
    fetch(`${API_BASE}/categorias`)
      .then((res) => res.json())
      .then((data) => {
        const cats = Array.isArray(data) ? data : [];
        setCategorias(cats);
        if (cats.length > 0 && !formProducto.categoria_id) {
          setFormProducto((prev) => ({ ...prev, categoria_id: cats[0].id }));
        }
      })
      .catch((err) => console.error('Error al cargar categorías:', err));

    // 3. Cargar Proveedores
    fetch(`${API_BASE}/proveedores`)
      .then((res) => res.json())
      .then((data) => {
        const provs = Array.isArray(data) ? data : [];
        setProveedores(provs);
        if (provs.length > 0 && !formProducto.proveedor_id) {
          setFormProducto((prev) => ({ ...prev, proveedor_id: provs[0].id }));
        }
      })
      .catch((err) => console.error('Error al cargar proveedores:', err));
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Limpiar formulario y cancelar edición
  const resetearFormulario = () => {
    setFormProducto({
      nombre: '',
      precio: '',
      categoria_id: categorias.length > 0 ? categorias[0].id : '',
      proveedor_id: proveedores.length > 0 ? proveedores[0].id : ''
    });
    setIdEditando(null);
  };

  // Cargar datos en el formulario para editar
  const handleEditarClick = (prod) => {
    setIdEditando(prod.id);
    setFormProducto({
      nombre: prod.nombre || '',
      precio: prod.precio || '',
      categoria_id: prod.categoria_id || (categorias[0]?.id ?? ''),
      proveedor_id: prod.proveedor_id || (proveedores[0]?.id ?? '')
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Eliminar producto con manejo robusto de errores del backend
  const handleEliminarClick = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto del inventario?')) {
      fetch(`${API_BASE}/productos/${id}`, {
        method: 'DELETE'
      })
        .then(async (res) => {
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(data.error || data.message || 'No se pudo eliminar el registro');
          }
          return data;
        })
        .then((data) => {
          alert(data.message || 'Producto eliminado exitosamente');
          cargarDatos();
        })
        .catch((err) => {
          console.error('Error al eliminar producto:', err);
          alert(`❌ No se pudo eliminar: ${err.message}`);
        });
    }
  };

  // Guardar o actualizar producto
  const handleProductoSubmit = (e) => {
    e.preventDefault();

    if (!formProducto.nombre || !formProducto.precio || !formProducto.categoria_id || !formProducto.proveedor_id) {
      alert('Por favor completa todos los campos requeridos.');
      return;
    }

    const payload = {
      nombre: formProducto.nombre.trim(),
      precio: parseFloat(formProducto.precio),
      categoria_id: parseInt(formProducto.categoria_id),
      proveedor_id: parseInt(formProducto.proveedor_id)
    };

    const esEdicion = idEditando !== null;
    const url = esEdicion
      ? `${API_BASE}/productos/${idEditando}`
      : `${API_BASE}/productos`;
    const method = esEdicion ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || data.message || 'Error en el servidor');
        }
        return data;
      })
      .then((data) => {
        alert(data.message || (esEdicion ? 'Producto actualizado' : 'Producto registrado'));
        resetearFormulario();
        cargarDatos();
      })
      .catch((err) => {
        console.error('Error al procesar producto:', err);
        alert(`❌ Error al guardar: ${err.message}`);
      });
  };

  // Filtrar productos
  const productosFiltrados = (Array.isArray(productos) ? productos : []).filter((prod) => {
    const texto = busqueda.toLowerCase();
    const nombreProd = (prod.nombre || '').toLowerCase();
    const nombreCat = (prod.categoria || '').toLowerCase();
    const nombreProv = (prod.proveedor || '').toLowerCase();
    return nombreProd.includes(texto) || nombreCat.includes(texto) || nombreProv.includes(texto);
  });

  return (
    <div className="space-y-8 w-full text-[#36452F] max-w-5xl mx-auto pb-12">
      {/* Formulario Estilo Clásico */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-md border border-[#EAE5D9] w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-4 border-b border-[#EAE5D9] gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#36452F] flex items-center gap-3">
              <span>🌽</span> 
              {idEditando ? 'Actualizar Información del Producto' : 'Registro de Artículos - La Tradicional'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {idEditando ? `Modificando registro ID: #${idEditando}` : 'Complete las especificaciones para dar de alta un producto en el sistema.'}
            </p>
          </div>
          {idEditando && (
            <span className="bg-[#EAE5D9] text-[#36452F] font-bold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider">
              Modo Edición Activo
            </span>
          )}
        </div>

        <form onSubmit={handleProductoSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Nombre del Producto
              </label>
              <input
                type="text"
                placeholder="Ej. Tortilla de Maíz 1kg"
                required
                value={formProducto.nombre}
                onChange={(e) => setFormProducto({ ...formProducto, nombre: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557345] focus:outline-none bg-white text-[#36452F]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Precio Unitario ($ MXN)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 font-bold">$</span>
                <input
                  type="number"
                  step="0.50"
                  placeholder="0.00"
                  required
                  value={formProducto.precio}
                  onChange={(e) => setFormProducto({ ...formProducto, precio: e.target.value })}
                  className="w-full pl-8 pr-4 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557345] focus:outline-none bg-white text-[#36452F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Categoría
              </label>
              <select
                required
                value={formProducto.categoria_id}
                onChange={(e) => setFormProducto({ ...formProducto, categoria_id: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557345] focus:outline-none bg-white text-[#36452F]"
              >
                <option value="" className="text-gray-400">Selecciona una categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Proveedor Asociado
              </label>
              <select
                required
                value={formProducto.proveedor_id}
                onChange={(e) => setFormProducto({ ...formProducto, proveedor_id: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557345] focus:outline-none bg-white text-[#36452F]"
              >
                <option value="" className="text-gray-400">Selecciona un proveedor de la lista</option>
                {proveedores.map((prov) => (
                  <option key={prov.id} value={prov.id}>
                    {prov.nombre} {prov.empresa ? `(${prov.empresa})` : ''}
                  </option>
                ))}
              </select>
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
              {idEditando ? 'Actualizar Datos del Producto' : 'Guardar Producto'}
            </button>

            {idEditando && (
              <button
                type="button"
                onClick={resetearFormulario}
                className="w-full sm:w-auto px-6 py-3 bg-gray-400 hover:bg-gray-500 text-white rounded-xl font-bold transition-colors text-sm shadow"
              >
                Cancelar Edición
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Catálogo e Inventario */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-md border border-[#EAE5D9] w-full space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#EAE5D9]">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#36452F] flex items-center gap-2">
              <span>📋</span> Catálogo de Productos Registrados
            </h2>
            <p className="text-sm text-gray-500 mt-1">Control general de precios y existencias en inventario.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-72">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                🔍
              </span>
              <input
                type="text"
                placeholder="Buscar producto, categoría..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-[#EAE5D9] rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#557345] focus:outline-none text-[#36452F] shadow-sm"
              />
            </div>

            <div className="bg-[#EAE5D9] text-[#36452F] font-bold text-xs px-4 py-3 rounded-xl text-center">
              Total: {productosFiltrados.length}
            </div>
          </div>
        </div>

        {cargando ? (
          <p className="text-gray-500 font-medium text-center py-8">Cargando productos...</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#EAE5D9] bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[#36452F] text-xs font-bold uppercase tracking-wider border-b border-[#EAE5D9]">
                  <th className="p-4">ID</th>
                  <th className="p-4">Producto</th>
                  <th className="p-4">Precio Unitario</th>
                  <th className="p-4">Categoría</th>
                  <th className="p-4">Proveedor</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-[#EAE5D9]">
                {productosFiltrados.map((prod) => (
                  <tr key={prod.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-mono text-gray-500 font-bold">#{prod.id}</td>
                    <td className="p-4 font-bold text-[#36452F]">{prod.nombre}</td>
                    <td className="p-4 font-black text-[#557345]">${Number(prod.precio || 0).toFixed(2)} MXN</td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-[#EAE5D9] text-[#36452F]">
                        🏷️ {prod.categoria || 'Sin categoría'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 font-medium">🚚 {prod.proveedor || 'Sin proveedor'}</td>
                    <td className="p-4 text-center space-x-2">
                      <button
                        onClick={() => handleEditarClick(prod)}
                        className="bg-[#557345] hover:bg-[#445C37] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminarClick(prod.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {productosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-gray-500 font-medium text-sm">
                      No se encontraron productos coincidentes en el catálogo.
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

export default Productos;