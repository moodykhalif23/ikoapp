"use client"

import type React from "react"
import { AlertCircle } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

interface AuthPageProps {
  onSuccess: (userData: any) => void
}

const AlertIcon = AlertCircle; // Declare AlertIcon variable

export default function AuthPage({ onSuccess }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      if (!email || !password || (isSignUp && !name)) {
        setError("Please fill in all fields")
        setLoading(false)
        return
      }

      const userData = {
        id: Math.random().toString(),
        email,
        name: isSignUp ? name : email.split("@")[0],
        createdAt: new Date(),
      }

      onSuccess(userData)
    } catch (err) {
      setError("Authentication failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 safe-area-inset" style={{ background: 'linear-gradient(135deg, #f0f7f4 0%, #fff8f0 100%)' }}>
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 rounded-full blur-3xl -z-10" style={{ background: 'rgba(45, 106, 79, 0.1)' }}></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full blur-3xl -z-10" style={{ background: 'rgba(255, 140, 0, 0.1)' }}></div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative w-32 h-16 sm:w-40 sm:h-20">
            <Image src="/logo.png" alt="IKO BRIQ Logo" fill className="object-contain" priority />
          </div>
        </div>

        <Card className="card-brand card-elevated">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-xl sm:text-2xl md:text-3xl text-primary text-center">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                  <AlertIcon sx={{ fontSize: 20, color: "#dc2626" }} />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {isSignUp && (
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-brand-contrast">Full Name</label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    className="border-brand-subtle text-base focus-brand"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-brand-contrast">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="border-brand-subtle text-base focus-brand"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-brand-contrast">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="border-brand-subtle text-base focus-brand"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium touch-target"
              >
                {loading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center text-xs sm:text-sm">
              {isSignUp ? (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => {
                      setIsSignUp(false)
                      setError("")
                      setEmail("")
                      setPassword("")
                      setName("")
                    }}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{" "}
                  <button
                    onClick={() => {
                      setIsSignUp(true)
                      setError("")
                      setEmail("")
                      setPassword("")
                      setName("")
                    }}
                    className="text-primary hover:underline font-medium"
                  >
                    Create One
                  </button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-8">Production Reporting System © 2026 IKO BRIQ</p>
      </div>
    </div>
  )
}
