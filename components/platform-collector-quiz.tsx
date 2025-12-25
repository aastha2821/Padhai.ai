"use client"

import React, { useEffect, useRef, useState } from "react"

const SAMPLE_QUESTIONS = [
  { question: "What is 6 × 9?", options: ["52", "54", "56", "58"], correct: 1 },
  { question: "Capital of France?", options: ["London", "Paris", "Berlin", "Rome"], correct: 1 },
  { question: "Largest mammal?", options: ["Elephant", "Blue Whale", "Giraffe", "Bear"], correct: 1 },
  { question: "What is 25 - 13?", options: ["10", "11", "12", "13"], correct: 2 },
  { question: "Primary colors count?", options: ["2", "3", "4", "5"], correct: 1 },
]

export default function PlatformCollectorQuiz() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [coinsCollected, setCoinsCollected] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [showQuestion, setShowQuestion] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<any>(null)
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [feedbackType, setFeedbackType] = useState("")

  const gameStateRef = useRef({
    player: { x: 50, y: 250, width: 30, height: 30, velocityY: 0, isJumping: false },
    platforms: [
      { x: 0, y: 360, width: 600, height: 40 },      // Ground - full width, taller
      { x: 100, y: 280, width: 150, height: 20 },    // Platform 1
      { x: 300, y: 200, width: 150, height: 20 },    // Platform 2
      { x: 100, y: 120, width: 200, height: 20 },    // Platform 3 (top)
    ],
    coins: [] as any[],
    enemies: [] as any[],
    score: 0,
    coinsCollected: 0,
    gameOver: false,
    questionActive: false,
    keys: {} as any,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const state = gameStateRef.current

    // Spawn coins on platforms (not on ground)
    state.platforms.forEach((platform, idx) => {
      if (idx > 0) { // Skip ground
        // Add 2 coins per platform
        const coin1X = platform.x + 30
        const coin2X = platform.x + platform.width - 50
        const coinY = platform.y - 35
        
        state.coins.push(
          { x: coin1X, y: coinY, collected: false, hasQuestion: false },
          { x: coin2X, y: coinY, collected: false, hasQuestion: true } // One with question per platform
        )
      }
    })

    // Spawn enemies - simpler movement
    state.enemies.push(
      { x: 120, y: 255, width: 25, height: 25, direction: 1, speed: 0.8, minX: 100, maxX: 220 },
      { x: 320, y: 175, width: 25, height: 25, direction: -1, speed: 1, minX: 300, maxX: 420 }
    )

    const handleKeyDown = (e: KeyboardEvent) => {
      state.keys[e.key] = true
      if (e.key === " " && !state.player.isJumping && !state.questionActive) {
        state.player.velocityY = -13
        state.player.isJumping = true
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      state.keys[e.key] = false
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    const draw = () => {
      if (state.gameOver || state.questionActive) return

      // Sky background with gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, 400)
      gradient.addColorStop(0, "#87CEEB")
      gradient.addColorStop(1, "#E0F6FF")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 600, 400)

      // Draw platforms
      state.platforms.forEach((platform, idx) => {
        ctx.fillStyle = idx === 0 ? "#654321" : "#8B4513" // Ground darker
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height)
        ctx.strokeStyle = "#4a2511"
        ctx.lineWidth = 3
        ctx.strokeRect(platform.x, platform.y, platform.width, platform.height)
        
        // Add grass on top for ground
        if (idx === 0) {
          ctx.fillStyle = "#22c55e"
          ctx.fillRect(platform.x, platform.y, platform.width, 5)
        }
      })

      // Draw coins with better visibility
      state.coins.forEach((coin) => {
        if (!coin.collected) {
          // Outer glow
          ctx.shadowColor = coin.hasQuestion ? "#f59e0b" : "#fbbf24"
          ctx.shadowBlur = 10
          
          ctx.fillStyle = coin.hasQuestion ? "#f59e0b" : "#fbbf24"
          ctx.beginPath()
          ctx.arc(coin.x + 10, coin.y + 10, 12, 0, Math.PI * 2)
          ctx.fill()
          
          ctx.shadowBlur = 0
          
          // Inner shine
          ctx.fillStyle = "rgba(255, 255, 255, 0.6)"
          ctx.beginPath()
          ctx.arc(coin.x + 8, coin.y + 8, 4, 0, Math.PI * 2)
          ctx.fill()
          
          if (coin.hasQuestion) {
            ctx.fillStyle = "#000"
            ctx.font = "bold 16px Arial"
            ctx.fillText("?", coin.x + 5, coin.y + 17)
          }
        }
      })

      // Draw enemies
      state.enemies.forEach((enemy) => {
        ctx.fillStyle = "#dc2626"
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height)
        ctx.fillStyle = "#000"
        ctx.fillRect(enemy.x + 5, enemy.y + 8, 5, 5)
        ctx.fillRect(enemy.x + 15, enemy.y + 8, 5, 5)
      })

      // Draw player (simple character)
      ctx.fillStyle = "#10b981"
      ctx.fillRect(state.player.x, state.player.y, state.player.width, state.player.height)
      
      // Eyes
      ctx.fillStyle = "#000"
      ctx.fillRect(state.player.x + 8, state.player.y + 10, 5, 5)
      ctx.fillRect(state.player.x + 17, state.player.y + 10, 5, 5)
      
      // Smile
      ctx.strokeStyle = "#000"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(state.player.x + 15, state.player.y + 18, 6, 0, Math.PI)
      ctx.stroke()

      // Draw HUD
      ctx.fillStyle = "#000"
      ctx.font = "bold 16px Arial"
      ctx.fillText("Score: " + state.score, 10, 25)
      ctx.fillText("Coins: " + state.coinsCollected, 10, 45)

      // Update player physics
      state.player.velocityY += 0.7 // gravity

      if (state.keys["ArrowLeft"]) state.player.x -= 5
      if (state.keys["ArrowRight"]) state.player.x += 5

      state.player.x = Math.max(0, Math.min(600 - state.player.width, state.player.x))
      state.player.y += state.player.velocityY

      // Platform collision
      state.player.isJumping = true
      state.platforms.forEach((platform) => {
        if (
          state.player.x + state.player.width > platform.x &&
          state.player.x < platform.x + platform.width &&
          state.player.y + state.player.height <= platform.y &&
          state.player.y + state.player.height + state.player.velocityY >= platform.y
        ) {
          state.player.y = platform.y - state.player.height
          state.player.velocityY = 0
          state.player.isJumping = false
        }
      })

      // Bottom boundary
      if (state.player.y > 400) {
        state.gameOver = true
        setGameOver(true)
      }

      // Coin collection
      state.coins.forEach((coin) => {
        if (
          !coin.collected &&
          state.player.x + state.player.width > coin.x &&
          state.player.x < coin.x + 20 &&
          state.player.y + state.player.height > coin.y &&
          state.player.y < coin.y + 20
        ) {
          coin.collected = true
          state.coinsCollected++
          setCoinsCollected(state.coinsCollected)

          if (coin.hasQuestion) {
            state.questionActive = true
            const storedQ = localStorage.getItem("kidQuizQuestions")
            const questions = storedQ ? JSON.parse(storedQ) : SAMPLE_QUESTIONS
            const question = questions[Math.floor(Math.random() * questions.length)]
            setCurrentQuestion(question)
            setShowQuestion(true)
            setFeedbackMessage("")
            setFeedbackType("")
          } else {
            state.score += 5
            setScore(state.score)
          }
        }
      })

      // Enemy movement and collision
      state.enemies.forEach((enemy) => {
        enemy.x += enemy.direction * enemy.speed
        
        // Bounce at boundaries
        if (enemy.x <= enemy.minX || enemy.x >= enemy.maxX) {
          enemy.direction *= -1
        }

        if (
          state.player.x + state.player.width > enemy.x &&
          state.player.x < enemy.x + enemy.width &&
          state.player.y + state.player.height > enemy.y &&
          state.player.y < enemy.y + enemy.height
        ) {
          state.gameOver = true
          setGameOver(true)
        }
      })
    }

    const gameLoop = setInterval(draw, 1000 / 60)

    return () => {
      clearInterval(gameLoop)
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  const handleAnswer = (selectedIndex: number) => {
    const state = gameStateRef.current
    // Fix: Convert both to numbers for comparison
    const correctAnswer = Number(currentQuestion.correct)
    const userAnswer = Number(selectedIndex)
    const correct = correctAnswer === userAnswer

    if (correct) {
      state.score += 40
      setScore(state.score)
      setFeedbackType("success")
      setFeedbackMessage("🎉 Correct! +40 points!")
    } else {
      setFeedbackType("error")
      setFeedbackMessage("❌ Wrong! Correct: " + currentQuestion.options[correctAnswer])
    }

    setTimeout(() => {
      setShowQuestion(false)
      state.questionActive = false
      setFeedbackMessage("")
    }, 2000)
  }

  const resetGame = () => {
    window.location.reload()
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-white text-center">
        <div className="text-2xl font-bold mb-2">Platform Collector Quiz 🪙</div>
        <div className="text-sm text-gray-400">Jump between platforms and collect coins!</div>
        <div className="text-xs text-gray-500 mt-1">⭐ Regular coins = 5pts | ❓ Question coins = 40pts bonus</div>
        <div className="text-lg font-semibold mt-2">
          Score: {score} | Coins: {coinsCollected}/6
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className="border-2 border-yellow-500 rounded-lg shadow-lg"
      />

      <div className="text-gray-400 text-sm">Arrow keys to move • Space to jump</div>

      {gameOver && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border-2 border-red-500/50 text-center">
            <div className="text-4xl mb-4">💀</div>
            <h2 className="text-2xl font-bold text-white mb-2">Game Over!</h2>
            <p className="text-gray-400 mb-2">Final Score: {score}</p>
            <p className="text-gray-400 mb-4">Coins: {coinsCollected}</p>
            <button onClick={resetGame} className="btn-3d-orange px-6 py-3 rounded-full font-semibold">
              Play Again
            </button>
          </div>
        </div>
      )}

      {showQuestion && currentQuestion && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border-2 border-yellow-500/50 max-w-md w-full">
            <div className="text-center mb-4">
              <div className="text-3xl mb-2">🪙</div>
              <h3 className="text-xl font-bold text-white">Coin Bonus!</h3>
            </div>
            <h3 className="text-lg font-semibold text-white mb-4">{currentQuestion.question}</h3>
            <div className="space-y-2">
              {currentQuestion.options.map((option: string, index: number) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className="w-full p-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-left transition-all border border-white/20 hover:border-yellow-500"
                >
                  {option}
                </button>
              ))}
            </div>
            {feedbackMessage && (
              <div
                className={`mt-4 p-3 rounded-lg ${
                  feedbackType === "success" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                }`}
              >
                {feedbackMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
