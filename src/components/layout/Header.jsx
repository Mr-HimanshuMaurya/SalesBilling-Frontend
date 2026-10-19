import { useAuth } from "../../context/AuthContext.jsx";
import { Badge } from "../ui/Badge.jsx";
import { Button } from "../ui/Button.jsx";
import { LogOut, Menu } from "lucide-react";

export const Header = (props) => {
  const pageTitle = props.pageTitle || "";
  const { user, logout } = useAuth();

  return (
    <header className="h-19 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={props.onMenuClick}
          className="md:hidden cursor-pointer text-gray-600 hover:text-gray-900 shrink-0"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
          {pageTitle}
        </h2>
      </div>
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <div className="hidden sm:flex items-center gap-3">
          <span className="text-sm text-gray-600 max-w-[140px] truncate">
            {user.name}
          </span>
          <Badge variant={user.role} />
        </div>
        <Button className="text-red-500" variant="ghost" onClick={logout}>
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
};
