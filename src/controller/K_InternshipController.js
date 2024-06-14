var express = require('express');
var {sequelize} = require('../config/db_seq');
var ZKLib = require('node-zklib');
var {QueryTypes} = require('sequelize');
var moment = require('moment');

const router = express.Router();

// Model
var Internship = require('../model/Internship');
var Kartu = require('../model/User_Kantin');

// Function Controller
const getAllKaryawan = async (req, res) => {
    // const request = req.params;
    try {
        const load = await Internship.findAll();
        res.send({"code":200, "data":load});
    } catch (err) {
        res.send({"code":401, "status":false});
    }
}

const createRfidCard = async (req, res) => {
    const request_body = req.body;
    const t = await sequelize.transaction(); // Start a transaction
    try {
        const load = await Internship.findOne({where:{barcode:request_body.rfid_code}});
        if (load != null) {
            res.send({"code":201, "msg": "Data sudah ada", "data":load});
        } else {
            const data = {
                barcode:request_body.rfid_code,
                nomor_induk:request_body.user_id,
                instansi:request_body.instansi,
                nama:request_body.nama,
                start_periode:null,
                end_periode:null,
                status:request_body.status,
            }
            const data2 = {
                user_id:request_body.user_id,
                status:request_body.status,
            }
            const post = await Internship.create(data, { transaction: t })
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
            barcode:request_body.rfid_code,
                nomor_induk:request_body.user_id,
                instansi:request_body.instansi,
                nama:request_body.nama,
                start_periode:null,
                end_periode:null,
                status:request_body.status,
        }
        await Internship.update(data, {where:{id: request_body.id}});
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
        await Internship.destroy({where:{id: request_body.id}, transaction: t});
        await Kartu.update(data, {where:{rfid_barcode: request_body.rfid_code}, transaction: t});
        await t.commit();
        res.send({"code":200, "msg": "Data berhasil disimpan"});
    } catch (err) {
        await t.rollback();
        res.send({"code":401, "msg": "Sistem error, silahkan di cek dibagian AksesController > updateRfidCard dan Database", "status":false});
    }
}

// Path
const path = '/v1/api/internship';

// Route
router.get(`${path}/karyawan-all`, getAllKaryawan);
router.post(`${path}/tambah-karyawan`, createRfidCard);
router.post(`${path}/edit-karyawan`, updateRfidCard);
router.post(`${path}/delete-karyawan`, deleteRfidCard);

module.exports = router;
