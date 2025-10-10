"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { BookOpen } from "lucide-react";
import Link from "next/link";

interface ApiProfileResponse {
  name: string;
  email: string;
  userType?: string;
  profile?: {
    major?: string;
    [key: string]: any;
  };
}

export default function StudentProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", major: "" });
  const [userType, setUserType] = useState<string | undefined>(undefined);

  const initials = useMemo(() => {
    if (!form.name?.trim()) return "S";
    const parts = form.name.trim().split(/\s+/);
    const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
    return letters.join("") || "S";
  }, [form.name]);

  useEffect(() => {
    let isMounted = true;
    async function fetchProfile() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/profile", { cache: "no-store" });
        if (!res.ok) {
          const msg =
            (await res.json().catch(() => ({})))?.message ||
            "Failed to load profile";
          throw new Error(msg);
        }
        const data: ApiProfileResponse = await res.json();
        if (!isMounted) return;
        setForm({
          name: data.name || "",
          email: data.email || "",
          major: data.profile?.major || "",
        });
        setUserType(data.userType);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.message || "Failed to load profile");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleUpdate = async () => {
    try {
      setSaving(true);
      setError(null);

      const payload = {
        name: form.name,
        email: form.email,
        profile: {
          major: form.major,
        },
      };

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg =
          (await res.json().catch(() => ({})))?.message || "Update failed";
        throw new Error(msg);
      }

      toast({ title: "Profile updated" });
      setEditMode(false);
    } catch (e: any) {
      setError(e?.message || "Update failed");
      toast({
        title: "Update failed",
        description: e?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const canSave = form.name.trim().length > 0 && form.email.trim().length > 0;

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl p-4 md:p-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-56" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Student Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
            <div className="mt-4">
              <Button onClick={() => router.refresh()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">
                SkillFund
              </span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/student/dashboard"
              className="text-foreground-muted hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <Link href="/student/courses" className="text-foreground-muted hover:text-foreground transition-colors">
              Browse Courses
            </Link>
            <Link
              href="/student/applications"
              className="text-foreground-muted hover:text-foreground transition-colors"
            >
              My Applications
            </Link>
            <Link href="/student/profile" className="text-primary font-medium ">
              Profile
            </Link>
          </nav>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-foreground-muted">
              Welcome, {session?.user?.name}
            </span>
            <Button
              variant="outline"
              onClick={() => router.push("/api/auth/signout")}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-3xl p-4 md:p-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">
                    {form.name || "Student Profile"}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{form.email}</p>
                  {userType && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Role: {userType}
                    </p>
                  )}
                </div>
              </div>
              {!editMode ? (
                <Button onClick={() => setEditMode(true)}>Edit</Button>
              ) : null}
            </div>
          </CardHeader>
          <CardContent>
            {editMode ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      placeholder="jane@example.com"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="major">Major</Label>
                    <Input
                      id="major"
                      value={form.major}
                      onChange={(e) =>
                        setForm({ ...form, major: e.target.value })
                      }
                      placeholder="Computer Science"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleUpdate} disabled={!canSave || saving}>
                    {saving ? "Saving..." : "Save changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditMode(false)}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <div className="text-sm text-muted-foreground">Full name</div>
                  <div className="mt-1 font-medium">{form.name || "—"}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="mt-1 font-medium">{form.email || "—"}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-sm text-muted-foreground">Major</div>
                  <div className="mt-1 font-medium">{form.major || "—"}</div>
                </div>
                <div className="md:col-span-2">
                  <Button onClick={() => setEditMode(true)}>Edit</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
