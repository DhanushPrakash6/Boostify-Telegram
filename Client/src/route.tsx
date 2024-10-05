import { Route, Routes } from "react-router-dom";
import Index from "./utils/pages/Index.tsx";
import Insta from "./utils/script/subfile/insta.tsx";
import Telegram from "./utils/script/subfile/telegram.tsx";
import Youtube from "./utils/script/subfile/youtube.tsx";
import X from "./utils/script/subfile/x.tsx";
import Twitch from "./utils/script/subfile/twitch.tsx";
import Facebook from "./utils/script/subfile/facebook.tsx";
import Tiktok from "./utils/script/subfile/tiktok.tsx";
import Soundcloud from "./utils/script/subfile/soundcloud.tsx";
import Spotify from "./utils/script/subfile/spotify.tsx";
import Linkedin from "./utils/script/subfile/linkedin.tsx";
import Whatsapp from "./utils/script/subfile/whatsapp.tsx";
import Wifi from "./utils/script/subfile/wifi.tsx";
import Orders from "./utils/pages/order.tsx";

  function App() {
    return (
      <Routes>
        <Route element={<Index />} path="/" />
        <Route element={<Orders />} path="/orders" />
        <Route element={<Insta />} path="/subfile/instagram" />
        <Route element={<Telegram />} path="/subfile/telegram" />
        <Route element={<Youtube />} path="/subfile/youtube" />
        <Route element={<X />} path="/subfile/X" />
        <Route element={<Twitch />} path="/subfile/twitch" />
        <Route element={<Facebook />} path="/subfile/facebook" />
        <Route element={<Tiktok />} path="/subfile/tiktok" />
        <Route element={<Soundcloud />} path="/subfile/soundcloud" />
        <Route element={<Spotify />} path="/subfile/spotify" />
        <Route element={<Linkedin />} path="/subfile/linkedin" />
        <Route element={<Whatsapp />} path="/subfile/whatsapp" />
        <Route element={<Wifi />} path="/subfile/wifi" />
      </Routes>
    );
  }; 

export default App;
