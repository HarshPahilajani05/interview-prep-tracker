"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type Difficulty = "Easy" | "Medium" | "Hard";

export default function LogSolvePage() {
  const router = useRouter();

  const [leetcodeSlug, setLeetcodeSlug] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("Easy");
  const [minutesSpent, setMinutesSpent] = useState<number>(20);
  const [solvedAt, setSolvedAt] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [notes, setNotes] = useState("");

  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/login");
    });
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setSaving(true);

    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      if (!userData.user) throw new Error("Not logged in");

      const payload = {
        user_id: userData.user.id,
        leetcode_slug: leetcodeSlug.trim(),
        difficulty,
        minutes_spent: Number(minutesSpent),
        solved_at: solvedAt,
        notes: notes.trim() || null,
      };

      if (!payload.leetcode_slug) throw new Error("Enter a LeetCode slug (e.g., two-sum).");

      const { error } = await supabase.from("submissions").insert(payload);
      if (error) throw error;

      setMsg("Saved ✅");
      setLeetcodeSlug("");
      setNotes("");
    } catch (err: any) {
      setMsg(err?.message ?? "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Log a solve</h1>

      <form onSubmit={onSubmit} style={{ marginTop: 16, display: "grid", gap: 12 }}>
        <input
          placeholder="LeetCode slug (e.g., two-sum)"
          value={leetcodeSlug}
          onChange={(e) => setLeetcodeSlug(e.target.value)}
          style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
        />

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
        >
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>

        <input
          type="number"
          value={minutesSpent}
          onChange={(e) => setMinutesSpent(Number(e.target.value))}
          min={0}
          style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
        />

        <input
          type="date"
          value={solvedAt}
          onChange={(e) => setSolvedAt(e.target.value)}
          style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
        />

        <textarea
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
        />

        <button disabled={saving} style={{ padding: 10, borderRadius: 8, border: "1px solid #000" }}>
          {saving ? "Saving..." : "Save"}
        </button>
      </form>

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}

      <div style={{ marginTop: 16 }}>
        <a href="/dashboard" style={{ textDecoration: "underline" }}>Back to dashboard</a>
      </div>
    </main>
  );
}