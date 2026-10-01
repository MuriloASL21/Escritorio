
import { mostrarPainelAdmin } from "../admin/AdminPanel";

export function mostrarLogin(): void {
    document.body.innerHTML = `
        <div class="login-container">

            <div class="login-box">

                <div class="login-logo">
                    NEXA
                </div>

                <h1>
                    Nexa Office
                </h1>

                <p class="login-subtitle">
                    Entre no seu escritório virtual
                </p>

                <form id="login-form">

                    <div class="input-group">

                        <label for="email">
                            E-mail
                        </label>

                        <input
                            id="email"
                            type="email"
                            placeholder="Digite seu e-mail"
                            required
                        />

                    </div>

                    <div class="input-group">

                        <label for="senha">
                            Senha
                        </label>

                        <input
                            id="senha"
                            type="password"
                            placeholder="Digite sua senha"
                            required
                        />

                    </div>

                    <button type="submit">
                        Entrar
                    </button>

                    <p id="login-mensagem"></p>

                </form>

            </div>

        </div>
    `;

    const form =
        document.getElementById("login-form");

    const mensagem =
        document.getElementById("login-mensagem");

    form?.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const emailInput =
                document.getElementById(
                    "email"
                ) as HTMLInputElement;

            const senhaInput =
                document.getElementById(
                    "senha"
                ) as HTMLInputElement;

            const email =
                emailInput.value.trim();

            const senha =
                senhaInput.value;

            if (mensagem) {
                mensagem.textContent =
                    "Entrando...";
            }

            try {

                const resposta =
                    await fetch(
                        "http://localhost:3000/api/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                email,
                                senha
                            })
                        }
                    );

                const dados =
                    await resposta.json();

                if (!resposta.ok) {
                    throw new Error(
                        dados.mensagem ||
                        "E-mail ou senha incorretos."
                    );
                }

                /*
                 * Salva o usuário completo.
                 *
                 * Agora também salvamos:
                 *
                 * salaId
                 */

                localStorage.setItem(
                    "nexaUsuario",
                    JSON.stringify(
                        dados.usuario
                    )
                );

                console.log(
                    "Usuário logado:",
                    dados.usuario
                );

                // ==========================
                // ADMINISTRADOR
                // ==========================

                if (
                    dados.usuario.role ===
                    "ADMIN"
                ) {

                    mostrarPainelAdmin();

                    return;
                }

                // ==========================
                // MEMBRO
                // ==========================

                if (
                    dados.usuario.role ===
                    "MEMBRO"
                ) {

                    /*
                     * Ainda não vamos abrir
                     * diretamente uma sala aqui.
                     *
                     * O main.ts fará isso.
                     */

                    window.location.reload();

                    return;
                }

                // ==========================
                // TIPO INVÁLIDO
                // ==========================

                localStorage.removeItem(
                    "nexaUsuario"
                );

                throw new Error(
                    "Tipo de usuário inválido."
                );

            } catch (erro) {

                console.error(
                    "Erro no login:",
                    erro
                );

                if (mensagem) {

                    mensagem.textContent =
                        erro instanceof Error
                            ? erro.message
                            : "Erro ao conectar com o servidor.";
                }
            }
        }
    );
}