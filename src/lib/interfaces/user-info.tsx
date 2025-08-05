export interface Climber {
    id: string;
    uuid?: string; // Optional, if you want to keep it for legacy reasons
    first_name: string;
    last_name: string;
    nickname: string; // probably end up being FK to nickname table
    running_score: number;
    working_grade: number;
    ascents_of_next_grade: number;
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

