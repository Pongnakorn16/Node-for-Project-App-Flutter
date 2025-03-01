import express from "express";
import { conn, queryAsync } from "../db.connect";
import { json } from "body-parser";
import { DV_order, DV_rider, DV_user, MB_cart, MB_user, SED, UpdateImage, UpdateScore, UploadImage, UserPostRequest, Vote } from "./model/Model_for_api";
import { UserPutRequest } from "./model/Model_for_api";
import mysql from 'mysql';
import { log } from "console";

export const router = express.Router(); // Router คือตัวจัดการเส้นทาง


router.get("/users", (req, res)=>{

        const sql = "select * from MB_user";
        conn.query(sql, (err, result)=>{
            if(err){
                res.status(400).json(err);
            }else{
                
                res.json(result);
            }
        });
});

router.get("/user/:uid", (req, res)=>{
    const uid = req.params.uid;
        const sql = "select * from MB_user where uid = ?";
        conn.query(sql, [uid],(err, result) => {
            if(err){
                res.status(400).json(err);
            }else{
                res.json(result);
            }
        });
});


router.get("/get_cart", (req, res)=>{

    const sql = "select * from MB_cart";
    conn.query(sql, (err, result)=>{
        if(err){
            res.status(400).json(err);
        }else{
            
            res.json(result);
        }
    });
});




router.get("/get_Profile/:uid", (req, res)=>{
    const uid = req.params.uid;

    const sql = "select * from DV_user where uid = ?";
    conn.query(sql, [uid],(err, result)=>{
        if(err){
            res.status(400).json(err);
        }else{
            
            res.json(result);
        }
    });
});


router.get("/get_RiderProfile/:uid", (req, res)=>{
    const uid = req.params.uid;

    const sql = "select * from DV_user where uid = ?";
    conn.query(sql, [uid],(err, result)=>{
        if(err){
            res.status(400).json(err);
        }else{
            
            res.json(result);
        }
    });
});



  router.post('/register/user', (req, res) => {
    const Userinfo : DV_user = req.body;

    // ตรวจสอบ Email ในฐานข้อมูลก่อน
    let checkPhoneSql = "SELECT * FROM DV_user WHERE phone = ?";
    conn.query(checkPhoneSql, [Userinfo.Phone], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        // ถ้ามี Email นี้อยู่ในระบบแล้ว
        if (result.length > 0) {
            return res.status(400).json({ error: 'Phone นี้ทำได้เป็นสมาชิกแล้ว' });
        }

        // ถ้า Email นี้ยังไม่มีในระบบ ให้ดำเนินการ INSERT ข้อมูล
        let sql = "INSERT INTO DV_user (phone, password, name, user_image, address, coordinates, user_type, license_plate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        sql = mysql.format(sql, [
            Userinfo.Phone,
            Userinfo.Password,
            Userinfo.Name,
            Userinfo.User_image,
            Userinfo.Address,
            Userinfo.Coordinate,
            Userinfo.User_type,
            Userinfo.License_plate,
        ]);

        conn.query(sql, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(200).json({ affected_rows: result.affectedRows });
        });
    });
});


router.put('/editProfile/user', (req, res) => {
    const Userinfo: DV_user = req.body;

    // ถ้าไม่มีเบอร์โทรศัพท์นี้ในระบบ ให้ดำเนินการ UPDATE ข้อมูล
    let sql = "UPDATE DV_user SET phone = ?, password = ?, name = ?, address = ?, coordinates = ? WHERE uid = ?";
    sql = mysql.format(sql, [
        Userinfo.Phone,
        Userinfo.Password,
        Userinfo.Name,
        Userinfo.Address,
        Userinfo.Coordinate,
        Userinfo.Uid // เปลี่ยนจาก id เป็น uid
    ]);

    conn.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json({ affected_rows: result.affectedRows });
    });
});



router.post('/add_order', (req, res) => {
    const Orderinfo : DV_order = req.body;

        // ถ้า Email นี้ยังไม่มีในระบบ ให้ดำเนินการ INSERT ข้อมูล
        let sql = "INSERT INTO DV_order (p_name, p_detail, se_uid, re_uid, ri_uid, dv_status) VALUES (?, ?, ?, ?, ?, ?)";
        sql = mysql.format(sql, [
            Orderinfo.p_name,
            Orderinfo.p_detail,
            Orderinfo.se_uid,
            Orderinfo.re_uid,
            Orderinfo.ri_uid,
            Orderinfo.dv_status,
        ]);

        conn.query(sql, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(200).json({ affected_rows: result.affectedRows });
        });
    });




router.post('/users/login', (req, res) => {
    const Userinfo : DV_user = req.body;

    console.log(req.body); // ตรวจสอบข้อมูลที่ได้รับ

    let sql = "Select * from DV_user Where phone = ? and password = ?";

    conn.query(sql, [Userinfo.Phone,Userinfo.Password],(err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(result);
    });
});


router.get("/get_allOrder", (req, res)=>{

    const sql = "select * from DV_order";
    conn.query(sql, (err, result)=>{
        if(err){
            res.status(400).json(err);
        }else{
            
            res.json(result);
        }
    });
});


router.get("/get_NewOrder", (req, res) => {
    // คำสั่ง SQL เพื่อเลือก oid ล่าสุดจาก DV_user
    const sql = "SELECT oid FROM DV_order ORDER BY oid DESC LIMIT 1";
    
    conn.query(sql, (err, result) => {
        if (err) {
            res.status(400).json(err);
        } else {
            res.json(result);
        }
    });
});


router.get("/get_Send_Order/:uid", (req, res)=>{
    const uid = req.params.uid;

    const sql = "select * from DV_order where se_uid = ?";
    conn.query(sql, [uid],(err,result)=>{
        if(err){
            res.status(400).json(err);
        }else{
            
            res.json(result);
        }
    });
});

router.get("/get_SnackBar/:uid", (req, res)=>{
    const uid = req.params.uid;

    const sql = "select * from DV_order where se_uid = ? OR re_uid = ?";
    conn.query(sql, [uid,uid],(err,result)=>{
        if(err){
            res.status(400).json(err);
        }else{
            
            res.json(result);
        }
    });
});


router.get("/get_Receive_Order/:uid", (req, res)=>{
    const uid = req.params.uid;

    const sql = "select * from DV_order where re_uid = ?";
    conn.query(sql, [uid],(err,result)=>{
        if(err){
            res.status(400).json(err);
        }else{
            
            res.json(result);
        }
    });
});


router.get("/get_Rider_Order", (req, res)=>{

    const sql = "select * from DV_order where dv_status = 1";
    conn.query(sql, (err,result)=>{
        if(err){
            res.status(400).json(err);
        }else{
            
            res.json(result);
        }
    });
});


router.get("/get_Rider_History/:ri_uid", (req, res)=>{
    const ri_uid = req.params.ri_uid;

    const sql = "select * from DV_order where dv_status = 4 AND ri_uid = ?";
    conn.query(sql,[ri_uid],(err,result)=>{
        if(err){
            res.status(400).json(err);
        }else{
            
            res.json(result);
        }
    });
});


router.get("/get_Send/:uid", (req, res)=>{
    const uid = req.params.uid;

    const sql = "select * from DV_user where uid = ?";
    conn.query(sql, [uid],(err,result)=>{
        if(err){
            res.status(400).json(err);
        }else{
            
            res.json(result);
        }
    });
});



router.get("/get_Receive/:uid", (req, res)=>{
    const uid = req.params.uid;

    const sql = "select * from DV_user where uid = ?";
    conn.query(sql, [uid],(err,result)=>{
        if(err){
            res.status(400).json(err);
        }else{
            
            res.json(result);
        }
    });
});


router.get("/get_Rider/:uid", (req, res)=>{
    const uid = req.params.uid;

    const sql = "select * from DV_user where uid = ?";
    conn.query(sql, [uid],(err,result)=>{
        if(err){
            res.status(400).json(err);
        }else{
            
            res.json(result);
        }
    });
});


router.get("/get_Order/:se_uid/:re_uid", (req, res) => {
    const se_uid = req.params.se_uid; // รับค่า se_uid
    const re_uid = req.params.re_uid; // รับค่า re_uid

    // สร้างคำสั่ง SQL เพื่อดึงข้อมูลของ se_uid
    const sqlSeUid = "SELECT * FROM DV_user WHERE uid = ?";
    const sqlReUid = "SELECT * FROM DV_user WHERE uid = ?";

    // ดึงข้อมูลของ se_uid
    conn.query(sqlSeUid, [se_uid], (errSe, resultSe) => {
        if (errSe) {
            return res.status(400).json(errSe); // ส่งกลับข้อผิดพลาด
        }

        // ดึงข้อมูลของ re_uid
        conn.query(sqlReUid, [re_uid], (errRe, resultRe) => {
            if (errRe) {
                return res.status(400).json(errRe); // ส่งกลับข้อผิดพลาด
            }

            // ส่งผลลัพธ์แยกกัน
            return res.json({
                se_user: resultSe, // ผลลัพธ์สำหรับ se_uid
                re_user: resultRe  // ผลลัพธ์สำหรับ re_uid
            });
        });
    });
});




  
  router.get("/get_userSearch/:uid", (req, res)=>{
    const uid = req.params.uid;

    const sql = "select * from DV_user where uid != ? and user_type = 'user'";
    conn.query(sql,[uid], (err, result)=>{
        if(err){
            res.status(400).json(err);
        }else{
            
            res.json(result);
        }
    });
});


router.get("/get_SendOrder/:se_uid", (req, res)=>{
    const se_uid = req.params.se_uid;

    const sql = "select * from DV_order where se_uid = ?";
    conn.query(sql,[se_uid], (err, result)=>{
        if(err){
            res.status(400).json(err);
        }else{
            
            res.json(result);
        }
    });
});


router.get("/get_ReceiveOrder/:re_uid", (req, res)=>{
    const re_uid = req.params.re_uid;

    const sql = "select * from DV_order where re_uid = ?";
    conn.query(sql,[re_uid], (err, result)=>{
        if(err){
            res.status(400).json(err);
        }else{
            
            res.json(result);
        }
    });
});

router.get("/get_OneOrder/:oid", (req, res)=>{
    const oid = req.params.oid;

    const sql = "select * from DV_order where oid = ?";
    conn.query(sql,[oid], (err, result)=>{
        if(err){
            res.status(400).json(err);
        }else{
            
            res.json(result);
        }
    });
});


router.put("/update_status/:oid/:sts/:uid", (req, res) => {
    const oid = req.params.oid;
    const sts = req.params.sts;
    const uid = req.params.uid;
    
    console.log('Received INFO UID:', sts);
    
    // อัปเดต Username ใน MB_user
    const updateWalletSql = "UPDATE DV_order SET dv_status = ?, ri_uid = ? WHERE oid = ?";
    conn.query(updateWalletSql, [sts,uid, oid], (err) => {
        if (err) {
            console.error('Error updating username:', err);
            return res.status(400).json({ error: err.message });
        }
        res.json({
            message: "Top up successful",
        });
    });
});


router.put("/update_riderAddress/:ri_uid", (req, res) => {
    const ri_uid  = req.params.ri_uid;
    const riderInfo : DV_rider = req.body;

    
    // อัปเดต Username ใน MB_user
    const updateWalletSql = "UPDATE DV_user SET address = ?, coordinates = ? WHERE uid = ?";

    conn.query(updateWalletSql, [riderInfo.Address,riderInfo.Coordinate, ri_uid], (err) => {
        if (err) {
            console.error('Error updating username:', err);
            return res.status(400).json({ error: err.message });
        }
        res.json({
            message: "Top up successful",
        });
    });
});



router.put("/update_status_more/:oid/:sts", (req, res) => {
    const oid = req.params.oid;
    const sts = req.params.sts;
    
    console.log('Received INFO UID:', sts);
    
    // อัปเดต Username ใน MB_user
    const updateWalletSql = "UPDATE DV_order SET dv_status = ? WHERE oid = ?";
    conn.query(updateWalletSql, [sts, oid], (err) => {
        if (err) {
            console.error('Error updating username:', err);
            return res.status(400).json({ error: err.message });
        }
        res.json({
            message: "Top up successful",
        });
    });
});




    router.put("/user/change_name/:uid", (req, res) => {
        const uid = req.params.uid;
        const new_name = req.body; // new_name จะเป็น object ที่มี key คือ Username
        
        console.log('Received INFO UID:', uid);
        console.log('Received INFO NEW NAME:', new_name);
        
        // อัปเดต Username ใน MB_user
        const updateNameSql = "UPDATE MB_user SET Username = ? WHERE uid = ?";
        conn.query(updateNameSql, [new_name.Username, uid], (err) => {
            if (err) {
                console.error('Error updating username:', err);
                return res.status(400).json({ error: err.message });
            }
            res.json({
                message: "Change name successful",
            });
        });
    });




    router.put("/user/change_image/:uid", (req, res) => {
        const uid = req.params.uid;
        const url_image = req.body; 
        
        console.log('Received INFO UID:', uid);
        console.log('Received INFO URL_image:', url_image);
        
        // อัปเดต Username ใน MB_user
        const updateWalletSql = "UPDATE DV_user SET user_image =  ? WHERE uid = ?";
        conn.query(updateWalletSql, [url_image.url_image, uid], (err) => {
            if (err) {
                console.error('Error updating username:', err);
                return res.status(400).json({ error: err.message });
            }
            res.json({
                message: "Image change successful",
            });
        });
    });
