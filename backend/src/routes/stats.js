const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// Top flowers by total quantity ordered (all time)
router.get('/top-flowers', async (req, res, next) => {
	try {
		const [rows] = await pool.query(
			`SELECT
				r.roza_id,
				r.ime AS name,
				r.cena_na_enoto AS unit_price,
				COALESCE(SUM(p.kolicina), 0) AS total_qty
			 FROM roza r
			 LEFT JOIN postavka_narocila p ON p.roza_id = r.roza_id
			 LEFT JOIN narocilo n ON n.narocilo_id = p.narocilo_id
			   AND n.status NOT IN ('preklicano','zavrnjeno')
			 GROUP BY r.roza_id, r.ime, r.cena_na_enoto
			 ORDER BY total_qty DESC, r.ime ASC
			 LIMIT 6`
		);

		res.json({ ok: true, flowers: rows.map((r) => ({
			flower_id: r.roza_id,
			name: r.name,
			unit_price: r.unit_price,
			total_qty: Number(r.total_qty),
		})) });
	} catch (error) {
		next(error);
	}
});

// Monthly order counts and totals for the last 6 months
router.get('/monthly-orders', async (req, res, next) => {
	try {
		const [rows] = await pool.query(
			`SELECT
				YEAR(datum_narocila)  AS yr,
				MONTH(datum_narocila) AS mo,
				COUNT(DISTINCT n.narocilo_id) AS order_count,
				COALESCE(SUM(p.skupna_vrednost_postavke), 0) AS total_value
			 FROM narocilo n
			 LEFT JOIN postavka_narocila p ON p.narocilo_id = n.narocilo_id
			 WHERE datum_narocila >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
			   AND n.status NOT IN ('preklicano','zavrnjeno')
			 GROUP BY YEAR(datum_narocila), MONTH(datum_narocila)
			 ORDER BY yr ASC, mo ASC`
		);

		const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
		res.json({
			ok: true,
			months: rows.map((r) => ({
				label: monthNames[r.mo - 1],
				order_count: Number(r.order_count),
				total_value: Number(r.total_value),
			})),
		});
	} catch (error) {
		next(error);
	}
});

module.exports = router;
