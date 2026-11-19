
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Search,
  MapPin,
  ChevronRight,
  Home,
  Building2,
  BedDouble,
  SlidersHorizontal,
  ArrowLeft,
} from "lucide-react";

import styles from "./categories.module.css";

// Demo data: replace with MySQL data later.
const categories = [
  {
    id: 1,
    name: "Standard Rooms",
    slug: "standard",
    description: "Comfortable accommodation for everyday stays.",
    hotels: 12,
    rooms: 35,
    image:
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=500",
    type: "global",
  },
  {
    id: 2,
    name: "Deluxe Rooms",
    slug: "deluxe",
    description: "Premium comfort with upgraded room facilities.",
    hotels: 10,
    rooms: 28,
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=500",
    type: "global",
  },
  {
    id: 3,
    name: "Executive Rooms",
    slug: "executive",
    description: "Elegant accommodation for business and leisure.",
    hotels: 7,
    rooms: 15,
    image:
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500",
    type: "global",
  },
  {
    id: 4,
    name: "Presidential Suites",
    slug: "presidential",
    description: "Exclusive luxury and spacious accommodation.",
    hotels: 3,
    rooms: 5,
    image:
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=500",
    type: "global",
  },
  {
    id: 5,
    name: "Family Suites",
    slug: "family-suite",
    description: "Spacious rooms designed for families and groups.",
    hotels: 4,
    rooms: 8,
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=500",
    type: "global",
  },
  {
    id: 6,
    name: "Royal Penthouse",
    slug: "royal-penthouse",
    description: "An exclusive accommodation experience.",
    hotels: 2,
    rooms: 3,
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=500",
    type: "custom",
  },
  {
    id: 7,
    name: "Honeymoon Suite",
    slug: "honeymoon-suite",
    description: "Private and elegant accommodation for couples.",
    hotels: 2,
    rooms: 4,
    image:
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=500",
    type: "custom",
  },
];

export default function HotelCategoriesPage() {
  const params = useParams();

  // const stateSlug = params.stateSlug;
  // const citySlug = params.citySlug;
  const stateSlug = params.stateSlug || "imo";
  const citySlug = params.citySlug || "owerri";
  const stateName = stateSlug
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const cityName = citySlug
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const matchesSearch = category.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesFilter =
        filter === "all" || category.type === filter;

      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  const totalHotels = 24;
  const totalRooms = 98;

  return (
    <main className={styles.page}>
      {/* HEADER */}
 
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.locationBadge}>
            <MapPin size={15} />
            {cityName}, {stateName}
          </span>

          <h1>
            Explore Hotel
            <span> Categories</span>
          </h1>

          <p>
            Discover different types of accommodation
            available across hotels in {cityName}.
          </p>
        </div>
      </section>

      {/* BREADCRUMB */}
      <div className={styles.breadcrumb}>
        <Link href="/" aria-label="Home">
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

      {/* MAIN CONTENT */}
      <section className={styles.content}>
        <div className={styles.heading}>
          <div>
            <span className={styles.eyebrow}>
              FIND YOUR PERFECT STAY
            </span>

            <h2>Explore by Category</h2>

            <p>
              Browse room categories available across
              hotels in {cityName}.
            </p>
          </div>

          <div className={styles.hotelSummary}>
            <Building2 size={23} />

            <div>
              <strong>{totalHotels}</strong>
              <span>Hotels</span>
            </div>
          </div>
        </div>

        {/* SEARCH */}
        <div className={styles.searchArea}>
          <div className={styles.searchBox}>
            <Search size={20} />

            <input
              type="search"
              placeholder="Search hotel categories..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>
        </div>

        {/* FILTERS */}
        <div className={styles.filterArea}>
          <div className={styles.filterLabel}>
            <SlidersHorizontal size={17} />
            <span>Categories:</span>
          </div>

          <div className={styles.filterButtons}>
            <button
              className={
                filter === "all" ? styles.selected : ""
              }
              onClick={() => setFilter("all")}
            >
              All Categories
            </button>

            <button
              className={
                filter === "global" ? styles.selected : ""
              }
              onClick={() => setFilter("global")}
            >
              Standard Categories
            </button>

            <button
              className={
                filter === "custom" ? styles.selected : ""
              }
              onClick={() => setFilter("custom")}
            >
              Hotel Specialties
            </button>
          </div>
        </div>

        {/* CATEGORY LIST */}
        <div className={styles.categoryList}>
          {filteredCategories.map((category) => (
            <Link
              key={category.id}
              href={`/destinations/${stateSlug}/${citySlug}/categories/${category.slug}`}
              className={styles.categoryItem}
            >
              <div className={styles.categoryImage}>
                <img
                  src={category.image}
                  alt={category.name}
                />
              </div>

              <div className={styles.categoryInfo}>
                <h3>{category.name}</h3>

                <p>{category.description}</p>

                <div className={styles.categoryStats}>
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

              <div className={styles.categoryArrow}>
                <ChevronRight size={22} />
              </div>
            </Link>
          ))}
        </div>

        {/* EMPTY STATE */}
        {filteredCategories.length === 0 && (
          <div className={styles.emptyState}>
            <Search size={36} />

            <h3>No categories found</h3>

            <p>
              Try searching with a different category name.
            </p>

            <button
              onClick={() => {
                setSearch("");
                setFilter("all");
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      {/* BOTTOM SUMMARY */}
      <section className={styles.bottomSummary}>
        <div className={styles.summaryItem}>
          <Building2 size={32} />

          <div>
            <span>Total Hotels</span>
            <strong>{totalHotels} Hotels</strong>
          </div>
        </div>

        <div className={styles.summaryDivider} />

        <div className={styles.summaryItem}>
          <BedDouble size={32} />

          <div>
            <span>Registered Room Types</span>
            <strong>{totalRooms} Rooms</strong>
          </div>
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
