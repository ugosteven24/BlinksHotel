
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { ArrowRight } from "lucide-react";
export default function PopularDestinations() {
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
                    .slice(0, 5);

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
            <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <div className="mb-2 inline-flex items-center gap-2 text-primary">
                        <span className="material-symbols-outlined text-[18px]">
                            explore
                        </span>

                        <span className="font-label-md text-label-md">
                            CURATED GEOGRAPHIES
                        </span>
                    </div>

                    <h2 className="font-headline-lg text-headline-lg-mobile font-bold tracking-tight text-on-surface md:text-headline-lg">
                        Explore Popular Destinations
                    </h2>

                    <p className="mt-2 font-body-md text-body-md text-text-secondary">
                        Discover popular places to stay and explore.
                    </p>
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
            </div>

            {/* Loading state */}
            {loading && (
                <div className="flex h-[300px] items-center justify-center">
                    <p className="text-text-secondary">
                        Loading destinations...
                    </p>
                </div>
            )}

            {/* Error state */}
            {!loading && error && (
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
            )}

            {/* Empty state */}
            {!loading && !error && destinations.length === 0 && (
                <div className="rounded-xl bg-surface-container p-8 text-center">
                    <p className="text-text-secondary">
                        No destinations found.
                    </p>
                </div>
            )}


            {/* Overlapping destination cards — all screen sizes */}
            {!loading && !error && destinations.length > 0 && (
                <div className="relative h-[240px] w-full sm:h-[300px] md:h-[360px]">
                    {destinations.map((destination, index) => {
                        const cardWidth =
                            destinations.length === 1 ? 100 : 64;

                        const leftPosition =
                            destinations.length === 1
                                ? 0
                                : (index / (destinations.length - 1)) *
                                (100 - cardWidth);

                        return (
                            <Link
                                key={destination.city.toLowerCase()}
                                href={`/pages/destinationdetails?destination=${encodeURIComponent(
                                    destination.city
                                )}`}
                                aria-label={`Explore ${destination.city}, ${destination.length} hotels`}
                                className="group absolute inset-y-0 overflow-hidden rounded-xl border-2 border-white bg-surface-container shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl sm:rounded-2xl"
                                style={{
                                    left: `${leftPosition}%`,
                                    width: `${cardWidth}%`,
                                    zIndex: index + 1,
                                }}
                            >
                                {/* Cover image */}
                                {destination.coverImage && (
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                        style={{
                                            backgroundImage: `url("${destination.coverImage}")`,
                                        }}
                                    />
                                )}

                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                                {/* Hotel count */}
                                <div className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[10px] font-semibold text-gray-900 shadow-md sm:left-4 sm:top-4 sm:px-3 sm:py-1.5 sm:text-sm">
                                    <span className="material-symbols-outlined text-xs sm:text-base">
                                        apartment
                                    </span>

                                    {destination.length}{" "}
                                    {destination.length === 1 ? "Hotel" : "Hotels"}
                                </div>

                                {/* Destination details */}
                                <div className="absolute bottom-4 left-3 right-2 z-10 sm:bottom-7 sm:left-6 sm:right-4">
                                    <h3 className="text-base font-bold leading-tight text-white sm:text-2xl">
                                        {destination.city}
                                    </h3>

                                    <p className="mt-1 text-[10px] text-white/80 sm:text-sm">
                                        Explore stays in {destination.city}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}


        </section>
    );
}
