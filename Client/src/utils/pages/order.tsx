import "../styles/index.css";
import { useState, useEffect } from "react";
import WebApp from "@twa-dev/sdk";
import Home from "./data.tsx";
import {
  profile, coin, podium, fund, home, group, wallet
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
  const [coinValue, setCoinValue] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
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

    const fetchOrders = async (userId: number) => {
      try {
        const response = await fetch(
          `https://boostify-server.vercel.app/api/getOrders?id=${userId}`
        );
        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();
        setOrders(data.result);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    const userId = user?.id || 1011111;

    
    fetchUserCoins(userId);
    fetchOrders(userId);
  }, [userData]);  


  return (
    <div className="overflow-auto w-full h-full p-5 flex flex-col min-h-screen items-center text-white font-medium" style={{
      background: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)"
    }}>
      <div className="w-full flex justify-end items-center">
        <div className="w-full flex justify-left items-center">
          <img src={profile} alt="Profile" className="h-10 w-10" />
          <Home />
        </div>
      </div>

      <div className="w-full flex flex-col justify-center items-center pt-[15px] pb-[15px]">
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
        <h1 className="w-full flex justify-center items-center text-white text-opacity-70 font-normal text-xl sm:text-2xl md:text-3xl">
          Available Balance
        </h1>
        <div
          style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
          className="w-fit h-fit border-2 border-white border-opacity-20 font-bold rounded-3xl p-3 cursor-pointer mt-5"
        >
          <a
            href="/funds"
            className="w-full flex justify-center items-center gap-2"
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

      <span className="w-[500%] border-dashed border-t-2 border-white border-opacity-20 m-6" />
      <h1 className="w-full flex justify-left items-center text-white text-opacity-90 font-normal text-l sm:text-2xl md:text-3xl">
        Transactions
      </h1>

      <div className="m-3 w-full h-[410px] pb-[110px] flex flex-col gap-4 overflow-y-scroll no-scrollbar">
      {orders.length > 0 ? (
        orders.map((order) => (
          <div key={order._id} className="w-full border rounded-2xl bg-white bg-opacity-10 flex justify-between items-center p-4">
            <div className="w-full flex flex-col overflow-x-auto gap-1">
              <h1 className="font-normal text-white text-opacity-70 text-[1.7vh] sm:text-2xl md:text-3xl">
                {order.social}
              </h1>
              <h1 className="text-white text-opacity-60 font-medium text-xs sm:text-2xl md:text-3xl">
                {order.metrics.postLink}
              </h1>
              <div className="w-fit">
                <details className="bg-white bg-opacity-10 rounded-lg p-2">
                  <summary className="text-blue-400 font-normal text-xs sm:text-2xl md:text-3xl">
                    Show Metrics
                  </summary>
                  <div className="flex flex-col mt-2 gap-1">
                    {Object.entries(order.metrics)
                      .filter(([key, value]) => key !== 'postLink' && value)
                      .map(([key, value]) => (
                        <div key={key} className="text-white text-opacity-80 text-xs sm:text-2xl md:text-3xl">
                          <strong>{key.charAt(0).toUpperCase() + key.slice(1)}: </strong> {String(value)}
                        </div>
                      ))}
                  </div>
                </details>
              </div>
            </div>
            <div>
              <h1 className="text-red-400 font-normal text-lg sm:text-2xl md:text-3xl text-opacity-90">
                -{order.amount}$
              </h1>
            </div>
          </div>
        ))
        ) : (
        <div className="w-full flex justify-center items-center">
          <h1 className="text-white text-opacity-60 font-normal text-sm sm:text-2xl md:text-3xl">
            No Transactions Found
          </h1>
        </div>
      )}
      </div>

      <footer className="w-full flex justify-around items-center p-4 border-dashed border-t-2 border-white border-opacity-20" style={{
        background: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)"
      }}>
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
              item.alt === "Orders" ? "border-2 border-white border-opacity-30" : ""
            }`}
          >
            <img
              src={item.src}
              alt={item.alt}
              className={`h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 ${
                item.alt === "Orders" ? "opacity-100" : "opacity-50"
              }`}
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </a>
        ))}
      </footer>
    </div>
  );
};

export default Orders;
