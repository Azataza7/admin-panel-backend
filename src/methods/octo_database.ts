import { env, masterDb } from "../dbConfig/dbConfig.ts";
import { Umzug, SequelizeStorage } from "umzug";
import { Sequelize } from "sequelize";

interface clientDataType {
  organizationName: string;
}

export async function createClientDatabase(clientData: clientDataType) {
  const databaseName = clientData.organizationName;

  try {
    // 1. Создаём БД
    await masterDb.query(`CREATE DATABASE "${databaseName}";`);
    console.log(`CREATED DATABASE ${databaseName}`);

    // 2. Коннектимся к новой БД
    const clientDb = new Sequelize(
      databaseName,
      env.PG_MASTER_USER,
      env.PG_MASTER_PASSWORD,
      {
        host: env.PG_MASTER_HOST,
        port: env.PG_MASTER_PORT,
        dialect: "postgres",
        dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
        logging: false,
      }
    );

    try {
      // 3. Запускаем миграции
      const migrator = new Umzug({
        migrations: { glob: "migrations/*.js" },
        context: clientDb,
        storage: new SequelizeStorage({ sequelize: clientDb }),
        logger: console,
      });

      console.log("----------- Migrating database -------");
      await migrator.up();

      console.log(`✅ MIGRATIONS applied for ${databaseName}`);
      await clientDb.close();
      return 0;
    } catch (e) {
      console.error("----------- Migration failed: ", e);

      // ❌ если миграции не прошли → удаляем БД
      await clientDb.close().catch(() => {});
      await masterDb.query(`DROP DATABASE IF EXISTS "${databaseName}";`);
      console.log(`🗑️ DATABASE dropped ${databaseName}`);

      return 1;
    }
  } catch (e) {
    console.error("❌ Error while creating client DB:", e);
    return 1;
  }
}
