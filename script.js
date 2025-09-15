document.addEventListener('DOMContentLoaded', function() {
    
    // URL do seu Webhook no Make.com
    const MAKE_WEBHOOK_URL = 'https://hook.us1.make.com/sua-url-aqui';

    // === ELEMENTOS GERAIS DO FORMULÁRIO ===
    const form = document.getElementById('rentalForm');
    const submitButton = document.getElementById('submitButton');
    const tipoPessoaFisica = document.getElementById('tipoPessoaFisica');
    const tipoPessoaJuridica = document.getElementById('tipoPessoaJuridica');
    const formPessoaFisica = document.getElementById('formPessoaFisica');
    const formPessoaJuridica = document.getElementById('formPessoaJuridica');

    // === ELEMENTOS DO LOCATÁRIO PRINCIPAL ===
    const estadoCivilPrincipal = document.getElementById('estadoCivil');
    const dadosConjugePrincipal = document.getElementById('dadosConjugePrincipal');

    // === ELEMENTOS PARA LOCATÁRIOS DINÂMICOS ===
    const addLocatarioBtn = document.getElementById('addLocatarioBtn');
    const locatariosAdicionaisContainer = document.getElementById('locatariosAdicionaisContainer');
    const locatarioTemplate = document.getElementById('locatarioTemplate');
    let locatarioIndex = 1; // Começamos em 1, pois o principal é o 0

    // === FUNÇÕES DE LÓGICA ===

    // Alterna entre formulários PF e PJ
    function toggleFormType() {
        if (tipoPessoaFisica.checked) {
            formPessoaFisica.classList.remove('hidden');
            formPessoaJuridica.classList.add('hidden');
        } else {
            formPessoaFisica.classList.add('hidden');
            formPessoaJuridica.classList.remove('hidden');
        }
    }

    // Mostra/esconde campos do cônjuge. Agora é uma função genérica.
    function toggleConjugeFields(estadoCivilSelect, conjugeContainer) {
        const selectedValue = estadoCivilSelect.value;
        const camposConjuge = conjugeContainer.querySelectorAll('input, select');

        if (selectedValue === 'casado' || selectedValue === 'uniao_estavel') {
            conjugeContainer.classList.remove('hidden');
            camposConjuge.forEach(el => el.required = true);
        } else {
            conjugeContainer.classList.add('hidden');
            camposConjuge.forEach(el => {
                el.required = false;
                el.value = ''; // Limpa os campos
            });
        }
    }

    // Adiciona um novo bloco de locatário
    function adicionarLocatario() {
        // 1. Clonar o template
        const clone = locatarioTemplate.content.cloneNode(true);
        const novoBloco = clone.querySelector('.locatario-adicional-bloco');
        
        // 2. Atualizar os nomes dos campos para garantir o envio correto
        const inputs = novoBloco.querySelectorAll('input, select');
        inputs.forEach(input => {
            const originalName = input.name;
            if (originalName.startsWith('conjuge')) {
                 // Ex: conjugeNome -> locatarios[1][conjuge][nome]
                 const cleanName = originalName.replace('conjuge', '').toLowerCase();
                 input.name = `locatarios[${locatarioIndex}][conjuge][${cleanName}]`;
            } else {
                 // Ex: primeiroNome -> locatarios[1][primeiroNome]
                 input.name = `locatarios[${locatarioIndex}][${originalName}]`;
            }
        });

        // 3. Adicionar lógica de evento para o novo bloco
        const novoEstadoCivilSelect = novoBloco.querySelector('.estado-civil-adicional');
        const novoConjugeContainer = novoBloco.querySelector('.dados-conjuge-adicional');
        
        novoEstadoCivilSelect.addEventListener('change', () => {
            toggleConjugeFields(novoEstadoCivilSelect, novoConjugeContainer);
        });

        const removerBtn = novoBloco.querySelector('.btn-remover');
        removerBtn.addEventListener('click', () => {
            novoBloco.remove();
        });

        // 4. Adicionar o bloco clonado ao container
        locatariosAdicionaisContainer.appendChild(clone);

        // 5. Incrementar o índice para o próximo locatário
        locatarioIndex++;
    }

    // === EVENT LISTENERS ===

    // Geral
    tipoPessoaFisica.addEventListener('change', toggleFormType);
    tipoPessoaJuridica.addEventListener('change', toggleFormType);
    
    // Locatário Principal
    estadoCivilPrincipal.addEventListener('change', () => {
        toggleConjugeFields(estadoCivilPrincipal, dadosConjugePrincipal);
    });

    // Locatários Adicionais
    addLocatarioBtn.addEventListener('click', adicionarLocatario);

    // Envio do Formulário
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';

        const formData = new FormData(form);

        fetch(MAKE_WEBHOOK_URL, {
            method: 'POST',
            body: formData 
        })
        .then(response => response.ok ? response.text() : Promise.reject('Erro no envio'))
        .then(data => {
            console.log('Sucesso:', data);
            alert('Dados enviados com sucesso para análise!');
            form.reset();
            // Recarregar a página para limpar os blocos dinâmicos
            window.location.reload();
        })
        .catch((error) => {
            console.error('Erro:', error);
            alert('Ocorreu um erro ao enviar os dados. Por favor, tente novamente.');
        })
        .finally(() => {
            submitButton.disabled = false;
            submitButton.textContent = 'Enviar para Análise';
        });
    });

    // Inicialização
    toggleFormType();
});
