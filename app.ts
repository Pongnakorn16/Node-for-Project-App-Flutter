import express from "express";
import {router as index} from "./api/index"
import {router as trip} from "./api/trip"
import {router as upload} from "./api/upload"
import bodyParser from "body-parser";
import cors from "cors";

export const app = express();

app.use(
  cors({
    origin: ["http://localhost:4200", "https://dok-test.web.app/"],
  })
);


app.use(bodyParser.text());
app.use(bodyParser.json());
app.use("/", index);
app.use("/trip", trip);
app.use("/upload", upload);
app.use("/uploads",express.static("uploads"));

//application จะมีลำดับการทำงานยังไงบ้าง // req = Request  res = Response     
// app.use("/",(req, res)=>{     
//     res.send("Hello world!!!");
// });