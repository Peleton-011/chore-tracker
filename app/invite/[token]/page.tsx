"use client"; // Ensure that this is a client-side component
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface Household {
  _id: string;
  name: string;
}

interface InviteResponse {
  household: Household;
  inviteToken: string;
  error?: string;
}

export default function InvitePage() {
  const router = useRouter();
  const { token } = router.query;
  const [household, setHousehold] = useState<Household | null>(null);
  const [error, setError] = useState<string>("");
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    if (!router.isReady) return; // Ensure router is ready before accessing `router.query`

    if (token) {
      fetch(`/api/invite/${token}`)
        .then((res) => res.json())
        .then((data: InviteResponse) => {
          if (data.error) {
            setError(data.error);
          } else {
            setHousehold(data.household);
          }
        })
        .catch((err) => setError("Failed to fetch invite details"));
    }
  }, [router.isReady, token]); // Wait for router to be ready before running the effect

  const joinHousehold = async () => {
    try {
      const response = await fetch(`/api/invite/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("User added to household");
        // Optionally redirect to a dashboard or household page
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Failed to join household");
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!household) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Join Household: {household.name}</h1>
      <button onClick={joinHousehold}>Join Household</button>
    </div>
  );
}
