const { exec } = require('child_process');
const util = require('util');
const http = require('http');
const execPromise = util.promisify(exec);

async function waitForPostgres() {
  const maxAttempts = 30;
  const delay = 2000;

  console.log('Ожидание готовности PostgreSQL...');

  for (let i = 0; i < maxAttempts; i++) {
    try {
      await execPromise('docker exec ledvl-postgres pg_isready -U postgres');
      console.log('✓ PostgreSQL готов!');
      return true;
    } catch (error) {
      if (i < maxAttempts - 1) {
        process.stdout.write(`  Попытка ${i + 1}/${maxAttempts}...\r`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('\n✗ Ошибка: PostgreSQL не запустился за отведенное время');
        return false;
      }
    }
  }
}

async function waitForMinIO() {
  const maxAttempts = 10;
  const delay = 2000;

  console.log('Проверка MinIO...');

  for (let i = 0; i < maxAttempts; i++) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get('http://localhost:9000/minio/health/live', (res) => {
          if (res.statusCode === 200) {
            resolve();
          } else {
            reject(new Error(`Status: ${res.statusCode}`));
          }
        });
        req.on('error', reject);
        req.setTimeout(2000, () => {
          req.destroy();
          reject(new Error('Timeout'));
        });
      });
      
      console.log('✓ MinIO готов!');
      return true;
    } catch (error) {
      if (i < maxAttempts - 1) {
        process.stdout.write(`  Попытка ${i + 1}/${maxAttempts}...\r`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.warn('\n⚠ Предупреждение: MinIO не отвечает, продолжаем без него');
        return true;
      }
    }
  }
}

async function main() {
  try {
    const postgresReady = await waitForPostgres();
    if (!postgresReady) {
      process.exit(1);
    }
    
    await waitForMinIO();
    console.log('\n✓ Все сервисы готовы!\n');
    process.exit(0);
  } catch (error) {
    console.error('Ошибка при ожидании сервисов:', error.message);
    process.exit(1);
  }
}

main();
