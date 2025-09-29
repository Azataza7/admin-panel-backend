import { DataTypes, Model, type Optional } from "sequelize";
import { sequelize } from "../dbConfig/dbConfig.ts";
import User from "./User.ts";

export interface BranchAttributes {
  id: number;
  owner_id: number;
  name: string;
  phone: string;
  address: string;
  createdAt?: Date;
  updatedAt?: Date;
  status: boolean;
}

export type BranchCreationAttributes = Optional<BranchAttributes,
  | "id" | "createdAt" | "updatedAt" | "status"
>;

export class Branch extends
  Model<BranchAttributes, BranchCreationAttributes> implements BranchAttributes {
  declare id: number;
  declare owner_id: number;
  declare name: string;
  declare phone: string;
  declare address: string;
  declare status: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Branch.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    owner_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    }
  },
  {
    sequelize,
    tableName: "branches",
    timestamps: true,
  });

// Branches связан лишь с одним владельцем
Branch.belongsTo(User, { as: "owner", foreignKey: "owner_id" });
Branch.beforeCreate(async (branch) => {
  const owner = await User.findByPk(branch.owner_id);
  if (!owner || owner.role !== "owner") {
    throw new Error("Branch owner must be a user with role 'user'");
  }
});

//Владелец может иметь несколько филиалов
User.hasMany(Branch, {
  as: "ownedBranches",
  foreignKey: "owner_id",
  scope: { role: "owner" },
});


export default Branch;