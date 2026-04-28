"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await Promise.all([
      queryInterface.addColumn("associations", "facebook", {
        type: Sequelize.STRING(500),
        allowNull: true,
      }),
      queryInterface.addColumn("associations", "instagram", {
        type: Sequelize.STRING(500),
        allowNull: true,
      }),
      queryInterface.addColumn("associations", "twitter", {
        type: Sequelize.STRING(500),
        allowNull: true,
      }),
      queryInterface.addColumn("associations", "linkedin", {
        type: Sequelize.STRING(500),
        allowNull: true,
      }),
      queryInterface.addColumn("associations", "website", {
        type: Sequelize.STRING(500),
        allowNull: true,
      }),
    ]);
  },

  async down(queryInterface) {
    await Promise.all([
      queryInterface.removeColumn("associations", "website"),
      queryInterface.removeColumn("associations", "linkedin"),
      queryInterface.removeColumn("associations", "twitter"),
      queryInterface.removeColumn("associations", "instagram"),
      queryInterface.removeColumn("associations", "facebook"),
    ]);
  },
};
