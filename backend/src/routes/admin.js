const express = require('express');
const pool = require('../config/db');
const { adminRequired } = require('../middleware/requireAdmin');

const router = express.Router();

router.get('/users', adminRequired, async (req, res, next) => {
	try {
		const [rows] = await pool.query(
			`SELECT
				u.uporabnik_id,
				u.uporabnisko_ime,
				u.e_posta,
				u.vloga,
				u.datum_dodelitve_vloge,
				u.obdobje_veljavnosti,
				c.cvetlicarna_id,
				c.naziv AS florist_name,
				d.dobavitelj_id,
				d.naziv AS supplier_name,
				d.ocena AS supplier_rating
			 FROM uporabnik u
			 LEFT JOIN cvetlicarna c ON c.uporabnik_id = u.uporabnik_id
			 LEFT JOIN dobavitelj d ON d.uporabnik_id = u.uporabnik_id
			 ORDER BY u.datum_dodelitve_vloge DESC`
		);

		res.json({
			ok: true,
			users: rows.map((u) => ({
				user_id: u.uporabnik_id,
				username: u.uporabnisko_ime,
				email: u.e_posta,
				role: u.vloga,
				assigned_date: u.datum_dodelitve_vloge,
				valid_until: u.obdobje_veljavnosti,
				florist_id: u.cvetlicarna_id || null,
				florist_name: u.florist_name || null,
				supplier_id: u.dobavitelj_id || null,
				supplier_name: u.supplier_name || null,
				supplier_rating: u.supplier_rating != null ? Number(u.supplier_rating) : null,
			})),
		});
	} catch (error) {
		next(error);
	}
});

router.put('/users/:id', adminRequired, async (req, res, next) => {
	try {
		const userId = req.params.id;
		const { role, valid_until } = req.body;

		const allowedRoles = ['florist', 'supplier', 'admin'];
		if (role !== undefined && !allowedRoles.includes(role)) {
			return res.status(400).json({ ok: false, message: 'invalid_role' });
		}

		const [existing] = await pool.query('SELECT uporabnik_id FROM uporabnik WHERE uporabnik_id = ?', [userId]);
		if (existing.length === 0) {
			return res.status(404).json({ ok: false, message: 'not_found' });
		}

		const updates = [];
		const params = [];

		if (role !== undefined) {
			updates.push('vloga = ?');
			params.push(role);
		}
		if (valid_until !== undefined) {
			updates.push('obdobje_veljavnosti = ?');
			params.push(valid_until || null);
		}

		if (updates.length === 0) {
			return res.status(400).json({ ok: false, message: 'nothing_to_update' });
		}

		params.push(userId);
		await pool.query(`UPDATE uporabnik SET ${updates.join(', ')} WHERE uporabnik_id = ?`, params);

		res.json({ ok: true });
	} catch (error) {
		next(error);
	}
});

router.delete('/users/:id', adminRequired, async (req, res, next) => {
	try {
		const userId = req.params.id;

		if (req.user.userId === userId) {
			return res.status(400).json({ ok: false, message: 'cannot_delete_self' });
		}

		const [existing] = await pool.query('SELECT uporabnik_id FROM uporabnik WHERE uporabnik_id = ?', [userId]);
		if (existing.length === 0) {
			return res.status(404).json({ ok: false, message: 'not_found' });
		}

		await pool.query('DELETE FROM uporabnik WHERE uporabnik_id = ?', [userId]);

		res.json({ ok: true });
	} catch (error) {
		next(error);
	}
});

router.get('/orders', adminRequired, async (req, res, next) => {
	try {
		const [rows] = await pool.query(
			`SELECT
				n.narocilo_id,
				n.cvetlicarna_id,
				n.datum_narocila,
				n.datum_dostave,
				n.status,
				c.naziv AS florist_name,
				COALESCE(SUM(p.skupna_vrednost_postavke), 0) AS total_value
			 FROM narocilo n
			 JOIN cvetlicarna c ON c.cvetlicarna_id = n.cvetlicarna_id
			 LEFT JOIN postavka_narocila p ON p.narocilo_id = n.narocilo_id
			 GROUP BY n.narocilo_id, n.cvetlicarna_id, n.datum_narocila, n.datum_dostave, n.status, c.naziv
			 ORDER BY n.datum_narocila DESC`
		);

		res.json({
			ok: true,
			orders: rows.map((r) => ({
				order_id: r.narocilo_id,
				florist_id: r.cvetlicarna_id,
				florist_name: r.florist_name,
				ordered_at: r.datum_narocila,
				delivery_date: r.datum_dostave,
				status: r.status,
				total_value: Number(r.total_value),
			})),
		});
	} catch (error) {
		next(error);
	}
});

module.exports = router;
