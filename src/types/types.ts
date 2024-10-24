export interface User {
    id: string,
    username: string
  }

  export interface Restaurant {
    name: string;
    suggestedBy: User;
  }

  export interface Player {
    id: string;
    username: string;
    score: number;
  }

  export type Game = "wheel" | "quick-draw" | "plate-balance";
