"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Heart, Users, Target, Shield, Globe, Briefcase } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
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
            <Link href="/how-it-works" className="text-foreground-muted hover:text-foreground transition-colors">How it Works</Link>
            <Link href="/about" className="text-primary font-medium">About</Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero */}
        <section className="text-center mb-12">
          <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">Our Mission</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Empowering Education Through Community</h1>
          <p className="text-lg text-foreground-muted max-w-3xl mx-auto">
            SkillFund connects motivated students with generous donors to unlock access to professional courses,
            certifications, and life-changing opportunities.
          </p>
        </section>

        {/* Impact stats */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm text-foreground-muted">Funds Raised</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">$2.5M+</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm text-foreground-muted">Students Funded</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">5,000+</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm text-foreground-muted">Active Donors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">1,200+</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm text-foreground-muted">Courses Available</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">500+</div>
            </CardContent>
          </Card>
        </section>

        {/* Values */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-foreground">Student-first</CardTitle>
              <CardDescription className="text-foreground-muted">
                We prioritize student outcomes, skills, and employability.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-2">
                <Shield className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle className="text-foreground">Transparent & Secure</CardTitle>
              <CardDescription className="text-foreground-muted">
                Every donation is tracked and goes directly to education.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-2">
                <Globe className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="text-foreground">Global Community</CardTitle>
              <CardDescription className="text-foreground-muted">
                Donors and students worldwide collaborating for impact.
              </CardDescription>
            </CardHeader>
          </Card>
        </section>

        {/* Who we help */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-foreground">Students</CardTitle>
              <CardDescription className="text-foreground-muted">
                From entry-level learners to professionals upskilling into high-demand roles.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-2">
                <Briefcase className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle className="text-foreground">Employers & Communities</CardTitle>
              <CardDescription className="text-foreground-muted">
                A stronger talent pipeline benefits employers and communities alike.
              </CardDescription>
            </CardHeader>
          </Card>
        </section>

        {/* CTA */}
        <section className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup?type=student">
              <Button className="bg-primary hover:bg-primary-hover">I’m a Student</Button>
            </Link>
            <Link href="/auth/signup?type=donor">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                I’m a Donor
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
