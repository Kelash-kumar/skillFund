"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface UserProfile {
  _id: string
  name: string
  email: string
  role: string
}

export default function AdminUserProfile() {
  const { data: session } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({ name: "", email: "" })

  useEffect(() => {
    // Fetch profile data from API
    async function fetchProfile() {
      const res = await fetch("/api/admin/profile")
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
        setForm({ name: data.name, email: data.email })
      }
    }
    fetchProfile()
  }, [])

  const handleUpdate = async () => {
    const res = await fetch("/api/admin/profile", {
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
    const res = await fetch("/api/admin/profile", { method: "DELETE" })
    if (res.ok) {
      router.push("/admin/users")
    }
  }

  if (!profile) return <div>Loading...</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Profile</CardTitle>
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
            <Button onClick={handleUpdate}>Save</Button>
            <Button variant="outline" onClick={() => setEditMode(false)}>Cancel</Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div><strong>Name:</strong> {profile.name}</div>
            <div><strong>Email:</strong> {profile.email}</div>
            <div><strong>Role:</strong> {profile.role}</div>
            <Button onClick={() => setEditMode(true)}>Edit</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
