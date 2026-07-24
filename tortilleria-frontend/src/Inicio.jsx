function Inicio({ cambiarPestaña }) {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Tarjeta de Bienvenida */}
      <div className="bg-white p-8 rounded-2xl shadow-md border border-[#EAE5D9] text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-[#7A9A69]"></div>
        <h2 className="text-3xl font-black text-[#36452F] mb-3">
          🌽 ¡Bienvenido al Sistema de Gestión!
        </h2>
        <p className="text-gray-600 max-w-xl mx-auto text-base mb-6">
          Administra de forma rápida y eficiente el inventario, catálogo de productos, clientes, proveedores y pedidos de la Tortillería "La Tradicional".
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <button
            onClick={() => cambiarPestaña('productos')}
            className="bg-[#7A9A69] hover:bg-[#688557] text-white font-bold px-6 py-3 rounded-xl shadow transition-colors"
          >
            📦 Ver Productos
          </button>
          <button
            onClick={() => cambiarPestaña('pedidos')}
            className="bg-[#557345] hover:bg-[#445C37] text-white font-bold px-6 py-3 rounded-xl shadow transition-colors"
          >
            📋 Nuevo Pedido
          </button>
        </div>
      </div>

      {/* Tarjetas de Accesos Directos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          onClick={() => cambiarPestaña('productos')}
          className="bg-white p-6 rounded-2xl shadow-md border border-[#EAE5D9] hover:border-[#7A9A69] cursor-pointer transition-all transform hover:-translate-y-1"
        >
          <div className="text-3xl mb-2">📦</div>
          <h3 className="text-xl font-bold text-[#36452F] mb-1">Productos</h3>
          <p className="text-sm text-gray-600">Gestiona los precios, categorías y disponibilidad de tus productos.</p>
        </div>

        <div 
          onClick={() => cambiarPestaña('categorias')}
          className="bg-white p-6 rounded-2xl shadow-md border border-[#EAE5D9] hover:border-[#7A9A69] cursor-pointer transition-all transform hover:-translate-y-1"
        >
          <div className="text-3xl mb-2">🏷️</div>
          <h3 className="text-xl font-bold text-[#36452F] mb-1">Categorías</h3>
          <p className="text-sm text-gray-600">Organiza tus productos por tipo (tortillas, totopos, bebidas, etc.).</p>
        </div>

        <div 
          onClick={() => cambiarPestaña('clientes')}
          className="bg-white p-6 rounded-2xl shadow-md border border-[#EAE5D9] hover:border-[#7A9A69] cursor-pointer transition-all transform hover:-translate-y-1"
        >
          <div className="text-3xl mb-2">👥</div>
          <h3 className="text-xl font-bold text-[#36452F] mb-1">Clientes</h3>
          <p className="text-sm text-gray-600">Lleva el registro de tus clientes, teléfonos y direcciones.</p>
        </div>

        <div 
          onClick={() => cambiarPestaña('proveedores')}
          className="bg-white p-6 rounded-2xl shadow-md border border-[#EAE5D9] hover:border-[#7A9A69] cursor-pointer transition-all transform hover:-translate-y-1"
        >
          <div className="text-3xl mb-2">🚚</div>
          <h3 className="text-xl font-bold text-[#36452F] mb-1">Proveedores</h3>
          <p className="text-sm text-gray-600">Controla los proveedores de insumos y materias primas.</p>
        </div>

        <div 
          onClick={() => cambiarPestaña('pedidos')}
          className="bg-white p-6 rounded-2xl shadow-md border border-[#EAE5D9] hover:border-[#7A9A69] cursor-pointer transition-all transform hover:-translate-y-1 md:col-span-2 lg:col-span-2"
        >
          <div className="text-3xl mb-2">📋</div>
          <h3 className="text-xl font-bold text-[#36452F] mb-1">Pedidos</h3>
          <p className="text-sm text-gray-600">Crea, edita y revisa los pedidos detallados de cada cliente con múltiples productos.</p>
        </div>
      </div>
    </div>
  );
}

export default Inicio;