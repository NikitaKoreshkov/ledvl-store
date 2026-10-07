const { exec } = require('child_process');
const path = require('path');

// Запускаем TypeScript скрипт через ts-node
const scriptPath = path.join(__dirname, 'add-test-products.ts');
const command = `cd ${path.join(__dirname, '..', 'backend')} && npx ts-node -r tsconfig-paths/register ${scriptPath}`;

console.log('Добавление тестовых товаров в базу данных...\n');

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Ошибка: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Ошибка: ${stderr}`);
    return;
  }
  console.log(stdout);
});

