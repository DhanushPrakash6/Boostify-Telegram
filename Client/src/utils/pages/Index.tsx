import "../styles/index.css";
import { useState, useEffect } from "react";
import WebApp from "@twa-dev/sdk";
import { StaticIcons } from "../../icons/StaticIcons";
import Home from "./data.tsx";
import {
  profile,
  coin,
  podium,
  fund,
  home,
  group,
  wallet,
} from "../../images/index.ts";

interface UserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code: string;
  is_premium?: boolean;
}

const Index = () => {
  const [coinValue, setCoinValue] = useState<string>();
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const user = WebApp?.initDataUnsafe?.user as UserData | undefined;
    
    if (user) {
      setUserData(user);
    }

    // Note: Referral logic is now handled by the Telegram bot in bot.js
    // The bot handles /start commands with referral codes
    console.log('=== MINI APP START ===');
    console.log('User data:', user);
    console.log('WebApp data:', WebApp?.initDataUnsafe);
    console.log('=== END MINI APP START ===');
  
    const fetchUserCoins = async (userId: number) => {
      try {
        const response = await fetch(
          `https://boostify-server.vercel.app/api/getUserCoin?id=${userId}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setCoinValue(
          Number(data.coins).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        );
      } catch (error) {
        console.error("Error fetching user's coins:", error);
      }
    };
  
    if (user) {
      fetchUserCoins(user.id);
    } else {
      fetchUserCoins(1011111);
    }
  
  }, []);

 
  

  return (
    <>
      <div className="overflow-auto w-full h-full p-5 flex flex-col min-h-screen items-center text-white font-medium" style={{
        background: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)"
      }}>
        <div className="w-full flex justify-end items-center">
          <div className="w-full flex justify-left items-center">
            <img src={profile} alt="" className="h-10 w-10" />
            <Home />
          </div>
        </div>
        <div className="w-full flex flex-col justify-center items-center pt-[15px] pb-[15px]">
          <div className="w-full flex justify-center items-center gap-1">
            <img
              src={coin}
              alt=""
              className="h-16 w-16"
            />
            <span className="font-bold text-4xl">
              {coinValue}
            </span>
          </div>
          <h1 className="w-full flex justify-center items-center text-white text-opacity-70 font-normal text-xl">
            Available Balance
          </h1>
          <div
            style={{ 
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3), 0 4px 16px rgba(118, 75, 162, 0.2)"
            }}
            className="w-fit h-fit border-2 border-white border-opacity-30 font-bold rounded-3xl p-4 cursor-pointer mt-5 transition-all duration-300 active:scale-95"
          >
            <a
              href="/funds"
              className="w-full flex justify-center items-center gap-4"
            >
              <svg fill="#ffffff" height="24px" width="24px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 458.531 458.531" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="XMLID_830_"> <g> <g> <path d="M336.688,343.962L336.688,343.962c-21.972-0.001-39.848-17.876-39.848-39.848v-66.176 c0-21.972,17.876-39.847,39.848-39.847h103.83c0.629,0,1.254,0.019,1.876,0.047v-65.922c0-16.969-13.756-30.725-30.725-30.725 H30.726C13.756,101.49,0,115.246,0,132.215v277.621c0,16.969,13.756,30.726,30.726,30.726h380.943 c16.969,0,30.725-13.756,30.725-30.726v-65.922c-0.622,0.029-1.247,0.048-1.876,0.048H336.688z"></path> <path d="M440.518,219.925h-103.83c-9.948,0-18.013,8.065-18.013,18.013v66.176c0,9.948,8.065,18.013,18.013,18.013h103.83 c9.948,0,18.013-8.064,18.013-18.013v-66.176C458.531,227.989,450.466,219.925,440.518,219.925z M372.466,297.024 c-14.359,0-25.999-11.64-25.999-25.999s11.64-25.999,25.999-25.999c14.359,0,25.999,11.64,25.999,25.999 C398.465,285.384,386.825,297.024,372.466,297.024z"></path> <path d="M358.169,45.209c-6.874-20.806-29.313-32.1-50.118-25.226L151.958,71.552h214.914L358.169,45.209z"></path> </g> </g> </g> </g></svg>
              <h1 className="font-bold text-white text-opacity-95 text-lg tracking-wide">
                Add Money 
              </h1>
            </a>
          </div>
        </div>

        <div className="w-full flex flex-col flex-grow justify-around pb-[120px] overflow-auto">
          {[
            ['instagram', 'telegram', 'youtube'],
            ['X', 'twitch', 'facebook'],
            ['tiktok', 'soundcloud', 'spotify'],
            ['linkedin', 'whatsapp', 'wifi'],
          ].map((group, index) => (
            <div key={index} className="flex justify-around">
              {group.map((socialMedia, idx) => {
                const IconComponent = StaticIcons[socialMedia as keyof typeof StaticIcons];
                return (
                  <a key={idx} href={`/subfile/${socialMedia}`}>
                    <div className="h-16 w-16 flex items-center justify-center">
                      <IconComponent />
                    </div>
                  </a>
                );
              })}
            </div>
          ))}
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
                item.alt === "Home" ? "border-2 border-white border-opacity-30" : ""
              }`}
            >
              <img
                src={item.src}
                alt={item.alt}
                className={`h-12 w-12 ${
                  item.alt === "Home" ? "opacity-100" : "opacity-50"
                }`}
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </a>
          ))}
        </footer>
      </div>
    </>
  );
};

export default Index;
