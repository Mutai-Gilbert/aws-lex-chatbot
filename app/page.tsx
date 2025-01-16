'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from 'ai/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, ImageIcon, Smile, Send } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import EmojiPicker from 'emoji-picker-react'
import { type EmojiClickData } from 'emoji-picker-react'

export default function ChatBot() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
  })
  const [isTyping, setIsTyping] = useState(false)
  const [isOpen, setIsOpen] = useState(true)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [images, setImages] = useState<string[]>([])
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null) // Added inputRef

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() && images.length === 0) return
    
    setIsTyping(true)
    handleSubmit(e).finally(() => {
      setIsTyping(false)
      setImages([])
      handleInputChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)
    })
  }

  const onEmojiClick = (emojiData: EmojiClickData) => {
    if (inputRef.current) { // Updated onEmojiClick
      const cursor = inputRef.current.selectionStart || 0
      const newInput = input.slice(0, cursor) + emojiData.emoji + input.slice(cursor)
      handleInputChange({ target: { value: newInput } } as React.ChangeEvent<HTMLInputElement>)
    }
    setShowEmojiPicker(false)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          setImages(prev => [...prev, e.target!.result as string])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: 'url("/placeholder.svg?height=1080&width=1920")' }}
    >
      <div className="max-w-4xl w-full bg-white bg-opacity-80 p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">Welcome to Our Website</h1>
        <p className="text-lg text-center mb-8">This is a placeholder for your website content. The chatbot is available in the bottom right corner.</p>
      </div>

      {isOpen ? (
        <div className="fixed bottom-4 right-4 w-[380px] bg-white rounded-2xl shadow-xl">
          <div className="flex items-center gap-3 p-4 bg-[#8B5CF6] text-white rounded-t-2xl">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-medium">AI Assistant</h3>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-[#7C3AED]"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <ScrollArea className="h-[400px] p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((m, index) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    m.role === 'user' 
                      ? 'bg-[#8B5CF6] text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {images.length > 0 && (
                <div className="flex justify-end">
                  <div className="flex flex-wrap gap-2 max-w-[70%]">
                    {images.map((img, index) => (
                      <img 
                        key={index} 
                        src={img || "/placeholder.svg"} 
                        alt="Uploaded" 
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[70%] rounded-2xl px-4 py-2 bg-gray-100 text-gray-900">
                    Typing...
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t relative">
            <form onSubmit={onSubmit} className="flex items-center gap-2">
              <Input
                ref={inputRef} // Updated Input component
                value={input}
                onChange={handleInputChange}
                placeholder="Type a message..."
                className="flex-1 rounded-full border-gray-200"
              />
              <Button 
                type="submit"
                size="icon"
                className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-full"
              >
                <Send className="h-4 w-4" />
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
                multiple
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="text-gray-500 hover:text-gray-600"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="h-5 w-5" />
              </Button>
              <Button 
                type="button"
                variant="ghost" 
                size="icon"
                className="text-gray-500 hover:text-gray-600"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile className="h-5 w-5" />
              </Button>
            </form>
            
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2 rounded-lg">
                <EmojiPicker
                  onEmojiClick={onEmojiClick}
                  width={280}
                  height={350}
                  theme="light"
                  skinTonesDisabled
                  searchDisabled
                  previewConfig={{
                    showPreview: false
                  }}
                  style={{ backgroundColor: '#E0F7FA' }}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <Button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 rounded-full bg-[#8B5CF6] hover:bg-[#7C3AED] shadow-lg"
        >
          Chat with us
        </Button>
      )}
    </div>
  )
}