
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { ArrowRight } from "lucide-react";
export default function hotelsDestinations() {
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function fetchDestinations() {
            try {
                setLoading(true);
                setError("");

                const snapshot = await getDocs(collection(db, "hotels"));

                const cities = new Map();

                snapshot.forEach((hotelDoc) => {
                    const hotel = hotelDoc.data();
                    const city = hotel.city?.trim();

                    if (!city) return;

                    const key = city.toLowerCase();

                    if (!cities.has(key)) {
                        cities.set(key, {
                            city,
                            coverImage: hotel.coverImage || "",
                            length: 0,
                        });
                    }

                    const destination = cities.get(key);

                    destination.length += 1;

                    // Use the first available coverImage for this city.
                    if (!destination.coverImage && hotel.coverImage) {
                        destination.coverImage = hotel.coverImage;
                    }
                });

                const results = Array.from(cities.values())
                    .sort((a, b) => b.length - a.length)


                if (!cancelled) {
                    setDestinations(results);
                }
            } catch (err) {
                console.error("Failed to fetch destinations:", err);

                if (!cancelled) {
                    setError("Unable to load destinations. Please try again.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchDestinations();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <section className="mx-auto px-margin-mobile pb-16 pt-20 md:px-margin">
            {/* Section heading */}
            <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div className="max-w-3xl">
                    {/* Section label */}
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-blue-700">
                        <span className="material-symbols-outlined text-[18px]">
                            explore
                        </span>

                        <span className="text-[11px] font-bold uppercase tracking-[0.16em]">
                            Curated Geographies
                        </span>
                    </div>

                    {/* Heading */}
                    <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-[42px]">
                        Where Will You {" "}
                        <span className="text-blue-600">Stay Next?</span>
                    </h2>

                    {/* Description */}
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                        Discover remarkable places to stay, from vibrant city escapes
                        to peaceful retreats. Explore inspiring destinations, find
                        accommodation that suits your journey, and plan your next
                        memorable experience.
                    </p>
                </div>
            </div>

            <Link
                href="/pages/destinations"
                className="inline-flex items-center gap-1 font-label-md text-primary transition-colors hover:opacity-75"
            >
                <span>Explore all destinations</span>

                <span className="material-symbols-outlined text-[18px]">
                    <ArrowRight size={20} />
                </span>
            </Link>
    

            {/* Loading state */ }
    {
        loading && (
            <div className="flex h-[300px] items-center justify-center">
                <p className="text-text-secondary">
                    Loading destinations...
                </p>
            </div>
        )
    }

    {/* Error state */ }
    {
        !loading && error && (
            <div className="rounded-xl bg-surface-container p-6 text-center">
                <p className="text-text-secondary">{error}</p>

                <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-3 font-semibold text-primary"
                >
                    Try again
                </button>
            </div>
        )
    }

    {/* Empty state */ }
    {
        !loading && !error && destinations.length === 0 && (
            <div className="rounded-xl bg-surface-container p-8 text-center">
                <p className="text-text-secondary">
                    No destinations found.
                </p>
            </div>
        )
    }

    {/* Overlapping destination cards */ }

    {/* Destination cards */ }
    {
        !loading && !error && destinations.length > 0 && (
            <>
                {/* Mobile: vertical cards */}

                {/* Mobile: 2-column destination grid */}
                <div className="grid grid-cols-2 gap-3 md:hidden">
                    {destinations.map((destination) => (
                        <Link
                            key={destination.city.toLowerCase()}
                            href={`/pages/destinationdetails?destination=${encodeURIComponent(
                                destination.city
                            )}`}
                            className="group relative h-52 overflow-hidden rounded-xl shadow-md"
                        >
                            {/* Cover image */}
                            {destination.coverImage && (
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                                    style={{
                                        backgroundImage: `url("${destination.coverImage}")`,
                                    }}
                                />
                            )}

                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                            {/* Hotel count: top-left */}
                            <div className="absolute left-2 top-2 z-10 rounded-full bg-white/95 px-2 py-1 text-[11px] font-semibold text-gray-900 shadow">
                                {destination.length}{" "}
                                {destination.length === 1 ? "Hotel" : "Hotels"}
                            </div>

                            {/* City name */}
                            <div className="absolute bottom-4 left-3 right-2 z-10">
                                <h3 className="text-lg font-bold leading-tight text-white">
                                    {destination.city}
                                </h3>

                                <p className="mt-1 text-xs text-white/80">
                                    Explore stays
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>


                {/* Tablet: two-column grid */}
                <div className="hidden grid-cols-2 gap-5 md:grid lg:hidden">
                    {destinations.map((destination) => (
                        <Link
                            key={destination.city.toLowerCase()}
                            href={`/pages/destinationdetails?destination=${encodeURIComponent(
                                destination.city
                            )}`}
                            className="group relative h-64 overflow-hidden rounded-2xl shadow-md"
                        >
                            {destination.coverImage && (
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                                    style={{
                                        backgroundImage: `url("${destination.coverImage}")`,
                                    }}
                                />
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                            <div className="absolute left-4 top-4 z-10 rounded-full bg-white/95 px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-md">
                                {destination.length}{" "}
                                {destination.length === 1 ? "Hotel" : "Hotels"}
                            </div>

                            <div className="absolute bottom-6 left-5 z-10">
                                <h3 className="text-2xl font-bold text-white">
                                    {destination.city}
                                </h3>
                                <p className="mt-1 text-sm text-white/80">
                                    Explore stays in {destination.city}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>


                {/* Desktop: 4-column destination grid */}
                <div className="hidden w-full grid-cols-4 gap-5 lg:grid">
                    {destinations.map((destination) => (
                        <Link
                            key={destination.city.toLowerCase()}
                            href={`/pages/destinationdetails?destination=${encodeURIComponent(
                                destination.city
                            )}`}
                            aria-label={`Explore ${destination.city}, ${destination.length} hotels`}
                            className="group relative h-[360px] overflow-hidden rounded-1xl border border-white bg-surface-container shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                        >
                            {destination.coverImage && (
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                    style={{
                                        backgroundImage: `url("${destination.coverImage}")`,
                                    }}
                                />
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                            {/* Hotel count */}
                            <div className="absolute left-4 top-4 z-10 flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-md">
                                <span className="material-symbols-outlined text-base">
                                    apartment
                                </span>
                                {destination.length}{" "}
                                {destination.length === 1 ? "Hotel" : "Hotels"}
                            </div>

                            {/* Destination details */}
                            <div className="absolute bottom-7 left-5 right-4 z-10">
                                <h3 className="text-2xl font-bold text-white">
                                    {destination.city}
                                </h3>

                                <p className="mt-1 text-sm text-white/80">
                                    Explore stays in {destination.city}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

            </>
        )
    }

        </section >
    );
}
