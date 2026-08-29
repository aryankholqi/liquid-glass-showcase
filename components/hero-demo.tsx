"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { LiquidGlass } from "@/components/liquid-glass";
import { HERO_CONFIG, INSTALL_COMMAND } from "@/lib/props";

export function Typewriter() {
  const [shown, setShown] = useState("");

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(INSTALL_COMMAND.slice(0, i));
      if (i >= INSTALL_COMMAND.length) clearInterval(id);
    }, 34);
    return () => clearInterval(id);
  }, []);

  return (
    <code>
      {shown}
      <span className="caret" />
    </code>
  );
}

export function HeroDemo() {
  const stageRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={stageRef}
      className="stage"
    >
      <div className="stage-bg" />
      <span className="g1" />
      <span className="g2" />
      <div className="stage-note">refraction · depth · dispersion</div>
      <motion.div className="hero-card" >
        <LiquidGlass {...HERO_CONFIG}>
          <div className="card-body">
            <div className="card-row">
              <span className="card-title">Now Playing</span>
              <span className="card-time">
                02:14
              </span>
            </div>
            <div className="card-track">
              <i />
            </div>
            <div className="card-keys">
              <i />
              <i />
              <i />
            </div>
          </div>
        </LiquidGlass>
      </motion.div>
    </div>
  );
}
