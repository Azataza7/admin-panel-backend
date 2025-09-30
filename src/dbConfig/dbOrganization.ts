import { Sequelize } from "sequelize";
import { env } from "./dbConfig.ts";

export function getOrgSequelize (orgDbName: string) {
  return new Sequelize(orgDbName, env.PG_DATABASE, env.PG_PASSWORD, {
    host: env.PG_HOST,
    port: env.PG_PORT,
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // если сертификат самоподписанный
      },
    }
  });
}