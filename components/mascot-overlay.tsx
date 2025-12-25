"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"

type MascotEmotion = "Happy" | "Normal" | "Angry" | "Sad"

interface MascotOverlayProps {
  emotion?: MascotEmotion
  showMessage?: string | null
  className?: string
  position?: "bottom-left" | "bottom-right" | "top-left" | "top-right"
}

export default function MascotOverlay({
  emotion = "Happy",
  showMessage,
  className = "",
  position = "bottom-right",
}: MascotOverlayProps) {
  const [currentEmotion, setCurrentEmotion] = useState<MascotEmotion>(emotion)
  const [displayMessage, setDisplayMessage] = useState<string | null>(showMessage || null)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    setCurrentEmotion(emotion)
  }, [emotion])

  useEffect(() => {
    setDisplayMessage(showMessage || null)
    if (showMessage) {
      const timer = setTimeout(() => {
        setDisplayMessage(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showMessage])

  const positionClasses = {
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
  }

  if (!isVisible) return null

  return (
    <div className={`fixed ${positionClasses[position]} z-40 ${className}`}>
      {/* Mascot with shadow */}
      <div className="relative">
        {/* Speech bubble message */}
        {displayMessage && (
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg whitespace-nowrap text-sm font-semibold text-gray-800 animate-bounce">
            {displayMessage}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white"></div>
          </div>
        )}

        {/* Mascot image */}
        <div className="relative w-24 h-24 drop-shadow-xl hover:scale-110 transition-transform duration-300 cursor-pointer">
          <Image
            src={`/mascot/${currentEmotion}.png`}
            alt={`Mascot - ${currentEmotion}`}
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-xl -z-10"></div>
      </div>

      {/* Interaction hint */}
      <div className="mt-2 text-center text-xs text-gray-500 font-medium">
        {currentEmotion === "Happy" && "Doing great! 🎉"}
        {currentEmotion === "Normal" && "Keep going! 💪"}
        {currentEmotion === "Sad" && "Try again! 🌟"}
        {currentEmotion === "Angry" && "Be careful! ⚠️"}
      </div>
    </div>
  )
}

// Context for mascot state management
export const MascotContext = React.createContext<{
  setEmotion: (emotion: MascotEmotion) => void
  setMessage: (message: string | null) => void
  emotion: MascotEmotion
  message: string | null
} | null>(null)

export function MascotProvider({ children }: { children: React.ReactNode }) {
  const [emotion, setEmotion] = useState<MascotEmotion>("Happy")
  const [message, setMessage] = useState<string | null>(null)

  return (
    <MascotContext.Provider value={{ setEmotion, setMessage, emotion, message }}>
      {children}
      <MascotOverlay emotion={emotion} showMessage={message} />
    </MascotContext.Provider>
  )
}

// Hook to use mascot context
export function useMascot() {
  const context = React.useContext(MascotContext)
  if (!context) {
    throw new Error("useMascot must be used within MascotProvider")
  }
  return context
}
