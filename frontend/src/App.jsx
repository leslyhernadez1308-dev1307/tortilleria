import { useEffect, useState } from 'react';
import Proveedores from './Proveedores';
import Pedido from './Pedido';
import Clientes from './Clientes';
import Categorias from './Categorias';
import Inicio from './Inicio';

// Manejo dinámico de la URL mediante variable de entorno con respaldo al backend en Railway
const BASE_URL = import.meta.env.VITE_API_URL || 'https://backend-production-db840.up.railway.app';
const API_BASE = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

function App() {
  const [pestaña, setPestaña] = useState('inicio');
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Estado para la barra de búsqueda en la sección de productos
  const [busqueda, setBusqueda] = useState('');

  // Estados del Formulario de Productos
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [proveedorId, setProveedorId] = useState('');
  const [mensaje, setMensaje] = useState('');
  
  // Estado para saber si estamos editando un producto (guarda su ID)
  const [editingId, setEditingId] = useState(null);

  // Cargar datos necesarios para el catálogo y selectores de Productos
  const cargarDatosProductos = () => {
    setCargando(true);
    
    // Cargar productos
    fetch(`${API_BASE}/productos`)
      .then((res) => res.json())
      .then((data) => {
        setProductos(Array.isArray(data) ? data : []);
        setCargando(false);
      })
      .catch((err) => {
        console.error("Error al cargar productos:", err);
        setCargando(false);
      });

    // Cargar categorías
    fetch(`${API_BASE}/categorias`)
      .then((res) => res.json())
      .then((data) => {
        const cats = Array.isArray(data) ? data : [];
        setCategorias(cats);
        if (cats.length > 0 && !categoriaId) setCategoriaId(cats[0].id);
      })
      .catch((err) => console.error("Error al cargar categorías:", err));

    // Cargar proveedores
    fetch(`${API_BASE}/proveedores`)
      .then((res) => res.json())
      .then((data) => {
        const provs = Array.isArray(data) ? data : [];
        setProveedores(provs);
        if (provs.length > 0 && !proveedorId) setProveedorId(provs[0].id);
      })
      .catch((err) => console.error("Error al cargar proveedores:", err));
  };

  useEffect(() => {
    cargarDatosProductos();
  }, []);

  // Guardar o Actualizar producto en MySQL
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!nombre.trim() || !precio) {
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
      ? `${API_BASE}/productos/${editingId}` 
      : `${API_BASE}/productos`;
    
    const method = editingId ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productoData)
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || data.message || 'Error en el servidor');
        }
        return data;
      })
      .then((data) => {
        setMensaje(data.message || (editingId ? '✅ ¡Producto actualizado exitosamente!' : '✅ ¡Producto guardado exitosamente!'));
        setNombre('');
        setPrecio('');
        setEditingId(null);
        cargarDatosProductos();
        setTimeout(() => setMensaje(''), 4000);
      })
      .catch((err) => {
        console.error("Error al procesar el producto:", err);
        alert(`❌ Error al guardar o actualizar: ${err.message}`);
      });
  };

  // Cargar datos al formulario para Editar
  const handleEdit = (prod) => {
    setEditingId(prod.id);
    setNombre(prod.nombre);
    setPrecio(prod.precio);
    if (prod.categoria_id) setCategoriaId(prod.categoria_id);
    if (prod.proveedor_id) setProveedorId(prod.proveedor_id);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancelar la edición activa
  const handleCancelEdit = () => {
    setEditingId(null);
    setNombre('');
    setPrecio('');
    if (categorias.length > 0) setCategoriaId(categorias[0].id);
    if (proveedores.length > 0) setProveedorId(proveedores[0].id);
  };

  // Eliminar producto
  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      fetch(`${API_BASE}/productos/${id}`, {
        method: 'DELETE'
      })
        .then(async (res) => {
          if (!res.ok) throw new Error('No se pudo eliminar el producto');
          return res.json();
        })
        .then((data) => {
          setMensaje(data.message || '🗑️ Producto eliminado exitosamente');
          cargarDatosProductos();
          setTimeout(() => setMensaje(''), 4000);
        })
        .catch((err) => {
          console.error("Error al eliminar producto:", err);
          alert(`❌ Error al eliminar el producto: ${err.message}`);
        });
    }
  };

  // Filtrar productos según lo escrito en la barra de búsqueda
  const productosFiltrados = (Array.isArray(productos) ? productos : []).filter((prod) => {
    const query = busqueda.toLowerCase();
    const nombreMatch = (prod.nombre || '').toLowerCase().includes(query);
    const categoriaMatch = (prod.categoria || prod.categoria_nombre || '').toLowerCase().includes(query);
    const proveedorMatch = (prod.proveedor || prod.proveedor_nombre || prod.proveedor_empresa || '').toLowerCase().includes(query);
    return nombreMatch || categoriaMatch || proveedorMatch;
  });

  return (
    <div className="min-h-screen bg-[#F9F8F6] p-4 md:p-8 font-sans text-[#36452F] flex flex-col items-center">
      {/* Encabezado Principal */}
      <header className="w-full max-w-5xl mx-auto mb-8 text-center bg-white p-6 md:p-8 rounded-2xl shadow-md border border-[#EAE5D9]">
        <h1 className="text-3xl md:text-4xl font-bold text-[#36452F] tracking-tight mb-2 flex items-center justify-center gap-3">
          <span>🌽</span> Tortillería "La Tradicional"
        </h1>
        <p className="text-[#557345] font-semibold text-sm md:text-base">Sistema de Gestión e Inventario Dinámico</p>
        
        {/* Navegación por Pestañas */}
        <nav aria-label="Navegación principal" className="flex justify-center gap-2 md:gap-3 mt-6 flex-wrap">
          {[
            { id: 'inicio', label: '🏠 Inicio' },
            { id: 'productos', label: '📦 Productos' },
            { id: 'categorias', label: '🏷️ Categorías' },
            { id: 'clientes', label: '👥 Clientes' },
            { id: 'proveedores', label: '🚚 Proveedores' },
            { id: 'pedidos', label: '📋 Pedidos' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPestaña(tab.id)}
              className={`px-4 md:px-5 py-2.5 rounded-xl font-bold transition-all text-sm border shadow-sm ${
                pestaña === tab.id
                  ? 'bg-[#557345] text-white border-[#557345]'
                  : 'bg-white text-[#36452F] border-[#EAE5D9] hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Vistas dinámicas */}
      <main className="w-full max-w-5xl mx-auto space-y-8">
        {pestaña === 'inicio' && <Inicio cambiarPestaña={setPestaña} />}

        {/* Vista: PRODUCTOS */}
        {pestaña === 'productos' && (
          <div className="space-y-8 pb-12 w-full">
            <div className="bg-white shadow-md rounded-2xl p-6 md:p-8 border border-[#EAE5D9] w-full">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-4 border-b border-[#EAE5D9] gap-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-[#36452F] flex items-center gap-3">
                    <span className="p-2 bg-[#EAE5D9] text-[#557345] rounded-xl text-lg">📦</span> 
                    {editingId ? 'Actualizar Información de Producto' : 'Módulo de Registro de Productos'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {editingId ? `Modificando producto ID: #${editingId}` : 'Ingrese los datos generales del nuevo producto para el inventario.'}
                  </p>
                </div>
                {editingId && (
                  <span className="bg-[#EAE5D9] text-[#36452F] font-bold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                    Modo Edición Activado
                  </span>
                )}
              </div>

              {mensaje && (
                <div className="mb-6 p-4 bg-emerald-50 text-emerald-800 font-bold rounded-xl border border-emerald-200 text-sm flex items-center gap-2">
                  <span>ℹ️</span> {mensaje}
                </div>
              )}

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Nombre del Producto
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Totopos Crujientes 500g"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557345] focus:outline-none bg-white text-[#36452F]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Precio ($ MXN)
                  </label>
                  <input
                    type="number"
                    step="0.50"
                    placeholder="Ej. 18.50"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557345] focus:outline-none bg-white text-[#36452F]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select
                    value={categoriaId}
                    onChange={(e) => setCategoriaId(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557345] focus:outline-none bg-white text-[#36452F]"
                  >
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-white text-[#36452F]">
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Proveedor
                  </label>
                  <select
                    value={proveedorId}
                    onChange={(e) => setProveedorId(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557345] focus:outline-none bg-white text-[#36452F]"
                  >
                    {proveedores.map((prov) => (
                      <option key={prov.id} value={prov.id} className="bg-white text-[#36452F]">
                        {prov.nombre} {prov.empresa ? `(${prov.empresa})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2 flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-[#EAE5D9]">
                  <button
                    type="submit"
                    className={`w-full sm:flex-1 py-3 px-6 rounded-xl text-white font-bold transition-colors shadow text-sm ${
                      editingId 
                        ? 'bg-[#445C37] hover:bg-[#34472A]' 
                        : 'bg-[#557345] hover:bg-[#445C37]'
                    }`}
                  >
                    <span>{editingId ? '💾 ' : '➕ '}</span>
                    {editingId ? 'Actualizar Datos del Producto' : 'Guardar Producto en el Sistema'}
                  </button>

                  {editingId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="w-full sm:w-auto px-6 py-3 bg-gray-400 hover:bg-gray-500 text-white rounded-xl font-bold transition-colors text-sm shadow"
                    >
                      Cancelar Edición
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Listado de Productos */}
            <div className="bg-white shadow-md rounded-2xl p-6 md:p-8 border border-[#EAE5D9] w-full space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#EAE5D9]">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-[#36452F] flex items-center gap-2">
                    <span>📋</span> Catálogo de Productos Registrados
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Control general de artículos e inventario activo.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
                  {/* Barra de Búsqueda */}
                  <div className="relative w-full sm:w-72">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
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

                  <div className="bg-[#EAE5D9] text-[#36452F] font-bold text-xs px-4 py-3 rounded-xl text-center whitespace-nowrap">
                    Total: {productosFiltrados.length}
                  </div>
                </div>
              </div>

              {cargando ? (
                <p className="text-center py-12 text-gray-500 font-medium text-sm">Cargando datos del sistema...</p>
              ) : productos.length === 0 ? (
                <p className="text-center py-12 text-gray-500 font-medium text-sm">No hay productos registrados todavía.</p>
              ) : productosFiltrados.length === 0 ? (
                <p className="text-center py-12 text-gray-500 font-medium text-sm">No se encontraron productos que coincidan con la búsqueda.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {productosFiltrados.map((prod) => (
                    <div key={prod.id} className="p-5 border border-[#EAE5D9] rounded-xl bg-white shadow-sm hover:border-[#557345] transition-colors flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-bold text-[#36452F] text-lg">{prod.nombre}</h3>
                          <span className="bg-[#EAE5D9] text-[#36452F] border border-[#EAE5D9] font-bold px-3 py-1 rounded-lg text-xs whitespace-nowrap">
                            ${prod.precio} MXN
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><span className="font-bold text-[#36452F]">Categoría:</span> {prod.categoria || 'Sin asignación'}</p>
                          <p><span className="font-bold text-[#36452F]">Proveedor:</span> {prod.proveedor || 'Sin asignación'}</p>
                        </div>
                      </div>

                      {/* Botones de Acción */}
                      <div className="flex gap-2 pt-3 border-t border-[#EAE5D9]">
                        <button
                          onClick={() => handleEdit(prod)}
                          className="flex-1 bg-[#557345] hover:bg-[#445C37] text-white py-2 px-3 rounded-lg text-xs font-bold transition-colors shadow-sm"
                        >
                          ✏️ Modificar
                        </button>
                        <button
                          onClick={() => handleDelete(prod.id)}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg text-xs font-bold transition-colors shadow-sm"
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
        )}

        {/* Vista: CATEGORÍAS */}
        {pestaña === 'categorias' && <Categorias />}

        {/* Vista: CLIENTES */}
        {pestaña === 'clientes' && <Clientes />}

        {/* Vista: PROVEEDORES */}
        {pestaña === 'proveedores' && <Proveedores />}

        {/* Vista: PEDIDOS */}
        {pestaña === 'pedidos' && <Pedido />}
      </main>
    </div>
  );
}

export default App;