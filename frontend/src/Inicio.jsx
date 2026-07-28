function Inicio({ cambiarPestaña }) {
  return (
    <div className="space-y-8 max-w-4xl mx-auto text-[#36452F]">
      {/* Tarjeta de Bienvenida Estilizada */}
      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-md border border-[#EAE5D9] text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-[#557345] via-[#7A9A69] to-[#557345]"></div>
        
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FDFCF7] border border-[#EAE5D9] rounded-2xl text-3xl mb-4 shadow-sm">
          🌽
        </div>

        <h2 className="text-3xl md:text-4xl font-black text-[#36452F] mb-3 tracking-tight">
          ¡Bienvenido al Sistema de Gestión!
        </h2>
        
        <p className="text-gray-600 max-w-xl mx-auto text-base leading-relaxed mb-8">
          Administra de forma rápida y eficiente el inventario, catálogo de productos, clientes, proveedores y pedidos de la Tortillería <span className="font-bold text-[#557345]">"La Tradicional"</span>.
        </p>

        <div className="flex justify-center gap-4 flex-wrap">
          <button
            onClick={() => cambiarPestaña('productos')}
            className="bg-[#7A9A69] hover:bg-[#688557] text-white font-bold px-6 py-3 rounded-xl shadow transition-all duration-200 flex items-center gap-2 text-sm"
          >
            <span>📦</span> Ver Productos
          </button>
          <button
            onClick={() => cambiarPestaña('pedidos')}
            className="bg-[#557345] hover:bg-[#445C37] text-white font-bold px-6 py-3 rounded-xl shadow transition-all duration-200 flex items-center gap-2 text-sm"
          >
            <span>📋</span> Nuevo Pedido
          </button>
        </div>
      </div>

      {/* Tarjetas de Accesos Directos */}
      <div>
        <div className="mb-4 px-1">
          <h3 className="text-lg font-bold text-[#36452F] flex items-center gap-2">
            <span>⚡</span> Accesos Rápidos del Sistema
          </h3>
          <p className="text-xs text-gray-500">Selecciona una sección para comenzar a trabajar.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            onClick={() => cambiarPestaña('productos')}
            className="bg-white p-6 rounded-2xl shadow-md border border-[#EAE5D9] hover:border-[#7A9A69] hover:shadow-lg cursor-pointer transition-all transform hover:-translate-y-1 group"
          >
            <div className="w-12 h-12 bg-[#FDFCF7] border border-[#EAE5D9] rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              📦
            </div>
            <h4 className="text-lg font-bold text-[#36452F] mb-1 group-hover:text-[#557345] transition-colors">Productos</h4>
            <p className="text-xs text-gray-600 leading-relaxed">Gestiona los precios, categorías y disponibilidad de tus productos.</p>
          </div>

          <div 
            onClick={() => cambiarPestaña('categorias')}
            className="bg-white p-6 rounded-2xl shadow-md border border-[#EAE5D9] hover:border-[#7A9A69] hover:shadow-lg cursor-pointer transition-all transform hover:-translate-y-1 group"
          >
            <div className="w-12 h-12 bg-[#FDFCF7] border border-[#EAE5D9] rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              🏷️
            </div>
            <h4 className="text-lg font-bold text-[#36452F] mb-1 group-hover:text-[#557345] transition-colors">Categorías</h4>
            <p className="text-xs text-gray-600 leading-relaxed">Organiza tus productos por tipo (tortillas, totopos, bebidas, etc.).</p>
          </div>

          <div 
            onClick={() => cambiarPestaña('clientes')}
            className="bg-white p-6 rounded-2xl shadow-md border border-[#EAE5D9] hover:border-[#7A9A69] hover:shadow-lg cursor-pointer transition-all transform hover:-translate-y-1 group"
          >
            <div className="w-12 h-12 bg-[#FDFCF7] border border-[#EAE5D9] rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              👥
            </div>
            <h4 className="text-lg font-bold text-[#36452F] mb-1 group-hover:text-[#557345] transition-colors">Clientes</h4>
            <p className="text-xs text-gray-600 leading-relaxed">Lleva el registro de tus clientes, teléfonos y direcciones.</p>
          </div>

          <div 
            onClick={() => cambiarPestaña('proveedores')}
            className="bg-white p-6 rounded-2xl shadow-md border border-[#EAE5D9] hover:border-[#7A9A69] hover:shadow-lg cursor-pointer transition-all transform hover:-translate-y-1 group"
          >
            <div className="w-12 h-12 bg-[#FDFCF7] border border-[#EAE5D9] rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              🚚
            </div>
            <h4 className="text-lg font-bold text-[#36452F] mb-1 group-hover:text-[#557345] transition-colors">Proveedores</h4>
            <p className="text-xs text-gray-600 leading-relaxed">Controla los proveedores de insumos y materias primas.</p>
          </div>

          <div 
            onClick={() => cambiarPestaña('pedidos')}
            className="bg-white p-6 rounded-2xl shadow-md border border-[#EAE5D9] hover:border-[#7A9A69] hover:shadow-lg cursor-pointer transition-all transform hover:-translate-y-1 md:col-span-2 lg:col-span-2 group"
          >
            <div className="w-12 h-12 bg-[#FDFCF7] border border-[#EAE5D9] rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              📋
            </div>
            <h4 className="text-lg font-bold text-[#36452F] mb-1 group-hover:text-[#557345] transition-colors">Pedidos</h4>
            <p className="text-xs text-gray-600 leading-relaxed">Crea, edita y revisa los pedidos detallados de cada cliente con múltiples productos.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Inicio;