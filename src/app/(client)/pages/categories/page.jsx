
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Search,
  MapPin,
  ChevronRight,
  Home,
  BedDouble,
  Building2,
  SlidersHorizontal,
  ArrowLeft,
} from "lucide-react";
import styles from "./categories.module.css";

const categories = [
  {
    id: 1,
    name: "Standard",
    slug: "standard",
    description: "Comfortable accommodation for everyday stays.",
    hotels: 12,
    rooms: 35,
    image:
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=900",
    type: "platform",
  },
  {
    id: 2,
    name: "Deluxe",
    slug: "deluxe",
    description: "Extra comfort with premium room facilities.",
    hotels: 10,
    rooms: 28,
    image:
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=900",
    type: "platform",
  },
  {
    id: 3,
    name: "Executive",
    slug: "executive",
    description: "Elegant rooms designed for business and leisure.",
    hotels: 7,
    rooms: 15,
    image:
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=900",
    type: "platform",
  },
  {
    id: 4,
    name: "Presidential",
    slug: "presidential",
    description: "Exclusive luxury accommodation and premium comfort.",
    hotels: 3,
    rooms: 5,
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=900",
    type: "platform",
  },
  {
    id: 5,
    name: "Family Suite",
    slug: "family-suite",
    description: "Spacious accommodation for families and groups.",
    hotels: 4,
    rooms: 8,
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=900",
    type: "platform",
  },
  {
    id: 6,
    name: "Royal Penthouse",
    slug: "royal-penthouse",
    description: "An exclusive accommodation experience.",
    hotels: 2,
    rooms: 3,
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900",
    type: "custom",
  },
];

export default function HotelCategoriesPage() {
  const params = useParams();

  const stateSlug = params.stateSlug || "imo";
  const citySlug = params.citySlug || "owerri";

  const stateName = stateSlug
    .replaceAll("-", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const cityName = citySlug
    .replaceAll("-", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const matchesSearch = category.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesFilter =
        activeFilter === "all" ||
        category.type === activeFilter;

      return (
        matchesSearch &&
        matchesFilter &&
        category.rooms > 0
      );
    });
  }, [search, activeFilter]);

  const totalHotels = 24;
  const totalRooms = 94;

  return (
    <main className={styles.page}>
      {/* HEADER */}


      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.locationTag}>
            <MapPin size={16} />
            {cityName}, {stateName}
          </span>

          <h1>
            Explore Hotel
            <span> Categories</span>
          </h1>

          <p>
            Find the perfect room category for your
            next stay in {cityName}.
          </p>
        </div>
      </section>

      {/* BREADCRUMB */}
      <div className={styles.breadcrumb}>
        <Link href="/">
          <Home size={17} />
        </Link>

        <ChevronRight size={15} />

        <Link href="/destinations">Destinations</Link>

        <ChevronRight size={15} />

        <Link href={`/destinations/${stateSlug}`}>
          {stateName}
        </Link>

        <ChevronRight size={15} />

        <Link href={`/destinations/${stateSlug}/${citySlug}`}>
          {cityName}
        </Link>

        <ChevronRight size={15} />

        <span>Categories</span>
      </div>

      {/* INTRODUCTION */}
      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.eyebrow}>
              FIND YOUR PERFECT STAY
            </span>

            <h2>Explore by Room Category</h2>

            <p>
              Browse available room categories across
              hotels in {cityName}.
            </p>
          </div>

          <div className={styles.hotelCount}>
            <Building2 size={20} />
            <span>
              <strong>{totalHotels}</strong>
              <small>Hotels</small>
            </span>
          </div>
        </div>

        {/* SEARCH AND FILTER */}
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <Search size={21} />
            <input
              type="search"
              placeholder="Search room categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className={styles.filters}>
            <SlidersHorizontal size={18} />

            <button
              className={activeFilter === "all" ? styles.selected : ""}
              onClick={() => setActiveFilter("all")}
            >
              All
            </button>

            <button
              className={activeFilter === "platform" ? styles.selected : ""}
              onClick={() => setActiveFilter("platform")}
            >
              Standard Categories
            </button>

            <button
              className={activeFilter === "custom" ? styles.selected : ""}
              onClick={() => setActiveFilter("custom")}
            >
              Hotel Specialties
            </button>
          </div>
        </div>

        {/* CATEGORY GRID */}
        <div className={styles.categoryGrid}>
          {filteredCategories.map((category) => (
            <Link
              href={`/destinations/${stateSlug}/${citySlug}/categories/${category.slug}`}
              key={category.id}
              className={styles.categoryCard}
            >
              <div className={styles.cardImage}>
                <img
                  src={category.image}
                  alt={category.name}
                />

                <span className={styles.roomBadge}>
                  {category.rooms} Rooms
                </span>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.cardTitle}>
                  <h3>{category.name}</h3>
                  <ChevronRight size={21} />
                </div>

                <p>{category.description}</p>

                <div className={styles.cardFooter}>
                  <span>
                    <Building2 size={16} />
                    {category.hotels} Hotels
                  </span>

                  <span>
                    <BedDouble size={16} />
                    {category.rooms} Rooms
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className={styles.empty}>
            <Search size={35} />
            <h3>No categories found</h3>
            <p>Try another search or filter.</p>
          </div>
        )}
      </section>

      {/* SUMMARY */}
      <section className={styles.summary}>
        <div>
          <BedDouble size={34} />
          <span>
            <small>Available room types</small>
            <strong>{totalRooms} Rooms</strong>
          </span>
        </div>

        <div>
          <Building2 size={34} />
          <span>
            <small>Registered accommodation</small>
            <strong>{totalHotels} Hotels</strong>
          </span>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <p>
          © {new Date().getFullYear()} HotelReserve.
          Stay Better. Travel Further.
        </p>
      </footer>
    </main>
  );
}
