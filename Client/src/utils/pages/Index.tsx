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

    // Check for referral code in Telegram start parameter
    const startParam = WebApp?.initDataUnsafe?.start_param;
    console.log('Telegram start parameter:', startParam);
    console.log('Full WebApp data:', WebApp?.initDataUnsafe);
    
    let referralCode = null;
    
    if (startParam && startParam.startsWith('ref_')) {
      referralCode = startParam.substring(4); // Remove 'ref_' prefix
      console.log('Extracted referral code:', referralCode);
    }
    
    // Alternative: Check URL parameters as fallback
    if (!referralCode) {
      const urlParams = new URLSearchParams(window.location.search);
      const urlRefCode = urlParams.get('ref');
      if (urlRefCode) {
        referralCode = urlRefCode;
        console.log('Found referral code in URL:', referralCode);
      }
    }
    
    if (referralCode && user) {
      console.log('User and referral code found, registering...');
      // Register user with referral code
      registerUserWithReferral(user, referralCode);
    } else {
      console.log('No referral code or user found');
      console.log('User data:', user);
    }
  
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

  const registerUserWithReferral = async (user: UserData, referralCode: string) => {
    try {
      console.log('Registering user with referral code:', referralCode);
      
      const response = await fetch('https://boostify-server.vercel.app/api/insertUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _id: user.id,
          name: user.first_name + (user.last_name ? ' ' + user.last_name : ''),
          coins: 0,
          referralCode: referralCode
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('User registered with referral code:', result);
      } else {
        console.error('Failed to register user with referral');
      }
    } catch (error) {
      console.error('Error registering user with referral:', error);
    }
  }; 
  

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
              className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20"
            />
            <span className="font-bold text-4xl sm:text-5xl md:text-6xl">
              {coinValue}
            </span>
          </div>
          <h1 className="w-full flex justify-center items-center text-white text-opacity-70 font-normal text-xl sm:text-2xl md:text-3xl">
            Available Balance
          </h1>
          <div
            style={{ 
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3), 0 4px 16px rgba(118, 75, 162, 0.2)"
            }}
            className="w-fit h-fit border-2 border-white border-opacity-30 font-bold rounded-3xl p-4 cursor-pointer mt-5 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/40 active:scale-95"
          >
            <a
              href="/funds"
              className="w-full flex justify-center items-center gap-3"
            >
              <img
                src={wallet}
                alt=""
                className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 drop-shadow-lg"
                style={{ filter: "brightness(0) invert(1)" }}
              />
              <h1 className="font-bold text-white text-opacity-95 text-lg sm:text-xl md:text-2xl tracking-wide">
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
                    <div className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 flex items-center justify-center">
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
                className={`h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 ${
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
