import "../styles/index.css";
import React, { useState, useEffect } from "react";
import WebApp from "@twa-dev/sdk";
import Home from "./data.tsx";
import {
  profile, coin, podium, fund, home, group, btc, bnb, eth, usdt, sol
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
  const [fundInput, setFundInput] = useState<string>("");
  const [modelOpen, setModelOpen] = useState<boolean>(false);
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

    const userId = user?.id || 1011111; // Fallback ID
    fetchUserCoins(userId);
  }, [userData]);

  const formatNumber = (n: string) => {
    return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const formatCurrency = (inputValue: string, blur: boolean = false) => {
    let inputVal = inputValue;

    if (inputVal === "") return inputVal;

    if (inputVal.includes(".")) {
      const decimalPos = inputVal.indexOf(".");
      let leftSide = inputVal.substring(0, decimalPos);
      let rightSide = inputVal.substring(decimalPos);

      leftSide = formatNumber(leftSide);
      rightSide = formatNumber(rightSide);

      if (blur) {
        rightSide += "00";
      }

      rightSide = rightSide.substring(0, 2);
      inputVal = `$${leftSide}.${rightSide}`;
    } else {
      inputVal = `$${formatNumber(inputVal)}`;

      if (blur) {
        inputVal += ".00";
      }
    }

    return inputVal;
  };

  const handleFundInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCurrency(e.target.value);
    setFundInput(formattedValue);
  };

  const handleBlur = () => {
    const formattedValue = formatCurrency(fundInput, true);
    setFundInput(formattedValue);
  };

  const handleButtonClick = (value: number) => {
    const formattedValue = formatCurrency(value.toString(), true);
    setFundInput(formattedValue);
  };

  const handleModel = () => {
    if(modelOpen)
      setModelOpen(false);
    else 
      setModelOpen(true);
  }

  return (
    <div className={`overflow-hidden w-full h-full bg-gradient-main p-5 flex flex-col min-h-screen items-center text-black font-medium`}>
      <div className="w-full flex justify-end items-center">
        <div className="w-full flex justify-left items-center">
          <img src={profile} alt="Profile" className="h-10 w-10" />
          <Home />
        </div>
      </div>

      <div className="bg-white bg-opacity-80 mt-4 w-full flex flex-col justify-center items-center pt-[30px] pb-[30px] rounded-3xl">
        <div className="w-full flex justify-center items-center gap-1">
          <img
            src={coin}
            alt="Coin"
            className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20"
          />
          <span className="font-bold text-4xl sm:text-5xl md:text-6xl">
            {coinValue !== null ? coinValue : "Loading..."}
          </span>
        </div>
        <h1 className="w-full flex justify-center items-center text-black text-opacity-50 font-normal text-xl sm:text-2xl md:text-3xl">
          Available Balance
        </h1>
      </div>

      <div className="w-full">
        <h1 className="w-full mt-7 flex justify-left text-black font-normal text-lg sm:text-1xl md:text-2xl">
          Add Funds
        </h1>
        <div className="w-full flex flex-col justify-center items-center mt-3">
          <input
            type="text"
            name="fund-input"
            id="fund-input"
            value={fundInput}
            onChange={handleFundInputChange}
            onBlur={handleBlur}
            placeholder="$0.00"
            className="w-[70%] bg-transparent p-2 text-lg text-center"
          />
          <div className="flex gap-4 mt-4">
            <button onClick={() => handleButtonClick(100)} className="comic-button">100$</button>
            <button onClick={() => handleButtonClick(1000)} className="comic-button">1000$</button>
            <button onClick={() => handleButtonClick(5000)} className="comic-button">5000$</button>
          </div>
          <button className="txn-btn mt-6" onClick={handleModel}>
            Boost Balance
          </button>
        </div>
      </div>
    
      <div className={`modal-container ${modelOpen ? 'trans-container' : ''}`}>
          <div className="w-full gap-2 flex flex-col items-start justify-start">
            <h1 className="font-normal text-2xl sm:text-2xl md:text-1xl">Top up your wallet with any chains below</h1>
            <h1 className="font-light text-1xl sm:text-1xl md:text-sm opacity-50">Choose coin for deposit</h1>
          </div>
          <div className="w-full mt-1 h-[100px] rounded-3xl crypto-container flex items-center justify-between p-5">
            <div className="flex justify-center items-center">
              <div className="w-[50px] h-[50px] rounded-full flex items-center justify-center crypto-icon">
                <img src={usdt} alt="" width="30px" height="30px"/>
              </div>
              <h1 className="ml-5 font-bold text-2xl sm:text-2xl md:text-3xl text-white">USDT</h1>
            </div>
            <div>
              <h1 className="ml-5 font-bold text-2xl sm:text-2xl md:text-3xl text-white">1.00$</h1>
            </div>
          </div>
          <div className="w-full h-[100px] rounded-3xl crypto-container flex items-center justify-between p-5">
            <div className="flex justify-center items-center">
              <div className="w-[50px] h-[50px] rounded-full flex items-center justify-center crypto-icon">
                  <img src={btc} alt="" width="30px" height="30px"/>
              </div>
              <h1 className="ml-5 font-bold text-2xl sm:text-2xl md:text-3xl text-white">BTC</h1>
            </div>
            <div>
              <h1 className="ml-5 font-bold text-2xl sm:text-2xl md:text-3xl text-white">63,126.50$</h1>
            </div>
          </div>
          <div className="w-full h-[100px] rounded-3xl crypto-container flex items-center justify-between p-5">
            <div className="flex justify-center items-center">
              <div className="w-[50px] h-[50px] rounded-full flex items-center justify-center crypto-icon">
                <img src={eth} alt="" width="30px" height="30px"/>
              </div>
              <h1 className="ml-5 font-bold text-2xl sm:text-2xl md:text-3xl text-white">ETH</h1>
            </div>
            <div>
              <h1 className="ml-5 font-bold text-2xl sm:text-2xl md:text-3xl text-white">2376.40$</h1>
            </div>
          </div>
          <div className="w-full h-[100px] rounded-3xl crypto-container flex items-center justify-between p-5">
            <div className="flex justify-center items-center">
              <div className="w-[50px] h-[50px] rounded-full flex items-center justify-center crypto-icon">
                <img src={sol} alt="" width="30px" height="30px"/>
              </div>
              <h1 className="ml-5 font-bold text-2xl sm:text-2xl md:text-3xl text-white">SOL</h1>
            </div>
            <div>
              <h1 className="ml-5 font-bold text-2xl sm:text-2xl md:text-3xl text-white">137.33$</h1>
            </div>
          </div>
          <div className="w-full h-[100px] rounded-3xl crypto-container flex items-center justify-between p-5">
            <div className="flex justify-center items-center">
              <div className="w-[50px] h-[50px] rounded-full flex items-center justify-center crypto-icon">
                <img src={bnb} alt="" width="30px" height="30px"/>
              </div>
              <h1 className="ml-5 font-bold text-2xl sm:text-2xl md:text-3xl text-white">BNB</h1>
            </div>
            <div>
              <h1 className="ml-5 font-bold text-2xl sm:text-2xl md:text-3xl text-white">563.84$</h1>
            </div>
          </div>
      </div>

      <button className={`close modal-button ${modelOpen ? '' : 'trans-button'}`} onClick={handleModel}>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <svg viewBox="0 0 36 36" className="circle">
          <path
            stroke-dasharray="100, 100"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
      </button>
      {modelOpen && (<div className="absolute h-full w-full top-0 bg-black opacity-70 z-50"></div>)}
      <footer className={`w-full flex justify-around items-center p-4 border-dashed border-t-2 border-black ${modelOpen ? 'bg-black bg-opacity-70' : 'bg-gradient-main'} `}>
        {[
          { src: home, alt: "Home" },
          { src: group, alt: "Friends" },
          { src: podium, alt: "Orders" },
          { src: fund, alt: "Funds" },
        ].map((item, index) => (
          <a
            key={index}
            href={`${
              item.alt === "Home"
                ? "/"
                : item.alt === "Friends"
                ? "/friends"
                : item.alt === "Orders"
                ? "/orders"
                : "/funds"
            }`}
            className={`flex flex-col items-center ${
              item.alt === "Funds" ? "border-2 border-black" : ""
            }`}
          >
            <img
              src={item.src}
              alt={item.alt}
              className={`h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 ${
                item.alt === "Funds" ? "opacity-100" : "opacity-80"
              }`}
            />
          </a>
        ))}
      </footer>
    </div>
  );
};

export default Funds;
