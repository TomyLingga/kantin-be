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
var Banding = require('../model/Banding');

// Function Controller
const getAllKaryawan = async (req, res) => {
    // const request = req.params;
    try {
        const load = await Karyawan.findAll();
        res.send({"code":200, "data":load});
    } catch (err) {
        console.log(err)
    }
}

const getKaryawanByDept = async (req, res) => {
    const request = req.params;
    try {
        const load = await Karyawan.findAll({where:{department:request.dept}});
        res.send({"code":200, "data":load});
    } catch (err) {
        res.send({"code":400, "msg":'failed'});
        console.log(err)
    }
}

const getDepartment = async (req, res) => {
    // const request = req.params;
    try {
        const load = await Karyawan.sequelize.query("SELECT DISTINCT department FROM tbl_karyawan",
        {
            type: QueryTypes.SELECT
        });
        res.send({"code":200, "data":load});
    } catch (err) {
        console.log(err)
    }
}

const getDivisi = async (req, res) => {
    const request = req.params;
    try {
        let load;
        load = await Karyawan.sequelize.query("SELECT DISTINCT divisi FROM tbl_karyawan",
        {
            type: QueryTypes.SELECT
        });
        res.send({"code":200, "data":load});
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

// User Kantin
const postUserKantinKaryawan = async (req, res) => {
    const post = req.body;
    // const trans = await seq.transaction();
    try {
        const data = {
            nama: post.nama,
            nrk: post.nrk,
            rfid: post.rfid,
            department: post.department,
            divisi: post.divisi
        };
        const data2 = {
            user_id: post.nrk,
            rfid_barcode: post.rfid,
            kategori: post.kategori,
            status: post.status
        }
        const load = await Karyawan.create(data);
        const user = await userKantin.create(data2);
        await load.save()
        await user.save()
        // await trans.commit();
        res.send({"code":200, "msg":'success', status:true});
    } catch (e) {
        // await trans.rollback()
        res.send({"code":400, "msg":'failed', status:false});
    }
}
const updateUserKantinKaryawan = async (req, res) => {
    const post = req.body;
    const trans = await sequelize.transaction();
    try {
        const data = {
            nama: post.nama,
            nrk: post.nrk,
            rfid: post.rfid,
            department: post.department,
            divisi: post.divisi
        };
        const data2 = {
            user_id: post.nrk,
            rfid_barcode: post.rfid,
            kategori: post.kategori,
            status: post.status
        }
        const load = await Karyawan.update(data,{where:{id: post.usr_id}},{transaction:trans});
        const user = await userKantin.update(data2,{where:{id: post.kantin_id}},{transaction:trans});
        await trans.commit();
        res.send({"code":200, "msg":'success', status:true});
    } catch (e) {
        await trans.rollback()
        res.send({"code":400, "msg":'failed', status:false});
    }
}
const postUserKantinInternship = async (req, res) => {
    const post = req.body;
    // const trans = await seq.transaction();
    try {
        const data = {
            nama: post.nama,
            nomor_induk: post.nomor_induk,
            barcode: post.barcode,
            instansi: post.instansi,
            start_periode: post.start_periode,
            end_periode: post.end_periode,
        };
        const data2 = {
            user_id: post.nomor_induk,
            rfid_barcode: post.barcode,
            kategori: post.kategori,
            status: post.status
        }
        const load = await Internship.create(data);
        const user = await userKantin.create(data2);
        await load.save()
        await user.save()
        // await trans.commit();
        res.send({"code":200, "msg":'success', status:true});
    } catch (e) {
        // await trans.rollback()
        res.send({"code":400, "msg":'failed', status:false});
    }
}
const updateUserKantinInternship = async (req, res) => {
    const post = req.body;
    const trans = await sequelize.transaction();
    try {
        const data = {
            nama: post.nama,
            nomor_induk: post.nomor_induk,
            barcode: post.barcode,
            instansi: post.instansi,
            start_periode: post.start_periode,
            end_periode: post.end_periode,
        };
        const data2 = {
            user_id: post.nomor_induk,
            rfid_barcode: post.barcode,
            kategori: post.kategori,
            status: post.status
        }
        const load = await Internship.update(data, {where:{id: post.usr_id}}, {transaction:trans});
        const user = await userKantin.update(data2, {where:{id: post.kantin_id}}, {transaction:trans});
        await trans.commit();
        res.send({"code":200, "msg":'success', status:true});
    } catch (e) {
        await trans.rollback()
        res.send({"code":400, "msg":'failed', status:false});
    }
}
const postUserKantinOutsource = async (req, res) => {
    const post = req.body;
    const trans = await sequelize.transaction();
    try {
        const load = await Outsource.create({
            nama: post.nama,
            nomor_karyawan: post.nomor_karyawan,
            barcode: post.barcode,
            instansi: post.instansi,
            bagian: post.bagian,
        });
        const user = await userKantin.create({
            user_id: post.nomor_karyawan,
            rfid_barcode: post.barcode,
            kategori: post.kategori,
            status: post.status
        });
        await load.save({transaction:trans});
        await user.save({transaction:trans});
        await trans.commit();
        res.send({"code":200, "msg":'success', status:true});
    } catch (e) {
        await trans.rollback()
        res.send({"code":400, "msg":'failed', status:false});
    }
}
const updateUserKantinOutsource = async (req, res) => {
    const post = req.body;
    const trans = await sequelize.transaction();
    try {
        const data = {
            nama: post.nama,
            nomor_karyawan: post.nomor_karyawan,
            barcode: post.barcode,
            instansi: post.instansi,
            bagian: post.bagian,
        };
        const data2 = {
            user_id: post.nomor_karyawan,
            rfid_barcode: post.barcode,
            kategori: post.kategori,
            status: post.status
        };
        const load = await Outsource.update(data, {where:{id: post.usr_id}}, {transaction:trans});
        const user = await userKantin.update(data2, {where:{id: post.kantin_id}}, {transaction:trans});
        await trans.commit();
        res.send({"code":200, "msg":'success', status:true});
    } catch (e) {
        await trans.rollback()
        res.send({"code":400, "msg":'failed', status:false});
    }
}
const getAllUserKantin = async (req, res) => {
    const request = req.params;
    try {
        let nama, stat, lembaga, load;
        if (request.kategori == null) {
            load = await userKantin.findAll();
        } else {
            load = await userKantin.findAll({where:{kategori:request.kategori}});
        }(request.kategori)
        const data = [];

        for (let i = 0; i < load.length; i++) {
            const karyawan = await Karyawan.findOne({where:{ nrk:load[i].user_id}});
            const internship = await Internship.findOne({where:{ nomor_induk:load[i].user_id}});
            const outsource = await Outsource.findOne({where:{ nomor_karyawan:load[i].user_id}});
            if (karyawan != null) {
                nama = karyawan.nama;
                lembaga = "INL";
            } else if (internship != null){
                nama = internship.nama;
                lembaga = internship.instansi;
            } else {
                nama = outsource.nama;
                lembaga = outsource.instansi;
            }
            if (load[i].status == true) {
                stat = "Active";
            } else {
                stat = "Non Active";
            }
            data[i] = {
                name: nama,
                user_id: load[i].user_id,
                code_id: load[i].rfid_barcode,
                category: load[i].kategori,
                company: lembaga,
                status: stat,
            }
        }
        res.send({"code":200, "data":data});
    } catch (err) {
        res.send({"code":400, "msg":'failed', status:false});
        // console.log(err)
    }
}

const getUserKantinByID = async (req, res) => {
    const request = req.params;
    try {
        let nama, stat, lembaga, load, form;
        const user = await userKantin.findOne({where:{user_id:request.user_id}});
        if (user.kategori == 'karyawan') {
            load = await Karyawan.findOne({where:{ nrk:user.user_id}});
            form = {
                usr_id: load.id,
                kantin_id: user.id,
                access_id: load.rfid,
                user_id: load.nrk,
                nama: load.nama,
                department: load.department,
                divisi: load.divisi,
                kategori: user.kategori,
                status: user.status
            };
        } else if (user.kategori == 'internship') {
            load = await Internship.findOne({where:{ nomor_induk:user.user_id}});
            form = {
                usr_id: load.id,
                kantin_id: user.id,
                access_id: load.barcode,
                user_id: load.nomor_induk,
                nama: load.nama,
                instansi: load.instansi,
                start_periode: load.start_periode,
                end_periode: load.end_periode,
                kategori: user.kategori,
                status: user.status
            };
        } else {
            load = await Outsource.findOne({where:{ nomor_karyawan:user.user_id}});
            form = {
                usr_id: load.id,
                kantin_id: user.id,
                access_id: load.barcode,
                user_id: load.nomor_karyawan,
                nama: load.nama,
                instansi: load.instansi,
                bagian: load.bagian,
                kategori: user.kategori,
                status: user.status
            };
        }
        const data = [];

        // for (let i = 0; i < load.length; i++) {
        //     const karyawan = await Karyawan.findOne({where:{ nrk:load[i].user_id}});
        //     const internship = await Internship.findOne({where:{ nomor_induk:load[i].user_id}});
        //     const outsource = await Outsource.findOne({where:{ nomor_karyawan:load[i].user_id}});
        //     if (karyawan != null) {
        //         nama = karyawan.nama;
        //         lembaga = "INL";
        //     } else if (internship != null){
        //         nama = internship.nama;
        //         lembaga = internship.instansi;
        //     } else {
        //         nama = outsource.nama;
        //         lembaga = outsource.instansi;
        //     }
        //     if (load[i].status == true) {
        //         stat = "Active";
        //     } else {
        //         stat = "Non Active";
        //     }
        //     data[i] = {
        //         name: nama,
        //         user_id: load[i].user_id,
        //         code_id: load[i].rfid_barcode,
        //         category: load[i].kategori,
        //         company: lembaga,
        //         status: stat,
        //     }
        // }
        res.send({"code":200, "data":form});
    } catch (err) {
        res.send({"code":400, "msg":'failed', status:false});
        // console.log(err)
    }
}
// const postUserKantin = async (req, res) => {
//     const post = req.body;
//     const kategori = post.kategori;
//     // const trans = await seq.transaction();
//     try {
//         var load, user, data;
//         if (kategori == 'karyawan') {
//             data = {
//                 nama: post.nama,
//                 nrk: post.nrk,
//                 rfid: post.rfid,
//                 department: post.department,
//                 divisi: post.divisi
//             };
//             const data2 = {
//                 user_id: post.nrk,
//                 rfid_barcode: post.rfid,
//                 kategori: post.kategori,
//                 status: post.status
//             }
//             load = await Karyawan.create(data);
//             user = await userKantin.create(data2);
//         } else if (kategori == 'internship') {
//             data = {
//                 nama: post.nama,
//                 nomor_induk: post.nomor_induk,
//                 barcode: post.barcode,
//                 instansi: post.instansi,
//                 start_periode: post.start_periode,
//                 end_periode: post.end_periode,
//             };
//             const data2 = {
//                 user_id: post.nomor_induk,
//                 rfid_barcode: post.barcode,
//                 kategori: post.kategori,
//                 status: post.status
//             }
//             load = await Internship.create(data);
//             user = await userKantin.create(data2);
//         } else {
//             data = {
//                 nama: post.nama,
//                 nomor_karyawan: post.nomor_karyawan,
//                 barcode: post.barcode,
//                 instansi: post.instansi,
//                 bagian: post.bagian,
//             };
//             const data2 = {
//                 user_id: post.nomor_induk,
//                 rfid_barcode: post.barcode,
//                 kategori: post.kategori,
//                 status: post.status
//             }
//             load = await Outsource.create(data);
//             user = await userKantin.create(data2);
//         }
//         await load.save()
//         await user.save()
//         // await trans.commit();
//         res.send({"code":200, "msg":'success', status:true, "data":post});
//     } catch (e) {
//         // await trans.rollback()
//         res.send({"code":400, "msg":'failed', status:false});
//     }
// }

// Visitor
const postVisitor = async (req, res) => {
    const post = req.body;
    // const trans = await sequelize.transaction();
    const jumlah = post.jml;
    try {
        const data = [];
        for (let i = 0; i < jumlah; i++) {
            // data[i] = {
            //     pic_visitor: post.visitor,
            //     tanggal: post.date,
            //     waktu: post.time,
            //     keterangan: post.keterangan,
            //     createdAt: Date.now(),
            //     updateAt: Date.now(),
            // };
            const load = await Visitor.create({
                pic_visitor: post.visitor,
                tanggal: post.date,
                waktu: post.time,              
                keterangan: post.keterangan,
                createdAt: Date.now(),
                updateAt: Date.now(),
                lembaga: post.lembaga
            });
            await load.save();
        }
        // await trans.commit();
        res.send({"code":200, "msg":'success', status:true});
        // res.send({"code":200, "data":data, "number":jumlah});
    } catch (e) {
        // await trans.rollback()
        res.send({"code":400, "msg":'failed', status:false});
    }
}

const getVisitor = async (req, res) => {
    const request = req.params;
    try {
        const data = await Visitor.sequelize.query("SELECT COUNT(id), pic_visitor, tanggal, waktu, lembaga, keterangan FROM tbl_absen_visitor WHERE tanggal BETWEEN :start AND :end GROUP BY pic_visitor, tanggal, waktu, lembaga, keterangan ORDER BY tanggal DESC",
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


//Absen Banding

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

const getBandingByTanggal = async (req, res) => {
    const tgl = req.params.tgl
    try {
        const data = await Banding.findOne({where:{tanggal:new Date(tgl)}})
        // res.send({"code":200, "msg":'success', status:true});
        res.send({"code":200, "data":data, "status":true});
    } catch (e) {
        // await trans.rollback()
        res.send({"code":400, "msg":'failed', status:false});
    }
}

const postAbsenBanding = async (req, res) => {
    const request = req.body;
    try {
        const tgl = new Date();
        const load = await Banding.create({
            jumlah: request.jumlah,
            tanggal : request.tanggal,
            //waktu: moment(tgl).format('HH:mm:ss')
        });
        await load.save();
    
        res.send({"code":200, "status":true, "msg":"Success"});
    } catch (err) {
        // console.log(err)
        res.send({"code":400, "status":false, "msg":"Failed"});
    }
}

const postAbsenBanding2 = async (req, res) => {
    const post = req.body;
    // const trans = await sequelize.transaction();
    const jumlah = post.jml;
    try {
        const data = [];
        for (let i = 0; i < jumlah; i++) {
            const load = await Visitor.create({
                pic_visitor: post.visitor,
                tanggal: post.date,
                waktu: post.time,              
                keterangan: post.keterangan,
                createdAt: Date.now(),
                updateAt: Date.now(),
                lembaga: post.lembaga
            });
            await load.save();
        }
        // await trans.commit();
        res.send({"code":200, "msg":'success', status:true});
        // res.send({"code":200, "data":data, "number":jumlah});
    } catch (e) {
        // await trans.rollback()
        res.send({"code":400, "msg":'failed', status:false});
    }
}

const getReportBandingByTanggal = async (req, res) => {
    const request = req.body
    try {
        const data = [];
        const banding = await Banding.sequelize.query("SELECT * FROM tbl_banding WHERE tanggal >= :start AND tanggal <= :end",
        {
            replacements: { start: request.start, end: request.end },
            type: QueryTypes.SELECT
        })
        for (let i = 0; i < banding.length; i++) {
            const absen = await Banding.sequelize.query("SELECT COUNT(*) FROM tbl_absen_kantin WHERE tanggal = :tanggal",
            {
                replacements: { tanggal: banding[i].tanggal},
                type: QueryTypes.SELECT
            });
            const visitor = await Banding.sequelize.query("SELECT COUNT(*) FROM tbl_absen_visitor WHERE tanggal = :tanggal",
            {
                replacements: { tanggal: banding[i].tanggal},
                type: QueryTypes.SELECT
            });
            data[i] = {
                tgl : banding[i].tanggal,
                jml_banding:  banding[i].jumlah,
                jml_user: Number(absen[0].count),
                jml_visitor: Number(visitor[0].count)
            }
        }
        // res.send({"code":200, "msg":'success', status:true});
        res.send({"code":200, "data":data, "status":true});
    } catch (e) {
        // await trans.rollback()
        res.send({"code":400, "msg":'failed', status:false});
    }
}


// Path
const path = '/v1/api/karyawan';
const path2 = '/v1/api/userkantin';
const path3 = '/v1/api/visitor';

// Visitor
router.get(`${path3}/all/:start/:end`, getVisitor);
router.post(`${path3}/all`, postVisitor);

// Karyawan
router.get(`${path}/all`, getAllKaryawan);
router.get(`${path}/all/:dept`, getKaryawanByDept);
router.get(`${path}/banding/:start/:end`, getBanding);
router.get(`${path}/banding2/:tgl`, getBandingByTanggal);
router.post(`${path}/banding`, postAbsenBanding);
router.post(`${path}/exp_banding`, getReportBandingByTanggal);

// Department & Divisi
router.get(`${path}/dept`, getDepartment);
router.get(`${path}/div`, getDivisi);
router.get(`${path}/div/:dept`, getDivisiByDept);

// UserKantin
// router.post(`${path2}/all`, postUserKantin);
router.get(`${path2}/all/`, getAllUserKantin);
router.get(`${path2}/usr/:user_id`, getUserKantinByID);
router.get(`${path2}/all/:kategori`, getAllUserKantin);

router.post(`${path2}/outsource`, postUserKantinOutsource);
router.post(`${path2}/u_outsource`, updateUserKantinOutsource);
router.post(`${path2}/internship`, postUserKantinInternship);
router.post(`${path2}/u_internship`, updateUserKantinInternship);
router.post(`${path2}/karyawan`, postUserKantinKaryawan);
router.post(`${path2}/u_karyawan`, updateUserKantinKaryawan);

module.exports = router;