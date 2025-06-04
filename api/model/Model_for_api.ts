export interface UserPostRequest {
    email:   string;
    username: string;
    password:   string;
    type: string;
}

export interface UserPutRequest {
    uid : number;
    email:   string;
    username: string;
    password:   string;
    Newpassword : string;
    type: string;
    bio: string;
    user_image: string;
}

export interface UpdateImage {
    pid : number;
    uid : number;
    image : string;
    upload : Date;
    score : number;
    win : number;
    lose : number;
}

export interface UploadImage {
    image_url : string;
}

export interface Vote {
    vote_uid: number;
    loser_pid: number;
    increase_score: number;
    decrease_score: number;
}

export interface SED {
    SED_score : number;
}


export interface UpdateScore {
    lose_pid : number;
    R_score_win : number;
    R_score_lose : number;
 }


 export interface MB_user {
    Email : string;
    Username : string;
    Password : string;
    Wallet : number;
    image : string;
 }


 export interface MB_cart {
    c_lid : number;
    c_uid : number;
 }

 export interface DV_user {
    Uid : number;
    Email : string;
    Name : string;
    Password : string;
    User_image : string;
    Address : string;
    Coordinate : string;
    User_type : string;
    License_plate : string;
 }

 export interface DV_rider {
    Address : string;
    Coordinate : string;
 }

 export interface DV_order {
    p_name : string;
    p_detail : string;
    se_uid : number;
    re_uid : number;
    ri_uid : number;
    dv_status : number;
 }

 export interface BP_customer {
    cus_id : number;
    cus_name : string;
    cus_email : string;
    cus_password : string;
    cus_phone : string;
    cus_image : string;
    cus_balance : number;
    cus_active_status : number;
 }

 export interface BP_rider {
    rid_id : number;
    rid_name : string;
    rid_email : string;
    rid_password : string;
    rid_phone : string;
    rid_image : string;
    rid_balance : number;
    rid_license : string;
    rid_rating : number;
    rid_active_status : number;
 }


 export interface BP_restaurant {
    res_id : number;
    res_email : string;
    res_password : string;
    res_phone : string;
    res_name : string;
    res_image : string;
    res_description : string;
    res_coordinates : string;
    res_opening_time : string;
    res_closing_time : string;
    res_rating : number;
    res_balance : number;
    res_active_status : number;
 }

