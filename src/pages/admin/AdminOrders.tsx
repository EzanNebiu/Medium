import { useEffect, useMemo, useState } from "react";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { formatCurrency } from "../../lib/utils";
import { sqDeliveryMethod, sqPayment } from "../../lib/albanian";
import { getAdminOrders } from "../../services/orders";

export default function AdminOrders() {
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  useEffect(() => { void getAdminOrders().then((data) => setOrders(data as Record<string, unknown>[])); }, []);
  const filtered = useMemo(() => orders.filter((order) => (!query || String(order.customer_name ?? order.customer_email).toLowerCase().includes(query.toLowerCase())) && (status === "all" || order.status === status)), [orders, query, status]);
  return (
    <section>
      <h1 className="text-3xl font-black">Porositë</h1>
      <Card className="mt-6 p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <Input placeholder="Kërko klient ose email" value={query} onChange={(e) => setQuery(e.target.value)} />
          <Select value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">Të gjitha statuset</option><option value="pending">në pritje</option><option value="confirmed">konfirmuar</option><option value="processing">duke u përgatitur</option><option value="shipped">dërguar</option><option value="delivered">dorëzuar</option><option value="cancelled">anuluar</option></Select>
        </div>
        <div className="mt-5 overflow-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="border-b text-xs uppercase text-muted-foreground"><tr><th className="py-3">Porosia</th><th>Klienti</th><th>Statusi</th><th>Totali</th><th>Pagesa</th><th>Status pagesë</th><th>Marrja</th><th>Qyteti</th></tr></thead>
            <tbody className="divide-y">{filtered.map((order) => <tr key={String(order.id)}><td className="py-3 font-bold">{String(order.id).slice(0, 8)}</td><td>{String(order.customer_name ?? "")}<p className="text-xs text-muted-foreground">{String(order.customer_email ?? "")}</p></td><td><Select defaultValue={String(order.status)}><option value="pending">në pritje</option><option value="confirmed">konfirmuar</option><option value="processing">duke u përgatitur</option><option value="shipped">dërguar</option><option value="delivered">dorëzuar</option><option value="cancelled">anuluar</option></Select></td><td>{formatCurrency(Number(order.total ?? 0))}</td><td>{sqPayment(String(order.payment_method ?? ""))}{order.payment_method === "monthly" ? <p className="text-xs text-muted-foreground">{String(order.installment_months ?? "")} muaj</p> : null}</td><td>{String(order.payment_status ?? order.payment_provider ?? "unpaid")}</td><td>{sqDeliveryMethod(String(order.delivery_method ?? "delivery"))}</td><td>{String(order.city ?? "")}</td></tr>)}</tbody>
          </table>
          {!filtered.length && <p className="p-8 text-center text-muted-foreground">Nuk u gjetën porosi.</p>}
        </div>
      </Card>
    </section>
  );
}
