var seq = require('sequelize');
var {sequelize} = require('../config/db_seq');

const DataTypes = seq.DataTypes;

const userKantin = sequelize.define(
	'tbl_user_kantin',
	{
		id : {
			type : DataTypes.NUMBER(32),
			primaryKey : true,
			autoIncrement : true
		},
		user_id : {
			type : DataTypes.STRING(100),
            allowNull: true
		},
		rfid_barcode : {
			type : DataTypes.STRING(100),
            allowNull: false
		},
        kategori : {
			type : DataTypes.STRING(100),
            allowNull: true
		},
		status : {
			type : DataTypes.BOOLEAN,
            allowNull: true
		}
	},
	{
		freezeTableName : true,
		timestamps : false
	}
)
module.exports = userKantin;