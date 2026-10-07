import { Client } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Загружаем переменные окружения
dotenv.config({ path: resolve(__dirname, '../.env') });

async function updateAdmin() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'ledvl',
  });

  try {
    await client.connect();
    console.log('Connected to database');

    const newEmail = 'vizibi@gmail.com';
    const newPassword = 'HxHYHGnp';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Проверяем, существует ли админ с таким email
    const existingAdminResult = await client.query(
      'SELECT id FROM admins WHERE email = $1',
      [newEmail]
    );

    if (existingAdminResult.rows.length > 0) {
      // Обновляем существующего админа
      await client.query(
        'UPDATE admins SET password_hash = $1 WHERE email = $2',
        [hashedPassword, newEmail]
      );
      console.log(`✓ Admin with email ${newEmail} updated successfully`);
    } else {
      // Проверяем, есть ли вообще админы
      const adminCountResult = await client.query('SELECT COUNT(*) as count FROM admins');
      const count = parseInt(adminCountResult.rows[0].count);

      if (count > 0) {
        // Обновляем первого админа
        await client.query(
          'UPDATE admins SET email = $1, password_hash = $2 WHERE id = (SELECT id FROM admins LIMIT 1)',
          [newEmail, hashedPassword]
        );
        console.log(`✓ First admin updated to email ${newEmail}`);
      } else {
        // Создаем нового админа
        await client.query(
          'INSERT INTO admins (id, email, password_hash, role, created_at) VALUES (uuid_generate_v4(), $1, $2, $3, NOW())',
          [newEmail, hashedPassword, 'admin']
        );
        console.log(`✓ New admin created with email ${newEmail}`);
      }
    }

    await client.end();
    console.log('✓ Database connection closed');
  } catch (error) {
    console.error('✗ Error updating admin:', error);
    await client.end();
    process.exit(1);
  }
}

updateAdmin();

