const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();

// Middlewares para procesar datos
app.use(cors());
app.use(express.json());

// 1. OBTENCIÓN Y VALIDACIÓN DE PUERTOS
const dbPort = Number(process.env.DB_PORT || process.env.MYSQLPORT || 38717);

// Evitamos que Express intente escuchar en el mismo puerto que la base de datos
let serverPort = process.env.PORT || 5000;
if (Number(serverPort) === dbPort) {
    serverPort = 5000;
}

// 2. POOL DE CONEXIONES A MYSQL (Con soporte SSL para Railway)
const db = mysql.createPool({
    host: process.env.DB_HOST || process.env.MYSQLHOST,
    user: process.env.DB_USER || process.env.MYSQLUSER,
    password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD,
    database: process.env.DB_NAME || process.env.MYSQLDATABASE,
    port: dbPort,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: false
    }
});

// Verificar la conexión a la base de datos al iniciar
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Error conectando a la base de datos MySQL:');
        console.error(`   Detalle: ${err.message}`);
        console.error(`   Host: ${process.env.DB_HOST || process.env.MYSQLHOST}:${dbPort}`);
        return;
    }
    console.log('✅ Conectado exitosamente a la base de datos MySQL en Railway');
    connection.release();
});

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API de la Tortillería funcionando al 100%');
});

// --- RUTAS GET (CONSULTAS) ---

app.get('/api/productos', (req, res) => {
    const sql = `
        SELECT p.id, p.nombre, p.precio, c.nombre AS categoria, pr.nombre AS proveedor, p.categoria_id, p.proveedor_id 
        FROM producto p
        LEFT JOIN categoria c ON p.categoria_id = c.id
        LEFT JOIN proveedor pr ON p.proveedor_id = pr.id
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error('❌ Error en GET /api/productos:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

app.get('/api/categorias', (req, res) => {
    db.query('SELECT * FROM categoria', (err, results) => {
        if (err) {
            console.error('❌ Error en GET /api/categorias:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

app.get('/api/clientes', (req, res) => {
    db.query('SELECT * FROM clientes', (err, results) => {
        if (err) {
            console.error('❌ Error en GET /api/clientes:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

app.get('/api/proveedores', (req, res) => {
    db.query('SELECT * FROM proveedor', (err, results) => {
        if (err) {
            console.error('❌ Error en GET /api/proveedores:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

app.get('/api/pedidos', (req, res) => {
    const sqlPedidos = `
        SELECT pe.id, pe.cliente_id, c.nombre AS cliente, pe.total, pe.fecha_pedido, pe.estado 
        FROM pedido pe
        JOIN clientes c ON pe.cliente_id = c.id
    `;
    const sqlDetalles = 'SELECT * FROM detalle_pedido';

    db.query(sqlPedidos, (err, pedidos) => {
        if (err) {
            console.error('❌ Error en GET /api/pedidos (pedidos):', err.message);
            return res.status(500).json({ error: err.message });
        }

        db.query(sqlDetalles, (err, detalles) => {
            if (err) {
                console.error('❌ Error en GET /api/pedidos (detalles):', err.message);
                return res.status(500).json({ error: err.message });
            }

            const pedidosConDetalles = pedidos.map(ped => ({
                ...ped,
                detalles: detalles.filter(d => d.pedido_id === ped.id).map(d => ({
                    producto_id: d.producto_id,
                    cantidad: d.cantidad
                }))
            }));

            res.json(pedidosConDetalles);
        });
    });
});

// --- RUTAS POST (REGISTROS) ---

app.post('/api/productos', (req, res) => {
    const { nombre, precio, categoria_id, proveedor_id } = req.body;
    const sql = 'INSERT INTO producto (nombre, precio, categoria_id, proveedor_id) VALUES (?, ?, ?, ?)';

    db.query(sql, [nombre, precio, categoria_id, proveedor_id], (err, result) => {
        if (err) {
            console.error('❌ Error en POST /api/productos:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Producto agregado exitosamente', id: result.insertId });
    });
});

app.post('/api/categorias', (req, res) => {
    const { nombre, descripcion } = req.body;
    const sql = 'INSERT INTO categoria (nombre, descripcion) VALUES (?, ?)';

    db.query(sql, [nombre, descripcion], (err, result) => {
        if (err) {
            console.error('❌ Error en POST /api/categorias:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Categoría guardada exitosamente', id: result.insertId });
    });
});

app.post('/api/clientes', (req, res) => {
    const { nombre, telefono, direccion, fecha_registro } = req.body;
    const fecha = fecha_registro || new Date().toISOString().split('T')[0];
    const sql = 'INSERT INTO clientes (nombre, telefono, direccion, fecha_registro) VALUES (?, ?, ?, ?)';

    db.query(sql, [nombre, telefono, direccion, fecha], (err, result) => {
        if (err) {
            console.error('❌ Error en POST /api/clientes:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Cliente registrado exitosamente', id: result.insertId });
    });
});

app.post('/api/proveedores', (req, res) => {
    const { nombre, telefono, direccion, contacto } = req.body;
    const sql = 'INSERT INTO proveedor (nombre, telefono, direccion, contacto) VALUES (?, ?, ?, ?)';

    db.query(sql, [nombre, telefono, direccion, contacto], (err, result) => {
        if (err) {
            console.error('❌ Error en POST /api/proveedores:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Proveedor registrado exitosamente', id: result.insertId });
    });
});

app.post('/api/pedidos', (req, res) => {
    const { cliente_id, productos, total, fecha_pedido, estado } = req.body;
    const fecha = fecha_pedido || new Date().toISOString().split('T')[0];
    const estadoPedido = estado || 'Pendiente';

    if (!cliente_id || !productos || !Array.isArray(productos) || productos.length === 0) {
        return res.status(400).json({ error: 'Faltan datos obligatorios o la lista de productos está vacía' });
    }

    db.getConnection((err, connection) => {
        if (err) return res.status(500).json({ error: err.message });

        connection.beginTransaction((err) => {
            if (err) {
                connection.release();
                return res.status(500).json({ error: err.message });
            }

            const sqlPedido = 'INSERT INTO pedido (cliente_id, total, fecha_pedido, estado) VALUES (?, ?, ?, ?)';
            connection.query(sqlPedido, [cliente_id, total, fecha, estadoPedido], (err, result) => {
                if (err) {
                    return connection.rollback(() => {
                        connection.release();
                        res.status(500).json({ error: err.message });
                    });
                }

                const pedidoId = result.insertId;
                const detalleValues = productos.map(item => [
                    pedidoId, 
                    item.producto_id || item.id, 
                    item.cantidad || 1
                ]);

                const sqlDetalle = 'INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad) VALUES ?';
                connection.query(sqlDetalle, [detalleValues], (err, detalleResult) => {
                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            res.status(500).json({ error: err.message });
                        });
                    }

                    connection.commit((err) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                res.status(500).json({ error: err.message });
                            });
                        }
                        connection.release();
                        res.json({ message: 'Pedido registrado exitosamente', id: pedidoId });
                    });
                });
            });
        });
    });
});

// --- RUTAS PUT Y DELETE (MODIFICAR Y ELIMINAR) ---

app.put('/api/productos/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, precio, categoria_id, proveedor_id } = req.body;
    const sql = 'UPDATE producto SET nombre = ?, precio = ?, categoria_id = ?, proveedor_id = ? WHERE id = ?';

    db.query(sql, [nombre, precio, categoria_id, proveedor_id, id], (err, result) => {
        if (err) {
            console.error('❌ Error en PUT /api/productos:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Producto actualizado exitosamente' });
    });
});

app.delete('/api/productos/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM producto WHERE id = ?';

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('❌ Error en DELETE /api/productos:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Producto eliminado exitosamente' });
    });
});

app.put('/api/categorias/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    const sql = 'UPDATE categoria SET nombre = ?, descripcion = ? WHERE id = ?';

    db.query(sql, [nombre, descripcion, id], (err, result) => {
        if (err) {
            console.error('❌ Error en PUT /api/categorias:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Categoría actualizada exitosamente' });
    });
});

app.delete('/api/categorias/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM categoria WHERE id = ?';

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('❌ Error en DELETE /api/categorias:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Categoría eliminada exitosamente' });
    });
});

app.put('/api/clientes/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, telefono, direccion, fecha_registro } = req.body;
    const sql = 'UPDATE clientes SET nombre = ?, telefono = ?, direccion = ?, fecha_registro = ? WHERE id = ?';

    db.query(sql, [nombre, telefono, direccion, fecha_registro, id], (err, result) => {
        if (err) {
            console.error('❌ Error en PUT /api/clientes:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Cliente actualizado exitosamente' });
    });
});

app.delete('/api/clientes/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM clientes WHERE id = ?';

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('❌ Error en DELETE /api/clientes:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Cliente eliminado exitosamente' });
    });
});

app.put('/api/proveedores/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, telefono, direccion, contacto } = req.body;
    const sql = 'UPDATE proveedor SET nombre = ?, telefono = ?, direccion = ?, contacto = ? WHERE id = ?';

    db.query(sql, [nombre, telefono, direccion, contacto, id], (err, result) => {
        if (err) {
            console.error('❌ Error en PUT /api/proveedores:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Proveedor actualizado exitosamente' });
    });
});

app.delete('/api/proveedores/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM proveedor WHERE id = ?';

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('❌ Error en DELETE /api/proveedores:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Proveedor eliminado exitosamente' });
    });
});

app.put('/api/pedidos/:id', (req, res) => {
    const { id } = req.params;
    const { cliente_id, productos, total, fecha_pedido, estado } = req.body;
    const fecha = fecha_pedido || new Date().toISOString().split('T')[0];

    if (!cliente_id || !productos || !Array.isArray(productos) || productos.length === 0) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    db.getConnection((err, connection) => {
        if (err) return res.status(500).json({ error: err.message });

        connection.beginTransaction((err) => {
            if (err) {
                connection.release();
                return res.status(500).json({ error: err.message });
            }

            const sqlUpdatePedido = 'UPDATE pedido SET cliente_id = ?, total = ?, fecha_pedido = ?, estado = ? WHERE id = ?';
            connection.query(sqlUpdatePedido, [cliente_id, total, fecha, estado, id], (err, result) => {
                if (err) {
                    return connection.rollback(() => {
                        connection.release();
                        res.status(500).json({ error: err.message });
                    });
                }

                const sqlDeleteDetalles = 'DELETE FROM detalle_pedido WHERE pedido_id = ?';
                connection.query(sqlDeleteDetalles, [id], (err, deleteResult) => {
                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            res.status(500).json({ error: err.message });
                        });
                    }

                    const detalleValues = productos.map(item => [
                        id, 
                        item.producto_id || item.id, 
                        item.cantidad || 1
                    ]);

                    const sqlDetalle = 'INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad) VALUES ?';
                    connection.query(sqlDetalle, [detalleValues], (err, detalleResult) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                res.status(500).json({ error: err.message });
                            });
                        }

                        connection.commit((err) => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    res.status(500).json({ error: err.message });
                                });
                            }
                            connection.release();
                            res.json({ message: 'Pedido actualizado exitosamente' });
                        });
                    });
                });
            });
        });
    });
});

app.delete('/api/pedidos/:id', (req, res) => {
    const { id } = req.params;

    db.getConnection((err, connection) => {
        if (err) return res.status(500).json({ error: err.message });

        connection.beginTransaction((err) => {
            if (err) {
                connection.release();
                return res.status(500).json({ error: err.message });
            }

            const sqlDeleteDetalles = 'DELETE FROM detalle_pedido WHERE pedido_id = ?';
            connection.query(sqlDeleteDetalles, [id], (err, result) => {
                if (err) {
                    return connection.rollback(() => {
                        connection.release();
                        res.status(500).json({ error: err.message });
                    });
                }

                const sqlDeletePedido = 'DELETE FROM pedido WHERE id = ?';
                connection.query(sqlDeletePedido, [id], (err, resultPedido) => {
                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            res.status(500).json({ error: err.message });
                        });
                    }

                    connection.commit((err) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                res.status(500).json({ error: err.message });
                            });
                        }
                        connection.release();
                        res.json({ message: 'Pedido eliminado exitosamente' });
                    });
                });
            });
        });
    });
});

// LEVANTAR EL SERVIDOR EXPRESS
app.listen(serverPort, () => {
    console.log(`🚀 Servidor Express corriendo en el puerto ${serverPort}`);
});