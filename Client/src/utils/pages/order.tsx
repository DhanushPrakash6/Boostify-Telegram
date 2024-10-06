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

const Orders = () => {
  const [userData, setUserData] = useState<UserData>();
  const [coinValue, setCoinValue] = useState<number>();
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    if (WebApp?.initDataUnsafe?.user) {
      const user = WebApp.initDataUnsafe.user as UserData;
      setUserData(user); 
    }
    const fetchUserCoins = async () => {
        try {
          // const response = await fetch((WebApp?.initDataUnsafe?.user) ? `https://boostify-server.vercel.app/api/getUserCoin?id=${userData.id}` :
          //   `https://boostify-server.vercel.app/api/getUserCoin?id=1011111`
          // );
          const response = await fetch(`https://boostify-server.vercel.app/api/getUserCoin?id=${userData.id}`);
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const data = await response.json();
          setCoinValue(data.coins.toFixed(2));
        } catch (error) {
          console.error("Error fetching user's coins:", error);
        }
      };
    fetchUserCoins();
    const fetchOrders = async () => {
        try {
            // const response = await fetch((WebApp?.initDataUnsafe?.user) ? `https://boostify-server.vercel.app/api/getOrders?id=${userData.id}` :
            //     `https://boostify-server.vercel.app/api/getOrders?id=1011111`
            // );
            const response = await fetch(`https://boostify-server.vercel.app/api/getOrders?id=${userData.id}`);
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            setOrders(data.result); 
        } catch (error) {
            console.error("Error fetching Data:", error);
        }
    };

    fetchOrders();
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
              {coinValue}
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
              href="/funds"
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
        <span className="w-[500%] border-dashed border-t-2 border-black m-6"/>
        <h1 className="w-full flex justify-left items-center text-black text-opacity-90 font-normal text-l sm:text-2xl md:text-3xl">
            Transactions
        </h1>
        <div className="m-3 w-full h-[410px] pb-[110px] flex flex-col gap-4 overflow-y-scroll no-scrollbar">
          {orders.length > 0 ? (
            orders.map((order) => (
              <div key={order._id} className="w-full border rounded-2xl bg-white flex justify-between items-center p-4">
                <div className="w-full flex flex-col overflow-x-auto gap-1">
                  <h1 className="font-normal text-opacity-50 text-[1.7vh] sm:text-2xl md:text-3xl">{order.social}</h1>
                  <h1 className="text-black text-opacity-50 font-medium text-xs sm:text-2xl md:text-3xl">{order.metrics.postLink}</h1>
                </div>
                <div>
                  <h1 className="text-red-600 font-normal text-lg sm:text-2xl md:text-3xl text-opacity-90">
                    -{order.amount}$
                  </h1>
                </div>
              </div>
            ))
          ) : (
            <div className="w-full flex justify-center items-center">
              <h1 className="text-black text-opacity-50 font-normal text-sm sm:text-2xl md:text-3xl">
                No Transactions Found
              </h1>
            </div>
          )}
        </div>
        <footer className="w-full flex justify-around items-center p-4 border-dashed border-t-2 border-black">
          {[
            { src: home, alt: "Home" },
            { src: group, alt: "Friends" },
            { src: podium, alt: "Orders" },
            { src: fund, alt: "Funds" },
          ].map((item, index) => (
            <a
              key={index}
              href={`${
                item.alt === "Home" ? "/" : item.alt === "Friends" ? "/friends" : item.alt === "Orders" ? "/orders" : item.alt === "Funds" ? "/funds" : "/"
              }`}
              className={`flex flex-col items-center ${
                item.alt === "Orders" ? "border-2 border-black" : ""
              }`}
            >
              <img
                src={item.src}
                alt={item.alt}
                className={`h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 ${
                  item.alt === "Orders" ? "opacity-100" : "opacity-80"
                }`}
              />
            </a>
          ))}
        </footer>
      </div>
    </>
  );
};

export default Orders;
