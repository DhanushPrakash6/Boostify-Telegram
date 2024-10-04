import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import InputField from "../component/input";
import Confirm from "../component/confirm";
import Success from "../component/success";
import Failure from "../component/fail";
import Warning from "../component/warning";
import { back } from "../../../images";
import { home } from "../../../images";
import { group } from "../../../images";
import { podium } from "../../../images";
import { fund } from "../../../images";

function Insta() {
  const [followers, setFollowers] = useState(0);
  const [likes, setLikes] = useState(0);
  const [reelsViews, setReelsViews] = useState(0);
  const [storyViews, setStoryViews] = useState(0);
  const [comments, setComments] = useState(0);
  const [commentLikes, setCommentLikes] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [coinValue, setCoinValue] = useState<number>(0);

  const calculateTotal = () => {
    return (
      (followers * 0.05 +
        likes * 0.01 +
        reelsViews * 0.005 +
        storyViews * 0.05 +
        comments * 0.2 +
        commentLikes * 0.01)
    );
  };

  useEffect(() => {
    if (WebApp?.initDataUnsafe?.user) {
      const user = WebApp.initDataUnsafe.user as UserData;
      setUserData(user);
      // Uncomment and implement fetchUserCoins if needed
      // fetchUserCoins(user.id);
    }
  }, []);

  const handleConfirmClick = () => {
    const total = calculateTotal().toFixed(2);
    const newAlert = { id: uuidv4() };

    if (total === "0.00") {
      setAlerts((prev) => [...prev, { id: Date.now(), type: "warning" }]);
    } else {
      const subtractCoins = async () => {
        try {
          const apiUrl = `https://boostify-server.vercel.app/api/subtractCoins?_id=${userData ? userData.id : 1011111}&amount=${total}`;
          const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });
          const result = await response.json();

          if (result.message === 200) {
            setAlerts((prev) => [...prev, { id: Date.now(), type: "success" }]);
          } else if (result.message === 400) {
            setAlerts((prev) => [...prev, { id: Date.now(), type: "failure" }]);
          }
        } catch (error) {
          setAlerts((prev) => [...prev, { id: Date.now(), type: "error" }]);
        }
      };
      subtractCoins();
    }

    // Clean up alerts after 5 seconds
    setTimeout(() => {
      setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== newAlert.id));
    }, 5000);

    // Limit the number of alerts to 5
    if (alerts.length >= 5) {
      setAlerts((prevAlerts) => prevAlerts.slice(1));
    }
  };

  return (
    <div className="overflow-hidden w-full h-full bg-gradient-main p-5 flex flex-col min-h-screen items-center text-black font-medium pb-[110px]">
      <div className="w-full flex justify-left items-center">
        <a href="/">
          <div style={{ padding: "7px", borderRadius: "10px", border: "1px solid black" }}>
            <img src={back} alt="Back" height="20px" width="20px" />
          </div>
        </a>
      </div>
      <h1 className="w-full flex justify-center items-center text-black text-opacity-90 font-normal text-xl sm:text-2xl md:text-3xl">Instagram</h1>
      <h4 className="mt-2 w-full justify-center items-center text-black text-opacity-40 text-center font-normal text-[13px] sm:text-[14px] md:text-[16px]">
        Note: Please complete the form below. The results will appear within a few minutes after the transaction is completed.
      </h4>
      <hr className="border-[1px] border-black w-full opacity-40 mt-3" />
      <h1 className="w-full flex justify-left items-center text-black text-opacity-90 font-normal text-xl sm:text-2xl md:text-3xl mt-3">Content Info</h1>
      <h4 className="mt-1 w-full justify-left items-center text-black text-opacity-40 font-normal text-[12px] sm:text-[14px] md:text-[16px]">
        Provide exact information to avoid interruptions.
      </h4>

      <div className="w-full flex justify-left items-center mt-3">
        <InputField placeholder="Post Link" type="name" isCheckedInitially={false} onValueChange={() => {}} min={0} max={0} />
      </div>

      <h1 className="w-full flex justify-left items-center text-black text-opacity-90 font-normal text-xl sm:text-2xl md:text-3xl mt-4">Engagement Metrics</h1>
      <h4 className="mt-1 w-full justify-left text-black text-opacity-40 font-normal text-[11px] sm:text-[14px] md:text-[16px]">
        Please check the box if you need specific metrics for the post.
      </h4>

      {/* Input Fields for Metrics */}
      {[
        { label: "Number of Followers", value: followers, setter: setFollowers, min: 10, max: 50000 },
        { label: "Likes Count", value: likes, setter: setLikes, min: 50, max: 50000 },
        { label: "Reels Views", value: reelsViews, setter: setReelsViews, min: 100, max: 100000 },
        { label: "Story Views", value: storyViews, setter: setStoryViews, min: 10, max: 100000 },
        { label: "Comments", value: comments, setter: setComments, min: 10, max: 5000 },
        { label: "Comment Likes", value: commentLikes, setter: setCommentLikes, min: 50, max: 10000 },
      ].map(({ label, value, setter, min, max }) => (
        <div key={label} className="w-full flex justify-left items-center mt-3">
          <InputField
            placeholder={label}
            type="number"
            isCheckedInitially={true}
            onValueChange={(val) => setter(Number(val))}
            min={min}
            max={max}
          />
          <h4 className="mt-2 w-full justify-left text-black text-opacity-60 font-normal text-[11px] sm:text-[14px] md:text-[16px]">
            (Minimum: {min} ; Maximum: {max})
          </h4>
        </div>
      ))}

      <div className="w-full flex justify-center mt-4">
        <Confirm onClick={handleConfirmClick} text={`Confirm - $${calculateTotal().toFixed(2)}`} />
      </div>
      
      {alerts.map((alert) => (
        <div key={alert.id} className="fixed top-3 alert">
          {alert.type === "warning" && <Warning />}
          {alert.type === "failure" && <Failure message="Insufficient Funds" />}
          {alert.type === "error" && <Failure message="Error Occurred" />}
          {alert.type === "success" && <Success amount={calculateTotal().toFixed(2)} />}
        </div>
      ))}

      <footer className="w-full flex justify-around items-center p-4 border-dashed border-t-2 border-black">
        {[home, group, podium, fund].map((src, index) => (
          <a key={index} href="/" className={`flex flex-col items-center ${index === 0 ? "border-2 border-black" : ""}`}>
            <img src={src} alt={`Icon ${index + 1}`} className={`h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 ${index === 0 ? "opacity-100" : "opacity-80"}`} />
          </a>
        ))}
      </footer>
    </div>
  );
}

export default Insta;
