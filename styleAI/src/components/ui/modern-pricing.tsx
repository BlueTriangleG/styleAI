"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Star, Zap, Crown, Sparkles } from "lucide-react";

// Pulse Button Component
interface PulseButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "premium";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

const PulseButton = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  className = "",
  ...props
}: PulseButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const variants = {
    primary: {
      background: "bg-gradient-to-r from-pink-100 via-rose-200 to-pink-200",
      hover: "hover:from-pink-200 hover:via-rose-300 hover:to-pink-300",
      text: "text-gray-700",
      border: "border-pink-200/50",
    },
    secondary: {
      background: "bg-gradient-to-r from-gray-100 to-gray-200",
      hover: "hover:from-gray-200 hover:to-gray-300",
      text: "text-gray-800",
      border: "border-gray-300/50",
    },
    premium: {
      background: "bg-gradient-to-r from-pink-200 via-rose-300 to-pink-300",
      hover: "hover:from-pink-300 hover:via-rose-400 hover:to-pink-400",
      text: "text-gray-800",
      border: "border-pink-300/50",
    },
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const variantStyle = variants[variant];
  const sizeStyle = sizes[size];

  return (
    <button
      className={`
        relative font-medium rounded-xl border transition-all duration-300
        ${variantStyle.background} ${variantStyle.hover} ${variantStyle.text} 
        ${variantStyle.border} ${sizeStyle} ${className}
        ${fullWidth ? "w-full" : ""}
        hover:scale-105 hover:-translate-y-0.5
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-300
        ${disabled || loading ? "opacity-50 cursor-not-allowed" : ""}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={disabled || loading}
      {...props}>
      {loading ? "Processing..." : children}
    </button>
  );
};

// Pricing Tier Interface
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

// Pricing Card Component
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
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      {/* Popular Badge */}
      {tier.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-gradient-to-r from-pink-400 to-rose-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            <Star size={14} />
            Most Popular
          </div>
        </div>
      )}

      <motion.div
        className={`relative h-full p-8 rounded-3xl border border-pink-200/30 backdrop-blur-sm ${tier.gradient} transition-all duration-500`}
        style={{
          background: isHovered ? tier.hoverGradient : tier.gradient,
          transform: isHovered ? "translateY(-8px)" : "translateY(0px)",
          boxShadow: isHovered
            ? "0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 30px rgba(236, 72, 153, 0.1)"
            : "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
        }}>
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-pink-300/20 to-rose-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>

        <div className="relative z-10">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-white/50 backdrop-blur-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-pink-200/30">
            {tier.icon}
          </div>

          {/* Plan name */}
          <h3 className="text-2xl font-bold text-gray-800 mb-2">{tier.name}</h3>
          <p className="text-gray-600 text-sm mb-4">{tier.description}</p>

          {/* Price */}
          <div className="mb-6">
            <span className="text-4xl font-bold text-gray-800">
              ${tier.price}
            </span>
            <span className="text-gray-600 ml-2">one-time</span>
          </div>

          {/* Credits */}
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 mb-6 border border-pink-200/30">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-800">
                {tier.credits.toLocaleString()}
              </div>
              <div className="text-gray-600 text-sm">Credits</div>
            </div>
          </div>

          {/* Features */}
          <ul className="space-y-3 mb-8">
            {tier.features.map((feature, idx) => (
              <li key={idx} className="flex items-center text-gray-700">
                <Check size={16} className="text-pink-500 mr-3 flex-shrink-0" />
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
      icon: <Zap className="w-8 h-8 text-pink-400" />,
      gradient: "bg-gradient-to-br from-white/90 to-pink-50/90",
      hoverGradient: "bg-gradient-to-br from-pink-50/90 to-pink-100/90",
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
      icon: <Sparkles className="w-8 h-8 text-rose-400" />,
      gradient: "bg-gradient-to-br from-pink-100/90 to-rose-100/90",
      hoverGradient: "bg-gradient-to-br from-pink-200/90 to-rose-200/90",
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
      icon: <Crown className="w-8 h-8 text-pink-500" />,
      gradient: "bg-gradient-to-br from-rose-100/90 to-pink-200/90",
      hoverGradient: "bg-gradient-to-br from-rose-200/90 to-pink-300/90",
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
    <div className="min-h-screen relative">
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16">
          <h1 className="text-[#000000] text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold mb-4 font-playfair">
            Purchase
          </h1>
          <h1 className="text-[#FF9999] text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 font-playfair">
            STYLE-AI Credits
          </h1>
          <p className="text-[#333333] font-light text-sm sm:text-base md:text-lg lg:text-xl max-w-3xl mx-auto">
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
            className="bg-red-100/80 border border-red-300/50 text-red-700 px-6 py-4 rounded-2xl mb-8 backdrop-blur-sm">
            {error}
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-100/80 border border-green-300/50 text-green-700 px-6 py-4 rounded-2xl mb-8 backdrop-blur-sm">
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
          <p className="text-gray-600 text-sm mb-4">
            Credits never expire and can be used for any style recommendation
            service.
          </p>
          <p className="text-gray-600 text-sm">
            Need more credits? Contact us for custom packages at{" "}
            <a
              href="mailto:support@stylerecommend.ai"
              className="text-pink-600 underline hover:text-pink-700 transition-colors">
              support@stylerecommend.ai
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ModernPricingPage;
