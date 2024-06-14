var seq = require('sequelize');
var {sequelize} = require('../config/db_seq');

const DataTypes = seq.DataTypes;

const Presensi = sequelize.define(
	'tbl_absen',
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
        logtime_finger: {
            type : DataTypes.DATE,
            allowNull: true
        },
        ip: {
            type : DataTypes.STRING(100),
            allowNull: true
        },
        create_at: {
            type : DataTypes.DATE,
            allowNull: true
        },
        update_at: {
            type : DataTypes.DATE,
            allowNull: true
        }
	},
	{
		freezeTableName : true,
		timestamps : false
	}
)
module.exports = Presensi;