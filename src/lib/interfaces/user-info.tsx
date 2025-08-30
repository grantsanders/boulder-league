export interface Climber {
    id: string;
    uuid?: string; 
    first_name: string;
    last_name: string;
    nickname: string; // probably end up being FK to nickname table
    profile_photo_url?: string; // URL to the winning profile photo
    running_score: number;
    working_grade: number;
    ascents_of_next_grade: number;
    promotion_input_needed: boolean; // Field indicates if promotion input is needed
}

export interface Nickname {
    uuid: string;
    submitted_by: string;
    climber_uuid: string;
    nickname: string;
}

export interface Identity {
    uuid: string;
}
