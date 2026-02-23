export enum UserType {
    Ordinary = 'Ordinary',
    Pro = 'Pro',
}

export type User = {
    name: string;
    email: string;
    avatarPath?: string;
    password: string;
    type: UserType;
}