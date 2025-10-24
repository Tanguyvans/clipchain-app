export interface VideoData {
  id: string;
  username: string;
  fid: number;
  avatar: string;
  description: string;
  likes: number;
  comments: number;
  shares: number;
  videoUrl: string;
  castUrl: string;
  castHash: string;
  timestamp?: string;
  prompt?: string;
  hashtags?: string[];
  verified?: boolean;
}

export interface Creator {
  id: string;
  username: string;
  avatar: string;
  verified: boolean;
  videoCount: number;
  totalSpent?: string;
  totalEarned?: string;
  bio?: string;
  joinDate?: string;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string;
  stat: string;
  subStat: string;
  trend?: string;
  verified?: boolean;
}

export interface Template {
  id: string;
  title: string;
  emoji: string;
  prompt: string;
  previewImage?: string;
  useCount: number;
}

export type NavigationPage = 'feed' | 'discover' | 'create' | 'leaderboard' | 'profile';
