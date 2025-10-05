"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, Heart, Search, CheckCircle, ArrowRight, Shield } from "lucide-react"
import Link from "next/link"

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">SkillFund</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/courses" className="text-foreground-muted hover:text-foreground transition-colors">Courses</Link>
            <Link href="/how-it-works" className="text-primary font-medium">How it Works</Link>
            <Link href="/about" className="text-foreground-muted hover:text-foreground transition-colors">About</Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero */}
        <section className="text-center mb-12">
          <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">Simple. Transparent. Impactful.</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">How SkillFund Works</h1>
          <p className="text-lg text-foreground-muted max-w-3xl mx-auto">
            A step-by-step guide for students and donors to collaborate and fund education.
          </p>
        </section>

        {/* Steps for Students */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">For Students</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                  <Search className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-foreground">1. Browse Courses</CardTitle>
                <CardDescription className="text-foreground-muted">Explore approved, high-impact courses.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center mb-2">
                  <Users className="h-5 w-5 text-secondary" />
                </div>
                <CardTitle className="text-foreground">2. Apply for Funding</CardTitle>
                <CardDescription className="text-foreground-muted">Share your goals and why this course matters.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mb-2">
                  <CheckCircle className="h-5 w-5 text-accent" />
                </div>
                <CardTitle className="text-foreground">3. Get Approved & Funded</CardTitle>
                <CardDescription className="text-foreground-muted">Track status and start learning once funded.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Steps for Donors */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">For Donors</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-foreground">1. Discover Students</CardTitle>
                <CardDescription className="text-foreground-muted">Browse approved applications and stories.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center mb-2">
                  <Heart className="h-5 w-5 text-secondary" />
                </div>
                <CardTitle className="text-foreground">2. Sponsor with Confidence</CardTitle>
                <CardDescription className="text-foreground-muted">Secure, transparent funding directly to education.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mb-2">
                  <Shield className="h-5 w-5 text-accent" />
                </div>
                <CardTitle className="text-foreground">3. See Your Impact</CardTitle>
                <CardDescription className="text-foreground-muted">Track student progress and outcomes.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup?type=student">
              <Button className="bg-primary hover:bg-primary-hover">
                Get Funding
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/signup?type=donor">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Become a Donor
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
