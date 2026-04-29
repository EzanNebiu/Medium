import { useState } from "react";
import { showToast } from "../components/ui/toast";
import { fetchPhoneSpecs } from "../services/phoneSpecs";
import type { PhoneSearchMatch } from "../types/phoneSpecs";

export function usePhoneImport() {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<PhoneSearchMatch[]>([]);
  const [selected, setSelected] = useState<PhoneSearchMatch | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPhoneSpecs(query.trim());
      setMatches(data.matches);
      if (!data.matches.length) showToast(data.message ?? "Nuk u gjet asnjë telefon", "info");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Importimi i telefonit dështoi";
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return { query, setQuery, matches, selected, setSelected, loading, error, search };
}
