import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ExchangeCalculator: React.FC = () => {
  const [ethAmount, setEthAmount] = useState<number>(0);
  const [usdtAmount, setUsdtAmount] = useState<number>(0);
  const [action, setAction] = useState<string>('buy');
  const [usdtEthRate, setUsdtEthRate] = useState<number>(0); // Заглушка для курсу USDT/ETH

  useEffect(() => {
    const fetchUsdtEthRate = async () => {
      try {
        const response = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT');
        const data = response.data;
        const usdtEthRate = parseFloat(data.price);
        setUsdtEthRate(usdtEthRate);
      } catch (error) {
        console.error('Error fetching USDT/ETH rate:', error);
      }
    };

    fetchUsdtEthRate();

    // Встановлення WebSocket для отримання оновлень курсу USDT/ETH
    const ws = new WebSocket('wss://stream.binance.com:9443/ws/ethusdt@trade');
    ws.onmessage = (event) => {
      const eventData = JSON.parse(event.data);
      const newRate = parseFloat(eventData.p);
      setUsdtEthRate(newRate);
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleEthAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEthAmount(parseFloat(event.target.value));
  };

  const handleActionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setAction(event.target.value);
  };

  const handleCalculate = () => {
    const calculatedAmount = calculateUSDT(ethAmount, usdtEthRate, action);
    setUsdtAmount(calculatedAmount);
  };

  const calculateUSDT = (amount: number, rate: number, action: string): number => {
    if (action === 'buy') {
      return amount * rate;
    } else {
      return amount / rate;
    }
  };

  return (
    <div>
      <h2>Exchange Calculator</h2>
      <div>
        <label htmlFor="ethAmount">Enter ETH Amount:</label>
        <input type="number" id="ethAmount" value={ethAmount} onChange={handleEthAmountChange} />
      </div>
      <div>
        <label htmlFor="action">Select Action:</label>
        <select id="action" value={action} onChange={handleActionChange}>
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
        </select>
      </div>
      <button onClick={handleCalculate}>Calculate</button>
      <div>
        <h3>USDT Amount: {usdtAmount}</h3>
        <p>Current USDT/ETH Rate: {usdtEthRate}</p>
      </div>
    </div>
  );
};

export default ExchangeCalculator;
