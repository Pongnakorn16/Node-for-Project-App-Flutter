import http from "http";
import {app} from "./app";

const port  = process.env.port || 3005 //แปลว่าไปดูใน environment ในเครื่องว่ามีตัวแปล port มั้ย ถ้าไม่มีให้เปิดที่ port 3000
const server = http.createServer(app);

server.listen(port,()=>{
    console.log("Server is Started");

});   // เปิด port 3000 ขึ้นและถ้าเจอให้ทำอะไร