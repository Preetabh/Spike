"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { applyTheme } from "../../lib/theme";

import Layout from "../components/layout/Layout";
import SettingHome from "../components/models/settingHome";



export default function ProtectedLayout({ children }) {
  const [openSettings, setOpenSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState("preferences");

  const fetchUser = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/users/me`, {
      credentials: "include",
    });
    const data = await res.json();
    return data?.data;
  };

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: fetchUser,
  });

  useEffect(() => {
    if (user) {
      applyTheme(
        user.appearanceMode || user.appearance?.mode || "dark",
        user.theme || user.appearance?.theme || "rose"
      );
    }
  }, [user]);

  return (
    <>
      {/* 🔥 MAIN LAYOUT */}
      <Layout onOpenSettings={(tab = "preferences") => {
        setSettingsTab(tab);
        setOpenSettings(true);
      }}>
        {children}
      </Layout>

      {/* 🔥 SETTINGS MODAL */}
      {openSettings && (
        <SettingHome initialTab={settingsTab} onClose={() => setOpenSettings(false)} />
      )}
    </>
  );
}
