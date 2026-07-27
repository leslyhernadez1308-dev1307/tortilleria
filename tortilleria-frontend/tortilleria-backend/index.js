const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Conexión a la base de datos de Railway
const db = mysql.createConnection({
  host: 'sakura.proxy.rlwy.net',
  user: 'root',
  password: 'blNhYZMjQlUAUKIfiAnyrWJzZexSOwZx',
  database: 'railway',
  port: 38717
});

db.connect((err) => {
  if (err) {
    console.error('Error al conectar a MySQL en Railway:', err);
    return;
  }
  console.log('✅ Conectado exitosamente a la base de datos MySQL en la nube');
});

// 2. Rutas de la API (Endpoints)

// ------------------ PRODUCTOS ------------------

app.get('/api/productos', (req, res) => {
  const sql = `
    SELECT p.id, p.nombre, p.precio, c.nombre AS categoria, pr.nombre AS proveedor 
    FROM producto p
    LEFT JOIN categoria c ON p.categoria_id = c.id
    LEFT JOIN proveedor pr ON p.proveedor_id = pr.id
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/productos', (req, res) => {
  const { nombre, precio, categoria_id, proveedor_id } = req.body;
  const sql = 'INSERT INTO producto (nombre, precio, categoria_id, proveedor_id) VALUES (?, ?, ?, ?)';

  db.query(sql, [nombre, precio, categoria_id, proveedor_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Producto agregado exitosamente', id: result.insertId });
  });
});

// ------------------ CATEGORÍAS ------------------

app.get('/api/categorias', (req, res) => {
  db.query('SELECT * FROM categoria', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/categorias', (req, res) => {
  const { nombre, descripcion } = req.body;
  const sql = 'INSERT INTO categoria (nombre, descripcion) VALUES (?, ?)';

  db.query(sql, [nombre, descripcion], (err, result) => {
    if (err) {
      console.error('Error MySQL al guardar categoría:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Categoría guardada exitosamente', id: result.insertId });
  });
});

app.put('/api/categorias/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;
  const sql = 'UPDATE categoria SET nombre = ?, descripcion = ? WHERE id = ?';

  db.query(sql, [nombre, descripcion, id], (err, result) => {
    if (err) {
      console.error('Error MySQL al actualizar categoría:', err);
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
      console.error('Error MySQL al eliminar categoría:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Categoría eliminada exitosamente' });
  });
});

// ------------------ CLIENTES ------------------

app.get('/api/clientes', (req, res) => {
  db.query('SELECT * FROM clientes', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/clientes', (req, res) => {
  const { nombre, telefono, direccion, fecha_registro } = req.body;
  const fecha = fecha_registro || new Date().toISOString().split('T')[0];

  const sql = 'INSERT INTO clientes (nombre, telefono, direccion, fecha_registro) VALUES (?, ?, ?, ?)';

  db.query(sql, [nombre, telefono, direccion, fecha], (err, result) => {
    if (err) {
      console.error('Error MySQL al guardar cliente:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Cliente registrado exitosamente', id: result.insertId });
  });
});

app.put('/api/clientes/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, telefono, direccion, fecha_registro } = req.body;
  const sql = 'UPDATE clientes SET nombre = ?, telefono = ?, direccion = ?, fecha_registro = ? WHERE id = ?';

  db.query(sql, [nombre, telefono, direccion, fecha_registro, id], (err, result) => {
    if (err) {
      console.error('Error MySQL al actualizar cliente:', err);
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
      console.error('Error MySQL al eliminar cliente:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Cliente eliminado exitosamente' });
  });
});

// ------------------ PROVEEDORES ------------------

app.get('/api/proveedores', (req, res) => {
  db.query('SELECT * FROM proveedor', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/proveedores', (req, res) => {
  const { nombre, telefono, direccion, contacto } = req.body;
  const sql = 'INSERT INTO proveedor (nombre, telefono, direccion, contacto) VALUES (?, ?, ?, ?)';

  db.query(sql, [nombre, telefono, direccion, contacto], (err, result) => {
    if (err) {
      console.error('Error MySQL al guardar proveedor:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Proveedor registrado exitosamente', id: result.insertId });
  });
});

app.put('/api/proveedores/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, telefono, direccion, contacto } = req.body;
  const sql = 'UPDATE proveedor SET nombre = ?, telefono = ?, direccion = ?, contacto = ? WHERE id = ?';

  db.query(sql, [nombre, telefono, direccion, contacto, id], (err, result) => {
    if (err) {
      console.error('Error MySQL al actualizar proveedor:', err);
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
      console.error('Error MySQL al eliminar proveedor:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Proveedor eliminado exitosamente' });
  });
});

// ------------------ PEDIDOS (CON TABLA DETALLE) ------------------

app.get('/api/pedidos', (req, res) => {
  const sqlPedidos = `
    SELECT pe.id, pe.cliente_id, c.nombre AS cliente, pe.total, pe.fecha_pedido, pe.estado 
    FROM pedido pe
    JOIN clientes c ON pe.cliente_id = c.id
  `;
  const sqlDetalles = 'SELECT * FROM detalle_pedido';

  db.query(sqlPedidos, (err, pedidos) => {
    if (err) return res.status(500).json({ error: err.message });

    db.query(sqlDetalles, (err, detalles) => {
      if (err) return res.status(500).json({ error: err.message });

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

app.post('/api/pedidos', (req, res) => {
  const { cliente_id, productos, total, fecha_pedido, estado } = req.body;
  const fecha = fecha_pedido || new Date().toISOString().split('T')[0];
  const estadoPedido = estado || 'Pendiente';

  if (!cliente_id || !productos || !Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ error: 'Faltan datos obligatorios o la lista de productos está vacía' });
  }

  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ error: err.message });

    const sqlPedido = 'INSERT INTO pedido (cliente_id, total, fecha_pedido, estado) VALUES (?, ?, ?, ?)';
    db.query(sqlPedido, [cliente_id, total, fecha, estadoPedido], (err, result) => {
      if (err) {
        return db.rollback(() => res.status(500).json({ error: err.message }));
      }

      const pedidoId = result.insertId;

      const detalleValues = productos.map(item => [
        pedidoId, 
        item.producto_id || item.id, 
        item.cantidad || 1
      ]);

      const sqlDetalle = 'INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad) VALUES ?';
      db.query(sqlDetalle, [detalleValues], (err, detalleResult) => {
        if (err) {
          console.error('❌ Error al insertar en detalle_pedido:', err);
          return db.rollback(() => res.status(500).json({ error: err.message }));
        }

        db.commit((err) => {
          if (err) {
            return db.rollback(() => res.status(500).json({ error: err.message }));
          }
          res.json({ message: 'Pedido registrado exitosamente', id: pedidoId });
        });
      });
    });
  });
});

app.put('/api/pedidos/:id', (req, res) => {
  const { id } = req.params;
  const { cliente_id, productos, total, fecha_pedido, estado } = req.body;
  const fecha = fecha_pedido || new Date().toISOString().split('T')[0];

  if (!cliente_id || !productos || !Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ error: err.message });

    const sqlUpdatePedido = 'UPDATE pedido SET cliente_id = ?, total = ?, fecha_pedido = ?, estado = ? WHERE id = ?';
    db.query(sqlUpdatePedido, [cliente_id, total, fecha, estado, id], (err, result) => {
      if (err) {
        return db.rollback(() => res.status(500).json({ error: err.message }));
      }

      const sqlDeleteDetalles = 'DELETE FROM detalle_pedido WHERE pedido_id = ?';
      db.query(sqlDeleteDetalles, [id], (err, deleteResult) => {
        if (err) {
          return db.rollback(() => res.status(500).json({ error: err.message }));
        }

        const detalleValues = productos.map(item => [
          id, 
          item.producto_id || item.id, 
          item.cantidad || 1
        ]);

        const sqlDetalle = 'INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad) VALUES ?';
        db.query(sqlDetalle, [detalleValues], (err, detalleResult) => {
          if (err) {
            return db.rollback(() => res.status(500).json({ error: err.message }));
          }

          db.commit((err) => {
            if (err) {
              return db.rollback(() => res.status(500).json({ error: err.message }));
            }
            res.json({ message: 'Pedido actualizado exitosamente' });
          });
        });
      });
    });
  });
});

app.delete('/api/pedidos/:id', (req, res) => {
  const { id } = req.params;

  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ error: err.message });

    const sqlDeleteDetalles = 'DELETE FROM detalle_pedido WHERE pedido_id = ?';
    db.query(sqlDeleteDetalles, [id], (err, result) => {
      if (err) {
        return db.rollback(() => res.status(500).json({ error: err.message }));
      }

      const sqlDeletePedido = 'DELETE FROM pedido WHERE id = ?';
      db.query(sqlDeletePedido, [id], (err, resultPedido) => {
        if (err) {
          return db.rollback(() => res.status(500).json({ error: err.message }));
        }

        db.commit((err) => {
          if (err) {
            return db.rollback(() => res.status(500).json({ error: err.message }));
          }
          res.json({ message: 'Pedido eliminado exitosamente' });
        });
      });
    });
  });
});

// 3. Iniciar el servidor con el puerto dinámico de Railway
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
});