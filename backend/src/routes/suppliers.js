<<<<<<< HEAD
const express = require('express');
const pool = require('../config/db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res, next) => {
	try {
		const [rows] = await pool.query(`
			SELECT
				d.dobavitelj_id,
				d.naziv,
				d.ocena,
				u.e_posta,
				COUNT(DISTINCT r.roza_id) AS flower_count,
				ROUND(AVG(r.cena_na_enoto), 2) AS avg_price,
				ROUND(AVG(
					CASE
						WHEN n.datum_dostave IS NOT NULL AND n.datum_narocila IS NOT NULL
						THEN DATEDIFF(n.datum_dostave, n.datum_narocila)
					END
				), 1) AS avg_delivery_days
			FROM dobavitelj d
			JOIN uporabnik u ON u.uporabnik_id = d.uporabnik_id
			LEFT JOIN roza r ON r.dobavitelj_id = d.dobavitelj_id
			LEFT JOIN postavka_narocila p ON p.roza_id = r.roza_id
			LEFT JOIN narocilo n ON n.narocilo_id = p.narocilo_id
			  AND n.status IN ('potrjeno','dostavljeno')
			GROUP BY d.dobavitelj_id, d.naziv, d.ocena, u.e_posta
			ORDER BY d.ocena DESC, avg_price ASC
		`);

		res.json({
			ok: true,
			suppliers: rows.map((row) => ({
				supplier_id: row.dobavitelj_id,
				name: row.naziv,
				rating: row.ocena,
				email: row.e_posta,
				flower_count: row.flower_count,
				avg_price: row.avg_price,
				avg_delivery_days: row.avg_delivery_days,
			})),
		});
	} catch (error) {
		next(error);
	}
});

router.get('/:id', async (req, res, next) => {
	try {
		const [rows] = await pool.query(
			`SELECT d.dobavitelj_id, d.naziv, d.ocena, u.e_posta
			 FROM dobavitelj d
			 JOIN uporabnik u ON u.uporabnik_id = d.uporabnik_id
			 WHERE d.dobavitelj_id = ?`,
			[req.params.id]
		);

		if (rows.length === 0) {
			return res.status(404).json({ ok: false, message: 'not_found' });
		}

		const [flowers] = await pool.query(
			`SELECT roza_id, ime, cena_na_enoto, sezonska_dostopnost, dobavljivost
			 FROM roza
			 WHERE dobavitelj_id = ?
			 ORDER BY ime ASC`,
			[req.params.id]
		);

		const d = rows[0];
		res.json({
			ok: true,
			supplier: {
				supplier_id: d.dobavitelj_id,
				name: d.naziv,
				rating: d.ocena,
				email: d.e_posta,
				flowers: flowers.map((f) => ({
					flower_id: f.roza_id,
					name: f.ime,
					unit_price: f.cena_na_enoto,
					season: f.sezonska_dostopnost,
					availability: f.dobavljivost,
				})),
			},
		});
	} catch (error) {
		next(error);
	}
});

router.patch('/:id', authRequired, async (req, res, next) => {
	try {
		const { id } = req.params;
		const { name, rating } = req.body;

		const [rows] = await pool.query(
			'SELECT dobavitelj_id FROM dobavitelj WHERE dobavitelj_id = ?',
			[id]
		);
		if (rows.length === 0) {
			return res.status(404).json({ ok: false, message: 'not_found' });
		}

		if (req.user.role !== 'admin' && req.user.supplierId !== id) {
			return res.status(403).json({ ok: false, message: 'forbidden' });
		}

		const updates = [];
		const values = [];

		if (name) {
			updates.push('naziv = ?');
			values.push(name.trim());
		}
		if (rating !== undefined && req.user.role === 'admin') {
			const r = parseFloat(rating);
			if (isNaN(r) || r < 0 || r > 5) {
				return res.status(400).json({ ok: false, message: 'invalid_rating' });
			}
			updates.push('ocena = ?');
			values.push(r);
		}

		if (updates.length === 0) {
			return res.status(400).json({ ok: false, message: 'no_fields' });
		}

		values.push(id);
		await pool.query(
			`UPDATE dobavitelj SET ${updates.join(', ')} WHERE dobavitelj_id = ?`,
			values
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

const router = express.Router();

router.get('/', async (req, res, next) => {
	try {
		const [rows] = await pool.query(`
			SELECT
				d.dobavitelj_id,
				d.naziv,
				d.ocena,
				u.e_posta,
				COUNT(DISTINCT r.roza_id) AS flower_count,
				ROUND(AVG(r.cena_na_enoto), 2) AS avg_price,
				ROUND(AVG(
					CASE
						WHEN n.datum_dostave IS NOT NULL AND n.datum_narocila IS NOT NULL
						THEN DATEDIFF(n.datum_dostave, n.datum_narocila)
					END
				), 1) AS avg_delivery_days
			FROM dobavitelj d
			JOIN uporabnik u ON u.uporabnik_id = d.uporabnik_id
			LEFT JOIN roza r ON r.dobavitelj_id = d.dobavitelj_id
			LEFT JOIN postavka_narocila p ON p.roza_id = r.roza_id
			LEFT JOIN narocilo n ON n.narocilo_id = p.narocilo_id
			  AND n.status IN ('potrjeno','dostavljeno')
			GROUP BY d.dobavitelj_id, d.naziv, d.ocena, u.e_posta
			ORDER BY d.ocena DESC, avg_price ASC
		`);

		res.json({
			ok: true,
			suppliers: rows.map((row) => ({
				supplier_id: row.dobavitelj_id,
				name: row.naziv,
				rating: row.ocena,
				email: row.e_posta,
				flower_count: row.flower_count,
				avg_price: row.avg_price,
				avg_delivery_days: row.avg_delivery_days,
			})),
		});
	} catch (error) {
		next(error);
	}
});

router.get('/:id', async (req, res, next) => {
	try {
		const [rows] = await pool.query(
			`SELECT d.dobavitelj_id, d.naziv, d.ocena, u.e_posta
			 FROM dobavitelj d
			 JOIN uporabnik u ON u.uporabnik_id = d.uporabnik_id
			 WHERE d.dobavitelj_id = ?`,
			[req.params.id]
		);

		if (rows.length === 0) {
			return res.status(404).json({ ok: false, message: 'not_found' });
		}

		const [flowers] = await pool.query(
			`SELECT roza_id, ime, cena_na_enoto, sezonska_dostopnost, dobavljivost
			 FROM roza
			 WHERE dobavitelj_id = ?
			 ORDER BY ime ASC`,
			[req.params.id]
		);

		const d = rows[0];
		res.json({
			ok: true,
			supplier: {
				supplier_id: d.dobavitelj_id,
				name: d.naziv,
				rating: d.ocena,
				email: d.e_posta,
				flowers: flowers.map((f) => ({
					flower_id: f.roza_id,
					name: f.ime,
					unit_price: f.cena_na_enoto,
					season: f.sezonska_dostopnost,
					availability: f.dobavljivost,
				})),
			},
		});
	} catch (error) {
		next(error);
	}
});

router.patch('/:id', authRequired, async (req, res, next) => {
	try {
		const { id } = req.params;
		const { name, rating } = req.body;

		const [rows] = await pool.query(
			'SELECT dobavitelj_id FROM dobavitelj WHERE dobavitelj_id = ?',
			[id]
		);
		if (rows.length === 0) {
			return res.status(404).json({ ok: false, message: 'not_found' });
		}

		if (req.user.role !== 'admin' && req.user.supplierId !== id) {
			return res.status(403).json({ ok: false, message: 'forbidden' });
		}

		const updates = [];
		const values = [];

		if (name) {
			updates.push('naziv = ?');
			values.push(name.trim());
		}
		if (rating !== undefined && req.user.role === 'admin') {
			const r = parseFloat(rating);
			if (isNaN(r) || r < 0 || r > 5) {
				return res.status(400).json({ ok: false, message: 'invalid_rating' });
			}
			updates.push('ocena = ?');
			values.push(r);
		}

		if (updates.length === 0) {
			return res.status(400).json({ ok: false, message: 'no_fields' });
		}

		values.push(id);
		await pool.query(
			`UPDATE dobavitelj SET ${updates.join(', ')} WHERE dobavitelj_id = ?`,
			values
		);

		res.json({ ok: true });
	} catch (error) {
		next(error);
	}
});

module.exports = router;
>>>>>>> ddce65c36e71a70af68d00a59d0b2db5f5643ed3
