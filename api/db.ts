import express from "express";
import { conn, queryAsync } from "../db.connect";
import { json } from "body-parser";
import { SED, UpdateImage, UpdateScore, UploadImage, UserPostRequest, Vote } from "./model/Model_for_api";
import { UserPutRequest } from "./model/Model_for_api";

export const router = express.Router(); // Router คือตัวจัดการเส้นทาง


router.get("/admin/:type", (req, res)=>{

    const type = req.params.type;

        const sql = "select * from user2 where type != ?";
        conn.query(sql, [type], (err, result)=>{
            if(err){
                res.status(400).json(err);
            }else{
                
                res.json(result);
            }
        });
});

router.get("/:email/:password",(req, res)=>{
    const email = req.params.email;
    const password = req.params.password;
    //Bad code
    // const sql = "select * from trip where idx = " + id;

    //Good code
    const sql = "select * from user2 where email = ? and password = ?"

    conn.query(sql, [email,password], (err, result)=>{
        if(err){
            res.status(400).json(err);
        }else{
            res.json(result);
        }
    })

    // res.send("Method GET in trip.ts with : " + id);
});


router.get("/image",(req,res)=>{

    const sql = "select * from photo"

    conn.query(sql,(err, result)=>{
        if(err){
            res.status(400).json(err);
        }else{
            res.json(result);
        }
    })
});



router.get("/getSEDdate",(req,res)=>{

    const sql = "SELECT DATE_FORMAT(s_date, '%Y-%m-%d') AS date FROM ScoreEachDay ORDER BY sid DESC LIMIT 1"

    conn.query(sql,(err, result)=>{
        if(err){
            res.status(400).json(err);
        }else{
            res.json(result);
        }
    })
});


router.get("/getTopten",(req,res)=>{

    const sql = "SELECT pid,uid,image,score,(SELECT COUNT(*) FROM photo AS p WHERE p.score > photo.score) + 1 AS photo_No FROM photo ORDER BY score DESC"

    conn.query(sql,(err, result)=>{
        if(err){
            res.status(400).json(err);
        }else{
            res.json(result);
        }
    })
});


router.get("/getYesTopten",(req,res)=>{

    const sql = "SELECT *, ROW_NUMBER() OVER (ORDER BY s_score DESC) AS YesterdayRank FROM ScoreEachDay WHERE DATE(s_date) = DATE_SUB(CURDATE(), INTERVAL 1 DAY) ORDER BY s_score DESC;"

    conn.query(sql,(err, result)=>{
        if(err){
            res.status(400).json(err);
        }else{
            res.json(result);
        }
    })
});

router.get("/getRankTopten",(req,res)=>{

    const sql = `WITH RankedPhotos AS (
        SELECT 
            pid,
            uid,
            image,
            score,
            (SELECT COUNT(*) FROM photo AS p WHERE p.score > photo.score) + 1 AS photo_No 
        FROM 
            photo
    ),
    RankedScores AS (
        SELECT 
            COALESCE(rn, 0) AS Yesterday_photo_No,
            pid
        FROM 
            (SELECT 
                ROW_NUMBER() OVER (ORDER BY s_score DESC) AS rn,
                pid 
            FROM 
                ScoreEachDay 
            WHERE 
                DATE(s_date) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
            ) AS subquery
    )
    SELECT 
        RankedPhotos.pid,
        RankedPhotos.photo_No AS Today_photo_No,
        RankedScores.Yesterday_photo_No
    FROM 
        RankedPhotos
    LEFT JOIN 
        RankedScores ON RankedPhotos.pid = RankedScores.pid
    ORDER BY RankedPhotos.score DESC;
    `;

    conn.query(sql,(err, result)=>{
        if(err){
            res.status(400).json(err);
        }else{
            res.json(result);
        }
    })
});


router.get("/graphScore:pid", (req, res)=>{

    const pid = req.params.pid;

        const sql = "SELECT DATE_FORMAT(s_date, '%d/%m/%Y') AS s_date, s_score FROM (SELECT s_score, s_date FROM ScoreEachDay WHERE pid = ? ORDER BY s_date DESC LIMIT 7) AS temp  ORDER BY s_date ASC"
        conn.query(sql, [pid], (err, result)=>{
            if(err){
                res.status(400).json(err);
            }else{
                
                res.json(result);
            }
        });
});


router.get("/graphCurrentScore:pid", (req, res)=>{

    const pid = req.params.pid;

        const sql = "SELECT score, DATE_FORMAT(NOW(), '%d/%m/%Y') AS s_date FROM photo WHERE pid = ?"
        conn.query(sql, [pid], (err, result)=>{
            if(err){
                res.status(400).json(err);
            }else{
                
                res.json(result);
            }
        });
});


router.get("/image:uid",(req,res)=>{

    const uid = req.params.uid;

    const sql = "select pid,image,score from photo where uid=? order by score desc"

    conn.query(sql, [uid], (err, result)=>{
        if(err){
            res.status(400).json(err);
        }else{
            res.json(result);
        }
    })
});

router.get("/userall:uid",(req, res)=>{
    const id = req.params.uid;

    const sql = "select * from user2 where uid = ?"

    conn.query(sql, [id], (err, result)=>{ //sql มีตัวแปล 1 ตัวแปล จึงนำตัวแปล id ไปผูก
        if(err){
            res.status(400).json(err);
        }else{
            res.json(result);
        }
    })
});

router.get("/username:uid",(req, res)=>{
    const id = req.params.uid;

    const sql = "select username from user2 where uid = ?"

    conn.query(sql, [id], (err, result)=>{ //sql มีตัวแปล 1 ตัวแปล จึงนำตัวแปล id ไปผูก
        if(err){
            res.status(400).json(err);
        }else{
            res.json(result);
        }
    })
});


router.get("/toptenUser/:uid",(req, res)=>{
    const id = req.params.uid;

    const sql = "select * from user2 where uid = ?"

    conn.query(sql, [id], (err, result)=>{ //sql มีตัวแปล 1 ตัวแปล จึงนำตัวแปล id ไปผูก
        if(err){
            res.status(400).json(err);
        }else{
            res.json(result);
        }
    })
});

import mysql from "mysql";
import { log } from "console";
    //Post /trip + Data
    router.post("/",(req,res)=>{
        const trip : UserPostRequest = req.body;
        console.log(trip);
    
        let sqlCheck = "SELECT * FROM user2 WHERE email = ?";
        conn.query(sqlCheck, [trip.email], (err, result) => {
            if (err) {
                res.status(500).json({ error: "Internal Server Error" });
            } else {
                if (result.length > 0) {
                    res.status(200).json({ error: "Email already exists" });
                } else {
                    let sql = "INSERT INTO `user2`(`email`, `username`, `password`,`type`) VALUES (?,?,?,?)";
                    sql = mysql.format(sql, [
                        trip.email,
                        trip.username,
                        trip.password,
                        trip.type
                    ]);
                    conn.query(sql,(err,result)=>{
                        if(err) throw err;
                        res.status(201).json({
                            affected_row: result.affected_rowRows,
                            last_index : result.insertId
                        });
                    });
                }
            }
        });
    });
    

    router.delete("/delete:pid", (req, res) => {
        const pid = req.params.pid;
        let sqlDeleteScoreEachDay = "DELETE FROM ScoreEachDay WHERE pid = ?";
        conn.query(sqlDeleteScoreEachDay, [pid], (err, result) => {
            if (err) throw err;
            let sqlDeleteVote = "DELETE FROM vote WHERE winner_pid and loser_pid = ?";
            conn.query(sqlDeleteVote, [pid], (err, result) => {
                if (err) throw err;
                let sqlDeletePhoto = "DELETE FROM photo WHERE pid = ?";
                conn.query(sqlDeletePhoto, [pid], (err, result) => {
                    if (err) throw err;
                    res.status(200).json({
                        affected_row: result.affectedRows
                    });
                });
            });
        });
    });
    


    router.put("/:uid",async (req,res)=>{
        //Receive data
        const uid = req.params.uid;
        const trip : UserPutRequest = req.body;

        //Get Original data and wait util finish
        let sql = "select * from user2 where uid = ?";
        sql = mysql.format(sql, [uid]);
        const result = await queryAsync(sql);
        const jsonStr = JSON.stringify(result);
        const jsonObj = JSON.parse(jsonStr);
        const tripOriginal : UserPutRequest =jsonObj[0];
        

        //Merge data
        const updateTrip  = {...tripOriginal,...trip};
        //Check if new password exists and matches the original password
            if (trip.Newpassword && trip.password === tripOriginal.password) {
                updateTrip.password = trip.Newpassword;
            }else {
                updateTrip.password = tripOriginal.password;
            }
        console.log(trip);
        console.log(updateTrip);

        //Update to database
        sql =  "update  `user2` set `email`=?, `username`=?, `password`=?, `type`=?, `bio`=?, `user_image`=? where `uid`=?";
        sql = mysql.format(sql,[
            updateTrip.email,
            updateTrip.username,
            updateTrip.password,
            updateTrip.type,
            updateTrip.bio,
            updateTrip.user_image,
            uid
        ]);
        conn.query(sql, (err,result)=>{
            if(err) throw err;
            res.status(200).json({
                affected_row : result.affectedRows
            });
        });
    });

    router.post("/upload/:uid",async (req,res)=>{
        //Receive data
        const uid = req.params.uid;
        const image_url : UploadImage = req.body;

      let  sql =  "INSERT INTO `photo`(`uid`, `image`) VALUES (?,?)";
        sql = mysql.format(sql,[
            uid,
            image_url.image_url
        ]);
        conn.query(sql, (err,result)=>{
            if(err) throw err;
            res.status(200).json({
                affected_row : result.affectedRows
            });
        });
    });

    router.put("/update/:pid",async (req,res)=>{
        //Receive data
        const image_url : UploadImage = req.body;
        const pid = req.params.pid;

      let  sql =  "update  `photo` set `image`=? where `pid`=?";
        sql = mysql.format(sql,[
            image_url.image_url,
            pid
        ]);
        conn.query(sql, (err,result)=>{
            if(err) throw err;
            res.status(200).json({
                affected_row : result.affectedRows
            });
        });
    });


    router.put("/updateScore/:pid", async (req, res) => {
        // Receive data
        const Result_score: UpdateScore = req.body;
        const pid = req.params.pid;
    
        let sql = "UPDATE `photo` SET `score`=? WHERE `pid`=?";
        sql = mysql.format(sql, [
            Result_score.R_score_win,
            pid
        ]);
    
        conn.query(sql, (err, result) => {
            if (err) throw err;
    
            let sql_lose = "UPDATE `photo` SET `score`=? WHERE `pid`=?";
            sql_lose = mysql.format(sql_lose, [
                Result_score.R_score_lose,
                Result_score.lose_pid
            ]);
    
            conn.query(sql_lose, (err, result_lose) => {
                if (err) throw err;
                res.status(200).json({
                    affected_rows: {
                        winner: result.affectedRows,
                        loser: result_lose.affectedRows
                    }
                });
            });
        });
    });

    router.post("/vote/:v_pid",async (req,res)=>{
        //Receive data
        const v_pid = req.params.v_pid;
        const voteInfo : Vote = req.body;

      let  sql =  "INSERT INTO `vote`(`winner_pid`, `uid`, `loser_pid`, `increase_score`, `decrease_score`) VALUES (?,?,?,?,?)";
        sql = mysql.format(sql,[
            v_pid,
            voteInfo.vote_uid,
            voteInfo.loser_pid,
            voteInfo.increase_score,
            voteInfo.decrease_score,
        ]);
        conn.query(sql, (err,result)=>{
            if(err) throw err;
            res.status(200).json({
                affected_row : result.affectedRows
            });
        });
    });


    router.post("/SED/:pid",async (req,res)=>{
        //Receive data
        const SED_pid = req.params.pid;
        const SED_point : SED = req.body;

      let  sql =  "INSERT INTO `ScoreEachDay`(`pid`, `s_score`) VALUES (?,?)";
        sql = mysql.format(sql,[
            SED_pid,
            SED_point.SED_score
        ]);
        conn.query(sql, (err,result)=>{
            if(err) throw err;
            res.status(200).json({
                affected_row : result.affectedRows
            });
        });
    });


    router.put("/up/up:pid", async (req, res) => {
        // Receive data
        const SED_score = req.body;
        const pid = req.params.pid;
        
        let sql = "UPDATE `ScoreEachDay` SET `s_score`=?, `s_date`=NOW() WHERE `pid`=? AND DATE(`s_date`) = CURDATE()";
        sql = mysql.format(sql, [
            SED_score.SED_score,
            pid
        ]);
        
        conn.query(sql, (err, result) => {
            if (err) throw err;
            res.status(200).json({});
        });
    });