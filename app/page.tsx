import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, BookOpen, Heart, Users, TrendingUp, Shield, Globe } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
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
            <Link href="/courses" className="text-foreground-muted hover:text-foreground transition-colors">
              Courses
            </Link>
            <Link href="/how-it-works" className="text-foreground-muted hover:text-foreground transition-colors">
              How it Works
            </Link>
            <Link href="/about" className="text-foreground-muted hover:text-foreground transition-colors">
              About
            </Link>
          </nav>
          <div className="flex items-center space-x-3">
            <Link href="/auth/signin">
              <Button variant="ghost" className="text-foreground-muted">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-background-secondary">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-6 bg-accent/10 text-accent border-accent/20">
            Empowering Education Through Community
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Fund Your Future with
            <span className="text-primary"> SkillFund</span>
          </h1>
          <p className="text-xl text-foreground-muted mb-8 max-w-3xl mx-auto text-pretty">
            Connect students with donors to access funding for professional courses and certifications. Build your
            career while our community invests in your success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup?type=student">
              <Button size="lg" className="bg-primary hover:bg-primary-hover text-primary-foreground">
                Request Course Funding
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/signup?type=donor">
              <Button
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
              >
                Become a Donor
                <Heart className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">$2.5M+</div>
              <div className="text-foreground-muted">Funds Raised</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">5,000+</div>
              <div className="text-foreground-muted">Students Funded</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">1,200+</div>
              <div className="text-foreground-muted">Active Donors</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-foreground-muted">Available Courses</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">How SkillFund Works</h2>
            <p className="text-xl text-foreground-muted max-w-2xl mx-auto">
              A transparent platform connecting students, donors, and educational opportunities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-border bg-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-foreground">For Students</CardTitle>
                <CardDescription className="text-foreground-muted">
                  Browse courses, request funding, and track your progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-foreground-muted">
                  <li>• Search 500+ professional courses</li>
                  <li>• Request funding with your goals</li>
                  <li>• Track application status</li>
                  <li>• Build your portfolio</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border bg-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle className="text-foreground">For Donors</CardTitle>
                <CardDescription className="text-foreground-muted">
                  Support students and see the impact of your contributions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-foreground-muted">
                  <li>• Choose students to sponsor</li>
                  <li>• Set donation preferences</li>
                  <li>• Track impact and progress</li>
                  <li>• Receive updates from students</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border bg-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="text-foreground">Transparent & Secure</CardTitle>
                <CardDescription className="text-foreground-muted">
                  Every donation is tracked and funds go directly to education
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-foreground-muted">
                  <li>• Secure payment processing</li>
                  <li>• Full transparency on fund usage</li>
                  <li>• Direct payments to providers</li>
                  <li>• Regular progress reports</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Courses */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Popular Courses</h2>
            <p className="text-xl text-foreground-muted">Discover the most funded professional certifications</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "AWS Solutions Architect",
                provider: "Amazon",
                price: "$300",
                category: "Cloud Computing",
                funded: 89,
              },
              {
                title: "Google Data Analytics",
                provider: "Google",
                price: "$49",
                category: "Data Science",
                funded: 156,
              },
              {
                title: "Meta Front-End Developer",
                provider: "Meta",
                price: "$49",
                category: "Web Development",
                funded: 203,
              },
              { title: "Salesforce Administrator", provider: "Salesforce", price: "$200", category: "CRM", funded: 67 },
              {
                title: "PMP Project Management",
                provider: "PMI",
                price: "$555",
                category: "Project Management",
                funded: 45,
              },
              { title: "Cybersecurity Analyst", provider: "IBM", price: "$49", category: "Security", funded: 78 },
            ].map((course, index) => (
              <Card key={index} className="border-border bg-card hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {course.category}
                    </Badge>
                    <span className="text-sm font-semibold text-primary">{course.price}</span>
                  </div>
                  <CardTitle className="text-lg text-foreground">{course.title}</CardTitle>
                  <CardDescription className="text-foreground-muted">by {course.provider}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground-muted">{course.funded} students funded</span>
                    <TrendingUp className="h-4 w-4 text-accent" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/courses">
              <Button
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
              >
                View All Courses
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <Globe className="h-16 w-16 mx-auto mb-6 opacity-80" />
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Career?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of students who have advanced their careers through community-funded education
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup?type=student">
              <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/courses">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-primary bg-transparent"
              >
                Browse Courses
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background-secondary border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-foreground">SkillFund</span>
              </div>
              <p className="text-foreground-muted text-sm">
                Empowering students through community-funded education and professional development.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">For Students</h3>
              <ul className="space-y-2 text-sm text-foreground-muted">
                <li>
                  <Link href="/courses" className="hover:text-foreground">
                    Browse Courses
                  </Link>
                </li>
                <li>
                  <Link href="/student/request-course" className="hover:text-foreground">
                    Request Course Funding
                  </Link>
                </li>
                <li>
                  <Link href="/student-guide" className="hover:text-foreground">
                    Student Guide
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">For Donors</h3>
              <ul className="space-y-2 text-sm text-foreground-muted">
                <li>
                  <Link href="/donate" className="hover:text-foreground">
                    Make a Donation
                  </Link>
                </li>
                <li>
                  <Link href="/impact" className="hover:text-foreground">
                    See Impact
                  </Link>
                </li>
                <li>
                  <Link href="/donor-guide" className="hover:text-foreground">
                    Donor Guide
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-foreground-muted">
                <li>
                  <Link href="/about" className="hover:text-foreground">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-foreground-muted">
            <p>&copy; 2025 SkillFund. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
