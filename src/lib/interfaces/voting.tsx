export interface Vote {
    uuid: string;
    table_id: string;
    table_type: string;
    voter_id: string;
    vote_rank: number;
}

export interface ProfilePhotoCandidate {
    uuid: string;
    user_id: string;
    image_url: string;
    submitted_by: string;
}

export interface NicknameCandidate {
    id: string; // Changed from uuid to id for consistency
    uuid?: string; 
    user_id: string;
    nickname: string;
    submitted_by: string;
}