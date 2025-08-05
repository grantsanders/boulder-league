export interface Climber {
    id: string;
    first_name: string;
    last_name: string;
    nickname: string; // probably end up being FK to nickname table
    running_score: number;
    working_grade: number;
    ascents_of_next_grade: number;
}

export interface Nickname {
    id: string;
    submitted_by: string;
    climber_id: string;
    nickname: string;
}

export interface Identity {
    id: string;
}

