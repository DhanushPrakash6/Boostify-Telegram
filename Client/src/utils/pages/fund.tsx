import "../styles/index.css";
import React, { useState, useEffect } from "react";
import WebApp from "@twa-dev/sdk";
import Home from "./data.tsx";
import {
  profile, coin, podium, fund, home, group, btc, bnb, eth, usdt, sol
} from "../../images/index.ts";
import { v4 as uuidv4 } from "uuid";
import Warning from "../script/component/warning.tsx";
import Success from "../script/component/success.tsx";
import Failure from "../script/component/fail.tsx";
import {back} from "../../../src/images/index.ts";
import axios from 'axios';
import { log } from "console";
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
  const [alerts, setAlerts] = useState([]);
  const [moveDiv, setMoveDiv] = useState<boolean>(false);
  const [txnHash, setTxnHash] = useState('');
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

    const userId = user?.id || 1011111; 
    fetchUserCoins(userId);
  }, [userData]);
  const handleTxn = async (to, coin) => {
    const userId = userData?.id || 1011111;
  
    if (!txnHash) {
      setAlerts((prev) => [...prev, { id: Date.now(), type: "emptyHash" }]);
      return;
    }
  
    try {
      const res = await fetch(`https://boostify-server.vercel.app/api/txn?txnHash=${txnHash}&to=${to}&userId=${userId}&coin=${coin}`, {
        method: 'GET',
      });
  
      // Check if the response is OK (status code 200-299)
      if (res.ok) {
        const data = await res.json();
        console.log(data);
        console.log(data.valueInUSD);
        setAlerts((prev) => [...prev, { id: Date.now(), type: "success1", message: `${data.valueInUSD}` }]);
      } else {
        // If the response is not OK, handle errors based on status
        const errorData = await res.json(); // Extract the error message from the response
  
        if (res.status === 400) {
          if (errorData.error === 'Invalid Transaction Hash') {
            setAlerts((prev) => [...prev, { id: Date.now(), type: "hash", message: 'Invalid Transaction Hash' }]);
          } else if (errorData.error === 'These Features will be available soon') {
            setAlerts((prev) => [...prev, { id: Date.now(), type: "hash", message: 'These Features will be available soon' }]);
          } else if (errorData.error === 'Parameter Error') {
            setAlerts((prev) => [...prev, { id: Date.now(), type: "hash", message: 'Parameter Error' }]);
          }
        } else if (res.status === 404 && errorData.error === 'Transaction not found') {
          setAlerts((prev) => [...prev, { id: Date.now(), type: "error", message: 'Transaction not found' }]);
        } else {
          setAlerts((prev) => [...prev, { id: Date.now(), type: "error", message: "Unexpected error occurred" }]);
        }
      }
    } catch (error) {
      // Handle network errors or fetch-specific errors
      setAlerts((prev) => [...prev, { id: Date.now(), type: "error", message: "Network error or no response from server" }]);
      console.error('Network error:', error);
    }
  };
  
  

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, link: string) => {
      navigator.clipboard.writeText(link);
  };


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
  const movDiv = () => {
    if(!moveDiv) {
      setMoveDiv(true);
    }
    else {
      setMoveDiv(false);
    }
  }
  const newAlert = { id: uuidv4() };
  const handleModel = () => {
    if(modelOpen) {
      setModelOpen(false);
    }
    else {
      if(fundInput !== "")
        setModelOpen(true);
      else
        setAlerts((prev) => [...prev, { id: Date.now(), type: "success" }]);
    }
  }
  setTimeout(() => {
    setAlerts((prevAlerts) =>
      prevAlerts.filter((alert) => alert.id !== newAlert.id)
    );
  }, 5000);
  
  if (alerts.length >= 5) {
    setAlerts((prevAlerts) => prevAlerts.slice(1));
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
    
      <div className={`relative overflow-hidden modal-container ${modelOpen ? 'trans-container' : ''}`}>
          {alerts.map((alert) => (
            <div key={alert.id} className="fixed top-4 alert" style={{ zIndex: 9999 }}>
              {alert.type === "hash" && <Warning message={alert.message}/>}
              {alert.type == "error" && <Failure message={alert.message}/>}
              {alert.type === "success1" && <Success amount={alert.message}/>}
              {/* {alert.type === "failure" && <Failure message = "Insufficient Funds"/>}
              {alert.type === "success" && (
                <Success amount={calculateTotal().toFixed(2)} />
              )} */}
            </div>
          ))}
          <div className={`absolute flex flex-col items-center p-[100px] w-[90%] h-[95%] bg-opacity-80 gap-4 rounded-xl duration-[1s] ${moveDiv ? '' : 'mov1'}`}>
            <div className="absolute top-0 left-0">
              <button onClick={movDiv}>
                <div
                  style={{
                    padding: "7px",
                    borderRadius: "10px",
                    border: "1px solid black",
                  }}
                >
                  <img src={back} alt="" height="20px" width="20px" />
                </div>
              </button>
            </div>
            <div className="w-[50px] h-[50px] rounded-full flex items-center justify-center bg-[#26A17B]">
              <img src={usdt} alt="" width="30px" height="30px"/>
            </div>
            <div className="w-[300%] flex items-center flex-col gap-1">
              <h1 className="text-[18px] sm:text-[2.1vh] md:text-[2.5vh]">USDT (ERC-20)</h1>
              <h1 className="opacity-60 font-light text-[16px] sm:text-[2.1vh] md:text-[2.5vh]">Wallet Address</h1>
              <h1 
                onClick={(e) => handleLinkClick(e, "0xee7911f4beaa561ae4f18ffccf52ed49342cb723")} 
                className="link-text ext-black font-bold font-mono text-[14px] sm:text-[2.1vh] md:text-[2.5vh]"
              >
                0xee7911f4beaa561ae4f18ffccf52ed49342cb723
              </h1>
              <h1 
                className="font-normal opacity-60 text-[13px] sm:text-[2.1vh] md:text-[2.5vh]"
              >
                Click on the above wallet address to copy it
              </h1>
              <input placeholder="Enter Transaction Hash" className="input-txn mt-3" type="text" onChange={(val) => {setTxnHash(val.target.value)}}/>
              <h1 
                className="font-normal opacity-60 text-[12px] sm:text-[2.1vh] md:text-[2.5vh] w-[80%] mt-3 text-center"
              >
                Please deposit exactly {fundInput} USDT to the provided wallet address on the Ethereum network (ERC-20)
              </h1>
              <h1 
                className="font-normal opacity-60 text-[12px] sm:text-[2.1vh] md:text-[2.5vh] w-[80%] text-center"
              >
                After the deposit, kindly provide the correct Transaction ID for verification on the Ethereum network (ERC-20 USDT)
              </h1>
              <button 
                onClick={() => handleTxn('0xee7911f4beaa561ae4f18ffccf52ed49342cb723', 'USDT')} 
                className="button-confirm mt-3"
              >
                Submit →
              </button>
              <h1 
                className="font-normal opacity-60 text-[12px] sm:text-[2.1vh] md:text-[2.5vh] w-[70%] text-center mt-3"
              >
                Once the transaction confirmation is submitted, it will take a few minutes to reflect in your wallet
              </h1>
            </div>


          </div>


          <div className={`w-full gap-2 flex flex-col items-start justify-start transition-{transform} duration-[0.8s] ${moveDiv ? 'mov' : ''}`}>
            <h1 className="font-normal text-2xl sm:text-2xl md:text-1xl">Top up your wallet with any chains below</h1>
            <h1 className="font-light text-1xl sm:text-1xl md:text-sm opacity-50">Choose coin for deposit</h1>
          </div>
          <h1 className={`font-normal text-[1.8vh] sm:text-[1.8vh] md:text-[2.1vh] mt-3 w-full flex justify-center transition-{transform} duration-[0.8s] ${moveDiv ? 'mov' : ''}`}>Amount : {fundInput}</h1>
          <div className="flex flex-col gap-4 mt-3 h-[85%] overflow-visible pb-[25px] no-scrollbar">
            <button name="usdt" onClick={movDiv} className={`w-full mt-1 h-[83px] rounded-3xl crypto-container flex items-center justify-between p-5 duration-[3s] ${moveDiv ? 'mov' : ''}`}>
              <div className="flex justify-center items-center">
                <div className="w-[50px] h-[50px] rounded-full flex items-center justify-center crypto-icon">
                  <img src={usdt} alt="" width="30px" height="30px"/>
                </div>
                <h1 className="ml-5 font-bold text-[2.1vh] sm:text-[2.1vh] md:text-[2.5vh] text-white">USDT</h1>
              </div>
              <div>
                <h1 className="ml-5 font-bold text-[2.1vh] sm:text-[2.1vh] md:text-[2.5vh] text-white">1.00$</h1>
              </div>
            </button>
            
            <button name="btc" className={`w-full h-[83px] rounded-3xl crypto-container flex items-center justify-between p-5 duration-[3s] ${moveDiv ? 'mov' : ''}`}>
              <div className="flex justify-center items-center">
                <div className="w-[50px] h-[50px] rounded-full flex items-center justify-center crypto-icon">
                  <img src={btc} alt="" width="30px" height="30px"/>
                </div>
                <h1 className="ml-5 font-bold text-[2.1vh] sm:text-[2.1vh] md:text-[2.5vh] text-white">BTC</h1>
              </div>
              <div>
                <h1 className="ml-5 font-bold text-[2.1vh] sm:text-[2.1vh] md:text-[2.5vh] text-white">63,126.50$</h1>
              </div>
            </button>
            
            <button name="eth" className={`w-full h-[83px] rounded-3xl crypto-container flex items-center justify-between p-5 duration-[3s] ${moveDiv ? 'mov' : ''}`}>
              <div className="flex justify-center items-center">
                <div className="w-[50px] h-[50px] rounded-full flex items-center justify-center crypto-icon">
                  <img src={eth} alt="" width="30px" height="30px"/>
                </div>
                <h1 className="ml-5 font-bold text-[2.1vh] sm:text-[2.1vh] md:text-[2.5vh] text-white">ETH</h1>
              </div>
              <div>
                <h1 className="ml-5 font-bold text-[2.1vh] sm:text-[2.1vh] md:text-[2.5vh] text-white">2376.40$</h1>
              </div>
            </button>

            <button name="sol" className={`w-full h-[83px] rounded-3xl crypto-container flex items-center justify-between p-5 duration-[3s] ${moveDiv ? 'mov' : ''}`}>
              <div className="flex justify-center items-center">
                <div className="w-[50px] h-[50px] rounded-full flex items-center justify-center crypto-icon">
                  <img src={sol} alt="" width="30px" height="30px"/>
                </div>
                <h1 className="ml-5 font-bold text-[2.1vh] sm:text-[2.1vh] md:text-[2.5vh] text-white">SOL</h1>
              </div>
              <div>
                <h1 className="ml-5 font-bold text-[2.1vh] sm:text-[2.1vh] md:text-[2.5vh] text-white">137.33$</h1>
              </div>
            </button>
            
            <button name="bnb" className={`w-full h-[83px] rounded-3xl crypto-container flex items-center justify-between p-5 duration-[3s] ${moveDiv ? 'mov' : ''}`}>
              <div className="flex justify-center items-center">
                <div className="w-[50px] h-[50px] rounded-full flex items-center justify-center crypto-icon">
                  <img src={bnb} alt="" width="30px" height="30px"/>
                </div>
                <h1 className="ml-5 font-bold text-[2.1vh] sm:text-[2.1vh] md:text-[2.5vh] text-white">BNB</h1>
              </div>
              <div>
                <h1 className="ml-5 font-bold text-[2.1vh] sm:text-[2.1vh] md:text-[2.5vh] text-white">563.84$</h1>
              </div>
            </button>
            
          </div>
      </div>
      {alerts.map((alert) => (
          <div key={alert.id} className="fixed top-3 alert">
            {<Warning message="Fill the Amount"/>}
          </div>
        ))}
      <button className={`close modal-button ${modelOpen ? '' : 'trans-button'}`} onClick={handleModel}>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <svg viewBox="0 0 36 36" className="circle">
          <path
            strokeDasharray="100, 100"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
      </button>
      {modelOpen && (<div className="fixed h-[150%] w-full top-0 bg-black opacity-70 z-50"></div>)}
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
