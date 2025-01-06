// server.js
const express = require('express');
const path = require('path');

const sequelize = require('./models/index');
const Transaction = require('./models/transaction');
const platforms = require('./platforms'); // Agora com iofBuy, spreadBuy, iofSell, spreadSell etc.

const calcStats = require('./utils/calcStats');
const fetchDollarRate = require('./utils/fetchDollarRate'); // Puxa a cotação real

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Sincroniza com o banco (usar { alter: true } ou { force: true } em dev)
sequelize.sync({ alter: true })
  .then(() => {
    console.log('Banco de dados sincronizado.');
  })
  .catch(err => {
    console.error('Erro ao sincronizar DB:', err);
  });

// Mock de senha
const MOCKED_PASSWORD = 's3nh4Sup3rS3cr3t4';

// ------------------------- ROTAS -------------------------

// (1) LOGIN
app.get('/', (req, res) => {
  res.render('login', { error: req.query.error });
});

app.post('/login', (req, res) => {
  const { password } = req.body;
  if (password === MOCKED_PASSWORD) {
    return res.redirect('/dashboard');
  } else {
    return res.redirect('/?error=1');
  }
});

// (2) DASHBOARD
app.get('/dashboard', async (req, res) => {
  try {
    const transactions = await Transaction.findAll();
    const COTACAO_ATUAL = await fetchDollarRate();

    // Calcula estatísticas (saldo, preço médio etc.)
    const {
      saldoDolares,
      precoMedio,
      totalInvestido,
      totalRecebido,
      valorAtual
    } = calcStats(transactions, COTACAO_ATUAL);

    const lucroPrejuizoAtual = (valorAtual - totalInvestido) + totalRecebido;

    res.render('index', {
      message: 'Bem-vindo ao Dashboard!',
      saldoDolares,
      precoMedio,
      totalInvestido,
      totalRecebido,
      valorAtual,
      cotacaoAtual: COTACAO_ATUAL,
      lucroPrejuizoAtual
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao carregar o dashboard');
  }
});

// (3) COMPARAÇÃO DE PLATAFORMAS
// (3.1) GET /comparison -> exibe form simples
app.get('/comparison', (req, res) => {
  res.render('comparison-form');
});

// (3.2) POST /comparison -> busca cotação real, faz cálculo
app.post('/comparison', async (req, res) => {
  try {
    const { valorEmReais } = req.body;
    const valor = parseFloat(valorEmReais);
    const cotacao = await fetchDollarRate();

    const results = platforms.map((p) => {
      // Exemplo simples usando p.spread e p.iof (genérico)
      // Se quiser usar p.spreadBuy, p.spreadSell, etc., aqui também pode
      const cotacaoAjustada = cotacao * (1 + p.spread);
      const valorIOF = valor * p.iof;
      const valorDisponivel = valor - valorIOF;
      const dolaresComIOF = valorDisponivel / cotacaoAjustada;

      return {
        name: p.name,
        cotacaoAjustada: cotacaoAjustada.toFixed(4),
        valorIOF: valorIOF.toFixed(2),
        dolaresComIOF: dolaresComIOF.toFixed(2)
      };
    });

    res.render('comparison-result', {
      cotacaoOficial: cotacao,
      valorReais: valor,
      results
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao processar comparação');
  }
});

// (4) TRANSAÇÕES
// (4.1) Listar transações
app.get('/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.findAll({ order: [['date', 'DESC']] });
    res.render('transactions', { transactions });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao listar transações');
  }
});

// (4.2) Form para nova transação
app.get('/transactions/new', async (req, res) => {
  try {
    // Buscar a cotação atual
    const currentRate = await fetchDollarRate();
    // Enviar plataformas e cotação para o form
    res.render('new-transaction', { currentRate, platforms });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao exibir formulário de nova transação');
  }
});

// (4.3) Criar nova transação (POST)
app.post('/transactions', async (req, res) => {
  try {
    const { type, usd_amount, brl_rate, platform } = req.body;

    // Achar a plataforma selecionada
    const selectedPlatform = platforms.find(p => p.name === platform);
    if (!selectedPlatform) {
      throw new Error('Plataforma não encontrada!');
    }

    // Converter valores
    const usd = parseFloat(usd_amount);
    const originalRate = parseFloat(brl_rate); // Cotação oficial sem spread
    let finalRate = originalRate;
    let iofValue = 0;
    let fees = 0;

    if (type === 'buy') {
      // Compra de dólares
      finalRate = originalRate * (1 + selectedPlatform.spreadBuy); // soma spread de compra
      iofValue = (usd * originalRate) * selectedPlatform.iofBuy;   // IOF calculado em cima da cotação original (pode variar)
      fees = iofValue + (selectedPlatform.tarifaFixa || 0);

    } else if (type === 'sell') {
      // Venda de dólares
      finalRate = originalRate * (1 + (selectedPlatform.spreadSell || 0));
      iofValue = (usd * originalRate) * (selectedPlatform.iofSell || 0);
      fees = iofValue + (selectedPlatform.tarifaFixa || 0);
    }

    // Cria a transação no banco
    await Transaction.create({
      type,
      usd_amount: usd,
      brl_rate: finalRate,  // guardamos a cotação já com spread
      fees,
      platform
    });

    res.redirect('/transactions');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao criar transação');
  }
});

// Iniciar Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
