import express from "express";

export const router = express.Router(); // Router คือตัวจัดการเส้นทาง

router.get("/", (req, res)=>{
    res.send("Method GET in index.ts")
});