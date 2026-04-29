import { useEffect, useState } from "react";
import { Card } from "../components/ui/card";
import { useAuth } from "../hooks/useAuth";
import { sqDeliveryMethod, sqPayment } from "../lib/albanian";
import { formatCurrency } from "../lib/utils";
import { getOrders } from "../services/orders";
import { statusLabel } from "../lib/status";

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  useEffect(() => { void getOrders(user?.id).then((data) => setOrders(data as Record<string, unknown>[])); }, [user?.id]);
  return (
    <div className="container-page py-8">
      <h1 className="text-3xl font-black">Porositë</h1>
      <div className="mt-6 space-y-4">
        {orders.length ? orders.map((order) => <Card key={String(order.id)} className="p-5"><div className="flex flex-wrap justify-between gap-3"><strong>Porosia {String(order.id).slice(0, 8)}</strong><span>{statusLabel(String(order.status))}</span><span>{sqDeliveryMethod(String(order.delivery_method ?? "delivery"))}</span><span>{sqPayment(String(order.payment_method ?? ""))}</span><span>{formatCurrency(Number(order.total ?? 0))}</span><span>{new Date(String(order.created_at)).toLocaleDateString()}</span></div></Card>) : <Card className="p-8 text-center text-muted-foreground">Ende nuk ke porosi.</Card>}
      </div>
    </div>
  );
}
