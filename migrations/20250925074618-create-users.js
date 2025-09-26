'use strict';

const { DataTypes } = require('sequelize'); // импортируем типы

module.exports = {
  up: async ({ context: sequelize }) => {
    await sequelize.getQueryInterface().createTable('Users', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      role: {
        type: DataTypes.ENUM('admin', 'user'),
        allowNull: true,
        defaultValue: 'user',
      },
      email: {
        type: DataTypes.STRING(128),
        allowNull: false,
        unique: true,
      },
      branches: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      token: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      organizationName: {
        type: DataTypes.STRING(128),
        allowNull: false,
        unique: true,
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
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });
  },
  down: async ({ context: sequelize }) => {
    await sequelize.getQueryInterface().dropTable('Users');
  },
};