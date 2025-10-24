import { useState } from "react";
import './LoginPopup.css';
import '../Popup/Popup.css';
import RegisterPopup from "../RegisterPopup/RegisterPopup";

export default function LoginPopup({ onClose, onSuccess }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showRegister, setShowRegister] = useState(false);

    const handleLogin = async () => {
        setError("");

        try {
            const response = await fetch("https://localhost/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            // Check if server reachable
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || "Login failed");
            }

            const data = await response.json();

            // Adjusted to match a proper backend response
            if (data && data.token) {
                localStorage.setItem("token", data.token);
                onSuccess(`Welcome back, ${data.user?.username || username}!`);
            } else {
                throw new Error(data.message || "Invalid server response");
            }
        } catch (err) {
            console.error("❌ Login error:", err);
            setError("Server error: " + err.message);
        }
    };

    if (showRegister) {
        return (
            <RegisterPopup
                onClose={() => setShowRegister(false)}
                onRegisterSuccess={(msg) => {
                    setShowRegister(false);
                    onSuccess(msg);
                }}
            />
        );
    }

    return (
        <div className="popup-overlay">
            <div className="popup">
                <button className="close-button" onClick={onClose}>×</button>
                <h2>Login</h2>

                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {error && <p className="error">{error}</p>}

                <button className="btn" onClick={handleLogin}>Login</button>
                <button className="btn" onClick={() => setShowRegister(true)}>Register</button>
            </div>
        </div>
    );
}
