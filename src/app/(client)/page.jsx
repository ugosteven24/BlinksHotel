
"use client";

import { useState } from "react";
import Link from "next/link";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "@/firebase/firebase";

import {
  Search,
  MapPin,
  CalendarDays,
  Users,
  ChevronDown,
  ArrowRight,
  Waves,
  Wifi,
  Utensils,
  Dumbbell,
  Star,
  LoaderCircle,
} from "lucide-react";

import PopularDestinations from "@/components/homepage/PopularDestinations";
import PopularHotels from "@/components/homepage/PopularHotels";
import Accountintro from "@/components/homepage/Accountintro";
import HotelsDestinations from "@/components/homepage/hotelsDestinations";

const amenityIcons = {
  Pool: Waves,
  Spa: Waves,
  WiFi: Wifi,
  Restaurant: Utensils,
  "Fitness Center": Dumbbell,
  "Beach Access": Waves,
};

// Get today's date using the user's local timezone.
function getToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function normalizeResort(data, id) {
  const location = [
    data.city,
    data.state,
    data.country,
  ]
    .filter(Boolean)
    .join(", ");

  const rawImages = Array.isArray(data.images)
    ? data.images
    : [];

  const image =
    rawImages
      .map((item) =>
        typeof item === "string" ? item : item?.url
      )
      .find(Boolean) ||
    data.image ||
    data.imageUrl ||
    data.photoURL ||
    data.coverImage ||
    "";

  return {
    id,
    name: data.name || data.title || "Unnamed resort",
    location: location || data.address || "Location unavailable",
    country: data.country || "",
    city: data.city || "",
    state: data.state || "",
    type: data.type || data.resortType || "",
    price: Number(
      data.pricePerNight ??
      data.price ??
      data.nightlyPrice ??
      0
    ),
    rating: Number(data.rating || 0),
    reviews: Number(data.reviews ?? data.reviewCount ?? 0),
    badge: data.badge || "",
    badgeType: data.badgeType || "",
    amenities: Array.isArray(data.amenities)
      ? data.amenities
      : [],
    image,
    status: String(data.status || "active").toLowerCase(),
  };
}

function getHotelDetailsUrl(resort, searchData) {
  const params = new URLSearchParams();

  if (searchData.checkIn) {
    params.set("checkIn", searchData.checkIn);
  }

  if (searchData.checkOut) {
    params.set("checkOut", searchData.checkOut);
  }

  if (searchData.guests) {
    params.set("guests", searchData.guests);
  }

  return `/dashboard/hoteldetails/${encodeURIComponent(
    resort.id
  )}?${params.toString()}`;
}

export default function ResortsPage() {
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");

  const [resorts, setResorts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const [searchData, setSearchData] = useState({
    destination: "",
    checkIn: "",
    checkOut: "",
    guests: "2",
  });

  // Search the hotels collection.
  async function handleSearch(event) {
    event.preventDefault();

    setError("");

    // Validate dates.
    if (checkIn && checkOut && checkOut <= checkIn) {
      setError("Check-out date must be after check-in date.");
      return;
    }

    if ((checkIn && !checkOut) || (!checkIn && checkOut)) {
      setError("Please select both check-in and check-out dates.");
      return;
    }

    if (checkIn && checkIn < getToday()) {
      setError("Check-in date cannot be in the past.");
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setResorts([]);

    const currentSearch = {
      destination: destination.trim(),
      checkIn,
      checkOut,
      guests,
    };

    setSearchData(currentSearch);

    try {
      // Fetch hotels from Firestore.
      const hotelsRef = collection(db, "hotels");
      const snapshot = await getDocs(hotelsRef);

      const searchTerm = currentSearch.destination.toLowerCase();

      const results = snapshot.docs
        .map((document) =>
          normalizeResort(document.data(), document.id)
        )
        .filter((resort) => {
          // Ignore inactive hotels.
          if (resort.status === "inactive") {
            return false;
          }

          // If destination is empty, show all active hotels.
          if (!searchTerm) {
            return true;
          }

          // Search hotel name and location.
          const searchableText = [
            resort.name,
            resort.location,
            resort.city,
            resort.state,
            resort.country,
            resort.type,
          ]
            .join(" ")
            .toLowerCase();

          return searchableText.includes(searchTerm);
        });

      setResorts(results);
    } catch (err) {
      console.error("Hotel search failed:", err);
      setError("Unable to search hotels. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Return to the homepage recommendations.
  function clearSearch() {
    setDestination("");
    setCheckIn("");
    setCheckOut("");
    setGuests("2");
    setResorts([]);
    setHasSearched(false);
    setError("");
  }

  return (
    <main>

      {/* Hero section */}
      <section className="resort-hero">
        <div className="hero-overlay" />

        <div className="hero-content">
          <span className="hero-label">
            <Waves size={15} />
            Explore Resorts
          </span>

          <h1>
            Discover Your
            <br />
            Perfect Resort
          </h1>

          <p>
            Explore resort stays, compare prices, and find
            a destination that suits you.
          </p>
        </div>
      </section>

      {/* Search form */}
      <section
        className="resort-search-wrap"
        id="resort-search"
      >
        <form
          className="resort-search"
          onSubmit={handleSearch}
        >

          {/* Destination */}
          <label className="search-field destination-field">
            <MapPin size={21} />

            <span>
              <strong>Destination</strong>

              <input
                type="text"
                placeholder="Hotel, city or destination"
                value={destination}
                onChange={(event) =>
                  setDestination(event.target.value)
                }
              />
            </span>
          </label>

          {/* Check-in */}
          <label className="search-field">
            <CalendarDays size={21} />

            <span>
              <strong>Check In</strong>

              <input
                type="date"
                min={getToday()}
                value={checkIn}
                onChange={(event) => {
                  setCheckIn(event.target.value);

                  if (
                    checkOut &&
                    event.target.value >= checkOut
                  ) {
                    setCheckOut("");
                  }
                }}
              />
            </span>
          </label>

          {/* Check-out */}
          <label className="search-field">
            <CalendarDays size={21} />

            <span>
              <strong>Check Out</strong>

              <input
                type="date"
                min={checkIn || getToday()}
                value={checkOut}
                onChange={(event) =>
                  setCheckOut(event.target.value)
                }
              />
            </span>
          </label>

          {/* Guests */}
          <label className="search-field guests-field">
            <Users size={21} />

            <span>
              <strong>Guests</strong>

              <select
                value={guests}
                onChange={(event) =>
                  setGuests(event.target.value)
                }
              >
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4 Guests</option>
                <option value="5">5 Guests</option>
                <option value="6">6 Guests</option>
              </select>
            </span>

            <ChevronDown size={15} />
          </label>

          {/* Submit */}
          <button
            className="search-resorts-button"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoaderCircle
                  size={18}
                  className="animate-spin"
                />
                Searching...
              </>
            ) : (
              <>
                <Search size={18} />
                Search Resorts
              </>
            )}
          </button>
        </form>

        {error && (
          <p className="search-error" role="alert">
            {error}
          </p>
        )}
      </section>

      <div className="px-5 lg:px-19">

        {/* Search results */}
        {hasSearched ? (
          <section className="resorts-results">

            <div className="results-heading">
              <div>
                <h2>Search Results</h2>

                <p>
                  {loading
                    ? "Searching available hotel records..."
                    : `${resorts.length} hotels found`}
                </p>
              </div>

              <button
                type="button"
                className="view-details-button"
                onClick={clearSearch}
              >
                Clear Search
              </button>
            </div>

            {loading ? (
              <div className="no-resorts">
                <LoaderCircle
                  size={32}
                  className="animate-spin"
                />
                <p>Searching hotels...</p>
              </div>
            ) : resorts.length > 0 ? (
              <div className="resorts-grid">

                {resorts.map((resort) => (
                  <article
                    className="resort-card"
                    key={resort.id}
                  >
                    <div className="resort-image-wrap">

                      {resort.image ? (
                        <img
                          src={resort.image}
                          alt={resort.name}
                          className="resort-image"
                          loading="lazy"
                        />
                      ) : (
                        <div className="resort-no-image">
                          <Waves size={34} />
                          <span>No image available</span>
                        </div>
                      )}

                      {resort.badge && (
                        <span
                          className={`resort-badge ${resort.badgeType}`}
                        >
                          {resort.badge}
                        </span>
                      )}

                      {resort.rating > 0 && (
                        <span className="image-rating">
                          <Star
                            size={13}
                            fill="currentColor"
                          />
                          {resort.rating}
                          <span>({resort.reviews})</span>
                        </span>
                      )}
                    </div>

                    <div className="resort-card-body">
                      <h3>{resort.name}</h3>

                      <p className="resort-location">
                        <MapPin size={14} />
                        {resort.location}

                        {resort.type && (
                          <>
                            <span>·</span>
                            {resort.type}
                          </>
                        )}
                      </p>

                      <div className="resort-amenities">
                        {resort.amenities
                          .slice(0, 4)
                          .map((amenity) => {
                            const Icon =
                              amenityIcons[amenity] || Waves;

                            return (
                              <span
                                key={amenity}
                                title={amenity}
                              >
                                <Icon size={14} />
                                {amenity}
                              </span>
                            );
                          })}
                      </div>

                      <div className="resort-card-bottom">
                        <div className="resort-price">
                          {resort.price > 0 ? (
                            <>
                              <strong>
                                {resort.price.toLocaleString(
                                  "en-NG",
                                  {
                                    style: "currency",
                                    currency: "NGN",
                                    maximumFractionDigits: 0,
                                  }
                                )}
                              </strong>
                              <span>/ night</span>
                            </>
                          ) : (
                            <span>Price unavailable</span>
                          )}
                        </div>

                        <Link
                          href={getHotelDetailsUrl(
                            resort,
                            searchData
                          )}
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
              <div className="no-resorts">
                <Search size={36} />

                <h3>No hotels found</h3>

                <p>
                  We couldn't find hotels matching your
                  destination. Try another city or hotel name.
                </p>

                <button
                  type="button"
                  className="view-details-button"
                  onClick={clearSearch}
                >
                  Search Again
                </button>
              </div>
            )}

          </section>
        ) : (
          <>
            <HotelsDestinations />
            <PopularDestinations />
            <Accountintro />
            <PopularHotels />
          </>
        )}

      </div>
    </main>
  );
}
