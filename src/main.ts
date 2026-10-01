import Phaser from "phaser";
import "./style.css";

import OfficeScene from "./scenes/OfficeScene";
import { mostrarLogin } from "./auth/Login";
import { mostrarPainelAdmin } from "./admin/AdminPanel";

function iniciarEscritorio(): void {

    document.body.innerHTML = `
        <div id="game"></div>
    `;

    const usuarioSalvo =
        localStorage.getItem("nexaUsuario");

    let usuario = null;

    if (usuarioSalvo) {

        try {

            usuario =
                JSON.parse(usuarioSalvo);

        } catch {

            localStorage.removeItem(
                "nexaUsuario"
            );

            mostrarLogin();

            return;
        }
    }

    /*
     * Passamos os dados do usuário
     * para a cena Phaser.
     */

    const config:
        Phaser.Types.Core.GameConfig = {

        type: Phaser.AUTO,

        width: 1100,

        height: 700,

        backgroundColor: "#6b4f3a",

        parent: "game",

        physics: {
            default: "arcade",

            arcade: {
                debug: false
            }
        },

        scale: {
            mode: Phaser.Scale.RESIZE,

            autoCenter:
                Phaser.Scale.CENTER_BOTH
        },

        scene: [OfficeScene],

        callbacks: {

            postBoot: (game) => {

                /*
                 * Guardamos o usuário
                 * dentro do registry do Phaser.
                 *
                 * A OfficeScene poderá
                 * acessar isso depois.
                 */

                game.registry.set(
                    "usuario",
                    usuario
                );

            }
        }
    };

    new Phaser.Game(config);
}

// ========================================
// VERIFICAR USUÁRIO SALVO
// ========================================

const usuarioSalvo =
    localStorage.getItem("nexaUsuario");

if (!usuarioSalvo) {

    mostrarLogin();

} else {

    try {

        const usuario =
            JSON.parse(usuarioSalvo);

        // ================================
        // ADMIN
        // ================================

        if (
            usuario.role === "ADMIN"
        ) {

            mostrarPainelAdmin();

        }

        // ================================
        // MEMBRO
        // ================================

        else if (
            usuario.role === "MEMBRO"
        ) {

            iniciarEscritorio();

        }

        // ================================
        // USUÁRIO INVÁLIDO
        // ================================

        else {

            localStorage.removeItem(
                "nexaUsuario"
            );

            mostrarLogin();
        }

    } catch {

        localStorage.removeItem(
            "nexaUsuario"
        );

        mostrarLogin();
    }
}