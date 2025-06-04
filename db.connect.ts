import mysql from "mysql";
import util from "util";

export const conn = mysql.createPool(
    {
        connectionLimit : 10,
        host : "191.101.230.103",
        user : "u528477660_dinny",
        password : "B2YSos&$",
        database : "u528477660_dinny"
    }
    // {
    //     connectionLimit : 10,
    //     host : "202.28.34.197",
    //     user : "web66_65011212066",
    //     password : "65011212066@csmsu",
    //     database : "web66_65011212066"
    // }
)

export const queryAsync = util.promisify(conn.query).bind(conn);