var express = require('express');
var {sequelize} = require('../config/db_seq');
var ZKLib = require('node-zklib');
var {QueryTypes} = require('sequelize');
var moment = require('moment');

const router = express.Router();

// Model
var Karyawan = require('../model/Karyawan');
var Kartu = require('../model/User_Kantin');

// Function Controller
const getAllKaryawan = async (req, res) => {
    // const request = req.params;
    try {
        const load = await Karyawan.findAll();
        res.send({"code":200, "data":load});
    } catch (err) {
        res.send({"code":401, "status":false});
    }
}

const createRfidCard = async (req, res) => {
    const request_body = req.body;
    const t = await sequelize.transaction(); // Start a transaction
    try {
        const load = await Karyawan.findOne({where:{rfid:request_body.rfid_code}});
        if (load != null) {
            res.send({"code":201, "msg": "Data sudah ada", "data":load});
        } else {
            const data = {
                rfid:request_body.rfid_code,
                nama:request_body.nama,
                nrk:request_body.user_id,
                department:null,
                divisi:null,
                status:request_body.status,
            }
            
            const data2 = {
                user_id:request_body.user_id,
                status:request_body.status,
            }
            const post = await Karyawan.create(data, { transaction: t })
            await Kartu.update(data2, {where:{rfid_barcode: request_body.rfid_code}, transaction: t});
            await t.commit();
            res.send({"code":200, "msg": "Data berhasil disimpan"});
        }
    } catch (err) {
        await t.rollback();
        res.send({"code":401, "msg": "Sistem error, silahkan di cek dibagian AksesController > createRfidCard dan Database", "status":false});
    }
}

const updateRfidCard = async (req, res) => {
    const request_body = req.body;
    try {
        const data = {
            rfid:request_body.rfid_code,
            nama:request_body.nama,
            nrk:request_body.user_id,
            department:null,
            divisi:null,
            status:request_body.status,
        }
        await Karyawan.update(data, {where:{id: request_body.id}});
        res.send({"code":200, "msg": "Data berhasil disimpan"});
    } catch (err) {
        res.send({"code":401, "msg": "Sistem error, silahkan di cek dibagian AksesController > updateRfidCard dan Database", "status":false});
    }
}

const deleteRfidCard = async (req, res) => {
    const request_body = req.body;
    const t = await sequelize.transaction(); // Start a transaction
    try {
        const data = {
            status:false,
            user_id:'-',
        }
        await Karyawan.destroy({where:{id: request_body.id}, transaction: t});
        await Kartu.update(data, {where:{rfid_barcode: request_body.rfid_code}, transaction: t});
        await t.commit();
        res.send({"code":200, "msg": "Data berhasil disimpan"});
    } catch (err) {
        await t.rollback();
        res.send({"code":401, "msg": "Sistem error, silahkan di cek dibagian AksesController > updateRfidCard dan Database", "status":false});
    }
}

// Path
const path = '/v1/api/internal';

// Route
router.get(`${path}/karyawan-all`, getAllKaryawan);
router.post(`${path}/tambah-karyawan`, createRfidCard);
router.post(`${path}/edit-karyawan`, updateRfidCard);
router.post(`${path}/delete-karyawan`, deleteRfidCard);

module.exports = router;
