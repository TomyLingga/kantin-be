var express = require('express');
var ZKLib = require('node-zklib');
var {QueryTypes, where} = require('sequelize');
var moment = require('moment');
var momenttz = require('moment-timezone');

const router = express.Router();

// Model
var Absen = require('../model/Absen');
var Presensi = require('../model/Presensi');
var Karyawan = require('../model/Karyawan');
var Internship = require('../model/Internship');
var Outsource = require('../model/Outsourcing');
var userKantin = require('../model/User_Kantin');
var Visitor = require('../model/Visitor');

// Function Controller
const getAllAbsenKantin = async (req, res) => {
    // const request = req.params;
    try {
        const load = await Absen.findAll();
        res.send({"code":200, "data":load});
    } catch (err) {
        res.send({"code":404, "msg":"Error"});
        console.log(err)
    }
}

const getReportAbsenKantin = async (req, res) => {
    const request = req.body;
    try {
        var load;
        if (request.dept == 'all') {
            load = await Absen.sequelize.query('SELECT ky.nama AS nama, ky.divisi AS divisi, ky.department AS department, ak.nrk AS nrk, ak.tanggal AS tanggal, ak.waktu AS waktu FROM tbl_absen_kantin ak JOIN tbl_karyawan ky ON ak.nrk = ky.nrk WHERE ak.tanggal BETWEEN :start AND :end',
            {
                replacements: { start: request.start, end: request.end},
                type: QueryTypes.SELECT
            });
        } else {
            load = await Absen.sequelize.query('SELECT ky.nama AS nama, ky.divisi AS divisi, ky.department AS department, ak.nrk AS nrk, ak.tanggal AS tanggal, ak.waktu AS waktu FROM tbl_absen_kantin ak JOIN tbl_karyawan ky ON ak.nrk = ky.nrk WHERE ky.department IN (:dept) AND ak.tanggal BETWEEN :start AND :end',
            {
                replacements: { start: request.start, end: request.end, dept: request.dept },
                type: QueryTypes.SELECT
            });
        }
        res.send({"code":200, "data":load});
    } catch (err) {
        res.send({"code":404, "msg":"Error"});
        console.log(err)
    }
}

const getReportAbsenVisitor = async (req, res) => {
    const request = req.body;
    try {
        const load = await Visitor.sequelize.query('SELECT COUNT(id), pic_visitor, tanggal, waktu, lembaga FROM tbl_absen_visitor WHERE tanggal BETWEEN :start AND :end GROUP BY pic_visitor, tanggal, waktu, lembaga ORDER BY tanggal DESC',
        {
            replacements: { start: request.start, end: request.end},
            type: QueryTypes.SELECT
        });
        res.send({"code":200, "data":load});
    } catch (err) {
        res.send({"code":404, "msg":"Error"});
        console.log(err)
    }
}

const getReportAbsenVisitor2 = async (req, res) => {
    const request = req.body;
    try {
        const load = await Visitor.sequelize.query(`SELECT COUNT(id), pic_visitor, tanggal, waktu, lembaga FROM tbl_absen_visitor WHERE DATE("createdAt" AT TIME ZONE 'Asia/Jakarta') = DATE(NOW()) GROUP BY pic_visitor, tanggal, waktu, lembaga, DATE("createdAt" AT TIME ZONE 'Asia/Jakarta') ORDER BY DATE("createdAt" AT TIME ZONE 'Asia/Jakarta') DESC`,
        {
            // replacements: { start: request.start, end: request.end},
            type: QueryTypes.SELECT
        });
        res.send({"code":200, "data":load});
    } catch (err) {
        res.send({"code":404, "msg":"Error"});
        console.log(err)
    }
}

// const getTodayAbsenKantin = async (req, res) => {
//     const request = req.params;
//     try {
//         const load = await Absen.sequelize.query('SELECT * FROM tbl_absen_kantin WHERE tanggal BETWEEN :start AND :end ORDER BY tanggal DESC',
//         {
//             replacements: { start: request.start, end: request.end},
//             type: QueryTypes.SELECT
//         });
//         const data = [];
//         for (let i = 0; i < load.length; i++) {
//             let nama_user, kategori, instansi;
//             if (load[i].kategori == 'karyawan') {
//                 const karyawan = await Karyawan.findOne({where:{nrk:load[i].nrk}});
//                 nama_user = karyawan.nama;
//                 kategori = "Karyawan Internal";
//                 instansi = "PT. Industri Nabati Lestari";
//             } else if (load[i].kategori == 'outsource') {
//                 const outsource = await Outsource.findOne({where:{nomor_karyawan:load[i].nrk}});
//                 nama_user = outsource.nama;
//                 kategori = "Karyawan Outsource";
//                 // instansi = outsource.instansi;
//                 instansi = 'outsource.instansi';
//             } else {
//                 // const internship = await Internship.findOne({where:{nomor_induk:load[i].nrk}});
//                 nama_user = 'internship.nama';
//                 kategori = "Magang";
//                 instansi = 'internship.instansi';
//             }
//             data[i] = {
//                 nrk: load[i].nrk,
//                 nama: nama_user,
//                 waktu: load[i].waktu,
//                 tanggal: load[i].tanggal,
//                 instansi: instansi,
//                 kategori: kategori
//             }
//         }
//         res.send({"code":200, "data":data});
//     } catch (err) {
//         res.send({"code":404, "msg":"Error"});
//         console.log(err)
//     }
// }

const getTodayAbsenKantin = async (req, res) => {
    const request = req.params;
    try {
        const load = await Absen.sequelize.query(`
        SELECT nrk, tanggal, waktu, rfid, kategori,

        CASE d.kategori
            WHEN 'karyawan' THEN
                (SELECT nama FROM tbl_karyawan b WHERE b.nrk = d.nrk LIMIT 1)
            WHEN 'outsource' THEN
                (SELECT nama FROM tbl_outsourcing f WHERE f.nomor_karyawan = d.nrk LIMIT 1)
            ELSE
                (SELECT nama FROM tbl_internship h WHERE h.nomor_induk = d.nrk LIMIT 1)
        END AS nama,

        CASE d.kategori
            WHEN 'karyawan' THEN
                'PT. Industri Nabati Lestari'
            WHEN 'outsource' THEN
                (SELECT f.instansi FROM tbl_outsourcing f WHERE f.nomor_karyawan = d.nrk LIMIT 1)
            ELSE
                (SELECT h.instansi FROM tbl_internship h WHERE h.nomor_induk = d.nrk LIMIT 1)
        END AS instansi,

        CASE d.kategori
            WHEN 'karyawan' THEN
                'Karyawan Internal'
            WHEN 'outsource' THEN
                'Karyawan Outsource'
            ELSE
                'Magang'
        END AS kategori

        FROM tbl_absen_kantin d WHERE tanggal BETWEEN :start AND :end ORDER BY tanggal DESC
        `,
        {
            replacements: { start: request.start, end: request.end},
            type: QueryTypes.SELECT
        });
        
        res.send({"code":200, "data":load});
    } catch (err) {
        res.send({"code":404, "msg":"Error"});
        console.log(err)
    }
}

const getAbsenKantinPerMonth = async (req, res) => {
    // const request = req.params;
    try {
        const load = await Absen.sequelize.query('SELECT ky.nama AS nama, ky.divisi AS divisi, ky.department AS department, ak.nrk AS nrk, ak.tanggal AS tanggal, ak.waktu AS waktu FROM tbl_absen_kantin ak JOIN tbl_karyawan ky ON ak.nrk = ky.nrk WHERE tanggal = DATE(NOW()) ',
        {
            type: QueryTypes.SELECT
        });
        res.send({"code":200, "data":load});
    } catch (err) {
        res.send({"code":404, "msg":"Error"});
        console.log(err)
    }
}

const getSessionAbsenKantin = async (req, res) => {
    // const request = req.params;
    // const tgl_now = new Date();
    try {
        let nama;
        const load = await Absen.sequelize.query(`SELECT * FROM tbl_absen_kantin WHERE DATE("tanggal" AT TIME ZONE 'Asia/Jakarta') = DATE(NOW() AT TIME ZONE 'Asia/Jakarta') ORDER BY tanggal, waktu DESC LIMIT 10`,
        // const load = await Absen.sequelize.query('SELECT ky.nama AS nama, ky.divisi AS divisi, ky.department AS department, ak.nrk AS nrk, ak.tanggal AS tanggal, ak.waktu AS waktu FROM tbl_absen_kantin ak JOIN tbl_karyawan ky ON ak.nrk = ky.nrk WHERE tanggal = DATE(NOW()) ORDER BY tanggal, waktu DESC LIMIT 10',
        {
          type: QueryTypes.SELECT
        });

        const data = [];
        for (let i = 0; i < load.length; i++) {
            const karyawan = await Karyawan.findOne({where:{ nrk:load[i].nrk}});
            const internship = await Internship.findOne({where:{ nomor_induk:load[i].nrk}});
            const outsource = await Outsource.findOne({where:{ nomor_karyawan:load[i].nrk}});
            if (karyawan != null) {
                nama = karyawan.nama;
            } else if (internship != null){
                nama = internship.nama;
            } else {
                nama = outsource.nama;
            }
            data[i]= {
                nrk: load[i].nrk,
                nama: nama,
                waktu: load[i].waktu
            }
        }
        res.send({"code":200, "data":data});
    } catch (err) {
        res.send({"code":404, "msg":"Error"});
        console.log(err)
    }
}

const postAbsenKantin = async (req, res) => {
    const request = req.body;
    try {
        const tgl_now = new Date();
        const hadir = await Absen.sequelize.query('SELECT * FROM tbl_absen_kantin WHERE rfid = :rfid AND tanggal = :tgl ORDER BY tanggal, waktu DESC',
        {
            replacements: { rfid: request.rfid, tgl: moment(tgl_now).format("YYYY-MM-DD")},
            type: QueryTypes.SELECT
        });
        // console.log(hadir);
        var msg, status;

        let view, rekap_user, absens;
        const usr = await userKantin.findOne({where:{rfid_barcode:request.rfid}});
        if (usr.kategori == 'karyawan') {
            rekap_user = await Karyawan.findOne({where:{nrk:usr.user_id}});
            if (moment(tgl_now).format("HH:mm:ss") >= '11:00:00' && moment(tgl_now).format("HH:mm:ss") <= '14:00:00') {
                if (hadir.length > 0 && hadir.length < 3) {
                    if (moment(hadir[0].createdAt).format("HH:mm:ss") >= '11:00:00' && moment(hadir[0].createdAt).format("HH:mm:ss") <= '14:00:00') {
                        msg = "Anda Sudah Tapping Absen di Sesi 1, Selamat Makan :)";
                        status = 1;
                    } else {
                        const created = await Absen.create({
                            rfid: request.rfid,
                            nrk: usr.user_id,
                            createdAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                            updatedAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                            tanggal : moment(tgl_now).format("YYYY-MM-DD"),
                            waktu : moment(tgl_now).format("HH:mm:ss"),
                            kategori: usr.kategori
                        });
                        await created.save();
                        msg = "Akses diterima, Selamat Makan :)";
                        status = 0;
                    }
                } else {
                    const created = await Absen.create({
                        rfid: request.rfid,
                        nrk: usr.user_id,
                        createdAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                        updatedAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                        tanggal : moment(tgl_now).format("YYYY-MM-DD"),
                        waktu : moment(tgl_now).format("HH:mm:ss"),
                        kategori: usr.kategori
                    });
                    await created.save();
                    msg = "Akses diterima, Selamat Makan :)";
                    status = 0;
                }
            } else if (moment(tgl_now).format("HH:mm:ss") >= '18:00:00' && moment(tgl_now).format("HH:mm:ss") <= '20:30:00') {
                if (hadir.length > 0 && hadir.length < 3) {
                    if (moment(hadir[0].createdAt).format("HH:mm:ss") >= '18:00:00' && moment(hadir[0].createdAt).format("HH:mm:ss") <= '20:30:00') {
                        msg = "Anda Sudah Tapping Absen di Sesi 2, Selamat Makan :)";
                        status = 1;
                    } else {
                        const created = await Absen.create({
                            rfid: request.rfid,
                            nrk: usr.user_id,
                            createdAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                            updatedAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                            tanggal : moment(tgl_now).format("YYYY-MM-DD"),
                            waktu : moment(tgl_now).format("HH:mm:ss"),
                            kategori: usr.kategori
                        });
                        await created.save();
                        msg = "Akses diterima, Selamat Makan :)";
                        status = 0;
                    }
                } else {
                    const created = await Absen.create({
                        rfid: request.rfid,
                        nrk: usr.user_id,
                        createdAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                        updatedAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                        tanggal : moment(tgl_now).format("YYYY-MM-DD"),
                        waktu : moment(tgl_now).format("HH:mm:ss"),
                        kategori: usr.kategori
                    });
                    await created.save();
                    msg = "Akses diterima, Selamat Makan :)";
                    status = 0;
                }
            } else if (moment(tgl_now).format("HH:mm:ss") >= '23:00:00' && moment(tgl_now).format("HH:mm:ss") <= '23:59:59') {
                if (hadir.length > 0 && hadir.length < 3) {
                    if (moment(hadir[0].createdAt).format("HH:mm:ss") >= '23:00:00' && moment(hadir[0].createdAt).format("HH:mm:ss") <= '23:59:59') {
                        msg = "Anda Sudah Tapping Absen di Sesi 3, Selamat Makan :)";
                        status = 1;
                    } else {
                        const created = await Absen.create({
                            rfid: request.rfid,
                            nrk: usr.user_id,
                            createdAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                            updatedAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                            tanggal : moment(tgl_now).format("YYYY-MM-DD"),
                            waktu : moment(tgl_now).format("HH:mm:ss"),
                            kategori: usr.kategori
                        });
                        await created.save();
                        msg = "Akses diterima, Selamat Makan :)";
                        status = 0;
                    }
                } else {
                    const created = await Absen.create({
                        rfid: request.rfid,
                        nrk: usr.user_id,
                        createdAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                        updatedAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                        tanggal : moment(tgl_now).format("YYYY-MM-DD"),
                        waktu : moment(tgl_now).format("HH:mm:ss"),
                        kategori: usr.kategori
                    });
                    await created.save();
                    msg = "Akses diterima, Selamat Makan :)";
                    status = 0;
                }
            } else if (moment(tgl_now).format("HH:mm:ss") >= '00:00:00' && moment(tgl_now).format("HH:mm:ss") <= '01:30:00') {
                if (hadir.length > 0 && hadir.length < 3) {
                    if (hadir[0].waktu >= '00:00:00' && hadir[0].waktu <= '01:30:00') {
                        msg = "Anda Sudah Tapping Absen di Sesi 3, Selamat Makan :)";
                        status = 1;
                    } else {
                        const created = await Absen.create({
                            rfid: request.rfid,
                            nrk: usr.user_id,
                            createdAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                            updatedAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                            tanggal : moment(tgl_now).format("YYYY-MM-DD"),
                            waktu : moment(tgl_now).format("HH:mm:ss"),
                            kategori: usr.kategori
                        });
                        await created.save();
                        msg = "Akses diterima, Selamat Makan :)";
                        status = 0;
                    }
                } else {
                    const created = await Absen.create({
                        rfid: request.rfid,
                        nrk: usr.user_id,
                        createdAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                        updatedAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                        tanggal : moment(tgl_now).format("YYYY-MM-DD"),
                        waktu : moment(tgl_now).format("HH:mm:ss"),
                        kategori: usr.kategori
                    });
                    await created.save();
                    msg = "Akses diterima, Selamat Makan :)";
                    status = 0;
                }
            } else {
                if (moment(tgl_now).format("YYYYMMDD") >= '20230323' && moment(tgl_now).format("YYYYMMDD") <= '20230422') {
                    if (moment(tgl_now).format("HH:mm:ss") >= '15:00:00' && moment(tgl_now).format("HH:mm:ss") <= '18:30:00') {
                        if (hadir.length > 0 && hadir.length < 3) {
                            if (hadir[0].waktu >= '15:00:00' && hadir[0].waktu <= '18:30:00') {
                                msg = "Anda Sudah Tapping Absen di Sesi 1, Selamat Makan :)";
                                status = 1;
                            } else {
                                const created = await Absen.create({
                                    rfid: request.rfid,
                                    nrk: usr.user_id,
                                    createdAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                                    updatedAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                                    tanggal : moment(tgl_now).format("YYYY-MM-DD"),
                                    waktu : moment(tgl_now).format("HH:mm:ss"),
                                    kategori: usr.kategori
                                });
                                await created.save();
                                msg = "Akses diterima, Selamat Makan :)";
                                status = 0;
                            }
                        } else {
                            const created = await Absen.create({
                                rfid: request.rfid,
                                nrk: usr.user_id,
                                createdAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                                updatedAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                                tanggal : moment(tgl_now).format("YYYY-MM-DD"),
                                waktu : moment(tgl_now).format("HH:mm:ss"),
                                kategori: usr.kategori
                            });
                            await created.save();
                            msg = "Akses diterima, Selamat Makan :)";
                            status = 0;
                        }
                    } else if (moment(tgl_now).format("HH:mm:ss") >= '02:30:00' && moment(tgl_now).format("HH:mm:ss") <= '04:30:00') {
                        if (hadir.length > 0 && hadir.length < 3) {
                            if (hadir[0].waktu >= '02:30:00' && hadir[0].waktu <= '04:30:00') {
                                msg = "Anda Sudah Tapping Absen di Sesi 3, Selamat Makan :)";
                                status = 1;
                            } else {
                                const created = await Absen.create({
                                    rfid: request.rfid,
                                    nrk: usr.user_id,
                                    createdAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                                    updatedAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                                    tanggal : moment(tgl_now).format("YYYY-MM-DD"),
                                    waktu : moment(tgl_now).format("HH:mm:ss"),
                                    kategori: usr.kategori
                                });
                                await created.save();
                                msg = "Akses diterima, Selamat Makan :)";
                                status = 0;
                            }
                        } else {
                            const created = await Absen.create({
                                rfid: request.rfid,
                                nrk: usr.user_id,
                                createdAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                                updatedAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                                tanggal : moment(tgl_now).format("YYYY-MM-DD"),
                                waktu : moment(tgl_now).format("HH:mm:ss"),
                                kategori: usr.kategori
                            });
                            await created.save();
                            msg = "Akses diterima, Selamat Makan :)";
                            status = 0;
                        }
                    } else {
                        msg = "Anda Tapping di Luar Waktu Yang di tentukan !";
                        status = 1;
                    }
                } else {
                    msg = "Anda Tapping di Luar Waktu Yang di tentukan !";
                    status = 1;
                }
            }
        } else if (usr.kategori == 'outsource') {
            rekap_user = await Outsource.findOne({where:{nomor_karyawan:usr.user_id}});
            if (moment(tgl_now).format("HH:mm:ss") >= '11:00:00' && moment(tgl_now).format("HH:mm:ss") <= '14:00:00') {
                if (hadir.length > 0 && hadir.length < 3) {
                    if (moment(hadir[0].createdAt).format("HH:mm:ss") >= '11:00:00' && moment(hadir[0].createdAt).format("HH:mm:ss") <= '14:00:00') {
                        msg = "Anda Sudah Tapping Absen di Sesi 1, Selamat Makan :)";
                        status = 1;
                    } else {
                        const created = await Absen.create({
                            rfid: request.rfid,
                            nrk: usr.user_id,
                            createdAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                            updatedAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                            tanggal : moment(tgl_now).format("YYYY-MM-DD"),
                            waktu : moment(tgl_now).format("HH:mm:ss"),
                            kategori: usr.kategori
                        });
                        await created.save();
                        msg = "Akses diterima, Selamat Makan :)";
                        status = 0;
                    }
                } else {
                    const created = await Absen.create({
                        rfid: request.rfid,
                        nrk: usr.user_id,
                        createdAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                        updatedAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                        tanggal : moment(tgl_now).format("YYYY-MM-DD"),
                        waktu : moment(tgl_now).format("HH:mm:ss"),
                        kategori: usr.kategori
                    });
                    await created.save();
                    msg = "Akses diterima, Selamat Makan :)";
                    status = 0;
                }
            } else if (moment(tgl_now).format("HH:mm:ss") >= '18:00:00' && moment(tgl_now).format("HH:mm:ss") <= '20:30:00') {
                if (hadir.length > 0 && hadir.length < 3) {
                    if (moment(hadir[0].createdAt).format("HH:mm:ss") >= '18:00:00' && moment(hadir[0].createdAt).format("HH:mm:ss") <= '20:30:00') {
                        msg = "Anda Sudah Tapping Absen di Sesi 2, Selamat Makan :)";
                        status = 1;
                    } else {
                        const created = await Absen.create({
                            rfid: request.rfid,
                            nrk: usr.user_id,
                            createdAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                            updatedAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                            tanggal : moment(tgl_now).format("YYYY-MM-DD"),
                            waktu : moment(tgl_now).format("HH:mm:ss"),
                            kategori: usr.kategori
                        });
                        await created.save();
                        msg = "Akses diterima, Selamat Makan :)";
                        status = 0;
                    }
                } else {
                    const created = await Absen.create({
                        rfid: request.rfid,
                        nrk: usr.user_id,
                        createdAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                        updatedAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                        tanggal : moment(tgl_now).format("YYYY-MM-DD"),
                        waktu : moment(tgl_now).format("HH:mm:ss"),
                        kategori: usr.kategori
                    });
                    await created.save();
                    msg = "Akses diterima, Selamat Makan :)";
                    status = 0;
                }
            } else if (moment(tgl_now).format("HH:mm:ss") >= '23:00:00' && moment(tgl_now).format("HH:mm:ss") <= '23:59:59') {
                if (hadir.length > 0 && hadir.length < 3) {
                    if (moment(hadir[0].createdAt).format("HH:mm:ss") >= '23:00:00' && moment(hadir[0].createdAt).format("HH:mm:ss") <= '23:59:59') {
                        msg = "Anda Sudah Tapping Absen di Sesi 3, Selamat Makan :)";
                        status = 1;
                    } else {
                        const created = await Absen.create({
                            rfid: request.rfid,
                            nrk: usr.user_id,
                            createdAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                            updatedAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                            tanggal : moment(tgl_now).format("YYYY-MM-DD"),
                            waktu : moment(tgl_now).format("HH:mm:ss"),
                            kategori: usr.kategori
                        });
                        await created.save();
                        msg = "Akses diterima, Selamat Makan :)";
                        status = 0;
                    }
                } else {
                    const created = await Absen.create({
                        rfid: request.rfid,
                        nrk: usr.user_id,
                        createdAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                        updatedAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                        tanggal : moment(tgl_now).format("YYYY-MM-DD"),
                        waktu : moment(tgl_now).format("HH:mm:ss"),
                        kategori: usr.kategori
                    });
                    await created.save();
                    msg = "Akses diterima, Selamat Makan :)";
                    status = 0;
                }
            } else if (moment(tgl_now).format("HH:mm:ss") >= '00:00:00' && moment(tgl_now).format("HH:mm:ss") <= '01:30:00') {
                if (hadir.length > 0 && hadir.length < 3) {
                    if (hadir[0].waktu >= '00:00:00' && hadir[0].waktu <= '01:30:00') {
                        msg = "Anda Sudah Tapping Absen di Sesi 3, Selamat Makan :)";
                        status = 1;
                    } else {
                        const created = await Absen.create({
                            rfid: request.rfid,
                            nrk: usr.user_id,
                            createdAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                            updatedAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                            tanggal : moment(tgl_now).format("YYYY-MM-DD"),
                            waktu : moment(tgl_now).format("HH:mm:ss"),
                            kategori: usr.kategori
                        });
                        await created.save();
                        msg = "Akses diterima, Selamat Makan :)";
                        status = 0;
                    }
                } else {
                    const created = await Absen.create({
                        rfid: request.rfid,
                        nrk: usr.user_id,
                        createdAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                        updatedAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                        tanggal : moment(tgl_now).format("YYYY-MM-DD"),
                        waktu : moment(tgl_now).format("HH:mm:ss"),
                        kategori: usr.kategori
                    });
                    await created.save();
                    msg = "Akses diterima, Selamat Makan :)";
                    status = 0;
                }
            } else {
                if (moment(tgl_now).format("YYYYMMDD") >= '20230323' && moment(tgl_now).format("YYYYMMDD") <= '20230422') {
                    if (moment(tgl_now).format("HH:mm:ss") >= '15:00:00' && moment(tgl_now).format("HH:mm:ss") <= '18:30:00') {
                        if (hadir.length > 0 && hadir.length < 3) {
                            if (hadir[0].waktu >= '15:00:00' && hadir[0].waktu <= '18:30:00') {
                                msg = "Anda Sudah Tapping Absen di Sesi 1, Selamat Makan :)";
                                status = 1;
                            } else {
                                const created = await Absen.create({
                                    rfid: request.rfid,
                                    nrk: usr.user_id,
                                    createdAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                                    updatedAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                                    tanggal : moment(tgl_now).format("YYYY-MM-DD"),
                                    waktu : moment(tgl_now).format("HH:mm:ss"),
                                    kategori: usr.kategori
                                });
                                await created.save();
                                msg = "Akses diterima, Selamat Makan :)";
                                status = 0;
                            }
                        } else {
                            const created = await Absen.create({
                                rfid: request.rfid,
                                nrk: usr.user_id,
                                createdAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                                updatedAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                                tanggal : moment(tgl_now).format("YYYY-MM-DD"),
                                waktu : moment(tgl_now).format("HH:mm:ss"),
                                kategori: usr.kategori
                            });
                            await created.save();
                            msg = "Akses diterima, Selamat Makan :)";
                            status = 0;
                        }
                    } else if (moment(tgl_now).format("HH:mm:ss") >= '02:30:00' && moment(tgl_now).format("HH:mm:ss") <= '04:30:00') {
                        if (hadir.length > 0 && hadir.length < 3) {
                            if (hadir[0].waktu >= '02:30:00' && hadir[0].waktu <= '04:30:00') {
                                msg = "Anda Sudah Tapping Absen di Sesi 3, Selamat Makan :)";
                                status = 1;
                            } else {
                                const created = await Absen.create({
                                    rfid: request.rfid,
                                    nrk: usr.user_id,
                                    createdAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                                    updatedAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                                    tanggal : moment(tgl_now).format("YYYY-MM-DD"),
                                    waktu : moment(tgl_now).format("HH:mm:ss"),
                                    kategori: usr.kategori
                                });
                                await created.save();
                                msg = "Akses diterima, Selamat Makan :)";
                                status = 0;
                            }
                        } else {
                            const created = await Absen.create({
                                rfid: request.rfid,
                                nrk: usr.user_id,
                                createdAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                                updatedAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                                tanggal : moment(tgl_now).format("YYYY-MM-DD"),
                                waktu : moment(tgl_now).format("HH:mm:ss"),
                                kategori: usr.kategori
                            });
                            await created.save();
                            msg = "Akses diterima, Selamat Makan :)";
                            status = 0;
                        }
                    } else {
                        msg = "Anda Tapping di Luar Waktu Yang di tentukan !";
                        status = 1;
                    }
                } else {
                    msg = "Anda Tapping di Luar Waktu Yang di tentukan !";
                    status = 1;
                }
            } 
        } else if (usr.kategori == 'internship') {
            rekap_user = await Internship.findOne({where:{nomor_induk:usr.user_id}});
            if (moment(tgl_now).format("HH:mm:ss") >= '11:00:00' && moment(tgl_now).format("HH:mm:ss") <= '14:00:00') {
                if (hadir.length > 0 && hadir.length < 3) {
                    if (moment(hadir[0].createdAt).format("HH:mm:ss") >= '11:00:00' && moment(hadir[0].createdAt).format("HH:mm:ss") <= '14:00:00') {
                        msg = "Anda Sudah Tapping Absen di Sesi 1, Selamat Makan :)";
                        status = 1;
                    } else {
                        const created = await Absen.create({
                            rfid: request.rfid,
                            nrk: usr.user_id,
                            createdAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                            updatedAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                            tanggal : moment(tgl_now).format("YYYY-MM-DD"),
                            waktu : moment(tgl_now).format("HH:mm:ss"),
                            kategori: usr.kategori
                        });
                        await created.save();
                        msg = "Akses diterima, Selamat Makan :)";
                        status = 0;
                    }
                } else {
                    const created = await Absen.create({
                        rfid: request.rfid,
                        nrk: usr.user_id,
                        createdAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                        updatedAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                        tanggal : moment(tgl_now).format("YYYY-MM-DD"),
                        waktu : moment(tgl_now).format("HH:mm:ss"),
                        kategori: usr.kategori
                    });
                    await created.save();
                    msg = "Akses diterima, Selamat Makan :)";
                    status = 0;
                }
            } else if (moment(tgl_now).format("HH:mm:ss") >= '18:00:00' && moment(tgl_now).format("HH:mm:ss") <= '20:30:00') {
                if (hadir.length > 0 && hadir.length < 3) {
                    if (moment(hadir[0].createdAt).format("HH:mm:ss") >= '18:00:00' && moment(hadir[0].createdAt).format("HH:mm:ss") <= '20:30:00') {
                        msg = "Anda Sudah Tapping Absen di Sesi 2, Selamat Makan :)";
                        status = 1;
                    } else {
                        const created = await Absen.create({
                            rfid: request.rfid,
                            nrk: usr.user_id,
                            createdAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                            updatedAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                            tanggal : moment(tgl_now).format("YYYY-MM-DD"),
                            waktu : moment(tgl_now).format("HH:mm:ss"),
                            kategori: usr.kategori
                        });
                        await created.save();
                        msg = "Akses diterima, Selamat Makan :)";
                        status = 0;
                    }
                } else {
                    const created = await Absen.create({
                        rfid: request.rfid,
                        nrk: usr.user_id,
                        createdAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                        updatedAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                        tanggal : moment(tgl_now).format("YYYY-MM-DD"),
                        waktu : moment(tgl_now).format("HH:mm:ss"),
                        kategori: usr.kategori
                    });
                    await created.save();
                    msg = "Akses diterima, Selamat Makan :)";
                    status = 0;
                }
            } else if (moment(tgl_now).format("HH:mm:ss") >= '23:00:00' && moment(tgl_now).format("HH:mm:ss") <= '23:59:59') {
                if (hadir.length > 0 && hadir.length < 3) {
                    if (moment(hadir[0].createdAt).format("HH:mm:ss") >= '23:00:00' && moment(hadir[0].createdAt).format("HH:mm:ss") <= '23:59:59') {
                        msg = "Anda Sudah Tapping Absen di Sesi 3, Selamat Makan :)";
                        status = 1;
                    } else {
                        const created = await Absen.create({
                            rfid: request.rfid,
                            nrk: usr.user_id,
                            createdAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                            updatedAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                            tanggal : moment(tgl_now).format("YYYY-MM-DD"),
                            waktu : moment(tgl_now).format("HH:mm:ss"),
                            kategori: usr.kategori
                        });
                        await created.save();
                        msg = "Akses diterima, Selamat Makan :)";
                        status = 0;
                    }
                } else {
                    const created = await Absen.create({
                        rfid: request.rfid,
                        nrk: usr.user_id,
                        createdAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                        updatedAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                        tanggal : moment(tgl_now).format("YYYY-MM-DD"),
                        waktu : moment(tgl_now).format("HH:mm:ss"),
                        kategori: usr.kategori
                    });
                    await created.save();
                    msg = "Akses diterima, Selamat Makan :)";
                    status = 0;
                }
            } else if (moment(tgl_now).format("HH:mm:ss") >= '00:00:00' && moment(tgl_now).format("HH:mm:ss") <= '01:30:00') {
                if (hadir.length > 0 && hadir.length < 3) {
                    if (hadir[0].waktu >= '00:00:00' && hadir[0].waktu <= '01:30:00') {
                        msg = "Anda Sudah Tapping Absen di Sesi 3, Selamat Makan :)";
                        status = 1;
                    } else {
                        const created = await Absen.create({
                            rfid: request.rfid,
                            nrk: usr.user_id,
                            createdAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                            updatedAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                            tanggal : moment(tgl_now).format("YYYY-MM-DD"),
                            waktu : moment(tgl_now).format("HH:mm:ss"),
                            kategori: usr.kategori
                        });
                        await created.save();
                        msg = "Akses diterima, Selamat Makan :)";
                        status = 0;
                    }
                } else {
                    const created = await Absen.create({
                        rfid: request.rfid,
                        nrk: usr.user_id,
                        createdAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                        updatedAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                        tanggal : moment(tgl_now).format("YYYY-MM-DD"),
                        waktu : moment(tgl_now).format("HH:mm:ss"),
                        kategori: usr.kategori
                    });
                    await created.save();
                    msg = "Akses diterima, Selamat Makan :)";
                    status = 0;
                }
            } else {
                if (moment(tgl_now).format("YYYYMMDD") >= '20230323' && moment(tgl_now).format("YYYYMMDD") <= '20230422') {
                    if (moment(tgl_now).format("HH:mm:ss") >= '15:00:00' && moment(tgl_now).format("HH:mm:ss") <= '18:30:00') {
                        if (hadir.length > 0 && hadir.length < 3) {
                            if (hadir[0].waktu >= '15:00:00' && hadir[0].waktu <= '18:30:00') {
                                msg = "Anda Sudah Tapping Absen di Sesi 1, Selamat Makan :)";
                                status = 1;
                            } else {
                                const created = await Absen.create({
                                    rfid: request.rfid,
                                    nrk: usr.user_id,
                                    createdAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                                    updatedAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                                    tanggal : moment(tgl_now).format("YYYY-MM-DD"),
                                    waktu : moment(tgl_now).format("HH:mm:ss"),
                                    kategori: usr.kategori
                                });
                                await created.save();
                                msg = "Akses diterima, Selamat Makan :)";
                                status = 0;
                            }
                        } else {
                            const created = await Absen.create({
                                rfid: request.rfid,
                                nrk: usr.user_id,
                                createdAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                                updatedAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                                tanggal : moment(tgl_now).format("YYYY-MM-DD"),
                                waktu : moment(tgl_now).format("HH:mm:ss"),
                                kategori: usr.kategori
                            });
                            await created.save();
                            msg = "Akses diterima, Selamat Makan :)";
                            status = 0;
                        }
                    } else if (moment(tgl_now).format("HH:mm:ss") >= '02:30:00' && moment(tgl_now).format("HH:mm:ss") <= '04:30:00') {
                        if (hadir.length > 0 && hadir.length < 3) {
                            if (hadir[0].waktu >= '02:30:00' && hadir[0].waktu <= '04:30:00') {
                                msg = "Anda Sudah Tapping Absen di Sesi 3, Selamat Makan :)";
                                status = 1;
                            } else {
                                const created = await Absen.create({
                                    rfid: request.rfid,
                                    nrk: usr.user_id,
                                    createdAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                                    updatedAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                                    tanggal : moment(tgl_now).format("YYYY-MM-DD"),
                                    waktu : moment(tgl_now).format("HH:mm:ss"),
                                    kategori: usr.kategori
                                });
                                await created.save();
                                msg = "Akses diterima, Selamat Makan :)";
                                status = 0;
                            }
                        } else {
                            const created = await Absen.create({
                                rfid: request.rfid,
                                nrk: usr.user_id,
                                createdAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                                updatedAt: moment(tgl_now).format("YYYY-MM-DD HH:mm:ss"),
                                tanggal : moment(tgl_now).format("YYYY-MM-DD"),
                                waktu : moment(tgl_now).format("HH:mm:ss"),
                                kategori: usr.kategori
                            });
                            await created.save();
                            msg = "Akses diterima, Selamat Makan :)";
                            status = 0;
                        }
                    } else {
                        msg = "Anda Tapping di Luar Waktu Yang di tentukan !";
                        status = 1;
                    }
                } else {
                    msg = "Anda Tapping di Luar Waktu Yang di tentukan !";
                    status = 1;
                }
            } 
        } else {
            rekap_user = {
                nama: 'Belum Terdaftar',
            }
        }
        view = {
            nama: rekap_user.nama,
            user_id: usr.user_id,
            kategori: usr.kategori
        }

        // const hadir = await Absen.findOne({where:{rfid:request.rfid}});
        // res.send({"code":200, "msg":msg, "status":status, "data": kry, "hadir":hadir.length , "absen":absens});
        res.send({"code":200, "msg":msg, "status":status, "data": view, "hadir":hadir.length});
    } catch (err) {
        var msg, status;
        msg = "ID Card Anda Belum Terdaftar";
        status = 1;
        res.send({"code":200, "msg":msg, "status":status, "data": null});
        console.log(err)
    }
}

const getDataFinger = async (req, res) => {
    // const ip = req.body.ip;
    // const ip = "192.168.1.210";
    // const ip = "192.168.1.211";
    // const ip = "192.168.1.98";
    const ip = "192.168.1.99";
    try {
        const dt_absen = await Presensi.sequelize.query('SELECT * FROM tbl_absen WHERE ip = :ip ORDER BY logtime_finger DESC LIMIT 1',
        {
          replacements: { ip: ip },
          type: QueryTypes.SELECT
        });
        console.log(dt_absen.length);
        let zkInstance = new ZKLib(ip,4370,5000,5200);
        try {
            // Create socket to machine
            await zkInstance.createSocket();
            // console.log(await zkInstance.getInfo());
        } catch (e) {
            console.log(e);
            if (e.code === "EADDRINUSE") {
            }
        }
        const data = [];
        const load = await zkInstance.getAttendances();
        const tgl = new Date();
        if (dt_absen.length > 0) {
            for (let i = 0; i < load.data.length; i++) {
                if (momenttz(load.data[i].recordTime).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss") <= momenttz(dt_absen[0].logtime_finger).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss")) {
                   continue;
                } 
                data[i] = {
                    "user_id": load.data[i].deviceUserId,
                    "logtime_finger": momenttz(load.data[i].recordTime).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "create_at" : momenttz(new Date()).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "update_at" : momenttz(new Date()).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "ip": load.data[i].ip,
                }
                const create = await Presensi.create(data[i]);
                await create.save();
            }
        } else {
            for (let i = 0; i < load.data.length; i++) {
                data[i] = {
                    "user_id": load.data[i].deviceUserId,
                    "logtime_finger": momenttz(load.data[i].recordTime).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "create_at" : momenttz(new Date()).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "update_at" : momenttz(new Date()).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "ip": load.data[i].ip,
                }
                const create = await Presensi.create(data[i]);
                await create.save();
            }
        }
        res.send({"code":200, "msg":"Success for "+ip+" !"});
        // res.send({"code":200, "data":load});
    } catch (err) {
        console.log(err)
    }
}

// Load Finger Pos Security
const getDataFinger_99 = async (req, res) => {
    // const ip = req.body.ip;
    // const ip = "192.168.1.210";
    // const ip = "192.168.1.211";
    // const ip = "192.168.1.98";
    const ip = "192.168.1.99";
    try {
        const dt_absen = await Presensi.sequelize.query('SELECT * FROM tbl_absen WHERE ip = :ip ORDER BY logtime_finger DESC LIMIT 1',
        {
          replacements: { ip: ip },
          type: QueryTypes.SELECT
        });
        console.log(dt_absen.length);
        let zkInstance = new ZKLib(ip,4370,5000,5200);
        try {
            // Create socket to machine
            await zkInstance.createSocket();
            // console.log(await zkInstance.getInfo());
        } catch (e) {
            console.log(e);
            if (e.code === "EADDRINUSE") {
            }
        }
        const data = [];
        const load = await zkInstance.getAttendances();
        const tgl = new Date();
        if (dt_absen.length > 0) {
            for (let i = 0; i < load.data.length; i++) {
                if (momenttz(load.data[i].recordTime).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss") <= momenttz(dt_absen[0].logtime_finger).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss")) {
                   continue;
                } 
                data[i] = {
                    "user_id": load.data[i].deviceUserId,
                    "logtime_finger": momenttz(load.data[i].recordTime).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "create_at" : momenttz(new Date()).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "update_at" : momenttz(new Date()).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "ip": load.data[i].ip,
                }
                const create = await Presensi.create(data[i]);
                await create.save();
            }
        } else {
            for (let i = 0; i < load.data.length; i++) {
                data[i] = {
                    "user_id": load.data[i].deviceUserId,
                    "logtime_finger": momenttz(load.data[i].recordTime).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "create_at" : momenttz(new Date()).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "update_at" : momenttz(new Date()).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "ip": load.data[i].ip,
                }
                const create = await Presensi.create(data[i]);
                await create.save();
            }
        }
        res.send({"code":200, "msg":"Success for "+ip+" !"});
        // res.send({"code":200, "data":load});
    } catch (err) {
        res.send({"code":401, "msg":"Failed for "+ip+" !"});
        console.log(err)
    }
}

// Load Finger Lobby
const getDataFinger_211 = async (req, res) => {
    // const ip = req.body.ip;
    // const ip = "192.168.1.210";
    const ip = "192.168.1.211";
    // const ip = "192.168.1.98";
    // const ip = "192.168.1.99";
    try {
        const dt_absen = await Presensi.sequelize.query('SELECT * FROM tbl_absen WHERE ip = :ip ORDER BY logtime_finger DESC LIMIT 1',
        {
          replacements: { ip: ip },
          type: QueryTypes.SELECT
        });
        console.log(dt_absen.length);
        let zkInstance = new ZKLib(ip,4370,5000,5200);
        try {
            // Create socket to machine
            await zkInstance.createSocket();
            // console.log(await zkInstance.getInfo());
        } catch (e) {
            console.log(e);
            if (e.code === "EADDRINUSE") {
            }
        }
        const data = [];
        const load = await zkInstance.getAttendances();
        const tgl = new Date();
        if (dt_absen.length > 0) {
            for (let i = 0; i < load.data.length; i++) {
                if (momenttz(load.data[i].recordTime).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss") <= momenttz(dt_absen[0].logtime_finger).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss")) {
                   continue;
                } 
                data[i] = {
                    "user_id": load.data[i].deviceUserId,
                    "logtime_finger": momenttz(load.data[i].recordTime).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "create_at" : momenttz(new Date()).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "update_at" : momenttz(new Date()).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "ip": load.data[i].ip,
                }
                const create = await Presensi.create(data[i]);
                await create.save();
            }
        } else {
            for (let i = 0; i < load.data.length; i++) {
                data[i] = {
                    "user_id": load.data[i].deviceUserId,
                    "logtime_finger": momenttz(load.data[i].recordTime).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "create_at" : momenttz(new Date()).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "update_at" : momenttz(new Date()).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "ip": load.data[i].ip,
                }
                const create = await Presensi.create(data[i]);
                await create.save();
            }
        }
        res.send({"code":200, "msg":"Success for "+ip+" !"});
        // res.send({"code":200, "data":load});
    } catch (err) {
        console.log(err)
        res.send({"code":401, "msg":"Failed for "+ip+" !"});
    }
}

// Load Finger Loker
const getDataFinger_210 = async (req, res) => {
    // const ip = req.body.ip;
    const ip = "192.168.1.210";
    // const ip = "192.168.1.211";
    // const ip = "192.168.1.98";
    // const ip = "192.168.1.99";
    try {
        const dt_absen = await Presensi.sequelize.query('SELECT * FROM tbl_absen WHERE ip = :ip ORDER BY logtime_finger DESC LIMIT 1',
        {
          replacements: { ip: ip },
          type: QueryTypes.SELECT
        });
        console.log(dt_absen.length);
        let zkInstance = new ZKLib(ip,4370,5000,5200);
        try {
            // Create socket to machine
            await zkInstance.createSocket();
            // console.log(await zkInstance.getInfo());
        } catch (e) {
            console.log(e);
            if (e.code === "EADDRINUSE") {
            }
        }
        const data = [];
        const load = await zkInstance.getAttendances();
        const tgl = new Date();
        if (dt_absen.length > 0) {
            for (let i = 0; i < load.data.length; i++) {
                if (momenttz(load.data[i].recordTime).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss") <= momenttz(dt_absen[0].logtime_finger).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss")) {
                   continue;
                } 
                data[i] = {
                    "user_id": load.data[i].deviceUserId,
                    "logtime_finger": momenttz(load.data[i].recordTime).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "create_at" : momenttz(new Date()).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "update_at" : momenttz(new Date()).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "ip": load.data[i].ip,
                }
                const create = await Presensi.create(data[i]);
                await create.save();
            }
        } else {
            for (let i = 0; i < load.data.length; i++) {
                data[i] = {
                    "user_id": load.data[i].deviceUserId,
                    "logtime_finger": momenttz(load.data[i].recordTime).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "create_at" : momenttz(new Date()).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "update_at" : momenttz(new Date()).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "ip": load.data[i].ip,
                }
                const create = await Presensi.create(data[i]);
                await create.save();
            }
        }
        res.send({"code":200, "msg":"Success for "+ip+" !"});
        // res.send({"code":200, "data":load});
    } catch (err) {
        console.log(err)
        res.send({"code":401, "msg":"Failed for "+ip+" !"});
    }
}

// Load Finger Packaging
const getDataFinger_98 = async (req, res) => {
    // const ip = req.body.ip;
    const ip = "192.168.1.98";
    // const ip = "192.168.1.88";
    try {
        const dt_absen = await Presensi.sequelize.query('SELECT * FROM tbl_absen WHERE ip = :ip ORDER BY logtime_finger DESC LIMIT 1',
        {
          replacements: { ip: ip },
          type: QueryTypes.SELECT
        });
        console.log(dt_absen.length);
        let zkInstance = new ZKLib(ip,4370,5000,5200);
        try {
            // Create socket to machine
            await zkInstance.createSocket();
            // console.log(await zkInstance.getInfo());
        } catch (e) {
            console.log(e);
            if (e.code === "EADDRINUSE") {
            }
        }
        const data = [];
        const load = await zkInstance.getAttendances();
        const tgl = new Date();
        if (dt_absen.length > 0) {
            for (let i = 0; i < load.data.length; i++) {
                if (momenttz(load.data[i].recordTime).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss") <= momenttz(dt_absen[0].logtime_finger).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss")) {
                   continue;
                } 
                data[i] = {
                    "user_id": load.data[i].deviceUserId,
                    "logtime_finger": momenttz(load.data[i].recordTime).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "create_at" : momenttz(new Date()).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "update_at" : momenttz(new Date()).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "ip": load.data[i].ip,
                }
                const create = await Presensi.create(data[i]);
                await create.save();
            }
        } else {
            for (let i = 0; i < load.data.length; i++) {
                data[i] = {
                    "user_id": load.data[i].deviceUserId,
                    "logtime_finger": momenttz(load.data[i].recordTime).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "create_at" : momenttz(new Date()).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "update_at" : momenttz(new Date()).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "ip": load.data[i].ip,
                }
                const create = await Presensi.create(data[i]);
                await create.save();
            }
        }
        res.send({"code":200, "msg":"Success for "+ip+" !"});
        // res.send({"code":200, "data":load});
    } catch (err) {
        console.log(err);
        res.send({"code":401, "msg":"Failed for "+ip+" !"});
        // if (err == null) {
        //     break;;
        // } else {
        //     continue;
        // }
    }
}

const getAllDataFinger = async (req, res) => {
    // const ip = req.body.ip;
    const ip_210 = "192.168.1.210";
    const ip_211 = "192.168.1.211";
    const ip_98 = "192.168.1.98";
    const ip_99 = "192.168.1.99";
    try {
        // Calling ZK_Library 
        // let zkInstance = new ZKLib(ip,4370,5000,5200);
        let zkInstance_210 = new ZKLib(ip_210,4370,5000,5200);
        let zkInstance_211 = new ZKLib(ip_211,4370,5000,5200);
        let zkInstance_98 = new ZKLib(ip_98,4370,5000,5200);
        let zkInstance_99 = new ZKLib(ip_99,4370,5000,5200);

        // Get Log Time Table tbl_absen Terakhir
        // const dt_absen = await Presensi.sequelize.query('SELECT * FROM tbl_absen WHERE ip = :ip ORDER BY logtime_finger DESC LIMIT 1',
        // { replacements: { ip: ip }, type: QueryTypes.SELECT });
        const dt_absen_210 = await Presensi.sequelize.query('SELECT * FROM tbl_absen WHERE ip = :ip ORDER BY logtime_finger DESC LIMIT 1',
        { replacements: { ip: ip_210 }, type: QueryTypes.SELECT });
        const dt_absen_211 = await Presensi.sequelize.query('SELECT * FROM tbl_absen WHERE ip = :ip ORDER BY logtime_finger DESC LIMIT 1',
        { replacements: { ip: ip_211 }, type: QueryTypes.SELECT });
        const dt_absen_98 = await Presensi.sequelize.query('SELECT * FROM tbl_absen WHERE ip = :ip ORDER BY logtime_finger DESC LIMIT 1',
        { replacements: { ip: ip_98 }, type: QueryTypes.SELECT });
        const dt_absen_99 = await Presensi.sequelize.query('SELECT * FROM tbl_absen WHERE ip = :ip ORDER BY logtime_finger DESC LIMIT 1',
        { replacements: { ip: ip_99 }, type: QueryTypes.SELECT });
        try {
            // Create socket to machine
            // await zkInstance.createSocket();
            await zkInstance_210.createSocket();
            await zkInstance_211.createSocket();
            await zkInstance_98.createSocket();
            await zkInstance_99.createSocket();
            // console.log(await zkInstance.getInfo());
        } catch (e) {
            console.log(e);
            if (e.code === "EADDRINUSE") {
            }
        }
        const data = [];
        // const load = await zkInstance.getAttendances();
        const load_210 = await zkInstance_210.getAttendances();
        const load_211 = await zkInstance_211.getAttendances();
        const load_98 = await zkInstance_98.getAttendances();
        const load_99 = await zkInstance_99.getAttendances();
        const tgl = new Date();

        // Processing Default 210
        if (dt_absen_210.length > 0) {
            for (let i = 0; i < load_210.data.length; i++) {
                if (momenttz(load_210.data[i].recordTime).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss") <= momenttz(dt_absen_210[0].logtime_finger).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss")) {
                    continue;
                } 
                const create = await Presensi.create({
                    "user_id": load_210.data[i].deviceUserId,
                    "logtime_finger": momenttz(load_210.data[i].recordTime).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "create_at" : momenttz(new Date()).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "update_at" : momenttz(new Date()).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "ip": load_210.data[i].ip,
                });
                await create.save();
            }
        } else {
            for (let i = 0; i < load_210.data.length; i++) {
                const create = await Presensi.create({
                    "user_id": load_210.data[i].deviceUserId,
                    "logtime_finger": momenttz(load_210.data[i].recordTime).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "create_at" : momenttz(new Date()).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "update_at" : momenttz(new Date()).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "ip": load_210.data[i].ip,
                });
                await create.save();
            }
        }

        // Processing Default 211
        if (dt_absen_211.length > 0) {
            for (let i = 0; i < load_211.data.length; i++) {
                if (momenttz(load_211.data[i].recordTime).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss") <= momenttz(dt_absen_211[0].logtime_finger).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss")) {
                    continue;
                } 
                const create = await Presensi.create({
                    "user_id": load_211.data[i].deviceUserId,
                    "logtime_finger": momenttz(load_211.data[i].recordTime).format("YYYY-MM-DD HH:mm:ss"),
                    "create_at" : momenttz(new Date()).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "update_at" : momenttz(new Date()).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "ip": load_211.data[i].ip,
                });
                await create.save();
            }
        } else {
            for (let i = 0; i < load_211.data.length; i++) {
                const create = await Presensi.create({
                    "user_id": load_211.data[i].deviceUserId,
                    "logtime_finger": momenttz(load_211.data[i].recordTime).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "create_at" : momenttz(new Date()).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "update_at" : momenttz(new Date()).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "ip": load_211.data[i].ip,
                });
                await create.save();
            }
        }

        // Processing Default 98
        if (dt_absen_98.length > 0) {
            for (let i = 0; i < load_98.data.length; i++) {
                if (momenttz(load_98.data[i].recordTime).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss") <= momenttz(dt_absen_98[0].logtime_finger).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss")) {
                    continue;
                } 
                const create = await Presensi.create({
                    "user_id": load_98.data[i].deviceUserId,
                    "logtime_finger": momenttz(load_98.data[i].recordTime).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "create_at" : momenttz(new Date()).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "update_at" : momenttz(new Date()).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "ip": load_98.data[i].ip,
                });
                await create.save();
            }
        } else {
            for (let i = 0; i < load_98.data.length; i++) {
                const create = await Presensi.create({
                    "user_id": load_98.data[i].deviceUserId,
                    "logtime_finger": momenttz(load_98.data[i].recordTime).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "create_at" : momenttz(new Date()).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "update_at" : momenttz(new Date()).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "ip": load_98.data[i].ip,
                });
                await create.save();
            }
        }

        // Processing Default 99
        if (dt_absen_99.length > 0) {
            for (let i = 0; i < load_99.data.length; i++) {
                if (momenttz(load_99.data[i].recordTime).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss") <= momenttz(dt_absen_99[0].logtime_finger).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss")) {
                    continue;
                } 
                const create = await Presensi.create({
                    "user_id": load_99.data[i].deviceUserId,
                    "logtime_finger": momenttz(load_99.data[i].recordTime).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "create_at" : momenttz(new Date()).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "update_at" : momenttz(new Date()).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "ip": load_99.data[i].ip,
                });
                await create.save();
            }
        } else {
            for (let i = 0; i < load_99.data.length; i++) {
                const create = await Presensi.create({
                    "user_id": load_99.data[i].deviceUserId,
                    "logtime_finger": momenttz(load_99.data[i].recordTime).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "create_at" : momenttz(new Date()).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "update_at" : momenttz(new Date()).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss"),
                    "ip": load_99.data[i].ip,
                });
                await create.save();
            }
        }

        // Result
        res.send({"code":200, "msg":"Data update successfully !"});
    } catch (err) {
        res.send({"code":404, "msg":"Error"});
        console.log(err)
    }
}

// const getAllDataFinger = async (req, res) => {
//     // const ip = req.body.ip;
//     const ip_210 = "192.168.1.210";
//     const ip_211 = "192.168.1.211";
//     const ip_98 = "192.168.1.98";
//     const ip_99 = "192.168.1.99";
//     try {
//         // Calling ZK_Library 
//         // let zkInstance = new ZKLib(ip,4370,5000,5200);
//         let zkInstance_210 = new ZKLib(ip_210,4370,5000,5200);
//         let zkInstance_211 = new ZKLib(ip_211,4370,5000,5200);
//         let zkInstance_98 = new ZKLib(ip_98,4370,5000,5200);
//         let zkInstance_99 = new ZKLib(ip_99,4370,5000,5200);

//         // Get Log Time Table tbl_absen Terakhir
//         // const dt_absen = await Presensi.sequelize.query('SELECT * FROM tbl_absen WHERE ip = :ip ORDER BY logtime_finger DESC LIMIT 1',
//         // { replacements: { ip: ip }, type: QueryTypes.SELECT });
//         const dt_absen_210 = await Presensi.sequelize.query('SELECT * FROM tbl_absen WHERE ip = :ip ORDER BY logtime_finger DESC LIMIT 1',
//         { replacements: { ip: ip_210 }, type: QueryTypes.SELECT });
//         const dt_absen_211 = await Presensi.sequelize.query('SELECT * FROM tbl_absen WHERE ip = :ip ORDER BY logtime_finger DESC LIMIT 1',
//         { replacements: { ip: ip_211 }, type: QueryTypes.SELECT });
//         const dt_absen_98 = await Presensi.sequelize.query('SELECT * FROM tbl_absen WHERE ip = :ip ORDER BY logtime_finger DESC LIMIT 1',
//         { replacements: { ip: ip_98 }, type: QueryTypes.SELECT });
//         const dt_absen_99 = await Presensi.sequelize.query('SELECT * FROM tbl_absen WHERE ip = :ip ORDER BY logtime_finger DESC LIMIT 1',
//         { replacements: { ip: ip_99 }, type: QueryTypes.SELECT });
//         try {
//             // Create socket to machine
//             // await zkInstance.createSocket();
//             await zkInstance_210.createSocket();
//             await zkInstance_211.createSocket();
//             await zkInstance_98.createSocket();
//             await zkInstance_99.createSocket();
//             // console.log(await zkInstance.getInfo());
//         } catch (e) {
//             console.log(e);
//             if (e.code === "EADDRINUSE") {
//             }
//         }
//         const data = [];
//         // const load = await zkInstance.getAttendances();
//         const load_210 = await zkInstance_210.getAttendances();
//         const load_211 = await zkInstance_211.getAttendances();
//         const load_98 = await zkInstance_98.getAttendances();
//         const load_99 = await zkInstance_99.getAttendances();
//         const tgl = new Date();

//         // // Processing Default
//         // if (dt_absen.length > 0) {
//         //     for (let i = 0; i < load.data.length; i++) {
//         //         if (moment(load.data[i].recordTime).format("YYYY-MM-DD HH:mm:ss") <= moment(dt_absen[0].logtime_finger).format("YYYY-MM-DD HH:mm:ss")) {
//         //             continue;
//         //         } 
//         //         const create = await Presensi.create({
//         //             "user_id": load.data[i].deviceUserId,
//         //             "logtime_finger": load.data[i].recordTime,
//         //             "create_at" : Date.now(),
//         //             "update_at" : Date.now(),
//         //             "ip": load.data[i].ip,
//         //         });
//         //         await create.save();
//         //     }
//         // } else {
//         //     for (let i = 0; i < load.data.length; i++) {
//         //         const create = await Presensi.create({
//         //             "user_id": load.data[i].deviceUserId,
//         //             "logtime_finger": load.data[i].recordTime,
//         //             "create_at" : Date.now(),
//         //             "update_at" : Date.now(),
//         //             "ip": load.data[i].ip,
//         //         });
//         //         await create.save();
//         //     }
//         // }

//         // Processing Default 210
//         if (dt_absen_210.length > 0) {
//             for (let i = 0; i < load_210.data.length; i++) {
//                 if (moment(load_210.data[i].recordTime).format("YYYY-MM-DD HH:mm:ss") <= moment(dt_absen_210[0].logtime_finger).format("YYYY-MM-DD HH:mm:ss")) {
//                     continue;
//                 } 
//                 const create = await Presensi.create({
//                     "user_id": load_210.data[i].deviceUserId,
//                     "logtime_finger": load_210.data[i].recordTime,
//                     "create_at" : Date.now(),
//                     "update_at" : Date.now(),
//                     "ip": load_210.data[i].ip,
//                 });
//                 await create.save();
//             }
//         } else {
//             for (let i = 0; i < load_210.data.length; i++) {
//                 const create = await Presensi.create({
//                     "user_id": load_210.data[i].deviceUserId,
//                     "logtime_finger": load_210.data[i].recordTime,
//                     "create_at" : Date.now(),
//                     "update_at" : Date.now(),
//                     "ip": load_210.data[i].ip,
//                 });
//                 await create.save();
//             }
//         }

//         // Processing Default 211
//         if (dt_absen_211.length > 0) {
//             for (let i = 0; i < load_211.data.length; i++) {
//                 if (moment(load_211.data[i].recordTime).format("YYYY-MM-DD HH:mm:ss") <= moment(dt_absen_211[0].logtime_finger).format("YYYY-MM-DD HH:mm:ss")) {
//                     continue;
//                 } 
//                 const create = await Presensi.create({
//                     "user_id": load_211.data[i].deviceUserId,
//                     "logtime_finger": load_211.data[i].recordTime,
//                     "create_at" : Date.now(),
//                     "update_at" : Date.now(),
//                     "ip": load_211.data[i].ip,
//                 });
//                 await create.save();
//             }
//         } else {
//             for (let i = 0; i < load_211.data.length; i++) {
//                 const create = await Presensi.create({
//                     "user_id": load_211.data[i].deviceUserId,
//                     "logtime_finger": load_211.data[i].recordTime,
//                     "create_at" : Date.now(),
//                     "update_at" : Date.now(),
//                     "ip": load_211.data[i].ip,
//                 });
//                 await create.save();
//             }
//         }

//         // Processing Default 98
//         if (dt_absen_98.length > 0) {
//             for (let i = 0; i < load_98.data.length; i++) {
//                 if (moment(load_98.data[i].recordTime).format("YYYY-MM-DD HH:mm:ss") <= moment(dt_absen_98[0].logtime_finger).format("YYYY-MM-DD HH:mm:ss")) {
//                     continue;
//                 } 
//                 const create = await Presensi.create({
//                     "user_id": load_98.data[i].deviceUserId,
//                     "logtime_finger": load_98.data[i].recordTime,
//                     "create_at" : Date.now(),
//                     "update_at" : Date.now(),
//                     "ip": load_98.data[i].ip,
//                 });
//                 await create.save();
//             }
//         } else {
//             for (let i = 0; i < load_98.data.length; i++) {
//                 const create = await Presensi.create({
//                     "user_id": load_98.data[i].deviceUserId,
//                     "logtime_finger": load_98.data[i].recordTime,
//                     "create_at" : Date.now(),
//                     "update_at" : Date.now(),
//                     "ip": load_98.data[i].ip,
//                 });
//                 await create.save();
//             }
//         }

//         // Processing Default 99
//         if (dt_absen_99.length > 0) {
//             for (let i = 0; i < load_99.data.length; i++) {
//                 if (moment(load_99.data[i].recordTime).format("YYYY-MM-DD HH:mm:ss") <= moment(dt_absen_99[0].logtime_finger).format("YYYY-MM-DD HH:mm:ss")) {
//                     continue;
//                 } 
//                 const create = await Presensi.create({
//                     "user_id": load_99.data[i].deviceUserId,
//                     "logtime_finger": load_99.data[i].recordTime,
//                     "create_at" : Date.now(),
//                     "update_at" : Date.now(),
//                     "ip": load_99.data[i].ip,
//                 });
//                 await create.save();
//             }
//         } else {
//             for (let i = 0; i < load_99.data.length; i++) {
//                 const create = await Presensi.create({
//                     "user_id": load_99.data[i].deviceUserId,
//                     "logtime_finger": load_99.data[i].recordTime,
//                     "create_at" : Date.now(),
//                     "update_at" : Date.now(),
//                     "ip": load_99.data[i].ip,
//                 });
//                 await create.save();
//             }
//         }

//         // Result
//         res.send({"code":200, "msg":"Data update successfully !"});
//     } catch (err) {
//         res.send({"code":404, "msg":"Error"});
//         console.log(err)
//     }
// }

const postVisitor = async (req, res) => {
    const request = req.body;
    try {
        var load;
        if (request.dept == 'all') {
            load = await Absen.sequelize.query('SELECT ky.nama AS nama, ky.divisi AS divisi, ky.department AS department, ak.nrk AS nrk, ak.tanggal AS tanggal, ak.waktu AS waktu FROM tbl_absen_kantin ak JOIN tbl_karyawan ky ON ak.nrk = ky.nrk WHERE ak.tanggal BETWEEN :start AND :end',
            {
                replacements: { start: request.start, end: request.end},
                type: QueryTypes.SELECT
            });
        } else {
            load = await Absen.sequelize.query('SELECT ky.nama AS nama, ky.divisi AS divisi, ky.department AS department, ak.nrk AS nrk, ak.tanggal AS tanggal, ak.waktu AS waktu FROM tbl_absen_kantin ak JOIN tbl_karyawan ky ON ak.nrk = ky.nrk WHERE ky.department IN (:dept) AND ak.tanggal BETWEEN :start AND :end',
            {
                replacements: { start: request.start, end: request.end, dept: request.dept },
                type: QueryTypes.SELECT
            });
        }
        res.send({"code":200, "data":load});
    } catch (err) {
        console.log(err)
    }
}

const loadDataFinger = async (req, res) => {
    const request = req.params;
    try {
        const load = await Presensi.sequelize.query("SELECT ak.user_id AS user_id, ak.logtime_finger AT TIME ZONE 'Asia/Jakarta' AS logtime_finger, ak.create_at AT TIME ZONE 'Asia/Jakarta' AS create_at, ak.ip, ky.nama AS nama FROM tbl_absen ak JOIN tbl_karyawan ky ON ak.user_id = ky.nrk WHERE DATE(ak.logtime_finger AT TIME ZONE 'Asia/Jakarta') = :tgl ",
        {
            replacements: { tgl: request.tgl},
            type: QueryTypes.SELECT
        });
        res.send({"code":200, "data":load});
    } catch (err) {
        res.send({"code":404, "msg":"Error"});
        console.log(err)
    }
}

// Path
const path = '/v1/api/absen';

// Router
router.get(`${path}/all`, getAllAbsenKantin)
router.get(`${path}/today/:start/:end`, getTodayAbsenKantin)
router.get(`${path}/session`, getSessionAbsenKantin)
router.get(`${path}/finger`, getDataFinger)
router.get(`${path}/finger210`, getDataFinger_210)
router.get(`${path}/finger211`, getDataFinger_211)
router.get(`${path}/finger99`, getDataFinger_99)
router.get(`${path}/finger98`, getDataFinger_98)
router.get(`${path}/finger2`, getAllDataFinger)
router.get(`${path}/reportv2`, getReportAbsenVisitor2)
router.post(`${path}/report`, getReportAbsenKantin)
router.post(`${path}/reportv`, getReportAbsenVisitor)
router.post(`${path}/finger`, getAllDataFinger)
router.post(`${path}/all`, postAbsenKantin)

// Finger
router.get(`${path}/load_finger/:tgl`, loadDataFinger)

module.exports = router;
