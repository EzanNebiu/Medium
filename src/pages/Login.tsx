import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { showToast } from "../components/ui/toast";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = typeof location.state === "object" && location.state && "from" in location.state ? String(location.state.from) : "/account";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const { error } = await signIn(email, password);
    if (error) showToast(error.message, "error");
    else navigate(from);
  };

  return (
    <div className="container-page flex min-h-[60vh] items-center justify-center py-12">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-black">Hyr në llogari</h1>
        <form className="mt-5 space-y-4" onSubmit={(event) => void submit(event)}>
          <Input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input required type="password" placeholder="Fjalëkalimi" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button className="w-full">Hyr</Button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground">Produktet në shportë ruhen edhe pasi hyn në llogari.</p>
        <p className="mt-3 text-sm text-muted-foreground">I/e ri këtu? <Link className="font-bold text-primary" to="/register" state={{ from }}>Krijo llogari</Link></p>
      </Card>
    </div>
  );
}
