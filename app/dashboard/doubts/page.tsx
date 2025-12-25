"use client"

import React, { useState } from "react"
import { MessageCircle, ThumbsUp, MessageSquare, Image as ImageIcon, Send, Search, Filter } from "lucide-react"

interface Doubt {
  id: string
  studentName: string
  avatar: string
  subject: string
  question: string
  image?: string
  timestamp: string
  upvotes: number
  answers: number
  hasImage: boolean
}

export default function DoubtsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [showNewDoubtModal, setShowNewDoubtModal] = useState(false)
  const [newDoubtText, setNewDoubtText] = useState("")
  const [newDoubtSubject, setNewDoubtSubject] = useState("Math")

  const subjects = ["All", "Math", "Science", "Physics", "Chemistry", "Biology", "History", "English"]

  const doubts: Doubt[] = [
    {
      id: "1",
      studentName: "Priya Sharma",
      avatar: "🎓",
      subject: "Math",
      question: "Can someone explain how to solve quadratic equations using the quadratic formula? I'm confused about when to use ± symbol.",
      timestamp: "2 hours ago",
      upvotes: 12,
      answers: 5,
      hasImage: false,
    },
    {
      id: "2",
      studentName: "Rahul Kumar",
      avatar: "📚",
      subject: "Physics",
      question: "Why does the sky appear blue during the day but red/orange during sunset? Need help understanding light scattering.",
      image: "/placeholder-physics.png",
      timestamp: "5 hours ago",
      upvotes: 8,
      answers: 3,
      hasImage: true,
    },
    {
      id: "3",
      studentName: "Ananya Patel",
      avatar: "🔬",
      subject: "Chemistry",
      question: "What's the difference between ionic and covalent bonds? Can someone provide simple examples?",
      timestamp: "1 day ago",
      upvotes: 15,
      answers: 7,
      hasImage: false,
    },
    {
      id: "4",
      studentName: "Arjun Singh",
      avatar: "🎯",
      subject: "Science",
      question: "How does photosynthesis work? I need help understanding the light and dark reactions.",
      timestamp: "1 day ago",
      upvotes: 6,
      answers: 4,
      hasImage: false,
    },
  ]

  const filteredDoubts = doubts.filter((doubt) => {
    const matchesSearch = doubt.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doubt.subject.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubject = selectedSubject === "all" || doubt.subject.toLowerCase() === selectedSubject.toLowerCase()
    return matchesSearch && matchesSubject
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Doubts & Discussion</h1>
          <p className="text-gray-400">Ask questions, help others, and learn together!</p>
        </div>
        <button
          onClick={() => setShowNewDoubtModal(true)}
          className="btn-3d-orange px-6 py-3 rounded-full font-semibold flex items-center gap-2"
        >
          <MessageCircle className="w-5 h-5" />
          Post Your Doubt
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="dark-card p-4 rounded-xl text-center">
          <div className="text-3xl font-bold text-gradient-neon mb-1">156</div>
          <div className="text-sm text-gray-400">Total Doubts</div>
        </div>
        <div className="dark-card p-4 rounded-xl text-center">
          <div className="text-3xl font-bold text-green-400 mb-1">142</div>
          <div className="text-sm text-gray-400">Solved</div>
        </div>
        <div className="dark-card p-4 rounded-xl text-center">
          <div className="text-3xl font-bold text-orange-400 mb-1">14</div>
          <div className="text-sm text-gray-400">Pending</div>
        </div>
        <div className="dark-card p-4 rounded-xl text-center">
          <div className="text-3xl font-bold text-purple-400 mb-1">23</div>
          <div className="text-sm text-gray-400">Your Answers</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search doubts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
          />
        </div>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all cursor-pointer"
        >
          {subjects.map((subject) => (
            <option key={subject} value={subject.toLowerCase()}>
              {subject}
            </option>
          ))}
        </select>
      </div>

      {/* Doubts List */}
      <div className="space-y-4">
        {filteredDoubts.map((doubt) => (
          <div
            key={doubt.id}
            className="dark-card p-6 rounded-xl border border-white/10 hover:border-purple-500/50 transition-all cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">{doubt.avatar}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{doubt.studentName}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-400">
                        {doubt.subject}
                      </span>
                      <span>{doubt.timestamp}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-300 mb-3">{doubt.question}</p>
                
                {doubt.hasImage && (
                  <div className="mb-3 p-3 bg-white/5 rounded-lg border border-white/10 flex items-center gap-2 text-sm text-gray-400">
                    <ImageIcon className="w-4 h-4" />
                    <span>Image attached</span>
                  </div>
                )}
                
                <div className="flex items-center gap-4 text-sm">
                  <button className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{doubt.upvotes} upvotes</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    <span>{doubt.answers} answers</span>
                  </button>
                  <button className="ml-auto btn-3d-orange-secondary px-4 py-2 rounded-full text-sm font-medium">
                    View & Answer
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDoubts.length === 0 && (
        <div className="dark-card p-12 rounded-xl text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-white mb-2">No doubts found</h3>
          <p className="text-gray-400">Try a different search term or subject</p>
        </div>
      )}

      {/* New Doubt Modal */}
      {showNewDoubtModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-2xl w-full p-6 border-2 border-purple-500/50">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Post Your Doubt</h2>
              <button
                onClick={() => setShowNewDoubtModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2 font-medium">Subject</label>
                <select
                  value={newDoubtSubject}
                  onChange={(e) => setNewDoubtSubject(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                >
                  {subjects.filter(s => s !== "All").map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white mb-2 font-medium">Your Question</label>
                <textarea
                  value={newDoubtText}
                  onChange={(e) => setNewDoubtText(e.target.value)}
                  placeholder="Describe your doubt in detail..."
                  rows={6}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-purple-500/50 transition-all cursor-pointer">
                <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-400 text-sm">Click to upload image (optional)</p>
                <p className="text-gray-500 text-xs mt-1">PNG, JPG up to 5MB</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowNewDoubtModal(false)}
                  className="flex-1 px-6 py-3 rounded-lg font-semibold bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
                <button className="flex-1 btn-3d-orange px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2">
                  <Send className="w-5 h-5" />
                  Post Doubt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
