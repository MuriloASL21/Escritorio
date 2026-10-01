export interface Room {
    id: number;
    nome: string;
    tipo: "INDIVIDUAL" | "REUNIAO" | "DESCANSO" | "COZINHA";
    usuarioId: number | null;
}

export const rooms: Room[] = [
    {
        id: 1,
        nome: "Sala 01",
        tipo: "INDIVIDUAL",
        usuarioId: null
    },
    {
        id: 2,
        nome: "Sala 02",
        tipo: "INDIVIDUAL",
        usuarioId: null
    },
    {
        id: 3,
        nome: "Sala 03",
        tipo: "INDIVIDUAL",
        usuarioId: null
    },
    {
        id: 4,
        nome: "Sala de Reunião",
        tipo: "REUNIAO",
        usuarioId: null
    },
    {
        id: 5,
        nome: "Sala de Descanso",
        tipo: "DESCANSO",
        usuarioId: null
    },
    {
        id: 6,
        nome: "Cozinha",
        tipo: "COZINHA",
        usuarioId: null
    }
];