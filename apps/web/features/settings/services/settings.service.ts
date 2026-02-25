// Update Profile
export async function updateProfile(data: {
  fullName: string
  email: string
}) {
  const res = await fetch("/api/account", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(errorText || "Failed to update profile")
  }

  return res.json()
}


// Update Password

export async function updatePassword(data: {
  currentPassword: string
  newPassword: string
}) {
  if (!data.newPassword || data.newPassword.length < 6) {
    throw new Error("Password must be at least 6 characters")
  }

  const res = await fetch("/api/account/password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(errorText || "Failed to update password")
  }

  return res.json()
}



// Delete Account
export async function deleteAccount() {
  const res = await fetch("/api/account", {
    method: "DELETE",
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(errorText || "Failed to delete account")
  }

  return res.json()
}
