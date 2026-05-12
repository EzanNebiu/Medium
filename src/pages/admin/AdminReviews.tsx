import { MessageCircle, Star, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { showToast } from "../../components/ui/toast";
import { storeWhatsAppUrl } from "../../lib/whatsapp";
import { deleteReview, getAllReviews } from "../../services/reviews";
import type { Review } from "../../types/review";

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    const data = await getAllReviews();
    setReviews(data);
    setLoading(false);
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("A je i sigurt që dëshiron ta fshish këtë vlerësim?")) return;
    
    const { error } = await deleteReview(reviewId);
    if (error) {
      showToast("Fshirja e vlerësimit dështoi", "error");
      return;
    }
    
    showToast("Vlerësimi u fshi");
    setReviews((prev) => prev.filter((review) => review.id !== reviewId));
  };

  if (loading) {
    return <Card className="p-6 text-sm font-semibold text-muted-foreground">Vlerësimet po ngarkohen...</Card>;
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">Vlerësimet</h1>
        <p className="text-muted-foreground">Menaxho vlerësimet e produkteve dhe kontakto klientët.</p>
      </div>

      {reviews.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Nuk ka asnjë vlerësim ende.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <Card key={review.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-bold">{review.rating}/5</span>
                  </div>
                  
                  <p className="text-sm leading-relaxed">{review.comment}</p>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{review.user_name}</span>
                    {review.user_phone && (
                      <span className="flex items-center gap-1">
                        📞 {review.user_phone}
                      </span>
                    )}
                    <Link 
                      to={`/products/${review.product_id}`}
                      className="text-primary hover:underline"
                    >
                      {review.product_name}
                    </Link>
                    <span>{new Date(review.created_at).toLocaleDateString("sq-AL")}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {review.user_phone && (
                    <a
                      href={storeWhatsAppUrl(`Përshëndetje ${review.user_name}, faleminderit për vlerësimin!`, review.user_phone)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button size="sm" variant="outline">
                        <MessageCircle className="h-4 w-4" /> WhatsApp
                      </Button>
                    </a>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => void handleDelete(review.id)}
                  >
                    <Trash2 className="h-4 w-4" /> Fshi
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
