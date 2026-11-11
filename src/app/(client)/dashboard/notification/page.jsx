"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/firebase/firebase";
import "./resorts.css";

const categoryDefinitions = [
  { id: "all", label: "All Alerts", icon: "inbox" },
  { id: "booking", label: "Booking Updates", icon: "calendar_today" },
  {
    id: "security",
    label: "Account Security",
    icon: "security",
    danger: true,
  },
  { id: "offers", label: "Personalized Offers", icon: "sell" },
  { id: "account", label: "Account", icon: "account_circle" },
];

function toDate(value) {
  if (!value) return null;

  if (typeof value?.toDate === "function") {
    const converted = value.toDate();
    return converted instanceof Date && !Number.isNaN(converted.getTime())
      ? converted
      : null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatRelativeTime(value) {
  const date = toDate(value);
  if (!date) return "Recently";

  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));

  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

function normalizeNotification(id, data) {
  const createdAt = toDate(data.createdAt ?? data.timestamp);

  return {
    id,
    category: data.category ?? "account",
    title: data.title ?? "Notification",
    message: data.message ?? "",
    time: formatRelativeTime(createdAt),
    createdAt,
    icon: data.icon ?? "notifications",
    type: data.type ?? "general",
    // Prefer the explicit read field; fall back to the legacy unread field.
    unread:
      typeof data.read === "boolean"
        ? !data.read
        : Boolean(data.unread),
    action: data.action ?? null,
    actionUrl: data.actionUrl ?? data.link ?? null,
  };
}

function isSameCalendarDay(first, second) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function getSafeActionUrl(value) {
  if (typeof value !== "string" || !value.trim()) return null;

  const url = value.trim();

  // Notification actions should navigate within this application.
  // Reject protocol-relative URLs and non-root-relative paths.
  if (!url.startsWith("/") || url.startsWith("//")) return null;

  return url;
}

export default function NotificationsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [updatingIds, setUpdatingIds] = useState([]);

  useEffect(() => {
    let unsubscribeNotifications = null;
    let active = true;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribeNotifications) {
        unsubscribeNotifications();
        unsubscribeNotifications = null;
      }

      if (!active) return;

      setNotifications([]);
      setError("");

      if (!user) {
        setUserId(null);
        setLoading(false);
        setError("Please sign in to view your notifications.");
        return;
      }

      setUserId(user.uid);
      setLoading(true);

      const notificationsQuery = query(
        collection(db, "notifications"),
        where("userId", "==", user.uid)
      );

      unsubscribeNotifications = onSnapshot(
        notificationsQuery,
        (snapshot) => {
          if (!active) return;

          const items = snapshot.docs.map((item) =>
            normalizeNotification(item.id, item.data())
          );

          items.sort((a, b) => {
            const aTime = a.createdAt?.getTime() ?? 0;
            const bTime = b.createdAt?.getTime() ?? 0;
            return bTime - aTime;
          });

          setNotifications(items);
          setLoading(false);
          setError("");
        },
        (err) => {
          console.error("Failed to load notifications:", err);
          if (!active) return;

          setError(
            "Unable to load notifications. Check your connection and permissions."
          );
          setLoading(false);
        }
      );
    });

    return () => {
      active = false;
      unsubscribeAuth();

      if (unsubscribeNotifications) {
        unsubscribeNotifications();
      }
    };
  }, []);

  const categories = categoryDefinitions.map((category) => ({
    ...category,
    count:
      category.id === "all"
        ? notifications.length
        : notifications.filter((item) => item.category === category.id).length,
  }));

  const filteredNotifications = notifications.filter(
    (notification) =>
      activeCategory === "all" ||
      notification.category === activeCategory
  );

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const todayNotifications = filteredNotifications.filter(
    (item) => item.createdAt && isSameCalendarDay(item.createdAt, today)
  );

  const yesterdayNotifications = filteredNotifications.filter(
    (item) => item.createdAt && isSameCalendarDay(item.createdAt, yesterday)
  );

  // Notifications with missing/invalid timestamps are kept in the feed.
  const olderNotifications = filteredNotifications.filter(
    (item) =>
      !item.createdAt ||
      (!isSameCalendarDay(item.createdAt, today) &&
        !isSameCalendarDay(item.createdAt, yesterday))
  );

  async function markAsRead(notification) {
    if (!notification.unread || !userId) return;

    setUpdatingIds((previous) =>
      previous.includes(notification.id)
        ? previous
        : [...previous, notification.id]
    );

    try {
      await updateDoc(doc(db, "notifications", notification.id), {
        read: true,
      });
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      setError("Unable to update notification status.");
    } finally {
      setUpdatingIds((previous) =>
        previous.filter((id) => id !== notification.id)
      );
    }
  }

  async function markAllAsRead() {
    if (!userId || markingAll) return;

    const unreadNotifications = notifications.filter((item) => item.unread);
    if (unreadNotifications.length === 0) return;

    setMarkingAll(true);
    setError("");

    try {
      // Firestore batches support at most 500 write operations.
      for (let index = 0; index < unreadNotifications.length; index += 500) {
        const batch = writeBatch(db);
        const chunk = unreadNotifications.slice(index, index + 500);

        chunk.forEach((item) => {
          batch.update(doc(db, "notifications", item.id), {
            read: true,
          });
        });

        await batch.commit();
      }
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      setError("Unable to mark all notifications as read. Please try again.");
    } finally {
      setMarkingAll(false);
    }
  }

  async function handleNotificationClick(notification) {
    await markAsRead(notification);

    const actionUrl = getSafeActionUrl(notification.actionUrl);
    if (actionUrl) {
      window.location.assign(actionUrl);
    }
  }

  async function handleAction(notification, event) {
    event.stopPropagation();
    await markAsRead(notification);

    const actionUrl = getSafeActionUrl(notification.actionUrl);
    if (actionUrl) {
      window.location.assign(actionUrl);
    }
  }

  function selectCategory(category) {
    setActiveCategory(category);
    setSidebarOpen(false);
  }

  return (
    <main className="notifications-page">
      <header className="mobile-notification-header">
        <span className="mobile-logo">LuxeStay</span>

        <button
          type="button"
          className="mobile-menu-button"
          onClick={() => setSidebarOpen((open) => !open)}
          aria-label="Toggle notification categories"
          aria-expanded={sidebarOpen}
        >
          <span className="material-symbols-outlined">
            {sidebarOpen ? "close" : "menu"}
          </span>
        </button>
      </header>

      {sidebarOpen && (
        <button
          type="button"
          className="notification-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close notification categories"
        />
      )}

      <div className="notifications-content">
        <div className="notifications-heading">
          <div>
            <h1>Notifications</h1>
            <p>
              Stay updated on your reservations, account alerts, and exclusive
              offers.
            </p>
          </div>

          <div className="notification-actions">
            <button
              type="button"
              className="outline-button"
              onClick={markAllAsRead}
              disabled={markingAll || !notifications.some((item) => item.unread)}
            >
              {markingAll ? "UPDATING..." : "MARK ALL AS READ"}
            </button>

            <button
              type="button"
              className="outline-button filter-button"
              onClick={() => setSidebarOpen((open) => !open)}
              aria-expanded={sidebarOpen}
            >
              <span className="material-symbols-outlined">filter_list</span>
              FILTER
            </button>
          </div>
        </div>

        {error && (
          <p className="notification-error" role="alert">
            {error}
          </p>
        )}

        <div className="notification-grid">
          <aside
            className={`notification-categories ${
              sidebarOpen ? "categories-open" : ""
            }`}
            aria-label="Notification categories"
          >
            <div className="category-mobile-header">
              <span>Notification Categories</span>

              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close categories"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {categories.map((category) => (
              <button
                type="button"
                key={category.id}
                className={`category-button ${
                  activeCategory === category.id ? "active" : ""
                } ${category.danger ? "danger-category" : ""}`}
                onClick={() => selectCategory(category.id)}
                aria-pressed={activeCategory === category.id}
              >
                <span className="material-symbols-outlined category-icon">
                  {category.icon}
                </span>

                <span className="category-label">{category.label}</span>

                {category.danger ? (
                  <span className="category-danger-count">
                    <span className="danger-dot" />
                    {category.count}
                  </span>
                ) : (
                  <span className="category-count">{category.count}</span>
                )}
              </button>
            ))}
          </aside>

          <section className="notification-feed" aria-live="polite">
            {loading ? (
              <p>Loading notifications...</p>
            ) : filteredNotifications.length === 0 ? (
              <div className="empty-notifications">
                <span className="material-symbols-outlined">
                  notifications_off
                </span>
                <h3>No notifications</h3>
                <p>There are no notifications in this category.</p>
              </div>
            ) : (
              <>
                {todayNotifications.length > 0 && (
                  <>
                    <h2 className="notification-day">TODAY</h2>
                    {todayNotifications.map((notification) => (
                      <NotificationCard
                        key={notification.id}
                        notification={notification}
                        updating={updatingIds.includes(notification.id)}
                        onClick={handleNotificationClick}
                        onAction={handleAction}
                      />
                    ))}
                  </>
                )}

                {yesterdayNotifications.length > 0 && (
                  <>
                    <h2 className="notification-day yesterday-title">
                      YESTERDAY
                    </h2>
                    {yesterdayNotifications.map((notification) => (
                      <NotificationCard
                        key={notification.id}
                        notification={notification}
                        updating={updatingIds.includes(notification.id)}
                        onClick={handleNotificationClick}
                        onAction={handleAction}
                      />
                    ))}
                  </>
                )}

                {olderNotifications.length > 0 && (
                  <>
                    <h2 className="notification-day">EARLIER</h2>
                    {olderNotifications.map((notification) => (
                      <NotificationCard
                        key={notification.id}
                        notification={notification}
                        updating={updatingIds.includes(notification.id)}
                        onClick={handleNotificationClick}
                        onAction={handleAction}
                      />
                    ))}
                  </>
                )}
              </>
            )}
          </section>
        </div>
      </div>

      <footer className="resorts-footer">
        <p>
          © {new Date().getFullYear()} HotelReserve. All rights reserved.
        </p>
        <div>
          <Link href="/pages/about">About</Link>
          <Link href="/pages/contact">Contact</Link>
          <Link href="/pages/privacy">Privacy Policy</Link>
        </div>
      </footer>
    </main>
  );
}

function NotificationCard({
  notification,
  updating,
  onClick,
  onAction,
}) {
  function handleKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick(notification);
    }
  }

  return (
    <article
      className={`notification-card ${notification.type} ${
        notification.unread ? "unread" : "read"
      }`}
      onClick={() => onClick(notification)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${notification.title}. ${notification.message}`}
    >
      {notification.unread && <div className="unread-indicator" />}

      <div className="notification-inner">
        <div className="notification-icon">
          <span className="material-symbols-outlined">
            {notification.icon}
          </span>
        </div>

        <div className="notification-content">
          <div className="notification-title-row">
            <h3>{notification.title}</h3>
            <span className="notification-time">{notification.time}</span>
          </div>

          <p className="notification-message">{notification.message}</p>

          {notification.action && (
            <div className="notification-action">
              <button
                type="button"
                className={
                  notification.type === "error"
                    ? "review-button"
                    : "view-itinerary-button"
                }
                onClick={(event) => onAction(notification, event)}
                disabled={updating}
              >
                {updating ? "UPDATING..." : notification.action}
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
