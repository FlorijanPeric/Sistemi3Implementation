const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const pool = require('../config/db');

const router = express.Router();

function createToken(user) {
	return jwt.sign(
		{
			userId: user.user_id,
			username: user.username,
			role: user.role,
			floristId: user.florist_id || null,
			supplierId: user.supplier_id || null,
		},
		process.env.JWT_SECRET || 'flower-secret',
		{ expiresIn: '7d' }
	);
}

router.post('/register', async (req, res, next) => {
	try {
		const { username, email, password } = req.body;
		const role = ['florist', 'supplier'].includes(req.body.role) ? req.body.role : 'florist';

		if (!username || !email || !password) {
			return res.status(400).json({ ok: false, message: 'missing_fields' });
		}

		const [existing] = await pool.query(
			'SELECT uporabnik_id FROM uporabnik WHERE uporabnisko_ime = ? OR e_posta = ?',
			[username, email]
		);

		if (existing.length > 0) {
			return res.status(409).json({ ok: false, message: 'user_exists' });
		}

		const userId = randomUUID();
		const assignedDate = new Date().toISOString().slice(0, 10);
		const passwordHash = await bcrypt.hash(password, 10);
		await pool.query(
			'INSERT INTO uporabnik (uporabnik_id, uporabnisko_ime, geslo, e_posta, datum_dodelitve_vloge, vloga, obdobje_veljavnosti) VALUES (?, ?, ?, ?, ?, ?, ?)',
			[userId, username, passwordHash, email, assignedDate, role, null]
		);
		let floristId = null;
		let supplierId = null;

		if (role === 'supplier') {
			supplierId = randomUUID();
			await pool.query(
				'INSERT INTO dobavitelj (dobavitelj_id, uporabnik_id, ocena, naziv) VALUES (?, ?, ?, ?)',
				[supplierId, userId, 4.5, username]
			);
		} else {
			floristId = randomUUID();
			await pool.query(
				'INSERT INTO cvetlicarna (cvetlicarna_id, uporabnik_id, naziv) VALUES (?, ?, ?)',
				[floristId, userId, username]
			);
		}

		const user = {
			user_id: userId,
			username,
			email,
			role,
			florist_id: floristId,
			supplier_id: supplierId,
		};

		return res.status(201).json({ ok: true, user, token: createToken(user) });
	} catch (error) {
		next(error);
	}
});

router.post('/login', async (req, res, next) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({ ok: false, message: 'missing_fields' });
		}

		const [rows] = await pool.query(
			`SELECT
				u.uporabnik_id,
				u.uporabnisko_ime,
				u.e_posta,
				u.geslo,
				u.vloga,
				c.cvetlicarna_id,
				d.dobavitelj_id
			FROM uporabnik u
			LEFT JOIN cvetlicarna c ON c.uporabnik_id = u.uporabnik_id
			LEFT JOIN dobavitelj d ON d.uporabnik_id = u.uporabnik_id
			WHERE u.e_posta = ? OR u.uporabnisko_ime = ?
			LIMIT 1`,
			[email, email]
		);

		if (rows.length === 0) {
			return res.status(401).json({ ok: false, message: 'invalid_credentials' });
		}

		const user = rows[0];
		const passwordMatches = await bcrypt.compare(password, user.geslo);

		if (!passwordMatches) {
			return res.status(401).json({ ok: false, message: 'invalid_credentials' });
		}

		const responseUser = {
			user_id: user.uporabnik_id,
			username: user.uporabnisko_ime,
			email: user.e_posta,
			role: user.vloga,
			florist_id: user.cvetlicarna_id,
			supplier_id: user.dobavitelj_id,
		};

		return res.json({ ok: true, user: responseUser, token: createToken(responseUser) });
	} catch (error) {
		next(error);
	}
});

router.get('/me', async (req, res, next) => {
	const header = req.headers.authorization || '';
	const token = header.startsWith('Bearer ') ? header.slice(7) : null;
	if (!token) return res.status(401).json({ ok: false, message: 'missing_token' });

	try {
		const jwt = require('jsonwebtoken');
		const payload = jwt.verify(token, process.env.JWT_SECRET || 'flower-secret');

		const [rows] = await pool.query(
			`SELECT u.uporabnik_id, u.uporabnisko_ime, u.e_posta, u.vloga,
				c.cvetlicarna_id, d.dobavitelj_id
			 FROM uporabnik u
			 LEFT JOIN cvetlicarna c ON c.uporabnik_id = u.uporabnik_id
			 LEFT JOIN dobavitelj d ON d.uporabnik_id = u.uporabnik_id
			 WHERE u.uporabnik_id = ?
			 LIMIT 1`,
			[payload.userId]
		);

		if (rows.length === 0) return res.status(404).json({ ok: false, message: 'not_found' });

		const u = rows[0];
		return res.json({
			ok: true,
			user: {
				user_id: u.uporabnik_id,
				username: u.uporabnisko_ime,
				email: u.e_posta,
				role: u.vloga,
				florist_id: u.cvetlicarna_id || null,
				supplier_id: u.dobavitelj_id || null,
			},
		});
	} catch (error) {
		return res.status(401).json({ ok: false, message: 'invalid_token' });
	}
});

module.exports = router;
