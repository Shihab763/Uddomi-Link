export function StarDisplay({ rating, showNumber = true }) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div className="flex items-center gap-1">
            {[...Array(fullStars)].map((_, i) => (
                <span key={`full-${i}`} className="text-yellow-400">⭐</span>
            ))}
            {hasHalfStar && <span className="text-yellow-400">⭐</span>}
            {[...Array(emptyStars)].map((_, i) => (
                <span key={`empty-${i}`} className="text-gray-300">⭐</span>
            ))}
            {showNumber && <span className="text-sm text-gray-600 ml-1">{rating.toFixed(1)}</span>}
        </div>
    );
}

export function StarInput({ rating, setRating }) {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="text-3xl transition hover:scale-110"
                >
                    {star <= rating ? (
                        <span className="text-yellow-400">★</span>
                    ) : (
                        <span className="text-gray-400">☆</span>
                    )}
                </button>
            ))}
            <span className="ml-3 text-lg font-semibold text-gray-700">
                {rating} {rating === 1 ? 'star' : 'stars'}
            </span>
        </div>
    );
}
