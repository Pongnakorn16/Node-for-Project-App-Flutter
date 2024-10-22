import express from "express";
import { conn, queryAsync } from "../db.connect";
import { json } from "body-parser";
import { DV_order, DV_user, MB_cart, MB_user, SED, UpdateImage, UpdateScore, UploadImage, UserPostRequest, Vote } from "./model/Model_for_api";
import { UserPutRequest } from "./model/Model_for_api";
import mysql from 'mysql';
import { log } from "console";

export const router = express.Router(); // Router คือตัวจัดการเส้นทาง


router.get("/user", (req, res)=>{

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


router.get("/get_Rider_History", (req, res)=>{

    const sql = "select * from DV_order where dv_status = 4";
    conn.query(sql, (err,result)=>{
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



router.put("/add_prize/:lid/:prize/:uid", (req, res) => {
    const lid = req.params.lid; 
    const Prize = req.params.prize;
    const uid = req.params.uid; 

    console.log('Received INFO:', lid);
    console.log('Received INFO:', Prize);
    console.log('Received INFO:', uid);

    // อัปเดต Wallet ใน MB_user
    const updateWalletSql = "UPDATE MB_user SET Wallet = Wallet + ? where uid = ?";
    conn.query(updateWalletSql, [Prize,uid], (err) => {
        if (err) {
            console.error('Error updating wallet:', err);
            return res.status(400).json({ error: err.message });
        }
        
        const InsertWalletSql = "SELECT Numbers FROM MB_lottery WHERE lid = ?";
conn.query(InsertWalletSql, [lid], (err, results) => {
    if (err) {
        console.error('Error retrieving number:', err);
        return res.status(400).json({ error: err.message });
    }

    // ตรวจสอบว่ามีผลลัพธ์จากการค้นหาหรือไม่
    if (results.length > 0) {
        const h_number = results[0].Numbers;

        // ทำการ INSERT ข้อมูลเข้า MB_history รวมถึง h_number
        const insertHistorySql = "INSERT INTO MB_history (h_wallet, h_uid, h_lid, h_number) VALUES (?, ?, ?, ?)";
        conn.query(insertHistorySql, [Prize, uid, lid, h_number], (err) => {
            if (err) {
                console.error('Error inserting into history:', err);
                return res.status(400).json({ error: err.message });
            }

                });
            } else {
                return res.status(400).json({ message: `Lottery number not found for lid ${lid}` });
            }
                
                // ลบข้อมูลใน MB_lottery
                const deleteSql = "DELETE FROM MB_lottery WHERE lid = ?";
                conn.query(deleteSql, [lid], (err) => {
                    if (err) {
                        console.error('Error deleting from lottery:', err);
                        return res.status(400).json({ error: err.message });
                    }

                    // ส่งผลลัพธ์กลับหากทุกอย่างสำเร็จ
                    res.json({
                        message: "CashOut successful, cart cleared, and wallet updated",
                    });
                });
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


    router.put("/user/top_up/:uid", (req, res) => {
        const uid = req.params.uid;
        const TopUp_wallet = req.body; 
        
        console.log('Received INFO UID:', uid);
        console.log('Received INFO Top UP wallet:', TopUp_wallet);
        
        // อัปเดต Username ใน MB_user
        const updateWalletSql = "UPDATE MB_user SET Wallet = Wallet + ? WHERE uid = ?";
        conn.query(updateWalletSql, [TopUp_wallet.Wallet, uid], (err) => {
            if (err) {
                console.error('Error updating username:', err);
                return res.status(400).json({ error: err.message });
            }
            res.json({
                message: "Top up successful",
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


    router.put("/lotterys/randomPrize", (req, res) => {
        // สร้างอาร์เรย์ของค่ารางวัลที่ไม่ซ้ำกัน
        const prizes = [1, 2, 3, 4, 5];
    
        // สุ่มเรียงลำดับอาร์เรย์ของค่ารางวัล
        prizes.sort(() => Math.random() - 0.5);
    
        // ตรวจสอบว่ามี Status_prize ที่มากกว่า 0 อยู่ในฐานข้อมูลหรือไม่
        const checkExistingPrizesSql = `
            SELECT COUNT(*) AS count
            FROM MB_lottery
            WHERE Status_prize > 0
        `;
        
        conn.query(checkExistingPrizesSql, (err, results) => {
            if (err) {
                console.error('Error checking existing prizes:', err);
                return res.status(400).json({ error: err.message });
            }
    
            // ถ้ามี Status_prize ที่มากกว่า 0 อยู่แล้ว
            if (results[0].count > 0) {
                return res.status(400).json({ error: "Some prizes already have a value greater than 0" });
            }
    
            // ถ้าไม่มี Status_prize ที่มากกว่า 0 ให้ทำการอัพเดต
            const updateWalletSql = `
                UPDATE MB_lottery
                JOIN (
                    SELECT lid, ROW_NUMBER() OVER (ORDER BY RAND()) AS rn
                    FROM MB_lottery
                    LIMIT 5
                ) AS selected
                ON MB_lottery.lid = selected.lid
                SET MB_lottery.Status_prize = CASE selected.rn
                    WHEN 1 THEN ?
                    WHEN 2 THEN ?
                    WHEN 3 THEN ?
                    WHEN 4 THEN ?
                    WHEN 5 THEN ?
                END
            `;
    
            // ส่งค่าในอาร์เรย์ prizes ไปยังคำสั่ง SQL
            conn.query(updateWalletSql, prizes, (err) => {
                if (err) {
                    console.error('Error updating Status_prize:', err);
                    return res.status(400).json({ error: err.message });
                }
                res.json({
                    message: "Random prize update successful with unique prizes",
                });
            });
        });
    });
    


    router.put("/lotterys/randomPrize_sold", (req, res) => {
        const checkExistingPrizesSql = `
            SELECT COUNT(*) AS count
            FROM MB_lottery
            WHERE Status_prize > 0
        `;
    
        conn.query(checkExistingPrizesSql, (err, results) => {
            if (err) {
                console.error('Error checking existing prizes:', err);
                return res.status(400).json({ error: err.message });
            }
    
            // ถ้ามี Status_prize ที่มากกว่า 0 อยู่แล้ว
            if (results[0].count > 0) {
                return res.status(400).json({ error: "already sold prize" });
            }
    
            const countRowsSql = `
                SELECT COUNT(*) AS count 
                FROM MB_lottery 
                WHERE Status_buy = 1
            `;
        
            // นับจำนวนแถวที่มี Status_buy = 1
            conn.query(countRowsSql, (err, result) => {
                if (err) {
                    console.error('Error counting rows:', err);
                    return res.status(400).json({ error: err.message });
                }
        
                const rowCount = result[0].count;
        
                if (rowCount === 0) {
                    return res.status(400).json({ error: "No sold lottery" });
                }
        
                // ถ้าจำนวนแถวน้อยกว่า 5 จะสุ่มตามจำนวนแถวที่มี
                const limit = Math.min(rowCount, 5);
                const prizes = Array.from({ length: limit }, (_, i) => i + 1);
                prizes.sort(() => Math.random() - 0.5);
        
                const updateWalletSql = `
                    UPDATE MB_lottery
                    JOIN (
                        SELECT lid, ROW_NUMBER() OVER (ORDER BY RAND()) AS rn
                        FROM MB_lottery
                        WHERE Status_buy = 1
                        LIMIT ?
                    ) AS selected
                    ON MB_lottery.lid = selected.lid
                    SET MB_lottery.Status_prize = CASE selected.rn
                        ${prizes.map((prize, index) => `WHEN ${index + 1} THEN ${prize}`).join(' ')}
                        ELSE MB_lottery.Status_prize
                    END
                    WHERE MB_lottery.Status_buy = 1
                `;
        
                // ส่งค่า limit ไปยังคำสั่ง SQL เพื่อกำหนด LIMIT
                conn.query(updateWalletSql, [limit], (err) => {
                    if (err) {
                        console.error('Error updating Status_prize:', err);
                        return res.status(400).json({ error: err.message });
                    }
                    res.json({
                        message: `Random prize update successful with unique prizes up to ${limit}`,
                    });
                });
            });
        });
    });
    
    
    


router.delete("/remove_cart/:lid", (req, res) => {
    const lid = req.params.lid; // รับค่า lid จากพารามิเตอร์

    console.log('Received INFO:', lid);

    // ลบแถวใน MB_cart
    const deleteSql = "DELETE FROM MB_cart WHERE c_lid = ?";

    conn.query(deleteSql, [lid], (err) => {
        if (err) {
            return res.status(400).json(err); // ส่ง error กลับหากมีปัญหาในการลบ
        }

        // ส่งการตอบกลับสำเร็จ
        res.status(200).json({ message: 'Item removed successfully' });
    });
});


router.delete('/reset', (req, res) => {
    const deleteCartSql = `DELETE FROM MB_cart`;  // เพิ่มการลบ MB_cart
    const deleteLotterySql = `DELETE FROM MB_lottery`;
    const deleteUserSql = `DELETE FROM MB_user WHERE uid != 1`;
    const deleteHistorySql = `DELETE FROM MB_history`;

    conn.query(deleteCartSql, (err) => {
        if (err) {
            console.error('Error deleting from MB_cart:', err);
            return res.status(400).json({ error: err.message });
        }

        conn.query(deleteLotterySql, (err) => {
            if (err) {
                console.error('Error deleting from MB_lottery:', err);
                return res.status(400).json({ error: err.message });
            }

            conn.query(deleteUserSql, (err) => {
                if (err) {
                    console.error('Error deleting from MB_user:', err);
                    return res.status(400).json({ error: err.message });
                }

                conn.query(deleteHistorySql, (err) => {
                    if (err) {
                        console.error('Error deleting from MB_history:', err);
                        return res.status(400).json({ error: err.message });
                    }

                    res.json({ message: 'Reset successful: All rows deleted except uid = 1' });
                });
            });
        });
    });
});




router.post('/checkResetCode', (req, res) => {
    const { password } = req.body;

    const checkPasswordSql = `
        SELECT COUNT(*) AS count 
        FROM MB_user 
        WHERE uid = 1 AND Password = ?
    `;

    conn.query(checkPasswordSql, [password], (err, results) => {
        if (err) {
            console.error('Error checking password:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (results[0].count > 0) {
            res.status(200).json({ message: 'Password correct' });
        } else {
            res.status(400).json({ error: 'Invalid password  ' });
        }
    });
});
