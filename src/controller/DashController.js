var express = require('express');
var {sequelize} = require('../config/db_seq');
var ZKLib = require('node-zklib');
var {QueryTypes} = require('sequelize');
var moment = require('moment');

const router = express.Router();

// Model
var Karyawan = require('../model/Karyawan');
var Internship = require('../model/Internship');
var Outsource = require('../model/Outsourcing');
var userKantin = require('../model/User_Kantin');
var Visitor = require('../model/Visitor');

const getCountForCards = async (req, res) => {
    const request = req.params;
    try {
        const karyawan = await userKantin.sequelize.query("SELECT COUNT(*) FROM tbl_absen_kantin tak JOIN tbl_karyawan kar ON kar.nrk = tak.nrk WHERE tak.tanggal >= :start AND tak.tanggal <= :end",
        {
            replacements: { start: request.start, end: request.end },
            type: QueryTypes.SELECT
        });
        const internship = await userKantin.sequelize.query("SELECT COUNT(*) FROM tbl_absen_kantin tak JOIN tbl_internship kar ON kar.nomor_induk = tak.nrk WHERE tak.tanggal >= :start AND tak.tanggal <= :end",
        {
            replacements: { start: request.start, end: request.end },
            type: QueryTypes.SELECT
        });
        const outsource = await userKantin.sequelize.query("SELECT COUNT(*) FROM tbl_absen_kantin tak JOIN tbl_outsourcing kar ON kar.nomor_karyawan = tak.nrk WHERE tak.tanggal >= :start AND tak.tanggal <= :end",
        {
            replacements: { start: request.start, end: request.end },
            type: QueryTypes.SELECT
        });
        //const visitor = await Visitor.sequelize.query("SELECT COUNT(*) FROM tbl_absen_visitor tak JOIN tbl_outsourcing kar ON kar.nomor_karyawan = tak.nrk WHERE tak.tanggal >= :start AND tak.tanggal <= :end",
        const visitor = await Visitor.sequelize.query("SELECT COUNT(*) FROM tbl_absen_visitor WHERE tanggal >= :start AND tanggal <= :end", 
        {
            replacements: { start: request.start, end: request.end },
            type: QueryTypes.SELECT
        });
        const data = {
            karyawan: karyawan[0].count,
            internship: internship[0].count,
            outsource: outsource[0].count,
            visitor: visitor[0].count
        }
        res.send({"code":200, "data":data});
    } catch (err) {
        console.log(err)
    }
}

const getDivisiByDept = async (req, res) => {
    const request = req.params;
    try {
        const load = await Karyawan.sequelize.query("SELECT DISTINCT divisi FROM tbl_karyawan WHERE department = :dept",
        {
            replacements: { dept: request.dept},
            type: QueryTypes.SELECT
        });
        res.send({"code":200, "data":load});
    } catch (err) {
        console.log(err)
    }
}

// Path
const path = '/v1/api/dash';

// Route
router.get(`${path}/cards/:start/:end`, getCountForCards);

module.exports = router;