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

