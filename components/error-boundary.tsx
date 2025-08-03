"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error Boundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
          <Card className="bg-gray-900/80 backdrop-blur-sm border-2 border-red-500/50 shadow-2xl max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white flex items-center justify-center gap-3">
                <AlertTriangle className="h-8 w-8 text-red-400" />
                Connection Error
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-300">
                There was an issue connecting to the Abstract wallet provider. Please refresh the page and try again.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Refresh Page
              </button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
