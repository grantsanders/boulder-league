export interface Vote {
    id: string;
    voter_id: string;
    vote_type: 'upvote' | 'downvote';
    target_type: 'nickname' | 'profile_photo';
    target_id: string;
    created_at: string;
}

export interface VoteCount {
    id: string;
    target_id: string;
    target_type: 'nickname' | 'profile_photo';
    upvotes: number;
    downvotes: number;
    net_votes: number;
}

export interface VoteSummary {
    id: string; // Changed from uuid to id for consistency
    uuid?: string;
    target_id: string;
    target_type: 'nickname' | 'profile_photo';
    upvotes: number;
    downvotes: number;
    net_votes: number;
    user_vote?: 'upvote' | 'downvote' | null;
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