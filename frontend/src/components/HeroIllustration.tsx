"use client"

import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export default function HeroIllustration() {
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-full h-full" />
  }

  const currentTheme = theme === "system" ? systemTheme : theme
  const isDark = currentTheme === "dark"

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative w-full h-full"
    >
      <svg
        viewBox="0 0 600 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Background decorative elements */}
        <motion.circle
          cx="150"
          cy="150"
          r="80"
          fill={isDark ? "rgba(59, 130, 246, 0.1)" : "rgba(191, 219, 254, 0.6)"}
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle
          cx="450"
          cy="120"
          r="60"
          fill={isDark ? "rgba(168, 85, 247, 0.1)" : "rgba(233, 213, 255, 0.6)"}
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.circle
          cx="500"
          cy="450"
          r="70"
          fill={isDark ? "rgba(236, 72, 153, 0.1)" : "rgba(252, 231, 243, 0.6)"}
          animate={{ scale: [1, 1.12, 1], opacity: [0.45, 0.65, 0.45] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />

        {/* Desk */}
        <motion.path
          d="M150 450 L450 450 L460 480 L140 480 Z"
          fill={isDark ? "#374151" : "#D1D5DB"}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        />

        {/* Chair */}
        <motion.g
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <ellipse cx="300" cy="380" rx="35" ry="15" fill={isDark ? "#4B5563" : "#9CA3AF"} />
          <rect x="285" y="320" width="30" height="60" rx="5" fill={isDark ? "#6B7280" : "#D1D5DB"} />
          <ellipse cx="300" cy="320" rx="40" ry="20" fill={isDark ? "#4B5563" : "#9CA3AF"} />
        </motion.g>

        {/* Person */}
        <motion.g
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          {/* Body */}
          <path
            d="M270 280 Q270 250 300 250 Q330 250 330 280 L330 360 L270 360 Z"
            fill={isDark ? "#6EE7B7" : "#10B981"}
          />
          
          {/* Head */}
          <circle cx="300" cy="230" r="25" fill={isDark ? "#FCA5A5" : "#F87171"} />
          
          {/* Hair */}
          <path
            d="M280 220 Q275 210 285 205 Q295 200 300 202 Q305 200 315 205 Q325 210 320 220 Z"
            fill={isDark ? "#1F2937" : "#374151"}
          />
          
          {/* Arms */}
          <motion.path
            d="M270 280 L240 320 L245 325 L272 290"
            fill={isDark ? "#6EE7B7" : "#10B981"}
            animate={{ d: ["M270 280 L240 320 L245 325 L272 290", "M270 280 L235 315 L240 320 L270 285", "M270 280 L240 320 L245 325 L272 290"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.path
            d="M330 280 L360 320 L355 325 L328 290"
            fill={isDark ? "#6EE7B7" : "#10B981"}
            animate={{ d: ["M330 280 L360 320 L355 325 L328 290", "M330 280 L365 315 L360 320 L330 285", "M330 280 L360 320 L355 325 L328 290"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          />
        </motion.g>

        {/* Laptop */}
        <motion.g
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          {/* Laptop base */}
          <path
            d="M220 430 L380 430 L390 450 L210 450 Z"
            fill={isDark ? "#1F2937" : "#6B7280"}
          />
          
          {/* Laptop screen */}
          <rect
            x="235"
            y="360"
            width="130"
            height="70"
            rx="3"
            fill={isDark ? "#111827" : "#374151"}
          />
          
          {/* Screen content */}
          <rect
            x="245"
            y="370"
            width="110"
            height="50"
            rx="2"
            fill={isDark ? "#1E3A8A" : "#DBEAFE"}
          />
          
          {/* Code lines on screen */}
          <motion.rect
            x="250"
            y="375"
            width="60"
            height="3"
            rx="1"
            fill={isDark ? "#60A5FA" : "#3B82F6"}
            animate={{ width: [60, 70, 60] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.rect
            x="250"
            y="383"
            width="80"
            height="3"
            rx="1"
            fill={isDark ? "#A78BFA" : "#8B5CF6"}
            animate={{ width: [80, 90, 80] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
          />
          <motion.rect
            x="250"
            y="391"
            width="70"
            height="3"
            rx="1"
            fill={isDark ? "#F472B6" : "#EC4899"}
            animate={{ width: [70, 85, 70] }}
            transition={{ duration: 2.2, repeat: Infinity, delay: 1 }}
          />
          <motion.rect
            x="250"
            y="399"
            width="65"
            height="3"
            rx="1"
            fill={isDark ? "#34D399" : "#10B981"}
            animate={{ width: [65, 75, 65] }}
            transition={{ duration: 2.7, repeat: Infinity, delay: 1.5 }}
          />
        </motion.g>

        {/* Floating icons */}
        <motion.g
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Document icon */}
          <rect
            x="420"
            y="200"
            width="50"
            height="60"
            rx="4"
            fill={isDark ? "#3B82F6" : "#60A5FA"}
            opacity="0.8"
          />
          <line x1="430" y1="215" x2="460" y2="215" stroke={isDark ? "#1E3A8A" : "#1E40AF"} strokeWidth="2" />
          <line x1="430" y1="225" x2="460" y2="225" stroke={isDark ? "#1E3A8A" : "#1E40AF"} strokeWidth="2" />
          <line x1="430" y1="235" x2="455" y2="235" stroke={isDark ? "#1E3A8A" : "#1E40AF"} strokeWidth="2" />
        </motion.g>

        <motion.g
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          {/* Chart icon */}
          <rect
            x="100"
            y="280"
            width="50"
            height="50"
            rx="4"
            fill={isDark ? "#8B5CF6" : "#A78BFA"}
            opacity="0.8"
          />
          <rect x="110" y="310" width="8" height="15" fill={isDark ? "#4C1D95" : "#5B21B6"} />
          <rect x="122" y="300" width="8" height="25" fill={isDark ? "#4C1D95" : "#5B21B6"} />
          <rect x="134" y="295" width="8" height="30" fill={isDark ? "#4C1D95" : "#5B21B6"} />
        </motion.g>

        <motion.g
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          {/* Target/Goal icon */}
          <circle cx="480" cy="320" r="25" fill={isDark ? "#EC4899" : "#F9A8D4"} opacity="0.8" />
          <circle cx="480" cy="320" r="18" fill={isDark ? "#BE185D" : "#DB2777"} opacity="0.6" />
          <circle cx="480" cy="320" r="10" fill={isDark ? "#9F1239" : "#BE185D"} />
        </motion.g>

        <motion.g
          animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          style={{ originX: "110px", originY: "400px" }}
        >
          {/* Book icon */}
          <rect
            x="90"
            y="380"
            width="40"
            height="50"
            rx="3"
            fill={isDark ? "#10B981" : "#6EE7B7"}
            opacity="0.8"
          />
          <line x1="110" y1="380" x2="110" y2="430" stroke={isDark ? "#065F46" : "#047857"} strokeWidth="2" />
        </motion.g>

        {/* Plant decoration */}
        <motion.g
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <ellipse cx="160" cy="445" rx="20" ry="8" fill={isDark ? "#6B7280" : "#9CA3AF"} />
          <path
            d="M160 445 Q155 420 150 410 Q145 400 140 395"
            stroke={isDark ? "#10B981" : "#34D399"}
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M160 445 Q165 425 168 415 Q170 405 172 395"
            stroke={isDark ? "#10B981" : "#34D399"}
            strokeWidth="3"
            fill="none"
          />
          <ellipse cx="140" cy="395" rx="8" ry="12" fill={isDark ? "#059669" : "#6EE7B7"} />
          <ellipse cx="172" cy="395" rx="8" ry="12" fill={isDark ? "#059669" : "#6EE7B7"} />
        </motion.g>

        {/* Coffee cup */}
        <motion.g
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 1.4 }}
        >
          <ellipse cx="400" cy="445" rx="15" ry="5" fill={isDark ? "#6B7280" : "#9CA3AF"} />
          <path
            d="M390 445 L392 425 L408 425 L410 445"
            fill={isDark ? "#EF4444" : "#FCA5A5"}
          />
          <path
            d="M410 430 Q420 430 420 435 Q420 440 410 440"
            stroke={isDark ? "#DC2626" : "#F87171"}
            strokeWidth="2"
            fill="none"
          />
          {/* Steam */}
          <motion.path
            d="M395 420 Q395 410 397 408"
            stroke={isDark ? "#9CA3AF" : "#D1D5DB"}
            strokeWidth="1.5"
            fill="none"
            opacity="0.6"
            animate={{ d: ["M395 420 Q395 410 397 408", "M395 420 Q397 410 395 408", "M395 420 Q395 410 397 408"] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.path
            d="M405 420 Q405 410 403 408"
            stroke={isDark ? "#9CA3AF" : "#D1D5DB"}
            strokeWidth="1.5"
            fill="none"
            opacity="0.6"
            animate={{ d: ["M405 420 Q405 410 403 408", "M405 420 Q403 410 405 408", "M405 420 Q405 410 403 408"] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
        </motion.g>
      </svg>
    </motion.div>
  )
}
