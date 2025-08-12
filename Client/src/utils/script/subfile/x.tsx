import { useState, useEffect } from "react";
import "../../styles/index.css";
import WebApp from "@twa-dev/sdk";
import Confirm from "../component/confirm.tsx";
import Success from "../component/success.tsx";
import Failure from "../component/fail.tsx";
import Warning from "../component/warning.tsx";
interface UserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code: string;
  is_premium?: boolean;
}
import {
  podium,
  fund,
  home,
  group,
  back,
} from "../../../../src/images/index.ts";
import InputField from "../component/input.tsx";
import { v4 as uuidv4 } from "uuid";
function Twitter() {
  const [postLink, setPostLink] = useState<string | null>(null);
  const [Followers, setFollowers] = useState<number | null>(null);
  const [NFTFollowers, setNFTFollowers] = useState<number | null>(null);
  const [likes, setlikes] = useState<number | null>(null);
  const [reTweet, setreTweet] = useState<number | null>(null);
  const [comments, setComments] = useState<number | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  
  const calculateTotal = () => {
    return (
      ((Followers || 0) * 0.1 + (NFTFollowers || 0) * 0.25 + (likes || 0) * 0.001 + (reTweet || 0) * 0.05 + (comments || 0) * 0.1)
    );
  };
  const [userData, setUserData] = useState<UserData | null>(null);
  useEffect(() => {
    if (WebApp?.initDataUnsafe?.user) {
      const user = WebApp.initDataUnsafe.user as UserData;
      setUserData(user);
    }
  }, []);
  
  const handleConfirmClick = async () => {
    const metricsData = {
      postLink,
      Followers,
      NFTFollowers,
      likes,
      reTweet,
      comments
    };
  
    const newAlert = { id: uuidv4() };
  
    if (!postLink) {
      setAlerts((prev) => [...prev, { id: Date.now(), type: "empty" }]);
    } 
    // Alert for zero total
    else if (calculateTotal().toFixed(2) === "0.00") {
      setAlerts((prev) => [...prev, { id: Date.now(), type: "warning" }]);
    } 
    else {
      const filteredMetricsData = Object.entries(metricsData).reduce(
        (acc, [key, value]) => {
          if (key === 'postLink' && value !== "") {
            acc[key] = value;
          } else if (
            key !== 'postLink' && 
            value !== 0 && value !== null && value !== undefined
          ) {
            acc[key] = value;
          }
          return acc;
        }, 
        {}
      );
  
      const subtractCoins = async () => {
        try {
          const userId = userData?.id || 1011111; // Fallback for user ID
          const totalAmount = calculateTotal().toFixed(2);
          const apiUrl = `https://boostify-server.vercel.app/api/subtractCoins?_id=${userId}&amount=${totalAmount}`;
          
          const requestBody = {
            social: "Twitter",
            userId,
            name: userData ? `${userData.first_name} ${userData.last_name}` : "Unknown User",
            amount: Number(totalAmount),
            metrics: filteredMetricsData
          };
  
          const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          });
  
          if (response.ok) {
            setAlerts((prev) => [...prev, { id: Date.now(), type: "success" }]);
          } else if (response.status === 400) {
            setAlerts((prev) => [...prev, { id: Date.now(), type: "failure" }]);
          } else {
            setAlerts((prev) => [...prev, { id: Date.now(), type: "error" }]);
          }
        } catch (error) {
          console.error("Error in subtractCoins:", error);
          setAlerts((prev) => [...prev, { id: Date.now(), type: "error" }]);
        }
      };
  
      await subtractCoins();
    }
  
    setTimeout(() => {
      setAlerts((prevAlerts) =>
        prevAlerts.filter((alert) => alert.id !== newAlert.id)
      );
    }, 5000);
  
    if (alerts.length >= 5) {
      setAlerts((prevAlerts) => prevAlerts.slice(1));
    }
  };
  
  return (
    <>
      <div className="overflow-y-auto w-full h-full p-5 flex flex-col min-h-screen items-center text-white font-medium pb-[120px]" style={{
        background: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)"
      }}>
        <div className="w-full flex justify-left items-center">
          <a href="/">
            <div
              style={{
                padding: "7px",
                borderRadius: "10px",
                border: "1px solid rgba(255, 255, 255, 0.3)"
              }}
            >
              <img src={back} alt="" height="20px" width="20px" style={{ filter: "brightness(0) invert(1)" }} />
            </div>
          </a>
        </div>
        <h1 className="w-full flex justify-center items-center text-white text-opacity-90 font-normal text-lg">
          X (Twitter)
        </h1>
        <h4 className="mt-2 w-[100%] justify-center items-center text-white text-opacity-60 text-center font-normal text-[14px]">
          Note: Please complete the form below. The results will appear within a
          few minutes after the transaction is completed.
        </h4>
        <hr className="border-[1px] border-white border-opacity-40 w-[150%] opacity-40 mt-3" />
        <h1 className="w-full flex justify-left items-center text-white text-opacity-90 font-normal text-lg mt-3">
          Content Info
        </h1>
        <h4 className="mt-1 w-[100%] justify-left items-center text-white text-opacity-60 font-normal text-[14px]">
          Provide exact information to avoid interruptions.
        </h4>

        <div className="w-full flex justify-left items-center mt-3">
          <InputField
            placeholder={"Link"}
            type={"text"}
            isCheckedInitially={false}
            onValueChange={(val) => setPostLink(val)}
            min={0}
            max={0}
          />
        </div>

        <h1 className="w-full flex justify-left items-center text-white text-opacity-90 font-normal text-lg mt-4">
          Engagement Metrics
        </h1>
        <h4 className="mt-1 w-[100%] justify-left text-white text-opacity-60 font-normal text-[14px]">
          Please check the box if you need specific metrics for the post.
        </h4>

        <div className="w-full flex justify-left items-center mt-3">
          <InputField
            placeholder={"Number of Followers"}
            type={"number"}
            isCheckedInitially={true}
            onValueChange={(val) => setFollowers(Number(val))}
            min={5}
            max={10000}
          />
        </div>
        <h4 className="mt-2 w-[100%] justify-left text-white text-opacity-60 font-normal text-[14px]">
          (Minimum: 5 ; Maximum: 10,000)
        </h4>

        <div className="w-full flex justify-left items-center mt-3">
          <InputField
            placeholder={"Number of Premium NFT Followers"}
            type={"number"}
            isCheckedInitially={true}
            onValueChange={(val) => setNFTFollowers(Number(val))}
            min={20}
            max={5000}
          />
        </div>
        <h4 className="mt-2 w-[100%] justify-left text-white text-opacity-60 font-normal text-[14px]">
          (Minimum: 20 ; Maximum: 5,000)
        </h4>

        <div className="w-full flex justify-left items-center mt-3">
          <InputField
            placeholder={"Likes Count"}
            type={"number"}
            isCheckedInitially={true}
            onValueChange={(val) => setlikes(Number(val))}
            min={50}
            max={10000}
          />
        </div>
        <h4 className="mt-2 w-[100%] justify-left text-white text-opacity-60 font-normal text-[14px]">
          (Minimum: 50 ; Maximum: 10,000)
        </h4>

        <div className="w-full flex justify-left items-center mt-3">
          <InputField
            placeholder={"Retweet Count"}
            type={"number"}
            isCheckedInitially={true}
            onValueChange={(val) => setreTweet(Number(val))}
            min={10}
            max={10000}
          />
        </div>
        <h4 className="mt-2 w-[100%] justify-left text-white text-opacity-60 font-normal text-[14px]">
          (Minimum: 10 ; Maximum: 10,000)
        </h4>

        <div className="w-full flex justify-left items-center mt-3">
          <InputField
            placeholder={"Comment Count"}
            type={"number"}
            isCheckedInitially={true}
            onValueChange={(val) => setComments(Number(val))}
            min={5}
            max={500}
          />
        </div>
        <h4 className="mt-2 w-[100%] justify-left text-white text-opacity-60 font-normal text-[14px]">
          (Minimum: 5 ; Maximum: 500)
        </h4>

        <div className="w-full flex justify-center mt-4">
          <Confirm text={`Confirm - $${calculateTotal().toFixed(2)}`} onClick={handleConfirmClick} />
        </div>

        {/* Alert Display */}
        {alerts.map((alert) => (
          <div key={alert.id} className="fixed top-3 alert">
            {alert.type === "empty" && <Warning message="Fill the Link"/>}
            {alert.type === "warning" && <Warning message="Choose any Service"/>}
            {alert.type === "failure" && <Failure message = "Insufficient Funds"/>}
            {alert.type == "error" && <Failure message="Error Occurred"/>}
            {alert.type === "success" && (
              <Success amount={Number(calculateTotal().toFixed(2))} />
            )}
          </div>
        ))}

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
                item.alt === "Home" ? "/" : item.alt === "Friends" ? "/referral" : item.alt === "Orders" ? "/orders" : item.alt === "Funds" ? "/funds" : "/"
              }`}
              className={`flex flex-col items-center ${
                item.alt === "Home" ? "border-2 border-white border-opacity-30" : ""
              }`}
            >
              <img
                src={item.src}
                alt={item.alt}
                className={`h-10 w-10 ${
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
}

export default Twitter;
