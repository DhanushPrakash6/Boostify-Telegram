"use client";
import WebApp from "@twa-dev/sdk";
import { useEffect, useState } from "react";
import "../styles/index.css";

interface UserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code: string;
  is_premium?: boolean;
}

export default function Home() {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const user = WebApp?.initDataUnsafe?.user
      ? (WebApp.initDataUnsafe.user as UserData)
      : null;
    setUserData(user);

    const userToInsert = {
          _id: user ? user.id : 1011111,
          name: user ? `${user.first_name} ${user.last_name}` : "Unknown User",
          coins: user ? 0 : 10000000
        }

    const insertUserData = async () => {
      try {
        const apiUrl = "https://boostify-server.vercel.app/api/insertUser";

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userToInsert),
        });
        const result = await response.json();
        console.log("User document inserted:", result);
      } catch (err) {
        console.error("Error inserting user data:", err);
      }
    };

 
    insertUserData();
  }, []);

  return (
    <main className="p-4">
      {userData ? (
        <h1
          className="font-semibold text-sm"
          style={{ margin: "0px", padding: "0px" }}
        >
          {userData.first_name} {userData.last_name}
        </h1>
      ) : (
        <h1 className="font-semibold text-sm">Unknown User</h1>
      )}
    </main>
  );
}