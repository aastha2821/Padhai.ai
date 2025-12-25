"use client"

import React, { useEffect, useRef, useState } from "react"

const SAMPLE_QUESTIONS = [
  { question: "What is 12 ÷ 3?", options: ["3", "4", "5", "6"], correct: 1 },
  { question: "What color is grass?", options: ["Blue", "Green", "Red", "Yellow"], correct: 1 },
  { question: "How many wheels on a car?", options: ["2", "3", "4", "5"], correct: 2 },
  { question: "What is 15 - 7?", options: ["6", "7", "8", "9"], correct: 2 },
  { question: "Which is faster: car or bicycle?", options: ["Car", "Bicycle", "Same", "Neither"], correct: 0 },
]

export default function RacingQuiz() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [showQuestion, setShowQuestion] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<any>(null)
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [feedbackType, setFeedbackType] = useState("")
  const [questions, setQuestions] = useState(SAMPLE_QUESTIONS)
  const [checkpoints, setCheckpoints] = useState(0)

  const gameStateRef = useRef({
    boardWidth: 400,
    boardHeight: 600,
    carX: 175,
    carY: 500,
    carWidth: 50,
    carHeight: 80,
    roadOffset: 0,
    obstacles: [] as any[],
    checkpoints: [] as any[],
    speed: 3,
    gameOver: false,
    score: 0,
    checkpointsCollected: 0,
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

    const spawnObstacle = () => {
      if (state.gameOver || state.questionActive) return

      const lanes = [100, 175, 250]
      const lane = lanes[Math.floor(Math.random() * lanes.length)]

      state.obstacles.push({
        x: lane,
        y: -80,
        width: 40,
        height: 60,
      })
    }

    const spawnCheckpoint = () => {
      if (state.gameOver || state.questionActive) return

      const lanes = [100, 175, 250]
      const lane = lanes[Math.floor(Math.random() * lanes.length)]

      state.checkpoints.push({
        x: lane,
        y: -80,
        width: 50,
        height: 50,
        collected: false,
      })
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!state.questionActive) {
        state.keys[e.key] = true
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      state.keys[e.key] = false
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    const update = () => {
      if (state.gameOver || state.questionActive) return

      // Clear canvas
      ctx.fillStyle = "#2d3748"
      ctx.fillRect(0, 0, state.boardWidth, state.boardHeight)

      // Draw road
      state.roadOffset += state.speed
      if (state.roadOffset > 40) state.roadOffset = 0

      // Road markings
      ctx.fillStyle = "#4a5568"
      ctx.fillRect(70, 0, 5, state.boardHeight)
      ctx.fillRect(325, 0, 5, state.boardHeight)

      // Road lines
      ctx.strokeStyle = "#fff"
      ctx.lineWidth = 3
      ctx.setLineDash([20, 20])
      for (let i = -state.roadOffset; i < state.boardHeight; i += 40) {
        ctx.beginPath()
        ctx.moveTo(145, i)
        ctx.lineTo(145, i + 20)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(255, i)
        ctx.lineTo(255, i + 20)
        ctx.stroke()
      }
      ctx.setLineDash([])

      // Move car
      if (state.keys["ArrowLeft"] && state.carX > 80) {
        state.carX -= 4
      }
      if (state.keys["ArrowRight"] && state.carX < 320 - state.carWidth) {
        state.carX += 4
      }

      // Draw car
      ctx.fillStyle = "#ef4444"
      ctx.fillRect(state.carX, state.carY, state.carWidth, state.carHeight)
      ctx.fillStyle = "#1e40af"
      ctx.fillRect(state.carX + 5, state.carY + 10, state.carWidth - 10, 30)
      ctx.fillStyle = "#000"
      ctx.fillRect(state.carX + 5, state.carY + 60, 10, 15)
      ctx.fillRect(state.carX + 35, state.carY + 60, 10, 15)

      // Update and draw obstacles
      state.obstacles = state.obstacles.filter((obstacle) => {
        obstacle.y += state.speed

        // Check collision with car
        if (
          obstacle.x < state.carX + state.carWidth &&
          obstacle.x + obstacle.width > state.carX &&
          obstacle.y < state.carY + state.carHeight &&
          obstacle.y + obstacle.height > state.carY
        ) {
          state.gameOver = true
          setGameOver(true)
          return false
        }

        // Draw obstacle (other car)
        ctx.fillStyle = "#9333ea"
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height)
        ctx.fillStyle = "#4c1d95"
        ctx.fillRect(obstacle.x + 5, obstacle.y + 10, obstacle.width - 10, 20)

        return obstacle.y < state.boardHeight
      })

      // Update and draw checkpoints
      state.checkpoints = state.checkpoints.filter((checkpoint) => {
        if (checkpoint.collected) return false

        checkpoint.y += state.speed

        // Check collection
        if (
          checkpoint.x < state.carX + state.carWidth &&
          checkpoint.x + checkpoint.width > state.carX &&
          checkpoint.y < state.carY + state.carHeight &&
          checkpoint.y + checkpoint.height > state.carY
        ) {
          checkpoint.collected = true
          state.questionActive = true
          state.checkpointsCollected++
          setCheckpoints(state.checkpointsCollected)

          const storedQ = localStorage.getItem("kidQuizQuestions")
          const currentQuestions = storedQ ? JSON.parse(storedQ) : SAMPLE_QUESTIONS
          const question = currentQuestions[Math.floor(Math.random() * currentQuestions.length)]
          setCurrentQuestion(question)
          setShowQuestion(true)
          setFeedbackMessage("")
          setFeedbackType("")
          return false
        }

        // Draw checkpoint (flag)
        ctx.fillStyle = "#fbbf24"
        ctx.fillRect(checkpoint.x, checkpoint.y, checkpoint.width, checkpoint.height)
        ctx.fillStyle = "#000"
        ctx.font = "bold 20px Arial"
        ctx.fillText("🏁", checkpoint.x + 12, checkpoint.y + 35)

        return checkpoint.y < state.boardHeight
      })

      // Draw score
      ctx.fillStyle = "white"
      ctx.font = "bold 18px Arial"
      ctx.fillText("Score: " + state.score, 10, 30)
      ctx.fillText("Checkpoints: " + state.checkpointsCollected, 10, 55)
    }

    const obstacleSpawner = setInterval(spawnObstacle, 2000)
    const checkpointSpawner = setInterval(spawnCheckpoint, 5000)
    const gameLoop = setInterval(update, 1000 / 60)

    return () => {
      clearInterval(gameLoop)
      clearInterval(obstacleSpawner)
      clearInterval(checkpointSpawner)
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
      state.score += 30
      setScore(state.score)
      setFeedbackType("success")
      setFeedbackMessage("🎉 Correct! +30 points! Keep racing!")
      state.speed = Math.min(state.speed + 0.5, 8) // Increase speed
    } else {
      setFeedbackType("error")
      setFeedbackMessage("❌ Wrong! Correct: " + currentQuestion.options[currentQuestion.correct])
      state.speed = Math.max(state.speed - 0.3, 2) // Decrease speed
    }

    setTimeout(() => {
      setShowQuestion(false)
      state.questionActive = false
      setFeedbackMessage("")
    }, 2000)
  }

  const resetGame = () => {
    const state = gameStateRef.current
    state.carX = 175
    state.obstacles = []
    state.checkpoints = []
    state.speed = 3
    state.gameOver = false
    state.score = 0
    state.checkpointsCollected = 0
    state.questionActive = false
    setScore(0)
    setCheckpoints(0)
    setGameOver(false)
    setShowQuestion(false)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-white text-center">
        <div className="text-2xl font-bold mb-2">Racing Quiz 🏎️</div>
        <div className="text-sm text-gray-400">Arrow keys to steer. Collect checkpoints 🏁 to answer questions!</div>
        <div className="text-lg font-semibold mt-2">
          Score: {score} | Checkpoints: {checkpoints}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={400}
        height={600}
        className="border-2 border-red-500 rounded-lg shadow-lg"
      />

      {gameOver && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border-2 border-red-500/50 text-center">
            <div className="text-4xl mb-4">💥</div>
            <h2 className="text-2xl font-bold text-white mb-2">Crashed!</h2>
            <p className="text-gray-400 mb-2">Final Score: {score}</p>
            <p className="text-gray-400 mb-4">Checkpoints: {checkpoints}</p>
            <button onClick={resetGame} className="btn-3d-orange px-6 py-3 rounded-full font-semibold">
              Race Again
            </button>
          </div>
        </div>
      )}

      {showQuestion && currentQuestion && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border-2 border-yellow-500/50 max-w-md w-full">
            <div className="text-center mb-4">
              <div className="text-3xl mb-2">🏁</div>
              <h3 className="text-xl font-bold text-white">Checkpoint Question!</h3>
            </div>
            <h3 className="text-lg font-semibold text-white mb-4">{currentQuestion.question}</h3>
            <div className="space-y-2">
              {currentQuestion.options.map((option: string, index: number) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className="w-full p-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-left transition-all border border-white/20 hover:border-red-500"
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
