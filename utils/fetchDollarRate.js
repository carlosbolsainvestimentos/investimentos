// utils/fetchDollarRate.js
//
// Função assíncrona para buscar a cotação do dólar na AwesomeAPI.
// Retorna a cotação em formato numérico (ex.: 4.95).
// Em caso de erro, retorna um valor default (5.0).

const fetch = require('node-fetch');

async function fetchDollarRate() {
  try {
    // Endpoint da AwesomeAPI para USD-BRL
    const response = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL');
    const data = await response.json();

    // A API retorna um objeto assim:
    // { USDBRL: { "bid": "4.95", ... } }
    const cotacao = parseFloat(data.USDBRL.bid);
    return cotacao;
  } catch (error) {
    console.error('Erro ao buscar cotação do dólar:', error);
    // Em caso de falha, retornamos um valor mockado como fallback
    return 5.0;
  }
}

module.exports = fetchDollarRate;
