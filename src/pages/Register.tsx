import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { showToast } from "../components/ui/toast";
import { useAuth } from "../hooks/useAuth";

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = typeof location.state === "object" && location.state && "from" in location.state ? String(location.state.from) : "/account";
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const { error } = await signUp(email, password, fullName);
    if (error) showToast(error.message, "error");
    else {
      showToast("Llogaria u krijua. Kontrollo emailin nëse konfirmimi është aktiv.");
      navigate(from);
    }
  };

  return (
    <div className="container-page flex min-h-[60vh] items-center justify-center py-12">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-black">Regjistrohu</h1>
        <form className="mt-5 space-y-4" onSubmit={(event) => void submit(event)}>
          <Input required placeholder="Emri dhe mbiemri" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input required type="password" placeholder="Fjalëkalimi" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button className="w-full">Krijo llogari</Button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground">Shporta jote ruhet gjatë regjistrimit, kështu produktet nuk humbin.</p>
        <p className="mt-3 text-sm text-muted-foreground">Ke llogari? <Link className="font-bold text-primary" to="/login" state={{ from }}>Hyr</Link></p>
      </Card>
    </div>
  );
}
