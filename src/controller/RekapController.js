var express = require('express');
var {sequelize} = require('../config/db_seq');
var ZKLib = require('node-zklib');
var {QueryTypes} = require('sequelize');
var moment = require('moment');

const router = express.Router();

// Model
var Banding = require('../model/Banding');
var Absen = require('../model/Absen');

// Function Controller
const getBanding = async (req, res) => {
    const request = req.params;
    try {
        const data = await Banding.sequelize.query("SELECT * FROM tbl_banding WHERE tanggal BETWEEN :start AND :end ORDER BY tanggal DESC",
        {
            replacements: { start: request.start, end: request.end},
            type: QueryTypes.SELECT
        })
        // res.send({"code":200, "msg":'success', status:true});
        res.send({"code":200, "data":data, "status":true});
    } catch (e) {
        // await trans.rollback()
        res.send({"code":400, "msg":'failed', status:false});
    }
}

const getPengunjungKantin = async (req, res) => {
    const request = req.params;
    try {
        const data = await Absen.sequelize.query("SELECT * FROM tbl_absen_kantin WHERE tanggal BETWEEN :start AND :end ORDER BY tanggal DESC",
        {
            replacements: { start: request.start, end: request.end},
            type: QueryTypes.SELECT
        })
        // res.send({"code":200, "msg":'success', status:true});
        res.send({"code":200, "data":data, "status":true});
    } catch (e) {
        // await trans.rollback()
        res.send({"code":400, "msg":'failed', status:false});
    }
}

// Path
const path = '/v1/api/rekap';

// Route
router.get(`${path}/banding/:start/:end`, getBanding);
router.get(`${path}/user/:start/:end`, getPengunjungKantin);

module.exports = router;
