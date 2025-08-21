// Máscara para moeda brasileira (pt-BR)
function mascaraMoeda(input) {
  let v = input.value.replace(/\D/g, '');
  v = (v / 100).toFixed(2) + '';
  v = v.replace('.', ',');
  v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
  input.value = 'R$ ' + v;
}

// Aplica máscara nos campos de ambas abas
['valorCurso', 'mensalidadeAtual', 'mensalidadeVencida', 'valorCursoMulti', 'mensalidadeAtualMulti', 'mensalidadeVencidaMulti'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', function(e) { mascaraMoeda(e.target); });
});

// Função para parsear valor monetário pt-BR para float
function parseBRL(valor) {
  if (!valor) return NaN;
  valor = valor.replace(/\s/g, '').replace('R$', '').replace(/\./g, '').replace(',', '.');
  return parseFloat(valor);
}

// Função para formatar moeda BRL
function formatBRL(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

// Função para mostrar erro
function mostrarErro(msg, id = 'errorMsg') {
  const errorDiv = document.getElementById(id);
  errorDiv.textContent = msg;
  errorDiv.style.display = 'block';
}

// Função para limpar erro
function limparErro(id = 'errorMsg') {
  const errorDiv = document.getElementById(id);
  errorDiv.textContent = '';
  errorDiv.style.display = 'none';
}

// Mantém resultados em memória para cada aba
let resultadosNegociacao = '';
let resultadosMulti = '';
let listaMensalidades = [];

// Troca de abas
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.getAttribute('data-tab');
    document.querySelectorAll('.tab-content').forEach(tc => tc.style.display = 'none');
    document.getElementById(tab).style.display = 'block';
    // Restaura resultados e lista
    if (tab === 'negociacao') {
      document.getElementById('resultados').innerHTML = resultadosNegociacao;
      limparErro('errorMsg');
    } else {
      document.getElementById('resultadosMulti').innerHTML = resultadosMulti;
      document.getElementById('listaMensalidades').innerHTML = renderListaMensalidades();
      limparErro('errorMsgMulti');
    }
  });
});

// Função principal de cálculo negociação única
document.getElementById('calcularBtn').addEventListener('click', function() {
  limparErro('errorMsg');
  const valorCurso = parseBRL(document.getElementById('valorCurso').value);
  const mensalidadeAtual = parseBRL(document.getElementById('mensalidadeAtual').value);
  const mensalidadeVencida = parseBRL(document.getElementById('mensalidadeVencida').value);

  // Validação dos campos
  if (isNaN(valorCurso) || isNaN(mensalidadeAtual) || isNaN(mensalidadeVencida)) {
    mostrarErro('Preencha todos os valores corretamente.');
    document.getElementById('resultados').innerHTML = '';
    resultadosNegociacao = '';
    return;
  }
  if (valorCurso <= 0 || mensalidadeAtual <= 0 || mensalidadeVencida <= 0) {
    mostrarErro('Os valores devem ser maiores que zero.');
    document.getElementById('resultados').innerHTML = '';
    resultadosNegociacao = '';
    return;
  }
  if (mensalidadeAtual > valorCurso) {
    mostrarErro('A mensalidade atual não pode ser maior que o valor do curso.');
    document.getElementById('resultados').innerHTML = '';
    resultadosNegociacao = '';
    return;
  }

  // 1. % de desconto atual
  const descontoAtualPct = ((valorCurso - mensalidadeAtual) / valorCurso) * 100;

  // 2. % de desconto após perder 20 pontos percentuais
  let descontoAposPerdaPct = descontoAtualPct - 20;
  if (descontoAposPerdaPct < 0) descontoAposPerdaPct = 0;

  // 3. Valor negociado sobre a mensalidade vencida
  const valorNegociado = mensalidadeVencida * (1 - descontoAposPerdaPct / 100);

  // Exibir resultados em cards
  resultadosNegociacao = `
    <div class="card">Desconto atual: ${descontoAtualPct.toFixed(2)}%</div>
    <div class="card">Desconto após redução de 20 pontos percentuais: ${descontoAposPerdaPct.toFixed(2)}%</div>
    <div class="card">Mensalidade vencida: ${formatBRL(mensalidadeVencida)}</div>
    <div class="card">Mensalidade negociada: ${formatBRL(valorNegociado)}</div>
  `;
  document.getElementById('resultados').innerHTML = resultadosNegociacao;
});

// Botão Limpar negociação única
document.getElementById('limparBtn').addEventListener('click', function() {
  document.getElementById('valorCurso').value = '';
  document.getElementById('mensalidadeAtual').value = '';
  document.getElementById('mensalidadeVencida').value = '';
  document.getElementById('resultados').innerHTML = '';
  resultadosNegociacao = '';
  limparErro('errorMsg');
});

// ----------- Múltiplas mensalidades -----------

// Adicionar mensalidade à lista
document.getElementById('adicionarMensalidadeBtn').addEventListener('click', function(e) {
  e.preventDefault();
  limparErro('errorMsgMulti');
  const valor = parseBRL(document.getElementById('mensalidadeVencidaMulti').value);
  if (isNaN(valor) || valor <= 0) {
    mostrarErro('Informe um valor válido para a mensalidade vencida.', 'errorMsgMulti');
    return;
  }
  listaMensalidades.push(valor);
  document.getElementById('mensalidadeVencidaMulti').value = '';
  document.getElementById('listaMensalidades').innerHTML = renderListaMensalidades();
});

// Renderiza lista de mensalidades
function renderListaMensalidades() {
  if (listaMensalidades.length === 0) return '';
  return listaMensalidades.map((v, i) =>
    `<div class="lista-item">
      ${formatBRL(v)}
      <button type="button" onclick="removerMensalidade(${i})">Remover</button>
    </div>`
  ).join('');
}

// Remove mensalidade da lista
window.removerMensalidade = function(idx) {
  listaMensalidades.splice(idx, 1);
  document.getElementById('listaMensalidades').innerHTML = renderListaMensalidades();
};

// Somar todas e calcular negociação
document.getElementById('somarBtn').addEventListener('click', function() {
  limparErro('errorMsgMulti');
  const valorCurso = parseBRL(document.getElementById('valorCursoMulti').value);
  const mensalidadeAtual = parseBRL(document.getElementById('mensalidadeAtualMulti').value);

  if (isNaN(valorCurso) || isNaN(mensalidadeAtual)) {
    mostrarErro('Preencha o valor do curso e mensalidade atual.', 'errorMsgMulti');
    document.getElementById('resultadosMulti').innerHTML = '';
    resultadosMulti = '';
    return;
  }
  if (valorCurso <= 0 || mensalidadeAtual <= 0) {
    mostrarErro('Os valores devem ser maiores que zero.', 'errorMsgMulti');
    document.getElementById('resultadosMulti').innerHTML = '';
    resultadosMulti = '';
    return;
  }
  if (mensalidadeAtual > valorCurso) {
    mostrarErro('A mensalidade atual não pode ser maior que o valor do curso.', 'errorMsgMulti');
    document.getElementById('resultadosMulti').innerHTML = '';
    resultadosMulti = '';
    return;
  }
  if (listaMensalidades.length === 0) {
    mostrarErro('Adicione ao menos uma mensalidade vencida.', 'errorMsgMulti');
    document.getElementById('resultadosMulti').innerHTML = '';
    resultadosMulti = '';
    return;
  }

  // 1. % de desconto atual
  const descontoAtualPct = ((valorCurso - mensalidadeAtual) / valorCurso) * 100;
  let descontoAposPerdaPct = descontoAtualPct - 20;
  if (descontoAposPerdaPct < 0) descontoAposPerdaPct = 0;

  // 2. Total em atraso
  const totalAtraso = listaMensalidades.reduce((a, b) => a + b, 0);

  // 3. Valor negociado (apenas sobre UMA parcela, conforme regra)
  const valorNegociado = listaMensalidades.length > 0
    ? listaMensalidades[0] * (1 - descontoAposPerdaPct / 100)
    : 0;

  // 4. Desconto obtido
  const descontoObtido = totalAtraso - valorNegociado;

  resultadosMulti = `
    <div class="card">Total em atraso: ${formatBRL(totalAtraso)}</div>
    <div class="card">Valor da negociação: ${formatBRL(valorNegociado)}</div>
    <div class="card">Desconto obtido na negociação: ${formatBRL(descontoObtido)}</div>
  `;
  document.getElementById('resultadosMulti').innerHTML = resultadosMulti;
});

// Botão Limpar múltiplas mensalidades
document.getElementById('limparMultiBtn').addEventListener('click', function() {
  document.getElementById('valorCursoMulti').value = '';
  document.getElementById('mensalidadeAtualMulti').value = '';
  document.getElementById('mensalidadeVencidaMulti').value = '';
  listaMensalidades = [];
  document.getElementById('listaMensalidades').innerHTML = '';
  document.getElementById('resultadosMulti').innerHTML = '';
  resultadosMulti = '';
  limparErro('errorMsgMulti');
});

// Preencher exemplo de teste como placeholder
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('valorCurso').value = 'R$ 1.000,00';
  document.getElementById('mensalidadeAtual').value = 'R$ 800,00';
  document.getElementById('mensalidadeVencida').value = 'R$ 850,00';
  document.getElementById('valorCursoMulti').value = 'R$ 1.000,00';
  document.getElementById('mensalidadeAtualMulti').value = 'R$ 800,00';
  document.getElementById('mensalidadeVencidaMulti').value = 'R$ 850,00';
});