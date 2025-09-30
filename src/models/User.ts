import { DataTypes, Model, type Optional } from "sequelize";
import { sequelize } from "../dbConfig/dbConfig";
import crypto from "crypto";

export interface UserAttributes {
  id: number;
  first_name: string;
  last_name?: string;
  email: string;
  password: string;
  token?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserCreationAttributes = Optional<
  UserAttributes,
  "id" | "last_name" | "createdAt" | "updatedAt"
>;

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  declare id: number;
  declare first_name: string;
  declare last_name: string;
  declare email: string;
  declare password: string;
  declare token: string;
  declare isActive: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: new DataTypes.STRING(128),
      allowNull: false,
      unique: true,
    },
    password: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
    token: {
      type: new DataTypes.STRING(128),
      allowNull: false,
      defaultValue: () => crypto.randomBytes(32).toString("hex"),
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "user",
    sequelize,
    timestamps: true,
    indexes: [{ unique: true, fields: ["email"] }],
  }
);

export default User;
