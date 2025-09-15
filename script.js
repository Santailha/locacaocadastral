document.addEventListener('DOMContentLoaded', function() {
    
    // URL do seu Webhook no Make.com - SUBSTITUA PELA SUA URL!
    const MAKE_WEBHOOK_URL = 'https://hook.us1.make.com/sua-url-aqui';

    // Elementos do formulário
    const form = document.getElementById('rentalForm');
    const tipoPessoaFisica = document.getElementById('tipoPessoaFisica');
    const tipoPessoaJuridica = document.getElementById('tipoPessoaJuridica');
    const formPessoaFisica = document.getElementById('formPessoaFisica');
    const formPessoaJuridica = document.getElementById('formPessoaJuridica');
    const estadoCivil = document.getElementById('estadoCivil');
    const dadosConjuge = document.getElementById('dadosConjuge');
    const submitButton = document.getElementById('submitButton');

    // Função para alternar entre os formulários PF e PJ
    function toggleFormType() {
        if (tipoPessoaFisica.checked) {
            formPessoaFisica.classList.remove('hidden');
            formPessoaJuridica.classList.add('hidden');
        } else {
            formPessoaFisica.classList.add('hidden');
            formPessoaJuridica.classList.remove('hidden');
        }
    }

    // Função para mostrar/esconder dados do cônjuge
    function toggleConjugeFields() {
        const selectedValue = estadoCivil.value;
        if (selectedValue === 'casado' || selectedValue === 'uniao_estavel') {
            dadosConjuge.classList.remove('hidden');
            // Torna os campos do cônjuge obrigatórios
            dadosConjuge.querySelectorAll('input, select').forEach(el => el.required = true);
        } else {
            dadosConjuge.classList.add('hidden');
            // Remove a obrigatoriedade dos campos
            dadosConjuge.querySelectorAll('input, select').forEach(el => el.required = false);
        }
    }
    
    // Função para consulta de CEP (Bônus)
    const cepInput = document.getElementById('cep');
    cepInput.addEventListener('blur', function() {
        const cep = this.value.replace(/\D/g, '');
        if (cep.length === 8) {
            fetch(`https://viacep.com.br/ws/${cep}/json/`)
                .then(response => response.json())
                .then(data => {
                    if (!data.erro) {
                        document.getElementById('endereco').value = data.logradouro;
                        document.getElementById('bairro').value = data.bairro; // Você precisa adicionar os campos de bairro, cidade, estado no HTML
                        document.getElementById('cidade').value = data.localidade;
                        document.getElementById('estado').value = data.uf;
                    }
                })
                .catch(error => console.error('Erro ao buscar CEP:', error));
        }
    });


    // Adiciona os "escutadores" de eventos
    tipoPessoaFisica.addEventListener('change', toggleFormType);
    tipoPessoaJuridica.addEventListener('change', toggleFormType);
    estadoCivil.addEventListener('change', toggleConjugeFields);

    // Evento de envio do formulário
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Impede o envio tradicional da página

        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';

        // O FormData é essencial para enviar formulários com arquivos (multipart/form-data)
        const formData = new FormData(form);

        // Envia os dados para o Make.com usando a API Fetch
        fetch(MAKE_WEBHOOK_URL, {
            method: 'POST',
            body: formData 
        })
        .then(response => {
            if (response.ok) {
                // Sucesso! Pode ser 'response.json()' se o Make retornar algo
                return response.text(); 
            }
            throw new Error('Erro na comunicação com o servidor.');
        })
        .then(data => {
            console.log('Sucesso:', data);
            alert('Dados enviados com sucesso para análise!');
            form.reset(); // Limpa o formulário
        })
        .catch((error) => {
            console.error('Erro:', error);
            alert('Ocorreu um erro ao enviar os dados. Por favor, tente novamente.');
        })
        .finally(() => {
            // Reabilita o botão após a tentativa de envio
            submitButton.disabled = false;
            submitButton.textContent = 'Enviar para Análise';
        });
    });

    // Inicializa o estado correto do formulário ao carregar a página
    toggleFormType();
});
