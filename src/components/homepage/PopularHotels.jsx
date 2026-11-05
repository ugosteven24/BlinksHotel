
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
    <main className="">

      <div className="resorts-results">

        {/* HEADER */}

        <div className="results-heading">

          <div>
            <h2>Popular Hotels</h2>

            <p>
              Showing {filteredHotels.length} of {hotels.length} loaded hotels
            </p>
          </div>

          <label className="sort-control">
            <span>Sort by:</span>

            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value)
              }
            >
              <option value="popular">Popularity</option>
              <option value="featured">Featured</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">
                Price: Low to High
              </option>
              <option value="price-high">
                Price: High to Low
              </option>
            </select>

            <ChevronDown size={15} />
          </label>

        </div>

        {/* SEARCH */}



        <input
          className="hotel-search-input py-14"
          type="text"
          placeholder="Search hotel, city or location..."
          value={searchTerm}
          onChange={(event) =>
            setSearchTerm(event.target.value)
          }
        />


        {/* INITIAL LOADING */}

        {loading && hotels.length === 0 ? (
          <div className="destination-loading-inline ">
            <div className="destination-spinner" />
            <p>Loading hotels...</p>
          </div>
        ) : error && hotels.length === 0 ? (
          <div className="no-resorts">
            <h3>Unable to load hotels</h3>
            <p>{error}</p>

            <button
              type="button"
              className="view-details-button"
              onClick={retryLoading}
            >
              Try again
            </button>
          </div>
        ) : filteredHotels.length > 0 ? (

          /* HOTEL GRID */

          <div className="resorts-grid">

            {filteredHotels.map((hotel) => (
              <article
                className="resort-card"
                key={hotel.id}
              >

                <div className="resort-image-wrap">

                  {hotel.image ? (
                    <img
                      src={hotel.image}
                      alt={hotel.name}
                      className="resort-image"
                      loading="lazy"
                    />
                  ) : (
                    <div className="resort-image">
                      No image available
                    </div>
                  )}

                  {hotel.featured && (
                    <span className="resort-badge popular">
                      Featured
                    </span>
                  )}

                  <button
                    type="button"
                    className={`favorite-button ${favorites.includes(hotel.id) ? "is-favorite" : ""
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
                      fill={
                        favorites.includes(hotel.id)
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </button>

                  {hotel.rating > 0 && (
                    <span className="image-rating">
                      <Star
                        size={13}
                        fill="currentColor"
                      />

                      {hotel.rating}

                      <span>
                        ({hotel.reviews})
                      </span>
                    </span>
                  )}

                </div>

                <div className="resort-card-body">

                  <h3>{hotel.name}</h3>

                  <p className="resort-location">
                    <MapPin size={14} />

                    {hotel.location || "Location unavailable"}

                    <span>·</span>

                    {hotel.type}
                  </p>

                  {hotel.verified && (
                    <span className="hotel-verified">
                      <ShieldCheck size={14} />
                      Verified property
                    </span>
                  )}

                  <div className="resort-amenities">

                    {hotel.amenities.slice(0, 4).map(
                      (amenity, index) => {
                        const Icon =
                          amenityIcons[amenity] || Waves;

                        return (
                          <span
                            key={`${amenity}-${index}`}
                            title={amenity}
                          >
                            <Icon size={14} />

                            {amenity === "Fitness Center"
                              ? "Fitness"
                              : amenity}
                          </span>
                        );
                      }
                    )}

                  </div>

                  <div className="resort-card-bottom">

                    <div className="resort-price">
                      {/* <strong>
                          {formatPrice(hotel.price)}
                        </strong>

                        <span>/ night</span> */}
                    </div>

                    <Link
                      href={`/pages/hoteldetails/${encodeURIComponent(
                        hotel.id
                      )}`}
                      className="view-details-button"
                    >
                      View Details
                      <ArrowRight size={15} />
                    </Link>

                  </div>

                </div>

              </article>
            ))}

          </div>

        ) : (

          /* EMPTY STATE */

          <div className="no-resorts">
            <Search size={34} />

            <h3>No hotels found</h3>

            <p>
              Try another search or clear your filters.
            </p>

            <button
              type="button"
              className="view-details-button"
              onClick={clearFilters}
            >
              Clear Search
            </button>
          </div>

        )}

        {/* INFINITE SCROLL */}

        <div
          ref={sentinelRef}
          className="infinite-scroll-trigger"
        />

        {loadingMore && (
          <div className="destination-loading-inline">
            <div className="destination-spinner" />
            <p>Loading more hotels...</p>
          </div>
        )}

        {error && hotels.length > 0 && (
          <div className="infinite-scroll-error">
            <p>{error}</p>

            <button
              type="button"
              onClick={retryLoading}
            >
              Try again
            </button>
          </div>
        )}

        {/* MANUAL FALLBACK */}


        {!loading && hasMore && (
          <div className="flex w-full justify-center items-center py-8">
            <button
              type="button"
              disabled={loadingMore}
              onClick={() => fetchHotels(false)}
              className="flex items-center justify-center gap-3 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loadingMore ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Loading hotels...
                </>
              ) : (
                "Load More Hotels"
              )}
            </button>
          </div>
        )}


        {!hasMore && hotels.length > 0 && (
          <p className="end-of-hotels">
            You have reached the end of the hotels.
          </p>
        )}

      </div>
      {/* LOGIN REQUIRED DIALOG */}

      {showLoginDialog && (
        <div className="favorite-dialog-overlay">

          <div className="favorite-dialog">

            <button
              type="button"
              className="favorite-dialog-close"
              onClick={() => setShowLoginDialog(false)}
              aria-label="Close dialog"
            >
              <X size={20} />
            </button>

            <div className="favorite-dialog-icon">
              <Heart size={28} />
            </div>

            <h3>Sign in to save favorites</h3>

            <p>
              You need to sign in to your account before
              you can add hotels to your favorites.
            </p>

            <div className="favorite-dialog-actions">

              <Link
                href="/login?redirect=/"
                className="favorite-login-button"
              >
                Sign In
              </Link>

              <Link
                href="/register"
                className="favorite-register-button"
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
