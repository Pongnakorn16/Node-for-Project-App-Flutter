import express from "express";
import { conn, queryAsync } from "../db.connect";
import { json } from "body-parser";
import { UpdateImage, UpdateScore, UploadImage, UserPostRequest, Vote } from "./model/Model_for_api";
import { UserPutRequest } from "./model/Model_for_api";

export const router = express.Router(); // Router คือตัวจัดการเส้นทาง


router.get("/", (req, res)=>{

        const sql = "select * from Movie4";
        conn.query(sql, (err, result)=>{
            if(err){
                res.status(400).json(err);
            }else{
                
                res.json(result);
            }
        });
});


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

router.get("/:uid",(req, res)=>{
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
    

    router.delete("/delete:pid",(req,res)=>{
        const pid = req.params.pid;
        let sql = "DELETE FROM vote WHERE pid = ?";
        conn.query(sql,[pid],(err,result)=>{
            if(err) {
                let sqlDeletePhoto = "DELETE FROM photo WHERE pid = ?";
            conn.query(sqlDeletePhoto, [pid], (err, result) => {
                if (err) throw err;
                res.status(200).json({
                    affected_row : result.affectedRows
                });
            });
            }
            let sqlDeletePhoto = "DELETE FROM photo WHERE pid = ?";
            conn.query(sqlDeletePhoto, [pid], (err, result) => {
                if (err) throw err;
                res.status(200).json({
                    affected_row : result.affectedRows
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

      let  sql =  "INSERT INTO `vote`(`pid`, `uid`) VALUES (?,?)";
        sql = mysql.format(sql,[
            v_pid,
            voteInfo.uid,
        ]);
        conn.query(sql, (err,result)=>{
            if(err) throw err;
            res.status(200).json({
                affected_row : result.affectedRows
            });
        });
    });