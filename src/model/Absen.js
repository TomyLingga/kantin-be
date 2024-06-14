var seq = require('sequelize');
var {sequelize} = require('../config/db_seq');

const DataTypes = seq.DataTypes;

const Karyawan = sequelize.define(
	'tbl_absen_kantin',
	{
		id : {
			type : DataTypes.NUMBER(32),
			primaryKey : true,
			autoIncrement : true
		},
        rfid : {
			type : DataTypes.STRING(100),
            allowNull: true
		},
        nrk : {
			type :DataTypes.STRING(100),
            allowNull: true
		},
        kategori : {
			type :DataTypes.STRING(100),
            allowNull: true
		},
        nama : {
			type :DataTypes.STRING(200),
            allowNull: true
		},
        instansi : {
			type :DataTypes.STRING(200),
            allowNull: true
		},
        sesi : {
			type :DataTypes.STRING(100),
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
        updatedAt: {
            type : DataTypes.DATE,
            allowNull: true
        }
	},
	{
		freezeTableName : true,
		timestamps : false
	}
)
module.exports = Karyawan;