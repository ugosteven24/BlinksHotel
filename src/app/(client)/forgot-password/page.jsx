"use client";



import { useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/firebase/firebase";

const BUTTON_COLOR = "#0866ed";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Invalid request",
        text: "Please enter your email address.",
        confirmButtonColor: BUTTON_COLOR,
      });
      return;
    }

    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err) {
      if (err.code === "auth/invalid-email") {
        Swal.fire({
          icon: "error",
          title: "Invalid email",
          text: "Invalid email address.",
          confirmButtonColor: BUTTON_COLOR,
        });
        setLoading(false);
        return;
      }
    }

    // Same message either way so account existence is not revealed.
    Swal.fire({
      icon: "success",
      title: "Check your email",
      text: "If an account exists for this email, a reset link has been sent.",
      confirmButtonColor: BUTTON_COLOR,
    });

    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Reset password</h1>
        <p>Enter your email and we will send you a reset link.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="auth-switch">
          <Link href="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
