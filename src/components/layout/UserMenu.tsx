import { Link } from "react-router-dom";
import { User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function UserMenu() {
  const { user } = useAuth();

  return (
    <Link
      to={user ? "/account" : "/auth"}
      className="p-2 hover:text-accent transition-colors"
      aria-label={user ? "My Account" : "Sign In"}
    >
      <User className="h-5 w-5" />
    </Link>
  );
}
