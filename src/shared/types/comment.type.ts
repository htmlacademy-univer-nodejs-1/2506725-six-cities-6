import { User } from './user.type.js';

export type Comment = {
    text: string;
    createdAt: string;
    rating: number;
    author: User;
}