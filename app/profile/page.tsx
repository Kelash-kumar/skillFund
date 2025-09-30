"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Save, Plus, X, Building, Heart, DollarSign, Eye, EyeOff } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"

interface UserProfile {
  name: string
  email: string
  userType: string
  profile?: any
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  )
}

function ProfileContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newInterest, setNewInterest] = useState("")
  const [newCertification, setNewCertification] = useState("")

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile")
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!profile) return

    setSaving(true)
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      })

      if (response.ok) {
        // Show success message or redirect
        router.refresh()
      }
    } catch (error) {
      console.error("Error saving profile:", error)
    } finally {
      setSaving(false)
    }
  }

  const updateProfile = (field: string, value: any) => {
    if (!profile) return

    if (field.includes(".")) {
      const [parent, child] = field.split(".")
      setProfile({
        ...profile,
        profile: {
          ...profile.profile,
          [parent]: {
            ...profile.profile[parent],
            [child]: value,
          },
        },
      })
    } else if (field.startsWith("profile.")) {
      const profileField = field.replace("profile.", "")
      setProfile({
        ...profile,
        profile: {
          ...profile.profile,
          [profileField]: value,
        },
      })
    } else {
      setProfile({ ...profile, [field]: value })
    }
  }

  const addInterest = () => {
    if (!newInterest.trim() || !profile?.profile?.interests) return
    updateProfile("profile.interests", [...profile.profile.interests, newInterest.trim()])
    setNewInterest("")
  }

  const removeInterest = (index: number) => {
    if (!profile?.profile?.interests) return
    const updated = profile.profile.interests.filter((_: any, i: number) => i !== index)
    updateProfile("profile.interests", updated)
  }

  const addCertification = () => {
    if (!newCertification.trim() || !profile?.profile?.completedCertifications) return
    updateProfile("profile.completedCertifications", [
      ...profile.profile.completedCertifications,
      newCertification.trim(),
    ])
    setNewCertification("")
  }

  const removeCertification = (index: number) => {
    if (!profile?.profile?.completedCertifications) return
    const updated = profile.profile.completedCertifications.filter((_: any, i: number) => i !== index)
    updateProfile("profile.completedCertifications", updated)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-foreground-muted">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground-muted">Unable to load profile</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Profile Settings</h1>
          <p className="text-slate-600">Manage your account information and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription className="text-blue-100">Your account details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => updateProfile("name", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => updateProfile("email", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label>Account Type</Label>
                <div className="mt-1">
                  <Badge variant="secondary" className="capitalize">
                    {profile.userType}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student Profile */}
          {profile.userType === "student" && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-lg">
                <CardTitle>Student Profile</CardTitle>
                <CardDescription className="text-emerald-100">
                  Your educational background and career information
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label htmlFor="education">Educational Background</Label>
                  <Textarea
                    id="education"
                    value={profile.profile?.education || ""}
                    onChange={(e) => updateProfile("profile.education", e.target.value)}
                    placeholder="Describe your educational background, current studies, or degrees..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="careerGoals">Career Goals</Label>
                  <Textarea
                    id="careerGoals"
                    value={profile.profile?.careerGoals || ""}
                    onChange={(e) => updateProfile("profile.careerGoals", e.target.value)}
                    placeholder="What are your career aspirations and goals..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <Separator />

                <div>
                  <Label>Completed Certifications</Label>
                  <div className="mt-2 space-y-2">
                    {profile.profile?.completedCertifications?.map((cert: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <Badge variant="outline" className="flex-1 justify-between">
                          {cert}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCertification(index)}
                            className="h-4 w-4 p-0 ml-2"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Input
                        value={newCertification}
                        onChange={(e) => setNewCertification(e.target.value)}
                        placeholder="Add a certification..."
                        onKeyPress={(e) => e.key === "Enter" && addCertification()}
                      />
                      <Button onClick={addCertification} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="portfolio">Portfolio URL</Label>
                    <Input
                      id="portfolio"
                      value={profile.profile?.portfolio || ""}
                      onChange={(e) => updateProfile("profile.portfolio", e.target.value)}
                      placeholder="https://yourportfolio.com"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedin">LinkedIn Profile</Label>
                    <Input
                      id="linkedin"
                      value={profile.profile?.linkedIn || ""}
                      onChange={(e) => updateProfile("profile.linkedIn", e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="github">GitHub Profile</Label>
                    <Input
                      id="github"
                      value={profile.profile?.github || ""}
                      onChange={(e) => updateProfile("profile.github", e.target.value)}
                      placeholder="https://github.com/username"
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Donor Profile */}
          {profile.userType === "donor" && (
            <>
              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Donor Profile
                  </CardTitle>
                  <CardDescription className="text-purple-100">
                    Your company information and donation preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label htmlFor="company">Company/Organization</Label>
                    <Input
                      id="company"
                      value={profile.profile?.company || ""}
                      onChange={(e) => updateProfile("profile.company", e.target.value)}
                      placeholder="Your company or organization name"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Areas of Interest</Label>
                    <div className="mt-2 space-y-2">
                      {profile.profile?.interests?.map((interest: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <Badge variant="outline" className="flex-1 justify-between">
                            <Heart className="h-3 w-3 mr-1" />
                            {interest}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeInterest(index)}
                              className="h-4 w-4 p-0 ml-2"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Input
                          value={newInterest}
                          onChange={(e) => setNewInterest(e.target.value)}
                          placeholder="Add an interest area..."
                          onKeyPress={(e) => e.key === "Enter" && addInterest()}
                        />
                        <Button onClick={addInterest} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Donation Preferences
                  </CardTitle>
                  <CardDescription className="text-amber-100">
                    Configure your donation settings and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label htmlFor="maxAmount">Maximum Donation Amount (Optional)</Label>
                    <Input
                      id="maxAmount"
                      type="number"
                      value={profile.profile?.donationPreferences?.maxAmount || ""}
                      onChange={(e) =>
                        updateProfile(
                          "donationPreferences.maxAmount",
                          e.target.value ? Number(e.target.value) : undefined,
                        )
                      }
                      placeholder="Enter maximum amount per donation"
                      className="mt-1"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="recurring">Recurring Donations</Label>
                      <p className="text-sm text-muted-foreground">Enable automatic recurring donations</p>
                    </div>
                    <Switch
                      id="recurring"
                      checked={profile.profile?.donationPreferences?.recurring || false}
                      onCheckedChange={(checked) => updateProfile("donationPreferences.recurring", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="anonymous">Anonymous Donations</Label>
                      <p className="text-sm text-muted-foreground">Keep your donations anonymous to recipients</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {profile.profile?.isAnonymous ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                      <Switch
                        id="anonymous"
                        checked={profile.profile?.isAnonymous || false}
                        onCheckedChange={(checked) => updateProfile("profile.isAnonymous", checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Admin Profile */}
          {profile.userType === "admin" && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-t-lg">
                <CardTitle>Administrator Profile</CardTitle>
                <CardDescription className="text-red-100">Administrative account settings</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-muted-foreground">
                  As an administrator, you have access to all platform features and analytics. Your basic information is
                  managed above.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} size="lg" className="min-w-32">
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
