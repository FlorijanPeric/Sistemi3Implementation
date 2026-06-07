const express = require('express');
const pool = require('../config/db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.get('/summary', authRequired, async (req, res, next) => {
	try {
		const { role, floristId, supplierId } = req.user;

		if (role === 'florist' && floristId) {
			const [[counts]] = await pool.query(
				`SELECT
					COUNT(DISTINCT narocilo_id) AS total_orders,
					SUM(CASE WHEN status = 'v obdelavi' THEN 1 ELSE 0 END) AS pending_orders,
					SUM(CASE WHEN status = 'dostavljeno' THEN 1 ELSE 0 END) AS completed_orders
				 FROM narocilo
				 WHERE cvetlicarna_id = ?`,
				[floristId]
			);

			const [[spend]] = await pool.query(
				`SELECT COALESCE(SUM(p.skupna_vrednost_postavke), 0) AS total_spent
				 FROM postavka_narocila p
				 JOIN narocilo n ON n.narocilo_id = p.narocilo_id
				 WHERE n.cvetlicarna_id = ? AND n.status NOT IN ('preklicano', 'zavrnjeno')`,
				[floristId]
			);

			const [recentOrders] = await pool.query(
				`SELECT n.narocilo_id, n.datum_narocila, n.datum_dostave, n.status,
					COALESCE(SUM(p.skupna_vrednost_postavke), 0) AS total_value
				 FROM narocilo n
				 LEFT JOIN postavka_narocila p ON p.narocilo_id = n.narocilo_id
				 WHERE n.cvetlicarna_id = ?
				 GROUP BY n.narocilo_id, n.datum_narocila, n.datum_dostave, n.status
				 ORDER BY n.datum_narocila DESC
				 LIMIT 5`,
				[floristId]
			);

			return res.json({
				ok: true,
				role: 'florist',
				stats: {
					total_orders: Number(counts.total_orders),
					pending_orders: Number(counts.pending_orders),
					completed_orders: Number(counts.completed_orders),
					total_spent: Number(spend.total_spent),
				},
				recent_orders: recentOrders.map((r) => ({
					order_id: r.narocilo_id,
					ordered_at: r.datum_narocila,
					delivery_date: r.datum_dostave,
					status: r.status,
					total_value: Number(r.total_value),
				})),
			});
		}

		if (role === 'supplier' && supplierId) {
			const [[counts]] = await pool.query(
				`SELECT
					COUNT(DISTINCT n.narocilo_id) AS total_orders,
					SUM(CASE WHEN n.status = 'v obdelavi' THEN 1 ELSE 0 END) AS pending_orders,
					SUM(CASE WHEN n.status = 'dostavljeno' THEN 1 ELSE 0 END) AS completed_orders
				 FROM narocilo n
				 JOIN postavka_narocila p ON p.narocilo_id = n.narocilo_id
				 JOIN roza r ON r.roza_id = p.roza_id
				 WHERE r.dobavitelj_id = ?`,
				[supplierId]
			);

			const [[revenue]] = await pool.query(
				`SELECT COALESCE(SUM(p.skupna_vrednost_postavke), 0) AS total_revenue
				 FROM postavka_narocila p
				 JOIN roza r ON r.roza_id = p.roza_id
				 JOIN narocilo n ON n.narocilo_id = p.narocilo_id
				 WHERE r.dobavitelj_id = ? AND n.status NOT IN ('preklicano', 'zavrnjeno')`,
				[supplierId]
			);

			const [recentOrders] = await pool.query(
				`SELECT n.narocilo_id, n.datum_narocila, n.datum_dostave, n.status,
					COALESCE(SUM(p.skupna_vrednost_postavke), 0) AS total_value
				 FROM narocilo n
				 JOIN postavka_narocila p ON p.narocilo_id = n.narocilo_id
				 JOIN roza r ON r.roza_id = p.roza_id
				 WHERE r.dobavitelj_id = ?
				 GROUP BY n.narocilo_id, n.datum_narocila, n.datum_dostave, n.status
				 ORDER BY n.datum_narocila DESC
				 LIMIT 5`,
				[supplierId]
			);

			return res.json({
				ok: true,
				role: 'supplier',
				stats: {
					total_orders: Number(counts.total_orders),
					pending_orders: Number(counts.pending_orders),
					completed_orders: Number(counts.completed_orders),
					total_revenue: Number(revenue.total_revenue),
				},
				recent_orders: recentOrders.map((r) => ({
					order_id: r.narocilo_id,
					ordered_at: r.datum_narocila,
					delivery_date: r.datum_dostave,
					status: r.status,
					total_value: Number(r.total_value),
				})),
			});
		}

		if (role === 'admin') {
			const [[counts]] = await pool.query(
				`SELECT
					COUNT(DISTINCT narocilo_id) AS total_orders,
					SUM(CASE WHEN status = 'v obdelavi' THEN 1 ELSE 0 END) AS pending_orders,
					SUM(CASE WHEN status = 'dostavljeno' THEN 1 ELSE 0 END) AS completed_orders
				 FROM narocilo`
			);

			const [[revenue]] = await pool.query(
				`SELECT COALESCE(SUM(p.skupna_vrednost_postavke), 0) AS total_revenue
				 FROM postavka_narocila p
				 JOIN narocilo n ON n.narocilo_id = p.narocilo_id
				 WHERE n.status NOT IN ('preklicano', 'zavrnjeno')`
			);

			const [[users]] = await pool.query(
				`SELECT COUNT(*) AS total_users FROM uporabnik`
			);

			const [recentOrders] = await pool.query(
				`SELECT n.narocilo_id, n.datum_narocila, n.datum_dostave, n.status,
					c.naziv AS florist_name,
					COALESCE(SUM(p.skupna_vrednost_postavke), 0) AS total_value
				 FROM narocilo n
				 JOIN cvetlicarna c ON c.cvetlicarna_id = n.cvetlicarna_id
				 LEFT JOIN postavka_narocila p ON p.narocilo_id = n.narocilo_id
				 GROUP BY n.narocilo_id, n.datum_narocila, n.datum_dostave, n.status, c.naziv
				 ORDER BY n.datum_narocila DESC
				 LIMIT 5`
			);

			return res.json({
				ok: true,
				role: 'admin',
				stats: {
					total_orders: Number(counts.total_orders),
					pending_orders: Number(counts.pending_orders),
					completed_orders: Number(counts.completed_orders),
					total_revenue: Number(revenue.total_revenue),
					total_users: Number(users.total_users),
				},
				recent_orders: recentOrders.map((r) => ({
					order_id: r.narocilo_id,
					florist_name: r.florist_name,
					ordered_at: r.datum_narocila,
					delivery_date: r.datum_dostave,
					status: r.status,
					total_value: Number(r.total_value),
				})),
			});
		}

		res.status(403).json({ ok: false, message: 'forbidden' });
	} catch (error) {
		next(error);
	}
});

module.exports = router;
