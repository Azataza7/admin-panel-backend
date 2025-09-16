import { DataTypes, Model, type Optional } from "sequelize";
import { sequelize } from "../dbConfig/dbConfig";

export interface UserAttributes {
  id: number;
  role: "admin";
  email: string;
  password: string;
  organizationName: string;
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
  declare role: "admin";
  declare email: string;
  declare password: string;
  declare organizationName: string;
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
      type: DataTypes.ENUM("admin"),
      allowNull: true,
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
