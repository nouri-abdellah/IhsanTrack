import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();
async function checkIndexes() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306
    });
    const query = "SELECT TABLE_NAME, COUNT(*) AS index_count FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = ? GROUP BY TABLE_NAME ORDER BY index_count DESC";
    const [rows] = await connection.execute(query, [process.env.DB_NAME]);
    console.log('--- Table Index Counts (Ordered Descending) ---');
    rows.forEach(row => {
      console.log(`${row.TABLE_NAME}: ${row.index_count}`);
    });
    const highIndexTables = rows.filter(row => row.index_count >= 60);
    if (highIndexTables.length > 0) {
      console.log('\n--- Tables with Index Count >= 60 ---');
      highIndexTables.forEach(row => {
        console.log(`${row.TABLE_NAME}: ${row.index_count}`);
      });
    } else {
      console.log('\nNo tables found with index count >= 60.');
    }
    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}
checkIndexes();
