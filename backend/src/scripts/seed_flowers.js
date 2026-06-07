require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { randomUUID } = require('crypto');
const pool = require('../config/db');

async function seedFlowers() {
  console.log('Seeding extra flowers...');

  const [suppliers] = await pool.query('SELECT dobavitelj_id, naziv FROM dobavitelj');
  if (suppliers.length === 0) {
    console.error('No suppliers found — run seed.js first.');
    process.exit(1);
  }

  const byName = {};
  for (const s of suppliers) byName[s.naziv] = s.dobavitelj_id;

  const sup1Id = byName['GreenGarden'];
  const sup2Id = byName['BloomCo'];
  const sup3Id = byName['PetalFarm'];

  const flowers = [
    // GreenGarden
    [randomUUID(), 'Gladiola',      2.10, 'summer', 'in_stock',  '2026-06-01', '2026-09-30', sup1Id],
    [randomUUID(), 'Ranunculus',    3.40, 'spring', 'in_stock',  '2026-03-01', '2026-05-31', sup1Id],
    [randomUUID(), 'Šmarnica',      1.60, 'spring', 'low_stock', '2026-04-15', '2026-05-15', sup1Id],
    [randomUUID(), 'Dahlia',        3.00, 'summer', 'in_stock',  '2026-07-01', '2026-10-31', sup1Id],
    [randomUUID(), 'Alstromerija',  2.40, null,     'in_stock',  null,         null,         sup1Id],
    // BloomCo
    [randomUUID(), 'Anemona',       2.70, 'spring', 'in_stock',  '2026-03-01', '2026-05-31', sup2Id],
    [randomUUID(), 'Lisianthus',    4.20, null,     'in_stock',  null,         null,         sup2Id],
    [randomUUID(), 'Protea',        6.50, null,     'in_stock',  null,         null,         sup2Id],
    [randomUUID(), 'Kosmulja',      1.90, 'autumn', 'in_stock',  '2026-09-01', '2026-11-30', sup2Id],
    [randomUUID(), 'Zinija',        1.50, 'summer', 'in_stock',  '2026-06-01', '2026-09-30', sup2Id],
    [randomUUID(), 'Gypsophila',    1.30, null,     'in_stock',  null,         null,         sup2Id],
    // PetalFarm
    [randomUUID(), 'Amarilis',      4.50, 'winter', 'in_stock',  '2025-11-01', '2026-01-31', sup3Id],
    [randomUUID(), 'Kamelija',      3.60, 'winter', 'low_stock', '2025-12-01', '2026-03-31', sup3Id],
    [randomUUID(), 'Magnolija',     4.80, 'spring', 'low_stock', '2026-03-01', '2026-04-30', sup3Id],
    [randomUUID(), 'Ajda',          1.10, 'summer', 'in_stock',  '2026-06-01', '2026-08-31', sup3Id],
    [randomUUID(), 'Šipek',         1.80, 'autumn', 'in_stock',  '2026-09-01', '2026-11-30', sup3Id],
    [randomUUID(), 'Waxflower',     2.20, null,     'in_stock',  null,         null,         sup3Id],
  ].filter(r => r[7] != null);

  if (flowers.length === 0) {
    console.error('No matching suppliers found in DB.');
    process.exit(1);
  }

  await pool.query(
    `INSERT IGNORE INTO roza
      (roza_id, ime, cena_na_enoto, sezonska_dostopnost, dobavljivost,
       datum_zacetka_ponudbe, datum_konca_ponudbe, dobavitelj_id)
     VALUES ?`,
    [flowers]
  );

  console.log(`  ${flowers.length} flowers inserted`);
  console.log('Done.');
  await pool.end();
}

seedFlowers().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
