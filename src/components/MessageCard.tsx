'use client'

import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from './ui/button'
import {X} from "lucide-react"
import { Message } from '@/model/user.model'
import { toast } from "sonner"
import axios from 'axios'
import { ApiResponse } from '@/types/API_Response'
type MessageCardProps ={
    message: Message;
    onMessageDelete: (messageId: string) => void
}

function MessageCard({message, onMessageDelete}:MessageCardProps) {

    const handleDeleteConfirm = async () => {
        try {
            const response = await axios.delete<ApiResponse>(`/api/delete-message/${message._id}`)
            toast.success(response.data.message)
            onMessageDelete(message._id.toString())
        } catch {
            toast.error("Failed to delete message")
        }
    }

    // console.log(message.createdAt);
    const datetime = message.createdAt;
    const dateOG = new Date(datetime)
    const formatted = dateOG.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    const time = new Date(datetime).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });

  return (
    <Card className="h-full">
      <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 px-4 pb-0">
        <CardTitle className="min-w-0 break-words pr-1 text-xl font-semibold leading-7">
          {message.content}
        </CardTitle>
        <CardAction>
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="destructive"
                  size="icon-sm"
                  aria-label="Delete message"
                  className="rounded-md"
                >
                  <X />
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this message?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={handleDeleteConfirm}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardAction>
      </CardHeader>
      <CardFooter className="mt-auto px-4 py-3">
        <CardDescription>{formatted}, {time}</CardDescription>
      </CardFooter>
    </Card>
  )
}

export default MessageCard