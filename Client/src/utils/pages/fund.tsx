import "../styles/index.css";
import React, { useState, useEffect } from "react";
import WebApp from "@twa-dev/sdk";
import Home from "./data.tsx";

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
