export function statusLabel(value: string) {
  const labels: Record<string, string> = {
    pending: "në pritje",
    confirmed: "konfirmuar",
    processing: "duke u përgatitur",
    shipped: "dërguar",
    delivered: "dorëzuar",
    cancelled: "anuluar",
  };
  return labels[value] ?? value;
}
