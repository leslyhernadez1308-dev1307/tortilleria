import { useState, useEffect } from 'react';

// Manejo dinámico de la URL mediante variable de entorno con respaldo al backend en Railway
const BASE_URL = import.meta.env.VITE_API_URL || 'https://backend-production-db840.up.railway.app';
const API_BASE = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  
  const [idCliente, setIdCliente] = useState('');
  const [estado, setEstado] = useState('Pendiente');
  
  // Lista dinámica de productos con precio y subtotal individual
  const [itemsPedido, setItemsPedido] = useState([
    { id_producto: '', precio_unitario: 0, cantidad: 1 }
  ]);

  const [mensaje, setMensaje] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  const cargarPedidos = () => {
    fetch(`${API_BASE}/pedidos`)
      .then((res) => res.json())
      .then((data) => setPedidos(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Error al cargar pedidos:", err);
        setPedidos([]);
      });
  };

  const cargarProductos = () => {
    fetch(`${API_BASE}/productos`)
      .then((res) => res.json())
      .then((data) => setProductos(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error al cargar productos:", err));
  };

  const cargarClientes = () => {
    fetch(`${API_BASE}/clientes`)
      .then((res) => res.json())
      .then((data) => setClientes(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error al cargar clientes:", err));
  };

  useEffect(() => {
    cargarPedidos();
    cargarProductos();
    cargarClientes();
  }, []);

  const resetearFormulario = () => {
    setIdCliente('');
    setEstado('Pendiente');
    setItemsPedido([{ id_producto: '', precio_unitario: 0, cantidad: 1 }]);
    setEditingId(null);
  };

  const agregarFilaProducto = () => {
    setItemsPedido([...itemsPedido, { id_producto: '', precio_unitario: 0, cantidad: 1 }]);
  };

  const eliminarFilaProducto = (index) => {
    if (itemsPedido.length === 1) {
      alert('Debe haber al menos un producto en el pedido.');
      return;
    }
    setItemsPedido(itemsPedido.filter((_, i) => i !== index));
  };

  const actualizarFilaItem = (index, campo, valor) => {
    const nuevosItems = [...itemsPedido];

    if (campo === 'id_producto') {
      const productoSeleccionado = productos.find(p => String(p.id_producto) === String(valor));
      nuevosItems[index].id_producto = valor;
      nuevosItems[index].precio_unitario = productoSeleccionado ? Number(productoSeleccionado.precio) : 0;
    } else if (campo === 'cantidad') {
      nuevosItems[index].cantidad = valor === '' ? '' : Math.max(1, parseInt(valor) || 1);
    }

    setItemsPedido(nuevosItems);
  };

  const calcularTotalPagar = () => {
    return itemsPedido.reduce((acc, item) => {
      const subtotal = (Number(item.precio_unitario) || 0) * (Number(item.cantidad) || 0);
      return acc + subtotal;
    }, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!idCliente) {
      alert('Por favor selecciona un cliente');
      return;
    }

    if (itemsPedido.some(item => !item.id_producto)) {
      alert('Por favor selecciona un producto en todas las filas');
      return;
    }

    // Generar el detalle automáticamente a partir de los productos seleccionados
    const detalleGenerado = itemsPedido.map(item => {
      const prod = productos.find(p => String(p.id_producto) === String(item.id_producto));
      return `${item.cantidad}x ${prod ? prod.nombre : 'Producto'}`;
    }).join(', ');

    const clienteObj = clientes.find(c => String(c.id_cliente) === String(idCliente));
    const nombreCliente = clienteObj ? clienteObj.nombre : idCliente;

    const pedidoData = {
      cliente: nombreCliente,
      detalle: detalleGenerado,
      total: calcularTotalPagar(),
      estado: estado
    };

    const url = editingId 
      ? `${API_BASE}/pedidos/${editingId}` 
      : `${API_BASE}/pedidos`;
    
    const method = editingId ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pedidoData)
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || data.message || 'Error al guardar el pedido');
        }
        return data;
      })
      .then((data) => {
        setMensaje(data.message || (editingId ? '✅ ¡Pedido actualizado exitosamente!' : '✅ ¡Pedido registrado exitosamente!'));
        resetearFormulario();
        cargarPedidos();
        setTimeout(() => setMensaje(''), 4000);
      })
      .catch((err) => {
        console.error("Error:", err);
        alert(`❌ Error al procesar el pedido: ${err.message}`);
      });
  };

  const handleEdit = (ped) => {
    setEditingId(ped.id || ped.id_pedido);
    
    const clienteEncontrado = clientes.find(c => c.nombre.toLowerCase() === (ped.cliente || '').toLowerCase());
    setIdCliente(clienteEncontrado ? clienteEncontrado.id_cliente : '');
    setEstado(ped.estado || 'Pendiente');

    setItemsPedido([
      { id_producto: '', precio_unitario: Number(ped.total) || 0, cantidad: 1 }
    ]);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    resetearFormulario();
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este pedido?')) {
      fetch(`${API_BASE}/pedidos/${id}`, {
        method: 'DELETE'
      })
        .then(async (res) => {
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.error || 'No se pudo eliminar el registro');
          return data;
        })
        .then((data) => {
          setMensaje(data.message || '🗑️ Pedido eliminado exitosamente');
          cargarPedidos();
          setTimeout(() => setMensaje(''), 4000);
        })
        .catch((err) => {
          console.error("Error al eliminar pedido:", err);
          alert(`❌ Error al eliminar el pedido: ${err.message}`);
        });
    }
  };

  const pedidosFiltrados = (Array.isArray(pedidos) ? pedidos : []).filter((ped) => {
    const texto = busqueda.toLowerCase();
    const cli = (ped.cliente || '').toLowerCase();
    const det = (ped.detalle || '').toLowerCase();
    const est = (ped.estado || '').toLowerCase();
    return cli.includes(texto) || det.includes(texto) || est.includes(texto);
  });

  return (
    <div className="space-y-8 w-full text-[#36452F] max-w-4xl mx-auto pb-12">
      {/* Formulario Estilo Clásico */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-md border border-[#EAE5D9] w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-4 border-b border-[#EAE5D9] gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#36452F] flex items-center gap-3">
              <span>🛒</span> 
              {editingId ? 'Actualizar Pedido' : 'Módulo de Gestión de Pedidos'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {editingId ? `Modificando pedido ID: #${editingId}` : 'Seleccione el cliente, agregue los productos y estado actual.'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Cliente
              </label>
              <select
                value={idCliente}
                onChange={(e) => setIdCliente(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557345] focus:outline-none bg-white text-[#36452F]"
                required
              >
                <option value="">Seleccione un cliente...</option>
                {clientes.map((cli) => (
                  <option key={cli.id_cliente} value={cli.id_cliente}>
                    {cli.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Estado del Pedido
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557345] focus:outline-none bg-white text-[#36452F]"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="En Proceso">En Proceso</option>
                <option value="Completado">Completado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          {/* Sección Dinámica de Productos */}
          <div className="border-t border-[#EAE5D9] pt-6 mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <span>📦</span> Productos y Detalle del Pedido
              </label>
              {!editingId && (
                <button
                  type="button"
                  onClick={agregarFilaProducto}
                  className="bg-[#EAE5D9] hover:bg-[#dcd4c3] text-[#36452F] border border-[#d2cbba] px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <span>➕</span> Agregar otro producto
                </button>
              )}
            </div>

            <div className="space-y-3">
              {itemsPedido.map((item, index) => {
                const subtotal = (Number(item.precio_unitario) || 0) * (Number(item.cantidad) || 0);
                return (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-[#FDFCF7] p-4 rounded-xl border border-[#EAE5D9]">
                    {/* Selector de Producto */}
                    <div className="sm:col-span-5">
                      <label className="block text-xs font-bold text-gray-600 mb-1">Producto</label>
                      <select
                        required
                        value={item.id_producto}
                        onChange={(e) => actualizarFilaItem(index, 'id_producto', e.target.value)}
                        className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-[#36452F] text-sm outline-none focus:ring-2 focus:ring-[#557345]"
                      >
                        <option value="">Seleccione producto...</option>
                        {productos.map((prod) => (
                          <option key={prod.id_producto} value={prod.id_producto}>
                            {prod.nombre} (Stock: {prod.stock})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Precio Unitario */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-600 mb-1">Precio Unit.</label>
                      <div className="p-2.5 bg-white border border-gray-300 rounded-lg text-sm font-bold text-[#36452F] text-right">
                        ${Number(item.precio_unitario).toFixed(2)}
                      </div>
                    </div>

                    {/* Cantidad */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-600 mb-1">Cantidad</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={item.cantidad}
                        onChange={(e) => actualizarFilaItem(index, 'cantidad', e.target.value)}
                        className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm text-center font-bold text-[#36452F] outline-none focus:ring-2 focus:ring-[#557345]"
                      />
                    </div>

                    {/* Subtotal */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-600 mb-1">Subtotal</label>
                      <div className="p-2.5 bg-[#EAE5D9]/50 border border-[#EAE5D9] rounded-lg text-sm font-black text-[#557345] text-right">
                        ${subtotal.toFixed(2)}
                      </div>
                    </div>

                    {/* Botón Eliminar Fila */}
                    <div className="sm:col-span-1 flex justify-center items-end pt-2 sm:pt-5">
                      {itemsPedido.length > 1 && !editingId && (
                        <button
                          type="button"
                          onClick={() => eliminarFilaProducto(index)}
                          className="bg-red-100 hover:bg-red-200 text-red-700 border border-red-200 w-9 h-9 rounded-lg text-xs font-bold transition-all flex items-center justify-center shadow-sm"
                          title="Eliminar fila"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total General del Pedido */}
            <div className="bg-[#FDFCF7] border border-[#EAE5D9] text-[#36452F] p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center mt-4 shadow-sm gap-2">
              <span className="text-sm font-bold uppercase tracking-wider text-gray-600">Total General del Pedido:</span>
              <span className="text-2xl font-black text-[#557345] font-mono">
                ${calcularTotalPagar().toFixed(2)}
              </span>
            </div>
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
              {editingId ? 'Actualizar Datos del Pedido' : 'Registrar Pedido'}
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

      {/* Lista de Pedidos Registrados */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-md border border-[#EAE5D9] w-full space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#EAE5D9]">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#36452F] flex items-center gap-2">
              <span>📋</span> Lista de Pedidos Registrados
            </h2>
            <p className="text-sm text-gray-500 mt-1">Control de pedidos y estados de entrega.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
            {/* Barra de Búsqueda */}
            <div className="relative w-full sm:w-72">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                🔍
              </span>
              <input
                type="text"
                placeholder="Buscar cliente, detalle, estado..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-[#EAE5D9] rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#557345] focus:outline-none text-[#36452F] shadow-sm"
              />
            </div>

            <div className="bg-[#EAE5D9] text-[#36452F] font-bold text-xs px-4 py-3 rounded-xl text-center">
              Total: {pedidosFiltrados.length}
            </div>
          </div>
        </div>

        {pedidosFiltrados.length === 0 ? (
          <p className="text-center py-12 text-gray-500 font-medium text-sm">
            No hay pedidos registrados todavía o coincidentes con la búsqueda.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pedidosFiltrados.map((ped) => (
              <div key={ped.id || ped.id_pedido} className="p-5 border border-[#EAE5D9] rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-[#36452F] text-lg">{ped.cliente}</h3>
                    <span className="bg-[#EAE5D9] text-[#36452F] font-mono text-xs px-2.5 py-1 rounded-full font-bold">
                      ID #{ped.id || ped.id_pedido}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="font-semibold text-gray-700">📦 Detalle:</span> {ped.detalle || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="font-semibold text-gray-700">💰 Total:</span> 
                    <span className="font-mono font-bold text-[#557345]">${Number(ped.total || 0).toFixed(2)}</span>
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="font-semibold text-gray-700">📌 Estado:</span> 
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                      ped.estado === 'Completado' ? 'bg-green-100 text-green-800' :
                      ped.estado === 'En Proceso' ? 'bg-yellow-100 text-yellow-800' :
                      ped.estado === 'Cancelado' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {ped.estado || 'Pendiente'}
                    </span>
                  </p>
                </div>

                {/* Botones de Modificar y Eliminar */}
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleEdit(ped)}
                    className="flex-1 bg-[#557345] hover:bg-[#445C37] text-white py-2 rounded-lg text-xs font-bold transition-colors shadow-sm"
                  >
                    ✏️ Modificar
                  </button>
                  <button
                    onClick={() => handleDelete(ped.id || ped.id_pedido)}
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

export default Pedidos;