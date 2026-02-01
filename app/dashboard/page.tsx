"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type Submission = {
  id: string;
  leetcode_slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  minutes_spent: number;
  solved_at: string; // YYYY-MM-DD
  notes: string | null;
  created_at: string;
};

function toDateOnly(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function DashboardPage() {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Submission[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
        return;
      }
      setEmail(data.user.email ?? "");

      const { data: rows, error } = await supabase
        .from("submissions")
        .select("id, leetcode_slug, difficulty, minutes_spent, solved_at, notes, created_at")
        .order("solved_at", { ascending: false })
        .limit(25);

      if (error) setMsg(error.message);
      setItems((rows ?? []) as Submission[]);
      setLoading(false);
    })();
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function deleteRow(id: string) {
    setMsg(null);
    const { error } = await supabase.from("submissions").delete().eq("id", id);
    if (error) {
      setMsg(error.message);
      return;
    }
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  const stats = useMemo(() => {
    const total = items.length;
    const easy = items.filter((x) => x.difficulty === "Easy").length;
    const medium = items.filter((x) => x.difficulty === "Medium").length;
    const hard = items.filter((x) => x.difficulty === "Hard").length;

    const uniqueDays = new Set(items.map((x) => x.solved_at));
    const today = new Date();
    let streak = 0;
    for (let i = 0; ; i++) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      if (uniqueDays.has(toDateOnly(day))) streak++;
      else break;
    }

    const minutes = items.reduce((sum, x) => sum + (x.minutes_spent ?? 0), 0);

    return { total, easy, medium, hard, streak, minutes };
  }, [items]);

  return (
    <main style={{ maxWidth: 920, margin: "40px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>Dashboard</h1>
          <p style={{ marginTop: 6 }}>Logged in as: {email}</p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <a href="/log" style={{ textDecoration: "underline" }}>Log a solve</a>
          <button onClick={logout} style={{ textDecoration: "underline" }}>Logout</button>
        </div>
      </div>

      <section style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
        <StatCard label="Total solves" value={stats.total} />
        <StatCard label="Streak (days)" value={stats.streak} />
        <StatCard label="Minutes logged" value={stats.minutes} />
        <StatCard label="Easy / Medium / Hard" value={`${stats.easy} / ${stats.medium} / ${stats.hard}`} />
        <StatCard label="Last 25 entries" value={items.length} />
      </section>

      <section style={{ marginTop: 22 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Recent solves</h2>

        {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
        {loading && <p style={{ marginTop: 10 }}>Loading...</p>}

        {!loading && items.length === 0 && (
          <p style={{ marginTop: 10 }}>No entries yet. Add one on the “Log a solve” page.</p>
        )}

        {!loading && items.length > 0 && (
          <div style={{ marginTop: 10, border: "1px solid #ddd", borderRadius: 12, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f7f7f7" }}>
                  <th style={th}>Date</th>
                  <th style={th}>Problem</th>
                  <th style={th}>Difficulty</th>
                  <th style={th}>Minutes</th>
                  <th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((x) => (
                  <tr key={x.id}>
                    <td style={td}>{x.solved_at}</td>
                    <td style={td}>{x.leetcode_slug}</td>
                    <td style={td}>{x.difficulty}</td>
                    <td style={td}>{x.minutes_spent}</td>
                    <td style={tdRight}>
                      <button
                        onClick={() => deleteRow(x.id)}
                        style={{ textDecoration: "underline" }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: any }) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
      <div style={{ fontSize: 12, opacity: 0.75 }}>{label}</div>
      <div style={{ marginTop: 6, fontSize: 18, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

const th: React.CSSProperties = { textAlign: "left", padding: "10px 12px", fontSize: 12, opacity: 0.8 };
const td: React.CSSProperties = { padding: "10px 12px", borderTop: "1px solid #eee" };
const tdRight: React.CSSProperties = { padding: "10px 12px", borderTop: "1px solid #eee", textAlign: "right" };