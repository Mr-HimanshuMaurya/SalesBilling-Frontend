import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Spinner } from "../../components/ui/Spinner.jsx";
import toast from "react-hot-toast";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Clear localStorage when login page mounts
    localStorage.clear();
  }, []);

  useEffect(() => {
    // Redirect if user is already logged in
    if (user) {
      console.log("Login - user logged in, redirecting...", user.role);
      if (user.role === "sales") {
        navigate("/sales/clients", { replace: true });
      } else if (user.role === "accountant") {
        navigate("/accountant/billing", { replace: true });
      } else if (user.role === "superadmin") {
        navigate("/admin/dashboard", { replace: true });
      } else if (user.role === "server_admin") {
        navigate("/server/dashboard", { replace: true });
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { user: loggedInUser } = await login(email, password);
      toast.success("Login successful!");
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="flex flex-col items-center ">
            <img
              src="/aasthalogo.png"
              alt="Aastha Logo"
              className="h-18 w-auto"
            />
          </div>

          <p className="text-gray-500">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="employee@aastha.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Employee@123"
            required
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Spinner size="sm" /> : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
};
