import { DataTypes, Model, type Optional } from "sequelize";
import { sequelize } from "../dbConfig/dbConfig";
import crypto from "crypto";

export interface UserAttributes {
  id: number;
  role: "owner";
  email: string;
  branches: number;
  password: string;
  token?: string;
  organizationName: string;
  paidDate: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserCreationAttributes = Optional<
  UserAttributes,
  "id" | "createdAt" | "updatedAt"
>;

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  declare id: number;
  declare role: "owner";
  declare email: string;
  declare branches: number;
  declare password: string;
  declare token: string;
  declare organizationName: string;
  declare paidDate: Date;
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
    email: {
      type: new DataTypes.STRING(128),
      allowNull: false,
      unique: true,
    },
    organizationName: {
      type: new DataTypes.STRING(128),
      allowNull: false,
      unique: true,
    },
    password: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("owner"),
      allowNull: true,
      defaultValue: "owner",
    },
    branches: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    token: {
      type: new DataTypes.STRING(128),
      allowNull: false,
      defaultValue: () => crypto.randomBytes(32).toString("hex"),
    },
    paidDate: {
      type: DataTypes.DATE,
      allowNull: true,
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
