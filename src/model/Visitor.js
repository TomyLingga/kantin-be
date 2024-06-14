var seq = require('sequelize');
var {sequelize} = require('../config/db_seq');

const DataTypes = seq.DataTypes;

const Visitor = sequelize.define(
	'tbl_absen_visitor',
	{
		id : {
			type : DataTypes.NUMBER(32),
			primaryKey : true,
			autoIncrement : true
		},
        pic_visitor : {
			type : DataTypes.STRING(150),
            allowNull: true
		},
        keterangan : {
			type : DataTypes.TEXT,
            allowNull: true
		},
        tanggal: {
            type : DataTypes.DATE,
            allowNull: true
        },
        waktu: {
            type : DataTypes.TIME,
            allowNull: true
        },
        createdAt: {
            type : DataTypes.DATE,
            allowNull: true
        },
        updateAt: {
            type : DataTypes.DATE,
            allowNull: true
        },
        lembaga : {
			type : DataTypes.STRING(200),
            allowNull: true
		}
	},
	{
		freezeTableName : true,
		timestamps : false
	}
    
)
module.exports = Visitor;