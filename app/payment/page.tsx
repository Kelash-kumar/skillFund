"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CreditCard, Shield, Heart, ArrowLeft } from "lucide-react"

export default function PaymentPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [message, setMessage] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [savedMethods, setSavedMethods] = useState<any[]>([])
  const [selectedSavedId, setSelectedSavedId] = useState<string>("")
  const [saveCard, setSaveCard] = useState<boolean>(true)

  // Dummy card/bank form fields (for simulation)
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242")
  const [cardName, setCardName] = useState("")
  const [exp, setExp] = useState("12/34")
  const [cvc, setCvc] = useState("123")
  const [bankName, setBankName] = useState("")
  const [bankAccountNumber, setBankAccountNumber] = useState("")
  const [routingNumber, setRoutingNumber] = useState("")

  useEffect(() => {
    async function loadSaved() {
      try {
        const res = await fetch("/api/payment/methods")
        if (res.ok) {
          const data = await res.json()
          setSavedMethods(data)
        }
      } catch (e) {
        console.error("Failed to load saved methods", e)
      }
    }
    loadSaved()
  }, [])

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      let methodId = selectedSavedId

      if (paymentMethod === "stripe" && saveCard && !methodId) {
        const saveRes = await fetch("/api/payment/methods", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "card",
            cardNumber,
            nameOnCard: cardName,
            exp,
            cvc,
            bankName,
            bankAccountNumber,
            routingNumber,
          }),
        })
        if (saveRes.ok) {
          const saved = await saveRes.json()
          methodId = saved._id
        }
      }

      const response = await fetch("/api/payment/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number.parseFloat(amount),
          paymentMethod,
          message,
          savedPaymentMethodId: methodId || undefined,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        router.push(`/payment/success?id=${result.paymentId}`)
      } else {
        throw new Error("Payment failed")
      }
    } catch (error) {
      console.error("Payment error:", error)
      alert("Payment failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/80 to-background-secondary">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4">
              <Heart className="h-10 w-10 text-primary animate-pulse" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Make a Donation</h1>
            <p className="text-lg text-foreground-muted">
              Your generosity empowers students to reach their potential and build a brighter future.
            </p>
          </div>

          <div className="grid gap-8">
            {/* Donation Details */}
            <Card className="border-border bg-card/70 backdrop-blur-md shadow-md hover:shadow-lg transition">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Heart className="h-5 w-5 text-primary" />
                  Donation Details
                </CardTitle>
                <CardDescription>Choose an amount and leave a message of encouragement</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePayment} className="space-y-6">
                  {/* Quick Amounts */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[25, 50, 100, 250].map((val) => (
                      <Button
                        key={val}
                        type="button"
                        variant={amount === val.toString() ? "default" : "outline"}
                        onClick={() => setAmount(val.toString())}
                        className={`h-12 font-semibold transition-transform ${
                          amount === val.toString() ? "scale-105 shadow-md" : "hover:scale-105"
                        }`}
                      >
                        ${val}
                      </Button>
                    ))}
                  </div>

                  {/* Custom Amount */}
                  <div>
                    <Label htmlFor="custom-amount">Custom Amount</Label>
                    <Input
                      id="custom-amount"
                      type="number"
                      placeholder="Enter custom amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="1"
                      step="0.01"
                      className="mt-1"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <Label htmlFor="message">Personal Message (Optional)</Label>
                    <Textarea
                      id="message"
                      placeholder="Share a message of encouragement for students..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Payment Section */}
            <Card className="border-border bg-card/70 backdrop-blur-md shadow-md hover:shadow-lg transition">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Payment Method
                </CardTitle>
                <CardDescription>Select your preferred payment option</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stripe">Credit / Debit Card</SelectItem>
                    <SelectItem value="null" disabled>
                      Other options coming soon
                    </SelectItem>
                  </SelectContent>
                </Select>

                {paymentMethod === "stripe" && (
                  <div className="space-y-4 border rounded-md p-5 bg-background-muted">
                    {savedMethods.length > 0 && (
                      <div>
                        <Label htmlFor="saved-method">Use Saved Card</Label>
                        <Select value={selectedSavedId} onValueChange={setSelectedSavedId}>
                          <SelectTrigger id="saved-method">
                            <SelectValue placeholder="Select saved card (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            {savedMethods.map((m) => (
                              <SelectItem key={m._id} value={m._id}>
                                {m.label || `${m.brand || "Card"} **** ${m.last4 || "****"}${m.exp ? ` (${m.exp})` : ""}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Card Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="card-number">Card Number</Label>
                        <Input
                          id="card-number"
                          placeholder="4242 4242 4242 4242"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="card-name">Name on Card</Label>
                        <Input
                          id="card-name"
                          placeholder="JOHN DOE"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="exp">Expiry (MM/YY)</Label>
                        <Input id="exp" placeholder="12/34" value={exp} onChange={(e) => setExp(e.target.value)} className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="cvc">CVC</Label>
                        <Input id="cvc" placeholder="123" value={cvc} onChange={(e) => setCvc(e.target.value)} className="mt-1" />
                      </div>
                    </div>

                    {/* Save Card Option */}
                    <div className="flex items-center gap-2">
                      <input id="save-card" type="checkbox" checked={saveCard} onChange={(e) => setSaveCard(e.target.checked)} />
                      <Label htmlFor="save-card" className="text-sm">
                        Save this card for future donations
                      </Label>
                    </div>

                    <p className="text-xs text-foreground-muted">
                      Use Stripe test card 4242 4242 4242 4242 with any expiry date and any CVC (simulation only).
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-foreground-muted">
                  <Shield className="h-4 w-4" />
                  Transactions are encrypted and securely processed
                </div>
              </CardContent>
            </Card>

            {/* Impact Section */}
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <h3 className="font-semibold text-foreground text-lg">Your Impact</h3>
                  <p className="text-sm text-foreground-muted">
                    ${amount || "0"} can help fund educational resources and empower a student's journey.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Donate Button */}
            <Button
              onClick={handlePayment}
              disabled={!amount || !paymentMethod || isProcessing}
              className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 transition-transform hover:scale-[1.02]"
            >
              {isProcessing ? "Processing..." : `Donate $${amount || "0"}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
