import express from "express";
import { conn, queryAsync } from "../db.connect";
import { json } from "body-parser";
import { BP_customer, BP_restaurant, BP_rider, DV_order, DV_rider, DV_user, MB_cart, MB_user, SED, UpdateImage, UpdateScore, UploadImage, UserPostRequest, Vote } from "./model/Model_for_api";
import { UserPutRequest } from "./model/Model_for_api";
import mysql from 'mysql';
import { log } from "console";

export const router = express.Router(); // Router คือตัวจัดการเส้นทาง


router.get("/get/customer", (req, res)=>{

        const sql = "select * from BP_customer";
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



router.post('/register/customer', (req, res) => {
    console.log("Received body:", req.body);  // ดูว่า req.body มีข้อมูลหรือไม่

    const Cusinfo: BP_customer = req.body;
    console.log("Received data:", Cusinfo.email);


    // ตรวจสอบข้อมูลที่จำเป็น
    if (!Cusinfo.name || !Cusinfo.email || !Cusinfo.password || !Cusinfo.phone) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // ตรวจสอบ Email ในฐานข้อมูลก่อน
    let checkEmailSql = `
  SELECT email FROM BP_restaurant WHERE email = ? 
  UNION 
  SELECT email FROM BP_customer WHERE email = ? 
  UNION 
  SELECT email FROM BP_rider WHERE email = ?;
`;
    conn.query(checkEmailSql, [Cusinfo.email,Cusinfo.email,Cusinfo.email], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        // ถ้ามี Email นี้อยู่ในระบบแล้ว
        if (result.length > 0) {
            return res.status(400).json({ error: 'Email นี้ทำได้เป็นสมาชิกแล้ว' });
        }

        // ถ้า Email นี้ยังไม่มีในระบบ ให้ดำเนินการ INSERT ข้อมูล
        let sql = "INSERT INTO BP_customer (name, email, password, phone) VALUES (?, ?, ?, ?)";
        sql = mysql.format(sql, [
            Cusinfo.name,
            Cusinfo.email,
            Cusinfo.password,
            Cusinfo.phone,
        ]);

        conn.query(sql, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Database error' });
            }

            // ส่งผลลัพธ์กลับไป
            res.status(200).json({ 
                message: 'Registration successful', 
                userId: result.insertId,  // ส่ง userId ที่เพิ่งถูกสร้าง
                affectedRows: result.affectedRows 
            });
        });
    });
});



router.post('/register/rider', (req, res) => {
    const Ridinfo : BP_rider = req.body;

    // ตรวจสอบ Email ในฐานข้อมูลก่อน
    let checkEmailSql = `
  SELECT email FROM BP_restaurant WHERE email = ? 
  UNION 
  SELECT email FROM BP_customer WHERE email = ? 
  UNION 
  SELECT email FROM BP_rider WHERE email = ?;
`;

    conn.query(checkEmailSql, [Ridinfo.email,Ridinfo.email,Ridinfo.email], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        // ถ้ามี Email นี้อยู่ในระบบแล้ว
        if (result.length > 0) {
            return res.status(400).json({ error: 'Email นี้ทำได้เป็นสมาชิกแล้ว' });
        }

        // ถ้า Email นี้ยังไม่มีในระบบ ให้ดำเนินการ INSERT ข้อมูล
        let sql = "INSERT INTO BP_rider (name, email, password, phone, license) VALUES (?, ?, ?, ?, ?)";
        sql = mysql.format(sql, [
            Ridinfo.name,
            Ridinfo.email,
            Ridinfo.password,
            Ridinfo.phone,
            Ridinfo.license,
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



router.post('/register/restaurant', (req, res) => {
    const Resinfo : BP_restaurant = req.body;

    // ตรวจสอบ Email ในฐานข้อมูลก่อน
    let checkEmailSql = `
  SELECT email FROM BP_restaurant WHERE email = ? 
  UNION 
  SELECT email FROM BP_customer WHERE email = ? 
  UNION 
  SELECT email FROM BP_rider WHERE email = ?;
`;
    conn.query(checkEmailSql, [Resinfo.email,Resinfo.email,Resinfo.email], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        // ถ้ามี Email นี้อยู่ในระบบแล้ว
        if (result.length > 0) {
            return res.status(400).json({ error: 'Email นี้ทำได้เป็นสมาชิกแล้ว' });
        }

        // ถ้า Email นี้ยังไม่มีในระบบ ให้ดำเนินการ INSERT ข้อมูล
        let sql = "INSERT INTO BP_restaurant (email, password, phone, name) VALUES (?, ?, ?, ?)";
        sql = mysql.format(sql, [
            Resinfo.email,
            Resinfo.password,
            Resinfo.phone,
            Resinfo.name,
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




    router.post('/users/login', async (req, res) => {
        const Userinfo: DV_user = req.body;
        console.log(req.body); // ตรวจสอบข้อมูลที่ได้รับ
    
        const tables = ["BP_customer", "BP_restaurant", "BP_rider", "BP_admin"];
        let userData = null;
    
        for (const table of tables) {
            let sql = `SELECT *, '${table}'  WHERE email = ? AND password = ?`;
    
            try {
                const result = await new Promise((resolve, reject) => {
                    conn.query(sql, [Userinfo.Phone, Userinfo.Password], (err, results) => {
                        if (err) reject(err);
                        else resolve(results);
                    });
                });
    
                if (Array.isArray(result) && result.length > 0) {
                    userData = result[0]; // พบข้อมูลใน Table ใด Table หนึ่ง
                    break;
                }
            } catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Database error' });
            }
        }
    
        if (userData) {
            res.status(200).json(userData);
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
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
