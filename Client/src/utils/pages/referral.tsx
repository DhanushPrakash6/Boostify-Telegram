import "../styles/index.css";
import { useState, useEffect } from "react";
import WebApp from "@twa-dev/sdk";
import Home from "./data.tsx";
import { StaticIcons } from "../../icons/StaticIcons";
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

interface ReferralInfo {
  referralCode: string;
  referralLink: string;
  referredUsers: Array<{
    userId: number;
    username: string;
    joinedAt: string;
  }>;
  referralEarnings: number;
  referredBy: {
    userId: number;
    username: string;
  } | null;
}

const Referral = () => { 
  const [userData, setUserData] = useState<UserData | null>(null);
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const user = WebApp?.initDataUnsafe?.user as UserData | undefined;
    
    if (user) {
      setUserData(user);
      fetchReferralInfo(user.id);
    } else {
      fetchReferralInfo(1011111);
    }
  }, []);

  const fetchReferralInfo = async (userId: number) => {
    try {
      console.log('Fetching referral info for user:', userId);
      const response = await fetch(
        `https://boostify-server.vercel.app/api/getReferralInfo?userId=${userId}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log('Referral info received:', data);
      setReferralInfo(data);
    } catch (error) {
      console.error("Error fetching referral info:", error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
        <h2 className="text-xl font-bold mt-3 text-center">Referral Program</h2>
                {referralInfo && (
          <div className="w-full flex flex-col gap-6 pt-5">
            {/* Earnings Section */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4 text-center">Your Earnings</h2>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  ${referralInfo.referralEarnings.toFixed(2)}
                </div>
                <p className="text-gray-200">Total earned from referrals</p>
              </div>
            </div>

            {/* Referral Code Section */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4 text-center">Your Referral Code</h2>
              <div className="bg-white bg-opacity-10 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold tracking-wider">{referralInfo.referralCode}</span>
                  <button
                    onClick={() => copyToClipboard(referralInfo.referralCode)}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg px-4 py-2 transition-all duration-200"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
              
              <div className="bg-white bg-opacity-10 rounded-xl p-4">
                <h3 className="text-lg font-semibold mb-2">Your Referral Link</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300 truncate mr-3 flex-1">{referralInfo.referralLink}</span>
                  <button
                    onClick={() => copyToClipboard(referralInfo.referralLink)}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg px-3 py-1 text-sm transition-all duration-200 flex-shrink-0"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            {/* How it works */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4 text-center">How It Works</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-white bg-opacity-20 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">1</div>
                  <div>
                    <h3 className="font-semibold">Share Your Link</h3>
                    <p className="text-sm text-gray-300">Send your referral link to friends</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-white bg-opacity-20 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">2</div>
                  <div>
                    <h3 className="font-semibold">They Join</h3>
                    <p className="text-sm text-gray-300">Friends sign up using your link</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-white bg-opacity-20 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">3</div>
                  <div>
                    <h3 className="font-semibold">You Earn</h3>
                    <p className="text-sm text-gray-300">Get 1% of their wallet recharges</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Referred Users Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-6 mb-[120px]">
              <h2 className="text-xl font-bold text-center">Referred Users</h2>
              {referralInfo.referredUsers.length > 0 ? (
                <div className="space-y-3 mt-3">
                  {referralInfo.referredUsers.map((user, index) => (
                    <div key={index} className="bg-white bg-opacity-10 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{user.username}</div>
                          <div className="text-sm text-gray-300">
                            Joined: {formatDate(user.joinedAt)}
                          </div>
                        </div>
                        <div className="text-green-400 font-semibold">
                          Active
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-6xl mb-4 flex justify-center items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" height="100px" width="100px" version="1.1" id="Layer_1" viewBox="0 0 490.2 490.2" xmlSpace="preserve">
                      <g>
                        <g>
                          <path style={{fill:"#2C2F33"}} d="M322.2,201.7v24.5c0,5.5,4.4,9.9,9.9,9.9s9.9-4.4,9.9-9.9v-24.5c0-8.2-3.6-15.9-9.9-21    c-18.8-15.4-38.8-26.6-48.2-31.5v-24.9c4.6-4.8,7.2-11.2,7.2-18V70.5c0-23.2-18.9-42.1-42.1-42.1h-7.7    c-23.2,0-42.1,18.9-42.1,42.1v35.8c0,6.8,2.6,13.2,7.2,18v24.8c-9.4,4.9-29.4,16.1-48.2,31.5c-6.3,5.2-9.9,12.8-9.9,21v24.5    c0,5.5,4.4,9.9,9.9,9.9s9.9-4.4,9.9-9.9v-24.5c0-2.2,1-4.3,2.7-5.7c21.4-17.6,44.5-29.3,49-31.4c3.9-1.9,6.4-6,6.4-10.3v-34.5    c0-3.3-1.7-6.4-4.4-8.2c-1.7-1.2-2.8-3.1-2.8-5.2V70.5c0-12.3,10-22.3,22.3-22.3h7.7c12.3,0,22.3,10,22.3,22.3v35.8    c0,2.1-1,4-2.8,5.2c-2.8,1.8-4.4,4.9-4.4,8.2v34.5c0,4.4,2.5,8.4,6.4,10.3c4.4,2.2,27.6,13.8,49,31.4    C321.2,197.3,322.2,199.4,322.2,201.7z"/>
                          <path style={{fill:"#2C2F33"}} d="M416.7,337.2c-2.8,1.8-4.4,4.9-4.4,8.2v34.5c0,4.4,2.5,8.4,6.4,10.3c4.4,2.2,27.6,13.9,49,31.4    c1.7,1.4,2.7,3.5,2.7,5.7v24.5c0,5.5,4.4,9.9,9.9,9.9s9.9-4.4,9.9-9.9v-24.5c0-8.2-3.6-15.9-9.9-21    c-18.8-15.4-38.8-26.6-48.2-31.5v-24.9c4.6-4.8,7.2-11.2,7.2-18v-35.8c0-23.2-18.9-42.1-42.1-42.1h-7.7    c-23.2,0-42.1,18.9-42.1,42.1v35.8c0,6.8,2.6,13.2,7.2,18v24.9c-9.4,4.9-29.4,16.1-48.2,31.5c-6.3,5.2-9.9,12.9-9.9,21v24.5    c0,5.5,4.4,9.9,9.9,9.9s9.9-4.4,9.9-9.9v-24.5c0-2.2,1-4.3,2.7-5.7c21.4-17.6,44.5-29.3,49-31.4c3.9-1.9,6.4-6,6.4-10.3v-34.5    c0-3.3-1.7-6.4-4.4-8.2c-1.7-1.2-2.8-3.1-2.8-5.2v-35.8c0-12.3,10-22.3,22.3-22.3h7.7c12.3,0,22.3,10,22.3,22.3V332    C419.5,334.1,418.5,336,416.7,337.2z"/>
                          <path style={{fill:"#2C2F33"}} d="M173.9,427.4v24.5c0,5.5,4.4,9.9,9.9,9.9s9.9-4.4,9.9-9.9v-24.5c0-8.2-3.6-15.9-9.9-21    C165,391,145,379.8,135.6,374.9V350c4.6-4.8,7.2-11.2,7.2-18v-35.8c0-23.2-18.9-42.1-42.1-42.1H93c-23.2,0-42.1,18.9-42.1,42.1    V332c0,6.8,2.6,13.2,7.2,18v24.9c-9.4,4.9-29.4,16.1-48.2,31.5c-6.3,5.2-9.9,12.8-9.9,21v24.5c0,5.5,4.4,9.9,9.9,9.9    s9.9-4.4,9.9-9.9v-24.5c0-2.2,1-4.3,2.7-5.7c21.4-17.6,44.5-29.3,49-31.4c4-1.9,6.4-5.9,6.4-10.3v-34.5c0-3.3-1.7-6.4-4.4-8.2    c-1.7-1.2-2.8-3.1-2.8-5.2v-35.8c0-12.3,10-22.3,22.3-22.3h7.7c12.3,0,22.3,10,22.3,22.3v35.8c0,2.1-1,4-2.8,5.2    c-2.8,1.8-4.4,4.9-4.4,8.2V380c0,4.4,2.5,8.4,6.4,10.3c4.4,2.2,27.6,13.8,49,31.4C172.9,423.1,173.9,425.1,173.9,427.4z"/>
                          <path style={{fill:"#3C92CA"}} d="M245.1,378.6c5.5,0,9.9-4.4,9.9-9.9v-13.3h1.1c18.7,0,34-15.2,34-34s-15.2-34-34-34h-22    c-7.8,0-14.2-6.4-14.2-14.2s6.4-14.1,14.2-14.1h38.7c5.5,0,9.9-4.4,9.9-9.9s-4.4-9.9-9.9-9.9h-17.9v-13.1c0-5.5-4.4-9.9-9.9-9.9    s-9.9,4.4-9.9,9.9v13.1h-1c-18.7,0-34,15.2-34,34c0,18.7,15.2,34,34,34h22c7.8,0,14.2,6.4,14.2,14.2c0,7.8-6.4,14.2-14.2,14.2    h-39.5c-5.5,0-9.9,4.4-9.9,9.9s4.4,9.9,9.9,9.9h18.6v13.3C235.2,374.2,239.6,378.6,245.1,378.6z"/>
                        </g>
                      </g>
                    </svg>
                  </div>
                  <p className="text-gray-300">No referred users yet</p>
                  <p className="text-sm text-gray-400 mt-2">Share your referral link to start earning!</p>
                </div>
              )}
            </div>
          </div>
        )} 

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
              item.alt === "Friends" ? "border-2 border-white border-opacity-30" : ""
            }`}
          >
                          <img
                src={item.src}
                alt={item.alt}
                className={`h-12 w-12 ${
                  item.alt === "Friends" ? "opacity-100" : "opacity-50"
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

export default Referral; 