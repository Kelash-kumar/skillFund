"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Heart, Home, Share2 } from "lucide-react"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const paymentId = searchParams.get("id")
  const [paymentDetails, setPaymentDetails] = useState<any>(null)

  useEffect(() => {
    if (paymentId) {
      // Fetch payment details
      fetch(`/api/payment/${paymentId}`)
        .then((res) => res.json())
        .then((data) => setPaymentDetails(data))
        .catch(console.error)
    }
  }, [paymentId])

  return (
    <div className="min-h-screen bg-background-secondary flex items-center justify-center">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <Card className="border-success/20 bg-success/5">
            <CardHeader className="pb-4">
              <div className="mx-auto mb-4">
                <CheckCircle className="h-16 w-16 text-success" />
              </div>
              <CardTitle className="text-2xl text-success">Thank You!</CardTitle>
              <CardDescription>Your donation has been processed successfully</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {paymentDetails && (
                <div className="bg-background rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Amount:</span>
                    <span className="font-semibold">${paymentDetails.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Payment ID:</span>
                    <span className="font-mono text-sm">{paymentId}</span>
                  </div>
                </div>
              )}

              <div className="text-center space-y-2">
                <Heart className="h-8 w-8 text-primary mx-auto" />
                <p className="text-foreground-muted">
                  Your generosity helps students access quality education and build their future.
                </p>
              </div>

              <div className="space-y-3">
                <Button onClick={() => router.push("/donor/dashboard")} className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.share?.({
                      title: "I just donated to SkillFund!",
                      text: "Join me in supporting student education on SkillFund",
                      url: window.location.origin,
                    }) || navigator.clipboard.writeText(window.location.origin)
                  }}
                  className="w-full"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share SkillFund
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
