export type UserRole = "ADMIN" | "MEMBRO";

export interface User {
    id: number;
    nome: string;
    email: string;
    role: UserRole;
    salaId: number | null;
}