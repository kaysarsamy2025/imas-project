"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import {
  User, Mail, Lock, Camera,
  Save, Eye, EyeOff, Check, Loader2, AlertCircle,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const tabs = [
  { id: "profile",  label: "Profile",  icon: User },
  { id: "account",  label: "Account",  icon: Mail },
  { id: "password", label: "Password", icon: Lock },
]

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession()
  const [activeTab, setActiveTab] = useState("profile")

  const user     = session?.user
  const initials = user?.name?.split(" ").map(n => n[0]).join("").toUpperCase() ?? "U"

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your account preferences and profile</p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar */}
          <aside className="w-full lg:w-56 shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xs px-3 py-2.5 text-sm font-medium transition-colors duration-instant",
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0 rounded-xs border border-border bg-muted">
            {activeTab === "profile"  && <ProfileTab  user={user} initials={initials} updateSession={updateSession} />}
            {activeTab === "account"  && <AccountTab  user={user} />}
            {activeTab === "password" && <PasswordTab />}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Profile Tab ─────────────────────────────────────────────── */
function ProfileTab({ user, initials, updateSession }: any) {
  const [name, setName]       = useState(user?.name ?? "")
  const [bio, setBio]         = useState("")
  const [company, setCompany] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.image ?? "")
  const [uploading, setUploading] = useState(false)
  const [state, setState]     = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [errMsg, setErrMsg]   = useState("")

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("folder", "imas/avatars")
      const res  = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) { alert(data.error || "Upload failed"); return }
      setAvatarUrl(data.url)
      await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: data.url }),
      })
      await updateSession({ image: data.url })
    } catch { alert("Upload failed") }
    finally { setUploading(false) }
  }

  async function handleSave() {
    setState("saving"); setErrMsg("")
    try {
      const res  = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio, company }),
      })
      const data = await res.json()
      if (!res.ok) { setErrMsg(data.error || "Failed"); setState("error"); return }
      await updateSession({ name: data.user.name })
      setState("saved")
      setTimeout(() => setState("idle"), 2500)
    } catch { setErrMsg("Something went wrong"); setState("error") }
  }

  return (
    <div>
      <div className="border-b border-border px-6 py-4">
        <h2 className="text-base font-semibold text-foreground">Profile Information</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">Update your public profile details</p>
      </div>
      <div className="space-y-6 p-6">
        {/* Avatar */}
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar className="h-20 w-20 ring-2 ring-border ring-offset-2 ring-offset-muted">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback className="bg-primary text-xl font-bold text-primary-foreground">{initials}</AvatarFallback>
            </Avatar>
            <label className={cn(
              "absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-muted bg-primary transition-opacity hover:opacity-90",
              uploading && "opacity-60 cursor-not-allowed"
            )}>
              {uploading
                ? <Loader2 className="h-3.5 w-3.5 text-primary-foreground animate-spin" />
                : <Camera className="h-3.5 w-3.5 text-primary-foreground" />}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                onChange={handlePhotoUpload} disabled={uploading} />
            </label>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Profile photo</p>
            <p className="mt-0.5 text-xs text-muted-foreground">JPG, PNG, WEBP — max 2MB</p>
            {uploading && <p className="mt-1 text-xs text-primary">Uploading...</p>}
          </div>
        </div>

        <Separator className="bg-border" />

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-foreground">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input id="name" className="pl-10 h-10 bg-background" value={name}
                onChange={e => setName(e.target.value)} placeholder="Your full name" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="company" className="text-sm font-medium text-foreground">Company</Label>
            <Input id="company" className="h-10 bg-background" value={company}
              onChange={e => setCompany(e.target.value)} placeholder="Your company" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio" className="text-sm font-medium text-foreground">Bio</Label>
          <textarea id="bio" rows={4} value={bio} onChange={e => setBio(e.target.value)}
            placeholder="Tell investors about yourself..."
            className="flex w-full rounded-xs border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-muted resize-none" />
          <p className="text-xs text-muted-foreground">{bio.length}/300 characters</p>
        </div>

        {errMsg && <ErrorMsg msg={errMsg} />}
        <SaveBtn state={state} onSave={handleSave} />
      </div>
    </div>
  )
}

/* ─── Account Tab ─────────────────────────────────────────────── */
function AccountTab({ user }: any) {
  return (
    <div>
      <div className="border-b border-border px-6 py-4">
        <h2 className="text-base font-semibold text-foreground">Account Settings</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">Manage your email and account details</p>
      </div>
      <div className="space-y-6 p-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input type="email" className="pl-10 h-10 bg-background" value={user?.email ?? ""} readOnly />
          </div>
          <p className="text-xs text-muted-foreground">Contact support to change your email address.</p>
        </div>

        <Separator className="bg-border" />

        <div className="rounded-xs border border-destructive/30 bg-destructive/5 p-5">
          <h3 className="text-sm font-semibold text-destructive">Danger Zone</h3>
          <p className="mt-1 text-xs text-muted-foreground">Permanently delete your account and all data. This cannot be undone.</p>
          <Button variant="outline" size="sm"
            className="mt-3 border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive">
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ─── Password Tab ────────────────────────────────────────────── */
function PasswordTab() {
  const [show, setShow]     = useState({ current: false, new: false, confirm: false })
  const [form, setForm]     = useState({ current: "", new: "", confirm: "" })
  const [state, setState]   = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [errMsg, setErrMsg] = useState("")

  async function handleSave() {
    setErrMsg("")
    if (form.new !== form.confirm) { setErrMsg("New passwords do not match"); return }
    if (form.new.length < 8)       { setErrMsg("Password must be at least 8 characters"); return }
    setState("saving")
    try {
      const res  = await fetch("/api/settings/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: form.current, newPassword: form.new, confirmPassword: form.confirm }),
      })
      const data = await res.json()
      if (!res.ok) { setErrMsg(data.error || "Failed"); setState("error"); return }
      setForm({ current: "", new: "", confirm: "" })
      setState("saved")
      setTimeout(() => setState("idle"), 2500)
    } catch { setErrMsg("Something went wrong"); setState("error") }
  }

  return (
    <div>
      <div className="border-b border-border px-6 py-4">
        <h2 className="text-base font-semibold text-foreground">Change Password</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">Keep your account secure with a strong password</p>
      </div>
      <div className="space-y-5 p-6">
        {(["current", "new", "confirm"] as const).map((field) => {
          const labels = { current: "Current Password", new: "New Password", confirm: "Confirm New Password" }
          return (
            <div key={field} className="space-y-2">
              <Label className="text-sm font-medium text-foreground">{labels[field]}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input type={show[field] ? "text" : "password"} className="pl-10 pr-11 h-10 bg-background"
                  placeholder="••••••••" value={form[field]}
                  onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} />
                <button type="button"
                  onClick={() => setShow(p => ({ ...p, [field]: !p[field] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {show[field] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )
        })}

        <div className="rounded-xs border border-border bg-background p-4 space-y-1.5">
          <p className="text-xs font-medium text-foreground">Requirements:</p>
          {["At least 8 characters", "One uppercase letter", "One number or symbol"].map(r => (
            <div key={r} className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />{r}
            </div>
          ))}
        </div>

        {errMsg && <ErrorMsg msg={errMsg} />}
        <SaveBtn state={state} onSave={handleSave} label="Update Password" />
      </div>
    </div>
  )
}

/* ─── Shared ──────────────────────────────────────────────────── */
function ErrorMsg({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xs border border-destructive/30 bg-destructive/8 px-4 py-3">
      <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
      <p className="text-sm text-destructive">{msg}</p>
    </div>
  )
}

function SaveBtn({ state, onSave, label = "Save Changes" }: {
  state: "idle" | "saving" | "saved" | "error"
  onSave: () => void
  label?: string
}) {
  return (
    <button onClick={onSave} disabled={state === "saving"}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-xs px-6 text-sm font-semibold transition-all duration-instant disabled:opacity-60",
        state === "saved" ? "bg-emerald-500 text-white" : "text-primary-foreground"
      )}
      style={state !== "saved" ? { background: "var(--primary)", color: "var(--primary-foreground)" } : {}}>
      {state === "saving" && <><Loader2 className="h-4 w-4 animate-spin" />Saving...</>}
      {state === "saved"  && <><Check className="h-4 w-4" />Saved!</>}
      {(state === "idle" || state === "error") && <><Save className="h-4 w-4" />{label}</>}
    </button>
  )
}
