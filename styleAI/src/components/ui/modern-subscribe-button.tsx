"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Link from "next/link";

interface ModernSubscribeButtonProps {
  href?: string;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "secondary" | "premium";
  size?: "sm" | "md" | "lg";
}

/**
 * Modern Subscribe Button Component
 * Features gradient effects, hover animations, and premium styling
 */
const ModernSubscribeButton = ({
  href = "/credits",
  onClick,
  className = "",
  variant = "premium",
  size = "md",
}: ModernSubscribeButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const variants = {
    primary: {
      background: "bg-gradient-to-r from-blue-500 to-purple-600",
      hover: "hover:from-blue-600 hover:to-purple-700",
      text: "text-white",
      border: "border-blue-400/30",
      glow: "shadow-blue-500/25",
      hoverGlow: "hover:shadow-blue-500/40",
    },
    secondary: {
      background: "bg-gradient-to-r from-gray-100 to-gray-200",
      hover: "hover:from-gray-200 hover:to-gray-300",
      text: "text-gray-800",
      border: "border-gray-300/50",
      glow: "shadow-gray-400/20",
      hoverGlow: "hover:shadow-gray-400/30",
    },
    premium: {
      background: "bg-gradient-to-r from-pink-100 via-rose-200 to-pink-200",
      hover: "hover:from-pink-200 hover:via-rose-300 hover:to-pink-300",
      text: "text-gray-700",
      border: "border-pink-200/50",
      glow: "shadow-pink-200/30",
      hoverGlow: "hover:shadow-pink-300/40",
    },
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-2.5 text-base",
    lg: "px-8 py-3 text-lg",
  };

  const variantStyle = variants[variant];
  const sizeStyle = sizes[size];

  const buttonContent = (
    <motion.button
      className={`
        relative group font-medium rounded-xl border transition-all duration-300
        ${variantStyle.background} ${variantStyle.hover} ${variantStyle.text} 
        ${variantStyle.border} ${sizeStyle} ${className}
        shadow-lg ${variantStyle.glow} ${variantStyle.hoverGlow}
        hover:scale-105 hover:-translate-y-0.5
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-300
        overflow-hidden
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}>
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />

      {/* Sparkle animation */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}>
        <Sparkles
          className="absolute top-1 right-1 w-3 h-3 text-white/60 animate-pulse"
          style={{ animationDelay: "0s" }}
        />
        <Sparkles
          className="absolute bottom-1 left-1 w-2 h-2 text-white/40 animate-pulse"
          style={{ animationDelay: "0.5s" }}
        />
      </motion.div>

      {/* Button content */}
      <div className="relative flex items-center justify-center">
        <span className="font-semibold">Buy credit</span>
      </div>

      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
        initial={{ x: "-100%" }}
        animate={{ x: isHovered ? "200%" : "-100%" }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />
    </motion.button>
  );

  if (href && !onClick) {
    return (
      <Link href={href} className="inline-block">
        {buttonContent}
      </Link>
    );
  }

  return buttonContent;
};

export default ModernSubscribeButton;
