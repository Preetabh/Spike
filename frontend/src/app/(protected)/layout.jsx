"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { applyTheme } from "../../lib/theme";

import Layout from "../components/layout/Layout";
import SettingHome from "../components/models/settingHome";



export default function ProtectedLayout({ children }) {
  const [openSettings, setOpenSettings] = useState(false);

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
    if (user?.appearance) {
      applyTheme(user.appearance.mode, user.appearance.theme);
    }
  }, [user]);

  return (
    <>
      {/* 🔥 MAIN LAYOUT */}
      <Layout onOpenSettings={() => setOpenSettings(true)}>
        {children}
      </Layout>

      {/* 🔥 SETTINGS MODAL */}
      {openSettings && (
        <SettingHome onClose={() => setOpenSettings(false)} />
      )}
    </>
  );
}
