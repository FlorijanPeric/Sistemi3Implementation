<<<<<<< HEAD
const express = require('express');
const pool = require('../config/db');
const { authRequired } = require('../middleware/auth');
const { randomUUID } = require('crypto');

const router = express.Router();

router.get('/', authRequired, async (req, res, next) => {
	try {
		const queryParts = [
			`SELECT
				o.narocilo_id,
				o.cvetlicarna_id,
				o.datum_narocila,
				o.datum_dostave,
				o.status,
				COALESCE(SUM(p.skupna_vrednost_postavke), 0) AS total_value,
				c.naziv AS florist_name
			 FROM narocilo o
			 JOIN cvetlicarna c ON c.cvetlicarna_id = o.cvetlicarna_id
			 LEFT JOIN postavka_narocila p ON p.narocilo_id = o.narocilo_id`,
		];
		const whereParts = [];
		const params = [];

		if (req.user.role === 'florist' && req.user.floristId) {
			whereParts.push('o.cvetlicarna_id = ?');
			params.push(req.user.floristId);
		} else if (req.user.role === 'supplier' && req.user.supplierId) {
			queryParts.push('JOIN roza r ON r.roza_id = p.roza_id');
			whereParts.push('r.dobavitelj_id = ?');
			params.push(req.user.supplierId);
		}

		const sql = `${queryParts.join('\n')} ${whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : ''} GROUP BY o.narocilo_id, o.cvetlicarna_id, o.datum_narocila, o.datum_dostave, o.status, c.naziv ORDER BY o.datum_narocila DESC`;

		const [rows] = await pool.query(sql, params);
		res.json({
			ok: true,
			orders: rows.map((row) => ({
				order_id: row.narocilo_id,
				florist_id: row.cvetlicarna_id,
				ordered_at: row.datum_narocila,
				delivery_date: row.datum_dostave,
				status: row.status,
				total_value: row.total_value,
				florist_name: row.florist_name,
			})),
		});
	} catch (error) {
		next(error);
	}
});

router.get('/:id', authRequired, async (req, res, next) => {
	try {
		const orderId = req.params.id;
		const [orders] = await pool.query(
			`SELECT o.narocilo_id, o.cvetlicarna_id, o.datum_narocila, o.datum_dostave, o.status
			 FROM narocilo o
			 WHERE o.narocilo_id = ?`,
			[orderId]
		);

		if (orders.length === 0) {
			return res.status(404).json({ ok: false, message: 'not_found' });
		}

		if (req.user.role === 'florist' && req.user.floristId !== orders[0].cvetlicarna_id) {
			return res.status(403).json({ ok: false, message: 'forbidden' });
		}

		const [items] = await pool.query(
			`SELECT p.postavka_id, p.narocilo_id, p.roza_id, p.kolicina, p.cena_na_rozo, p.skupna_vrednost_postavke, r.ime AS flower_name
			 FROM postavka_narocila p
			 JOIN roza r ON r.roza_id = p.roza_id
			 WHERE p.narocilo_id = ?`,
			[orderId]
		);

		res.json({
			ok: true,
			order: {
				order_id: orders[0].narocilo_id,
				florist_id: orders[0].cvetlicarna_id,
				ordered_at: orders[0].datum_narocila,
				delivery_date: orders[0].datum_dostave,
				status: orders[0].status,
				items: items.map((item) => ({
					item_id: item.postavka_id,
					order_id: item.narocilo_id,
					flower_id: item.roza_id,
					quantity: item.kolicina,
					unit_price: item.cena_na_rozo,
					item_total: item.skupna_vrednost_postavke,
					flower_name: item.flower_name,
				})),
			},
		});
	} catch (error) {
		next(error);
	}
});

router.post('/', authRequired, async (req, res, next) => {
	try {
		if (req.user.role !== 'florist' && req.user.role !== 'admin') {
			return res.status(403).json({ ok: false, message: 'forbidden' });
		}

		const floristId = req.user.floristId;
		const items = Array.isArray(req.body.items) ? req.body.items : [];

		if (!floristId || items.length === 0) {
			return res.status(400).json({ ok: false, message: 'missing_items' });
		}

		const flowerIds = items.map((item) => item.flower_id);
		const [flowers] = await pool.query(
			`SELECT roza_id, cena_na_enoto, dobavitelj_id FROM roza WHERE roza_id IN (${flowerIds.map(() => '?').join(',')})`,
			flowerIds
		);

		if (flowers.length !== items.length) {
			return res.status(400).json({ ok: false, message: 'invalid_flower' });
		}

		const flowerMap = new Map(flowers.map((flower) => [flower.roza_id, flower]));
		const orderId = randomUUID();
		const totalValue = items.reduce((sum, item) => {
			const flower = flowerMap.get(item.flower_id);
			const quantity = Number(item.quantity) || 0;
			return sum + quantity * Number(flower.cena_na_enoto);
		}, 0);

		await pool.query(
			'INSERT INTO narocilo (narocilo_id, datum_narocila, cvetlicarna_id, datum_dostave, status) VALUES (?, CURDATE(), ?, ?, ?)',
			[orderId, floristId, null, 'v obdelavi']
		);

		await pool.query(
			'INSERT INTO zgodovina_narocil (zgodovina_id, narocilo_id, status, datum_spremembe) VALUES (?, ?, ?, CURDATE())',
			[randomUUID(), orderId, 'v obdelavi']
		);

		for (const item of items) {
			const flower = flowerMap.get(item.flower_id);
			const quantity = Number(item.quantity) || 0;
			const itemTotal = quantity * Number(flower.cena_na_enoto);

			await pool.query(
				`INSERT INTO postavka_narocila (postavka_id, narocilo_id, roza_id, kolicina, cena_na_rozo, skupna_vrednost_postavke)
				 VALUES (?, ?, ?, ?, ?, ?)`,
				[randomUUID(), orderId, flower.roza_id, quantity, flower.cena_na_enoto, itemTotal.toFixed(2)]
			);
		}

		res.status(201).json({ ok: true, order_id: orderId, total_value: totalValue.toFixed(2) });
	} catch (error) {
		next(error);
	}
});

router.put('/:id', authRequired, async (req, res, next) => {
	try {
		const orderId = req.params.id;
		const { status } = req.body;

		if (!status) {
			return res.status(400).json({ ok: false, message: 'missing_status' });
		}

		const allowed = ['v obdelavi', 'potrjeno', 'dostavljeno', 'preklicano', 'zavrnjeno'];
		if (!allowed.includes(status)) {
			return res.status(400).json({ ok: false, message: 'invalid_status' });
		}

		const [orders] = await pool.query('SELECT cvetlicarna_id, status FROM narocilo WHERE narocilo_id = ?', [orderId]);
		if (orders.length === 0) {
			return res.status(404).json({ ok: false, message: 'not_found' });
		}

		if (req.user.role === 'florist' && req.user.floristId !== orders[0].cvetlicarna_id) {
			return res.status(403).json({ ok: false, message: 'forbidden' });
		}

		await pool.query('UPDATE narocilo SET status = ? WHERE narocilo_id = ?', [status, orderId]);
		await pool.query(
			'INSERT INTO zgodovina_narocil (zgodovina_id, narocilo_id, status, datum_spremembe) VALUES (?, ?, ?, CURDATE())',
			[randomUUID(), orderId, status]
		);
		res.json({ ok: true });
	} catch (error) {
		next(error);
	}
});

// Supplier accepts order and optionally sets delivery date
router.post('/:id/accept', authRequired, async (req, res, next) => {
	try {
		const orderId = req.params.id;
		const { delivery_date } = req.body;

		if (req.user.role !== 'supplier' && req.user.role !== 'admin') {
			return res.status(403).json({ ok: false, message: 'forbidden' });
		}

		const [orders] = await pool.query('SELECT narocilo_id FROM narocilo WHERE narocilo_id = ?', [orderId]);
		if (orders.length === 0) {
			return res.status(404).json({ ok: false, message: 'not_found' });
		}

		await pool.query(
			'UPDATE narocilo SET status = ?, datum_dostave = ? WHERE narocilo_id = ?',
			['potrjeno', delivery_date || null, orderId]
		);
		await pool.query(
			'INSERT INTO zgodovina_narocil (zgodovina_id, narocilo_id, status, datum_spremembe) VALUES (?, ?, ?, CURDATE())',
			[randomUUID(), orderId, 'potrjeno']
		);
		res.json({ ok: true });
	} catch (error) {
		next(error);
	}
});

// Supplier rejects order
router.post('/:id/reject', authRequired, async (req, res, next) => {
	try {
		const orderId = req.params.id;

		if (req.user.role !== 'supplier' && req.user.role !== 'admin') {
			return res.status(403).json({ ok: false, message: 'forbidden' });
		}

		const [orders] = await pool.query('SELECT narocilo_id FROM narocilo WHERE narocilo_id = ?', [orderId]);
		if (orders.length === 0) {
			return res.status(404).json({ ok: false, message: 'not_found' });
		}

		await pool.query('UPDATE narocilo SET status = ? WHERE narocilo_id = ?', ['zavrnjeno', orderId]);
		await pool.query(
			'INSERT INTO zgodovina_narocil (zgodovina_id, narocilo_id, status, datum_spremembe) VALUES (?, ?, ?, CURDATE())',
			[randomUUID(), orderId, 'zavrnjeno']
		);
		res.json({ ok: true });
	} catch (error) {
		next(error);
	}
});

module.exports = router;
=======
const express = require('express');
const pool = require('../config/db');
const { authRequired } = require('../middleware/auth');
const { randomUUID } = require('crypto');

const router = express.Router();

router.get('/', authRequired, async (req, res, next) => {
	try {
		const queryParts = [
			`SELECT
				o.narocilo_id,
				o.cvetlicarna_id,
				o.datum_narocila,
				o.datum_dostave,
				o.status,
				COALESCE(SUM(p.skupna_vrednost_postavke), 0) AS total_value,
				c.naziv AS florist_name
			 FROM narocilo o
			 JOIN cvetlicarna c ON c.cvetlicarna_id = o.cvetlicarna_id
			 LEFT JOIN postavka_narocila p ON p.narocilo_id = o.narocilo_id`,
		];
		const whereParts = [];
		const params = [];

		if (req.user.role === 'florist' && req.user.floristId) {
			whereParts.push('o.cvetlicarna_id = ?');
			params.push(req.user.floristId);
		} else if (req.user.role === 'supplier' && req.user.supplierId) {
			queryParts.push('JOIN roza r ON r.roza_id = p.roza_id');
			whereParts.push('r.dobavitelj_id = ?');
			params.push(req.user.supplierId);
		}

		const sql = `${queryParts.join('\n')} ${whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : ''} GROUP BY o.narocilo_id, o.cvetlicarna_id, o.datum_narocila, o.datum_dostave, o.status, c.naziv ORDER BY o.datum_narocila DESC`;

		const [rows] = await pool.query(sql, params);
		res.json({
			ok: true,
			orders: rows.map((row) => ({
				order_id: row.narocilo_id,
				florist_id: row.cvetlicarna_id,
				ordered_at: row.datum_narocila,
				delivery_date: row.datum_dostave,
				status: row.status,
				total_value: row.total_value,
				florist_name: row.florist_name,
			})),
		});
	} catch (error) {
		next(error);
	}
});

router.get('/:id', authRequired, async (req, res, next) => {
	try {
		const orderId = req.params.id;
		const [orders] = await pool.query(
			`SELECT o.narocilo_id, o.cvetlicarna_id, o.datum_narocila, o.datum_dostave, o.status
			 FROM narocilo o
			 WHERE o.narocilo_id = ?`,
			[orderId]
		);

		if (orders.length === 0) {
			return res.status(404).json({ ok: false, message: 'not_found' });
		}

		if (req.user.role === 'florist' && req.user.floristId !== orders[0].cvetlicarna_id) {
			return res.status(403).json({ ok: false, message: 'forbidden' });
		}

		const [items] = await pool.query(
			`SELECT p.postavka_id, p.narocilo_id, p.roza_id, p.kolicina, p.cena_na_rozo, p.skupna_vrednost_postavke, r.ime AS flower_name
			 FROM postavka_narocila p
			 JOIN roza r ON r.roza_id = p.roza_id
			 WHERE p.narocilo_id = ?`,
			[orderId]
		);

		res.json({
			ok: true,
			order: {
				order_id: orders[0].narocilo_id,
				florist_id: orders[0].cvetlicarna_id,
				ordered_at: orders[0].datum_narocila,
				delivery_date: orders[0].datum_dostave,
				status: orders[0].status,
				items: items.map((item) => ({
					item_id: item.postavka_id,
					order_id: item.narocilo_id,
					flower_id: item.roza_id,
					quantity: item.kolicina,
					unit_price: item.cena_na_rozo,
					item_total: item.skupna_vrednost_postavke,
					flower_name: item.flower_name,
				})),
			},
		});
	} catch (error) {
		next(error);
	}
});

router.post('/', authRequired, async (req, res, next) => {
	try {
		if (req.user.role !== 'florist' && req.user.role !== 'admin') {
			return res.status(403).json({ ok: false, message: 'forbidden' });
		}

		const floristId = req.user.floristId;
		const items = Array.isArray(req.body.items) ? req.body.items : [];

		if (!floristId || items.length === 0) {
			return res.status(400).json({ ok: false, message: 'missing_items' });
		}

		const flowerIds = items.map((item) => item.flower_id);
		const [flowers] = await pool.query(
			`SELECT roza_id, cena_na_enoto, dobavitelj_id FROM roza WHERE roza_id IN (${flowerIds.map(() => '?').join(',')})`,
			flowerIds
		);

		if (flowers.length !== items.length) {
			return res.status(400).json({ ok: false, message: 'invalid_flower' });
		}

		const flowerMap = new Map(flowers.map((flower) => [flower.roza_id, flower]));
		const orderId = randomUUID();
		const totalValue = items.reduce((sum, item) => {
			const flower = flowerMap.get(item.flower_id);
			const quantity = Number(item.quantity) || 0;
			return sum + quantity * Number(flower.cena_na_enoto);
		}, 0);

		await pool.query(
			'INSERT INTO narocilo (narocilo_id, datum_narocila, cvetlicarna_id, datum_dostave, status) VALUES (?, CURDATE(), ?, ?, ?)',
			[orderId, floristId, null, 'v obdelavi']
		);

		await pool.query(
			'INSERT INTO zgodovina_narocil (zgodovina_id, narocilo_id, status, datum_spremembe) VALUES (?, ?, ?, CURDATE())',
			[randomUUID(), orderId, 'v obdelavi']
		);

		for (const item of items) {
			const flower = flowerMap.get(item.flower_id);
			const quantity = Number(item.quantity) || 0;
			const itemTotal = quantity * Number(flower.cena_na_enoto);

			await pool.query(
				`INSERT INTO postavka_narocila (postavka_id, narocilo_id, roza_id, kolicina, cena_na_rozo, skupna_vrednost_postavke)
				 VALUES (?, ?, ?, ?, ?, ?)`,
				[randomUUID(), orderId, flower.roza_id, quantity, flower.cena_na_enoto, itemTotal.toFixed(2)]
			);
		}

		res.status(201).json({ ok: true, order_id: orderId, total_value: totalValue.toFixed(2) });
	} catch (error) {
		next(error);
	}
});

router.put('/:id', authRequired, async (req, res, next) => {
	try {
		const orderId = req.params.id;
		const { status } = req.body;

		if (!status) {
			return res.status(400).json({ ok: false, message: 'missing_status' });
		}

		const allowed = ['v obdelavi', 'potrjeno', 'dostavljeno', 'preklicano', 'zavrnjeno'];
		if (!allowed.includes(status)) {
			return res.status(400).json({ ok: false, message: 'invalid_status' });
		}

		const [orders] = await pool.query('SELECT cvetlicarna_id, status FROM narocilo WHERE narocilo_id = ?', [orderId]);
		if (orders.length === 0) {
			return res.status(404).json({ ok: false, message: 'not_found' });
		}

		if (req.user.role === 'florist' && req.user.floristId !== orders[0].cvetlicarna_id) {
			return res.status(403).json({ ok: false, message: 'forbidden' });
		}

		await pool.query('UPDATE narocilo SET status = ? WHERE narocilo_id = ?', [status, orderId]);
		await pool.query(
			'INSERT INTO zgodovina_narocil (zgodovina_id, narocilo_id, status, datum_spremembe) VALUES (?, ?, ?, CURDATE())',
			[randomUUID(), orderId, status]
		);
		res.json({ ok: true });
	} catch (error) {
		next(error);
	}
});

// Supplier accepts order and optionally sets delivery date
router.post('/:id/accept', authRequired, async (req, res, next) => {
	try {
		const orderId = req.params.id;
		const { delivery_date } = req.body;

		if (req.user.role !== 'supplier' && req.user.role !== 'admin') {
			return res.status(403).json({ ok: false, message: 'forbidden' });
		}

		const [orders] = await pool.query('SELECT narocilo_id FROM narocilo WHERE narocilo_id = ?', [orderId]);
		if (orders.length === 0) {
			return res.status(404).json({ ok: false, message: 'not_found' });
		}

		await pool.query(
			'UPDATE narocilo SET status = ?, datum_dostave = ? WHERE narocilo_id = ?',
			['potrjeno', delivery_date || null, orderId]
		);
		await pool.query(
			'INSERT INTO zgodovina_narocil (zgodovina_id, narocilo_id, status, datum_spremembe) VALUES (?, ?, ?, CURDATE())',
			[randomUUID(), orderId, 'potrjeno']
		);
		res.json({ ok: true });
	} catch (error) {
		next(error);
	}
});

// Supplier rejects order
router.post('/:id/reject', authRequired, async (req, res, next) => {
	try {
		const orderId = req.params.id;

		if (req.user.role !== 'supplier' && req.user.role !== 'admin') {
			return res.status(403).json({ ok: false, message: 'forbidden' });
		}

		const [orders] = await pool.query('SELECT narocilo_id FROM narocilo WHERE narocilo_id = ?', [orderId]);
		if (orders.length === 0) {
			return res.status(404).json({ ok: false, message: 'not_found' });
		}

		await pool.query('UPDATE narocilo SET status = ? WHERE narocilo_id = ?', ['zavrnjeno', orderId]);
		await pool.query(
			'INSERT INTO zgodovina_narocil (zgodovina_id, narocilo_id, status, datum_spremembe) VALUES (?, ?, ?, CURDATE())',
			[randomUUID(), orderId, 'zavrnjeno']
		);
		res.json({ ok: true });
	} catch (error) {
		next(error);
	}
});

module.exports = router;
>>>>>>> ddce65c36e71a70af68d00a59d0b2db5f5643ed3
