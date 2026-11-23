"use client"

import React, { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast, Toaster } from "sonner"
import * as z from "zod"
import { useDebounceCallback } from 'usehooks-ts'

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { signUpSchema } from "@/schemas/signUpSchema"
import axios, { AxiosError } from "axios"
import { ApiResponse } from "@/types/API_Response"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"

const SignUpPage = () => {
    const [username, setUsername] = useState('')
    const [usernameMessage, setUsernameMessage] = useState('')
    const [isCheckingUsername, setIsCheckingUsername] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const debounced = useDebounceCallback(setUsername, 400)
    const router =  useRouter()

    const googleSignIn = async () => {
        try {
            const res = await authClient.signIn.social({
                provider: "google",
                callbackURL: "/dashboard"
            })
            if (res?.error) {
                console.error("Google sign up error", res.error)
                toast.error(res.error.message || "Google Sign-In failed")
            }
        } catch (err) {
            console.error("Google sign up error", err)
            toast.error("Google Sign-In failed")
        }
    }

    // zod implementation
    const form = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "", 
            
        }
    })

    useEffect(() => {
        const checkUsernameUnique = async () => {
            if (username.trim()) {
                setIsCheckingUsername(true)
                setUsernameMessage('')
                try {
                    const response = await axios.get(`/api/check-username-unique?username=${username}`)
                    const message = response.data.message
                    setUsernameMessage(message)
                } catch (err){
                    const axiosError = err as AxiosError<ApiResponse>;
                    setUsernameMessage(
                        axiosError.response?.data.message ?? "Error checking username"
                    )
                } finally {
                    setIsCheckingUsername(false)
                }
            }
        }
        checkUsernameUnique()
    }, [username])

    const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
        setIsSubmitting(true)
        try{
            const response = await axios.post<ApiResponse>("/api/signup", data)
            toast.success(response.data.message)
            router.replace(`/verify/${username}`)
            setIsSubmitting(false)
        } catch(err) {
            console.error("Error in signup of user", err)
            const axiosError = err as AxiosError<ApiResponse>;
            const errorMessage = axiosError.response?.data.message
            toast.error(errorMessage ?? "Signup failed")
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <Toaster />
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">Join Mystery Message</h1>
                <p className="mb-4">Sign up to start your anonymous adventure</p>
            </div>
            <Button 
                type="button" 
                variant="outline" 
                className="w-full py-5 flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50"
                onClick={googleSignIn}
            >
                <svg className="w-5 h-5" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.5 24c0-1.61-.15-3.16-.42-4.69H24v9.09h12.64c-.55 2.88-2.18 5.33-4.64 6.99l7.19 5.57C43.4 36.33 46.5 30.82 46.5 24z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.19-5.57c-1.99 1.34-4.55 2.13-7.7 2.13-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    <path fill="#FBBC05" d="M10.54 28.84c-.48-1.44-.76-2.97-.76-4.84s.28-3.4.76-4.84L2.56 13.03C.92 16.33 0 20.06 0 24s.92 7.67 2.56 10.97l7.98-6.13z"/>
                </svg>
                Sign Up with Google
            </Button>
            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-sm">or</span>
                <div className="flex-grow border-t border-gray-300"></div>
            </div>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                    <Controller
                        name="username"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="username">Username</FieldLabel>
                                <div className="relative w-full">
                                    <Input
                                        {...field}
                                        id="username"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Username"
                                        autoComplete="off"
                                        className="pr-8"
                                        onChange={(e) => {
                                            field.onChange(e)
                                            debounced(e.target.value)
                                        }}
                                    />
                                    {isCheckingUsername && (
                                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center">
                                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                                {isCheckingUsername ? (
                                    <p className="text-xs mt-1 text-muted-foreground">Checking username availability...</p>
                                ) : (
                                    usernameMessage && (
                                        <p className={`text-xs mt-1 ${usernameMessage === "Username is unique" ? "text-green-500" : "text-red-500"}`}>
                                            {usernameMessage}
                                        </p>
                                    )
                                )}
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                    <Controller
                        name="email"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    {...field}
                                    id="email"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="Enter your email"
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                    <Controller
                        name="password"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="password">Password</FieldLabel>
                                <Input
                                    {...field}
                                    id="password"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="Enter password"
                                    autoComplete="new-password"
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                </FieldGroup>
                <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                        </>) : ("Sign Up")}
                    </Button>
                </div>
            </form>
            <div className="text-center mt-4">
                <p>
                    Already a member?{' '}
                    <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
                        Sign in
                    </Link>
                </p>
            </div>
            </div>
            
        </div>
    )
}

export default SignUpPage;