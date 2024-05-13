const db = require('../database/db_connection');

/**
 * Creates a new client based on the provided information in the request body.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} A promise that resolves with the JSON response containing information about the created client.
 *
 * @example
 * // Assuming the endpoint is "/cliente/created"
 * // A POST request with a JSON body like: { "nombre": "John", "apellido": "Doe" }
 * app.post('/cliente/created', createClient);
 */
const createClient = async (req, res) => {
    const { nombre, apellido } = req.body;

    if (!nombre || !apellido) {
        return res.status(400).json({ error: 'Se requieren tanto el nombre como el apellido para crear un cliente.' });
    }

    try {
      const response = await db.query('INSERT INTO clientes (nombre, apellido) VALUES ($1, $2) RETURNING *', [nombre, apellido]);
      res.json({
        message: 'El usuario fue creado',
        body: {
            cliente: { 
                nombre, 
                apellido
            }
        }
      });
    } catch (error) {
      console.error('No fue posible crear al cliente debido al siguiente error:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
};

/**
 * Retrieves all clients from the database.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} A promise that resolves with the JSON response containing all clients.
 *
 * @example
 * // Assuming the endpoint is "/cliente/list"
 * app.get('/cliente/list', getClients);
 */
const getClients = async (req, res) => {
    try {
        const response = await db.query('SELECT * FROM clientes');
        res.json(response.rows);
    } catch (error) {
        console.error('No fue posible obtener la lista de clientes:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
}

/**
 * Updates a client's information based on the provided data and client ID.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} A promise that resolves with the JSON response containing information about the updated client.
 *
 * @example
 * // Assuming the endpoint is "/cliente/update/:id"
 * // A PUT request with a JSON body like: { "nombre": "John" }
 * app.put('/cliente/update/:id', updateClient);
 */
const updateClient = async (req, res) => {
    const clientId = req.params.id;
    const { nombre, apellido } = req.body;

    try {
        let updateFields = [];
        let params = [];

        if (nombre !== undefined) {
            updateFields.push(`nombre = $${params.length + 1}`);
            params.push(nombre);
        }

        if (apellido !== undefined) {
            updateFields.push(`apellido = $${params.length + 1}`);
            params.push(apellido);
        }

        if (updateFields.length === 0) {
            return res.status(500).json({ error: `No hay ningún valor para actualizar al cliente con el id ${clientId}.` });
        }

        const updateQuery = `UPDATE clientes SET ${updateFields.join(', ')} WHERE id = $${params.length + 1} RETURNING *`;
        const result = await db.query(updateQuery, [...params, clientId]);

        res.json({
            message: `El cliente con el id ${clientId} ha sido actualizado`,
            body: {
                cliente: {
                    nombre,
                    apellido,
                },
            },
        });
    } catch (error) {
        console.error('No se ha podido actualizar el cliente debido al siguiente error:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

module.exports = {
    createClient,
    getClients,
    updateClient
}