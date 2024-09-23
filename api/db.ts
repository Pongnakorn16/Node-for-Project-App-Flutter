import express from "express";
import { conn, queryAsync } from "../db.connect";
import { json } from "body-parser";
import { MB_cart, MB_user, SED, UpdateImage, UpdateScore, UploadImage, UserPostRequest, Vote } from "./model/Model_for_api";
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



router.get('/get_cart/:uid', (req, res) => {
    const uid = req.params.uid; // ดึงค่า uid จาก path parameter
  
    console.log('Received UID:', uid); // ตรวจสอบค่า uid ที่ได้รับ
  
    if (!uid) {
      return res.status(400).json({ error: 'Missing UID' });
    }
  
    // ใช้ค่า uidในการดึงข้อมูลจากฐานข้อมูล
    let sql = `
        SELECT c.*, l.* 
        FROM MB_cart c
        JOIN MB_lottery l ON c.c_lid = l.lid
        WHERE c.c_uid = ?
    `;
    sql = mysql.format(sql, [uid]);
  
    conn.query(sql, (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(200).json(result);
    });
  });
  



  router.post('/register/user', (req, res) => {
    const Userinfo = req.body;

    // ตรวจสอบ Email ในฐานข้อมูลก่อน
    let checkEmailSql = "SELECT * FROM MB_user WHERE Email = ?";
    conn.query(checkEmailSql, [Userinfo.Email], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        // ถ้ามี Email นี้อยู่ในระบบแล้ว
        if (result.length > 0) {
            return res.status(400).json({ error: 'Email นี้ทำได้เป็นสมาชิกแล้ว' });
        }

        // ถ้า Email นี้ยังไม่มีในระบบ ให้ดำเนินการ INSERT ข้อมูล
        let sql = "INSERT INTO MB_user (Email, Username, Password, Wallet, image) VALUES (?, ?, ?, ?, ?)";
        sql = mysql.format(sql, [
            Userinfo.Email,
            Userinfo.Username,
            Userinfo.Password,
            Userinfo.Wallet,
            Userinfo.image
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



router.post('/add_toCart', (req, res) => {
    const cartInfo : MB_cart =  req.body; // อาจต้องตรวจสอบชนิดของข้อมูลเพิ่มเติม

    console.log('Received Info:', req.body); // ตรวจสอบข้อมูลที่ได้รับ

    // ตรวจสอบว่ามี lid นี้อยู่ในฐานข้อมูลหรือไม่
    let checkSql = "SELECT * FROM MB_cart WHERE c_lid = ? AND c_uid = ?";
    checkSql = mysql.format(checkSql, [
        cartInfo.c_lid,
        cartInfo.c_uid
    ]);

    conn.query(checkSql, (checkErr, checkResult) => {
        if (checkErr) {
            console.error(checkErr);
            return res.status(500).json({ error: 'Database error' });
        }

        if (checkResult.length > 0) {
            // หากพบข้อมูลที่มีอยู่แล้วในฐานข้อมูล
            return res.status(409).json({ message: 'The item already exists in the cart' });
        } else {
            console.log()
            // หากไม่มีข้อมูลในฐานข้อมูล ทำการ INSERT ข้อมูลใหม่
            let insertSql = "INSERT INTO MB_cart (c_lid, c_uid) VALUES (?, ?)";
            insertSql = mysql.format(insertSql, [
                cartInfo.c_lid,
                cartInfo.c_uid
            ]);

            conn.query(insertSql, (insertErr, insertResult) => {
                if (insertErr) {
                    console.error(insertErr);
                    return res.status(500).json({ error: 'Database error' });
                }
                res.status(200).json({ affected_rows: insertResult.affectedRows });
            });
        }
    });
});





router.post('/users/login', (req, res) => {
    const Userinfo : MB_user = req.body;

    console.log(req.body); // ตรวจสอบข้อมูลที่ได้รับ

    let sql = "Select * from MB_user Where Email = ? and Password = ?";

    conn.query(sql, [Userinfo.Email,Userinfo.Password],(err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(result);
    });
});

    
router.post('/random', async (req, res) => {
    const lottery_numbers: string[] = req.body.numbers;

    console.log('Received numbers:', lottery_numbers);

    // กรองให้เหลือเฉพาะตัวเลขที่มีความยาว 6 หลัก
    const filtered_numbers = lottery_numbers.filter((num: string) => {
        const isSixDigits = num.length === 6;
        console.log(`Filtering number: ${num}, isSixDigits: ${isSixDigits}`);
        return isSixDigits;
    });

    console.log('Filtered numbers:', filtered_numbers);

    if (!Array.isArray(filtered_numbers) || !filtered_numbers.every(num => typeof num === 'string')) {
      return res.status(400).send('Invalid input: numbers should be an array of 6-digit strings');
    }

    const sql = 'INSERT INTO MB_lottery (Numbers) VALUES ?';
    const values = filtered_numbers.map(num => [num]);

    try {
      await conn.query(sql, [values]);
      res.status(200).send('Insert success');
    } catch (error) {
      console.error('Insert failed:', error);
      res.status(500).send('Insert failed');
    }
});



  

  router.get("/get_WinLottery", (req, res)=>{

    const sql = "select * from MB_lottery where Status_prize > 0 ORDER BY Status_prize ASC";
    conn.query(sql, (err, result)=>{
        if(err){
            res.status(400).json(err);
        }else{
            
            res.json(result);
        }
    });
});
  
  router.get("/get_allLottery", (req, res)=>{

    const sql = "select * from MB_lottery where Status_buy = 0";
    conn.query(sql, (err, result)=>{
        if(err){
            res.status(400).json(err);
        }else{
            
            res.json(result);
        }
    });
});

router.get("/get_Lottery", (req, res)=>{

    const sql = "select * from MB_lottery";
    conn.query(sql, (err, result)=>{
        if(err){
            res.status(400).json(err);
        }else{
            
            res.json(result);
        }
    });
});


router.get("/get_UserLottery/:uid", (req, res)=>{
    const uid = req.params.uid;
        const sql = "SELECT * FROM MB_lottery WHERE Owner_uid = ? ORDER BY CASE WHEN Status_prize = 0 THEN 2 WHEN Status_prize BETWEEN 1 AND 5 THEN 1 END, Status_prize ASC";
        conn.query(sql, [uid],(err, result) => {
            if(err){
                res.status(400).json(err);
            }else{
                res.json(result);
            }
        });
});


router.get("/get_history/:uid", (req, res) => {
    const uid = req.params.uid;
    const sql = "Select * from MB_history where h_uid = ? ORDER BY hid DESC";
    
    conn.query(sql, [uid], (err, result) => {
        if (err) {
            res.status(400).json(err);
        } else {
            res.json(result);
        }
    });
});


router.put("/purchase/:pay/:uid", (req, res) => {
    const uid = req.params.uid;
    const wallet_pay = req.params.pay;
    const lids = req.body.lids;

    console.log('Received INFO:', lids);

    if (!Array.isArray(lids) || lids.length === 0) {
        return res.status(400).json({ message: "Invalid or empty lids array" });
    }

    const updateWalletSql = "UPDATE MB_user SET Wallet = Wallet - ? WHERE uid = ?";
    conn.query(updateWalletSql, [wallet_pay, uid], (err) => {
        if (err) {
            return res.status(400).json(err);
        }

        const updateSql = "UPDATE MB_lottery SET Status_buy = 1, Owner_uid = ? WHERE lid IN (?)";
        conn.query(updateSql, [uid, lids], (err, result) => {
            if (err) {
                return res.status(400).json(err);
            }

            const h_wallet = Number(wallet_pay) / lids.length;

            lids.forEach((lid) => {
                // ดึงค่า Numbers จาก MB_lottery โดยใช้ lid
                const selectNumberSql = "SELECT Numbers FROM MB_lottery WHERE lid = ?";
                conn.query(selectNumberSql, [lid], (err, results) => {
                    if (err) {
                        return res.status(400).json(err);
                    }

                    // ตรวจสอบว่ามีผลลัพธ์จากการค้นหาหรือไม่
                    if (results.length > 0) {
                        const h_number = results[0].Numbers;

                        // ทำการ INSERT ข้อมูลเข้า MB_history รวมถึง h_number
                        const insertHistorySql = "INSERT INTO MB_history (h_wallet, h_uid, h_lid, h_number) VALUES (?, ?, ?, ?)";
                        conn.query(insertHistorySql, [h_wallet, uid, lid, h_number], (err) => {
                            if (err) {
                                return res.status(400).json(err);
                            }
                        });
                    } else {
                        return res.status(400).json({ message: `Lottery number not found for lid ${lid}` });
                    }
                });
            });



            const deleteSql = "DELETE FROM MB_cart WHERE c_uid = ?";
            conn.query(deleteSql, [uid], (err) => {
                if (err) {
                    return res.status(400).json(err);
                }

                res.json({
                    message: "Purchase successful, cart cleared, and wallet updated",
                    affectedRows: result.affectedRows
                });
            });
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
        const updateWalletSql = "UPDATE MB_user SET image =  ? WHERE uid = ?";
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
