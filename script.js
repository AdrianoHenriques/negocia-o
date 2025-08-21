// Máscara para moeda brasileira (pt-BR)
function mascaraMoeda(input) {
  let v = input.value.replace(/\D/g, '');
  v = (v / 100).toFixed(2) + '';
  v = v.replace('.', ',');
  v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
  input.value = 'R$ ' + v;
}

document.getElementById('mensalidadeCheia').addEventListener('input', function(e) {
  mascaraMoeda(e.target);
});
document.getElementById('mensalidadeAtual').addEventListener('input', function(e) {
  mascaraMoeda(e.target);
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
function mostrarErro(msg) {
  const errorDiv = document.getElementById('errorMsg');
  errorDiv.textContent = msg;
  errorDiv.style.display = 'block';
  document.getElementById('resultados').innerHTML = '';
}

// Função para limpar erro
function limparErro() {
  const errorDiv = document.getElementById('errorMsg');
  errorDiv.textContent = '';
  errorDiv.style.display = 'none';
}

// Função principal de cálculo
document.getElementById('calcularBtn').addEventListener('click', function() {
  limparErro();
  const mensalidadeCheia = parseBRL(document.getElementById('mensalidadeCheia').value);
  const mensalidadeAtual = parseBRL(document.getElementById('mensalidadeAtual').value);

  // Validação dos campos
  if (isNaN(mensalidadeCheia) || isNaN(mensalidadeAtual)) {
    mostrarErro('Preencha os valores corretamente.');
    return;
  }
  if (mensalidadeCheia <= 0 || mensalidadeAtual <= 0) {
    mostrarErro('Os valores devem ser maiores que zero.');
    return;
  }
  if (mensalidadeAtual > mensalidadeCheia) {
    mostrarErro('A mensalidade atual não pode ser maior que a cheia.');
    return;
  }

  // Fórmulas:
  // 1. % de desconto atual
  // descontoAtualPct = ((mensalidadeCheia - mensalidadeAtual) / mensalidadeCheia) * 100
  const descontoAtualPct = ((mensalidadeCheia - mensalidadeAtual) / mensalidadeCheia) * 100;

  // 2. % de desconto após perder 20% do desconto
  // descontoAposPerdaPct = descontoAtualPct * 0.8
  const descontoAposPerdaPct = descontoAtualPct * 0.8;

  // 3. Nova mensalidade simulada aplicando o desconto reduzido
  // novaMensalidade = mensalidadeCheia * (1 - descontoAposPerdaPct/100)
  const novaMensalidade = mensalidadeCheia * (1 - descontoAposPerdaPct / 100);

  // Exibir resultados em cards
  document.getElementById('resultados').innerHTML = `
    <div class="card">Desconto atual: ${descontoAtualPct.toFixed(2)}%</div>
    <div class="card">Desconto após perder 20%: ${descontoAposPerdaPct.toFixed(2)}%</div>
    <div class="card">Nova mensalidade simulada: ${formatBRL(novaMensalidade)}</div>
  `;
});

// Botão Limpar
document.getElementById('limparBtn').addEventListener('click', function() {
  document.getElementById('mensalidadeCheia').value = '';
  document.getElementById('mensalidadeAtual').value = '';
  document.getElementById('resultados').innerHTML = '';
  limparErro();
});

// Preencher exemplo de teste como placeholder
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('mensalidadeCheia').value = 'R$ 1.000,00';
  document.getElementById('mensalidadeAtual').value = 'R$ 800,00';
});
