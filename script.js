let vagas = [];

const campoBusca = document.getElementById("campoBusca");
const campoLocalizacao = document.getElementById("campoLocalizacao");
const sugestoes = document.getElementById("sugestoes");
const resultados = document.getElementById("resultados");
const contadorResultados = document.getElementById("contadorResultados");
const vagasDestaque = document.getElementById("vagasDestaque");
const botaoBuscar = document.getElementById("botaoBuscar");

if (campoBusca && campoLocalizacao && sugestoes && resultados && contadorResultados) {

    fetch("vagas.json")

        .then(response => {

            if (!response.ok) {
                throw new Error("Não foi possível carregar as vagas.");
            }

            return response.json();

        })

        .then(data => {

            vagas = data;

            if (vagasDestaque) {
                mostrarVagasDestaque(vagas);
            }

            mostrarVagas(vagas);

        })

        .catch(error => {

            console.error("Erro ao carregar vagas:", error);

            resultados.innerHTML = `
                <div class="erro-vaga">
                    <h3>
                        Não foi possível carregar as vagas.
                    </h3>

                    <p>
                        Tente novamente mais tarde.
                    </p>
                </div>
            `;

        });

    campoBusca.addEventListener("input", function () {

        const texto = this.value.trim().toLowerCase();

        if (texto.length === 0) {

            sugestoes.innerHTML = "";
            sugestoes.style.display = "none";

            return;

        }

        const correspondentes = vagas
            .filter(vaga =>
                vaga.titulo.toLowerCase().includes(texto) ||
                vaga.categoria.toLowerCase().includes(texto) ||
                vaga.empresa.toLowerCase().includes(texto)
            )
            .slice(0, 5);

        if (correspondentes.length === 0) {

            sugestoes.innerHTML = "";
            sugestoes.style.display = "none";

            return;

        }

        sugestoes.innerHTML = correspondentes.map(vaga => `

            <div
                class="sugestao"
                onclick="selecionarSugestao('${vaga.titulo}')"
            >

                <span class="icone-busca">
                    ⌕
                </span>

                <div>

                    <strong>
                        ${vaga.titulo}
                    </strong>

                    <small>
                        ${vaga.empresa} - ${vaga.localizacao}
                    </small>

                </div>

            </div>

        `).join("");

        sugestoes.style.display = "block";

    });

    if (botaoBuscar) {
        botaoBuscar.addEventListener("click", pesquisarVagas);
    }

    campoBusca.addEventListener("keydown", function (event) {

        if (event.key === "Enter") {
            pesquisarVagas();
        }

    });

    campoLocalizacao.addEventListener("keydown", function (event) {

        if (event.key === "Enter") {
            pesquisarVagas();
        }

    });

    document.addEventListener("click", function (event) {

        if (
            campoBusca &&
            sugestoes &&
            !campoBusca.contains(event.target) &&
            !sugestoes.contains(event.target)
        ) {

            sugestoes.style.display = "none";

        }

    });

}

function selecionarSugestao(titulo) {

    if (!campoBusca || !sugestoes) {
        return;
    }

    campoBusca.value = titulo;

    sugestoes.innerHTML = "";
    sugestoes.style.display = "none";

    pesquisarVagas();

}

function pesquisarVagas() {

    if (!campoBusca || !campoLocalizacao) {
        return;
    }

    const busca =
        campoBusca.value.trim().toLowerCase();

    const localizacao =
        campoLocalizacao.value.trim().toLowerCase();

    const vagasFiltradas = vagas.filter(vaga => {

        const correspondeBusca =
            busca === "" ||
            vaga.titulo.toLowerCase().includes(busca) ||
            vaga.empresa.toLowerCase().includes(busca) ||
            vaga.categoria.toLowerCase().includes(busca);

        const correspondeLocalizacao =
            localizacao === "" ||
            vaga.localizacao.toLowerCase().includes(localizacao);

        return (
            correspondeBusca &&
            correspondeLocalizacao
        );

    });

    sugestoes.innerHTML = "";
    sugestoes.style.display = "none";

    mostrarVagas(vagasFiltradas);

}

function mostrarVagasDestaque(lista) {

    if (!vagasDestaque) {
        return;
    }

    const destaques = lista.slice(0, 3);

    vagasDestaque.innerHTML = destaques.map(vaga => `

        <article class="vaga-card destaque-card">

            <div class="vaga-topo">

                <span class="tag">
                    ${vaga.categoria}
                </span>

                <span class="modalidade">
                    ${vaga.modalidade}
                </span>

            </div>

            <h3>
                ${vaga.titulo}
            </h3>

            <p class="empresa">
                ${vaga.empresa}
            </p>

            <p class="localizacao">
                ${vaga.localizacao}
            </p>

            <div class="vaga-informacoes">

                <span>
                    ${vaga.salario}
                </span>

                <span>
                    ${vaga.tipo}
                </span>

            </div>

            <button
                class="ver-vaga"
                onclick="verVaga(${vaga.id})"
            >
                Ver vaga
            </button>

        </article>

    `).join("");

}

function mostrarVagas(lista) {

    if (!resultados || !contadorResultados) {
        return;
    }

    contadorResultados.textContent =
        `${lista.length} vaga${lista.length !== 1 ? "s" : ""} encontrada${lista.length !== 1 ? "s" : ""}`;

    if (lista.length === 0) {

        resultados.innerHTML = `

            <div class="nenhum-resultado">

                <h3>
                    Nenhuma vaga encontrada
                </h3>

                <p>
                    Tente pesquisar outro cargo,
                    empresa ou região.
                </p>

            </div>

        `;

        return;

    }

    resultados.innerHTML = lista.map(vaga => `

        <article class="vaga-card">

            <div class="vaga-topo">

                <span class="tag">
                    ${vaga.categoria}
                </span>

                <span class="modalidade">
                    ${vaga.modalidade}
                </span>

            </div>

            <h3>
                ${vaga.titulo}
            </h3>

            <p class="empresa">
                ${vaga.empresa}
            </p>

            <p class="localizacao">
                ${vaga.localizacao}
            </p>

            <div class="vaga-informacoes">

                <span>
                    ${vaga.salario}
                </span>

                <span>
                    ${vaga.tipo}
                </span>

                <span>
                    ${vaga.nivel}
                </span>

            </div>

            <p class="descricao">
                ${vaga.descricao}
            </p>

            <button
                class="ver-vaga"
                onclick="verVaga(${vaga.id})"
            >
                Ver vaga
            </button>

        </article>

    `).join("");

}

function verVaga(id) {

    window.location.href =
        `vaga.html?id=${id}`;

}