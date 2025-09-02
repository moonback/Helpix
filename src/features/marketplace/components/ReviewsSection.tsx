import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, User, MessageCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useMarketplaceStore } from '@/stores/marketplaceStore';
import { RentalReview } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface ReviewsSectionProps {
  itemId: number;
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ itemId }) => {
  const { fetchReviews, reviews } = useMarketplaceStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadReviews = async () => {
      setIsLoading(true);
      try {
        await fetchReviews(itemId);
      } finally {
        setIsLoading(false);
      }
    };
    loadReviews();
  }, [itemId, fetchReviews]);

  // Filtrer les avis pour cet objet
  const itemReviews = reviews.filter(review => 
    // TODO: Ajouter une relation item_id dans les avis
    true // Pour l'instant, on affiche tous les avis
  );

  const averageRating = itemReviews.length > 0 
    ? itemReviews.reduce((sum, review) => sum + review.rating, 0) / itemReviews.length
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: itemReviews.filter(review => review.rating === star).length,
    percentage: itemReviews.length > 0 
      ? (itemReviews.filter(review => review.rating === star).length / itemReviews.length) * 100
      : 0
  }));

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded mb-4 w-1/3"></div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded w-1/4 mb-1"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/6"></div>
                  </div>
                </div>
                <div className="h-4 bg-slate-200 rounded w-full mb-1"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          Avis ({itemReviews.length})
        </h2>
        {averageRating > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(averageRating)
                      ? 'text-yellow-500 fill-current'
                      : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-slate-700">
              {averageRating.toFixed(1)}/5
            </span>
          </div>
        )}
      </div>

      {itemReviews.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-800 mb-2">Aucun avis</h3>
          <p className="text-slate-600 text-sm">
            Soyez le premier à laisser un avis sur cet objet !
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Distribution des notes */}
          {averageRating > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">Distribution des notes</h3>
                <div className="space-y-2">
                  {ratingDistribution.map(({ star, count, percentage }) => (
                    <div key={star} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-8">
                        <span className="text-sm text-slate-600">{star}</span>
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      </div>
                      <div className="flex-1 bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-slate-600 w-8 text-right">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <div className="text-4xl font-bold text-slate-800 mb-2">
                  {averageRating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(averageRating)
                          ? 'text-yellow-500 fill-current'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-slate-600">
                  Basé sur {itemReviews.length} avis
                </p>
              </div>
            </div>
          )}

          {/* Liste des avis */}
          <div className="space-y-4">
            {itemReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-slate-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {(review.reviewer?.display_name || 'A')[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">
                        {review.reviewer?.display_name || 'Utilisateur anonyme'}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                star <= review.rating
                                  ? 'text-yellow-500 fill-current'
                                  : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-slate-500">
                          {new Date(review.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {review.comment && (
                  <p className="text-slate-700 text-sm leading-relaxed">
                    {review.comment}
                  </p>
                )}

                {/* Actions sur l'avis */}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
                  <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-600 transition-colors">
                    <ThumbsUp className="w-3 h-3" />
                    Utile
                  </button>
                  <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-600 transition-colors">
                    <ThumbsDown className="w-3 h-3" />
                    Pas utile
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bouton pour voir plus d'avis */}
          {itemReviews.length > 5 && (
            <div className="text-center">
              <Button
                variant="outline"
                className="border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Voir tous les avis ({itemReviews.length})
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default ReviewsSection;
