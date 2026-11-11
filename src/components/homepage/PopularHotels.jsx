
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import "./popular.css";
import {
  Search,
  MapPin,
  Heart,
  SlidersHorizontal,
  ChevronDown,
  ArrowRight,
  Waves,
  Wifi,
  Utensils,
  Dumbbell,
  Star,
  X,
} from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  documentId,
  getDocs,
  limit,
  orderBy,
  query,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  startAfter,
} from "firebase/firestore";


import { auth, db } from "@/firebase/firebase";
const PAGE_SIZE = 6;

const amenityIcons = {
  Pool: Waves,
  Spa: Waves,
  WiFi: Wifi,
  Restaurant: Utensils,
  "Fitness Center": Dumbbell,
  "Beach Access": Waves,
};

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function getRating(value) {
  if (typeof value === "number") return value;

  const match = String(value || "").match(/\d+(\.\d+)?/);

  return match ? Number(match[0]) : 0;
}

function formatPrice(value) {
  const price = Number(value);

  if (!Number.isFinite(price) || price <= 0) {
    return "Price unavailable";
  }

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);
}

// Convert Firestore hotel document into a consistent object.
function normalizeHotel(document) {
  const data = document.data();

  const galleryImages = safeArray(data.galleryImages);

  return {
    id: document.id,

    name: data.hotelName || "Unnamed hotel",

    image:
      data.coverImage ||
      galleryImages.find(
        (image) => typeof image === "string" && image.trim()
      ) ||
      "",

    location: [
      data.city,
      data.state,
      data.country,
    ].filter(Boolean).join(", "),

    city: data.city || "",
    state: data.state || "",
    country: data.country || "",

    price: Number(data.price) || 0,

    rating: getRating(data.starRating),

    reviews: Number(data.reviewCount) || 0,

    type: data.category || "Hotel",

    amenities: safeArray(data.amenities),

    featured: data.featured === true,

    verified: data.verified === true,

    status: String(data.status || "").toLowerCase(),
  };
}

export default function PopularHotels() {
  const [hotels, setHotels] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [sortBy, setSortBy] = useState("popular");

  const [favorites, setFavorites] = useState([]);

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [loading, setLoading] = useState(true);

  const [loadingMore, setLoadingMore] = useState(false);

  const [hasMore, setHasMore] = useState(true);

  const [error, setError] = useState("");

  const lastDocumentRef = useRef(null);

  const loadingRef = useRef(false);

  const observerRef = useRef(null);

  const sentinelRef = useRef(null);

  const [user, setUser] = useState(null);

  const [authLoading, setAuthLoading] = useState(true);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const [showLoginDialog, setShowLoginDialog] = useState(false);

  // ----------------------------------------
  // AUTHENTICATION AND RESTORE FAVORITES
  // ----------------------------------------

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setFavorites([]);
        setAuthLoading(false);
        return;
      }

      try {
        const favoritesRef = collection(
          db,
          "favorites",
          currentUser.uid,
          "hotels"
        );

        const snapshot = await getDocs(favoritesRef);

        const favoriteIds = snapshot.docs.map(
          (document) => document.id
        );

        setFavorites(favoriteIds);
      } catch (error) {
        console.error("Unable to retrieve favorites:", error);
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);
  // ----------------------------------------
  // FETCH HOTELS FROM FIRESTORE
  // ----------------------------------------

  const fetchHotels = useCallback(async (initial = false) => {
    // Prevent duplicate requests.
    if (loadingRef.current) return;

    if (!initial && !hasMore) return;

    loadingRef.current = true;

    if (initial) {
      setLoading(true);
      setError("");
      lastDocumentRef.current = null;
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const hotelsRef = collection(db, "hotels");

      const constraints = [
        orderBy(documentId()),
        limit(PAGE_SIZE),
      ];

      if (!initial && lastDocumentRef.current) {
        constraints.splice(
          1,
          0,
          startAfter(lastDocumentRef.current)
        );
      }

      const hotelsQuery = query(
        hotelsRef,
        ...constraints
      );

      const snapshot = await getDocs(hotelsQuery);

      const results = snapshot.docs
        .map(normalizeHotel)
        .filter((hotel) => hotel.status !== "inactive");

      if (snapshot.docs.length > 0) {
        lastDocumentRef.current =
          snapshot.docs[snapshot.docs.length - 1];
      }

      setHotels((previous) => {
        if (initial) return results;

        // Avoid duplicate documents.
        const existingIds = new Set(
          previous.map((hotel) => hotel.id)
        );

        const newHotels = results.filter(
          (hotel) => !existingIds.has(hotel.id)
        );

        return [...previous, ...newHotels];
      });

      setHasMore(snapshot.docs.length === PAGE_SIZE);

    } catch (err) {
      console.error("Hotel fetch error:", err);

      setError("Unable to load hotels. Please try again.");

    } finally {
      loadingRef.current = false;

      setLoading(false);
      setLoadingMore(false);
    }
  }, [hasMore]);

  // Initial fetch.
  useEffect(() => {
    fetchHotels(true);
  }, []);

  // ----------------------------------------
  // INFINITE SCROLL
  // ----------------------------------------

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !loadingRef.current
        ) {
          fetchHotels(false);
        }
      },
      {
        root: null,
        rootMargin: "300px",
        threshold: 0,
      }
    );

    observer.observe(sentinel);

    observerRef.current = observer;

    return () => {
      observer.disconnect();
    };
  }, [fetchHotels, hasMore, loading]);

  // ----------------------------------------
  // RESTORE FAVORITES
  // ----------------------------------------

  useEffect(() => {
    try {
      const saved = localStorage.getItem(
        "hotel-resort-favorites"
      );

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setFavorites(parsed);
        }
      }
    } catch {
      setFavorites([]);
    }
  }, []);

  // ----------------------------------------
  // ADD OR REMOVE FAVORITES
  // ----------------------------------------

  const toggleFavorite = async (hotel) => {

    // User must be authenticated
    if (!user) {
      setShowLoginDialog(true);
      return;
    }

    if (favoriteLoading) return;

    setFavoriteLoading(true);

    try {
      const favoriteRef = doc(
        db,
        "favorites",
        user.uid,
        "hotels",
        hotel.id
      );

      const isFavorite = favorites.includes(hotel.id);

      if (isFavorite) {

        // Remove favorite
        await deleteDoc(favoriteRef);

        setFavorites((previous) =>
          previous.filter((id) => id !== hotel.id)
        );

      } else {

        // Add favorite
        await setDoc(favoriteRef, {
          hotelId: hotel.id,
          hotelName: hotel.name,
          image: hotel.image,
          location: hotel.location,
          createdAt: serverTimestamp(),
        });

        setFavorites((previous) => [
          ...previous,
          hotel.id,
        ]);
      }

    } catch (error) {
      console.error("Favorite operation failed:", error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  // ----------------------------------------
  // SEARCH, FILTER AND SORT
  // ----------------------------------------

  const filteredHotels = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    let result = hotels.filter((hotel) => {
      const matchesSearch =
        !term ||
        hotel.name.toLowerCase().includes(term) ||
        hotel.location.toLowerCase().includes(term) ||
        hotel.type.toLowerCase().includes(term);

      return matchesSearch;
    });

    if (sortBy === "price-low") {
      result.sort((a, b) => {
        if (!a.price) return 1;
        if (!b.price) return -1;

        return a.price - b.price;
      });
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "featured") {
      result.sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured)
      );
    } else {
      result.sort((a, b) => b.reviews - a.reviews);
    }

    return result;
  }, [hotels, searchTerm, sortBy]);

  // ----------------------------------------
  // CLEAR FILTERS
  // ----------------------------------------

  const clearFilters = () => {
    setSearchTerm("");
    setSortBy("popular");
  };

  // ----------------------------------------
  // RETRY
  // ----------------------------------------

  const retryLoading = () => {
    if (hotels.length === 0) {
      fetchHotels(true);
    } else {
      fetchHotels(false);
    }
  };

  // ----------------------------------------
  // RENDER
  // ----------------------------------------

  return (
  
<main className="min-h-screen bg-slate-50">
    <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8">

        {/* RESULTS HEADER */}
        <div className="mb-8 flex flex-col justify-between gap-6 border-b border-slate-200 pb-7 md:flex-row md:items-end">

            <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">
                    <span className="material-symbols-outlined text-base">
                        hotel
                    </span>
                    Hotel Collection
                </div>

                <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                    Discover Popular Hotels
                </h2>

                <p className="mt-2 text-sm font-medium text-slate-500">
                    Explore exceptional stays and find the perfect place for your next journey.
                </p>

                <p className="mt-3 text-sm font-semibold text-slate-700">
                    Showing <span className="text-blue-700">{filteredHotels.length}</span> of {hotels.length} loaded hotels
                </p>
            </div>

            {/* SORT */}
            <label className="flex min-w-[220px] items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-blue-500">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Sort by
                </span>

                <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    className="min-w-0 flex-1 cursor-pointer bg-transparent text-sm font-bold text-slate-800 outline-none"
                >
                    <option value="popular">Popularity</option>
                    <option value="featured">Featured</option>
                    <option value="rating">Highest Rated</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                </select>

                <ChevronDown size={16} className="text-slate-400" />
            </label>
        </div>

        {/* SEARCH */}
        <div className="mb-9">
            <div className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition-all duration-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
                <Search size={21} className="shrink-0 text-slate-400 transition group-focus-within:text-blue-600" />

                <input
                    className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:font-normal placeholder:text-slate-400"
                    type="text"
                    placeholder="Search hotels, cities, destinations or locations..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                />

                {searchTerm && (
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50"
                    >
                        Clear
                    </button>
                )}
            </div>
        </div>

        {/* INITIAL LOADING */}
        {loading && hotels.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
                <p className="mt-4 text-sm font-semibold text-slate-500">
                    Discovering available hotels...
                </p>
            </div>

        ) : error && hotels.length === 0 ? (
            <div className="rounded-2xl border border-red-100 bg-white px-6 py-16 text-center shadow-sm">
                <h3 className="text-xl font-bold text-slate-900">
                    Unable to load hotels
                </h3>
                <p className="mt-2 text-sm text-slate-500">{error}</p>

                <button
                    type="button"
                    className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                    onClick={retryLoading}
                >
                    Try again
                </button>
            </div>

        ) : filteredHotels.length > 0 ? (

            /* HOTEL GRID */
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">

                {filteredHotels.map((hotel) => (
                    <article
                        key={hotel.id}
                        className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl"
                    >

                        {/* IMAGE */}
                        <div className="relative h-[245px] overflow-hidden bg-slate-100">

                            {hotel.image ? (
                                <img
                                    src={hotel.image}
                                    alt={hotel.name}
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-sm font-medium text-slate-400">
                                    No image available
                                </div>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />

                            {/* FEATURED */}
                            {hotel.featured && (
                                <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-extrabold text-slate-900 shadow-lg">
                                    <Star size={13} className="fill-amber-400 text-amber-400" />
                                    Featured
                                </span>
                            )}

                            {/* FAVORITE */}
                            <button
                                type="button"
                                className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition hover:scale-110 ${
                                    favorites.includes(hotel.id)
                                        ? "text-red-500"
                                        : "text-slate-600 hover:text-red-500"
                                }`}
                                aria-label={
                                    favorites.includes(hotel.id)
                                        ? "Remove from favorites"
                                        : "Add to favorites"
                                }
                                disabled={authLoading || favoriteLoading}
                                onClick={() => toggleFavorite(hotel)}
                            >
                                <Heart
                                    size={19}
                                    fill={favorites.includes(hotel.id) ? "currentColor" : "none"}
                                />
                            </button>

                            {/* RATING */}
                            {hotel.rating > 0 && (
                                <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-extrabold text-slate-900 shadow-lg">
                                    <Star size={14} className="fill-amber-400 text-amber-400" />
                                    {hotel.rating}

                                    <span className="text-xs font-medium text-slate-400">
                                        ({hotel.reviews} reviews)
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* CARD CONTENT */}
                        <div className="p-5">

                            <div className="mb-3">
                                <h3 className="line-clamp-1 text-xl font-extrabold tracking-tight text-slate-900 transition group-hover:text-blue-700">
                                    {hotel.name}
                                </h3>

                                <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-slate-500">
                                    <MapPin size={15} className="shrink-0 text-blue-600" />
                                    <span className="truncate">
                                        {hotel.location || "Location unavailable"}
                                    </span>
                                    <span className="text-slate-300">·</span>
                                    <span className="shrink-0">{hotel.type}</span>
                                </p>
                            </div>

                            {/* VERIFIED */}
                            {hotel.verified && (
                                <div className="mb-4 inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700">
                                    <ShieldCheck size={14} />
                                    Verified property
                                </div>
                            )}

                            {/* AMENITIES */}
                            <div className="flex min-h-[54px] flex-wrap content-start gap-2 border-t border-slate-100 py-4">
                                {hotel.amenities.slice(0, 4).map((amenity, index) => {
                                    const Icon = amenityIcons[amenity] || Waves;

                                    return (
                                        <span
                                            key={`${amenity}-${index}`}
                                            title={amenity}
                                            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-600"
                                        >
                                            <Icon size={13} className="text-slate-400" />

                                            {amenity === "Fitness Center"
                                                ? "Fitness"
                                                : amenity}
                                        </span>
                                    );
                                })}
                            </div>

                            {/* FOOTER */}
                            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                                <div>
                                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Accommodation
                                    </span>
                                    <p className="mt-1 text-sm font-bold text-slate-800">
                                        View property
                                    </p>
                                </div>

                                <Link
                                    href={`/pages/hoteldetails/${encodeURIComponent(hotel.id)}`}
                                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
                                >
                                    View Details
                                    <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </article>
                ))}

            </div>

        ) : (

            /* EMPTY STATE */
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <Search size={30} />
                </div>

                <h3 className="mt-5 text-xl font-extrabold text-slate-900">
                    No hotels found
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                    We couldn't find any properties matching your search.
                    Try another destination or clear your search.
                </p>

                <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                >
                    Clear Search
                </button>
            </div>
        )}

        {/* INFINITE SCROLL */}
        <div ref={sentinelRef} className="infinite-scroll-trigger" />

        {loadingMore && (
            <div className="flex items-center justify-center gap-3 py-10">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
                <p className="text-sm font-semibold text-slate-500">
                    Loading more hotels...
                </p>
            </div>
        )}

        {error && hotels.length > 0 && (
            <div className="mt-6 rounded-xl border border-red-100 bg-red-50 p-5 text-center">
                <p className="text-sm font-medium text-red-600">{error}</p>
                <button
                    type="button"
                    onClick={retryLoading}
                    className="mt-3 text-sm font-bold text-red-700 underline"
                >
                    Try again
                </button>
            </div>
        )}

        {/* MANUAL FALLBACK */}
        {!loading && hasMore && (
            <div className="flex w-full items-center justify-center py-10">
                <button
                    type="button"
                    disabled={loadingMore}
                    onClick={() => fetchHotels(false)}
                    className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-8 py-3.5 text-sm font-bold text-slate-800 shadow-sm transition hover:border-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loadingMore ? (
                        <>
                            <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
                            Loading hotels...
                        </>
                    ) : (
                        <>
                            Load More Hotels
                            <ArrowRight size={16} />
                        </>
                    )}
                </button>
            </div>
        )}

        {!hasMore && hotels.length > 0 && (
            <p className="py-10 text-center text-sm font-medium text-slate-400">
                You've explored all available hotels.
            </p>
        )}

    </div>

    {/* LOGIN REQUIRED DIALOG */}
    {showLoginDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">

            <div className="relative w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">

                <button
                    type="button"
                    className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                    onClick={() => setShowLoginDialog(false)}
                    aria-label="Close dialog"
                >
                    <X size={19} />
                </button>

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                    <Heart size={28} />
                </div>

                <h3 className="mt-6 text-2xl font-extrabold tracking-tight text-slate-900">
                    Save your favourite stays
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                    Sign in to your HotelReserve account to save hotels,
                    manage your favourites, and easily find them whenever
                    you're ready to book.
                </p>

                <div className="mt-7 flex flex-col gap-3">
                    <Link
                        href="/login?redirect=/"
                        className="flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700"
                    >
                        Sign In
                    </Link>

                    <Link
                        href="/register"
                        className="flex items-center justify-center rounded-xl border border-slate-200 px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                        Create Account
                    </Link>
                </div>
            </div>
        </div>
    )}
</main>

  );
}
