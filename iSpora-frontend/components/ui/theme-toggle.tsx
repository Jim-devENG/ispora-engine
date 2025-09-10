import { Moon, Sun, Monitor } from "lucide-react"
import { Button } from "./button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu"
import { useTheme } from "../ThemeProvider"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-lg hover:bg-accent/50 transition-all duration-200 hover-lift">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="modern-card w-48 p-1">
        <DropdownMenuItem 
          onClick={() => setTheme("light")} 
          className="cursor-pointer rounded-md px-3 py-2.5 transition-all duration-200 hover:bg-accent/50 focus:bg-accent/50"
        >
          <Sun className="mr-3 h-4 w-4 text-yellow-500" />
          <span className="font-medium">Light</span>
          {theme === "light" && <span className="ml-auto text-primary font-bold">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")} 
          className="cursor-pointer rounded-md px-3 py-2.5 transition-all duration-200 hover:bg-accent/50 focus:bg-accent/50"
        >
          <Moon className="mr-3 h-4 w-4 text-blue-500" />
          <span className="font-medium">Dark</span>
          {theme === "dark" && <span className="ml-auto text-primary font-bold">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")} 
          className="cursor-pointer rounded-md px-3 py-2.5 transition-all duration-200 hover:bg-accent/50 focus:bg-accent/50"
        >
          <Monitor className="mr-3 h-4 w-4 text-muted-foreground" />
          <span className="font-medium">System</span>
          {theme === "system" && <span className="ml-auto text-primary font-bold">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
