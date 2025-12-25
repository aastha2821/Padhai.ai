"use client"

import React, { useEffect, useRef, useState } from "react"

const SAMPLE_QUESTIONS = [
  { question: "What is 8 + 7?", options: ["13", "14", "15", "16"], correct: 2 },
  { question: "Which ocean is largest?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], correct: 3 },
  { question: "How many continents are there?", options: ["5", "6", "7", "8"], correct: 2 },
  { question: "What is the boiling point of water?", options: ["90°C", "100°C", "110°C", "120°C"], correct: 1 },
  { question: "Which planet is closest to sun?", options: ["Venus", "Mercury", "Earth", "Mars"], correct: 1 },
]

export default function BreakoutQuiz() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [showQuestion, setShowQuestion] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<any>(null)
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [feedbackType, setFeedbackType] = useState("")

  const gameStateRef = useRef({
    canvas: null as HTMLCanvasElement | null,
    ctx: null as CanvasRenderingContext2D | null,
    ballX: 200,
    ballY: 350,
    ballSpeedX: 3,
    ballSpeedY: -3,
    ballRadius: 8,
    paddleX: 150,
    paddleWidth: 100,
    paddleHeight: 15,
    paddleY: 380,
    bricks: [] as any[],
    brickRows: 5,
    brickCols: 8,
    brickWidth: 45,
    brickHeight: 20,
    brickPadding: 5,
    brickOffsetTop: 30,
    brickOffsetLeft: 12,
    score: 0,
    lives: 3,
    gameOver: false,
    gameWon: false,
    questionActive: false,
    keys: {} as any,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const state = gameStateRef.current
    state.canvas = canvas
    state.ctx = ctx

    // Initialize bricks
    for (let c = 0; c < state.brickCols; c++) {
      state.bricks[c] = []
      for (let r = 0; r < state.brickRows; r++) {
        state.bricks[c][r] = { x: 0, y: 0, status: 1, hasQuestion: Math.random() > 0.6 }
      }
    }

    const drawBall = () => {
      ctx.beginPath()
      ctx.arc(state.ballX, state.ballY, state.ballRadius, 0, Math.PI * 2)
      ctx.fillStyle = "#fbbf24"
      ctx.fill()
      ctx.closePath()
    }

    const drawPaddle = () => {
      ctx.fillStyle = "#3b82f6"
      ctx.fillRect(state.paddleX, state.paddleY, state.paddleWidth, state.paddleHeight)
    }

    const drawBricks = () => {
      for (let c = 0; c < state.brickCols; c++) {
        for (let r = 0; r < state.brickRows; r++) {
          if (state.bricks[c][r].status === 1) {
            const brickX = c * (state.brickWidth + state.brickPadding) + state.brickOffsetLeft
            const brickY = r * (state.brickHeight + state.brickPadding) + state.brickOffsetTop
            state.bricks[c][r].x = brickX
            state.bricks[c][r].y = brickY
            
            ctx.fillStyle = state.bricks[c][r].hasQuestion ? "#f59e0b" : "#8b5cf6"
            ctx.fillRect(brickX, brickY, state.brickWidth, state.brickHeight)
            
            if (state.bricks[c][r].hasQuestion) {
              ctx.fillStyle = "#fff"
              ctx.font = "bold 12px Arial"
              ctx.fillText("?", brickX + 18, brickY + 14)
            }
          }
        }
      }
    }

    const collisionDetection = () => {
      for (let c = 0; c < state.brickCols; c++) {
        for (let r = 0; r < state.brickRows; r++) {
          const b = state.bricks[c][r]
          if (b.status === 1) {
            if (
              state.ballX > b.x &&
              state.ballX < b.x + state.brickWidth &&
              state.ballY > b.y &&
              state.ballY < b.y + state.brickHeight
            ) {
              state.ballSpeedY = -state.ballSpeedY
              b.status = 0
              
              if (b.hasQuestion) {
                state.questionActive = true
                const storedQ = localStorage.getItem("kidQuizQuestions")
                const questions = storedQ ? JSON.parse(storedQ) : SAMPLE_QUESTIONS
                const question = questions[Math.floor(Math.random() * questions.length)]
                setCurrentQuestion(question)
                setShowQuestion(true)
                setFeedbackMessage("")
                setFeedbackType("")
              } else {
                state.score += 10
                setScore(state.score)
              }
              
              // Check win condition
              const remaining = state.bricks.flat().filter(brick => brick.status === 1).length
              if (remaining === 0) {
                state.gameWon = true
                setGameWon(true)
              }
            }
          }
        }
      }
    }

    const draw = () => {
      if (state.gameOver || state.gameWon || state.questionActive) return

      ctx.fillStyle = "#1a1a2e"
      ctx.fillRect(0, 0, 400, 400)

      drawBricks()
      drawBall()
      drawPaddle()

      // Draw score and lives
      ctx.fillStyle = "#fff"
      ctx.font = "16px Arial"
      ctx.fillText("Score: " + state.score, 8, 20)
      ctx.fillText("Lives: " + "❤️".repeat(state.lives), 300, 20)

      // Ball movement
      state.ballX += state.ballSpeedX
      state.ballY += state.ballSpeedY

      // Wall collision
      if (state.ballX + state.ballRadius > 400 || state.ballX - state.ballRadius < 0) {
        state.ballSpeedX = -state.ballSpeedX
      }
      if (state.ballY - state.ballRadius < 0) {
        state.ballSpeedY = -state.ballSpeedY
      }

      // Paddle collision
      if (
        state.ballY + state.ballRadius > state.paddleY &&
        state.ballX > state.paddleX &&
        state.ballX < state.paddleX + state.paddleWidth
      ) {
        state.ballSpeedY = -state.ballSpeedY
      }

      // Bottom collision (lose life)
      if (state.ballY + state.ballRadius > 400) {
        state.lives--
        setLives(state.lives)
        
        if (state.lives === 0) {
          state.gameOver = true
          setGameOver(true)
        } else {
          state.ballX = 200
          state.ballY = 350
          state.ballSpeedX = 3
          state.ballSpeedY = -3
        }
      }

      // Paddle movement
      if (state.keys["ArrowLeft"] && state.paddleX > 0) {
        state.paddleX -= 7
      }
      if (state.keys["ArrowRight"] && state.paddleX < 400 - state.paddleWidth) {
        state.paddleX += 7
      }

      collisionDetection()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      state.keys[e.key] = true
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      state.keys[e.key] = false
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

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
      state.score += 30
      setScore(state.score)
      setFeedbackType("success")
      setFeedbackMessage("🎉 Correct! +30 points!")
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
        <div className="text-2xl font-bold mb-2">Breakout Quiz 🧱</div>
        <div className="text-sm text-gray-400">Break bricks with orange ? to answer questions!</div>
        <div className="text-lg font-semibold mt-2">
          Score: {score} | Lives: {lives}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="border-2 border-orange-500 rounded-lg shadow-lg"
      />

      <div className="text-gray-400 text-sm">Arrow keys to move paddle</div>

      {gameOver && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border-2 border-red-500/50 text-center">
            <div className="text-4xl mb-4">💔</div>
            <h2 className="text-2xl font-bold text-white mb-2">Game Over!</h2>
            <p className="text-gray-400 mb-4">Final Score: {score}</p>
            <button onClick={resetGame} className="btn-3d-orange px-6 py-3 rounded-full font-semibold">
              Play Again
            </button>
          </div>
        </div>
      )}

      {gameWon && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border-2 border-green-500/50 text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-white mb-2">You Win!</h2>
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
                  className="w-full p-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-left transition-all border border-white/20 hover:border-orange-500"
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
