import Phaser from "phaser";
import Player from "../entities/Player";
import Multiplayer from "../multiplayer/Multiplayer";

interface InteractionObject {
    x: number;
    y: number;
    name: string;
    description: string;
    range: number;
}

export default class OfficeScene extends Phaser.Scene {
    private player!: Player;

    private multiplayer!: Multiplayer;

    private usuario: {
        id: number;
        nome: string;
        email: string;
        role: string;
        salaId: number | null;
    } | null = null;

    private obstacles!: Phaser.Physics.Arcade.StaticGroup;

    private keyE!: Phaser.Input.Keyboard.Key;

    private interactionObjects: InteractionObject[] = [];

    private currentInteraction:
        InteractionObject | null = null;

    private interactionText!: Phaser.GameObjects.Text;

    private messageBox!: Phaser.GameObjects.Container;

    private messageTitle!: Phaser.GameObjects.Text;

    private messageDescription!: Phaser.GameObjects.Text;

    private messageClose!: Phaser.GameObjects.Text;

    private messageBoxOpen = false;

    constructor() {
        super("OfficeScene");
    }

    // =========================================================
    // PRELOAD
    // =========================================================

    preload() {
        this.load.spritesheet(
            "player",
            "/assets/characters/player/player.png",
            {
                frameWidth: 96,
                frameHeight: 96
            }
        );
    }

    // =========================================================
    // CREATE
    // =========================================================

    create() {
        this.createPlayerAnimations();

        this.createWorld();

        this.createFloor();

        this.createWalls();

        this.createRooms();

        this.createObjects();

        this.createPlayer();

        this.iniciarMultiplayer();

        this.createInteractions();

        this.createInteractionText();

        this.createMessageBox();

        this.setupCamera();

        this.setupCollisions();
    }

    // =========================================================
    // UPDATE
    // =========================================================

    update() {
        if (this.messageBoxOpen) {
            this.player.setVelocity(0, 0);

            if (
                Phaser.Input.Keyboard.JustDown(
                    this.keyE
                )
            ) {
                this.closeMessage();
            }

            return;
        }

        this.player.update();

        this.checkInteractions();

        if (
            Phaser.Input.Keyboard.JustDown(
                this.keyE
            )
        ) {
            this.interact();
        }

        if (this.player && this.multiplayer) {
            this.multiplayer.atualizarPosicao(
                this.player.x,
                this.player.y,
                this.usuario?.salaId ?? null
            );
        }
    }

    // =========================================================
    // ANIMAÇÕES DO PERSONAGEM
    // =========================================================

    private createPlayerAnimations() {

        // =====================================================
        // CAMINHANDO PARA BAIXO
        // FRAMES 0 - 3
        // =====================================================

        this.anims.create({
            key: "walk-down",

            frames:
                this.anims.generateFrameNumbers(
                    "player",
                    {
                        start: 0,
                        end: 3
                    }
                ),

            frameRate: 8,

            repeat: -1
        });

        // =====================================================
        // CAMINHANDO PARA ESQUERDA
        // FRAMES 4 - 7
        // =====================================================

        this.anims.create({
            key: "walk-left",

            frames:
                this.anims.generateFrameNumbers(
                    "player",
                    {
                        start: 4,
                        end: 7
                    }
                ),

            frameRate: 8,

            repeat: -1
        });

        // =====================================================
        // CAMINHANDO PARA DIREITA
        // FRAMES 8 - 11
        // =====================================================

        this.anims.create({
            key: "walk-right",

            frames:
                this.anims.generateFrameNumbers(
                    "player",
                    {
                        start: 8,
                        end: 11
                    }
                ),

            frameRate: 8,

            repeat: -1
        });

        // =====================================================
        // CAMINHANDO PARA CIMA
        // FRAMES 12 - 15
        // =====================================================

        this.anims.create({
            key: "walk-up",

            frames:
                this.anims.generateFrameNumbers(
                    "player",
                    {
                        start: 12,
                        end: 15
                    }
                ),

            frameRate: 8,

            repeat: -1
        });

        // =====================================================
        // CORRENDO PARA BAIXO
        // FRAMES 32 - 35
        // =====================================================

        this.anims.create({
            key: "run-down",

            frames:
                this.anims.generateFrameNumbers(
                    "player",
                    {
                        start: 32,
                        end: 35
                    }
                ),

            frameRate: 12,

            repeat: -1
        });

        // =====================================================
        // CORRENDO PARA ESQUERDA
        // FRAMES 36 - 39
        // =====================================================

        this.anims.create({
            key: "run-left",

            frames:
                this.anims.generateFrameNumbers(
                    "player",
                    {
                        start: 36,
                        end: 39
                    }
                ),

            frameRate: 12,

            repeat: -1
        });

        // =====================================================
        // CORRENDO PARA DIREITA
        // FRAMES 40 - 43
        // =====================================================

        this.anims.create({
            key: "run-right",

            frames:
                this.anims.generateFrameNumbers(
                    "player",
                    {
                        start: 40,
                        end: 43
                    }
                ),

            frameRate: 12,

            repeat: -1
        });

        // =====================================================
        // CORRENDO PARA CIMA
        // FRAMES 44 - 47
        // =====================================================

        this.anims.create({
            key: "run-up",

            frames:
                this.anims.generateFrameNumbers(
                    "player",
                    {
                        start: 44,
                        end: 47
                    }
                ),

            frameRate: 12,

            repeat: -1
        });
    }

    // =========================================================
    // MUNDO
    // =========================================================

    private createWorld() {
        this.physics.world.setBounds(
            0,
            0,
            3000,
            2000
        );
    }

    // =========================================================
    // PISO
    // =========================================================

    private createFloor() {
        this.add
            .rectangle(
                1500,
                1000,
                3000,
                2000,
                0xd8d4cc
            )
            .setDepth(-10);

        // Linhas horizontais

        for (
            let y = 0;
            y <= 2000;
            y += 80
        ) {
            this.add
                .line(
                    0,
                    0,
                    0,
                    y,
                    3000,
                    y,
                    0xbcb8b0,
                    0.25
                )
                .setOrigin(0)
                .setDepth(-9);
        }

        // Linhas verticais

        for (
            let x = 0;
            x <= 3000;
            x += 80
        ) {
            this.add
                .line(
                    0,
                    0,
                    x,
                    0,
                    x,
                    2000,
                    0xbcb8b0,
                    0.25
                )
                .setOrigin(0)
                .setDepth(-9);
        }
    }

    // =========================================================
    // PAREDES EXTERNAS
    // =========================================================

    private createWalls() {
        this.obstacles =
            this.physics.add.staticGroup();

        // Parede superior

        this.createWall(
            1500,
            30,
            3000,
            60
        );

        // Parede inferior

        this.createWall(
            1500,
            1970,
            3000,
            60
        );

        // Parede esquerda

        this.createWall(
            30,
            1000,
            60,
            2000
        );

        // Parede direita

        this.createWall(
            2970,
            1000,
            60,
            2000
        );
    }

    private createWall(
        x: number,
        y: number,
        width: number,
        height: number
    ) {
        const wall =
            this.add.rectangle(
                x,
                y,
                width,
                height,
                0xeee9df
            );

        wall.setStrokeStyle(
            2,
            0xc2bdb4
        );

        this.physics.add.existing(
            wall,
            true
        );

        this.obstacles.add(wall);
    }

    // =========================================================
    // SALAS
    // =========================================================

    private createRooms() {

        // Sala individual 01

        this.createRoomWithDoor(
            350,
            300,
            500,
            400,
            "SALA 01",
            350
        );

        // Sala individual 02

        this.createRoomWithDoor(
            900,
            300,
            500,
            400,
            "SALA 02",
            900
        );

        // Sala individual 03

        this.createRoomWithDoor(
            1450,
            300,
            500,
            400,
            "SALA 03",
            1450
        );

        // Sala individual 04

        this.createRoomWithDoor(
            2000,
            300,
            500,
            400,
            "SALA 04",
            2000
        );

        // Sala de reunião

        this.createRoomWithDoor(
            500,
            1050,
            700,
            450,
            "SALA DE REUNIÃO",
            500
        );

        // Sala de descanso

        this.createRoomWithDoor(
            1350,
            1050,
            600,
            450,
            "SALA DE DESCANSO",
            1350
        );

        // Cozinha

        this.createRoomWithDoor(
            2200,
            1050,
            700,
            450,
            "COZINHA",
            2200
        );
    }

    // =========================================================
    // CRIAR SALA
    // =========================================================

    private createRoomWithDoor(
        x: number,
        y: number,
        width: number,
        height: number,
        title: string,
        doorX: number
    ) {
        const top =
            y -
            height / 2;

        const bottom =
            y +
            height / 2;

        const left =
            x -
            width / 2;

        const right =
            x +
            width / 2;

        const doorWidth = 100;

        // -----------------------------------------------------
        // PAREDE SUPERIOR
        // -----------------------------------------------------

        this.createWall(
            x,
            top,
            width,
            25
        );

        // -----------------------------------------------------
        // PAREDE INFERIOR ESQUERDA
        // -----------------------------------------------------

        const leftSegmentWidth =
            doorX -
            doorWidth / 2 -
            left;

        if (
            leftSegmentWidth > 0
        ) {
            this.createWall(
                left +
                    leftSegmentWidth / 2,
                bottom,
                leftSegmentWidth,
                25
            );
        }

        // -----------------------------------------------------
        // PAREDE INFERIOR DIREITA
        // -----------------------------------------------------

        const rightSegmentWidth =
            right -
            (
                doorX +
                doorWidth / 2
            );

        if (
            rightSegmentWidth > 0
        ) {
            this.createWall(
                doorX +
                    doorWidth / 2 +
                    rightSegmentWidth / 2,
                bottom,
                rightSegmentWidth,
                25
            );
        }

        // -----------------------------------------------------
        // PAREDE ESQUERDA
        // -----------------------------------------------------

        this.createWall(
            left,
            y,
            25,
            height
        );

        // -----------------------------------------------------
        // PAREDE DIREITA
        // -----------------------------------------------------

        this.createWall(
            right,
            y,
            25,
            height
        );

        // -----------------------------------------------------
        // PORTA
        // -----------------------------------------------------

        this.add.rectangle(
            doorX,
            bottom,
            doorWidth,
            12,
            0x9b8067
        );

        // -----------------------------------------------------
        // TEXTO DA PORTA
        // -----------------------------------------------------

        this.add.text(
            doorX,
            bottom - 18,
            "ENTRADA",
            {
                fontFamily:
                    "Arial",

                fontSize:
                    "12px",

                color:
                    "#67584c",

                fontStyle:
                    "bold"
            }
        )
            .setOrigin(0.5);

        // -----------------------------------------------------
        // NOME DA SALA
        // -----------------------------------------------------

        this.add.text(
            x,
            top + 45,
            title,
            {
                fontFamily:
                    "Arial",

                fontSize:
                    "20px",

                color:
                    "#403a46",

                fontStyle:
                    "bold",

                backgroundColor:
                    "#f4f0e9",

                padding: {
                    x: 12,
                    y: 8
                }
            }
        )
            .setOrigin(0.5);
    }

    // =========================================================
    // OBJETOS DO ESCRITÓRIO
    // =========================================================

    private createObjects() {
        this.createDesk(350, 400);
        this.createDesk(900, 400);
        this.createDesk(1450, 400);
        this.createDesk(2000, 400);

        this.createMeetingTable(500, 1100);

        this.createChair(350, 1100);
        this.createChair(650, 1100);
        this.createChair(500, 950);
        this.createChair(500, 1250);

        this.createSofa(1350, 1100);

        this.createPlant(1150, 950);
        this.createPlant(1600, 1250);

        this.createKitchen();

        this.createPlant(120, 850);
        this.createPlant(2850, 850);
        this.createPlant(120, 1650);
        this.createPlant(2850, 1650);
    }

    private createDesk(x: number, y: number) {
        const desk = this.add.rectangle(x, y, 180, 70, 0x80664f);
        this.physics.add.existing(desk, true);
        this.obstacles.add(desk);
        this.add.rectangle(x, y - 45, 75, 45, 0x303038);
        this.add.rectangle(x, y - 18, 55, 8, 0x15151a);
    }

    private createMeetingTable(x: number, y: number) {
        const table = this.add.rectangle(x, y, 350, 130, 0x80664f);
        this.physics.add.existing(table, true);
        this.obstacles.add(table);
    }

    private createSofa(x: number, y: number) {
        const sofa = this.add.rectangle(x, y, 260, 90, 0x6f6475);
        this.physics.add.existing(sofa, true);
        this.obstacles.add(sofa);
    }

    private createPlant(x: number, y: number) {
        this.add.circle(x, y, 22, 0x5f7f58);
        this.add.circle(x, y - 20, 18, 0x73956b);
    }

    // =========================================================
    // COZINHA
    // =========================================================

    private createKitchen() {

        // -----------------------------------------------------
        // BALCÃO
        // -----------------------------------------------------

        const counter =
            this.add.rectangle(
                2200,
                1000,
                500,
                70,
                0x75685d
            );

        this.physics.add.existing(
            counter,
            true
        );

        this.obstacles.add(
            counter
        );

        // -----------------------------------------------------
        // GELADEIRA
        // -----------------------------------------------------

        const fridge =
            this.add.rectangle(
                2050,
                1220,
                100,
                180,
                0xdfe2e3
            );

        fridge.setStrokeStyle(
            3,
            0xb8babb
        );

        this.physics.add.existing(
            fridge,
            true
        );

        this.obstacles.add(
            fridge
        );

        // -----------------------------------------------------
        // MESA
        // -----------------------------------------------------

        const table =
            this.add.rectangle(
                2450,
                1250,
                220,
                120,
                0x80664f
            );

        this.physics.add.existing(
            table,
            true
        );

        this.obstacles.add(
            table
        );

        // -----------------------------------------------------
        // CADEIRAS
        // -----------------------------------------------------

        this.createChair(
            2300,
            1250
        );

        this.createChair(
            2600,
            1250
        );

        // -----------------------------------------------------
        // CAFETEIRA
        // -----------------------------------------------------

        this.add.rectangle(
            2200,
            990,
            55,
            45,
            0x303038
        );

        // -----------------------------------------------------
        // MICRO-ONDAS
        // -----------------------------------------------------

        this.add.rectangle(
            2350,
            990,
            80,
            45,
            0x45454d
        );

        // -----------------------------------------------------
        // TEXTO
        // -----------------------------------------------------

        this.add.text(
            2200,
            900,
            "COZINHA",
            {
                fontFamily:
                    "Arial",

                fontSize:
                    "18px",

                color:
                    "#514a43",

                fontStyle:
                    "bold"
            }
        )
            .setOrigin(0.5);
    }

    // =========================================================
    // CADEIRA
    // =========================================================

    private createChair(
        x: number,
        y: number
    ) {
        const chair =
            this.add.rectangle(
                x,
                y,
                55,
                55,
                0x716b72
            );

        this.physics.add.existing(
            chair,
            true
        );

        this.obstacles.add(
            chair
        );
    }

    // =========================================================
    // CRIAR PLAYER
    // =========================================================

    private createPlayer() {

        this.player =
            new Player(
                this,
                1500,
                850
            );

        this.player.setDepth(
            50
        );

        this.keyE =
            this.input.keyboard!.addKey(
                Phaser.Input.Keyboard.KeyCodes.E
            );
    }

    // =========================================================
    // MULTIPLAYER
    // =========================================================

    private iniciarMultiplayer(): void {
        const usuarioSalvo = localStorage.getItem("nexaUsuario");

        if (!usuarioSalvo) {
            console.warn("Usuário não encontrado para o multiplayer.");
            return;
        }

        try {
            this.usuario = JSON.parse(usuarioSalvo);
        } catch {
            console.error("Não foi possível carregar o usuário.");
            return;
        }

        if (!this.usuario) {
            return;
        }

        this.multiplayer = new Multiplayer(
            this,
            this.usuario.id
        );

        this.multiplayer.conectar(
            this.usuario.nome,
            this.player.x,
            this.player.y,
            this.usuario.salaId
        );

        console.log(
            "Multiplayer iniciado para:",
            this.usuario.nome
        );
    }

    // =========================================================
    // COLISÕES
    // =========================================================

    private setupCollisions() {

        this.physics.add.collider(
            this.player,
            this.obstacles
        );
    }

    // =========================================================
    // INTERAÇÕES
    // =========================================================

    private createInteractions() {

        this.interactionObjects = [

            // -------------------------------------------------
            // SALA 01
            // -------------------------------------------------

            {
                x: 350,

                y: 470,

                name:
                    "Computador da Sala 01",

                description:
                    "Este é o computador da Sala 01.",

                range: 130
            },

            // -------------------------------------------------
            // SALA 02
            // -------------------------------------------------

            {
                x: 900,

                y: 470,

                name:
                    "Computador da Sala 02",

                description:
                    "Este é o computador da Sala 02.",

                range: 130
            },

            // -------------------------------------------------
            // SALA 03
            // -------------------------------------------------

            {
                x: 1450,

                y: 470,

                name:
                    "Computador da Sala 03",

                description:
                    "Este é o computador da Sala 03.",

                range: 130
            },

            // -------------------------------------------------
            // SALA 04
            // -------------------------------------------------

            {
                x: 2000,

                y: 470,

                name:
                    "Computador da Sala 04",

                description:
                    "Este é o computador da Sala 04.",

                range: 130
            },

            // -------------------------------------------------
            // REUNIÃO
            // -------------------------------------------------

            {
                x: 500,

                y: 900,

                name:
                    "Sala de Reunião",

                description:
                    "Aqui acontecem as reuniões da equipe.",

                range: 150
            },

            // -------------------------------------------------
            // DESCANSO
            // -------------------------------------------------

            {
                x: 1350,

                y: 1000,

                name:
                    "Sala de Descanso",

                description:
                    "Um espaço para descansar e relaxar.",

                range: 150
            },

            // -------------------------------------------------
            // COZINHA
            // -------------------------------------------------

            {
                x: 2200,

                y: 900,

                name:
                    "Cozinha",

                description:
                    "Aqui você pode preparar um café e fazer uma pausa.",

                range: 150
            }
        ];
    }

    // =========================================================
    // VERIFICAR INTERAÇÕES
    // =========================================================

    private checkInteractions() {

        let closest:
            InteractionObject | null = null;

        let closestDistance =
            Infinity;

        for (
            const object
            of this.interactionObjects
        ) {

            const distance =
                Phaser.Math.Distance.Between(
                    this.player.x,
                    this.player.y,
                    object.x,
                    object.y
                );

            if (
                distance <
                    object.range &&
                distance <
                    closestDistance
            ) {

                closest =
                    object;

                closestDistance =
                    distance;
            }
        }

        this.currentInteraction =
            closest;

        if (closest) {

            this.interactionText.setText(
                `E - ${closest.name}`
            );

            this.interactionText.setPosition(
                this.player.x,
                this.player.y - 80
            );

            this.interactionText.setVisible(
                true
            );

        } else {

            this.interactionText.setVisible(
                false
            );
        }
    }

    // =========================================================
    // INTERAGIR
    // =========================================================

    private interact() {

        if (
            !this.currentInteraction
        ) {
            return;
        }

        this.showMessage(
            this.currentInteraction.name,
            this.currentInteraction.description
        );
    }

    // =========================================================
    // TEXTO DE INTERAÇÃO
    // =========================================================

    private createInteractionText() {

        this.interactionText =
            this.add.text(
                0,
                0,
                "",
                {
                    fontFamily:
                        "Arial",

                    fontSize:
                        "16px",

                    color:
                        "#ffffff",

                    backgroundColor:
                        "#30284d",

                    padding: {
                        x: 10,
                        y: 6
                    }
                }
            );

        this.interactionText
            .setOrigin(0.5);

        this.interactionText
            .setDepth(100);

        this.interactionText
            .setVisible(false);
    }

    // =========================================================
    // CAIXA DE MENSAGEM
    // =========================================================

    private createMessageBox() {

        this.messageBox =
            this.add.container(
                0,
                0
            );

        this.messageBox
            .setScrollFactor(0);

        this.messageBox
            .setDepth(200);

        // -----------------------------------------------------
        // FUNDO
        // -----------------------------------------------------

        const background =
            this.add.rectangle(
                550,
                350,
                560,
                250,
                0x171522
            );

        background.setStrokeStyle(
            3,
            0x7657d9
        );

        // -----------------------------------------------------
        // TÍTULO
        // -----------------------------------------------------

        this.messageTitle =
            this.add.text(
                550,
                295,
                "",
                {
                    fontFamily:
                        "Arial",

                    fontSize:
                        "25px",

                    color:
                        "#ffffff",

                    fontStyle:
                        "bold"
                }
            );

        this.messageTitle
            .setOrigin(0.5);

        // -----------------------------------------------------
        // DESCRIÇÃO
        // -----------------------------------------------------

        this.messageDescription =
            this.add.text(
                550,
                350,
                "",
                {
                    fontFamily:
                        "Arial",

                    fontSize:
                        "17px",

                    color:
                        "#d8d5df",

                    align:
                        "center",

                    wordWrap: {
                        width: 450
                    }
                }
            );

        this.messageDescription
            .setOrigin(0.5);

        // -----------------------------------------------------
        // FECHAR
        // -----------------------------------------------------

        this.messageClose =
            this.add.text(
                550,
                430,
                "Pressione E para fechar",
                {
                    fontFamily:
                        "Arial",

                    fontSize:
                        "15px",

                    color:
                        "#a99bd8"
                }
            );

        this.messageClose
            .setOrigin(0.5);

        // -----------------------------------------------------
        // ADICIONAR ELEMENTOS
        // -----------------------------------------------------

        this.messageBox.add([
            background,

            this.messageTitle,

            this.messageDescription,

            this.messageClose
        ]);

        this.messageBox
            .setVisible(false);
    }

    // =========================================================
    // MOSTRAR MENSAGEM
    // =========================================================

    private showMessage(
        title: string,
        description: string
    ) {

        this.messageTitle.setText(
            title
        );

        this.messageDescription.setText(
            description
        );

        this.messageBoxOpen =
            true;

        this.interactionText
            .setVisible(false);

        this.messageBox
            .setVisible(true);
    }

    // =========================================================
    // FECHAR MENSAGEM
    // =========================================================

    private closeMessage() {

        this.messageBoxOpen =
            false;

        this.messageBox
            .setVisible(false);

        this.currentInteraction =
            null;
    }

    // =========================================================
    // CÂMERA
    // =========================================================

    private setupCamera() {

        this.cameras.main.setBounds(
            0,
            0,
            3000,
            2000
        );

        this.cameras.main.startFollow(
            this.player,
            true,
            0.08,
            0.08
        );

        this.cameras.main.setZoom(
            1
        );
    }
}