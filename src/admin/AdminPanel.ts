export function mostrarPainelAdmin(): void {
    document.body.innerHTML = `
        <div class="admin-container">

            <header class="admin-header">
                <div>
                    <div class="admin-logo">NEXA</div>
                    <h1>Painel Administrativo</h1>
                    <p>Gerencie seu escritório virtual</p>
                </div>

                <button id="logout-button" class="logout-button">
                    Sair
                </button>
            </header>

            <main class="admin-content">

                <section class="admin-card">
                    <div class="card-icon">👥</div>

                    <div class="card-info">
                        <h2>Membros</h2>
                        <p>
                            Adicione e gerencie os usuários do escritório.
                        </p>
                    </div>

                    <button id="membros-button">
                        Gerenciar membros
                    </button>
                </section>

                <section class="admin-card">
                    <div class="card-icon">🏢</div>

                    <div class="card-info">
                        <h2>Salas</h2>
                        <p>
                            Escolha qual membro ficará em cada sala.
                        </p>
                    </div>

                    <button id="salas-button">
                        Gerenciar salas
                    </button>
                </section>

                <section class="admin-card">
                    <div class="card-icon">📊</div>

                    <div class="card-info">
                        <h2>Escritório</h2>
                        <p>
                            Acesse o escritório virtual.
                        </p>
                    </div>

                    <button id="escritorio-button">
                        Visualizar escritório
                    </button>
                </section>

            </main>

            <!-- MODAL DE MEMBROS -->

            <div id="admin-modal" class="admin-modal hidden">

                <div class="admin-modal-content">

                    <button id="fechar-modal" class="modal-close">
                        ×
                    </button>

                    <h2>Gerenciar membros</h2>

                    <form id="membro-form">

                        <div class="input-group">
                            <label for="nome-membro">
                                Nome
                            </label>

                            <input
                                id="nome-membro"
                                type="text"
                                placeholder="Nome do membro"
                                required
                            />
                        </div>

                        <div class="input-group">
                            <label for="email-membro">
                                E-mail
                            </label>

                            <input
                                id="email-membro"
                                type="email"
                                placeholder="email@exemplo.com"
                                required
                            />
                        </div>

                        <div class="input-group">
                            <label for="senha-membro">
                                Senha
                            </label>

                            <input
                                id="senha-membro"
                                type="password"
                                placeholder="Senha"
                                required
                            />
                        </div>

                        <div class="input-group">
                            <label for="tipo-membro">
                                Tipo de usuário
                            </label>

                            <select id="tipo-membro">
                                <option value="MEMBRO">
                                    Membro
                                </option>

                                <option value="ADMIN">
                                    Administrador
                                </option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            class="add-user-button"
                        >
                            Adicionar membro
                        </button>

                        <p id="membro-mensagem"></p>

                    </form>

                    <hr />

                    <h3>Usuários cadastrados</h3>

                    <div id="lista-usuarios">
                        Carregando...
                    </div>

                </div>

            </div>

            <!-- MODAL DE SALAS -->

            <div id="salas-modal" class="admin-modal hidden">

                <div class="admin-modal-content salas-modal-content">

                    <button
                        id="fechar-salas-modal"
                        class="modal-close"
                    >
                        ×
                    </button>

                    <h2>Gerenciar salas</h2>

                    <p class="modal-description">
                        Escolha um membro para cada sala individual.
                    </p>

                    <div id="lista-salas">
                        Carregando salas...
                    </div>

                    <p id="salas-mensagem"></p>

                </div>

            </div>

        </div>
    `;

    // ===============================
    // LOGOUT
    // ===============================

    document
        .getElementById("logout-button")
        ?.addEventListener("click", () => {
            localStorage.removeItem("nexaUsuario");
            window.location.reload();
        });

    // ===============================
    // MEMBROS
    // ===============================

    document
        .getElementById("membros-button")
        ?.addEventListener("click", () => {
            abrirModalMembros();
        });

    document
        .getElementById("fechar-modal")
        ?.addEventListener("click", () => {
            fecharModalMembros();
        });

    // ===============================
    // SALAS
    // ===============================

    document
        .getElementById("salas-button")
        ?.addEventListener("click", () => {
            abrirModalSalas();
        });

    document
        .getElementById("fechar-salas-modal")
        ?.addEventListener("click", () => {
            fecharModalSalas();
        });

    // ===============================
    // ESCRITÓRIO
    // ===============================

    document
        .getElementById("escritorio-button")
        ?.addEventListener("click", () => {
            alert(
                "O escritório será conectado ao Phaser depois."
            );
        });

    // ===============================
    // FORMULÁRIO DE MEMBRO
    // ===============================

    document
        .getElementById("membro-form")
        ?.addEventListener("submit", async (event) => {

            event.preventDefault();

            const nome =
                (
                    document.getElementById(
                        "nome-membro"
                    ) as HTMLInputElement
                ).value.trim();

            const email =
                (
                    document.getElementById(
                        "email-membro"
                    ) as HTMLInputElement
                ).value.trim();

            const senha =
                (
                    document.getElementById(
                        "senha-membro"
                    ) as HTMLInputElement
                ).value;

            const role =
                (
                    document.getElementById(
                        "tipo-membro"
                    ) as HTMLSelectElement
                ).value;

            const mensagem =
                document.getElementById(
                    "membro-mensagem"
                );

            if (mensagem) {
                mensagem.textContent = "Cadastrando...";
            }

            try {

                const resposta = await fetch(
                    "http://localhost:3000/api/users",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            nome,
                            email,
                            senha,
                            role
                        })
                    }
                );

                const dados = await resposta.json();

                if (!resposta.ok) {
                    throw new Error(
                        dados.mensagem ||
                        "Erro ao cadastrar usuário."
                    );
                }

                if (mensagem) {
                    mensagem.textContent =
                        "Membro cadastrado com sucesso!";
                }

                (
                    document.getElementById(
                        "nome-membro"
                    ) as HTMLInputElement
                ).value = "";

                (
                    document.getElementById(
                        "email-membro"
                    ) as HTMLInputElement
                ).value = "";

                (
                    document.getElementById(
                        "senha-membro"
                    ) as HTMLInputElement
                ).value = "";

                carregarUsuarios();

            } catch (erro) {

                console.error(erro);

                if (mensagem) {
                    mensagem.textContent =
                        erro instanceof Error
                            ? erro.message
                            : "Erro ao conectar com o servidor.";
                }
            }
        });
}

// ========================================
// MODAL DE MEMBROS
// ========================================

function abrirModalMembros(): void {

    const modal =
        document.getElementById("admin-modal");

    modal?.classList.remove("hidden");

    carregarUsuarios();
}

function fecharModalMembros(): void {

    const modal =
        document.getElementById("admin-modal");

    modal?.classList.add("hidden");
}

// ========================================
// CARREGAR USUÁRIOS
// ========================================

async function carregarUsuarios(): Promise<void> {

    const lista =
        document.getElementById("lista-usuarios");

    if (!lista) {
        return;
    }

    lista.innerHTML =
        "Carregando usuários...";

    try {

        const resposta =
            await fetch(
                "http://localhost:3000/api/users"
            );

        if (!resposta.ok) {
            throw new Error(
                "Erro ao buscar usuários."
            );
        }

        const usuarios = await resposta.json();

        if (usuarios.length === 0) {

            lista.innerHTML = `
                <p>
                    Nenhum usuário cadastrado.
                </p>
            `;

            return;
        }

        lista.innerHTML = usuarios
            .map((usuario: any) => `

                <div class="usuario-item">

                    <div>

                        <strong>
                            ${usuario.nome}
                        </strong>

                        <span>
                            ${usuario.email}
                        </span>

                        <small>
                            ${usuario.role}
                        </small>

                    </div>

                    ${
                        usuario.id !== 1
                            ? `
                                <button
                                    class="delete-user"
                                    data-id="${usuario.id}"
                                >
                                    Remover
                                </button>
                            `
                            : `
                                <span class="admin-principal">
                                    Administrador principal
                                </span>
                            `
                    }

                </div>

            `)
            .join("");

        document
            .querySelectorAll(".delete-user")
            .forEach((button) => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            Number(
                                (
                                    button as HTMLElement
                                ).dataset.id
                            );

                        removerUsuario(id);
                    }
                );
            });

    } catch (erro) {

        console.error(erro);

        lista.innerHTML = `
            <p>
                Não foi possível carregar os usuários.
            </p>
        `;
    }
}

// ========================================
// REMOVER USUÁRIO
// ========================================

async function removerUsuario(
    id: number
): Promise<void> {

    const confirmar =
        confirm(
            "Deseja realmente remover este usuário?"
        );

    if (!confirmar) {
        return;
    }

    try {

        const resposta =
            await fetch(
                `http://localhost:3000/api/users/${id}`,
                {
                    method: "DELETE"
                }
            );

        const dados =
            await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                dados.mensagem ||
                "Erro ao remover usuário."
            );
        }

        carregarUsuarios();

    } catch (erro) {

        console.error(erro);

        alert(
            erro instanceof Error
                ? erro.message
                : "Erro ao remover usuário."
        );
    }
}

// ========================================
// MODAL DE SALAS
// ========================================

function abrirModalSalas(): void {

    const modal =
        document.getElementById("salas-modal");

    modal?.classList.remove("hidden");

    carregarSalas();
}

function fecharModalSalas(): void {

    const modal =
        document.getElementById("salas-modal");

    modal?.classList.add("hidden");
}

// ========================================
// CARREGAR SALAS
// ========================================

async function carregarSalas(): Promise<void> {

    const lista =
        document.getElementById("lista-salas");

    if (!lista) {
        return;
    }

    lista.innerHTML =
        "Carregando salas...";

    try {

        const [salasResposta, usuariosResposta] =
            await Promise.all([
                fetch(
                    "http://localhost:3000/api/rooms"
                ),
                fetch(
                    "http://localhost:3000/api/users"
                )
            ]);

        if (
            !salasResposta.ok ||
            !usuariosResposta.ok
        ) {
            throw new Error(
                "Erro ao carregar salas."
            );
        }

        const salas =
            await salasResposta.json();

        const usuarios =
            await usuariosResposta.json();

        const membros =
            usuarios.filter(
                (usuario: any) =>
                    usuario.role === "MEMBRO"
            );

        const salasIndividuais =
            salas.filter(
                (sala: any) =>
                    sala.tipo === "INDIVIDUAL"
            );

        if (salasIndividuais.length === 0) {

            lista.innerHTML = `
                <p>
                    Nenhuma sala individual encontrada.
                </p>
            `;

            return;
        }

        lista.innerHTML =
            salasIndividuais
                .map((sala: any) => {

                    const usuarioAtual =
                        usuarios.find(
                            (usuario: any) =>
                                usuario.id ===
                                sala.usuarioId
                        );

                    return `

                        <div class="sala-item">

                            <div class="sala-info">

                                <div class="sala-icon">
                                    🏢
                                </div>

                                <div>

                                    <strong>
                                        ${sala.nome}
                                    </strong>

                                    <span>
                                        ${
                                            usuarioAtual
                                                ? `Ocupada por ${usuarioAtual.nome}`
                                                : "Sala disponível"
                                        }
                                    </span>

                                </div>

                            </div>

                            <select
                                class="sala-select"
                                data-sala-id="${sala.id}"
                            >

                                <option value="">
                                    Sala disponível
                                </option>

                                ${membros
                                    .map(
                                        (membro: any) => `
                                            <option
                                                value="${membro.id}"
                                                ${
                                                    membro.salaId ===
                                                    sala.id
                                                        ? "selected"
                                                        : ""
                                                }
                                            >
                                                ${membro.nome}
                                            </option>
                                        `
                                    )
                                    .join("")}

                            </select>

                        </div>

                    `;
                })
                .join("");

        document
            .querySelectorAll(".sala-select")
            .forEach((select) => {

                select.addEventListener(
                    "change",
                    async () => {

                        const elemento =
                            select as HTMLSelectElement;

                        const salaId =
                            Number(
                                elemento.dataset.salaId
                            );

                        const valor =
                            elemento.value;

                        const usuarioId =
                            valor === ""
                                ? null
                                : Number(valor);

                        await atribuirSala(
                            usuarioId,
                            salaId
                        );
                    }
                );
            });

    } catch (erro) {

        console.error(erro);

        lista.innerHTML = `
            <p>
                Não foi possível carregar as salas.
            </p>
        `;
    }
}

// ========================================
// ATRIBUIR SALA
// ========================================

async function atribuirSala(
    usuarioId: number | null,
    salaId: number
): Promise<void> {

    const mensagem =
        document.getElementById(
            "salas-mensagem"
        );

    try {

        if (usuarioId === null) {

            const usuariosResposta =
                await fetch(
                    "http://localhost:3000/api/users"
                );

            const usuarios =
                await usuariosResposta.json();

            const usuarioAtual =
                usuarios.find(
                    (usuario: any) =>
                        usuario.salaId === salaId
                );

            if (!usuarioAtual) {
                return;
            }

            const resposta =
                await fetch(
                    `http://localhost:3000/api/users/${usuarioAtual.id}/sala`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            salaId: null
                        })
                    }
                );

            const dados =
                await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.mensagem ||
                    "Erro ao liberar sala."
                );
            }

        } else {

            const resposta =
                await fetch(
                    `http://localhost:3000/api/users/${usuarioId}/sala`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            salaId
                        })
                    }
                );

            const dados =
                await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.mensagem ||
                    "Erro ao atribuir sala."
                );
            }
        }

        if (mensagem) {
            mensagem.textContent =
                "Sala atualizada com sucesso!";
        }

        await carregarSalas();

    } catch (erro) {

        console.error(erro);

        if (mensagem) {
            mensagem.textContent =
                erro instanceof Error
                    ? erro.message
                    : "Erro ao atualizar sala.";
        }
    }
}