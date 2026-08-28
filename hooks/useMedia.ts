"use client";

import { useEffect, useState } from "react";

export const MD_MIN = 768;
export const LG_MIN = 1024;
export const SHORT_MAX = 500;

export function useViewport() {
  const [phone, setPhone] = useState(false);
  const [wide, setWide] = useState(false);
  const [short, setShort] = useState(false);

  useEffect(() => {
    const update = () => {
      setPhone(window.innerWidth < MD_MIN);
      setWide(window.innerWidth >= LG_MIN);
      setShort(window.innerHeight < SHORT_MAX);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return { phone, wide, short };
}
