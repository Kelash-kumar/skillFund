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

  // Saved payment methods
  const [savedMethods, setSavedMethods] = useState<any[]>([])
  const [selectedSavedId, setSelectedSavedId] = useState<string>("")
  const [saveCard, setSaveCard] = useState<boolean>(true)

  // Dummy card/bank form fields (do NOT store these in real systems!)
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242")
  const [cardName, setCardName] = useState("")
  const [exp, setExp] = useState("12/34")
  const [cvc, setCvc] = useState("123")
  const [bankName, setBankName] = useState("")
  const [bankAccountNumber, setBankAccountNumber] = useState("")
  const [routingNumber, setRoutingNumber] = useState("")

  useEffect(() => {
    // Load saved methods for donor
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

      // Save new card if requested and no saved method selected
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
        headers: {
          "Content-Type": "application/json",
        },
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
    <div className="min-h-screen bg-background-secondary">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-foreground mb-2">Make a Donation</h1>
            <p className="text-foreground-muted">
              Your contribution helps students access quality education and build their future.
            </p>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Donation Details
                </CardTitle>
                <CardDescription>Choose your donation amount and add a personal message</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePayment} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant={amount === "25" ? "default" : "outline"}
                      onClick={() => setAmount("25")}
                      className="h-12"
                    >
                      $25
                    </Button>
                    <Button
                      type="button"
                      variant={amount === "50" ? "default" : "outline"}
                      onClick={() => setAmount("50")}
                      className="h-12"
                    >
                      $50
                    </Button>
                    <Button
                      type="button"
                      variant={amount === "100" ? "default" : "outline"}
                      onClick={() => setAmount("100")}
                      className="h-12"
                    >
                      $100
                    </Button>
                    <Button
                      type="button"
                      variant={amount === "250" ? "default" : "outline"}
                      onClick={() => setAmount("250")}
                      className="h-12"
                    >
                      $250
                    </Button>
                  </div>

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
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Personal Message (Optional)</Label>
                    <Textarea
                      id="message"
                      placeholder="Add a message of encouragement for students..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                    />
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Payment Method
                </CardTitle>
                <CardDescription>Choose how you'd like to make your donation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={paymentMethod} onValueChange={(v) => { setPaymentMethod(v); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stripe">Credit/Debit Card</SelectItem>
                    <SelectItem value="null" disabled={true}>Other options coming soon..</SelectItem>
                    {/* <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem> */}
                  </SelectContent>
                </Select>

                {paymentMethod === "stripe" && (
                  <div className="space-y-4 border rounded-md p-4 bg-background">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div >
                        <Label htmlFor="card-number">Card Number</Label>
                        <Input id="card-number" className="my-2" placeholder="4242 4242 4242 4242" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="card-name">Name on Card</Label>
                        <Input id="card-name" className="my-2" placeholder="JOHN DOE" value={cardName} onChange={(e) => setCardName(e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="exp">Expiry (MM/YY)</Label>
                        <Input id="exp" className="my-2" placeholder="12/34" value={exp} onChange={(e) => setExp(e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="cvc">CVC</Label>
                        <Input id="cvc" className="my-2" placeholder="123" value={cvc} onChange={(e) => setCvc(e.target.value)} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor="bank-name">Bank Name (Optional)</Label>
                        <Input className="my-2" id="bank-name" placeholder="Test Bank" value={bankName} onChange={(e) => setBankName(e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="acct">Account Number (Optional)</Label>
                        <Input className="my-2" id="acct" placeholder="000123456789" value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="routing">Routing Number (Optional)</Label>
                        <Input className="my-2" id="routing" placeholder="110000000" value={routingNumber} onChange={(e) => setRoutingNumber(e.target.value)} />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input id="save-card" type="checkbox" checked={saveCard} onChange={(e) => setSaveCard(e.target.checked)} />
                      <Label htmlFor="save-card">Save this card for future donations</Label>
                    </div>

                    <p className="text-xs text-foreground-muted">Use Stripe test card 4242 4242 4242 4242 with any future expiry and any CVC. This is a simulation; no real payment is processed.</p>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-foreground-muted">
                  <Shield className="h-4 w-4" />
                  Your payment is secured with 256-bit SSL encryption
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <h3 className="font-semibold text-foreground">Your Impact</h3>
                  <p className="text-sm text-foreground-muted">
                    ${amount || "0"} can help fund educational opportunities and change a student's life
                  </p>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handlePayment}
              disabled={!amount || !paymentMethod || isProcessing}
              className="w-full h-12 text-lg"
            >
              {isProcessing ? "Processing..." : `Donate $${amount || "0"}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
