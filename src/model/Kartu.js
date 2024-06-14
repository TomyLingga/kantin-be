var seq = require('sequelize');
var {sequelize} = require('../config/db_seq');

const DataTypes = seq.DataTypes;

const Kartu = sequelize.define(
	'tbl_kartu_akses',
	{
		id : {
			type : DataTypes.NUMBER(32),
			primaryKey : true,
			autoIncrement : true
		},
		rfid_code : {
			type : DataTypes.STRING(100),
            allowNull: true
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
module.exports = Kartu;