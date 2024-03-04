import express from "express";
import multer from "multer";
import path from "path";
import { conn, queryAsync } from "../db.connect";
import { json } from "body-parser";
import { UserPostRequest } from "./model/Model_for_api";
import { UserPutRequest } from "./model/Model_for_api";

export const router = express.Router(); // Router คือตัวจัดการเส้นทาง

//GET/upload
router.get("/", (req, res)=>{
    res.send("Method GET in upload.ts");
});

//Save for local device

// class FileMiddleware {
//     //Atribute of class
//     filename = "";
//     //Atribute diskLoader for saving file to disk 
//     public readonly diskLoader = multer({
//         //diskStorage = saving file to disk
//       storage: multer.diskStorage({
//         // desination = folder to be saved
//         destination: (_req, _file, cb) => {
//           cb(null, path.join(__dirname, "../uploads"));
//         },
//         //filename = unique filename to be saved
//         filename: (req, file, cb) => {
//           const uniqueSuffix =
//             Date.now() + "-" + Math.round(Math.random() * 10000);
//           this.filename = uniqueSuffix + "." + file.originalname.split(".").pop();
//           cb(null, this.filename);
//         },
//       }),
//       // limit file size
//       limits: {
//         fileSize: 67108864, // 64 MByte
//       },
//     });
//   }
  
//   //Post/upload + file
//   const fileUpload = new FileMiddleware();
//     router.post("/",fileUpload.diskLoader.single("file"),(req,res)=>{
//         res.status(200).json({
//             filename : '/uploads/'+fileUpload.filename
//         })
//     });

const firebaseConfig = {
    apiKey: "AIzaSyAg9w3wdbXQ9bgPBIuD1KBifGFn-9TXSSU",
    authDomain: "dok-test.firebaseapp.com",
    projectId: "dok-test",
    storageBucket: "dok-test.appspot.com",
    messagingSenderId: "1033317338879",
    appId: "1:1033317338879:web:6fe1d270af8e2f4c2906ca",
    measurementId: "G-6NKP83HWJ4"
  };
  import {initializeApp} from "firebase/app"
  import {getStorage, ref, uploadBytesResumable, getDownloadURL} from "firebase/storage";
  //Connect to firebase
    initializeApp(firebaseConfig);
  //Connect to Storage
  const storage = getStorage();

  //Middleware save to memory
  class FileMiddleware {
    //Atribute of class
    filename = "";
    //Atribute diskLoader for saving file to disk 
    public readonly diskLoader  = multer({
        //diskStorage = saving file to disk
      storage: multer.memoryStorage(),
      // limit file size
      limits: {
        fileSize: 67108864, // 64 MByte
      },
    });
  }
  
  //Post/upload + file
  const fileUpload = new FileMiddleware();
     router.post("/",fileUpload.diskLoader.single("file"), async (req,res)=>{
        //Upload to firebase storage
        const filename = Math.round(Math.random() * 100000) + ".png";
        //Define location to be saved on image
        const storageRef = ref(storage, "/images/" + filename);
        //Define file detail
        const metaData = { contentType : req.file!.mimetype };
        //Start upload
        const snapshot = await uploadBytesResumable(storageRef, req.file!.buffer, metaData);
        //Get url of image from storage
        const url = await getDownloadURL(snapshot.ref);
        res.status(200).json({
            filename : url,
        })
    });


      const User_image = new FileMiddleware();
     router.post("/:username",User_image.diskLoader.single("file"), async (req,res)=>{
        //Upload to firebase storage
        const filename = Math.round(Math.random() * 100000) + ".png";
        //Define location to be saved on image
        const storageRef = ref(storage, "/user_images/" + filename);
        //Define file detail
        const metaData = { contentType : req.file!.mimetype };
        //Start upload
        const snapshot = await uploadBytesResumable(storageRef, req.file!.buffer, metaData);
        //Get url of image from storage
        const url = await getDownloadURL(snapshot.ref);
        res.status(200).json({
            filename : url,
        })
    });