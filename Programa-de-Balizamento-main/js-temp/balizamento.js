// js/balizamento.js (VERSÃO FINAL COM PLACEHOLDERS APENAS NA IMPRESSÃO)
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('balizamento-container');
    const imprimirButton = document.getElementById('imprimir-btn');
    const removerTodosButton = document.getElementById('remover-todos-btn');

    function carregarPagina() {
        const atletas = getAtletas();
        // A função processarDados agora sempre gera a lista completa
        const provasFinais = processarDados(atletas);
        // A função renderizarBalisamento vai usar a classe 'placeholder'
        renderizarBalisamento(provasFinais);
    }

    // --- OUVINTES DE EVENTOS (sem alterações) ---
    imprimirButton.addEventListener('click', () => { window.print(); });
    removerTodosButton.addEventListener('click', () => { if (confirm('Tem certeza?')) { removerTodosAtletas(); carregarPagina(); } });
    container.addEventListener('click', (event) => {
        if (event.target.classList.contains('btn-remover-atleta')) {
            const atletaIdParaRemover = parseInt(event.target.dataset.id, 10);
            if (atletaIdParaRemover === 0) { // Não permite remover o atleta "None"
                alert("Não é possível remover o registro 'None'.");
                return;
            }
            if (confirm('Tem certeza?')) { removerAtleta(atletaIdParaRemover); carregarPagina(); }
        }
    });

    /**
     * Função de processamento reestruturada para gerar placeholders
     */
    function processarDados(atletas) {
        const ordemRaias = [4, 5, 3, 6, 2, 7, 1];
        const NUMERO_DE_RAIAS = 7;
        const ordemDasCategorias = ["Mini Mirim", "Pré-Mirim", "Mirim 1", "Mirim 2", "Petiz 1", "Petiz 2", "Infantil 1", "Infantil 2", "Juvenil 1", "Juvenil 2", "Júnior 1", "Júnior 2", "Sênior"];
        const todasProvasDefinidas = getProvas();
        const ordemPersonalizada = getOrdemDasProvas();

        // 1. GERAR "EVENTOS BASE" A PARTIR DA ORDEM PERSONALIZADA E CATEGORIAS
        let eventosBase = [];
        const provasOrdenadas = todasProvasDefinidas.sort((a, b) => {
            const indexA = ordemPersonalizada.indexOf(String(a.id));
            const indexB = ordemPersonalizada.indexOf(String(b.id));
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            return 0;
        });

        provasOrdenadas.forEach(provaDefinida => {
            provaDefinida.categorias.sort((a,b) => ordemDasCategorias.indexOf(a) - ordemDasCategorias.indexOf(b));
            provaDefinida.categorias.forEach(categoria => {
                eventosBase.push({
                    id: provaDefinida.id,
                    nome: provaDefinida.nome,
                    categoria: categoria
                });
            });
        });

        // 2. CRIAR AS PROVAS FINAIS (FEMININA E MASCULINA) PARA CADA EVENTO BASE
        let listaDeProvasFinais = [];
        eventosBase.forEach((eventoBase, index) => {
            const numeroBase = index + 1;

            // --- Prova Feminina (Ímpar) ---
            const atletasFemininos = atletas.filter(a => a.prova === eventoBase.nome && a.categoria === eventoBase.categoria && a.sexo === 'Feminino');
            let seriesFemininas = [];
            let isPlaceholderFeminino = false;
            if (atletasFemininos.length > 0) {
                seriesFemininas = criarSeries(atletasFemininos, ordemRaias, NUMERO_DE_RAIAS);
            } else {
                seriesFemininas = criarSeriePlaceholder(ordemRaias[0]);
                isPlaceholderFeminino = true;
            }
            listaDeProvasFinais.push({
                ...eventoBase, sexo: 'Feminino', numeroProva: (numeroBase * 2) - 1, séries: seriesFemininas, isPlaceholder: isPlaceholderFeminino
            });

            // --- Prova Masculina (Par) ---
            const atletasMasculinos = atletas.filter(a => a.prova === eventoBase.nome && a.categoria === eventoBase.categoria && a.sexo === 'Masculino');
            let seriesMasculinas = [];
            let isPlaceholderMasculino = false;
            if (atletasMasculinos.length > 0) {
                seriesMasculinas = criarSeries(atletasMasculinos, ordemRaias, NUMERO_DE_RAIAS);
            } else {
                seriesMasculinas = criarSeriePlaceholder(ordemRaias[0]);
                isPlaceholderMasculino = true;
            }
            listaDeProvasFinais.push({
                ...eventoBase, sexo: 'Masculino', numeroProva: (numeroBase * 2), séries: seriesMasculinas, isPlaceholder: isPlaceholderMasculino
            });
        });

        // 3. ORDENAÇÃO FINAL PELO NÚMERO DA PROVA
        listaDeProvasFinais.sort((a, b) => a.numeroProva - b.numeroProva);
        
        return listaDeProvasFinais;
    }

    function criarSeries(listaDeAtletas, ordemRaias, numRaias) { /* ... (função igual à anterior) ... */ }
    // Copie a função criarSeries da resposta anterior aqui, ela não muda.
    function criarSeries(listaDeAtletas, ordemRaias, numRaias) {
        listaDeAtletas.sort((a, b) => a.tempo.localeCompare(b.tempo));
        const séries = [];
        for (let i = 0; i < listaDeAtletas.length; i += numRaias) {
            const atletasDaSerie = listaDeAtletas.slice(i, i + numRaias);
            const serieFormatada = atletasDaSerie.map((atleta, index) => ({ ...atleta, raia: ordemRaias[index] }));
            serieFormatada.sort((a, b) => a.raia - b.raia);
            séries.push(serieFormatada);
        }
        return séries;
    }


    /**
     * Função auxiliar para criar a série com o atleta "None"
     */
    function criarSeriePlaceholder(raia) {
        const atletaNone = { id: 0, nome: 'None', clube: 'None', anoNascimento: 'N/A', tempo: '99:99.99', raia: raia };
        return [[atletaNone]];
    }

    function renderizarBalisamento(provasFinais) {
    container.innerHTML = '';
    if (provasFinais.length === 0) {
        container.innerHTML = '<p>Nenhum atleta inscrito para exibir.</p>';
        return;
    }
    provasFinais.forEach(prova => {
        const provaDiv = document.createElement('div');
        provaDiv.classList.add('prova-section');
        if (prova.isPlaceholder) {
            provaDiv.classList.add('placeholder');
        }

        const titulo = document.createElement('h3');
        titulo.textContent = `Prova ${prova.numeroProva} - ${prova.nome} (${prova.categoria} ${prova.sexo})`;
        provaDiv.appendChild(titulo);
        
        prova.séries.forEach((serie, serieIndex) => {
            const serieTitulo = document.createElement('h4');
            serieTitulo.textContent = `Série ${serieIndex + 1}`;
            provaDiv.appendChild(serieTitulo);
            const table = document.createElement('table');
            
            // ALTERAÇÃO 1: Adicionada a classe 'coluna-acao' no <th>
            const thead = `
                <thead>
                    <tr>
                        <th>Raia</th>
                        <th>Nome</th>
                        <th>Clube</th>
                        <th>Ano</th>
                        <th>Tempo</th>
                        <th class="coluna-acao">Ação</th>
                    </tr>
                </thead>`;
            table.innerHTML = thead;
            
            const tbody = document.createElement('tbody');
            serie.forEach(atleta => {
                const tr = document.createElement('tr');
                
                // ALTERAÇÃO 2: Adicionada a classe 'coluna-acao' no <td>
                tr.innerHTML = `
                    <td>${atleta.raia}</td>
                    <td>${atleta.nome}</td>
                    <td>${atleta.clube}</td>
                    <td>${atleta.anoNascimento}</td>
                    <td>${atleta.tempo}</td>
                    <td class="coluna-acao"><button class="btn-remover-atleta" data-id="${atleta.id}">Remover</button></td>
                `;
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            provaDiv.appendChild(table);
        });
        container.appendChild(provaDiv);
    });
}
    carregarPagina();
});