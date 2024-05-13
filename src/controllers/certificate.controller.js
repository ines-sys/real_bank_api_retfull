const db = require('../database/db_connection');
const { formatToDOP } = require('../utils');

/**
 * Creates a new certificate based on the provided information in the request body.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} A promise that resolves with the JSON response containing information about the created certificate.
 *
 * @example
 * // Assuming the endpoint is "/certificado/request"
 * // A POST request with a JSON body like: { "cliente_id": 1, "balance": 1000, "fecha_emision": "2024-01-15", "fecha_vencimiento": "2025-01-15" }
 * app.post('/certificado/request', requestCertificate);
 */

const requestCertificate = async (req, res) => {
    const { cliente_id, balance, fecha_emision, fecha_vencimiento } = req.body;

    if (!fecha_emision || !fecha_vencimiento) {
        return res.status(400).json({ error: 'Las fechas de emisión y vencimiento son requeridas para crear un certificado.' });
    }

    if (cliente_id === undefined || balance === undefined || cliente_id === null || balance === null) {
        return res.status(400).json({ error: 'Los campos cliente_id y balance son requeridos y no pueden ser null o undefined.' });
    }

    const dateIssued = new Date(fecha_emision);
    const dateExpiration = new Date(fecha_vencimiento);

    if (dateExpiration <= dateIssued) {
        return res.status(400).json({ error: 'La fecha de vencimiento debe ser estrictamente mayor que la fecha de emisión.' });
    }

    try {
        const response = await db.query('INSERT INTO certificados (cliente_id, balance, fecha_emision, fecha_vencimiento) VALUES ($1, $2, $3, $4 ) RETURNING *', [cliente_id, balance, fecha_emision, fecha_vencimiento]);

        res.json({
            message: 'El certificado ha sido creado con éxito',
            body: {
                certificate: {
                    cliente_id,
                    balance,
                    fecha_emision,
                    fecha_vencimiento
                }
            }
        });
    } catch (error) {
        console.error('No fue posible crear el certificado:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

/**
 * Retrieves all certificates from the database.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} A promise that resolves with the JSON response containing all certificates.
 *
 * @example
 * // Assuming the endpoint is "/certificado/list"
 * app.get('/certificado/list', getCertificates);
 */
const getCertificates = async (req, res) => {
    try {
        const response = await db.query('SELECT * FROM certificados');
        res.json(response.rows);
    } catch (error) {
        console.error('Error intentar obtener la lista de certificados:', error);
        res.status(500).json({ error: 'Error interno del servidor'});
    }
}

/**
 * Retrieves and calculates monthly gains for a certificate based on its ID.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} A promise that resolves with the JSON response.
 *
 * @example
 * // Assuming the endpoint is "/certificado/ganancia/:id"
 * app.get('/certificado/ganancia/:id', getCertificateGain);
 */ 
const getCertificateGain = async (req, res) => {
    try {
        const rate = 0.05;
        const certificateId = req.params.id;

        const response = await db.query('SELECT balance, fecha_emision, fecha_vencimiento FROM certificados WHERE id = $1', [certificateId]);
        const { balance, fecha_emision, fecha_vencimiento } = response.rows[0];
        const [certificateMonthlyGainList, certificateDuration] = calcMonthlyGain(balance, fecha_emision, fecha_vencimiento, rate);
 
        res.json({
            message: `Certificado con el id ${certificateId}, una duración de ${certificateDuration} meses (haciendo un promedio de 30 días por mes), un balance inicial de ${formatToDOP(balance)} y una tasa de interés fija anual de 5%; obtendrá las siguientes ganancias durante sus meses de vigencia:`,
            body: {
                certificateMonthlyGainList
            }
        });
    } catch (error) {
        console.error('Error al calcular ganancia mensual:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

/**
 * Calculates the number of days between the issuance date and the expiration date.
 *
 * @param {Date} dateIssued - The date when an item is issued.
 * @param {Date} dateExpiration - The expiration date for which to calculate the difference.
 * @returns {number} The number of days between the issuance date and the expiration date.
 *
 * @example
 * // Assuming the item was issued on '2022-01-01' and expires on '2022-01-10'
 * const dateIssued = new Date('2022-01-01');
 * const dateExpiration = new Date('2022-01-10');
 * const daysUntilExpiration = calcDaysToExpiry(dateIssued, dateExpiration);
 * console.log(daysUntilExpiration); // Expected output: 9
 */
const calcDaysToExpiry = (dateIssued, dateExpiration) => {
    const differenceDays = dateExpiration - dateIssued;
    const differenceMilliseconds = differenceDays / (1000 * 60 * 60 * 24);
    const daysToExpiration = Math.round(differenceMilliseconds);

    return daysToExpiration;
}

/**
 * Calculates the accumulated monthly gain based on an initial balance, issuance date, expiration date, and monthly interest rate.
 *
 * @param {number} balance - The initial balance.
 * @param {Date} dateIssued - The date when an item is issued.
 * @param {Date} dateExpiration - The expiration date for which to calculate the gain.
 * @param {number} rate - The monthly interest rate (percentage).
 * @returns {[{ mes: number, ganancia_interes_mensual_acumulado: number, total_de_balance_acumulado: string }], number} An array containing the list of accumulated monthly gains and the total months until the expiration date.
 *
 * @example
 * const balance = 1000;
 * const dateIssued = new Date('2022-01-01');
 * const dateExpiration = new Date('2022-01-10');
 * const rate = 5;
 * const [monthlyGainList, totalMonthsToExpiry] = calcMonthlyGain(balance, dateIssued, dateExpiration, rate);
 * console.log(monthlyGainList, totalMonthsToExpiry);
 */
const calcMonthlyGain = (balance, dateIssued, dateExpiration, rate) => {
    const balanceNumber = parseFloat(balance);
    const rateRange = parseFloat(rate / 12);
    const totalDaysToExpiry = calcDaysToExpiry(dateIssued, dateExpiration);
    
    let accumulatedGain = 0;
    const totalMonthsToExpiry = Math.round(totalDaysToExpiry / 30);
    const monthlyGainList = [];

    for (let month = 1; month <= totalMonthsToExpiry; month++) {
        const gainPerMonth = Math.round(balanceNumber * rateRange);
        accumulatedGain += gainPerMonth;
        const newBalance = formatToDOP(Math.round(balanceNumber + accumulatedGain));

        monthlyGainList.push({
            mes: month,
            ganancia_interes_mensual_acumulado: accumulatedGain,
            total_de_balance_acumulado: newBalance
        });
    }
    
    return [monthlyGainList, totalMonthsToExpiry];
}

module.exports = {
    requestCertificate,
    getCertificates,
    getCertificateGain
}