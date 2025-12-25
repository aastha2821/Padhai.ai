"use client"

import React, { useEffect, useRef, useState } from "react"

const SAMPLE_QUESTIONS = [
  { question: "What is 3 × 4?", options: ["10", "11", "12", "13"], correct: 2 },
  { question: "What color is the sky?", options: ["Red", "Blue", "Green", "Yellow"], correct: 1 },
  { question: "How many days in a week?", options: ["5", "6", "7", "8"], correct: 2 },
  { question: "What is the capital of USA?", options: ["New York", "Los Angeles", "Washington DC", "Chicago"], correct: 2 },
  { question: "Which animal says 'Meow'?", options: ["Dog", "Cat", "Cow", "Bird"], correct: 1 },
]

export default function SnakeQuiz() {
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
    boardHeight: 400,
    blockSize: 20,
    snake: [{ x: 200, y: 200 }],
    food: { x: 0, y: 0, hasQuestion: false },
    direction: { x: 0, y: 0 },
    nextDirection: { x: 0, y: 0 },
    gameOver: false,
    score: 0,
    questionActive: false,
    context: null as any,
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

    const placeFood = () => {
      state.food.x = Math.floor(Math.random() * (state.boardWidth / state.blockSize)) * state.blockSize
      state.food.y = Math.floor(Math.random() * (state.boardHeight / state.blockSize)) * state.blockSize
      state.food.hasQuestion = Math.random() > 0.3 // 70% chance of question
    }

    placeFood()

    const handleKeyPress = (e: KeyboardEvent) => {
      if (state.questionActive) return
      
      if (e.key === "ArrowUp" && state.direction.y === 0) {
        state.nextDirection = { x: 0, y: -state.blockSize }
      } else if (e.key === "ArrowDown" && state.direction.y === 0) {
        state.nextDirection = { x: 0, y: state.blockSize }
      } else if (e.key === "ArrowLeft" && state.direction.x === 0) {
        state.nextDirection = { x: -state.blockSize, y: 0 }
      } else if (e.key === "ArrowRight" && state.direction.x === 0) {
        state.nextDirection = { x: state.blockSize, y: 0 }
      }
    }

    window.addEventListener("keydown", handleKeyPress)

    const update = () => {
      if (state.gameOver || state.questionActive) return

      state.direction = state.nextDirection

      if (state.direction.x === 0 && state.direction.y === 0) return

      ctx.fillStyle = "#1a1a2e"
      ctx.fillRect(0, 0, state.boardWidth, state.boardHeight)

      // Draw grid
      ctx.strokeStyle = "#2a2a3e"
      for (let i = 0; i < state.boardWidth; i += state.blockSize) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, state.boardHeight)
        ctx.stroke()
      }
      for (let i = 0; i < state.boardHeight; i += state.blockSize) {
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(state.boardWidth, i)
        ctx.stroke()
      }

      // Move snake
      const newHead = {
        x: state.snake[0].x + state.direction.x,
        y: state.snake[0].y + state.direction.y,
      }

      // Check wall collision
      if (
        newHead.x < 0 ||
        newHead.x >= state.boardWidth ||
        newHead.y < 0 ||
        newHead.y >= state.boardHeight
      ) {
        state.gameOver = true
        setGameOver(true)
        return
      }

      // Check self collision
      for (let segment of state.snake) {
        if (newHead.x === segment.x && newHead.y === segment.y) {
          state.gameOver = true
          setGameOver(true)
          return
        }
      }

      state.snake.unshift(newHead)

      // Check food collision
      if (newHead.x === state.food.x && newHead.y === state.food.y) {
        if (state.food.hasQuestion) {
          // Show question
          state.questionActive = true
          const storedQ = localStorage.getItem("kidQuizQuestions")
          const currentQuestions = storedQ ? JSON.parse(storedQ) : SAMPLE_QUESTIONS
          const question = currentQuestions[Math.floor(Math.random() * currentQuestions.length)]
          setCurrentQuestion(question)
          setShowQuestion(true)
          setFeedbackMessage("")
          setFeedbackType("")
        } else {
          // No question, just grow
          state.score += 5
          setScore(state.score)
        }
        placeFood()
      } else {
        state.snake.pop()
      }

      // Draw food
      if (state.food.hasQuestion) {
        ctx.fillStyle = "#fbbf24"
        ctx.fillRect(state.food.x, state.food.y, state.blockSize, state.blockSize)
        ctx.fillStyle = "#fff"
        ctx.font = "bold 12px Arial"
        ctx.fillText("?", state.food.x + 6, state.food.y + 15)
      } else {
        ctx.fillStyle = "#ef4444"
        ctx.fillRect(state.food.x, state.food.y, state.blockSize, state.blockSize)
      }

      // Draw snake
      state.snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? "#10b981" : "#34d399"
        ctx.fillRect(segment.x, segment.y, state.blockSize, state.blockSize)
        ctx.strokeStyle = "#059669"
        ctx.strokeRect(segment.x, segment.y, state.blockSize, state.blockSize)
      })

      // Draw score
      ctx.fillStyle = "white"
      ctx.font = "bold 16px Arial"
      ctx.fillText("Score: " + state.score, 10, 20)
      ctx.fillText("Length: " + state.snake.length, 10, 40)
    }

    const gameLoop = setInterval(update, 150)

    return () => {
      clearInterval(gameLoop)
      window.removeEventListener("keydown", handleKeyPress)
    }
  }, [])

  const handleAnswer = (selectedIndex: number) => {
    const state = gameStateRef.current
    // Fix: Convert both to numbers for comparison
    const correctAnswer = Number(currentQuestion.correct)
    const userAnswer = Number(selectedIndex)
    const correct = correctAnswer === userAnswer

    if (correct) {
      state.score += 20
      setScore(state.score)
      setFeedbackType("success")
      setFeedbackMessage("🎉 Correct! +20 points!")
      // Snake grows by 2
      for (let i = 0; i < 2; i++) {
        const tail = state.snake[state.snake.length - 1]
        state.snake.push({ ...tail })
      }
    } else {
      setFeedbackType("error")
      setFeedbackMessage("❌ Wrong! The correct answer was: " + currentQuestion.options[currentQuestion.correct])
    }

    setTimeout(() => {
      setShowQuestion(false)
      state.questionActive = false
      setFeedbackMessage("")
    }, 2000)
  }

  const resetGame = () => {
    const state = gameStateRef.current
    state.snake = [{ x: 200, y: 200 }]
    state.direction = { x: 0, y: 0 }
    state.nextDirection = { x: 0, y: 0 }
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
        <div className="text-2xl font-bold mb-2">Snake Quiz 🐍</div>
        <div className="text-sm text-gray-400">Use arrow keys to move. Eat food with ? to answer questions!</div>
        <div className="text-lg font-semibold mt-2">Score: {score}</div>
      </div>

      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="border-2 border-purple-500 rounded-lg shadow-lg"
      />

      {gameOver && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border-2 border-red-500/50 text-center">
            <div className="text-4xl mb-4">💀</div>
            <h2 className="text-2xl font-bold text-white mb-2">Game Over!</h2>
            <p className="text-gray-400 mb-4">Final Score: {score}</p>
            <button onClick={resetGame} className="btn-3d-orange px-6 py-3 rounded-full font-semibold">
              Play Again
            </button>
          </div>
        </div>
      )}

      {showQuestion && currentQuestion && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border-2 border-yellow-500/50 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">{currentQuestion.question}</h3>
            <div className="space-y-2">
              {currentQuestion.options.map((option: string, index: number) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className="w-full p-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-left transition-all border border-white/20 hover:border-purple-500"
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
