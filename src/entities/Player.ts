import Phaser from "phaser";

export default class Player extends Phaser.Physics.Arcade.Sprite {

    public speed = 180;

    private path: Phaser.Math.Vector2[] = [];
    private currentPoint = 0;
    private moving = false;

    private shadow: Phaser.GameObjects.Ellipse;

    /*
     * Primeiro frame de cada direção:
     *
     * 0  = baixo
     * 4  = cima
     * 8  = esquerda
     * 12 = direita
     */
    private idleFrame = 0;


    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number
    ) {

        super(
            scene,
            x,
            y,
            "player",
            0
        );

        // Adiciona o personagem à cena
        scene.add.existing(this);

        // Ativa física
        scene.physics.add.existing(this);

        // Profundidade
        this.setDepth(100);


        /*
         * =====================================================
         * TAMANHO DO PERSONAGEM
         * =====================================================
         *
         * Cada frame original tem:
         *
         * 256 x 384
         *
         * Com 0.22 fica aproximadamente:
         *
         * 56 x 84
         *
         * na tela.
         */

        this.setScale(0.22);


        /*
         * O ponto de origem fica próximo aos pés.
         */
        this.setOrigin(
            0.5,
            0.84
        );


        /*
         * =====================================================
         * COLISÃO
         * =====================================================
         *
         * A colisão fica somente na parte inferior
         * do personagem.
         *
         * Isso evita que a cabeça/cabelo fique
         * batendo nas paredes.
         */

        const body =
            this.body as Phaser.Physics.Arcade.Body;

        body.setSize(
            82,
            58
        );

        body.setOffset(
            87,
            285
        );

        body.setCollideWorldBounds(
            true
        );


        /*
         * =====================================================
         * SOMBRA
         * =====================================================
         */

        this.shadow =
            scene.add.ellipse(
                x,
                y + 9,
                34,
                10,
                0x000000,
                0.30
            );

        this.shadow.setDepth(90);


        /*
         * Começa olhando para baixo.
         */

        this.setFrame(
            this.idleFrame
        );
    }


    /*
     * =========================================================
     * RECEBE O CAMINHO DO A*
     * =========================================================
     */

    public setPath(
        path: Phaser.Math.Vector2[]
    ): void {

        if (
            !path ||
            path.length === 0
        ) {

            this.stop();

            return;
        }


        /*
         * Faz uma cópia dos pontos.
         */

        this.path =
            path.map(
                point =>
                    new Phaser.Math.Vector2(
                        point.x,
                        point.y
                    )
            );


        this.currentPoint = 0;

        this.moving = true;


        /*
         * Começa a andar.
         */

        this.goToCurrentPoint();
    }


    /*
     * =========================================================
     * MOVIMENTO SEM DIAGONAL
     * =========================================================
     *
     * Aqui está a principal alteração.
     *
     * O personagem só pode ter:
     *
     * X diferente de 0
     * OU
     * Y diferente de 0
     *
     * Nunca os dois ao mesmo tempo.
     */

    private goToCurrentPoint(): void {

        if (
            !this.moving ||
            this.currentPoint >= this.path.length
        ) {

            this.stop();

            return;
        }


        const target =
            this.path[this.currentPoint];


        const dx =
            target.x - this.x;

        const dy =
            target.y - this.y;


        /*
         * =====================================================
         * MOVIMENTO EM QUADRADOS
         * =====================================================
         *
         * Se a diferença horizontal for maior,
         * anda somente na horizontal.
         *
         * Quando chegar no X,
         * passa a andar somente na vertical.
         */

        if (
            Math.abs(dx) > 5
        ) {

            if (dx > 0) {

                // Direita
                this.setVelocity(
                    this.speed,
                    0
                );

            } else {

                // Esquerda
                this.setVelocity(
                    -this.speed,
                    0
                );
            }

        }

        else if (
            Math.abs(dy) > 5
        ) {

            if (dy > 0) {

                // Baixo
                this.setVelocity(
                    0,
                    this.speed
                );

            } else {

                // Cima
                this.setVelocity(
                    0,
                    -this.speed
                );
            }

        }

        else {

            /*
             * Está praticamente no ponto.
             */

            this.setVelocity(
                0,
                0
            );
        }


        /*
         * Atualiza a animação.
         */

        this.updateDirectionAnimation();
    }


    /*
     * =========================================================
     * MOVIMENTO DIRETO
     * =========================================================
     */

    public moveTo(
        x: number,
        y: number
    ): void {

        this.setPath([
            new Phaser.Math.Vector2(
                x,
                y
            )
        ]);
    }


    /*
     * =========================================================
     * PARAR
     * =========================================================
     */

    public stop(): this {

        this.moving = false;

        this.path = [];

        this.currentPoint = 0;


        this.setVelocity(
            0,
            0
        );


        /*
         * Para a animação.
         */

        this.anims.stop();


        /*
         * Volta para o primeiro frame
         * da direção atual.
         */

        this.setFrame(
            this.idleFrame
        );


        return this;
    }


    /*
     * =========================================================
     * ESCOLHER A ANIMAÇÃO
     * =========================================================
     */

    private updateDirectionAnimation(): void {

        const body =
            this.body as Phaser.Physics.Arcade.Body;


        const vx =
            body.velocity.x;

        const vy =
            body.velocity.y;


        /*
         * =====================================================
         * MOVIMENTO HORIZONTAL
         * =====================================================
         */

        if (
            Math.abs(vx) > 0
        ) {

            /*
             * DIREITA
             */

            if (
                vx > 0
            ) {

                /*
                 * Frames:
                 *
                 * 12
                 * 13
                 * 14
                 * 15
                 */

                this.idleFrame = 12;

                this.anims.play(
                    "player-right",
                    true
                );
            }


            /*
             * ESQUERDA
             */

            else {

                /*
                 * Frames:
                 *
                 * 8
                 * 9
                 * 10
                 * 11
                 */

                this.idleFrame = 8;

                this.anims.play(
                    "player-left",
                    true
                );
            }
        }


        /*
         * =====================================================
         * MOVIMENTO VERTICAL
         * =====================================================
         */

        else if (
            Math.abs(vy) > 0
        ) {

            /*
             * BAIXO
             */

            if (
                vy > 0
            ) {

                /*
                 * Frames:
                 *
                 * 0
                 * 1
                 * 2
                 * 3
                 */

                this.idleFrame = 0;

                this.anims.play(
                    "player-down",
                    true
                );
            }


            /*
             * CIMA
             */

            else {

                /*
                 * Frames:
                 *
                 * 4
                 * 5
                 * 6
                 * 7
                 */

                this.idleFrame = 4;

                this.anims.play(
                    "player-up",
                    true
                );
            }
        }
    }


    /*
     * =========================================================
     * ATUALIZAÇÃO DO PERSONAGEM
     * =========================================================
     */

    override preUpdate(
        time: number,
        delta: number
    ): void {

        super.preUpdate(
            time,
            delta
        );


        /*
         * =====================================================
         * SOMBRA
         * =====================================================
         */

        this.shadow.setPosition(
            this.x,
            this.y + 9
        );


        /*
         * =====================================================
         * SE NÃO ESTIVER ANDANDO
         * =====================================================
         */

        if (
            !this.moving
        ) {

            this.setVelocity(
                0,
                0
            );

            return;
        }


        /*
         * =====================================================
         * VERIFICA SE TERMINOU O CAMINHO
         * =====================================================
         */

        if (
            this.currentPoint >=
            this.path.length
        ) {

            this.stop();

            return;
        }


        const target =
            this.path[this.currentPoint];


        /*
         * Distância até o próximo ponto.
         */

        const distance =
            Phaser.Math.Distance.Between(
                this.x,
                this.y,
                target.x,
                target.y
            );


        /*
         * =====================================================
         * CHEGOU AO PONTO
         * =====================================================
         */

        if (
            distance < 10
        ) {

            /*
             * Coloca exatamente no ponto.
             */

            this.setPosition(
                target.x,
                target.y
            );


            /*
             * Para antes de mudar
             * para o próximo ponto.
             */

            this.setVelocity(
                0,
                0
            );


            this.currentPoint++;


            /*
             * Terminou todo o caminho?
             */

            if (
                this.currentPoint >=
                this.path.length
            ) {

                this.stop();

                return;
            }


            /*
             * Continua para o próximo
             * ponto.
             */

            this.goToCurrentPoint();
        }


        /*
         * =====================================================
         * AINDA ESTÁ ANDANDO
         * =====================================================
         */

        else {

            /*
             * Garante que a velocidade
             * continue sem diagonal.
             */

            this.goToCurrentPoint();
        }
    }
}