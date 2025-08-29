export interface Climber {
    id: string;
    first_name: string;
    last_name: string;
    nickname: string; // probably end up being FK to nickname table
    running_score: number;
    working_grade: number;
    ascents_of_next_grade: number;
    promotion_input_needed: boolean; // Field indicates if promotion input is needed
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
