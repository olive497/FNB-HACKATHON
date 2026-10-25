import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { DashboardShell } from "@/components/dashboard/shell";
import { useSafeBank } from "@/store/store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — SafeBank" },
      {
        name: "description",
        content:
          "Your SafeBank demo dashboard: budgeting, savings, scam protection, learning and financial safety tools.",
      },
      { property: "og:title", content: "Dashboard — SafeBank" },
      { property: "og:description", content: "Your SafeBank demo dashboard by Team Finovators." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardLayout,
});

function DashboardLayout() {
  const { authed, onboarded, loaded } = useSafeBank();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loaded) return;
    if (!authed) void navigate({ to: "/login" });
    else if (!onboarded) void navigate({ to: "/onboarding" });
  }, [loaded, authed, onboarded, navigate]);

  if (!loaded || !authed || !onboarded) {
    return <div className="min-h-screen bg-background" aria-busy="true" />;
  }

  return (
    <DashboardShell>
      <Outlet />
    </DashboardShell>
  );
}
