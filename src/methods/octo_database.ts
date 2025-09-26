import { env, masterDb } from "../dbConfig/dbConfig.ts";
import { Umzug, SequelizeStorage } from "umzug";
import { Sequelize } from "sequelize";


interface clientDataType {
  organizationName: string;
}

export async function createClientDatabase(clientData: clientDataType) {
  const databaseName = clientData.organizationName;
  try {
    await masterDb.query(`CREATE DATABASE "${databaseName}";`);
    console.log(`CREATED DATABASE ${databaseName} `);

    await masterDb.close();

    const clientDb = new Sequelize(databaseName, env.PG_MASTER_USER, env.PG_MASTER_PASSWORD, {
      host: env.PG_MASTER_HOST,
      port: env.PG_MASTER_PORT,
      dialect: "postgres",
      dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
    });

    const migrator = new Umzug({
      migrations: { glob: "migrations/*.js" },
      context: clientDb,
      storage: new SequelizeStorage({ sequelize: clientDb }),
      logger: console,
    });

    // 4. Запускаем миграции
    await migrator.up();
    console.log(`✅ MIGRATIONS applied for ${databaseName}`);
  } catch (e) {
    console.error(e);
  }
}
