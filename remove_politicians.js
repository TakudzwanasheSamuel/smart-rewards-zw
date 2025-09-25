const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:smartrewards2025@localhost:5432/smart_rewards',
});

const namesToRemove = [
  'Emmerson Mnangagwa',
  'Nelson Chamisa',
  'Douglas Mwonzora',
  'Grace Mugabe',
  'Joice Mujuru',
  'Auxilia Mnangagwa',
  'Monica Mutsvangwa',
  'Oppah Muchinguri',
  'Thokozani Khupe',
  'Priscilla Misihairabwi',
  'Canaan Banana',
  'Jonathan Moyo',
  'Saviour Kasukuwere',
  'Christopher Mutsvangwa',
  'Simon Khaya Moyo',
  'Kembo Mohadi',
  'Constantine Chiwenga',
  'Sibusiso Moyo',
  'Perrance Shiri',
  'July Moyo',
  'Ziyambi Ziyambi',
  'Lovemore Madhuku',
  'David Coltart',
  'Job Sikhala',
  'Welshman Ncube',
  'Temba Mliswa',
  'Eddie Cross',
  'Elton Mangoma'
];

async function removePoliticians() {
  await client.connect();

  // Get user_ids of customers to remove
  const { rows } = await client.query(
    'SELECT user_id FROM "Customer" WHERE full_name = ANY($1::text[])',
    [namesToRemove]
  );
  const userIds = rows.map(row => row.user_id);

  if (userIds.length > 0) {
    // Delete related transactions
    await client.query(
      'DELETE FROM "Transaction" WHERE customer_id = ANY($1::text[])',
      [userIds]
    );
    // Delete customers
    const res = await client.query(
      'DELETE FROM "Customer" WHERE user_id = ANY($1::text[])',
      [userIds]
    );
    console.log(`Deleted ${res.rowCount} customers and their transactions.`);
  } else {
    console.log('No matching customers found.');
  }

  await client.end();
}

removePoliticians().catch(console.error);