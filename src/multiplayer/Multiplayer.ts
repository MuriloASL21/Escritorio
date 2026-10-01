
import Phaser from "phaser";

interface JogadorRemoto {
    id: number;
    nome: string;
    x: number;
    y: number;
    salaId: number | null;
    sprite: Phaser.GameObjects.Container;
}

export default class Multiplayer {

    private scene: Phaser.Scene;

    private usuarioId: number;

    private socket: WebSocket | null = null;

    private jogadores: Map<
        number,
        JogadorRemoto
    > = new Map();

    private ultimoEnvio = 0;

    private intervaloEnvio = 50;


    constructor(
        scene: Phaser.Scene,
        usuarioId: number
    ) {

        this.scene = scene;

        this.usuarioId = usuarioId;

    }


    // ======================================================
    // CONECTAR
    // ======================================================

    conectar(
        nome: string,
        x: number,
        y: number,
        salaId: number | null
    ): void {

        this.socket =
            new WebSocket(
                "ws://localhost:3000"
            );


        this.socket.onopen = () => {

            console.log(
                "Multiplayer conectado."
            );


            this.enviar({

                tipo: "ENTRAR",

                id: this.usuarioId,

                nome,

                x,

                y,

                salaId

            });

        };


        this.socket.onmessage = (
            evento
        ) => {

            try {

                const dados =
                    JSON.parse(
                        evento.data
                    );


                this.processarMensagem(
                    dados
                );

            } catch (erro) {

                console.error(
                    "Erro ao processar mensagem multiplayer:",
                    erro
                );

            }

        };


        this.socket.onerror = (
            erro
        ) => {

            console.error(
                "Erro no WebSocket:",
                erro
            );

        };


        this.socket.onclose = () => {

            console.log(
                "Multiplayer desconectado."
            );

        };

    }


    // ======================================================
    // PROCESSAR MENSAGENS
    // ======================================================

    private processarMensagem(
        dados: any
    ): void {

        // --------------------------------------------------
        // OUTRO JOGADOR ENTROU
        // --------------------------------------------------

        if (
            dados.tipo ===
            "JOGADOR_ENTROU"
        ) {

            const jogador =
                dados.jogador;


            if (!jogador) {

                return;

            }


            if (
                jogador.id ===
                this.usuarioId
            ) {

                return;

            }


            this.criarJogadorRemoto(
                jogador
            );

            return;

        }


        // --------------------------------------------------
        // OUTRO JOGADOR SE MOVEU
        // --------------------------------------------------

        if (
            dados.tipo ===
            "JOGADOR_MOVEU"
        ) {

            const jogador =
                dados.jogador;


            if (!jogador) {

                return;

            }


            if (
                jogador.id ===
                this.usuarioId
            ) {

                return;

            }


            this.atualizarJogadorRemoto(
                jogador
            );

            return;

        }


        // --------------------------------------------------
        // OUTRO JOGADOR SAIU
        // --------------------------------------------------

        if (
            dados.tipo ===
            "JOGADOR_SAIU"
        ) {

            const jogadorId =
                Number(
                    dados.jogadorId
                );


            this.removerJogadorRemoto(
                jogadorId
            );

        }

    }


    // ======================================================
    // CRIAR JOGADOR REMOTO
    // ======================================================

    private criarJogadorRemoto(
        jogador: {
            id: number;
            nome: string;
            x: number;
            y: number;
            salaId: number | null;
        }
    ): void {

        if (
            this.jogadores.has(
                jogador.id
            )
        ) {

            this.atualizarJogadorRemoto(
                jogador
            );

            return;

        }


        // --------------------------------------------------
        // CORPO
        // --------------------------------------------------

        const corpo =
            this.scene.add.rectangle(
                0,
                0,
                30,
                42,
                0x6c4ab6
            );


        corpo.setOrigin(
            0.5,
            0.5
        );


        // --------------------------------------------------
        // CABEÇA
        // --------------------------------------------------

        const cabeca =
            this.scene.add.circle(
                0,
                -27,
                10,
                0xd69a78
            );


        // --------------------------------------------------
        // NOME
        // --------------------------------------------------

        const nome =
            this.scene.add.text(
                0,
                -55,
                jogador.nome,
                {
                    fontFamily:
                        "Arial",

                    fontSize:
                        "13px",

                    color:
                        "#ffffff",

                    backgroundColor:
                        "#30284d",

                    padding: {
                        x: 6,
                        y: 3
                    }
                }
            );


        nome.setOrigin(
            0.5
        );


        // --------------------------------------------------
        // CONTAINER
        // --------------------------------------------------

        const container =
            this.scene.add.container(
                jogador.x,
                jogador.y
            );


        container.add([
            corpo,
            cabeca,
            nome
        ]);


        container.setDepth(
            45
        );


        // --------------------------------------------------
        // GUARDAR JOGADOR
        // --------------------------------------------------

        this.jogadores.set(
            jogador.id,
            {
                id:
                    jogador.id,

                nome:
                    jogador.nome,

                x:
                    jogador.x,

                y:
                    jogador.y,

                salaId:
                    jogador.salaId,

                sprite:
                    container
            }
        );


        console.log(
            `Jogador ${jogador.nome} apareceu no escritório.`
        );

    }


    // ======================================================
    // ATUALIZAR JOGADOR REMOTO
    // ======================================================

    private atualizarJogadorRemoto(
        jogador: {
            id: number;
            nome: string;
            x: number;
            y: number;
            salaId: number | null;
        }
    ): void {

        const jogadorExistente =
            this.jogadores.get(
                jogador.id
            );


        // --------------------------------------------------
        // SE AINDA NÃO EXISTE
        // --------------------------------------------------

        if (
            !jogadorExistente
        ) {

            this.criarJogadorRemoto(
                jogador
            );

            return;

        }


        // --------------------------------------------------
        // ATUALIZAR DADOS
        // --------------------------------------------------

        jogadorExistente.x =
            jogador.x;

        jogadorExistente.y =
            jogador.y;

        jogadorExistente.salaId =
            jogador.salaId;


        // --------------------------------------------------
        // MOVIMENTO SUAVE
        // --------------------------------------------------

        this.scene.tweens.add({

            targets:
                jogadorExistente.sprite,

            x:
                jogador.x,

            y:
                jogador.y,

            duration:
                80,

            ease:
                "Linear"

        });

    }


    // ======================================================
    // REMOVER JOGADOR
    // ======================================================

    private removerJogadorRemoto(
        jogadorId: number
    ): void {

        const jogador =
            this.jogadores.get(
                jogadorId
            );


        if (!jogador) {

            return;

        }


        jogador.sprite.destroy();


        this.jogadores.delete(
            jogadorId
        );


        console.log(
            `Jogador ${jogadorId} saiu do escritório.`
        );

    }


    // ======================================================
    // ATUALIZAR POSIÇÃO DO USUÁRIO
    // ======================================================

    atualizarPosicao(
        x: number,
        y: number,
        salaId: number | null
    ): void {

        const agora =
            Date.now();


        if (
            agora -
            this.ultimoEnvio <
            this.intervaloEnvio
        ) {

            return;

        }


        this.ultimoEnvio =
            agora;


        this.enviar({

            tipo: "MOVER",

            id:
                this.usuarioId,

            x,

            y,

            salaId

        });

    }


    // ======================================================
    // ENVIAR
    // ======================================================

    private enviar(
        dados: object
    ): void {

        if (
            !this.socket
        ) {

            return;

        }


        if (
            this.socket.readyState !==
            WebSocket.OPEN
        ) {

            return;

        }


        this.socket.send(
            JSON.stringify(
                dados
            )
        );

    }


    // ======================================================
    // DESCONECTAR
    // ======================================================

    desconectar(): void {

        if (
            this.socket
        ) {

            this.socket.close();

            this.socket =
                null;

        }


        for (
            const jogador
            of this.jogadores.values()
        ) {

            jogador.sprite.destroy();

        }


        this.jogadores.clear();

    }

}