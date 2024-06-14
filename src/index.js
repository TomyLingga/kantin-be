var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser')
var morgan = require('morgan');
var moment = require('moment');

// Get Controller
var UserController = require('./controller/UserController');
var AbsenController = require('./controller/AbsenController');
var KaryawanController = require('./controller/KaryawanController');
var DashController = require('./controller/DashController');

var AksesController = require('./controller/AksesController');
var K_InternalController = require('./controller/K_InternalController');
var K_InternshipController = require('./controller/K_InternshipController');
var K_OutsourceController = require('./controller/K_OutsourceController');
var PresenceController = require('./controller/PresenceController');
var RekapController = require('./controller/RekapController');

// Get Database Connection
var {sequelize} = require('./config/db_seq');

var port = 3021;
var app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({extended:false}));
app.use(morgan('short'));

// Database Check Condition
try {
    sequelize.authenticate();
    console.log("Database Connected!");
} catch (err) {
    console.log("Database Disconnected!");
    console.log(err);
}
const tgl_sekarang = new Date();
console.log(moment(tgl_sekarang).format('YYYYMMDD'));

// Controller Used
app.use(UserController);
app.use(AbsenController);
app.use(KaryawanController);
app.use(DashController);

app.use(AksesController);
app.use(K_InternalController);
app.use(K_InternshipController);
app.use(K_OutsourceController);
app.use(PresenceController);
app.use(RekapController);

// Listen Port Running Execution
app.listen(port, () => {
    console.log('API Running on Port '+port);
})