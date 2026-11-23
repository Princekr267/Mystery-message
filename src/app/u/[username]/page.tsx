'use client'
import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import axios, { AxiosError } from 'axios'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { ApiResponse } from '@/types/API_Response'

// ✅ No async here — client components cannot be async
// ✅ useParams reads the route param without needing await
function Page() {
  const params = useParams<{ username: string }>()
  const decodedUsername = decodeURIComponent(params.username)

  // useState is allowed here because this is a normal (non-async) component
  const [message, setMessage] = useState<string>('')
  const [isSending, setIsSending] = useState(false)

  const sendMessage = async () => {
    const content = message.trim()
    if (content.length < 3) {
      toast.error('Message is too short', {
        description: 'Enter at least 3 characters.',
      })
      return
    }

    setIsSending(true)
    try {
      const response = await axios.post<ApiResponse>('/api/send-messages', {
        username: decodedUsername,
        content,
      })
      setMessage('')
      toast.success(response.data.message)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data.message || 'Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className='container mx-auto my-10 max-w-2xl p-6 bg-white rounded-lg shadow-md space-y-8'>
      <div className='text-center space-y-4'>
        <h1 className='font-bold text-4xl text-gray-900'>Public Profile Link</h1>
        <p className='text-gray-600'>Send anonymous message to <span className='font-bold text-black'>@{decodedUsername}</span></p>
        <div className='space-y-3 pt-2 max-w-lg mx-auto'>
          <input
            value={message}
            onChange={(e) => {setMessage(e.target.value)}}
            type="text"
            placeholder='Write your anonymous message here'
            className='w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm'
          />
          <Button onClick={sendMessage} disabled={isSending} className='w-full sm:w-auto px-6'>
            {isSending ? <Loader2 className='h-4 w-4 animate-spin' /> : 'Send It'}
          </Button>
        </div>
      </div>

      <div className='border-t border-gray-200 pt-6 space-y-4 text-center'>
        <h3 className='text-gray-700 font-medium'>Click on any message below to select it.</h3>
        <Button variant="outline" className='mb-2'>Suggest new Messages</Button>

        <div className='max-w-lg mx-auto text-left space-y-3'>
          <h2 className='font-semibold text-lg text-gray-800 text-center'>Suggested Messages</h2>
          <div className='grid gap-2.5'>
            <p  className='p-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-all duration-150'>Message 1</p>
            <p className='p-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-all duration-150'>Message 2</p>
            <p className='p-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-all duration-150'>Message 3</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page