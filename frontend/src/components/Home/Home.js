import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./Home.css";
import LoginPopup from "../LoginPopup/LoginPopup";
import building from "../../assets/images/building.jpg";
import image from "../../assets/images/image.png";
import logo4 from "../../assets/images/logo4.png";

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [account, setAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp < currentTime) {
          localStorage.removeItem("jwt_token");
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error decoding JWT:", error);
        localStorage.removeItem("jwt_token");
        setIsAuthenticated(false);
      }
    }

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) =>
        setAccount(accounts[0] || null)
      );
      window.ethereum.on("chainChanged", () => window.location.reload());
    }
  }, []);

  const handleLoginSuccess = (token) => {
    localStorage.setItem("jwt_token", token);
    setIsAuthenticated(true);
    setShowLogin(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("jwt_token");
    setIsAuthenticated(false);
  };

  const goToReport = () => {
    const token = localStorage.getItem("jwt_token");
    if (!token) {
      setShowLogin(true);
      return;
    }
    navigate("/report");
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum || !window.ethereum.isMetaMask) {
        setError("MetaMask not detected. Please install it.");
        return;
      }

      setIsLoading(true);
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      if (chainId !== "0xaa36a7") {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xaa36a7" }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0xaa36a7",
                  chainName: "Sepolia Test Network",
                  nativeCurrency: { name: "SepoliaETH", symbol: "ETH", decimals: 18 },
                  rpcUrls: ["https://sepolia.infura.io/v3/8c2886764dce4f659b2b6fe8bbbcd29c"],
                  blockExplorerUrls: ["https://sepolia.etherscan.io"],
                },
              ],
            });
          } else throw switchError;
        }
      }

      setAccount(accounts[0]);
      setError("");
    } catch (err) {
      console.error("MetaMask connection error:", err);
      setError(err.message || "Failed to connect wallet.");
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithWallet = async () => {
    try {
      if (!account) return setError("Please connect your wallet first.");
      setIsLoading(true);

      const message = "Login to Lukman the defi";
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, account],
      });

      const API_BASE =
        process.env.REACT_APP_API_BASE ||
        "https://backend-production-1743.up.railway.app";

      const res = await fetch(`${API_BASE}/api/auth/web3login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: account, signature }),
      });

      const data = await res.json();
      if (data.token) {
        handleLoginSuccess(data.token);
        navigate("/report");
      } else {
        setError(data.error || "Login failed.");
      }
    } catch (err) {
      console.error("Wallet login failed:", err);
      setError("Wallet login failed. Please retry.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="landing-page">
      <header className="header">
        <img src={logo4} alt="My Banker" className="logo" />

        {!account ? (
          <button className="btn" onClick={connectWallet} disabled={isLoading}>
            {isLoading ? "Please wait..." : "Connect Wallet"}
          </button>
        ) : !isAuthenticated ? (
          <button className="btn" onClick={loginWithWallet} disabled={isLoading}>
            {isLoading ? "Authorizing..." : "Login to Continue"}
          </button>
        ) : (
          <button className="btn" onClick={goToReport} disabled={isLoading}>
            {isLoading ? "Loading..." : "Get Your Report"}
          </button>
        )}

        {error && <p style={{ color: "red", fontSize: "0.9rem" }}>{error}</p>}

        {account && (
          <p style={{ fontSize: "0.9rem", color: "gray" }}>
            ✅ Connected: {account.slice(0, 6)}...{account.slice(-4)}
          </p>
        )}
      </header>

      {showLogin && <LoginPopup onClose={() => setShowLogin(false)} onSuccess={handleLoginSuccess} />}

      <section className="hero-section">
        <div className="hero-text">
          <h2>Your Financial Future Starts Here</h2>
          <p>Upload your crypto wallet address and get a professional, personalized financial report.</p>
          <p>Let’s shape a brighter financial future together with trusted blockchain insights.</p>
        </div>

        <div className="hero-image">
          {/* ✅ Use public folder path for video */}
          <video src="/video.mp4" autoPlay loop muted playsInline />
        </div>
      </section>

      <section className="image-strip">
        <div className="image-quote-pair">
          <img src={building} alt="Building" />
          <div className="quote-content">
            <h3>Professional Excellence</h3>
            <p>Combining Wall Street experience and blockchain analytics for your crypto portfolio.</p>
          </div>
        </div>
        <div className="image-quote-pair">
          <img src={image} alt="Handshake" />
          <div className="quote-content">
            <h3>Trust & Reliability</h3>
            <p>We deliver transparency, precision, and actionable insights for your DeFi journey.</p>
          </div>
        </div>
      </section>

      <section className="call-to-action">
        <h3>One Simple Step. Endless Financial Clarity.</h3>
        <p>DefiBanking is the easiest way to understand your crypto portfolio and manage your financial future.</p>
      </section>

      <footer className="footer">© {new Date().getFullYear()} DefiBanking. All rights reserved.</footer>
    </div>
  );
}
