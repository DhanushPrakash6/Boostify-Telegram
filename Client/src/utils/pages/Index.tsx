import "../styles/index.css";
import { useState, useEffect } from "react";
import WebApp from "@twa-dev/sdk";
import {
  wifi,
  telegram,
  spotify,
  linkedin,
  whatsapp,
  facebook,
  instagram,
  soundcloud,
  tiktok,
  twitch,
  X,
  youtube,
} from "../../icons/Arrow.ts";
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
  const [userData, setUserData] = useState<UserData | null>(null);
  const [coinValue, setCoinValue] = useState<number>();

  useEffect(() => {
    if (WebApp?.initDataUnsafe?.user) {
      const user = WebApp.initDataUnsafe.user as UserData;
      setUserData(user);
      console.log(user.id);
      const fetchUserCoins = async () => {
        try {
          const response = await fetch(user ? `https://boostify-server.vercel.app/api/getUserCoin?id=${user.id}` :
            `https://boostify-server.vercel.app/api/getUserCoin?id=1011111`
          );
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const data = await response.json();
          setCoinValue(data.coins);
        } catch (error) {
          console.error("Error fetching user's coins:", error);
        }
      };

      fetchUserCoins();
    }
  }, []);
  return (
    <>
      <div className="overflow-auto w-full h-full bg-gradient-main p-5 flex flex-col min-h-screen items-center text-black font-medium">
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
              {coinValue.toFixed(2)}
            </span>
          </div>
          <h1 className="w-full flex justify-center items-center text-black text-opacity-50 font-normal text-xl sm:text-2xl md:text-3xl">
            Available Balance
          </h1>
          <div
            style={{ background: "#ee9ca7" }}
            className="w-fit h-fit border-2 border-black font-bold rounded-3xl p-3 cursor-pointer mt-5"
          >
            <a
              href=""
              className="w-full flex justify-center items-center gap-2"
            >
              <img
                src={wallet}
                alt=""
                className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7"
              />
              <h1 className="font-bold text-black text-opacity-90 text-base sm:text-lg md:text-xl">
                Add Money
              </h1>
            </a>
          </div>
        </div>

        <div className="w-full flex flex-col flex-grow justify-around pb-[120px] overflow-auto">
          {[
            [instagram, telegram, youtube],
            [X, twitch, facebook],
            [tiktok, soundcloud, spotify],
            [linkedin, whatsapp, wifi],
          ].map((group, index) => (
            <div key={index} className="flex justify-around">
              {group.map((icon, idx) => {
                const socialMediaNames = [
                  "instagram",
                  "telegram",
                  "youtube",
                  "X",
                  "twitch",
                  "facebook",
                  "tiktok",
                  "soundcloud",
                  "spotify",
                  "linkedin",
                  "whatsapp",
                  "wifi",
                ];
                const socialMedia =
                  socialMediaNames[index * group.length + idx];
                return (
                  <a key={idx} href={`/subfile/${socialMedia}`}>
                    <img
                      src={icon}
                      alt={socialMedia}
                      className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20"
                    />
                  </a>
                );
              })}
            </div>
          ))}
        </div>

        <footer className="w-full flex justify-around items-center p-4 border-dashed border-t-2 border-black">
          {[
            { src: home, alt: "Home" },
            { src: group, alt: "Friends" },
            { src: podium, alt: "Board" },
            { src: fund, alt: "Funds" },
          ].map((item, index) => (
            <a
              key={index}
              href="/"
              className={`flex flex-col items-center ${
                item.alt === "Home" ? "border-2 border-black" : ""
              }`}
            >
              <img
                src={item.src}
                alt={item.alt}
                className={`h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 ${
                  item.alt === "Home" ? "opacity-100" : "opacity-80"
                }`}
              />
            </a>
          ))}
        </footer>
      </div>
    </>
  );
};

export default Index;
