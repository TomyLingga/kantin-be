var seq = require('sequelize');
var {sequelize} = require('../config/db_seq');

const DataTypes = seq.DataTypes;

const Banding = sequelize.define(
	'tbl_banding',
	{
		id : {
			type : DataTypes.NUMBER(32),
			primaryKey : true,
			autoIncrement : true
		},
        tanggal: {
            type : DataTypes.DATE,
            allowNull: true
        },
        jumlah : {
			type : DataTypes.NUMBER,
            allowNull: true
		}
	},
	{
		freezeTableName : true,
		timestamps : false
	}
    
)
module.exports = Banding;