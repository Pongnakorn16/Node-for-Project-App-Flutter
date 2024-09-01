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
  
    // ใช้ค่า uid ในการดึงข้อมูลจากฐานข้อมูล
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
    const Userinfo : MB_user = req.body;

    console.log(req.body); // ตรวจสอบข้อมูลที่ได้รับ

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
    const lottery_numbers = req.body.numbers;
  
    console.log('Received numbers:', lottery_numbers); // เพิ่มตรงนี้
  
    if (!Array.isArray(lottery_numbers) || !lottery_numbers.every(num => typeof num === 'string')) {
      return res.status(400).send('Invalid input: numbers should be an array of strings');
    }
  
    const sql = 'INSERT INTO MB_lottery (Numbers) VALUES ?';
    const values = lottery_numbers.map(num => [num]);
  
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
    const updateWalletSql = "UPDATE MB_user SET Wallet = Wallet + ?";
    conn.query(updateWalletSql, [Prize], (err) => {
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




// router.get("/:email/:password",(req, res)=>{
//     const email = req.params.email;
//     const password = req.params.password;
//     //Bad code
//     // const sql = "select * from trip where idx = " + id;

//     //Good code
//     const sql = "select * from user2 where email = ? and password = ?"

//     conn.query(sql, [email,password], (err, result)=>{
//         if(err){
//             res.status(400).json(err);
//         }else{
//             res.json(result);
//         }
//     })

//     // res.send("Method GET in trip.ts with : " + id);
// });


// router.get("/image",(req,res)=>{

//     const sql = "select * from photo"

//     conn.query(sql,(err, result)=>{
//         if(err){
//             res.status(400).json(err);
//         }else{
//             res.json(result);
//         }
//     })
// });



// router.get("/getSEDdate",(req,res)=>{

//     const sql = "SELECT DATE_FORMAT(s_date, '%Y-%m-%d') AS date FROM ScoreEachDay ORDER BY sid DESC LIMIT 1"

//     conn.query(sql,(err, result)=>{
//         if(err){
//             res.status(400).json(err);
//         }else{
//             res.json(result);
//         }
//     })
// });


// router.get("/getTopten",(req,res)=>{

//     const sql = "SELECT pid,uid,image,score,(SELECT COUNT(*) FROM photo AS p WHERE p.score > photo.score) + 1 AS photo_No FROM photo ORDER BY score DESC"

//     conn.query(sql,(err, result)=>{
//         if(err){
//             res.status(400).json(err);
//         }else{
//             res.json(result);
//         }
//     })
// });


// router.get("/getYesTopten",(req,res)=>{

//     const sql = "SELECT *,ROW_NUMBER() OVER (ORDER BY s_score DESC) AS YesterdayRank FROM ScoreEachDay WHERE DATE(s_date) = DATE_SUB(CURDATE(), INTERVAL 1 DAY) ORDER BY s_score DESC;"

//     conn.query(sql,(err, result)=>{
//         if(err){
//             res.status(400).json(err);
//         }else{
//             res.json(result);
//         }
//     })
// });

// router.get("/getRankTopten",(req,res)=>{

//     const sql = `WITH RankedPhotos AS (
//         SELECT 
//             pid,
//             uid,
//             image,
//             score,
//             (SELECT COUNT(*) FROM photo AS p WHERE p.score > photo.score) + 1 AS photo_No 
//         FROM 
//             photo
//     ),
//     RankedScores AS (
//         SELECT 
//             COALESCE(rn, 0) AS Yesterday_photo_No,
//             pid
//         FROM 
//             (SELECT 
//                 ROW_NUMBER() OVER (ORDER BY s_score DESC) AS rn,
//                 pid 
//             FROM 
//                 ScoreEachDay 
//             WHERE 
//                 DATE(s_date) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
//             ) AS subquery
//     )
//     SELECT 
//         RankedPhotos.pid,
//         RankedPhotos.photo_No AS Today_photo_No,
//         RankedScores.Yesterday_photo_No
//     FROM 
//         RankedPhotos
//     LEFT JOIN 
//         RankedScores ON RankedPhotos.pid = RankedScores.pid
//     ORDER BY RankedPhotos.score DESC;
//     `;

//     conn.query(sql,(err, result)=>{
//         if(err){
//             res.status(400).json(err);
//         }else{
//             res.json(result);
//         }
//     })
// });


// router.get("/graphScore:pid", (req, res)=>{

//     const pid = req.params.pid;

//         const sql = "SELECT DATE_FORMAT(s_date, '%d/%m/%Y') AS s_date, s_score FROM (SELECT s_score, s_date FROM ScoreEachDay WHERE pid = ? ORDER BY s_date DESC LIMIT 7) AS temp  ORDER BY s_date ASC"
//         conn.query(sql, [pid], (err, result)=>{
//             if(err){
//                 res.status(400).json(err);
//             }else{
                
//                 res.json(result);
//             }
//         });
// });


// router.get("/graphCurrentScore:pid", (req, res)=>{

//     const pid = req.params.pid;

//         const sql = "SELECT score, DATE_FORMAT(NOW(), '%d/%m/%Y') AS s_date FROM photo WHERE pid = ?"
//         conn.query(sql, [pid], (err, result)=>{
//             if(err){
//                 res.status(400).json(err);
//             }else{
                
//                 res.json(result);
//             }
//         });
// });


// router.get("/image:uid",(req,res)=>{

//     const uid = req.params.uid;

//     const sql = "select pid,image,score from photo where uid=? order by score desc"

//     conn.query(sql, [uid], (err, result)=>{
//         if(err){
//             res.status(400).json(err);
//         }else{
//             res.json(result);
//         }
//     })
// });

// router.get("/userall:uid",(req, res)=>{
//     const id = req.params.uid;

//     const sql = "select * from user2 where uid = ?"

//     conn.query(sql, [id], (err, result)=>{ //sql มีตัวแปล 1 ตัวแปล จึงนำตัวแปล id ไปผูก
//         if(err){
//             res.status(400).json(err);
//         }else{
//             res.json(result);
//         }
//     })
// });

// router.get("/username:uid",(req, res)=>{
//     const id = req.params.uid;

//     const sql = "select username from user2 where uid = ?"

//     conn.query(sql, [id], (err, result)=>{ //sql มีตัวแปล 1 ตัวแปล จึงนำตัวแปล id ไปผูก
//         if(err){
//             res.status(400).json(err);
//         }else{
//             res.json(result);
//         }
//     })
// });


// router.get("/toptenUser/:uid",(req, res)=>{
//     const id = req.params.uid;

//     const sql = "select * from user2 where uid = ?"

//     conn.query(sql, [id], (err, result)=>{ //sql มีตัวแปล 1 ตัวแปล จึงนำตัวแปล id ไปผูก
//         if(err){
//             res.status(400).json(err);
//         }else{
//             res.json(result);
//         }
//     })
// });

// import mysql from "mysql";
// import { log } from "console";
//     //Post /trip + Data
//     router.post("/",(req,res)=>{
//         const trip : UserPostRequest = req.body;
//         console.log(trip);
    
//         let sqlCheck = "SELECT * FROM user2 WHERE email = ?";
//         conn.query(sqlCheck, [trip.email], (err, result) => {
//             if (err) {
//                 res.status(500).json({ error: "Internal Server Error" });
//             } else {
//                 if (result.length > 0) {
//                     res.status(200).json({ error: "Email already exists" });
//                 } else {
//                     let sql = "INSERT INTO `user2`(`email`, `username`, `password`,`type`) VALUES (?,?,?,?)";
//                     sql = mysql.format(sql, [
//                         trip.email,
//                         trip.username,
//                         trip.password,
//                         trip.type
//                     ]);
//                     conn.query(sql,(err,result)=>{
//                         if(err) throw err;
//                         res.status(201).json({
//                             affected_row: result.affected_rowRows,
//                             last_index : result.insertId
//                         });
//                     });
//                 }
//             }
//         });
//     });
    

//     router.delete("/delete:pid", (req, res) => {
//         const pid = req.params.pid;
//         let sqlDeleteScoreEachDay = "DELETE FROM ScoreEachDay WHERE pid = ?";
//         conn.query(sqlDeleteScoreEachDay, [pid], (err, result) => {
//             if (err) throw err;
//             let sqlDeleteVote = "DELETE FROM vote WHERE winner_pid and loser_pid = ?";
//             conn.query(sqlDeleteVote, [pid], (err, result) => {
//                 if (err) throw err;
//                 let sqlDeletePhoto = "DELETE FROM photo WHERE pid = ?";
//                 conn.query(sqlDeletePhoto, [pid], (err, result) => {
//                     if (err) throw err;
//                     res.status(200).json({
//                         affected_row: result.affectedRows
//                     });
//                 });
//             });
//         });
//     });
    


//     router.put("/:uid",async (req,res)=>{
//         //Receive data
//         const uid = req.params.uid;
//         const trip : UserPutRequest = req.body;

//         //Get Original data and wait util finish
//         let sql = "select * from user2 where uid = ?";
//         sql = mysql.format(sql, [uid]);
//         const result = await queryAsync(sql);
//         const jsonStr = JSON.stringify(result);
//         const jsonObj = JSON.parse(jsonStr);
//         const tripOriginal : UserPutRequest =jsonObj[0];
        

//         //Merge data
//         const updateTrip  = {...tripOriginal,...trip};
//         //Check if new password exists and matches the original password
//             if (trip.Newpassword && trip.password === tripOriginal.password) {
//                 updateTrip.password = trip.Newpassword;
//             }else {
//                 updateTrip.password = tripOriginal.password;
//             }
//         console.log(trip);
//         console.log(updateTrip);

//         //Update to database
//         sql =  "update  `user2` set `email`=?, `username`=?, `password`=?, `type`=?, `bio`=?, `user_image`=? where `uid`=?";
//         sql = mysql.format(sql,[
//             updateTrip.email,
//             updateTrip.username,
//             updateTrip.password,
//             updateTrip.type,
//             updateTrip.bio,
//             updateTrip.user_image,
//             uid
//         ]);
//         conn.query(sql, (err,result)=>{
//             if(err) throw err;
//             res.status(200).json({
//                 affected_row : result.affectedRows
//             });
//         });
//     });

//     router.post("/upload/:uid",async (req,res)=>{
//         //Receive data
//         const uid = req.params.uid;
//         const image_url : UploadImage = req.body;

//       let  sql =  "INSERT INTO `photo`(`uid`, `image`) VALUES (?,?)";
//         sql = mysql.format(sql,[
//             uid,
//             image_url.image_url
//         ]);
//         conn.query(sql, (err,result)=>{
//             if(err) throw err;
//             res.status(200).json({
//                 affected_row : result.affectedRows
//             });
//         });
//     });

//     router.put("/update/:pid",async (req,res)=>{
//         //Receive data
//         const image_url : UploadImage = req.body;
//         const pid = req.params.pid;

//       let  sql =  "update  `photo` set `image`=? where `pid`=?";
//         sql = mysql.format(sql,[
//             image_url.image_url,
//             pid
//         ]);
//         conn.query(sql, (err,result)=>{
//             if(err) throw err;
//             res.status(200).json({
//                 affected_row : result.affectedRows
//             });
//         });
//     });


//     router.put("/updateScore/:pid", async (req, res) => {
//         // Receive data
//         const Result_score: UpdateScore = req.body;
//         const pid = req.params.pid;
    
//         let sql = "UPDATE `photo` SET `score`=? WHERE `pid`=?";
//         sql = mysql.format(sql, [
//             Result_score.R_score_win,
//             pid
//         ]);
    
//         conn.query(sql, (err, result) => {
//             if (err) throw err;
    
//             let sql_lose = "UPDATE `photo` SET `score`=? WHERE `pid`=?";
//             sql_lose = mysql.format(sql_lose, [
//                 Result_score.R_score_lose,
//                 Result_score.lose_pid
//             ]);
    
//             conn.query(sql_lose, (err, result_lose) => {
//                 if (err) throw err;
//                 res.status(200).json({
//                     affected_rows: {
//                         winner: result.affectedRows,
//                         loser: result_lose.affectedRows
//                     }
//                 });
//             });
//         });
//     });

//     router.post("/vote/:v_pid",async (req,res)=>{
//         //Receive data
//         const v_pid = req.params.v_pid;
//         const voteInfo : Vote = req.body;

//       let  sql =  "INSERT INTO `vote`(`winner_pid`, `uid`, `loser_pid`, `increase_score`, `decrease_score`) VALUES (?,?,?,?,?)";
//         sql = mysql.format(sql,[
//             v_pid,
//             voteInfo.vote_uid,
//             voteInfo.loser_pid,
//             voteInfo.increase_score,
//             voteInfo.decrease_score,
//         ]);
//         conn.query(sql, (err,result)=>{
//             if(err) throw err;
//             res.status(200).json({
//                 affected_row : result.affectedRows
//             });
//         });
//     });


//     router.post("/SED/:pid",async (req,res)=>{
//         //Receive data
//         const SED_pid = req.params.pid;
//         const SED_point : SED = req.body;

//       let  sql =  "INSERT INTO `ScoreEachDay`(`pid`, `s_score`) VALUES (?,?)";
//         sql = mysql.format(sql,[
//             SED_pid,
//             SED_point.SED_score
//         ]);
//         conn.query(sql, (err,result)=>{
//             if(err) throw err;
//             res.status(200).json({
//                 affected_row : result.affectedRows
//             });
//         });
//     });


//     router.put("/up/up:pid", async (req, res) => {
//         // Receive data
//         const SED_score: UpdateScore = req.body;
//         const pid = req.params.pid;
    
//         let sql = "UPDATE `ScoreEachDay` SET `s_score`=?, `s_date`=NOW() WHERE `pid`=? AND DATE(`s_date`) = CURDATE()";
//         sql = mysql.format(sql, [
//             SED_score.R_score_win,
//             pid
//         ]);
    
//         conn.query(sql, (err, result) => {
//             if (err) throw err;
    
//             let sql_lose = "UPDATE `ScoreEachDay` SET `s_score`=?, `s_date`=NOW() WHERE `pid`=? AND DATE(`s_date`) = CURDATE()";
//             sql_lose = mysql.format(sql_lose, [
//                 SED_score.R_score_lose,
//                 SED_score.lose_pid
//             ]);
    
//             conn.query(sql_lose, (err, result_lose) => {
//                 if (err) throw err;
//                 res.status(200).json({
//                     affected_rows: {
//                         winner: result.affectedRows,
//                         loser: result_lose.affectedRows
//                     }
//                 });
//             });
//         });
//     });