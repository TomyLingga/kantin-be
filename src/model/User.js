var seq = require('sequelize');
var {sequelize} = require('../config/db_seq');

const DataTypes = seq.DataTypes;

const User = sequelize.define(
	'tbl_user',
	{
		id : {
			type : DataTypes.NUMBER,
			primaryKey : true,
			autoIncrement : true
		},
		name : {
			type : DataTypes.STRING(150),
            allowNull: true
		},
		jabatan : {
			type : DataTypes.STRING(150),
            allowNull: true
		},
        username : {
			type : DataTypes.STRING(50),
            allowNull: true
		},
		password : {
			type : DataTypes.STRING(100),
            allowNull: true
		},
		email : {
			type : DataTypes.STRING(100),
            allowNull: true
		},
        roles : {
			type : DataTypes.STRING(50),
            allowNull: true
		},
        active : {
			type : DataTypes.BOOLEAN,
            allowNull: true
		},
		createdAt : {
			type : DataTypes.DATE,
            allowNull: true
		},
        updatedAt : {
			type : DataTypes.DATE,
            allowNull: true
		}
	},
	{
		freezeTableName : true,
		timestamps : false
	}
)
module.exports = User;