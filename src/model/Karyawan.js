var seq = require('sequelize');
var {sequelize} = require('../config/db_seq');

const DataTypes = seq.DataTypes;

const Karyawan = sequelize.define(
	'tbl_karyawan',
	{
		id : {
			type : DataTypes.NUMBER(32),
			primaryKey : true,
			autoIncrement : true
		},
		nama : {
			type : DataTypes.STRING(200),
            allowNull: false
		},
		nrk : {
			type : DataTypes.STRING(100),
            allowNull: true
		},
        rfid : {
			type : DataTypes.STRING(100),
            allowNull: true
		},
		department : {
			type : DataTypes.STRING(200),
            allowNull: true
		},
		divisi : {
			type : DataTypes.STRING(200),
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
module.exports = Karyawan;