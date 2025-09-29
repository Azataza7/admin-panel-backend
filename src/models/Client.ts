import { DataTypes, Model } from "sequelize";
import { sequelize } from "../dbConfig/dbConfig.ts";

export interface ClientAttributes {
  id: number;
  organization_id: number; //owner_id
  telegram_id: string; // создан через календарь/месенджер или зарегистрирован сам
  email: string;
  password: string;
  token?: string;
  first_name: string;
  last_name?: string | null;
  custom_name?: string | null; // связан с интеграцией
  username?: string | null; // связан с интеграцией
  phone_number: string;
  first_seen_at: Date | null;
  last_active_at: Date | null;
  is_active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Client extends Model<ClientAttributes> implements ClientAttributes {
  declare id: number;
  declare organization_id: number;
  declare telegram_id: string;
  declare email: string;
  declare password: string;
  declare token: string;
  declare first_name: string;
  declare last_name: string;
  declare custom_name: string;
  declare phone_number: string;
  declare first_seen_at: Date;
  declare last_active_at: Date;
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
  organization_id: { type: DataTypes.INTEGER, allowNull: false },
  telegram_id: { type: DataTypes.TEXT, allowNull: true },
  email: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  token: { type: DataTypes.TEXT, allowNull: true },
  first_name: { type: DataTypes.STRING, allowNull: false },
  last_name: { type: DataTypes.STRING, allowNull: true },
  custom_name: { type: DataTypes.STRING, allowNull: true },
  phone_number: { type: DataTypes.STRING, allowNull: false },
  first_seen_at: { type: DataTypes.DATE, allowNull: true },
  last_active_at: { type: DataTypes.DATE, allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
},{
  sequelize,
  tableName: "clients",
  timestamps: true,
  indexes: [{ unique: true, fields: ["email", "telegram_id"] }],
});

//еще должна быть связка с таблицей организации

export default Client;
