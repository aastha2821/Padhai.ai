"use client"

import React, { useEffect, useRef, useState } from "react"

const SAMPLE_QUESTIONS = [
  { question: "What planet is closest to the Sun?", options: ["Venus", "Mercury", "Earth", "Mars"], correct: 1 },
  { question: "How many moons does Earth have?", options: ["0", "1", "2", "3"], correct: 1 },
  { question: "What is 7 × 8?", options: ["54", "56", "58", "60"], correct: 1 },
  { question: "Which is the largest planet?", options: ["Saturn", "Jupiter", "Neptune", "Uranus"], correct: 1 },
  { question: "What is the speed of light?", options: ["299,792 km/s", "150,000 km/s", "500,000 km/s", "1,000,000 km/s"], correct: 0 },
]

export default function SpaceShooterQuiz() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [showQuestion, setShowQuestion] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<any>(null)
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [feedbackType, setFeedbackType] = useState("")
  const [questions, setQuestions] = useState(SAMPLE_QUESTIONS)

  const gameStateRef = useRef({
    boardWidth: 400,
    boardHeight: 500,
    shipX: 185,
    shipY: 450,
    shipWidth: 30,
    shipHeight: 30,
    bullets: [] as any[],
    asteroids: [] as any[],
    gameOver: false,
    score: 0,
    questionActive: false,
    context: null as any,
    keys: {} as any,
  })

  useEffect(() => {
    const storedQuestions = localStorage.getItem("kidQuizQuestions")
    if (storedQuestions) {
      try {
        const parsed = JSON.parse(storedQuestions)
        if (parsed && parsed.length > 0) {
          setQuestions(parsed)
        }
      } catch (e) {
        console.error("Failed to parse questions")
      }
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const state = gameStateRef.current
    state.context = ctx

    const spawnAsteroid = () => {
      if (state.gameOver || state.questionActive) return
      
      const x = Math.random() * (state.boardWidth - 40)
      const hasQuestion = Math.random() > 0.5
      
      state.asteroids.push({
        x,
        y: -30,
        width: 30,
        height: 30,
        speed: 1 + Math.random() * 2,
        hasQuestion,
        hit: false,
      })
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      state.keys[e.key] = true
      if (e.key === " " && !state.questionActive) {
        state.bullets.push({
          x: state.shipX + state.shipWidth / 2 - 2,
          y: state.shipY,
          width: 4,
          height: 10,
          speed: 8,
        })
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      state.keys[e.key] = false
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    const update = () => {
      if (state.gameOver || state.questionActive) return

      ctx.fillStyle = "#0a0a1a"
      ctx.fillRect(0, 0, state.boardWidth, state.boardHeight)

      // Draw stars
      for (let i = 0; i < 50; i++) {
        const x = (i * 37) % state.boardWidth
        const y = (i * 53) % state.boardHeight
        ctx.fillStyle = "white"
        ctx.fillRect(x, y, 2, 2)
      }

      // Move ship
      if (state.keys["ArrowLeft"] && state.shipX > 0) {
        state.shipX -= 5
      }
      if (state.keys["ArrowRight"] && state.shipX < state.boardWidth - state.shipWidth) {
        state.shipX += 5
      }

      // Draw ship
      ctx.fillStyle = "#3b82f6"
      ctx.beginPath()
      ctx.moveTo(state.shipX + state.shipWidth / 2, state.shipY)
      ctx.lineTo(state.shipX, state.shipY + state.shipHeight)
      ctx.lineTo(state.shipX + state.shipWidth, state.shipY + state.shipHeight)
      ctx.closePath()
      ctx.fill()

      // Update and draw bullets
      state.bullets = state.bullets.filter((bullet) => {
        bullet.y -= bullet.speed
        ctx.fillStyle = "#fbbf24"
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height)
        return bullet.y > 0
      })

      // Update and draw asteroids
      state.asteroids = state.asteroids.filter((asteroid) => {
        if (asteroid.hit) return false

        asteroid.y += asteroid.speed

        // Check collision with ship
        if (
          asteroid.x < state.shipX + state.shipWidth &&
          asteroid.x + asteroid.width > state.shipX &&
          asteroid.y < state.shipY + state.shipHeight &&
          asteroid.y + asteroid.height > state.shipY
        ) {
          state.gameOver = true
          setGameOver(true)
          return false
        }

        // Check collision with bullets
        for (let i = 0; i < state.bullets.length; i++) {
          const bullet = state.bullets[i]
          if (
            bullet.x < asteroid.x + asteroid.width &&
            bullet.x + bullet.width > asteroid.x &&
            bullet.y < asteroid.y + asteroid.height &&
            bullet.y + bullet.height > asteroid.y
          ) {
            asteroid.hit = true
            state.bullets.splice(i, 1)

            if (asteroid.hasQuestion) {
              state.questionActive = true
              const storedQ = localStorage.getItem("kidQuizQuestions")
              const currentQuestions = storedQ ? JSON.parse(storedQ) : SAMPLE_QUESTIONS
              const question = currentQuestions[Math.floor(Math.random() * currentQuestions.length)]
              setCurrentQuestion(question)
              setShowQuestion(true)
              setFeedbackMessage("")
              setFeedbackType("")
            } else {
              state.score += 10
              setScore(state.score)
            }
            return false
          }
        }

        // Draw asteroid
        ctx.fillStyle = asteroid.hasQuestion ? "#f59e0b" : "#ef4444"
        ctx.beginPath()
        ctx.arc(asteroid.x + asteroid.width / 2, asteroid.y + asteroid.height / 2, asteroid.width / 2, 0, Math.PI * 2)
        ctx.fill()

        if (asteroid.hasQuestion) {
          ctx.fillStyle = "#fff"
          ctx.font = "bold 14px Arial"
          ctx.fillText("?", asteroid.x + 10, asteroid.y + 20)
        }

        return asteroid.y < state.boardHeight
      })

      // Draw score
      ctx.fillStyle = "white"
      ctx.font = "bold 18px Arial"
      ctx.fillText("Score: " + state.score, 10, 30)
    }

    const asteroidSpawner = setInterval(spawnAsteroid, 1500)
    const gameLoop = setInterval(update, 1000 / 60)

    return () => {
      clearInterval(gameLoop)
      clearInterval(asteroidSpawner)
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
      state.score += 50
      setScore(state.score)
      setFeedbackType("success")
      setFeedbackMessage("🎉 Correct! +50 points!")
    } else {
      setFeedbackType("error")
      setFeedbackMessage("❌ Wrong! Correct: " + currentQuestion.options[currentQuestion.correct])
    }

    setTimeout(() => {
      setShowQuestion(false)
      state.questionActive = false
      setFeedbackMessage("")
    }, 2000)
  }

  const resetGame = () => {
    const state = gameStateRef.current
    state.shipX = 185
    state.bullets = []
    state.asteroids = []
    state.gameOver = false
    state.score = 0
    state.questionActive = false
    setScore(0)
    setGameOver(false)
    setShowQuestion(false)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-white text-center">
        <div className="text-2xl font-bold mb-2">Space Shooter Quiz 🚀</div>
        <div className="text-sm text-gray-400">Arrow keys to move, Space to shoot. Hit asteroids with ? for questions!</div>
        <div className="text-lg font-semibold mt-2">Score: {score}</div>
      </div>

      <canvas
        ref={canvasRef}
        width={400}
        height={500}
        className="border-2 border-blue-500 rounded-lg shadow-lg"
      />

      {gameOver && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border-2 border-red-500/50 text-center">
            <div className="text-4xl mb-4">💥</div>
            <h2 className="text-2xl font-bold text-white mb-2">Ship Destroyed!</h2>
            <p className="text-gray-400 mb-4">Final Score: {score}</p>
            <button onClick={resetGame} className="btn-3d-orange px-6 py-3 rounded-full font-semibold">
              Play Again
            </button>
          </div>
        </div>
      )}

      {showQuestion && currentQuestion && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border-2 border-orange-500/50 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">{currentQuestion.question}</h3>
            <div className="space-y-2">
              {currentQuestion.options.map((option: string, index: number) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className="w-full p-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-left transition-all border border-white/20 hover:border-blue-500"
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
