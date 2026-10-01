import express from "express";
import cors from "cors";
import {
    WebSocketServer,
    WebSocket
} from "ws";

import { rooms } from "./rooms.js";


const app = express();

const PORT = 3000;


// ======================================================
// CONFIGURAÇÕES
// ======================================================

app.use(cors());

app.use(express.json());


// ======================================================
// TIPOS
// ======================================================

type UserRole =
    "ADMIN"
    | "MEMBRO";


interface User {

    id: number;

    nome: string;

    email: string;

    senha: string;

    role: UserRole;

    salaId: number | null;

}


// ======================================================
// USUÁRIOS
// ======================================================

const users: User[] = [

    {
        id: 1,

        nome: "Administrador",

        email: "admin@nexaoffice.com",

        senha: "123456",

        role: "ADMIN",

        salaId: null
    }

];


// ======================================================
// STATUS
// ======================================================

app.get("/", (_req, res) => {

    res.json({
        mensagem:
            "Nexa Office API funcionando!"
    });

});


app.get("/api/status", (_req, res) => {

    res.json({

        online: true,

        sistema:
            "Nexa Office"

    });

});


// ======================================================
// USUÁRIOS
// ======================================================

app.get("/api/users", (_req, res) => {

    res.json(users);

});


app.post("/api/users", (req, res) => {

    const {
        nome,
        email,
        senha,
        role,
        salaId
    } = req.body;


    if (
        !nome ||
        !email ||
        !senha ||
        !role
    ) {

        res.status(400).json({

            mensagem:
                "Preencha todos os campos obrigatórios."

        });

        return;

    }


    if (
        role !== "ADMIN" &&
        role !== "MEMBRO"
    ) {

        res.status(400).json({

            mensagem:
                "O tipo de usuário deve ser ADMIN ou MEMBRO."

        });

        return;

    }


    const emailExiste =
        users.some(
            (user) =>
                user.email === email
        );


    if (emailExiste) {

        res.status(400).json({

            mensagem:
                "Este e-mail já está cadastrado."

        });

        return;

    }


    const novoUsuario: User = {

        id:
            users.length + 1,

        nome,

        email,

        senha,

        role,

        salaId:
            salaId ?? null

    };


    users.push(novoUsuario);


    res.status(201).json(
        novoUsuario
    );

});


// ======================================================
// REMOVER USUÁRIO
// ======================================================

app.delete(
    "/api/users/:id",
    (req, res) => {

        const id =
            Number(req.params.id);


        if (id === 1) {

            res.status(400).json({

                mensagem:
                    "O administrador principal não pode ser removido."

            });

            return;

        }


        const indiceUsuario =
            users.findIndex(
                (user) =>
                    user.id === id
            );


        if (
            indiceUsuario === -1
        ) {

            res.status(404).json({

                mensagem:
                    "Usuário não encontrado."

            });

            return;

        }


        const usuarioRemovido =
            users[indiceUsuario];


        if (
            usuarioRemovido.salaId !== null
        ) {

            const sala =
                rooms.find(
                    (room) =>
                        room.id ===
                        usuarioRemovido.salaId
                );


            if (sala) {

                sala.usuarioId =
                    null;

            }

        }


        users.splice(
            indiceUsuario,
            1
        );


        res.json({

            mensagem:
                "Usuário removido com sucesso."

        });

    }
);


// ======================================================
// SALAS
// ======================================================

app.get("/api/rooms", (_req, res) => {

    res.json(rooms);

});


// ======================================================
// ATRIBUIR SALA
// ======================================================

app.put(
    "/api/users/:id/sala",
    (req, res) => {

        const usuarioId =
            Number(req.params.id);


        const {
            salaId
        } = req.body;


        const usuario =
            users.find(
                (user) =>
                    user.id === usuarioId
            );


        if (!usuario) {

            res.status(404).json({

                mensagem:
                    "Usuário não encontrado."

            });

            return;

        }


        if (
            usuario.role !== "MEMBRO"
        ) {

            res.status(400).json({

                mensagem:
                    "Somente membros podem receber uma sala."

            });

            return;

        }


        // ==========================================
        // REMOVER SALA
        // ==========================================

        if (
            salaId === null
        ) {

            if (
                usuario.salaId !== null
            ) {

                const salaAnterior =
                    rooms.find(
                        (room) =>
                            room.id ===
                            usuario.salaId
                    );


                if (salaAnterior) {

                    salaAnterior.usuarioId =
                        null;

                }

            }


            usuario.salaId =
                null;


            res.json({

                mensagem:
                    "Sala removida do usuário.",

                usuario

            });


            return;

        }


        // ==========================================
        // PROCURAR SALA
        // ==========================================

        const sala =
            rooms.find(
                (room) =>
                    room.id ===
                    Number(salaId)
            );


        if (!sala) {

            res.status(404).json({

                mensagem:
                    "Sala não encontrada."

            });

            return;

        }


        // ==========================================
        // VERIFICAR TIPO
        // ==========================================

        if (
            sala.tipo !==
            "INDIVIDUAL"
        ) {

            res.status(400).json({

                mensagem:
                    "Essa sala não é uma sala individual."

            });

            return;

        }


        // ==========================================
        // VERIFICAR OCUPAÇÃO
        // ==========================================

        if (
            sala.usuarioId !== null &&
            sala.usuarioId !== usuarioId
        ) {

            res.status(400).json({

                mensagem:
                    "Essa sala já está ocupada."

            });

            return;

        }


        // ==========================================
        // LIBERAR SALA ANTERIOR
        // ==========================================

        if (
            usuario.salaId !== null
        ) {

            const salaAnterior =
                rooms.find(
                    (room) =>
                        room.id ===
                        usuario.salaId
                );


            if (salaAnterior) {

                salaAnterior.usuarioId =
                    null;

            }

        }


        // ==========================================
        // ATRIBUIR NOVA SALA
        // ==========================================

        usuario.salaId =
            Number(salaId);


        sala.usuarioId =
            usuarioId;


        res.json({

            mensagem:
                "Sala atribuída com sucesso.",

            usuario,

            sala

        });

    }
);


// ======================================================
// CONSULTAR SALA DO USUÁRIO
// ======================================================

app.get(
    "/api/users/:id/sala",
    (req, res) => {

        const usuarioId =
            Number(req.params.id);


        const usuario =
            users.find(
                (user) =>
                    user.id === usuarioId
            );


        if (!usuario) {

            res.status(404).json({

                mensagem:
                    "Usuário não encontrado."

            });

            return;

        }


        if (
            usuario.salaId === null
        ) {

            res.json({

                sala: null

            });

            return;

        }


        const sala =
            rooms.find(
                (room) =>
                    room.id ===
                    usuario.salaId
            );


        res.json({

            sala:
                sala ?? null

        });

    }
);


// ======================================================
// LOGIN
// ======================================================

app.post(
    "/api/login",
    (req, res) => {

        const {
            email,
            senha
        } = req.body;


        const user =
            users.find(
                (user) =>
                    user.email === email &&
                    user.senha === senha
            );


        if (!user) {

            res.status(401).json({

                mensagem:
                    "E-mail ou senha incorretos."

            });

            return;

        }


        res.json({

            mensagem:
                "Login realizado com sucesso.",

            usuario: {

                id:
                    user.id,

                nome:
                    user.nome,

                email:
                    user.email,

                role:
                    user.role,

                salaId:
                    user.salaId

            }

        });

    }
);


// ======================================================
// INICIAR SERVIDOR HTTP
// ======================================================

const server =
    app.listen(
        PORT,
        () => {

            console.log(
                `Nexa Office Backend rodando em http://localhost:${PORT}`
            );

        }
    );


// ======================================================
// WEBSOCKET - MULTIPLAYER
// ======================================================

interface JogadorOnline {

    id: number;

    nome: string;

    x: number;

    y: number;

    salaId: number | null;

}


const jogadoresOnline =
    new Map<
        WebSocket,
        JogadorOnline
    >();


const wss =
    new WebSocketServer({

        server

    });


// ======================================================
// NOVA CONEXÃO
// ======================================================

wss.on(
    "connection",
    (socket: WebSocket) => {

        console.log(
            "Novo jogador conectado ao WebSocket."
        );


        // ==============================================
        // RECEBER MENSAGEM
        // ==============================================

        socket.on(
            "message",
            (mensagem: WebSocket.RawData) => {

                try {

                    const dados =
                        JSON.parse(
                            mensagem.toString()
                        );


                    // ==================================
                    // JOGADOR ENTROU
                    // ==================================

                    if (
                        dados.tipo ===
                        "ENTRAR"
                    ) {

                        const jogador:
                            JogadorOnline = {

                            id:
                                Number(dados.id),

                            nome:
                                String(dados.nome),

                            x:
                                Number(dados.x),

                            y:
                                Number(dados.y),

                            salaId:
                                dados.salaId === null
                                    ? null
                                    : Number(dados.salaId)

                        };


                        jogadoresOnline.set(
                            socket,
                            jogador
                        );


                        console.log(
                            `${jogador.nome} entrou no escritório.`
                        );


                        // ==================================
                        // ENVIAR JOGADORES EXISTENTES
                        // PARA O NOVO JOGADOR
                        // ==================================

                        for (
                            const outroJogador
                            of jogadoresOnline.values()
                        ) {

                            if (
                                outroJogador.id !==
                                jogador.id
                            ) {

                                socket.send(

                                    JSON.stringify({

                                        tipo:
                                            "JOGADOR_ENTROU",

                                        jogador:
                                            outroJogador

                                    })

                                );

                            }

                        }


                        // ==================================
                        // AVISAR OS OUTROS
                        // ==================================

                        transmitirParaOutros(

                            socket,

                            {

                                tipo:
                                    "JOGADOR_ENTROU",

                                jogador

                            }

                        );

                    }


                    // ==================================
                    // MOVIMENTO
                    // ==================================

                    if (
                        dados.tipo ===
                        "MOVER"
                    ) {

                        const jogador =
                            jogadoresOnline.get(
                                socket
                            );


                        if (!jogador) {

                            return;

                        }


                        jogador.x =
                            Number(dados.x);


                        jogador.y =
                            Number(dados.y);


                        if (
                            dados.salaId !==
                            undefined
                        ) {

                            jogador.salaId =
                                dados.salaId === null
                                    ? null
                                    : Number(
                                        dados.salaId
                                    );

                        }


                        transmitirParaOutros(

                            socket,

                            {

                                tipo:
                                    "JOGADOR_MOVEU",

                                jogador

                            }

                        );

                    }

                } catch (erro) {

                    console.error(

                        "Mensagem WebSocket inválida:",

                        erro

                    );

                }

            }
        );


        // ==============================================
        // JOGADOR DESCONECTOU
        // ==============================================

        socket.on(
            "close",
            () => {

                const jogador =
                    jogadoresOnline.get(
                        socket
                    );


                if (jogador) {

                    console.log(

                        `${jogador.nome} saiu do escritório.`

                    );


                    transmitirParaOutros(

                        socket,

                        {

                            tipo:
                                "JOGADOR_SAIU",

                            jogadorId:
                                jogador.id

                        }

                    );

                }


                jogadoresOnline.delete(
                    socket
                );

            }
        );

    }
);


// ======================================================
// ENVIAR PARA OS OUTROS JOGADORES
// ======================================================

function transmitirParaOutros(

    origem: WebSocket,

    mensagem: object

) {

    const texto =
        JSON.stringify(
            mensagem
        );


    for (
        const socket
        of jogadoresOnline.keys()
    ) {

        if (

            socket !== origem &&

            socket.readyState ===
            WebSocket.OPEN

        ) {

            socket.send(
                texto
            );

        }

    }

}