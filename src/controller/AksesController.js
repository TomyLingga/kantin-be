var express = require('express');
var {sequelize} = require('../config/db_seq');
var ZKLib = require('node-zklib');
var {QueryTypes} = require('sequelize');
var Seq = require('sequelize');
var moment = require('moment');

const router = express.Router();

// Model
var Kartu = require('../model/User_Kantin');
// var Kartu = require('../model/Kartu');
var Karyawan = require('../model/Karyawan');
var Outsourcing = require('../model/Outsourcing');
var Internship = require('../model/Internship');

// Function Controller
const getAllRfidCard = async (req, res) => {
    // const request = req.params;
    try {
        const load = await Kartu.findAll();
        res.send({"code":200, "data":load});
    } catch (err) {
        res.send({"code":401, "status":false});
    }
}

const TestRfidCard = async (req, res) => {
    // const request = req.params;
    try {
        const load = await Kartu.findOne({
            where: { id_kartu: { [Seq.Op.like] : `%INL${moment(new Date).format('YYYYMMDD')}%`  }},
            order: [ [ 'id', 'DESC' ]]
        })

        let key;
        if (load != null) {
            key = Number(load.id_kartu.substring(load.id_kartu.length - 3))
        } else {
            key = 0
        }

        // const load = await Kartu.findAll();
        res.send({"code":200, "key": key, "data":load, "tgl": `INL${moment(new Date).format('YYYYMMDD')}`});
    } catch (err) {
        res.send({"code":401, "status":false});
    }
}

const checkPenggunaRfidCard = async (req, res) => {
    const request_body = req.body;
    try {
        const load = await Kartu.findOne({
            where: { rfid_barcode:request_body.rfid_code}
            // where: { rfid_code:request_body.rfid_code}
        })

        if (load != null) {
            let data;
            if (load.kategori == 'karyawan') {
                const get =  await Karyawan.findOne({
                    where: { rfid:request_body.rfid_code}
                })
                if (get != null) {
                    data = get
                } else {
                    data = {nama:'Belum ada', status:true}
                }
            } else if (load.kategori == 'outsource') {
                const get = await Outsourcing.findOne({
                    where: {barcode:request_body.rfid_code}
                })
                if (get != null) {
                    data = get
                } else {
                    data = {nama:'Belum ada', status:true}
                }
            } else if (load.kategori == 'internship') {
                const get = await Internship.findOne({
                    where: {barcode:request_body.rfid_code}
                })
                if (get != null) {
                    data = get
                } else {
                    data = {nama:'Belum ada', status:true}
                }
            } else {
                data = {nama:'Belum ada', status:true}
            }
            res.send({"code":200, "data":data , "kategori": load.kategori});
        } else {
            res.send({"code":201, "data":'kartu belum terdaftar di sistem'});
        }
    } catch (err) {
        res.send({"code":401, "status":false});
    }
}

const createRfidCard = async (req, res) => {
    const request_body = req.body;
    try {
        const load = await Kartu.findOne({
            // where:{rfid_code:request_body.rfid_code}
            where: { rfid_barcode:request_body.rfid_code}
        });
        if (load != null) {
            res.send({"code":201, "msg": "Data sudah ada", "data":load});
        } else {
            const data = {
                // rfid_code:request_body.rfid_code,
                rfid_barcode:request_body.rfid_code,
                user_id:'-',
                kategori:request_body.kategori,
                status:request_body.status,
            }
            const post = await Kartu.create(data);
            await post.save()
            res.send({"code":200, "msg": "Data berhasil disimpan"});
        }
    } catch (err) {
        res.send({"code":401, "msg": "Sistem error, silahkan di cek dibagian AksesController > createRfidCard dan Database", "status":false});
    }
}

const updateRfidCard = async (req, res) => {
    const request_body = req.body;
    try {
        const data = {
            // rfid_code:request_body.rfid_code,
            rfid_barcode:request_body.rfid_code,
            user_id:'-',
            kategori:request_body.kategori,
            status:request_body.status,
        }
        await Kartu.update(data, {where:{id: request_body.id}});
        res.send({"code":200, "msg": "Data berhasil disimpan"});
    } catch (err) {
        res.send({"code":401, "msg": "Sistem error, silahkan di cek dibagian AksesController > updateRfidCard dan Database", "status":false});
    }
}

// Path
const path = '/v1/api/akses';

// Route
router.get(`${path}/kartu-all`, getAllRfidCard);
router.get(`${path}/test`, TestRfidCard);
router.post(`${path}/cek`, checkPenggunaRfidCard);
router.post(`${path}/tambah-kartu`, createRfidCard);
router.post(`${path}/edit-kartu`, updateRfidCard);

module.exports = router;
