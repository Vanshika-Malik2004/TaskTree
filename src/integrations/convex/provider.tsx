import { ConvexProvider, ConvexReactClient } from "convex/react";

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;
if (!CONVEX_URL) {
  console.error("VITE_CONVEX_URL environment variable is not set");
}

const convex = new ConvexReactClient(CONVEX_URL);

export default function AppConvexProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
