// const seq = require("sequelize");
const Sequelize = require("sequelize");
// const Sequelize = seq.Sequelize;
// import {user, db, password, host} from './env'

const conn = {};

const sequelize = new Sequelize('kantin', 'postgres', 'password', {
	host : 'localhost',
	dialect : 'postgres',
	port : '5432'
});

conn.sequelize = sequelize;
conn.Sequelize = Sequelize;

module.exports = conn;