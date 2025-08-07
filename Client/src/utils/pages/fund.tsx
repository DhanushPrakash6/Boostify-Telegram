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
  const [alerts, setAlerts] = useState<any[]>([]);
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
  
      if (res.ok) {
        const data = await res.json();
        console.log(data);
        console.log(data.valueInUSD);
        setAlerts((prev) => [...prev, { id: Date.now(), type: "success1", message: `${data.valueInUSD}` }]);
      } else {
        const errorData = await res.json(); 
  
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
      setAlerts((prev) => [...prev, { id: Date.now(), type: "error", message: "Network error or no response from server" }]);
      console.error('Network error:', error);
    }
  };
  
  const handleLinkClick = (e: React.MouseEvent<HTMLHeadingElement, MouseEvent>, link: string) => {
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
      setTimeout(() => {
        setMoveDiv(false);
      }, 600);
    }
    else {
      if(fundInput !== "")
        setModelOpen(true);
      else
        setAlerts((prev) => [...prev, { id: Date.now(), type: "fill_Amount" }]);
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
    <div className={`overflow-hidden w-full h-full p-5 flex flex-col min-h-screen items-center text-white font-medium`} style={{
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
          <span className="font-bold text-4xl">
            {coinValue !== null ? coinValue : "Loading..."}
          </span>
        </div>
        <h1 className="w-full flex justify-center items-center text-white text-opacity-70 font-normal text-xl">
          Available Balance
        </h1>
      </div>

      <div className="w-full">
        <h1 className="w-full mt-7 flex justify-left text-white font-normal text-lg text-lg">
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
            className="w-[70%] bg-transparent p-2 text-lg text-center text-white"
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
              {alert.type == "emptyHash" && <Failure message="Fill Transaction Hash"/>}
              {alert.type === "success1" && <Success amount={alert.message}/>}
            </div>
          ))}
          <div className={`absolute flex flex-col items-center p-[100px] w-[90%] h-[95%] bg-opacity-80 gap-4 rounded-xl  ${moveDiv ? 'duration-[1.6s]' : 'mov1 duration-[1s]'}`}>
            <div className="absolute top-0 left-0">
              <button onClick={movDiv}>
                <div
                  style={{
                    padding: "7px",
                    borderRadius: "10px",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                  }}
                >
                  <img src={back} alt="" height="20px" width="20px" style={{ filter: "brightness(0) invert(1)" }} />
                </div>
              </button>
            </div>
            <div className="w-fit h-fit p-2 rounded-full flex items-center justify-center bg-[#26A17B]">
              <img src={usdt} alt="" width="30px" height="30px"/>
            </div>
            <div className="w-[300%] flex items-center flex-col gap-1">
              <h1 className="text-[18px] text-lg text-white">USDT (ERC-20)</h1>
              <h1 className="text-white text-opacity-60 font-light text-[16px] text-lg">Wallet Address</h1>
              <h1 
                onClick={(e) => handleLinkClick(e, "0xee7911f4beaa561ae4f18ffccf52ed49342cb723")} 
                className="link-text text-white font-bold font-mono text-[14px] text-lg"
              >
                0xee7911f4beaa561ae4f18ffccf52ed49342cb723
              </h1>
              <h1 
                className="text-white text-opacity-60 font-normal text-[13px] text-lg"
              >
                Click on the above wallet address to copy it
              </h1>
              <input placeholder="Enter Transaction Hash" className="input-txn mt-3" type="text" onChange={(val) => {setTxnHash(val.target.value)}}/>
              <h1 
                className="text-white text-opacity-60 font-normal text-[12px] text-lg w-[80%] mt-3 text-center"
              >
                Please deposit exactly {fundInput} USDT to the provided wallet address on the Ethereum network (ERC-20)
              </h1>
              <h1 
                className="text-white text-opacity-60 font-normal text-[12px] text-lg w-[80%] text-center"
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
                className="text-white text-opacity-60 font-normal text-[12px] text-lg w-[70%] text-center mt-3"
              >
                Once the transaction confirmation is submitted, it will take a few minutes to reflect in your wallet
              </h1>
              <h1 
                className="text-white text-opacity-60 font-normal text-[12px] text-lg w-[70%] text-center mt-3"
              >
                Note: Only the value after deducting gasPrice will be added to your wallet once the transaction is completed.
              </h1>
            </div>
          </div>

          <div className={`w-full gap-2 flex flex-col items-start justify-start transition-{transform} duration-[0.8s] ${moveDiv ? 'mov' : ''}`}>
            <h1 className="text-white font-normal text-2xl text-2xl">Top up your wallet with any chains below</h1>
            <h1 className="text-white text-opacity-60 font-light text-1xl text-lg">Choose coin for deposit</h1>
          </div>
          <h1 className={`text-white font-normal text-[1.8vh] text-lg mt-3 w-full flex justify-center transition-{transform} duration-[0.8s] ${moveDiv ? 'mov' : ''}`}>Amount : {fundInput}</h1>
          <div className="flex flex-col gap-4 mt-3 h-[85%] overflow-visible pb-[25px] no-scrollbar">
            <button name="usdt" onClick={movDiv} className={`w-full mt-1 h-[83px] rounded-3xl crypto-container flex items-center justify-between p-5 duration-[3s] ${moveDiv ? 'mov' : ''}`}>
              <div className="flex justify-center items-center">
                <div className="w-[50px] h-[50px] rounded-full flex items-center justify-center crypto-icon">
                  <img src={usdt} alt="" width="30px" height="30px"/>
                </div>
                <h1 className="ml-5 font-bold text-[2.1vh] text-lg text-white">USDT</h1>
              </div>
              <div>
                <h1 className="ml-5 font-bold text-[2.1vh] text-lg text-white">1.00$</h1>
              </div>
            </button>
            
            <button name="btc" className={`w-full h-[83px] rounded-3xl crypto-container flex items-center justify-between p-5 duration-[3s] ${moveDiv ? 'mov' : ''}`}>
              <div className="flex justify-center items-center">
                <div className="w-[50px] h-[50px] rounded-full flex items-center justify-center crypto-icon">
                  <img src={btc} alt="" width="30px" height="30px"/>
                </div>
                <h1 className="ml-5 font-bold text-[2.1vh] text-lg text-white">BTC</h1>
              </div>
              <div>
                <h1 className="ml-5 font-bold text-[2.1vh] text-lg text-white">63,126.50$</h1>
              </div>
            </button>
            
            <button name="eth" className={`w-full h-[83px] rounded-3xl crypto-container flex items-center justify-between p-5 duration-[3s] ${moveDiv ? 'mov' : ''}`}>
              <div className="flex justify-center items-center">
                <div className="w-[50px] h-[50px] rounded-full flex items-center justify-center crypto-icon">
                  <img src={eth} alt="" width="30px" height="30px"/>
                </div>
                <h1 className="ml-5 font-bold text-[2.1vh] text-lg text-white">ETH</h1>
              </div>
              <div>
                <h1 className="ml-5 font-bold text-[2.1vh] text-lg text-white">2376.40$</h1>
              </div>
            </button>

            <button name="sol" className={`w-full h-[83px] rounded-3xl crypto-container flex items-center justify-between p-5 duration-[3s] ${moveDiv ? 'mov' : ''}`}>
              <div className="flex justify-center items-center">
                <div className="w-[50px] h-[50px] rounded-full flex items-center justify-center crypto-icon">
                  <img src={sol} alt="" width="30px" height="30px"/>
                </div>
                <h1 className="ml-5 font-bold text-[2.1vh] text-lg text-white">SOL</h1>
              </div>
              <div>
                <h1 className="ml-5 font-bold text-[2.1vh] text-lg text-white">137.33$</h1>
              </div>
            </button>
            
            <button name="bnb" className={`w-full h-[83px] rounded-3xl crypto-container flex items-center justify-between p-5 duration-[3s] ${moveDiv ? 'mov' : ''}`}>
              <div className="flex justify-center items-center">
                <div className="w-[50px] h-[50px] rounded-full flex items-center justify-center crypto-icon">
                  <img src={bnb} alt="" width="30px" height="30px"/>
                </div>
                <h1 className="ml-5 font-bold text-[2.1vh] text-lg text-white">BNB</h1>
              </div>
              <div>
                <h1 className="ml-5 font-bold text-[2.1vh] text-lg text-white">563.84$</h1>
              </div>
            </button>       
          </div>
      </div>
      {alerts.map((alert) => (
          <div key={alert.id} className="fixed top-3 alert">
            {alert.type === "fill_Amount" && <Warning message="Fill the Amount"/>}
          </div>
      ))}
      <button className={`border close modal-button ${modelOpen ? '' : 'trans-button'} flex items-center justify-center `} onClick={handleModel}>
        <svg height = "30px" width = "30px" viewBox="0 0 56.326 56.326" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path id="Path_14" data-name="Path 14" d="M477.613,422.087l25.6-25.6a1.5,1.5,0,0,0-2.122-2.121l-25.6,25.6-25.6-25.6a1.5,1.5,0,1,0-2.121,2.121l25.6,25.6-25.6,25.6a1.5,1.5,0,0,0,2.121,2.122l25.6-25.6,25.6,25.6a1.5,1.5,0,0,0,2.122-2.122Z" transform="translate(-447.328 -393.924)" fill="#ffffff"></path> </g></svg>
      </button>
      {modelOpen && (<div className="fixed h-[150%] w-full top-0 bg-black opacity-70 z-50"></div>)}
      <footer className={`w-full flex justify-around items-center p-4 border-dashed border-t-2 border-white border-opacity-20 ${modelOpen ? 'bg-black bg-opacity-70' : ''} `} style={{
        background: modelOpen ? "rgba(0, 0, 0, 0.7)" : "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)"
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
