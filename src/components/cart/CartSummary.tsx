import { formatCurrency } from "../../lib/utils";
import type { CartTotals } from "../../types/cart";
import { Card, CardContent, CardHeader } from "../ui/card";

export function CartSummary({ totals, deliveryLabel }: { totals: CartTotals; deliveryLabel?: string }) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-black">Përmbledhja e çmimit</h2>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex justify-between"><span>Nëntotali</span><strong>{formatCurrency(totals.subtotal)}</strong></div>
        <div className="flex justify-between"><span>Dërgesa</span><strong>{totals.deliveryCost ? formatCurrency(totals.deliveryCost) : "Falas"}</strong></div>
        {deliveryLabel && <div className="flex justify-between text-muted-foreground"><span>Marrja</span><span>{deliveryLabel}</span></div>}
        <div className="flex justify-between text-green-700"><span>Zbritja</span><strong>-{formatCurrency(totals.discount)}</strong></div>
        <div className="border-t pt-3 text-lg font-black flex justify-between"><span>Totali</span><span>{formatCurrency(totals.total)}</span></div>
      </CardContent>
    </Card>
  );
}
