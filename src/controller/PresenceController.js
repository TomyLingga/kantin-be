var express = require('express');
var {sequelize} = require('../config/db_seq');
var ZKLib = require('node-zklib');
var {QueryTypes} = require('sequelize');
var Seq = require('sequelize');
// var moment = require('moment');
var moment = require('moment-timezone')
moment.tz.setDefault('Asia/Jakarta');

const router = express.Router();

// Model
var Kartu = require('../model/User_Kantin');
var Karyawan = require('../model/Karyawan');
var Outsourcing = require('../model/Outsourcing');
var Internship = require('../model/Internship');
var Absen = require('../model/Absen');

var bulan_puasa = '2024-03-12';

var tgl_now = new Date();

const checkUser = async (req) => {
    const request_body = req;
    try {
        const load = await Kartu.findOne({
            where: { rfid_code:request_body.rfid}
        })

        if (load != null) {
            let data, code, kategori;
            kategori = load.kategori;
            if (load.kategori == 'karyawan') {
                const get = await Karyawan.findOne({
                    where: { rfid:request_body.rfid},
                    order: [ [ 'id', 'DESC' ]]
                })
                if (get != null) {
                    data = {
                        rfid: get.rfid,
                        nama: get.nama,
                        nrk: get.nrk,
                        instansi: "INL",
                    }
                    code = 200;
                } else {
                    data = {nama:'Belum ada', status:true}
                    code = 201;
                }
            } else if (load.kategori == 'outsource') {
                const get = await Outsourcing.findOne({
                    where: {barcode:request_body.rfid},
                    order: [ [ 'id', 'DESC' ]]
                })
                if (get != null) {
                    data = {
                        rfid: get.barcode,
                        nama: get.nama,
                        nrk: get.nomor_karyawan,
                        instansi: get.instansi,
                    }
                    code = 200;
                } else {
                    data = {nama:'Belum ada', status:true}
                    code = 201;
                }
            } else if (load.kategori == 'internship') {
                const get = await Internship.findOne({
                    where: {barcode:request_body.rfid},
                    order: [ [ 'id', 'DESC' ]]
                })
                if (get != null) {
                    data = {
                        rfid: get.barcode,
                        nama: get.nama,
                        nrk: get.nomor_induk,
                        instansi: get.instansi,
                    }
                    code = 200;
                } else {
                    data = {nama:'Belum ada', status:true}
                    code = 201;
                }
            } else {
                data = {nama:'Belum ada', status:true}
                code = 201;
                kategori = '-'
            }
            return ({"code":code, "data":data , "kategori": kategori});
        } else {
            return({"code":201, "data":'kartu belum terdaftar di sistem'});
        }
    } catch (err) {
        return({"code":401, "data":'Terjadi kesalahan sistem', "status":false});
    }
}

const presenceUser = async (req, res) => {
    const request_body = req.body;
    try {
        const load = await checkUser(request_body)
        if (load.code == 200) {
            const data = load.data;
            let status, kategori, kond;
            moment.tz.setDefault('Asia/Jakarta');

            const post = {
                rfid: data.rfid,
                nrk: data.nrk,
                nama: data.nama,
                instansi: data.instansi,
                createdAt: moment(request_body.waktu).format("YYYY-MM-DD HH:mm:ss"),
                updatedAt: moment(request_body.waktu).format("YYYY-MM-DD HH:mm:ss"),
                tanggal : moment(request_body.waktu).format("YYYY-MM-DD"),
                waktu : moment(request_body.waktu).format("HH:mm:ss"),
                kategori: load.kategori,
                sesi: ''
            }
            if (moment(tgl_now).format("HH:mm:ss") >= '11:00:00' && moment(tgl_now).format("HH:mm:ss") <= '14:00:00') {
                post.sesi = 'Sesi 1'
                kategori = await checking_present(request_body.rfid, post.sesi)
                const jumat = moment(tgl_now).day();
                if (jumat == 5) {
                    if (kategori.length > 0 && kategori.length < 3) {
                        if (moment(kategori[0].createdAt).format("HH:mm:ss") >= '11:00:00' && moment(kategori[0].createdAt).format("HH:mm:ss") <= '14:00:00') {
                            status = `Anda Sudah Tapping Absen di ${post.sesi}, Selamat Makan :)`;
                            kond = 1
                        } else {
                            kond = 0
                            status = 'Akses diterima, Selamat Makan :)';
                            const created = await Absen.create(post)
                            await created.save();
                        }
                    } else {
                        kond = 0
                        status = 'Akses diterima, Selamat Makan :)';
                        const created = await Absen.create(post)
                        await created.save();
                    }
                } else {
                    const jam_selesai = '14:00:00'
                    if (moment(tgl_now).format("HH:mm:ss") >= '11:00:00' && moment(tgl_now).format("HH:mm:ss") <= jam_selesai) {
                        if (kategori.length > 0 && kategori.length < 3) {
                            if (moment(kategori[0].createdAt).format("HH:mm:ss") >= '11:00:00' && moment(kategori[0].createdAt).format("HH:mm:ss") <= jam_selesai) {
                                status = `Anda Sudah Tapping Absen di ${post.sesi}, Selamat Makan :)`;
                                kond = 1
                            } else {
                                kond = 0
                                status = 'Akses diterima, Selamat Makan :)';
                                const created = await Absen.create(post)
                                await created.save();
                            }
                        } else {
                            kond = 0
                            status = 'Akses diterima, Selamat Makan :)';
                            const created = await Absen.create(post)
                            await created.save();
                        }
                    } else {
                        kond = 2
                        status = `Anda Tapping di Luar Waktu Yang di tentukan !`;
                    }
                }
            } else if (moment(tgl_now).format("HH:mm:ss") >= '18:00:00' && moment(tgl_now).format("HH:mm:ss") <= '20:30:00') {
                post.sesi = 'Sesi 2'
                kategori = await checking_present(request_body.rfid, post.sesi)
                if (kategori.length > 0 && kategori.length < 3) {
                    if (moment(kategori[0].createdAt).format("HH:mm:ss") >= '18:00:00' && moment(kategori[0].createdAt).format("HH:mm:ss") <= '20:30:00') {
                        status = `Anda Sudah Tapping Absen di ${post.sesi}, Selamat Makan :)`;
                        kond = 1
                    } else {
                        kond = 0
                        status = 'Akses diterima, Selamat Makan :)';
                        const created = await Absen.create(post)
                        await created.save();
                    }
                } else {
                    kond = 0
                    status = 'Akses diterima, Selamat Makan :)';
                    const created = await Absen.create(post)
                    await created.save();
                }
            } else if (moment(tgl_now).format("HH:mm:ss") >= '23:00:00' && moment(tgl_now).format("HH:mm:ss") <= '23:59:59') {
                post.sesi = 'Sesi 3'
                kategori = await checking_present(request_body.rfid, post.sesi)
                if (kategori.length > 0 && kategori.length < 3) {
                    if (moment(kategori[0].createdAt).format("HH:mm:ss") >= '23:00:00' && moment(kategori[0].createdAt).format("HH:mm:ss") <= '23:59:59') {
                        status = `Anda Sudah Tapping Absen di ${post.sesi}, Selamat Makan :)`;
                        kond = 1
                    } else {
                        kond = 0
                        status = 'Akses diterima, Selamat Makan :)';
                        const created = await Absen.create(post)
                        await created.save();
                    }
                } else {
                    kond = 0
                    status = 'Akses diterima, Selamat Makan :)';
                    const created = await Absen.create(post)
                    await created.save();
                }
            } else if (moment(tgl_now).format("HH:mm:ss") >= '00:00:00' && moment(tgl_now).format("HH:mm:ss") <= '01:30:00') {
                post.sesi = 'Sesi 3'
                kategori = await checking_present(request_body.rfid, post.sesi)
                if (kategori.length > 0 && kategori.length < 3) {
                    if (moment(kategori[0].createdAt).format("HH:mm:ss") >= '00:00:00' && moment(kategori[0].createdAt).format("HH:mm:ss") <= '01:30:00') {
                        status = `Anda Sudah Tapping Absen di ${post.sesi}, Selamat Makan :)`;
                        kond = 1
                    } else {
                        kond = 0
                        status = 'Akses diterima, Selamat Makan :)';
                        const created = await Absen.create(post)
                        await created.save();
                    }
                } else {
                    kond = 0
                    status = 'Akses diterima, Selamat Makan :)';
                    const created = await Absen.create(post)
                    await created.save();
                }
            } else {
                // Tapping makan di waktu ramadhan
                const selesai_puasa = moment(bulan_puasa).add(29, 'days').format('YYYY-MM-DD');
                const tanggal_sekarang = moment(tgl_now);
                if (tanggal_sekarang.isBetween(bulan_puasa, selesai_puasa, null, '[]')) {
                    if (moment(tgl_now).format("HH:mm:ss") >= '11:00:00' && moment(tgl_now).format("HH:mm:ss") <= '14:00:00') {
                        post.sesi = 'Sesi 1'
                        kategori = await checking_present(request_body.rfid, post.sesi)
                        const jumat = moment(tgl_now).day();
                        if (jumat == 5) {
                            if (kategori.length > 0 && kategori.length < 3) {
                                if (moment(kategori[0].createdAt).format("HH:mm:ss") >= '11:00:00' && moment(kategori[0].createdAt).format("HH:mm:ss") <= '14:00:00') {
                                    status = `Anda Sudah Tapping Absen di ${post.sesi}, Selamat Makan :)`;
                                    kond = 1
                                } else {
                                    kond = 0
                                    status = 'Akses diterima, Selamat Makan :)';
                                    const created = await Absen.create(post)
                                    await created.save();
                                }
                            } else {
                                kond = 0
                                status = 'Akses diterima, Selamat Makan :)';
                                const created = await Absen.create(post)
                                await created.save();
                            }
                        } else {
                            if (moment(tgl_now).format("HH:mm:ss") >= '11:00:00' && moment(tgl_now).format("HH:mm:ss") <= '13:30:00') {
                                if (kategori.length > 0 && kategori.length < 3) {
                                    if (moment(kategori[0].createdAt).format("HH:mm:ss") >= '11:00:00' && moment(kategori[0].createdAt).format("HH:mm:ss") <= '13:30:00') {
                                        status = `Anda Sudah Tapping Absen di ${post.sesi}, Selamat Makan :)`;
                                        kond = 1
                                    } else {
                                        kond = 0
                                        status = 'Akses diterima, Selamat Makan :)';
                                        const created = await Absen.create(post)
                                        await created.save();
                                    }
                                } else {
                                    kond = 0
                                    status = 'Akses diterima, Selamat Makan :)';
                                    const created = await Absen.create(post)
                                    await created.save();
                                }
                            } else {
                                kond = 2
                                status = `Anda Tapping di Luar Waktu Yang di tentukan !`;
                            }
                        }
                    } else if (moment(tgl_now).format("HH:mm:ss") >= '15:00:00' && moment(tgl_now).format("HH:mm:ss") <= '17:30:00') {
                        post.sesi = 'Sesi 1 (Pengambilan Makan untuk Buka Puasa)'
                        kategori = await checking_present(request_body.rfid, post.sesi)
                        if (kategori.length > 0 && kategori.length < 3) {
                            if (moment(kategori[0].createdAt).format("HH:mm:ss") >= '15:00:00' && moment(kategori[0].createdAt).format("HH:mm:ss") <= '17:30:00') {
                                status = `Anda Sudah Tapping Absen di ${post.sesi}, Selamat Makan :)`;
                                kond = 1
                            } else {
                                kond = 0
                                status = 'Akses diterima, Selamat Makan :)';
                                const created = await Absen.create(post)
                                await created.save();
                            }
                        } else {
                            kond = 0
                            status = 'Akses diterima, Selamat Makan dan Selamat Berbuka Puasa :)';
                            const created = await Absen.create(post)
                            await created.save();
                        }
                    } else if (moment(tgl_now).format("HH:mm:ss") >= '18:00:00' && moment(tgl_now).format("HH:mm:ss") <= '20:30:00') {
                        post.sesi = 'Sesi 2'
                        kategori = await checking_present(request_body.rfid, post.sesi)
                        if (kategori.length > 0 && kategori.length < 3) {
                            if (moment(kategori[0].createdAt).format("HH:mm:ss") >= '18:00:00' && moment(kategori[0].createdAt).format("HH:mm:ss") <= '20:30:00') {
                                status = `Anda Sudah Tapping Absen di ${post.sesi}, Selamat Makan :)`;
                                kond = 1
                            } else {
                                kond = 0
                                status = 'Akses diterima, Selamat Makan :)';
                                const created = await Absen.create(post)
                                await created.save();
                            }
                        } else {
                            kond = 0
                            status = 'Akses diterima, Selamat Makan dan Selamat Berbuka Puasa :)';
                            const created = await Absen.create(post)
                            await created.save();
                        }
                    } else if (moment(tgl_now).format("HH:mm:ss") >= '23:00:00' && moment(tgl_now).format("HH:mm:ss") <= '23:59:59') {
                        post.sesi = 'Sesi 3'
                        kategori = await checking_present(request_body.rfid, post.sesi)
                        if (kategori.length > 0 && kategori.length < 3) {
                            if (moment(kategori[0].createdAt).format("HH:mm:ss") >= '23:00:00' && moment(kategori[0].createdAt).format("HH:mm:ss") <= '23:59:59') {
                                status = `Anda Sudah Tapping Absen di ${post.sesi}, Selamat Makan :)`;
                                kond = 1
                            } else {
                                kond = 0
                                status = 'Akses diterima, Selamat Makan :)';
                                const created = await Absen.create(post)
                                await created.save();
                            }
                        } else {
                            kond = 0
                            status = 'Akses diterima, Selamat Makan :)';
                            const created = await Absen.create(post)
                            await created.save();
                        }
                    } else if (moment(tgl_now).format("HH:mm:ss") >= '00:00:00' && moment(tgl_now).format("HH:mm:ss") <= '01:30:00') {
                        post.sesi = 'Sesi 3'
                        kategori = await checking_present(request_body.rfid, post.sesi)
                        if (kategori.length > 0 && kategori.length < 3) {
                            if (moment(kategori[0].createdAt).format("HH:mm:ss") >= '00:00:00' && moment(kategori[0].createdAt).format("HH:mm:ss") <= '01:30:00') {
                                status = `Anda Sudah Tapping Absen di ${post.sesi}, Selamat Makan :)`;
                                kond = 1
                            } else {
                                kond = 0
                                status = 'Akses diterima, Selamat Makan :)';
                                const created = await Absen.create(post)
                                await created.save();
                            }
                        } else {
                            kond = 0
                            status = 'Akses diterima, Selamat Makan :)';
                            const created = await Absen.create(post)
                            await created.save();
                        }
                    } else if (moment(tgl_now).format("HH:mm:ss") >= '03:00:00' && moment(tgl_now).format("HH:mm:ss") <= '05:30:00') {
                        post.sesi = 'Sesi 3 (Sahur)'
                        kategori = await checking_present(request_body.rfid, post.sesi)
                        if (kategori.length > 0 && kategori.length < 3) {
                            if (moment(kategori[0].createdAt).format("HH:mm:ss") >= '03:00:00' && moment(kategori[0].createdAt).format("HH:mm:ss") <= '05:30:00') {
                                status = `Anda Sudah Tapping Absen di ${post.sesi}, Selamat Makan :)`;
                                kond = 1
                            } else {
                                kond = 0
                                status = 'Akses diterima, Selamat Makan :)';
                                const created = await Absen.create(post)
                                await created.save();
                            }
                        } else {
                            kond = 0
                            status = 'Akses diterima, Selamat Makan dan Selamat Menunaikan Ibadah Puasa :)';
                            const created = await Absen.create(post)
                            await created.save();
                        }
                    } else {
                        kond = 2
                        post.sesi = 'Anda Tapping di Luar Waktu Yang di tentukan !'
                        status = 'Anda Tapping di Luar Waktu Yang di tentukan !'
                    }
                } else {
                    kond = 2
                    post.sesi = 'Anda Tapping di Luar Waktu Yang di tentukan !'
                    status = 'Anda Tapping di Luar Waktu Yang di tentukan !'
                }
            }
            res.send({"code":200, "data":post , "status": status, "kond": kond, "kategori": kategori})
        } else if (load.code == 201) {
            res.send({"code":201, "data":'kartu belum terdaftar di sistem', "kond": kond})
        } else {
            res.send({"code":401, "data":'Terjadi kesalahan sistem', "status":false, "kond": kond})
        }
    } catch (err) {
        return({"code":404, "status":false});
    }
}

const checking_present = async(rfid, sesi) => {
    const load = await Absen.sequelize.query('SELECT * FROM tbl_absen_kantin WHERE rfid = :rfid AND tanggal = :tgl ORDER BY tanggal, waktu DESC',
    {
        replacements: { rfid: rfid, tgl: moment(new Date).format("YYYY-MM-DD"), sesi: sesi},
        type: QueryTypes.SELECT
    });
    // const total = load.length;
    // return total;
    return load;
}

// Path
const path = '/v1/api/presence';

// Route
router.post(`${path}/user`, presenceUser);

module.exports = router;