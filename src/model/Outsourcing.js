var seq = require('sequelize');
var {sequelize} = require('../config/db_seq');

const DataTypes = seq.DataTypes;

const Outsource = sequelize.define(
	'tbl_outsourcing',
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
		nomor_karyawan : {
			type : DataTypes.STRING(100),
            allowNull: true
		},
        barcode : {
			type : DataTypes.STRING(100),
            allowNull: true
		},
		instansi : {
			type : DataTypes.STRING(200),
            allowNull: true
		},
		bagian : {
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
module.exports = Outsource;