import { useState, useEffect } from 'react';

// Manejo dinámico de la URL mediante variable de entorno con respaldo al backend en Railway
const BASE_URL = import.meta.env.VITE_API_URL || 'https://backend-production-db840.up.railway.app';
const API_BASE = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

function Pedido() {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  
  const [clienteId, setClienteId] = useState('');
  const [detalles, setDetalles] = useState([{ producto_id: '', cantidad: 1 }]);
  
  const [mensaje, setMensaje] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  const cargarDatos = () => {
    // 1. Cargar Clientes
    fetch(`${API_BASE}/clientes`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setClientes(list);
        if (list.length > 0 && !clienteId && !editingId) setClienteId(list[0].id);
      })
      .catch((err) => console.error("Error al cargar clientes:", err));

    // 2. Cargar Productos
    fetch(`${API_BASE}/productos`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setProductos(list);
        if (list.length > 0 && detalles[0].producto_id === '') {
          setDetalles([{ producto_id: list[0].id, cantidad: 1 }]);
        }
      })
      .catch((err) => console.error("Error al cargar productos:", err));

    // 3. Cargar Pedidos
    fetch(`${API_BASE}/pedidos`)
      .then((res) => res.json())
      .then((data) => setPedidos(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error al cargar pedidos:", err));
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    if (clientes.length > 0) {
      setClienteId(clientes[0].id);
    }
    if (productos.length > 0) {
      setDetalles([{ producto_id: productos[0].id, cantidad: 1 }]);
    } else {
      setDetalles([{ producto_id: '', cantidad: 1 }]);
    }
  };

  const agregarFilaProducto = () => {
    setDetalles([...detalles, { producto_id: productos[0]?.id || '', cantidad: 1 }]);
  };

  const eliminarFilaProducto = (index) => {
    if (detalles.length === 1) {
      alert('El pedido debe tener al menos un producto.');
      return;
    }
    const nuevosDetalles = detalles.filter((_, i) => i !== index);
    setDetalles(nuevosDetalles);
  };

  const actualizarFila = (index, campo, valor) => {
    const nuevosDetalles = [...detalles];
    nuevosDetalles[index][campo] = valor;
    setDetalles(nuevosDetalles);
  };

  const calcularTotalFormulario = () => {
    return detalles.reduce((acc, curr) => {
      const prod = productos.find(p => String(p.id) === String(curr.producto_id));
      const precio = prod ? Number(prod.precio) : 0;
      const cantidad = Number(curr.cantidad || 0);
      return acc + (precio * cantidad);
    }, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!clienteId || detalles.length === 0) {
      alert('Por favor selecciona un cliente y al menos un producto.');
      return;
    }

    for (let item of detalles) {
      if (!item.cantidad || item.cantidad <= 0) {
        alert('Por favor ingresa una cantidad válida mayor a 0 para todos los productos.');
        return;
      }
    }

    const pedidoData = {
      cliente_id: parseInt(clienteId),
      productos: detalles.map(d => ({
        producto_id: parseInt(d.producto_id),
        cantidad: parseInt(d.cantidad)
      }))
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
          throw new Error(data.error || data.message || 'Error al procesar el pedido');
        }
        return data;
      })
      .then((data) => {
        setMensaje(data.message || (editingId ? '✅ ¡Pedido actualizado exitosamente!' : '✅ ¡Pedido guardado exitosamente!'));
        resetForm();
        cargarDatos();
        setTimeout(() => setMensaje(''), 4000);
      })
      .catch((err) => {
        console.error("Error:", err);
        alert(`❌ Error al guardar el pedido: ${err.message}`);
      });
  };

  const handleEdit = (ped) => {
    setEditingId(ped.id);
    setClienteId(ped.cliente_id || ped.id_cliente || '');
    const listaProds = ped.productos || ped.detalles || ped.items || ped.detalle || [];
    if (listaProds.length > 0) {
      setDetalles(listaProds.map(p => ({ 
        producto_id: p.producto_id || p.id_producto || p.id, 
        cantidad: p.cantidad 
      })));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este pedido?')) {
      fetch(`${API_BASE}/pedidos/${id}`, {
        method: 'DELETE'
      })
        .then(async (res) => {
          if (!res.ok) throw new Error('No se pudo eliminar el registro');
          return res.json();
        })
        .then((data) => {
          setMensaje(data.message || '🗑️ Pedido eliminado exitosamente');
          resetForm();
          cargarDatos();
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
    const clienteNom = (ped.cliente || ped.cliente_nombre || ped.nombre_cliente || '').toLowerCase();
    const idStr = String(ped.id || '');
    return clienteNom.includes(texto) || idStr.includes(texto);
  });

  return (
    <div className="space-y-8 w-full text-[#36452F] max-w-4xl mx-auto">
      {/* Formulario Estilo Clásico */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-md border border-[#EAE5D9] w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-4 border-b border-[#EAE5D9] gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#36452F] flex items-center gap-3">
              <span>🛒</span> 
              {editingId ? 'Actualizar Información del Pedido' : 'Módulo de Registro de Pedidos'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {editingId ? `Modificando pedido ID: #${editingId}` : 'Seleccione el cliente y desglose los productos solicitados.'}
            </p>
          </div>
          {editingId && (
            <span className="bg-[#EAE5D9] text-[#36452F] font-bold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider">
              Modo Edición Activado
            </span>
          )}
        </div>

        {mensaje && (
          <div className="mb-6 p-4 bg-green-100 text-green-800 font-bold rounded-lg border border-green-200 text-sm flex items-center gap-2">
            <span>ℹ️</span> {mensaje}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Cliente
            </label>
            <select
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557345] focus:outline-none bg-white text-[#36452F]"
              required
            >
              <option value="" className="text-gray-400">Seleccione un cliente</option>
              {clientes.map((cli) => (
                <option key={cli.id} value={cli.id} className="text-[#36452F]">
                  {cli.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center pb-2 border-b border-[#EAE5D9]">
              <label className="block text-sm font-bold text-gray-700">
                Detalle de Productos del Pedido
              </label>
              <button
                type="button"
                onClick={agregarFilaProducto}
                className="bg-[#EAE5D9] hover:bg-[#dcd4c3] text-[#36452F] font-bold text-xs px-3.5 py-2 rounded-xl transition-colors shadow-sm"
              >
                ➕ Agregar otro producto
              </button>
            </div>

            <div className="space-y-3">
              {detalles.map((detalle, index) => {
                const prodSeleccionado = productos.find(p => String(p.id) === String(detalle.producto_id));
                const precioU = prodSeleccionado ? Number(prodSeleccionado.precio) : 0;
                const subtotalFila = precioU * Number(detalle.cantidad || 0);

                return (
                  <div key={index} className="flex flex-col sm:flex-row gap-3 items-center bg-[#FDFCF7] p-4 rounded-xl border border-[#EAE5D9]">
                    <div className="flex-1 w-full">
                      <select
                        value={detalle.producto_id}
                        onChange={(e) => actualizarFila(index, 'producto_id', e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557345] focus:outline-none bg-white text-[#36452F] text-sm"
                        required
                      >
                        <option value="" className="text-gray-400">Seleccione un producto</option>
                        {productos.map((prod) => (
                          <option key={prod.id} value={prod.id} className="text-[#36452F]">
                            {prod.nombre} - ${prod.precio} MXN
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="w-28">
                        <input
                          type="number"
                          min="1"
                          placeholder="Cant."
                          value={detalle.cantidad}
                          onChange={(e) => actualizarFila(index, 'cantidad', e.target.value)}
                          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557345] focus:outline-none bg-white text-[#36452F] text-sm text-center"
                          required
                        />
                      </div>

                      <div className="text-sm font-bold text-[#557345] min-w-[100px] text-right font-mono">
                        ${subtotalFila.toFixed(2)}
                      </div>

                      <button
                        type="button"
                        onClick={() => eliminarFilaProducto(index)}
                        className="bg-red-100 hover:bg-red-200 text-red-600 font-bold p-2.5 rounded-lg text-sm transition-colors"
                        title="Eliminar producto"
                      >
                        ❌
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-center bg-[#FDFCF7] p-4 rounded-xl border border-[#EAE5D9] shadow-inner">
            <span className="font-bold text-gray-700 text-sm">💰 Total a Pagar:</span>
            <span className="text-xl font-bold text-[#557345] font-mono">
              ${calcularTotalFormulario().toFixed(2)} MXN
            </span>
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
              {editingId ? 'Actualizar Datos del Pedido' : 'Guardar Pedido en el Sistema'}
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

      {/* Lista de Pedidos Registrados */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-md border border-[#EAE5D9] w-full space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#EAE5D9]">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#36452F] flex items-center gap-2">
              <span>📋</span> Lista de Pedidos Registrados
            </h2>
            <p className="text-sm text-gray-500 mt-1">Historial y control general de transacciones de clientes.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
            {/* Barra de Búsqueda */}
            <div className="relative w-full sm:w-72">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                🔍
              </span>
              <input
                type="text"
                placeholder="Buscar por cliente o ID..."
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
          <div className="space-y-4">
            {pedidosFiltrados.map((ped) => {
              const listaProds = ped.productos || ped.detalles || ped.items || ped.detalle || [];

              const productosConDetalle = listaProds.map((p) => {
                const prodId = p.producto_id || p.id_producto || p.id;
                const matchProd = productos.find((prod) => String(prod.id) === String(prodId));
                
                const nombre = p.nombre || p.producto_nombre || p.nombre_producto || matchProd?.nombre || 'Producto';
                const precio = Number(p.precio || p.precio_unitario || matchProd?.precio || 0);
                const cantidad = Number(p.cantidad || 1);
                const subtotal = precio * cantidad;

                return { nombre, precio, cantidad, subtotal };
              });

              const totalCalculado = productosConDetalle.reduce((acc, curr) => acc + curr.subtotal, 0);
              const totalGeneral = totalCalculado > 0 ? totalCalculado : Number(ped.total || ped.total_pedido || 0);

              return (
                <div key={ped.id} className="p-5 border border-[#EAE5D9] rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow space-y-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-3 border-b border-[#EAE5D9] gap-2">
                    <div className="flex items-center gap-3">
                      <span className="bg-[#EAE5D9] text-[#36452F] font-mono text-xs px-3.5 py-1 rounded-full font-bold">
                        Pedido #{ped.id}
                      </span>
                      <span className="font-bold text-[#36452F] text-base">
                        👤 {ped.cliente || ped.cliente_nombre || ped.nombre_cliente || 'Cliente General'}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-gray-600">
                      Total General: <span className="text-[#557345] font-bold text-base font-mono">${totalGeneral.toFixed(2)} MXN</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2.5">
                      🛒 Productos Comprados:
                    </h4>
                    {productosConDetalle.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {productosConDetalle.map((p, idx) => (
                          <div key={idx} className="bg-[#FDFCF7] p-3 rounded-xl border border-[#EAE5D9] flex justify-between items-center text-sm">
                            <div>
                              <span className="font-bold text-[#36452F] block">
                                {p.nombre}
                              </span>
                              <span className="text-gray-500 text-xs block mt-0.5">
                                Cantidad: {p.cantidad} u. {p.precio > 0 ? `($${p.precio.toFixed(2)} c/u)` : ''}
                              </span>
                            </div>
                            {p.subtotal > 0 && (
                              <span className="font-bold text-[#557345] font-mono text-sm">
                                ${p.subtotal.toFixed(2)} MXN
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic bg-[#FDFCF7] p-3 rounded-xl border border-[#EAE5D9]">
                        No hay productos especificados para este pedido.
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-gray-100 justify-end">
                    <button
                      onClick={() => handleEdit(ped)}
                      className="bg-[#557345] hover:bg-[#445C37] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm"
                    >
                      ✏️ Modificar
                    </button>
                    <button
                      onClick={() => handleDelete(ped.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Pedido;