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
function Insta() {
  const [postLink, setPostLink] = useState<string | null>(null);
  const [followers, setFollowers] = useState<number | null>(null);
  const [likes, setLikes] = useState<number | null>(null);
  const [reelsViews, setReelsViews] = useState<number | null>(null);
  const [storyViews, setStoryViews] = useState<number | null>(null);
  const [comments, setComments] = useState<number | null>(null);
  const [commentLikes, setCommentLikes] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [alerts, setAlerts] = useState([]);
  
  const calculateTotal = () => {
    return (
      (followers * 0.05 + likes * 0.01 + reelsViews * 0.005 + storyViews * 0.05 + comments * 0.2 + commentLikes * 0.01)
    );
  };
  const [userData, setUserData] = useState<UserData | null>(null);
  const [coinValue, setCoinValue] = useState<number>(0);
  
  useEffect(() => {
    if (WebApp?.initDataUnsafe?.user) {
      const user = WebApp.initDataUnsafe.user as UserData;
      setUserData(user);
    }
  }, []);
  const handleConfirmClick = () => { 
    const metricsData = {
      postLink,
      followers,
      likes,
      reelsViews,
      storyViews,
      comments,
      commentLikes,
    };
    const newAlert = { id: uuidv4() };
    
    if (postLink == null || postLink == "") {
      setAlerts((prev) => [...prev, { id: Date.now(), type: "empty" }]);
    }
    else if (calculateTotal().toFixed(2) === "0.00") {
      setAlerts((prev) => [...prev, { id: Date.now(), type: "warning" }]);
    } else {
        const filteredMetricsData = Object.entries(metricsData).reduce((acc, [key, value]) => {
          if (key === 'postLink' && value !== "") {
            acc[key] = value;
          } else if (key !== 'postLink' && value !== 0 && value !== null && value !== undefined) {
            acc[key] = value;
          }
          return acc;
        }, {});
        const subtractCoins = async () => {
          try {
            const apiUrl = `https://boostify-server.vercel.app/api/subtractCoins?_id=${userData ? userData.id : 1011111}&amount=${calculateTotal().toFixed(2)}`;
            const requestBody = {
              social: "Instagram",
              userId: userData ? userData.id : 1011111,
              name: userData ? `${userData.first_name} ${userData.last_name}` : "Unknown User",
              amount: Number(calculateTotal().toFixed(2)),
              metrics: filteredMetricsData
            };
            const response = await fetch(apiUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(requestBody),
            });
            const result = await response.json();
            
            if (response.status == 200)
              setAlerts((prev) => [...prev, { id: Date.now(), type: "success" }]);
            else if (response.status == 400)
              setAlerts((prev) => [...prev, { id: Date.now(), type: "failure" }]);
            else
              setAlerts((prev) => [...prev, { id: Date.now(), type: "error" }]);
          }
          catch (error) {
            setAlerts((prev) => [...prev, { id: Date.now(), type: "error" }]);
          }
        }
        subtractCoins();
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
      <div className="overflow-hidden w-full h-full bg-gradient-main p-5 flex flex-col min-h-screen items-center text-black font-medium pb-[110px]">
        <div className="w-full flex justify-left items-center">
          <a href="/">
            <div
              style={{
                padding: "7px",
                borderRadius: "10px",
                border: "1px solid black",
              }}
            >
              <img src={back} alt="" height="20px" width="20px" />
            </div>
          </a>
        </div>
        <h1 className="w-full flex justify-center items-center text-black text-opacity-90 font-normal text-xl sm:text-2xl md:text-3xl">
          Instagram
        </h1>
        <h4 className="mt-2 w-[100%] justify-center items-center text-black text-opacity-40 text-center font-normal text-[13px] sm:text-[14px] md:text-[16px]">
          Note: Please complete the form below. The results will appear within a
          few minutes after the transaction is completed.
        </h4>
        <hr className="border-[1px] border-black w-[150%] opacity-40 mt-3" />
        <h1 className="w-full flex justify-left items-center text-black text-opacity-90 font-normal text-xl sm:text-2xl md:text-3xl mt-3">
          Content Info
        </h1>
        <h4 className="mt-1 w-[100%] justify-left items-center text-black text-opacity-40 font-normal text-[12px] sm:text-[14px] md:text-[16px]">
          Provide exact information to avoid interruptions.
        </h4>
        
        <div className="w-full flex justify-left items-center mt-3">
          <InputField
            placeholder={"Post Link"}
            type={"text"} 
            isCheckedInitially={false}
            onValueChange={(val) => setPostLink(val)}
            min={0} 
            max={0} 
          />
      </div>

        <h1 className="w-full flex justify-left items-center text-black text-opacity-90 font-normal text-xl sm:text-2xl md:text-3xl mt-4">
          Engagement Metrics
        </h1>
        <h4 className="mt-1 w-[100%] justify-left text-black text-opacity-40 font-normal text-[11px] sm:text-[14px] md:text-[16px]">
          Please check the box if you need specific metrics for the post.
        </h4>

        <div className="w-full flex justify-left items-center mt-3">
          <InputField
            placeholder={"Number of Followers"}
            type={"number"}
            isCheckedInitially={true}
            onValueChange={(val) => setFollowers(Number(val))}
            min={10}
            max={50000}
          />
        </div>
        <h4 className="mt-2 w-[100%] justify-left text-black text-opacity-60 font-normal text-[11px] sm:text-[14px] md:text-[16px]">
          (Minimum: 10 ; Maximum: 50,000)
        </h4>

        <div className="w-full flex justify-left items-center mt-3">
          <InputField
            placeholder={"Likes Count"}
            type={"number"}
            isCheckedInitially={true}
            onValueChange={(val) => setLikes(Number(val))}
            min={50}
            max={50000}
          />
        </div>
        <h4 className="mt-2 w-[100%] justify-left text-black text-opacity-60 font-normal text-[11px] sm:text-[14px] md:text-[16px]">
          (Minimum: 50 ; Maximum: 50,000)
        </h4>

        <div className="w-full flex justify-left items-center mt-3">
          <InputField
            placeholder={"Reels Views"}
            type={"number"}
            isCheckedInitially={true}
            onValueChange={(val) => setReelsViews(Number(val))}
            min={100}
            max={100000}
          />
        </div>
        <h4 className="mt-2 w-[100%] justify-left text-black text-opacity-60 font-normal text-[11px] sm:text-[14px] md:text-[16px]">
          (Minimum: 100 ; Maximum: 100,000)
        </h4>

        <div className="w-full flex justify-left items-center mt-3">
          <InputField
            placeholder={"Story Views"}
            type={"number"}
            isCheckedInitially={true}
            onValueChange={(val) => setStoryViews(Number(val))}
            min={10}
            max={100000}
          />
        </div>
        <h4 className="mt-2 w-[100%] justify-left text-black text-opacity-60 font-normal text-[11px] sm:text-[14px] md:text-[16px]">
          (Minimum: 10 ; Maximum: 100,000)
        </h4>

        <div className="w-full flex justify-left items-center mt-3">
          <InputField
            placeholder={"Comments"}
            type={"number"}
            isCheckedInitially={true}
            onValueChange={(val) => setComments(Number(val))}
            min={10}
            max={5000}
          />
        </div>
        <h4 className="mt-2 w-[100%] justify-left text-black text-opacity-60 font-normal text-[11px] sm:text-[14px] md:text-[16px]">
          (Minimum: 10 ; Maximum: 5,000)
        </h4>

        <div className="w-full flex justify-left items-center mt-3">
          <InputField
            placeholder={"Comment Likes"}
            type={"number"}
            isCheckedInitially={true}
            onValueChange={(val) => setCommentLikes(Number(val))}
            min={50}
            max={10000}
          />
        </div>
        <h4 className="mt-2 w-[100%] justify-left text-black text-opacity-60 font-normal text-[11px] sm:text-[14px] md:text-[16px]">
          (Minimum: 50 ; Maximum: 10,000)
        </h4>

        <div className="w-full flex justify-center mt-4">
          {/* <button className="bg-blue-500 text-white py-2 px-4 rounded-lg">
            Confirm - ${calculateTotal().toFixed(2)}
          </button> */}
          <Confirm
            onClick={handleConfirmClick}
            text={`Confirm - $${calculateTotal().toFixed(2)}`}
          />
        </div>
        {alerts.map((alert) => (
          <div key={alert.id} className="fixed top-3 alert">
            {alert.type === "empty" && <Warning message="Fill Post Link"/>}
            {alert.type === "warning" && <Warning message="Choose any Service"/>}
            {alert.type === "failure" && <Failure message = "Insufficient Funds"/>}
            {alert.type == "error" && <Failure message="Error Occurred"/>}
            {alert.type === "success" && (
              <Success amount={calculateTotal().toFixed(2)} />
            )}
          </div>
        ))}
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
}

export default Insta;
