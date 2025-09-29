import { DataTypes, Model, type Optional } from "sequelize";
import { sequelize } from "../dbConfig/dbConfig.ts";

export interface ClientAttributes {
  id: number;
  organization_id: number;
  source_id: string; // telegram_id создан через календарь/месенджер или сам через онлайн запись на сайте
  first_name: string;
  last_name?: string | null;
  custom_name?: string | null; // связан с интеграцией
  username?: string | null; // связан с интеграцией
  phone_number: string;
  is_active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ClientCreationAttributes = Optional<
  ClientAttributes,
  "id"
  | "createdAt"
  | "updatedAt"
  | "last_name"
  | "custom_name"
  | "username"
>;

export class Client extends
  Model<ClientAttributes, ClientCreationAttributes>
  implements ClientAttributes {
  declare id: number;
  declare organization_id: number;
  declare source_id: string;
  declare first_name: string;
  declare last_name: string;
  declare custom_name: string;
  declare phone_number: string;
  declare is_active: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Client.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  organization_id: { type: DataTypes.INTEGER, allowNull: true },
  source_id: { type: DataTypes.TEXT, allowNull: false, },
  first_name: { type: DataTypes.STRING, allowNull: false },
  last_name: { type: DataTypes.STRING, allowNull: true },
  custom_name: { type: DataTypes.STRING, allowNull: true },
  phone_number: { type: DataTypes.STRING, allowNull: false },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
},{
  sequelize,
  tableName: "clients",
  timestamps: true,
  indexes: [{ unique: true, fields: ["source_id", "phone_number"] }],
});

//еще должна быть связка с таблицей организации

export default Client;
