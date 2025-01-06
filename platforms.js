// platforms.js

module.exports = [
    {
      name: 'Wise',
      // Quando for comprar USD (remessa para fora):
      iofBuy: 0.011,         // ~1,1%
      spreadBuy: 0.015,      // ~1,5% 
      tarifaFixa: 6.0,       // Exemplo de R$ 6,00
  
      // Se quiser diferenciar taxas de venda (USD -> BRL), pode usar:
      iofSell: 0.0,          // 0% (em geral, IOF não se aplica em venda de USD pra BRL)
      spreadSell: 0.02       // ~2%, por exemplo
    },
    {
      name: 'Nomad',
      iofBuy: 0.011,         // ~1,1%
      spreadBuy: 0.02,       // ~2%
      tarifaFixa: 0.0,       // Geralmente zero para remessas acima de US$ 100
  
      iofSell: 0.0,
      spreadSell: 0.015
    },
    {
      name: 'Dolar App',
      iofBuy: 0.011,         // ~1,1%
      spreadBuy: 0.015,      // ~1,5%
      tarifaFixa: 5.0,       // Exemplo de R$ 5,00
  
      iofSell: 0.0,
      spreadSell: 0.02
    }
  ];
  