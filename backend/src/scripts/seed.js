require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const bcrypt = require('bcrypt');
const { randomUUID } = require('crypto');
const pool = require('../config/db');

const today = new Date().toISOString().slice(0, 10);

async function seed() {
	console.log('Seeding database...');

	// ── Users ────────────────────────────────────────────────────────────────

	const adminId    = randomUUID();
	const sup1UserId = randomUUID();
	const sup2UserId = randomUUID();
	const sup3UserId = randomUUID();
	const fl1UserId  = randomUUID();
	const fl2UserId  = randomUUID();
	const fl3UserId  = randomUUID();

	const users = [
		[adminId,    'admin',     await bcrypt.hash('admin123',    10), 'admin@flowers.local',     today, 'admin',    null],
		[sup1UserId, 'greengarden', await bcrypt.hash('supplier1', 10), 'sup1@flowers.local',      today, 'supplier', null],
		[sup2UserId, 'bloomco',   await bcrypt.hash('supplier2',   10), 'sup2@flowers.local',      today, 'supplier', null],
		[sup3UserId, 'petalfarm', await bcrypt.hash('supplier3',   10), 'sup3@flowers.local',      today, 'supplier', null],
		[fl1UserId,  'rozice',    await bcrypt.hash('florist1',    10), 'fl1@flowers.local',       today, 'florist',  null],
		[fl2UserId,  'cvetjezavse', await bcrypt.hash('florist2',  10), 'fl2@flowers.local',       today, 'florist',  null],
		[fl3UserId,  'zelenaoaza', await bcrypt.hash('florist3',   10), 'fl3@flowers.local',       today, 'florist',  null],
	];

	await pool.query(
		`INSERT IGNORE INTO uporabnik
			(uporabnik_id, uporabnisko_ime, geslo, e_posta, datum_dodelitve_vloge, vloga, obdobje_veljavnosti)
		 VALUES ?`,
		[users]
	);
	console.log('  users inserted');

	// ── Suppliers ─────────────────────────────────────────────────────────────

	const sup1Id = randomUUID();
	const sup2Id = randomUUID();
	const sup3Id = randomUUID();

	await pool.query(
		`INSERT IGNORE INTO dobavitelj (dobavitelj_id, uporabnik_id, ocena, naziv) VALUES ?`,
		[[
			[sup1Id, sup1UserId, 4.8, 'GreenGarden'],
			[sup2Id, sup2UserId, 4.5, 'BloomCo'],
			[sup3Id, sup3UserId, 4.2, 'PetalFarm'],
		]]
	);
	console.log('  suppliers inserted');

	// ── Florists ──────────────────────────────────────────────────────────────

	const fl1Id = randomUUID();
	const fl2Id = randomUUID();
	const fl3Id = randomUUID();

	await pool.query(
		`INSERT IGNORE INTO cvetlicarna (cvetlicarna_id, uporabnik_id, naziv) VALUES ?`,
		[[
			[fl1Id, fl1UserId, 'Rožice d.o.o.'],
			[fl2Id, fl2UserId, 'Cvetje za vse'],
			[fl3Id, fl3UserId, 'Zelena oaza'],
		]]
	);
	console.log('  florists inserted');

	// ── Flowers ───────────────────────────────────────────────────────────────

	const flowers = [
		// GreenGarden
		[randomUUID(), 'Vrtnica',     2.50, 'spring', 'in_stock',    '2026-03-01', '2026-06-30', sup1Id],
		[randomUUID(), 'Tulipan',     1.80, 'spring', 'in_stock',    '2026-03-01', '2026-05-31', sup1Id],
		[randomUUID(), 'Narcisa',     1.50, 'spring', 'in_stock',    '2026-02-15', '2026-04-30', sup1Id],
		[randomUUID(), 'Hortenzija',  3.20, 'summer', 'in_stock',    '2026-06-01', '2026-09-30', sup1Id],
		[randomUUID(), 'Lilija',      2.90, 'summer', 'in_stock',    '2026-05-01', '2026-08-31', sup1Id],
		// BloomCo
		[randomUUID(), 'Gerbera',     1.90, 'summer', 'in_stock',    '2026-05-01', '2026-09-30', sup2Id],
		[randomUUID(), 'Frezia',      2.10, 'spring', 'in_stock',    '2026-03-01', '2026-06-30', sup2Id],
		[randomUUID(), 'Orhideja',    5.50, null,     'in_stock',    null,         null,         sup2Id],
		[randomUUID(), 'Krizantema',  1.70, 'autumn', 'in_stock',    '2026-09-01', '2026-11-30', sup2Id],
		[randomUUID(), 'Lavanda',     2.30, 'summer', 'in_stock',    '2026-06-01', '2026-08-31', sup2Id],
		// PetalFarm
		[randomUUID(), 'Peonia',      3.80, 'spring', 'in_stock',    '2026-04-01', '2026-06-30', sup3Id],
		[randomUUID(), 'Mimoza',      2.00, 'spring', 'low_stock',   '2026-02-01', '2026-04-30', sup3Id],
		[randomUUID(), 'Zvonček',     1.20, 'winter', 'low_stock',   '2025-12-01', '2026-02-28', sup3Id],
		[randomUUID(), 'Sončnica',    2.60, 'summer', 'in_stock',    '2026-06-01', '2026-09-30', sup3Id],
		[randomUUID(), 'Iris',        2.20, 'spring', 'in_stock',    '2026-04-01', '2026-06-30', sup3Id],
	];

	await pool.query(
		`INSERT IGNORE INTO roza
			(roza_id, ime, cena_na_enoto, sezonska_dostopnost, dobavljivost, datum_zacetka_ponudbe, datum_konca_ponudbe, dobavitelj_id)
		 VALUES ?`,
		[flowers]
	);
	console.log('  flowers inserted');

	// ── Orders ────────────────────────────────────────────────────────────────

	const flowerMap = {};
	const [flowerRows] = await pool.query('SELECT roza_id, ime, cena_na_enoto FROM roza WHERE ime IN (?,?,?,?,?)', [
		'Vrtnica', 'Tulipan', 'Gerbera', 'Orhideja', 'Sončnica',
	]);
	for (const r of flowerRows) flowerMap[r.ime] = r;

	const orders = [
		{ id: randomUUID(), floristId: fl1Id, date: '2026-05-10', delivery: '2026-05-14', status: 'dostavljeno' },
		{ id: randomUUID(), floristId: fl1Id, date: '2026-05-20', delivery: '2026-05-24', status: 'potrjeno' },
		{ id: randomUUID(), floristId: fl2Id, date: '2026-05-15', delivery: '2026-05-19', status: 'dostavljeno' },
		{ id: randomUUID(), floristId: fl2Id, date: '2026-06-01', delivery: null,         status: 'v obdelavi' },
		{ id: randomUUID(), floristId: fl3Id, date: '2026-05-28', delivery: '2026-06-02', status: 'potrjeno' },
	];

	const orderRows = orders.map((o) => [o.id, o.date, o.floristId, o.delivery, o.status]);
	await pool.query(
		'INSERT IGNORE INTO narocilo (narocilo_id, datum_narocila, cvetlicarna_id, datum_dostave, status) VALUES ?',
		[orderRows]
	);

	const historyRows = orders.map((o) => [randomUUID(), o.id, o.status, o.date]);
	await pool.query(
		'INSERT IGNORE INTO zgodovina_narocil (zgodovina_id, narocilo_id, status, datum_spremembe) VALUES ?',
		[historyRows]
	);

	const items = [
		// order 0: fl1, Vrtnica x20 + Tulipan x15
		[randomUUID(), orders[0].id, flowerMap['Vrtnica']?.roza_id,  20, flowerMap['Vrtnica']?.cena_na_enoto,  (20 * 2.50).toFixed(2)],
		[randomUUID(), orders[0].id, flowerMap['Tulipan']?.roza_id,  15, flowerMap['Tulipan']?.cena_na_enoto,  (15 * 1.80).toFixed(2)],
		// order 1: fl1, Orhideja x5
		[randomUUID(), orders[1].id, flowerMap['Orhideja']?.roza_id,  5, flowerMap['Orhideja']?.cena_na_enoto, (5  * 5.50).toFixed(2)],
		// order 2: fl2, Gerbera x30 + Sončnica x10
		[randomUUID(), orders[2].id, flowerMap['Gerbera']?.roza_id,  30, flowerMap['Gerbera']?.cena_na_enoto,  (30 * 1.90).toFixed(2)],
		[randomUUID(), orders[2].id, flowerMap['Sončnica']?.roza_id, 10, flowerMap['Sončnica']?.cena_na_enoto, (10 * 2.60).toFixed(2)],
		// order 3: fl2, Vrtnica x25
		[randomUUID(), orders[3].id, flowerMap['Vrtnica']?.roza_id,  25, flowerMap['Vrtnica']?.cena_na_enoto,  (25 * 2.50).toFixed(2)],
		// order 4: fl3, Tulipan x40
		[randomUUID(), orders[4].id, flowerMap['Tulipan']?.roza_id,  40, flowerMap['Tulipan']?.cena_na_enoto,  (40 * 1.80).toFixed(2)],
	].filter((row) => row[2] != null);

	if (items.length > 0) {
		await pool.query(
			`INSERT IGNORE INTO postavka_narocila
				(postavka_id, narocilo_id, roza_id, kolicina, cena_na_rozo, skupna_vrednost_postavke)
			 VALUES ?`,
			[items]
		);
	}
	console.log('  orders + items inserted');

	console.log('\nDone. Credentials:');
	console.log('  admin       admin@flowers.local     / admin123');
	console.log('  supplier1   sup1@flowers.local      / supplier1  (GreenGarden)');
	console.log('  supplier2   sup2@flowers.local      / supplier2  (BloomCo)');
	console.log('  supplier3   sup3@flowers.local      / supplier3  (PetalFarm)');
	console.log('  florist1    fl1@flowers.local        / florist1   (Rožice d.o.o.)');
	console.log('  florist2    fl2@flowers.local        / florist2   (Cvetje za vse)');
	console.log('  florist3    fl3@flowers.local        / florist3   (Zelena oaza)');

	await pool.end();
}

seed().catch((err) => {
	console.error('Seed failed:', err.message);
	process.exit(1);
});
