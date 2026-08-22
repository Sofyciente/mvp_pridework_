// ==========================================
// PRIDEWORK - SISTEMA DE VAGAS
// ==========================================


// ==========================================
// VARIÁVEIS PRINCIPAIS
// ==========================================

let vagas = [];

const campoBusca = document.getElementById("campoBusca");
const campoLocalizacao = document.getElementById("campoLocalizacao");
const sugestoes = document.getElementById("sugestoes");
const resultados = document.getElementById("resultados");
const contadorResultados = document.getElementById("contadorResultados");
const vagasDestaque = document.getElementById("vagasDestaque"); 

// ==========================================
// CARREGAR VAGAS
// ==========================================

fetch("vagas.json")

    .then(response => response.json())

    .then(data => {

        vagas = data;

        mostrarVagasDestaque(vagas);

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


// ==========================================
// SISTEMA DE AUTOCOMPLETAR
// ==========================================

campoBusca.addEventListener("input", function () {

    const texto = this.value.trim().toLowerCase();


    // Se o campo estiver vazio,
    // escondemos as sugestões.

    if (texto.length === 0) {

        sugestoes.innerHTML = "";

        sugestoes.style.display = "none";

        return;

    }


    // Procurar vagas relacionadas
    // ao que o usuário digitou.

    const correspondentes = vagas.filter(vaga =>

        vaga.titulo.toLowerCase().includes(texto) ||

        vaga.categoria.toLowerCase().includes(texto) ||

        vaga.empresa.toLowerCase().includes(texto)

    ).slice(0, 5);


    // Se não encontrar nenhuma sugestão.

    if (correspondentes.length === 0) {

        sugestoes.innerHTML = "";

        sugestoes.style.display = "none";

        return;

    }


    // Criar as sugestões.

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


// ==========================================
// SELECIONAR UMA SUGESTÃO
// ==========================================

function selecionarSugestao(titulo) {

    campoBusca.value = titulo;

    sugestoes.innerHTML = "";

    sugestoes.style.display = "none";

    pesquisarVagas();

}


// ==========================================
// BOTÃO DE BUSCA
// ==========================================

document
    .getElementById("botaoBuscar")
    .addEventListener("click", pesquisarVagas);


// ==========================================
// PESQUISA COM ENTER
// ==========================================

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


// ==========================================
// PESQUISAR VAGAS
// ==========================================

function pesquisarVagas() {

    const busca =
        campoBusca.value.trim().toLowerCase();


    const localizacao =
        campoLocalizacao.value.trim().toLowerCase();


    // Filtrar as vagas.

    const vagasFiltradas = vagas.filter(vaga => {


        // Verificar cargo, empresa ou categoria.

        const correspondeBusca =

            busca === "" ||

            vaga.titulo
                .toLowerCase()
                .includes(busca) ||

            vaga.empresa
                .toLowerCase()
                .includes(busca) ||

            vaga.categoria
                .toLowerCase()
                .includes(busca);


        // Verificar localização.

        const correspondeLocalizacao =

            localizacao === "" ||

            vaga.localizacao
                .toLowerCase()
                .includes(localizacao);


        return (
            correspondeBusca &&
            correspondeLocalizacao
        );

    });


    // Esconder sugestões depois da pesquisa.

    sugestoes.innerHTML = "";

    sugestoes.style.display = "none";


    // Mostrar resultados.

    mostrarVagas(vagasFiltradas);

}


// ==========================================
// MOSTRAR VAGAS
// ==========================================

// ==========================================
// MOSTRAR VAGAS EM DESTAQUE
// ==========================================

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


    // Atualizar contador.

    contadorResultados.textContent =

        `${lista.length} vaga${lista.length !== 1 ? "s" : ""} encontrada${lista.length !== 1 ? "s" : ""}`;


    // Caso nenhuma vaga seja encontrada.

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


    // Criar os cards das vagas.

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


// ==========================================
// ABRIR DETALHES DA VAGA
// ==========================================

function verVaga(id) {

    window.location.href =
        `vaga.html?id=${id}`;

}


// ==========================================
// FECHAR SUGESTÕES AO CLICAR FORA
// ==========================================

document.addEventListener("click", function (event) {


    // Verificar se o clique foi fora
    // do campo de busca e das sugestões.

    if (

        !campoBusca.contains(event.target) &&

        !sugestoes.contains(event.target)

    ) {

        sugestoes.style.display = "none";

    }

});                                                     