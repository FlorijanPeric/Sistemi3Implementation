require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { randomUUID } = require('crypto');
const pool = require('../config/db');

const seasonMultipliers = { spring: 1.15, summer: 1.25, autumn: 1.05, winter: 0.9 };

async function seed() {
	console.log('Seeding recommendations...');

	const [florists] = await pool.query('SELECT cvetlicarna_id FROM cvetlicarna');
	const [flowers]  = await pool.query('SELECT ime, cena_na_enoto FROM roza');

	if (florists.length === 0) {
		console.error('No florists found — run seed.js first.');
		process.exit(1);
	}
	if (flowers.length === 0) {
		console.error('No flowers found — run seed.js / seed_flowers.js first.');
		process.exit(1);
	}

	const today = new Date().toISOString().slice(0, 10);
	const seasons = ['spring', 'summer', 'autumn', 'winter'];

	// Base quantities per flower (index maps to flowers array order)
	const baseQty = (flowerName, season) => {
		const bases = {
			Vrtnica: 30, Tulipan: 25, Narcisa: 20, Hortenzija: 18, Lilija: 22,
			Gerbera: 28, Frezia: 15, Orhideja: 10, Krizantema: 20, Lavanda: 12,
			Peonia: 16, Mimoza: 14, Zvonček: 8, Sončnica: 24, Iris: 18,
		};
		const base = bases[flowerName] || 10;
		const m = seasonMultipliers[season] || 1;
		return Math.max(1, Math.round(base * m));
	};

	const rows = [];
	for (const florist of florists) {
		for (const season of seasons) {
			// Clear existing for this florist+season+date combo
			await pool.query(
				'DELETE FROM priporocilo WHERE cvetlicarna_id = ? AND sezona = ? AND datum_izracuna = ?',
				[florist.cvetlicarna_id, season, today]
			);
			for (const flower of flowers) {
				rows.push([
					randomUUID(),
					florist.cvetlicarna_id,
					season,
					flower.ime,
					baseQty(flower.ime, season),
					today,
				]);
			}
		}
	}

	await pool.query(
		`INSERT INTO priporocilo
			(priporocilo_id, cvetlicarna_id, sezona, predlagana_vrsta, predlagana_kolicina, datum_izracuna)
		 VALUES ?`,
		[rows]
	);

	console.log(`  inserted ${rows.length} recommendations (${florists.length} florists × ${seasons.length} seasons × ${flowers.length} flowers)`);
	console.log('Done.');
	await pool.end();
}

seed().catch(err => { console.error('Seed failed:', err.message); process.exit(1); });
