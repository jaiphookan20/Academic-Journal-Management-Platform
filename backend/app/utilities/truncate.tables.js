
const  sequelize = require("../models/db.js");
const {Client_Model, Client_Role_Model, Refresh_Token_Model} = require('../models/client.model.js');
const {Submission_Model, File_Model} = require('../models/submission.model.js');

async function truncateTables() {
    try {
        // Disable foreign key checks
        await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");

        // Truncate tables
        await Client_Model.destroy({ truncate: true });
        await Client_Role_Model.destroy({ truncate: true });
        await Refresh_Token_Model.destroy({ truncate: true });
        await Submission_Model.destroy({ truncate: true });
        await File_Model.destroy({ truncate: true });

        // Enable foreign key checks
        await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
        
    } catch (error) {
        console.error("Error truncating tables:", error);
        throw error;
    }
}

module.exports = truncateTables;