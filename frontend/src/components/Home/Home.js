import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./Home.css";
import LoginPopup from "../LoginPopup/LoginPopup";
import building from "../../assets/images/building.jpg";
import videoFile from "frontend/public/videoplayback.mp4";
import image from "../../assets/images/image.png";
import logo4 from "../../assets/images/logo4.png"
export default function LandingPage(){
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
      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0] || null);
      });
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
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
  const goToReport = async () => {
    const token = localStorage.getItem("jwt_token");
    if (!token) {
      setShowLogin(true);
      return;
    }
    navigate("/report");
  };

  // ✅ Connect wallet and handle chain switching
  const connectWallet = async () => {
        try {
          if (!window.ethereum || !window.ethereum.isMetaMask) {
          setError("MetaMask not detected or not ready. Please refresh the page.");
          return;
    }
      setIsLoading(true);
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      let chainId = await window.ethereum.request({ method: "eth_chainId" });

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
                  nativeCurrency: {
                    name: "SepoliaETH",
                    symbol: "ETH",
                    decimals: 18,
                  },
                  rpcUrls: [
                    "https://mainnet.infura.io/v3/8c2886764dce4f659b2b6fe8bbbcd29c",
                  ],
                  blockExplorerUrls: ["https://sepolia.etherscan.io"],
                },
              ],
            });
          } else {
            throw switchError;
          }
        }
      }
      setAccount(accounts[0]);
      setError("");
    } catch (err) {
      console.error("MetaMask connection error:", err);
      setError(err.message || "Failed to connect wallet. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  // ✅ New: Web3 signature-based login (secure + decentralized)
  const loginWithWallet = async () => {
  try {
    if (!account) {
      setError("Please connect your wallet first.");
      return;
    }
    setIsLoading(true);

    const message = "Login to Lukman the defi";
    await new Promise((r) => setTimeout(r, 300)); // short delay
    const signature = await window.ethereum.request({
      method: "personal_sign",
      params: [message, account]
    });

    // ✅ Dynamic API base URL
    const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
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

      {showLogin && (
        <LoginPopup
          onClose={() => setShowLogin(false)}
          onSuccess={handleLoginSuccess}
        />
      )}

      <section className="hero-section">
        <div className="hero-text">
          <h2>Your Financial Future Starts Here</h2>
          <p>
            Upload your crypto wallet address and get a professional,
            personalized financial report – crafted as if by your own private
            banker.
          </p>
          <p>
            Let's shape a brighter financial future, together. Let us help you
            make the right decisions with tailored insights you can trust.
          </p>
        </div>

        <div className="hero-image">
          <video src={videoFile} autoPlay loop muted playsInline />
        </div>
      </section>

      <section className="image-strip">
        <div className="image-quote-pair">
          <img src={building} alt="NYC Skyline" />
          <div className="quote-content">
            <h3>Professional Excellence</h3>
            <p>
              With decades of experience in traditional finance and blockchain
              technology, we bring Wall Street expertise to your crypto
              investments. Our analysis combines time-tested financial
              principles with cutting-edge blockchain analytics.
            </p>
          </div>
        </div>
        <div className="image-quote-pair">
          <img src={image} alt="Handshake" />
          <div className="quote-content">
            <h3>Trust & Reliability</h3>
            <p>
              We believe in building lasting relationships through transparency
              and reliability. Our automated analysis provides the same level of
              insight you'd expect from a private banking relationship, available
              24/7.
            </p>
          </div>
        </div>
      </section>
      <section className="call-to-action">
        <h3>One Simple Step. Endless Financial Clarity.</h3>
        <p>
           DefiBanking is the easiest way to understand your crypto portfolio.
          Whether you're managing assets or exploring investments, our report
          gives you the insights you need.
        </p>
      </section>

      <footer className="footer">
        © {new Date().getFullYear()} DefiBanking. All rights reserved.
      </footer>
    </div>
  );
}
