const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function createDatabase() {
  console.log('Проверка существования базы данных...');
  
  try {
    const { stdout } = await execPromise(
      'docker exec ledvl-postgres psql -U postgres -lqt'
    );
    
    const dbExists = stdout.split('\n').some(line => {
      const dbName = line.split('|')[0]?.trim();
      return dbName === 'ledvl';
    });
    
    if (!dbExists) {
      console.log('Создание базы данных ledvl...');
      try {
        await execPromise(
          'docker exec ledvl-postgres psql -U postgres -c "CREATE DATABASE ledvl;"'
        );
        console.log('✓ База данных ledvl создана!');
      } catch (createError) {
        if (createError.message.includes('already exists')) {
          console.log('✓ База данных ledvl уже существует');
        } else {
          throw createError;
        }
      }
    } else {
      console.log('✓ База данных ledvl уже существует');
    }
    
    await execPromise(
      'docker exec ledvl-postgres psql -U postgres -d ledvl -c "SELECT 1;"'
    );
    console.log('✓ Подключение к базе данных успешно');
    
    return true;
  } catch (error) {
    console.error('Ошибка при работе с базой данных:', error.message);
    return false;
  }
}

async function main() {
  try {
    await createDatabase();
    process.exit(0);
  } catch (error) {
    console.error('Ошибка:', error.message);
    process.exit(1);
  }
}

main();

