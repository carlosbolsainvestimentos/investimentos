// utils/calcStats.js
//
// Função para calcular saldo de dólares, preço médio,
// total investido, total recebido, e valor potencial
// se vendesse todos os dólares agora (lucro/prejuízo).
//
// currentDollarRate: cotação de mercado "atual" (mockado ou via API)

function calcStats(transactions, currentDollarRate = 5.0) {
    let totalBuyUSD = 0;   // soma de USD comprados
    let totalBuyBRL = 0;   // soma de R$ gastos nas compras
    let totalSellUSD = 0;  // soma de USD vendidos
    let totalSellBRL = 0;  // soma de R$ recebidos nas vendas
  
    // Percorre todas as transações e agrupa valores
    transactions.forEach((t) => {
      const usd = parseFloat(t.usd_amount);
      const rate = parseFloat(t.brl_rate);
      const fees = parseFloat(t.fees);
  
      if (t.type === 'buy') {
        // total em R$ da compra = (usd * rate) + fees
        totalBuyUSD += usd;
        totalBuyBRL += (usd * rate) + fees;
      } else if (t.type === 'sell') {
        // total em R$ da venda = (usd * rate) - fees (se quiser abater taxas)
        // mas depende de como você gravou as taxas na venda
        totalSellUSD += usd;
        totalSellBRL += (usd * rate) - fees;
      }
    });
  
    // Saldo atual de dólares
    const saldoDolares = totalBuyUSD - totalSellUSD;
  
    // Preço médio (simplificado): totalBuyBRL / totalBuyUSD (para as compras)
    // Mas não descontamos as vendas do custo total (fórmula simplificada)
    let precoMedio = 0;
    if (saldoDolares > 0) {
      // Podemos estimar que o custo médio continua o mesmo:
      precoMedio = totalBuyBRL / totalBuyUSD;
    }
  
    // Total investido = totalBuyBRL
    const totalInvestido = totalBuyBRL;
  
    // Total recebido = totalSellBRL
    const totalRecebido = totalSellBRL;
  
    // Valor atual (se vendesse hoje tudo que restou em USD)
    // = saldoDolares * currentDollarRate
    // Aqui, não estamos subtraindo taxas dessa "venda hipotética".
    const valorAtual = saldoDolares * currentDollarRate;
  
    return {
      saldoDolares,
      precoMedio,
      totalInvestido,
      totalRecebido,
      valorAtual
    };
  }
  
  module.exports = calcStats;
  