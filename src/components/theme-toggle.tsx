import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return theme === "dark" ? (
    <Button variant="outline" size="icon" onClick={() => setTheme("light")}>
      <Sun className="h-4 w-4" />
    </Button>
  ) : (
    <Button variant="outline" size="icon" onClick={() => setTheme("dark")}>
      <Moon className="h-4 w-4" />
    </Button>
  );
}
