const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function checkDocker() {
  try {
    await execPromise('docker --version');
    try {
      await execPromise('docker-compose --version');
    } catch (e) {
      try {
        await execPromise('docker compose version');
      } catch (e2) {
        throw new Error('docker-compose не найден');
      }
    }
    return true;
  } catch (error) {
    console.error('✗ Ошибка: Docker не установлен или не запущен');
    console.error('Пожалуйста, установите Docker Desktop и запустите его');
    return false;
  }
}

async function main() {
  const dockerAvailable = await checkDocker();
  if (!dockerAvailable) {
    process.exit(1);
  }
}

main();

