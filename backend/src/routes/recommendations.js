const express = require('express');
const pool = require('../config/db');
const { authRequired } = require('../middleware/auth');
const { randomUUID } = require('crypto');

const router = express.Router();

const seasonMultipliers = {
	spring: 1.15,
	summer: 1.25,
	autumn: 1.05,
	winter: 0.9,
};

router.get('/:floristId', authRequired, async (req, res, next) => {
	try {
		const floristId = req.params.floristId;
		const requestedSeason = String(req.query.season || 'spring').toLowerCase();
		const multiplier = seasonMultipliers[requestedSeason] || 1;

		if (req.user.role === 'florist' && req.user.floristId !== floristId) {
			return res.status(403).json({ ok: false, message: 'forbidden' });
		}

		const [rows] = await pool.query(
			`SELECT
				z.roza_id,
				z.ime,
				z.cena_na_enoto,
				COALESCE(SUM(CASE WHEN n.narocilo_id IS NULL THEN 0 ELSE p.kolicina END), 0) AS sold_qty
			 FROM roza z
			 LEFT JOIN postavka_narocila p ON p.roza_id = z.roza_id
			 LEFT JOIN narocilo n ON n.narocilo_id = p.narocilo_id AND n.cvetlicarna_id = ?
			 GROUP BY z.roza_id, z.ime, z.cena_na_enoto
			 ORDER BY sold_qty DESC, z.ime ASC`,
			[floristId]
		);

		const recommendations = rows.map((row) => {
			const baseQty = Number(row.sold_qty) || 1;
			const suggestedQty = Math.max(1, Math.round(baseQty * multiplier));

			return {
				flower_id: row.roza_id,
				name: row.ime,
				unit_price: row.cena_na_enoto,
				suggested_qty: suggestedQty,
				season: requestedSeason,
			};
		});

		await pool.query(
			'DELETE FROM priporocilo WHERE cvetlicarna_id = ? AND sezona = ? AND datum_izracuna = CURDATE()',
			[floristId, requestedSeason]
		);

		if (recommendations.length > 0) {
			const values = recommendations.map((r) => [
				randomUUID(), floristId, requestedSeason, r.name, r.suggested_qty,
			]);
			await pool.query(
				`INSERT INTO priporocilo
					(priporocilo_id, cvetlicarna_id, sezona, predlagana_vrsta, predlagana_kolicina, datum_izracuna)
				 VALUES ?`,
				[values.map((v) => [...v, new Date()])]
			);
		}

		res.json({ ok: true, recommendations });
	} catch (error) {
		next(error);
	}
});

module.exports = router;
