"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface StudentProfile {
  _id: string
  name: string
  email: string
  major: string
}

export default function StudentProfile() {
  const { data: session } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", major: "" })

  useEffect(() => {
    async function fetchProfile() {
      const res = await fetch("/api/student/profile")
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
        setForm({ name: data.name, email: data.email, major: data.major })
      }
    }
    fetchProfile()
  }, [])

  const handleUpdate = async () => {
    const res = await fetch("/api/student/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const updated = await res.json()
      setProfile(updated)
      setEditMode(false)
    }
  }

  const handleDelete = async () => {
    const res = await fetch("/api/student/profile", { method: "DELETE" })
    if (res.ok) {
      router.push("/student/dashboard")
    }
  }

  if (!profile) return <div>Loading...</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Profile</CardTitle>
      </CardHeader>
      <CardContent>
        {editMode ? (
          <div className="space-y-2">
            <Input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Name"
            />
            <Input
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="Email"
            />
            <Input
              value={form.major}
              onChange={e => setForm({ ...form, major: e.target.value })}
              placeholder="Major"
            />
            <Button onClick={handleUpdate}>Save</Button>
            <Button variant="outline" onClick={() => setEditMode(false)}>Cancel</Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div><strong>Name:</strong> {profile.name}</div>
            <div><strong>Email:</strong> {profile.email}</div>
            <div><strong>Major:</strong> {profile.major}</div>
            <Button onClick={() => setEditMode(true)}>Edit</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
