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
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 shadow-lg mb-[120px]">
              <h2 className="text-xl font-bold mb-4 text-center">Referred Users</h2>
              {referralInfo.referredUsers.length > 0 ? (
                <div className="space-y-3">
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
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">👥</div>
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