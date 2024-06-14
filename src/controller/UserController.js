var Karyawan = require('../model/Karyawan');
var User = require('../model/User');
var express = require('express');
var ZKLib = require('node-zklib');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');

const router = express.Router();

// Function Controller
const signInUser = async (req, res) => {
    const request = req.body;
    try {
        const load = await User.findOne({where:{username:request.username}});
        if (load) {
            const isPasswordMatching = await bcrypt.compareSync(request.password, load.password)
            if (isPasswordMatching) {
                load.password = undefined;
                const expiresIn = 60 * 60;
                const secret = 'secret';
                const dataStoredInToken = {id:load.id};
                const token = jwt.sign(dataStoredInToken,secret,{});
                res.setHeader('Cookie', `token=${token}; HttpOnly; Max-Age=`)
                res.send({"code":200, "data":{"accessToken":token, "user":load}})
            } else {
                res.send({"code":505,"data":{"message":"Password Anda Salah"}});
            }
        } else {
            res.send({"code":506,"data":{"message":"Username tidak ditemukan"}});
        }
        // res.send({"code":200, "data":load});
    } catch (err) {
        console.log(err)
    }
}

const getByRfid = async (req, res) => {
    const request = req.params;
    try {
        const load = await Karyawan.findOne({where:{rfid:request.rfid}});
        res.send({"code":200, "data":load});
    } catch (err) {
        console.log(err)
    }
}

const getAllUser = async (req, res) => {
    try {
        const load = await User.findAll();
        res.send({"code":200, "data":load});
    } catch (err) {
        console.log(err)
    }
}

const getByEmail = async (req, res) => {
    const ids = req.params;
    try {
        const load = await User.findOne({email:ids.id});
        res.send({"code":200, "data":load});
    } catch (err) {
        console.log(err)
    }
}

const getById = async (req, res) => {
    const ids = req.params;
    try {
        const load = await User.findOne({where:{id:ids.id}});
        res.send({"code":200, "data":load});
    } catch (err) {
        console.log(err)
    }
}

const deleteUser = async (req, res) => {
    const ids = req.params;
    try {
        await User.destroy({where:{id:ids.id}});

        res.send({"code":200, "status":true});
    } catch (err) {
        res.send({"code":404, "status":false});
    }
}

const getDataFinger = async (req, res) => {
    try {
        let zkInstance = new ZKLib('192.168.1.210',4370,5000,5200);
        try {
            // Create socket to machine
            await zkInstance.createSocket();
        
            // Get general info like logCapacity, user counts, logs count
            // It's really useful to check the status of device
            console.log(await zkInstance.getInfo());
          } catch (e) {
            console.log(e);
            if (e.code === "EADDRINUSE") {
            }
          }
        const load = await zkInstance.getAttendances();
        // const users = await zkInstance.getUsers();
        // res.send({"code":200, "user":users.data});
        res.send({"code":200, "data":load.data});
        // console.log(load);
    } catch (err) {
        console.log(err)
    }
}
const postUser = async (req, res) => {
    const post = req.body;
    // const trans = await seq.transaction();
    try {
        const load = await User.create({
            name: post.name,
            email: post.email,
            roles: post.roles,
            jabatan: post.jabatan,
            username: post.username,
            password: await bcrypt.hash(post.password, 8),
            active: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
        await load.save()
        // await trans.commit();
        res.send({"code":200, "msg":'success', "status":true});
        // res.send({"code":200, "msg":'success', "status":true, "data": data});
    } catch (e) {
        res.send({"code":400, "msg":'failed', "status":false});
    }
}

const postUpdateUser = async (req, res) => {
    const post = req.body;
    try {
        let data;
        // if (post.password != '') {
        //     data = {
        //         name: post.name,
        //         email: post.email,
        //         roles: post.roles,
        //         jabatan: post.jabatan,
        //         username: post.username,
        //         active: true,
        //         createdAt: Date.now(),
        //         updatedAt: Date.now(),
        //         password : await bcrypt.hash(post.password, 8),
        //     };
        // } else {
            data = {
                name: post.name,
                email: post.email,
                roles: post.roles,
                jabatan: post.jabatan,
                username: post.username,
                active: true,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };
        // }
        if (post.password != '') {
            data.password = await bcrypt.hash(post.password, 8)
        }

        await User.update(data, {where:{id: post.id}});
        res.send({"code":200, "msg":'success', "status":true, "data": data});
    } catch (e) {
        res.send({"code":400, "msg":'failed', "status":false});
    }
}

// Path
const path = '/v1/auth';

// Router Controller
router.get(`${path}/all`, getAllUser)
router.get(`${path}/rfid/:rfid`, getByRfid)
router.get(`${path}/load/:id`, getByEmail)
router.get(`${path}/user/:id`, getById)
router.get(`${path}/finger`, getDataFinger)
router.post(`${path}/signin`, signInUser)
router.post(`${path}/add`, postUser)
router.post(`${path}/update`, postUpdateUser)
router.delete(`${path}/delete/:id`, deleteUser)

module.exports = router;