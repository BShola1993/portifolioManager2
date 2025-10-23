import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ReportPage.css';

export default function ReportPage() {
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState('');
  const [chain, setChain] = useState('ethereum');
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const ETHERSCAN_API_KEY = "YOUR_ETHERSCAN_API_KEY";
  const COINGECKO_API = "https://api.coingecko.com/api/v3";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setReport(null);
    setLoading(true);

    try {
      let data;

      if (chain === 'ethereum') {
        // ✅ Get Ethereum wallet transactions
        const txResponse = await fetch(
          `https://api.etherscan.io/api?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&sort=desc&apikey=${ETHERSCAN_API_KEY}`
        );
        const txData = await txResponse.json();

        // ✅ Get current ETH price
        const priceResponse = await fetch(`${COINGECKO_API}/simple/price?ids=ethereum&vs_currencies=usd`);
        const priceData = await priceResponse.json();

        data = {
          chain: 'Ethereum',
          transactions: txData.result.slice(0, 10), // last 10 transactions
          price: priceData.ethereum.usd,
        };

      } else if (chain === 'bitcoin') {
        // ✅ Get Bitcoin wallet transactions
        const btcResponse = await fetch(
          `https://api.blockchair.com/bitcoin/dashboards/address/${walletAddress}`
        );
        const btcData = await btcResponse.json();

        // ✅ Get current BTC price
        const priceResponse = await fetch(`${COINGECKO_API}/simple/price?ids=bitcoin&vs_currencies=usd`);
        const priceData = await priceResponse.json();

        data = {
          chain: 'Bitcoin',
          transactions: btcData.data[walletAddress]?.transactions?.slice(0, 10) || [],
          balance: btcData.data[walletAddress]?.address?.balance,
          price: priceData.bitcoin.usd,
        };
      }

      setReport(data);
    } catch (err) {
      setError(`Error fetching report: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-page">
      <header className="report-header">
        <button className="back-btn" onClick={() => navigate('/')}>←</button>
        <h1>Wallet Report</h1>
      </header>

      <form className="report-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter wallet address"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          required
        />
        <select value={chain} onChange={(e) => setChain(e.target.value)}>
          <option value="ethereum">Ethereum</option>
          <option value="bitcoin">Bitcoin</option>
        </select>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Loading...' : 'Generate Report'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}
      {report && (
  <div className="report-container">
    <h2>{report.chain} Wallet Overview</h2>
    <p>💰 Current Price: ${report.price}</p>
    {report.balance && <p>📊 Balance: {report.balance} satoshis</p>}

    <h3>Recent Transactions</h3>

    <ul>
      {Array.isArray(report.transactions)
        ? report.transactions.map((tx, index) => (
            <li key={index}>
              {chain === 'ethereum' ? (
                <>
                  <p><strong>Hash:</strong> {tx.hash}</p>
                  <p><strong>From:</strong> {tx.from}</p>
                  <p><strong>To:</strong> {tx.to}</p>
                  <p><strong>Value:</strong> {Number(tx.value) / 1e18} ETH</p>
                  <hr />
                </>
              ) : (
                <p><strong>Hash:</strong> {tx}</p>
              )}
            </li>
          ))
        : typeof report.transactions === 'object' ? (
            // handle single object
            <li>
              {chain === 'ethereum' ? (
                <>
                  <p><strong>Hash:</strong> {report.transactions.hash}</p>
                  <p><strong>From:</strong> {report.transactions.from}</p>
                  <p><strong>To:</strong> {report.transactions.to}</p>
                  <p><strong>Value:</strong> {Number(report.transactions.value) / 1e18} ETH</p>
                  <hr />
                </>
              ) : (
                <p><strong>Hash:</strong> {report.transactions}</p>
              )}
            </li>
          ) : (
            <li>No transactions found.</li>
          )}
    </ul>
  </div>
)}


      
    </div>
  );
}
