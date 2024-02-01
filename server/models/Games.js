const {DataTypes} = require("sequelize")
const database = require("../database/index")

const Game = database.define('Games', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'games',
    timestamps: false
})

module.exports = Game