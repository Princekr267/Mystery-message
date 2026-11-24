"use client"

import React, { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast, Toaster } from "sonner"
import * as z from "zod"
import { authClient } from "@/lib/auth-client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { signInSchema } from "@/schemas/signInSchema"

const SignInPage = () => {

    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    useEffect(() => {
        fetch("/api/seed-demo-users", { method: "POST" }).catch(() => {
            // Demo credentials are optional and do not block sign-in.
        })
    }, [])

    // zod implementation
    const form = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            identifier: "",
            password: "",

        }
    })

    const googleSignIn = async () => {
        try {
            const res = await authClient.signIn.social({
                provider: "google",
                callbackURL: "/dashboard"
            })
            if (res?.error) {
                console.error("Google sign in error", res.error)
                toast.error(res.error.message || "Google Sign-In failed")
            }
        } catch (err) {
            console.error("Google sign in error", err)
            toast.error("Google Sign-In failed")
        }
    }

    const onSubmit = async (formData: z.infer<typeof signInSchema>) => {
        setIsSubmitting(true)
        try {
            let email = formData.identifier
            if (!email.includes("@")) {
                const res = await fetch("/api/resolve-identifier", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ identifier: formData.identifier })
                })
                const data = await res.json()
                if (res.ok && data.email) {
                    email = data.email
                } else {
                    toast.error(data.error ?? "User not found")
                    setIsSubmitting(false)
                    return
                }
            }

            const { error } = await authClient.signIn.email({
                email,
                password: formData.password,
                callbackURL: "/dashboard",
                rememberMe: false,
            })

            if (error) {
                toast.error(error.message ?? "Sign in failed")
                return
            }

            toast.success("Signed in successfully")
            router.push("/dashboard")
        } catch {
            toast.error("Something went wrong while signing in")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <Toaster />
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">Join Mystery Message</h1>
                    <p className="mb-4">Sign In to start your anonymous adventure</p>
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
                    Sign In with Google
                </Button>
                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink mx-4 text-gray-400 text-sm">or</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>
                <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>
                        <Controller
                            name="identifier"
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
                                        type="password"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Enter password"
                                        autoComplete="current-password"
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
                                </>) : ("Sign In")}
                        </Button>
                    </div>
                </form>
                <div className="text-center mt-4">
                    <p>
                        Register yourself!{' '}
                        <Link href="/sign-up" className="text-blue-600 hover:text-blue-800">
                            Sign Up
                        </Link>
                    </p>
                </div>
                <div className="mx-1 mt-6 mb-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="mb-3 text-sm font-semibold text-gray-700">Demo accounts</p>
                    <div className="space-y-2">
                        {[
                            { email: "user1@gmail.com", password: "12345678" },
                            { email: "test@test.com", password: "asdfghjkl" },
                        ].map((account) => (
                            <button
                                key={account.email}
                                type="button"
                                onClick={() => {
                                    form.setValue("identifier", account.email)
                                    form.setValue("password", account.password)
                                }}
                                className="flex w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-left text-sm hover:border-gray-300 hover:bg-gray-100"
                            >
                                <span className="font-medium">{account.email}</span>
                                <span className="text-gray-500">{account.password}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    )
}

export default SignInPage;