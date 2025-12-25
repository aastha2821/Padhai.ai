"use client"

import React, { useEffect, useRef, useState } from "react"

const SAMPLE_QUESTIONS = [
  { question: "What is the capital of Japan?", options: ["Beijing", "Tokyo", "Seoul", "Bangkok"], correct: 1 },
  { question: "What is 9 × 6?", options: ["52", "54", "56", "58"], correct: 1 },
  { question: "Which gas do plants absorb?", options: ["Oxygen", "CO2", "Nitrogen", "Hydrogen"], correct: 1 },
  { question: "How many sides in a hexagon?", options: ["5", "6", "7", "8"], correct: 1 },
  { question: "What is the smallest prime?", options: ["0", "1", "2", "3"], correct: 2 },
]

interface Card {
  id: number
  value: string
  matched: boolean
  flipped: boolean
  x: number
  y: number
}

export default function PuzzleMatchQuiz() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [moves, setMoves] = useState(0)
  const [showQuestion, setShowQuestion] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<any>(null)
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [feedbackType, setFeedbackType] = useState("")
  const [gameWon, setGameWon] = useState(false)

  const gameStateRef = useRef({
    cards: [] as Card[],
    firstCard: null as Card | null,
    secondCard: null as Card | null,
    canFlip: true,
    matchedPairs: 0,
    totalPairs: 8,
    score: 0,
    moves: 0,
    questionActive: false,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const state = gameStateRef.current

    // Initialize cards with pairs
    const symbols = ["🌟", "🎨", "🚀", "🎵", "🏆", "🎮", "💎", "🎯"]
    const cardValues = [...symbols, ...symbols].sort(() => Math.random() - 0.5)
    
    state.cards = cardValues.map((value, index) => ({
      id: index,
      value,
      matched: false,
      flipped: false,
      x: (index % 4) * 110 + 25,
      y: Math.floor(index / 4) * 110 + 25,
    }))

    const drawCards = () => {
      ctx.fillStyle = "#1a1a2e"
      ctx.fillRect(0, 0, 465, 465)

      state.cards.forEach((card) => {
        if (card.matched) {
          ctx.fillStyle = "#10b981"
          ctx.fillRect(card.x, card.y, 90, 90)
          ctx.fillStyle = "#fff"
          ctx.font = "40px Arial"
          ctx.fillText("✓", card.x + 30, card.y + 60)
        } else if (card.flipped) {
          ctx.fillStyle = "#6366f1"
          ctx.fillRect(card.x, card.y, 90, 90)
          ctx.strokeStyle = "#4f46e5"
          ctx.lineWidth = 3
          ctx.strokeRect(card.x, card.y, 90, 90)
          ctx.font = "50px Arial"
          ctx.fillText(card.value, card.x + 15, card.y + 65)
        } else {
          ctx.fillStyle = "#4338ca"
          ctx.fillRect(card.x, card.y, 90, 90)
          ctx.strokeStyle = "#312e81"
          ctx.lineWidth = 3
          ctx.strokeRect(card.x, card.y, 90, 90)
          ctx.fillStyle = "#fff"
          ctx.font = "bold 30px Arial"
          ctx.fillText("?", card.x + 32, card.y + 60)
        }
      })

      // Draw score
      ctx.fillStyle = "white"
      ctx.font = "bold 18px Arial"
      ctx.fillText("Matches: " + state.matchedPairs + "/" + state.totalPairs, 10, 455)
      ctx.fillText("Moves: " + state.moves, 320, 455)
    }

    const handleCanvasClick = (e: MouseEvent) => {
      if (!state.canFlip || state.questionActive) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const clickedCard = state.cards.find(
        (card) =>
          !card.matched &&
          !card.flipped &&
          x >= card.x &&
          x <= card.x + 90 &&
          y >= card.y &&
          y <= card.y + 90
      )

      if (clickedCard) {
        clickedCard.flipped = true
        drawCards()

        if (!state.firstCard) {
          state.firstCard = clickedCard
        } else if (!state.secondCard) {
          state.secondCard = clickedCard
          state.moves++
          setMoves(state.moves)
          state.canFlip = false

          setTimeout(() => {
            if (state.firstCard!.value === state.secondCard!.value) {
              // Match found!
              state.firstCard!.matched = true
              state.secondCard!.matched = true
              state.matchedPairs++

              // Show question for every match
              state.questionActive = true
              const storedQ = localStorage.getItem("kidQuizQuestions")
              const questions = storedQ ? JSON.parse(storedQ) : SAMPLE_QUESTIONS
              const question = questions[Math.floor(Math.random() * questions.length)]
              setCurrentQuestion(question)
              setShowQuestion(true)
              setFeedbackMessage("")
              setFeedbackType("")

              if (state.matchedPairs === state.totalPairs) {
                setTimeout(() => setGameWon(true), 2500)
              }
            } else {
              // No match
              state.firstCard!.flipped = false
              state.secondCard!.flipped = false
            }

            state.firstCard = null
            state.secondCard = null
            state.canFlip = true
            drawCards()
          }, 800)
        }
      }
    }

    canvas.addEventListener("click", handleCanvasClick)
    drawCards()

    return () => {
      canvas.removeEventListener("click", handleCanvasClick)
    }
  }, [])

  const handleAnswer = (selectedIndex: number) => {
    const state = gameStateRef.current
    // Fix: Convert both to numbers for comparison
    const correctAnswer = Number(currentQuestion.correct)
    const userAnswer = Number(selectedIndex)
    const correct = correctAnswer === userAnswer

    if (correct) {
      state.score += 25
      setScore(state.score)
      setFeedbackType("success")
      setFeedbackMessage("🎉 Correct! +25 points!")
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
        <div className="text-2xl font-bold mb-2">Puzzle Match Quiz 🧩</div>
        <div className="text-sm text-gray-400">Click cards to match pairs. Answer questions for each match!</div>
        <div className="text-lg font-semibold mt-2">
          Score: {score} | Moves: {moves}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={465}
        height={465}
        className="border-2 border-purple-500 rounded-lg shadow-lg cursor-pointer"
      />

      {gameWon && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border-2 border-green-500/50 text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-white mb-2">You Win!</h2>
            <p className="text-gray-400 mb-2">Final Score: {score}</p>
            <p className="text-gray-400 mb-4">Moves: {moves}</p>
            <button onClick={resetGame} className="btn-3d-orange px-6 py-3 rounded-full font-semibold">
              Play Again
            </button>
          </div>
        </div>
      )}

      {showQuestion && currentQuestion && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border-2 border-purple-500/50 max-w-md w-full">
            <div className="text-center mb-4">
              <div className="text-3xl mb-2">✨</div>
              <h3 className="text-xl font-bold text-white">Match Bonus Question!</h3>
            </div>
            <h3 className="text-lg font-semibold text-white mb-4">{currentQuestion.question}</h3>
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
