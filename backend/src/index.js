import { config } from './config.js';
import { sequelize } from './db.js';
import { createApp } from './server.js';

try {
  await sequelize.authenticate();
} catch (error) {
  console.error(`Can't connect to PostgreSQL at ${config.db.host}:${config.db.port}: ${error.message}`);
  console.error('Check the DB_* settings in backend/.env, then run "npm run setup" once.');
  process.exit(1);
}

if (config.tokenSecretIsRandom) {
  console.warn('TOKEN_SECRET is not set in backend/.env: sign-ins will end when the server restarts.');
}

const server = createApp().listen(config.port, () => {
  console.log(`API ready at http://localhost:${config.port}/graphql`);
});

async function shutdown() {
  server.close();
  await sequelize.close();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
