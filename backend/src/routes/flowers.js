const express = require('express');
const pool = require('../config/db');
const { authRequired } = require('../middleware/auth');
const { randomUUID } = require('crypto');

const router = express.Router();

router.get('/', async (req, res, next) => {
	try {
		const [rows] = await pool.query(
			`SELECT
				f.roza_id,
				f.ime,
				f.cena_na_enoto,
				f.sezonska_dostopnost,
				f.dobavljivost,
				f.datum_zacetka_ponudbe,
				f.datum_konca_ponudbe,
				f.dobavitelj_id,
				d.naziv AS supplier_name,
				d.ocena AS supplier_rating
			FROM roza f
			JOIN dobavitelj d ON d.dobavitelj_id = f.dobavitelj_id
			ORDER BY f.ime ASC`
		);

		res.json({
			ok: true,
			flowers: rows.map((row) => ({
				flower_id: row.roza_id,
				name: row.ime,
				unit_price: row.cena_na_enoto,
				season_start: row.sezonska_dostopnost,
				season_end: null,
				availability: row.dobavljivost,
				offer_start: row.datum_zacetka_ponudbe,
				offer_end: row.datum_konca_ponudbe,
				supplier_id: row.dobavitelj_id,
				supplier_name: row.supplier_name,
				supplier_rating: row.supplier_rating,
			})),
		});
	} catch (error) {
		next(error);
	}
});

router.post('/', authRequired, async (req, res, next) => {
	try {
		const {
			name,
			unit_price,
			season_start = null,
			season_end = null,
			availability = 'in_stock',
			offer_start = null,
			offer_end = null,
		} = req.body;

		if (req.user.role !== 'supplier' && req.user.role !== 'admin') {
			return res.status(403).json({ ok: false, message: 'forbidden' });
		}

		if (!name || !unit_price) {
			return res.status(400).json({ ok: false, message: 'missing_fields' });
		}

		const supplierId = req.user.supplierId || req.body.supplier_id;
		if (!supplierId) {
			return res.status(400).json({ ok: false, message: 'missing_supplier' });
		}

		const flowerId = randomUUID();
		const [result] = await pool.query(
			`INSERT INTO roza
				(roza_id, ime, cena_na_enoto, sezonska_dostopnost, dobavljivost, datum_zacetka_ponudbe, datum_konca_ponudbe, dobavitelj_id)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?)` ,
			[flowerId, name, unit_price, season_start, availability, offer_start, offer_end, supplierId]
		);

		res.status(201).json({ ok: true, flower_id: flowerId });
	} catch (error) {
		next(error);
	}
});

router.put('/:id', authRequired, async (req, res, next) => {
	try {
		const flowerId = req.params.id;
		const {
			name,
			unit_price,
			season_start = null,
			season_end = null,
			availability = 'in_stock',
			offer_start = null,
			offer_end = null,
		} = req.body;

		const [rows] = await pool.query('SELECT dobavitelj_id FROM roza WHERE roza_id = ?', [flowerId]);
		if (rows.length === 0) {
			return res.status(404).json({ ok: false, message: 'not_found' });
		}

		if (req.user.role !== 'admin' && req.user.supplierId !== rows[0].dobavitelj_id) {
			return res.status(403).json({ ok: false, message: 'forbidden' });
		}

		await pool.query(
			`UPDATE roza
			 SET ime = ?, cena_na_enoto = ?, sezonska_dostopnost = ?, dobavljivost = ?, datum_zacetka_ponudbe = ?, datum_konca_ponudbe = ?
			 WHERE roza_id = ?`,
			[name, unit_price, season_start, availability, offer_start, offer_end, flowerId]
		);

		res.json({ ok: true });
	} catch (error) {
		next(error);
	}
});

router.delete('/:id', authRequired, async (req, res, next) => {
	try {
		const flowerId = req.params.id;
		const [rows] = await pool.query('SELECT dobavitelj_id FROM roza WHERE roza_id = ?', [flowerId]);

		if (rows.length === 0) {
			return res.status(404).json({ ok: false, message: 'not_found' });
		}

		if (req.user.role !== 'admin' && req.user.supplierId !== rows[0].dobavitelj_id) {
			return res.status(403).json({ ok: false, message: 'forbidden' });
		}

		await pool.query('DELETE FROM roza WHERE roza_id = ?', [flowerId]);
		res.json({ ok: true });
	} catch (error) {
		next(error);
	}
});

module.exports = router;
