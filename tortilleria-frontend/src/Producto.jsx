import { useState, useEffect } from 'react';

function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Estado para la barra de búsqueda
  const [busqueda, setBusqueda] = useState('');

  // Estados del Formulario
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [proveedorId, setProveedorId] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [editingId, setEditingId] = useState(null);

  const cargarDatos = () => {
    setCargando(true);
    fetch('http://backend-production-db840.up.railway.app/api/productos/')
      .then((res) => res.json())
      .then((data) => {
        setProductos(data);
        setCargando(false);
      })
      .catch((err) => {
        console.error("Error al cargar productos:", err);
        setCargando(false);
      });

    fetch('http://backend-production-db840.up.railway.app/api/categorias/')
      .then((res) => res.json())
      .then((data) => {
        setCategorias(data);
        if (data.length > 0 && !categoriaId) setCategoriaId(data[0].id);
      });

    fetch('http://backend-production-db840.up.railway.app/api/proveedores/')
      .then((res) => res.json())
      .then((data) => {
        setProveedores(data);
        if (data.length > 0 && !proveedorId) setProveedorId(data[0].id);
      });
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!nombre || !precio) {
      alert('Por favor ingresa un nombre y precio válido');
      return;
    }

    const productoData = {
      nombre,
      precio: parseFloat(precio),
      categoria_id: parseInt(categoriaId),
      proveedor_id: parseInt(proveedorId)
    };

    const url = editingId 
      ? `http://backend-production-db840.up.railway.app/api/productos/${editingId}` 
      : 'http://backend-production-db840.up.railway.app/api/productos/';
    
    const method = editingId ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productoData)
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Error en el servidor');
        }
        return res.json();
      })
      .then(() => {
        setMensaje(editingId ? '✅ ¡Producto actualizado exitosamente!' : '✅ ¡Producto guardado exitosamente!');
        setNombre('');
        setPrecio('');
        setEditingId(null);
        cargarDatos();
        setTimeout(() => setMensaje(''), 4000);
      })
      .catch((err) => {
        console.error("Error al procesar el producto:", err);
        alert(`❌ Error al guardar o actualizar: ${err.message}`);
      });
  };

  const handleEdit = (prod) => {
    setEditingId(prod.id);
    setNombre(prod.nombre);
    setPrecio(prod.precio);
    if (prod.categoria_id) setCategoriaId(prod.categoria_id);
    if (prod.proveedor_id) setProveedorId(prod.proveedor_id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNombre('');
    setPrecio('');
    if (categorias.length > 0) setCategoriaId(categorias[0].id);
    if (proveedores.length > 0) setProveedorId(proveedores[0].id);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      fetch(`http://backend-production-db840.up.railway.app/api/productos/${id}`, {
        method: 'DELETE'
      })
        .then((res) => res.json())
        .then(() => {
          setMensaje('🗑️ Producto eliminado exitosamente');
          cargarDatos();
          setTimeout(() => setMensaje(''), 4000);
        })
        .catch((err) => {
          console.error("Error al eliminar producto:", err);
          alert("Error al eliminar el producto");
        });
    }
  };

  // Filtrar productos según lo escrito en la barra de búsqueda
  const productosFiltrados = productos.filter((prod) => {
    const query = busqueda.toLowerCase();
    const nombreMatch = prod.nombre?.toLowerCase().includes(query);
    const categoriaMatch = (prod.categoria || prod.categoria_nombre || '').toLowerCase().includes(query);
    const proveedorMatch = (prod.proveedor || prod.proveedor_nombre || prod.proveedor_empresa || '').toLowerCase().includes(query);
    return nombreMatch || categoriaMatch || proveedorMatch;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Formulario de Registro / Edición */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-[#EAE5D9]">
        <h2 className="text-2xl font-bold text-[#36452F] mb-4 border-b border-[#EAE5D9] pb-2 flex justify-between items-center">
          <span>{editingId ? '✏️ Editar Producto' : '➕ Agregar Nuevo Producto'}</span>
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

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Producto</label>
            <input
              type="text"
              placeholder="Ej. Totopos Crujientes 500g"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557345] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Precio ($ MXN)</label>
            <input
              type="number"
              step="0.50"
              placeholder="Ej. 18.50"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557345] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Categoría</label>
            <select
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557345] focus:outline-none bg-white"
            >
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Proveedor</label>
            <select
              value={proveedorId}
              onChange={(e) => setProveedorId(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557345] focus:outline-none bg-white"
            >
              {proveedores.map((prov) => (
                <option key={prov.id} value={prov.id}>
                  {prov.nombre} {prov.empresa ? `(${prov.empresa})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 mt-2 flex gap-3">
            <button
              type="submit"
              className={`flex-1 font-bold py-3 rounded-xl shadow transition-colors text-white ${
                editingId ? 'bg-[#445C37] hover:bg-[#34472A]' : 'bg-[#557345] hover:bg-[#445C37]'
              }`}
            >
              {editingId ? 'Actualizar Producto' : 'Guardar producto'}
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

      {/* Sección del Catálogo de Productos y Buscador con Lupa */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#EAE5D9] pb-3">
          <h2 className="text-2xl font-bold text-[#36452F]">
            📦 Catálogo de Productos Registrados
          </h2>

          {/* Input con Lupa */}
          <div className="relative w-full md:w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Buscar producto, categoría..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#EAE5D9] rounded-xl focus:ring-2 focus:ring-[#557345] focus:outline-none text-sm shadow-sm"
            />
          </div>
        </div>

        {cargando ? (
          <p className="text-[#557345] font-medium">Cargando datos...</p>
        ) : productos.length === 0 ? (
          <p className="text-gray-500 bg-white p-4 rounded-xl border border-[#EAE5D9]">No hay productos registrados todavía.</p>
        ) : productosFiltrados.length === 0 ? (
          <p className="text-gray-500 bg-white p-4 rounded-xl border border-[#EAE5D9]">No se encontraron productos que coincidan con la búsqueda.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productosFiltrados.map((prod) => (
              <div key={prod.id} className="bg-white p-5 rounded-xl shadow-md border border-[#EAE5D9] hover:shadow-lg transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-[#36452F]">{prod.nombre}</h3>
                    <span className="bg-[#EAE5D9] text-[#36452F] font-black px-3 py-1 rounded-full text-sm">
                      ${prod.precio} MXN
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-[#F7F5EE] border border-[#EAE5D9] text-[#36452F] text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                      🏷️ {prod.categoria || prod.categoria_nombre || 'Sin categoría'}
                    </span>
                    <span className="bg-[#F7F5EE] border border-[#EAE5D9] text-[#36452F] text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                      🚚 {prod.proveedor || prod.proveedor_nombre || prod.proveedor_empresa || 'Sin proveedor'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleEdit(prod)}
                    className="flex-1 bg-[#557345] hover:bg-[#445C37] text-white py-1.5 rounded-lg text-sm font-bold transition-colors shadow-sm"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleDelete(prod.id)}
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

export default Productos;