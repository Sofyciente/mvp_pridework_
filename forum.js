const chaveForum = "pridework_forum";

const discussoesIniciais = [
    {
        id: 1,
        autor: "Mariana",
        titulo: "Como se preparar para uma entrevista de emprego?",
        categoria: "Carreira",
        texto: "Quais são as melhores formas de se preparar para uma entrevista? Estou procurando meu primeiro emprego e gostaria de algumas dicas.",
        respostas: 8,
        data: "Hoje",
        respostasLista: [
            {
                autor: "Lucas",
                texto: "Uma boa dica é pesquisar bastante sobre a empresa antes da entrevista.",
                data: "Hoje"
            },
            {
                autor: "Camila",
                texto: "Também recomendo treinar respostas para perguntas comuns de entrevistas.",
                data: "Hoje"
            }
        ]
    },
    {
        id: 2,
        autor: "Lucas",
        titulo: "Alguém já trabalhou nessa empresa?",
        categoria: "Empresas",
        texto: "Estou analisando uma oportunidade e gostaria de conhecer a experiência de outras pessoas que já trabalharam nessa empresa.",
        respostas: 5,
        data: "Hoje",
        respostasLista: []
    },
    {
        id: 3,
        autor: "Rafael",
        titulo: "Vaga de Analista de Dados",
        categoria: "Vagas",
        texto: "Encontrei uma vaga interessante de Analista de Dados. Alguém aqui também está participando desse processo seletivo?",
        respostas: 12,
        data: "Ontem",
        respostasLista: []
    },
    {
        id: 4,
        autor: "Camila",
        titulo: "Dicas para melhorar o currículo",
        categoria: "Dicas",
        texto: "Estou atualizando meu currículo. O que vocês consideram mais importante para chamar a atenção dos recrutadores?",
        respostas: 16,
        data: "Ontem",
        respostasLista: []
    },
    {
        id: 5,
        autor: "Pedro",
        titulo: "Vale a pena fazer cursos antes de procurar emprego?",
        categoria: "Carreira",
        texto: "Estou pensando em fazer alguns cursos profissionalizantes antes de começar a enviar currículos. O que vocês acham?",
        respostas: 7,
        data: "2 dias atrás",
        respostasLista: []
    },
    {
        id: 6,
        autor: "Ana",
        titulo: "Como identificar uma boa oportunidade de emprego?",
        categoria: "Vagas",
        texto: "Quais pontos vocês analisam antes de decidir se uma vaga realmente vale a pena?",
        respostas: 9,
        data: "3 dias atrás",
        respostasLista: []
    }
];

let discussoes = [];
let categoriaAtual = "Todas";
let pesquisaAtual = "";
let discussaoAberta = null;

const listaDiscussoes =
    document.getElementById("listaDiscussões");

const forumVazio =
    document.getElementById("forumVazio");

const campoPesquisa =
    document.getElementById("campoPesquisaForum");

const modal =
    document.getElementById("modalDiscussao");

const abrirModal =
    document.getElementById("abrirModal");

const fecharModal =
    document.getElementById("fecharModal");

const formDiscussao =
    document.getElementById("formDiscussao");


/* =========================================
   CARREGAMENTO
========================================= */

function carregarDiscussoes() {

    const dadosSalvos =
        localStorage.getItem(chaveForum);

    if (dadosSalvos) {

        try {

            discussoes =
                JSON.parse(dadosSalvos);

            discussoes =
                normalizarDiscussoes(discussoes);

        } catch {

            discussoes =
                JSON.parse(
                    JSON.stringify(discussoesIniciais)
                );

            salvarDiscussoes();

        }

    } else {

        discussoes =
            JSON.parse(
                JSON.stringify(discussoesIniciais)
            );

        salvarDiscussoes();

    }

    renderizarDiscussoes();
    atualizarContadores();
}


/* =========================================
   NORMALIZAÇÃO
========================================= */

function normalizarDiscussoes(lista) {

    return lista.map((discussao) => {

        if (!Array.isArray(discussao.respostasLista)) {

            discussao.respostasLista = [];

        }

        if (
            typeof discussao.respostas !== "number"
        ) {

            discussao.respostas =
                discussao.respostasLista.length;

        }

        return discussao;

    });

}


/* =========================================
   LOCAL STORAGE
========================================= */

function salvarDiscussoes() {

    localStorage.setItem(
        chaveForum,
        JSON.stringify(discussoes)
    );

}


/* =========================================
   RENDERIZAÇÃO
========================================= */

function renderizarDiscussoes() {

    if (!listaDiscussoes) {
        return;
    }

    const resultado =
        discussoes.filter((discussao) => {

            const correspondeCategoria =
                categoriaAtual === "Todas" ||
                discussao.categoria === categoriaAtual;

            const textoPesquisa =
                pesquisaAtual
                    .toLowerCase()
                    .trim();

            const correspondePesquisa =
                discussao.titulo
                    .toLowerCase()
                    .includes(textoPesquisa) ||

                discussao.texto
                    .toLowerCase()
                    .includes(textoPesquisa) ||

                discussao.autor
                    .toLowerCase()
                    .includes(textoPesquisa);

            return (
                correspondeCategoria &&
                correspondePesquisa
            );

        });

    listaDiscussoes.innerHTML = "";

    if (resultado.length === 0) {

        if (forumVazio) {

            forumVazio.classList.add("visivel");

        }

        return;

    }

    if (forumVazio) {

        forumVazio.classList.remove("visivel");

    }

    resultado.forEach((discussao) => {

        const card =
            document.createElement("article");

        card.className =
            "discussao-card";

        card.dataset.id =
            discussao.id;

        card.innerHTML = `

            <div class="discussao-card-topo">

                <span class="discussao-categoria">
                    ${escaparHTML(discussao.categoria)}
                </span>

                <span class="discussao-data">
                    ${escaparHTML(discussao.data)}
                </span>

            </div>

            <h3>
                ${escaparHTML(discussao.titulo)}
            </h3>

            <p>
                ${escaparHTML(discussao.texto)}
            </p>

            <div class="discussao-card-footer">

                <div class="discussao-autor">

                    <span class="autor-avatar">
                        ${obterInicial(discussao.autor)}
                    </span>

                    <span>
                        ${escaparHTML(discussao.autor)}
                    </span>

                </div>

                <span class="discussao-respostas">

                    ${discussao.respostas}

                    resposta${discussao.respostas === 1 ? "" : "s"}

                </span>

            </div>

        `;

        card.addEventListener(
            "click",
            () => abrirDiscussao(discussao.id)
        );

        listaDiscussoes.appendChild(card);

    });

}


/* =========================================
   CONTADORES
========================================= */

function atualizarContadores() {

    const categorias = [
        "Carreira",
        "Empresas",
        "Vagas",
        "Dicas"
    ];

    categorias.forEach((categoria) => {

        const contador =
            discussoes.filter(
                (discussao) =>
                    discussao.categoria === categoria
            ).length;

        const elemento =
            document.getElementById(
                `contador${categoria}`
            );

        if (elemento) {

            elemento.textContent =
                contador;

        }

    });

}


/* =========================================
   UTILITÁRIOS
========================================= */

function obterInicial(nome) {

    if (!nome) {
        return "?";
    }

    return nome
        .trim()
        .charAt(0)
        .toUpperCase();

}


function escaparHTML(texto) {

    const div =
        document.createElement("div");

    div.textContent =
        texto;

    return div.innerHTML;

}


/* =========================================
   MODAL DE NOVA DISCUSSÃO
========================================= */

function abrirJanelaModal() {

    if (!modal) {
        return;
    }

    modal.classList.add("aberto");

    document.body.classList.add(
        "modal-aberto"
    );

    setTimeout(() => {

        const campoAutor =
            document.getElementById(
                "autorDiscussao"
            );

        if (campoAutor) {

            campoAutor.focus();

        }

    }, 100);

}


function fecharJanelaModal() {

    if (!modal) {
        return;
    }

    modal.classList.remove("aberto");

    document.body.classList.remove(
        "modal-aberto"
    );

}


/* =========================================
   EVENTOS DO MODAL
========================================= */

if (abrirModal) {

    abrirModal.addEventListener(
        "click",
        abrirJanelaModal
    );

}

if (fecharModal) {

    fecharModal.addEventListener(
        "click",
        fecharJanelaModal
    );

}

if (modal) {

    modal.addEventListener(
        "click",
        (evento) => {

            if (
                evento.target === modal
            ) {

                fecharJanelaModal();

            }

        }
    );

}


/* =========================================
   ESC PARA FECHAR
========================================= */

document.addEventListener(
    "keydown",
    (evento) => {

        if (
            evento.key === "Escape"
        ) {

            if (
                modal &&
                modal.classList.contains("aberto")
            ) {

                fecharJanelaModal();

            }

            fecharDiscussao();

        }

    }
);


/* =========================================
   PESQUISA
========================================= */

if (campoPesquisa) {

    campoPesquisa.addEventListener(
        "input",
        () => {

            pesquisaAtual =
                campoPesquisa.value.trim();

            renderizarDiscussoes();

        }
    );

}


/* =========================================
   FILTROS
========================================= */

document
    .querySelectorAll(".filtro")
    .forEach((botao) => {

        botao.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".filtro")
                    .forEach((item) => {

                        item.classList.remove(
                            "ativo"
                        );

                    });

                botao.classList.add(
                    "ativo"
                );

                categoriaAtual =
                    botao.dataset.categoria;

                renderizarDiscussoes();

            }
        );

    });


/* =========================================
   CATEGORIAS DA SIDEBAR
========================================= */

document
    .querySelectorAll(
        ".categoria-lista button"
    )
    .forEach((botao) => {

        botao.addEventListener(
            "click",
            () => {

                categoriaAtual =
                    botao.dataset.categoria;

                document
                    .querySelectorAll(".filtro")
                    .forEach((item) => {

                        item.classList.toggle(
                            "ativo",
                            item.dataset.categoria ===
                                categoriaAtual
                        );

                    });

                renderizarDiscussoes();

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );

    });


/* =========================================
   CRIAR NOVA DISCUSSÃO
========================================= */

if (formDiscussao) {

    formDiscussao.addEventListener(
        "submit",
        (evento) => {

            evento.preventDefault();

            const autor =
                document
                    .getElementById(
                        "autorDiscussao"
                    )
                    ?.value
                    .trim();

            const titulo =
                document
                    .getElementById(
                        "tituloDiscussao"
                    )
                    ?.value
                    .trim();

            const categoria =
                document
                    .getElementById(
                        "categoriaDiscussao"
                    )
                    ?.value;

            const texto =
                document
                    .getElementById(
                        "textoDiscussao"
                    )
                    ?.value
                    .trim();

            if (
                !autor ||
                !titulo ||
                !categoria ||
                !texto
            ) {

                return;

            }

            const novaDiscussao = {

                id: Date.now(),

                autor,

                titulo,

                categoria,

                texto,

                respostas: 0,

                respostasLista: [],

                data: "Agora"

            };

            discussoes.unshift(
                novaDiscussao
            );

            salvarDiscussoes();

            categoriaAtual =
                categoria;

            pesquisaAtual = "";

            if (campoPesquisa) {

                campoPesquisa.value = "";

            }

            document
                .querySelectorAll(".filtro")
                .forEach((item) => {

                    item.classList.toggle(
                        "ativo",
                        item.dataset.categoria ===
                            categoria
                    );

                });

            formDiscussao.reset();

            fecharJanelaModal();

            atualizarContadores();

            renderizarDiscussoes();

        }
    );

}


/* =========================================
   ABRIR DISCUSSÃO
========================================= */

function abrirDiscussao(id) {

    const discussao =
        discussoes.find(
            (item) =>
                item.id === id
        );

    if (!discussao) {
        return;
    }

    discussaoAberta =
        discussao;

    const modalDiscussao =
        document.createElement("div");

    modalDiscussao.className =
        "modal-discussao-detalhes";

    modalDiscussao.id =
        "modalDetalhesForum";

    const respostasHTML =
        gerarRespostasHTML(
            discussao
        );

    modalDiscussao.innerHTML = `

        <div class="modal-discussao-conteudo">

            <button
                class="modal-discussao-fechar"
                id="fecharDetalhesForum"
                aria-label="Fechar discussão"
            >
                ×
            </button>

            <div class="detalhes-categoria">
                ${escaparHTML(discussao.categoria)}
            </div>

            <h2>
                ${escaparHTML(discussao.titulo)}
            </h2>

            <div class="detalhes-autor">

                <span class="autor-avatar grande">
                    ${obterInicial(discussao.autor)}
                </span>

                <div>

                    <strong>
                        ${escaparHTML(discussao.autor)}
                    </strong>

                    <small>
                        ${escaparHTML(discussao.data)}
                    </small>

                </div>

            </div>

            <div class="detalhes-texto">
                ${escaparHTML(discussao.texto)}
            </div>

            <div class="detalhes-respostas">

                <div class="respostas-cabecalho">

                    <h3>
                        Respostas
                    </h3>

                    <span>
                        ${discussao.respostas}
                    </span>

                </div>

                <div id="listaRespostasForum">

                    ${respostasHTML}

                </div>

            </div>

            <form
                id="formRespostaForum"
                class="form-resposta-forum"
            >

                <h3>
                    Participar da discussão
                </h3>

                <input
                    type="text"
                    id="autorRespostaForum"
                    placeholder="Seu nome"
                    maxlength="60"
                    required
                >

                <textarea
                    id="textoRespostaForum"
                    placeholder="Escreva sua resposta..."
                    maxlength="1000"
                    required
                ></textarea>

                <button
                    type="submit"
                    class="botao-responder"
                >
                    Responder
                </button>

            </form>

        </div>

    `;

    document.body.appendChild(
        modalDiscussao
    );

    document.body.classList.add(
        "modal-aberto"
    );

    const fechar =
        document.getElementById(
            "fecharDetalhesForum"
        );

    fechar.addEventListener(
        "click",
        fecharDiscussao
    );

    modalDiscussao.addEventListener(
        "click",
        (evento) => {

            if (
                evento.target ===
                modalDiscussao
            ) {

                fecharDiscussao();

            }

        }
    );

    const formResposta =
        document.getElementById(
            "formRespostaForum"
        );

    formResposta.addEventListener(
        "submit",
        adicionarResposta
    );

    setTimeout(() => {

        document
            .getElementById(
                "autorRespostaForum"
            )
            ?.focus();

    }, 100);

}


/* =========================================
   GERAR RESPOSTAS
========================================= */

function gerarRespostasHTML(discussao) {

    if (
        !discussao.respostasLista ||
        discussao.respostasLista.length === 0
    ) {

        return `

            <div class="sem-respostas">

                <strong>
                    Ainda não há respostas registradas.
                </strong>

                <p>
                    Seja a primeira pessoa a participar desta discussão.
                </p>

            </div>

        `;

    }

    return discussao.respostasLista
        .map((resposta) => {

            return `

                <div class="resposta-forum">

                    <div class="resposta-topo">

                        <div class="resposta-autor">

                            <span class="autor-avatar">
                                ${obterInicial(resposta.autor)}
                            </span>

                            <strong>
                                ${escaparHTML(resposta.autor)}
                            </strong>

                        </div>

                        <small>
                            ${escaparHTML(resposta.data)}
                        </small>

                    </div>

                    <p>
                        ${escaparHTML(resposta.texto)}
                    </p>

                </div>

            `;

        })
        .join("");

}


/* =========================================
   ADICIONAR RESPOSTA
========================================= */

function adicionarResposta(evento) {

    evento.preventDefault();

    if (!discussaoAberta) {
        return;
    }

    const autor =
        document
            .getElementById(
                "autorRespostaForum"
            )
            .value
            .trim();

    const texto =
        document
            .getElementById(
                "textoRespostaForum"
            )
            .value
            .trim();

    if (!autor || !texto) {
        return;
    }

    const resposta = {

        autor,

        texto,

        data: "Agora"

    };

    if (
        !Array.isArray(
            discussaoAberta.respostasLista
        )
    ) {

        discussaoAberta.respostasLista = [];

    }

    discussaoAberta.respostasLista.push(
        resposta
    );

    discussaoAberta.respostas =
        discussaoAberta.respostasLista.length;

    salvarDiscussoes();

    const lista =
        document.getElementById(
            "listaRespostasForum"
        );

    if (lista) {

        lista.innerHTML =
            gerarRespostasHTML(
                discussaoAberta
            );

    }

    const cabecalho =
        document.querySelector(
            ".respostas-cabecalho span"
        );

    if (cabecalho) {

        cabecalho.textContent =
            discussaoAberta.respostas;

    }

    const form =
        document.getElementById(
            "formRespostaForum"
        );

    if (form) {

        form.reset();

    }

    renderizarDiscussoes();

}


/* =========================================
   FECHAR DISCUSSÃO
========================================= */

function fecharDiscussao() {

    const modalDetalhes =
        document.getElementById(
            "modalDetalhesForum"
        );

    if (modalDetalhes) {

        modalDetalhes.remove();

    }

    discussaoAberta = null;

    document.body.classList.remove(
        "modal-aberto"
    );

}


/* =========================================
   INICIALIZAÇÃO
========================================= */

carregarDiscussoes();