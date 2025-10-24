import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ReportPage.css";

export default function ReportPage() {
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState("");
  const [chain, setChain] = useState("ethereum");
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    {
      from: "ai",
      text: "👋 Hi! I’m your AI Portfolio Analyst. Paste your wallet address and I’ll analyze your on-chain activity to give you gain/loss trends and insights.",
    },
  ]);
  const [userInput, setUserInput] = useState("");

  const ETHERSCAN_API_KEY = "YOUR_ETHERSCAN_API_KEY";
  const COINGECKO_API = "https://api.coingecko.com/api/v3";

  // ------------------------
  // HANDLE MAIN REPORT FETCH
  // ------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setReport(null);
    setLoading(true);
    setAiMessages([
      ...aiMessages,
      { from: "ai", text: "🤖 Analyzing your wallet data... please wait ⏳" },
    ]);

    try {
      let data;

      if (chain === "ethereum") {
        const txResponse = await fetch(
          `https://api.etherscan.io/api?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&sort=desc&apikey=${ETHERSCAN_API_KEY}`
        );
        const txData = await txResponse.json();

        const priceResponse = await fetch(
          `${COINGECKO_API}/simple/price?ids=ethereum&vs_currencies=usd`
        );
        const priceData = await priceResponse.json();

        data = {
          chain: "Ethereum",
          transactions: txData.result.slice(0, 10),
          price: priceData.ethereum.usd,
        };
      } else if (chain === "bitcoin") {
        const btcResponse = await fetch(
          `https://api.blockchair.com/bitcoin/dashboards/address/${walletAddress}`
        );
        const btcData = await btcResponse.json();

        const priceResponse = await fetch(
          `${COINGECKO_API}/simple/price?ids=bitcoin&vs_currencies=usd`
        );
        const priceData = await priceResponse.json();

        data = {
          chain: "Bitcoin",
          transactions:
            btcData.data[walletAddress]?.transactions?.slice(0, 10) || [],
          balance: btcData.data[walletAddress]?.address?.balance,
          price: priceData.bitcoin.usd,
        };
      }

      setReport(data);

      const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
      const aiResponse = await fetch(`${API_BASE}/api/ai-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportData: data }),
      });

      const aiData = await aiResponse.json();
      setAiMessages((prev) => [
        ...prev,
        { from: "ai", text: aiData.aiInsight || "AI insight not available." },
      ]);
    } catch (err) {
      setError(`Error fetching report: ${err.message}`);
      setAiMessages([
        ...aiMessages,
        { from: "ai", text: "❌ Unable to analyze wallet. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------
  // HANDLE INTERACTIVE CHAT
  // ------------------------
  const handleAiChat = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const newMessages = [...aiMessages, { from: "user", text: userInput }];
    setAiMessages(newMessages);
    setUserInput("");

    try {
      const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
      const aiResponse = await fetch(`${API_BASE}/api/ai-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userQuery: userInput,
          reportData: report || {},
        }),
      });

      const aiData = await aiResponse.json();
      setAiMessages((prev) => [
        ...prev,
        { from: "ai", text: aiData.aiInsight || "No insight available yet." },
      ]);
    } catch (error) {
      setAiMessages((prev) => [
        ...prev,
        { from: "ai", text: "⚠️ Something went wrong. Please retry." },
      ]);
    }
  };

  return (
    <div className="report-page">
      <header className="report-header">
        <button className="back-btn" onClick={() => navigate("/")}>
          ←
        </button>
        <h1>Wallet Report & AI Advisor</h1>
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
          {loading ? "Analyzing..." : "Generate Report"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {/* 💬 AI CHAT INTERFACE */}
      <div className="ai-chat-box">
        <h3>🤖 AI Financial Advisor</h3>
        <div className="chat-window">
          {aiMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`chat-message ${msg.from === "user" ? "user-msg" : "ai-msg"}`}
            >
              <p>{msg.text}</p>
            </div>
          ))}
        </div>

        <form className="chat-input" onSubmit={handleAiChat}>
          <input
            type="text"
            placeholder="Ask AI (e.g. 'Predict my 7-day gain/loss')"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />
          <button type="submit">Send</button>
        </form>
      </div>

      {/* 📊 REPORT SUMMARY */}
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
                    {chain === "ethereum" ? (
                      <>
                        <p><strong>Hash:</strong> {tx.hash}</p>
                        <p><strong>From:</strong> {tx.from}</p>
                        <p><strong>To:</strong> {tx.to}</p>
                        <p>
                          <strong>Value:</strong> {Number(tx.value) / 1e18} ETH
                        </p>
                        <hr />
                      </>
                    ) : (
                      <p><strong>Hash:</strong> {tx}</p>
                    )}
                  </li>
                ))
              : <li>No transactions found.</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
