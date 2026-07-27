import { useState, useEffect } from 'react';

function Pedido() {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  
  const [clienteId, setClienteId] = useState('');
  const [detalles, setDetalles] = useState([{ producto_id: '', cantidad: 1 }]);
  
  const [mensaje, setMensaje] = useState('');
  const [editingId, setEditingId] = useState(null);

  const cargarDatos = () => {
    fetch('http://backend-production-db840.up.railway.app/api/clientes/')
      .then((res) => res.json())
      .then((data) => {
        setClientes(data);
        if (data.length > 0 && !clienteId && !editingId) setClienteId(data[0].id);
      })
      .catch((err) => console.error("Error al cargar clientes:", err));

    fetch('http://backend-production-db840.up.railway.app/api/productos/')
      .then((res) => res.json())
      .then((data) => {
        setProductos(data);
        if (data.length > 0 && detalles[0].producto_id === '') {
          setDetalles([{ producto_id: data[0].id, cantidad: 1 }]);
        }
      })
      .catch((err) => console.error("Error al cargar productos:", err));

    fetch('http://backend-production-db840.up.railway.app/api/pedidos/')
      .then((res) => res.json())
      .then((data) => setPedidos(data))
      .catch((err) => console.error("Error al cargar pedidos:", err));
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Función para limpiar y restablecer el formulario a un nuevo registro
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
      ? `http://backend-production-db840.up.railway.app/api/pedidos/${editingId}` 
      : 'http://backend-production-db840.up.railway.app/api/pedidos';
    
    const method = editingId ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pedidoData)
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Error al procesar el pedido');
        }
        return res.json();
      })
      .then(() => {
        setMensaje(editingId ? '✅ ¡Pedido actualizado exitosamente!' : '✅ ¡Pedido guardado exitosamente!');
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
    setClienteId(ped.cliente_id || ped.id_cliente);
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
      fetch(`http://backend-production-db840.up.railway.app/api/pedidos/${id}`, {
        method: 'DELETE'
      })
        .then((res) => res.json())
        .then(() => {
          setMensaje('🗑️ Pedido eliminado exitosamente');
          resetForm();
          cargarDatos();
          setTimeout(() => setMensaje(''), 4000);
        })
        .catch((err) => {
          console.error("Error al eliminar pedido:", err);
          alert("Error al eliminar el pedido");
        });
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Formulario con el formato limpio estilo Nuevo Proveedor */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-[#EAE5D9]">
        <h2 className="text-xl font-bold text-[#36452F] mb-4 border-b border-[#EAE5D9] pb-3 flex items-center gap-2">
          <span>🛒</span> {editingId ? 'Editar Pedido' : 'Nuevo Pedido'}
          {editingId && (
            <span className="ml-auto text-xs bg-[#EAE5D9] text-[#36452F] px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
              Modo Edición
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
            <label className="block text-sm font-bold text-gray-700 mb-1">Cliente</label>
            <select
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557345] focus:outline-none bg-white"
              required
            >
              {clientes.map((cli) => (
                <option key={cli.id} value={cli.id}>
                  {cli.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-bold text-gray-700">Productos del Pedido</label>
              <button
                type="button"
                onClick={agregarFilaProducto}
                className="bg-[#557345] hover:bg-[#445C37] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
              >
                ➕ Agregar otro producto
              </button>
            </div>

            {detalles.map((detalle, index) => {
              const prodSeleccionado = productos.find(p => String(p.id) === String(detalle.producto_id));
              const precioU = prodSeleccionado ? Number(prodSeleccionado.precio) : 0;
              const subtotalFila = precioU * Number(detalle.cantidad || 0);

              return (
                <div key={index} className="flex flex-col sm:flex-row gap-2 items-center bg-[#F7F5EE] p-3 rounded-xl border border-[#EAE5D9]">
                  <div className="flex-1 w-full">
                    <select
                      value={detalle.producto_id}
                      onChange={(e) => actualizarFila(index, 'producto_id', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557345] focus:outline-none bg-white text-sm"
                      required
                    >
                      {productos.map((prod) => (
                        <option key={prod.id} value={prod.id}>
                          {prod.nombre} - ${prod.precio} MXN
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="w-24">
                      <input
                        type="number"
                        min="1"
                        placeholder="Cant."
                        value={detalle.cantidad}
                        onChange={(e) => actualizarFila(index, 'cantidad', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557345] focus:outline-none text-sm"
                        required
                      />
                    </div>

                    <div className="text-sm font-black text-[#557345] min-w-[90px] text-right">
                      ${subtotalFila.toFixed(2)}
                    </div>

                    <button
                      type="button"
                      onClick={() => eliminarFilaProducto(index)}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold p-2 rounded-lg text-sm transition-colors"
                      title="Eliminar producto"
                    >
                      ❌
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center bg-[#F7F5EE] p-4 rounded-xl border border-[#EAE5D9] shadow-inner">
            <span className="font-bold text-[#36452F] text-base">💰 Total a Pagar:</span>
            <span className="text-xl font-black text-[#557345]">
              ${calcularTotalFormulario().toFixed(2)} MXN
            </span>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className={`flex-1 font-bold py-3 rounded-xl shadow transition-colors text-white ${
                editingId ? 'bg-[#445C37] hover:bg-[#34472A]' : 'bg-[#557345] hover:bg-[#445C37]'
              }`}
            >
              {editingId ? 'Actualizar Pedido' : 'Guardar Pedido'}
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
          📋 Lista de Pedidos Registrados
        </h2>
        {pedidos.length === 0 ? (
          <p className="text-gray-500">No hay pedidos registrados todavía.</p>
        ) : (
          <div className="space-y-4">
            {pedidos.map((ped) => {
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
                <div key={ped.id} className="p-5 border border-[#EAE5D9] rounded-xl bg-[#F7F5EE] shadow-sm space-y-3">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-2 border-b border-gray-200 gap-2">
                    <div className="flex items-center gap-3">
                      <span className="bg-[#557345] text-white font-black px-3.5 py-1 rounded-xl text-sm shadow-sm">
                        Pedido #{ped.id}
                      </span>
                      <span className="font-bold text-[#36452F] text-lg">
                        👤 {ped.cliente || ped.cliente_nombre || ped.nombre_cliente || 'Cliente General'}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-gray-600">
                      Total General: <span className="text-[#36452F] font-black text-base">${totalGeneral.toFixed(2)} MXN</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                      🛒 Productos Comprados:
                    </h4>
                    {productosConDetalle.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {productosConDetalle.map((p, idx) => (
                          <div key={idx} className="bg-white p-3 rounded-lg border border-[#EAE5D9] flex justify-between items-center text-sm shadow-2xs">
                            <div>
                              <span className="font-bold text-[#36452F]">
                                {p.nombre}
                              </span>
                              <span className="text-gray-500 text-xs block">
                                Cantidad: {p.cantidad} u. {p.precio > 0 ? `($${p.precio.toFixed(2)} c/u)` : ''}
                              </span>
                            </div>
                            {p.subtotal > 0 && (
                              <span className="font-black text-[#557345]">
                                ${p.subtotal.toFixed(2)} MXN
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic bg-white p-3 rounded-lg border border-[#EAE5D9]">
                        No hay productos especificados para este pedido.
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-gray-200 justify-end">
                    <button
                      onClick={() => handleEdit(ped)}
                      className="bg-[#557345] hover:bg-[#445C37] text-white px-4 py-1.5 rounded-lg text-sm font-bold transition-colors shadow-sm"
                    >
                      ✏️ Modificar
                    </button>
                    <button
                      onClick={() => handleDelete(ped.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold transition-colors shadow-sm"
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