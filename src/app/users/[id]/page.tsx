"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface ReviewGiven {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewee: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface UserProfile {
  id: string;
  name: string | null;
  image: string | null;
  university: string | null;
  bio: string | null;
  memberSince: string;
  stats: {
    ridesAsDriver: number;
    ridesAsPassenger: number;
    totalReviews: number;
    averageRating: number | null;
  };
  reviews: Review[];
  reviewsGiven?: ReviewGiven[];
}

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const isOwnProfile = session?.user?.id === id;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/users/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("User not found");
          } else {
            setError("Failed to load profile");
          }
          return;
        }
        const data = await res.json();
        setUser(data);
      } catch (err) {
        setError("Failed to load profile");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-CA", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)] bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 text-center max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h1>
          <p className="text-gray-600 mb-6">This user doesn't exist or has been removed.</p>
          <Link href="/rides" className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors cursor-pointer">
            Browse Rides
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || "User"}
                className="w-32 h-32 rounded-full object-cover border-4 border-purple-100"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center border-4 border-purple-100">
                <span className="text-white font-bold text-4xl">
                  {user.name?.[0] || "?"}
                </span>
              </div>
            )}

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {user.name || "Anonymous"}
                </h1>
                {isOwnProfile && (
                  <Link
                    href="/profile"
                    className="px-3 py-1 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors cursor-pointer"
                  >
                    Edit
                  </Link>
                )}
              </div>

              {user.university && (
                <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600 mb-3">
                  <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                  <span className="font-medium">{user.university}</span>
                </div>
              )}

              {/* Rating */}
              {user.stats.averageRating !== null && (
                <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-5 h-5 ${star <= Math.round(user.stats.averageRating!) ? "text-yellow-400" : "text-gray-300"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="font-semibold text-gray-900">
                    {user.stats.averageRating.toFixed(1)}
                  </span>
                  <span className="text-gray-500">
                    ({user.stats.totalReviews} review{user.stats.totalReviews !== 1 ? "s" : ""})
                  </span>
                </div>
              )}

              {user.bio && (
                <p className="text-gray-600 mb-4">{user.bio}</p>
              )}

              <p className="text-sm text-gray-500">
                Member since {formatDate(user.memberSince)}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {user.stats.ridesAsDriver}
              </div>
              <div className="text-sm text-gray-500">Rides Offered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {user.stats.ridesAsPassenger}
              </div>
              <div className="text-sm text-gray-500">Rides Taken</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {user.stats.totalReviews}
              </div>
              <div className="text-sm text-gray-500">Reviews</div>
            </div>
          </div>
        </div>

        {/* Reviews Received Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Reviews Received</h2>

          {user.reviews.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <p className="text-gray-500">No reviews yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Reviews will appear after completed rides
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {user.reviews.map((review) => (
                <div key={review.id} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Link href={`/users/${review.reviewer.id}`} className="flex-shrink-0 cursor-pointer">
                      {review.reviewer.image ? (
                        <img
                          src={review.reviewer.image}
                          alt=""
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-purple-600 font-medium">
                            {review.reviewer.name?.[0] || "?"}
                          </span>
                        </div>
                      )}
                    </Link>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <Link href={`/users/${review.reviewer.id}`} className="font-medium text-gray-900 hover:text-purple-600 cursor-pointer">
                          {review.reviewer.name || "Anonymous"}
                        </Link>
                        <span className="text-xs text-gray-500">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      <div className="mt-1">{renderStars(review.rating)}</div>
                      {review.comment && (
                        <p className="text-gray-600 mt-2">{review.comment}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reviews Given Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Reviews Given</h2>

          {!user.reviewsGiven || user.reviewsGiven.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <p className="text-gray-500">No reviews given yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Reviews this user writes will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {user.reviewsGiven.map((review) => (
                <div key={review.id} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Link href={`/users/${review.reviewee.id}`} className="flex-shrink-0 cursor-pointer">
                      {review.reviewee.image ? (
                        <img
                          src={review.reviewee.image}
                          alt=""
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-purple-600 font-medium">
                            {review.reviewee.name?.[0] || "?"}
                          </span>
                        </div>
                      )}
                    </Link>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Reviewed</span>
                          <Link href={`/users/${review.reviewee.id}`} className="font-medium text-gray-900 hover:text-purple-600 cursor-pointer">
                            {review.reviewee.name || "Anonymous"}
                          </Link>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      <div className="mt-1">{renderStars(review.rating)}</div>
                      {review.comment && (
                        <p className="text-gray-600 mt-2">{review.comment}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

