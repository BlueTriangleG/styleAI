"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Star, Zap, Crown, Sparkles } from "lucide-react";

// Background Gradient Animation Component
const BackgroundGradientAnimation = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  return (
    <div className="fixed inset-0 overflow-hidden bg-gradient-to-br from-gray-900 via-cyan-900 to-indigo-900">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-violet-600/20 animate-pulse"></div>
      <div className="absolute inset-0 bg-gradient-to-l from-blue-600/20 to-purple-600/20 animate-pulse delay-1000"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/20 to-pink-600/20 animate-pulse delay-2000"></div>
      {children}
    </div>
  );
};

// Pulse Button Component
interface PulseButtonProps {
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "premium";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  onClick?: () => void;
}

const PulseButton = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  className = "",
  onClick,
}: PulseButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const variantStyles = {
    primary:
      "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-cyan-400",
    secondary:
      "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white border-gray-500",
    premium:
      "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white border-violet-400",
  };

  const sizeStyles = {
    sm: "text-sm px-4 py-2 rounded-lg",
    md: "text-base px-6 py-3 rounded-xl",
    lg: "text-lg px-8 py-4 rounded-2xl",
  };

  return (
    <button
      className={`
        relative group font-semibold border border-opacity-30 select-none 
        inline-flex items-center justify-center transition-all duration-300
        ${variantStyles[variant]} ${sizeStyles[size]} 
        ${fullWidth ? "w-full" : ""} ${className} 
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        overflow-hidden
      `}
      disabled={disabled || loading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={{
        boxShadow: isHovered ? "0 0 25px rgba(139, 92, 246, 0.6)" : "none",
      }}>
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
          {children && <span>{children}</span>}
        </div>
      ) : (
        children
      )}
    </button>
  );
};

// Pricing Card Component
interface PricingTier {
  id: string;
  name: string;
  price: number;
  credits: number;
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
  gradient: string;
  hoverGradient: string;
  description: string;
}

interface PricingCardProps {
  tier: PricingTier;
  index: number;
  onPurchase: (tierId: string) => void;
  loading: string | null;
}

const PricingCard = ({
  tier,
  index,
  onPurchase,
  loading,
}: PricingCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      {tier.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-gradient-to-r from-pink-400 to-violet-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            <Star size={14} />
            Most Popular
          </div>
        </div>
      )}

      <motion.div
        className={`relative h-full p-8 rounded-3xl border border-white/10 backdrop-blur-sm transition-all duration-500`}
        style={{
          background: isHovered ? tier.hoverGradient : tier.gradient,
          transform: isHovered ? "translateY(-8px)" : "translateY(0px)",
          boxShadow: isHovered
            ? "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(139, 92, 246, 0.3)"
            : "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
        }}>
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-600/20 to-violet-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>

        <div className="relative z-10">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            {tier.icon}
          </div>

          {/* Plan name */}
          <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
          <p className="text-white/70 text-sm mb-4">{tier.description}</p>

          {/* Price */}
          <div className="mb-6">
            <span className="text-4xl font-bold text-white">${tier.price}</span>
            <span className="text-white/70 ml-2">one-time</span>
          </div>

          {/* Credits */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                {tier.credits.toLocaleString()}
              </div>
              <div className="text-white/70 text-sm">Credits</div>
            </div>
          </div>

          {/* Features */}
          <ul className="space-y-3 mb-8">
            {tier.features.map((feature, idx) => (
              <li key={idx} className="flex items-center text-white/90">
                <Check
                  size={16}
                  className="text-green-400 mr-3 flex-shrink-0"
                />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          {/* CTA Button */}
          <PulseButton
            variant={tier.popular ? "premium" : "primary"}
            size="lg"
            fullWidth
            loading={loading === tier.id}
            onClick={() => onPurchase(tier.id)}
            className="group-hover:scale-105 transition-transform duration-300">
            {loading === tier.id ? "Processing..." : "Purchase Credits"}
          </PulseButton>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Main Pricing Component
interface ModernPricingPageProps {
  onPurchase: (tierId: string) => void;
  loading: string | null;
  error: string | null;
  successMessage: string | null;
}

const ModernPricingPage = ({
  onPurchase,
  loading,
  error,
  successMessage,
}: ModernPricingPageProps) => {
  const pricingTiers: PricingTier[] = [
    {
      id: "basic",
      name: "Basic",
      price: 5,
      credits: 50,
      description: "Perfect for getting started",
      icon: <Zap className="w-8 h-8 text-cyan-400" />,
      gradient: "bg-gradient-to-br from-gray-800/80 to-gray-900/80",
      hoverGradient: "bg-gradient-to-br from-gray-700/80 to-gray-800/80",
      features: [
        "Access to style recommendations",
        "Basic report generation",
        "Standard processing",
        "Email support",
      ],
    },
    {
      id: "standard",
      name: "Standard",
      price: 10,
      credits: 120,
      description: "20% bonus credits",
      popular: true,
      icon: <Sparkles className="w-8 h-8 text-blue-400" />,
      gradient: "bg-gradient-to-br from-blue-800/80 to-indigo-900/80",
      hoverGradient: "bg-gradient-to-br from-blue-700/80 to-indigo-800/80",
      features: [
        "Access to style recommendations",
        "Detailed reports",
        "Priority processing",
        "Advanced analytics",
        "Priority support",
      ],
    },
    {
      id: "premium",
      name: "Premium",
      price: 50,
      credits: 700,
      description: "40% bonus credits",
      icon: <Crown className="w-8 h-8 text-violet-400" />,
      gradient: "bg-gradient-to-br from-violet-800/80 to-purple-900/80",
      hoverGradient: "bg-gradient-to-br from-violet-700/80 to-purple-800/80",
      features: [
        "Access to style recommendations",
        "Premium reports",
        "Priority processing",
        "Extended history",
        "24/7 support",
        "Custom integrations",
      ],
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundGradientAnimation>
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-16 pt-24">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent">
              Purchase Style AI Credits
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Get personalized style recommendations with our premium credits
              system. Choose a package that suits your needs and enhance your
              style journey.
            </p>
          </motion.div>

          {/* Error/Success Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/20 border border-red-500/30 text-red-200 px-6 py-4 rounded-2xl mb-8 backdrop-blur-sm">
              {error}
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-500/20 border border-green-500/30 text-green-200 px-6 py-4 rounded-2xl mb-8 backdrop-blur-sm">
              {successMessage}
            </motion.div>
          )}

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
            {pricingTiers.map((tier, index) => (
              <PricingCard
                key={tier.id}
                tier={tier}
                index={index}
                onPurchase={onPurchase}
                loading={loading}
              />
            ))}
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center mt-16">
            <p className="text-white/60 text-sm mb-4">
              Credits never expire and can be used for any style recommendation
              service.
            </p>
            <p className="text-white/60 text-sm">
              Need more credits? Contact us for custom packages at{" "}
              <a
                href="mailto:support@stylerecommend.ai"
                className="text-cyan-400 underline hover:text-cyan-300 transition-colors">
                support@stylerecommend.ai
              </a>
            </p>
          </motion.div>
        </div>
      </BackgroundGradientAnimation>
    </div>
  );
};

export default ModernPricingPage;
