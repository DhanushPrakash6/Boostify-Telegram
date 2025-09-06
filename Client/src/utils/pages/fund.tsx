import "../styles/index.css";
import React, { useState, useEffect } from "react";
import WebApp from "@twa-dev/sdk";
import Home from "./data.tsx";
import { QRCodeSVG } from "qrcode.react";

import {
  profile, coin, podium, fund, home, group
} from "../../images/index.ts";

interface UserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code: string;
  is_premium?: boolean;
}

const Funds: React.FC = () => {
  const [coinValue, setCoinValue] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [depositAmountUSD, setDepositAmountUSD] = useState<string>("10");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [txnSignature, setTxnSignature] = useState<string>("");
  useEffect(() => {
    const user = WebApp.initDataUnsafe.user as UserData | undefined;
    if (user) setUserData(user);
    
    const fetchUserCoins = async (userId: number) => {
      try {
        const response = await fetch(
          `https://boostify-server.vercel.app/api/getUserCoin?id=${userId}`
        );
        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();
        setCoinValue(Number(data.coins).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }));
      } catch (error) {
        console.error("Error fetching user's coins:", error);
      }
    };

    const fetchSolPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
        const data = await response.json();
        setSolPrice(data.solana.usd);
      } catch (error) {
        console.error("Error fetching SOL price:", error);
      }
    };

    const userId = user?.id || 1011111; 
    fetchUserCoins(userId);
    fetchSolPrice();
  }, [userData]);
  
  const handleDeposit = async () => {
    const amountUSD = parseFloat(depositAmountUSD);
    if (isNaN(amountUSD) || amountUSD <= 0) {
      setVerificationStatus("❌ Please enter a valid USD amount");
      setTimeout(() => setVerificationStatus(null), 3000);
      return;
    }

    if (!solPrice) {
      setVerificationStatus("❌ SOL price not available. Please try again.");
      setTimeout(() => setVerificationStatus(null), 3000);
      return;
    }

    const amountSOL = amountUSD / solPrice;

    setIsLoading(true);
    try {
      const response = await fetch("https://boostify-server.vercel.app/api/createSolPayment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userData?.id, amount: amountSOL })
      });
      const data = await response.json();
      setPaymentLink(data.solanaPayLink);
    } catch (err) {
      console.error("Error creating payment:", err);
      setVerificationStatus("❌ Error creating payment. Please try again.");
      setTimeout(() => setVerificationStatus(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!txnSignature.trim()) {
      setVerificationStatus("❌ Please enter a transaction signature");
      setTimeout(() => setVerificationStatus(null), 3000);
      return;
    }

    setIsVerifying(true);
    setVerificationStatus("Verifying transaction...");
    
    try {
      const response = await fetch(
        `https://boostify-server.vercel.app/api/verifySolPayment?userId=${userData?.id}&signature=${txnSignature.trim()}`
      );
      const data = await response.json();
      
      if (data.success) {
        setVerificationStatus(`✅ Payment verified! You received $${data.valueInUSD} worth of coins.`);
        // Refresh user coins
        const userId = userData?.id || 1011111;
        const coinResponse = await fetch(
          `https://boostify-server.vercel.app/api/getUserCoin?id=${userId}`
        );
        const coinData = await coinResponse.json();
        setCoinValue(Number(coinData.coins).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }));
        
        // Clear payment link and signature after successful verification
        setTimeout(() => {
          setPaymentLink(null);
          setVerificationStatus(null);
          setTxnSignature("");
        }, 3000);
      } else {
        setVerificationStatus(`❌ Error: ${data.error}`);
        setTimeout(() => setVerificationStatus(null), 5000);
      }
    } catch (err) {
      console.error("Error verifying payment:", err);
      setVerificationStatus("❌ Error verifying payment. Please try again.");
      setTimeout(() => setVerificationStatus(null), 5000);
    } finally {
      setIsVerifying(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setVerificationStatus("📋 Payment link copied to clipboard!");
      setTimeout(() => setVerificationStatus(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      setVerificationStatus("❌ Failed to copy link");
      setTimeout(() => setVerificationStatus(null), 2000);
    }
  };

  // Calculate SOL equivalent when USD amount or SOL price changes
  const getSOLEquivalent = () => {
    if (!solPrice || !depositAmountUSD) return "0";
    const amountUSD = parseFloat(depositAmountUSD);
    if (isNaN(amountUSD)) return "0";
    return (amountUSD / solPrice).toFixed(6);
  };

  return (
    <div className={`overflow-scroll w-full h-full p-5 flex flex-col min-h-screen items-center text-white font-medium`} style={{
      background: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)"
    }}>
      <div className="w-full flex justify-end items-center">
        <div className="w-full flex justify-left items-center">
          <img src={profile} alt="Profile" className="h-10 w-10" />
          <Home />
        </div>
      </div>

      <div className="bg-white bg-opacity-10 mt-4 w-full flex flex-col justify-center items-center pt-[30px] pb-[30px] rounded-3xl">
        <div className="w-full flex justify-center items-center gap-1">
          <img
            src={coin}
            alt="Coin"
            className="h-16 w-16"
          />
          {coinValue ? (
              <span className="font-bold text-4xl">
                {coinValue}
              </span>
            ) : (
              <div className="h-12 w-32 bg-white bg-opacity-20 rounded-lg animate-pulse" />
          )}
        </div>
        <h1 className="w-full flex justify-center items-center text-white text-opacity-70 font-normal text-xl">
          Available Balance
        </h1>
      </div>
      <div className="mt-6 w-full max-w-sm">
        <div className="mb-4">
          <label className="block text-white text-sm font-medium mb-2">
            Deposit Amount (USD)
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={depositAmountUSD}
            onChange={(e) => setDepositAmountUSD(e.target.value)}
            className="w-full px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-purple-400"
            placeholder="10.00"
          />
          {solPrice && (
            <p className="text-white text-opacity-70 text-xs mt-1">
              ≈ {getSOLEquivalent()} SOL
            </p>
          )}
        </div>
        
        <button
          onClick={handleDeposit}
          disabled={isLoading}
          className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl shadow-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Creating Payment..." : "Create SOL Payment"}
        </button>
      </div>

      {paymentLink && (
        <div className="mt-6 mb-[100px] w-full max-w-sm text-center">
          <div className="bg-white bg-opacity-10 p-6 rounded-xl">
            <p className="mb-4 text-white font-medium text-lg">Payment Link Created!</p>
            
            {/* QR Code */}
            <div className="mb-4 flex justify-center">
              <div className="bg-white p-4 rounded-lg">
                <QRCodeSVG 
                  value={paymentLink} 
                  size={200}
                  level="M"
                  includeMargin={true}
                />
              </div>
            </div>
            
            <p className="mb-3 text-white text-opacity-70 text-sm">
              Scan QR code with Phantom / Solflare wallet:
            </p>
            
            {/* Payment Link */}
            <div className="mb-4 p-3 bg-black bg-opacity-30 rounded-lg">
              <p className="text-white text-opacity-70 text-xs mb-2">Payment Link:</p>
              <p className="text-blue-400 break-all text-xs mb-2">{paymentLink}</p>
              <button
                onClick={() => copyToClipboard(paymentLink)}
                className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
              >
                Copy Link
              </button>
            </div>
            
            {/* Verification Section */}
            <div className="space-y-3">
              {/* Transaction Signature Input */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Transaction Signature
                </label>
                <input
                  type="text"
                  value={txnSignature}
                  onChange={(e) => setTxnSignature(e.target.value)}
                  placeholder="Enter your transaction signature here..."
                  className="w-full px-3 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-green-400 text-sm"
                />
              </div>
              
              {/* Verification Button */}
              <button
                onClick={handleVerifyPayment}
                disabled={isVerifying || isLoading || !txnSignature.trim()}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {isVerifying ? "Verifying..." : "Verify Payment"}
              </button>
              
              {verificationStatus && (
                <div className={`p-3 rounded-lg text-sm ${
                  verificationStatus.includes('✅') || verificationStatus.includes('🎉') || verificationStatus.includes('📋')
                    ? 'bg-green-900 bg-opacity-50 text-green-200' 
                    : 'bg-red-900 bg-opacity-50 text-red-200'
                }`}>
                  {verificationStatus}
                </div>
              )}
              
              <div className="text-white text-opacity-50 text-xs text-center">
                <p>💡 Enter your transaction signature above to verify payment</p>
              </div>
            </div>
            
            <div className="mt-4 text-white text-opacity-50 text-xs">
              <p>1. Scan QR code with your Solana wallet</p>
              <p>2. Complete the payment</p>
              <p>3. Enter transaction signature above and click "Verify Payment"</p>
            </div>
          </div>
        </div>
      )}

      <footer className="w-full flex justify-around items-center p-4 border-dashed border-t-2 border-white border-opacity-20" style={{
          background: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)"
      }}>
        {[
          { src: home, alt: "Home", path: "/" },
          { src: group, alt: "Friends", path: "/referral" },
          { src: podium, alt: "Orders", path: "/orders" },
          { src: fund, alt: "Funds", path: "/funds" },
        ].map((item, index) => (
          <a
            key={index}
            href={item.path}
            className={`flex flex-col items-center ${
              item.alt === "Funds" ? "border-2 border-white border-opacity-30" : ""
            }`}
          >
            <img
              src={item.src}
              alt={item.alt}
              className={`h-10 w-10 h-12 w-12 ${
                item.alt === "Funds" ? "opacity-100" : "opacity-50"
              }`}
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </a>
        ))}
      </footer>
    </div>
  );
};

export default Funds;
