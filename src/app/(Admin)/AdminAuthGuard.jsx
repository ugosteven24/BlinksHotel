
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "@/firebase/firebase";

export default function AdminRoleGuard({ children }) {
    const router = useRouter();

    const [isAdmin, setIsAdmin] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        let active = true;

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log("Firebase user:", user);

            if (!user) {
                console.log("No authenticated user found");

                router.replace("/Adminlogin");
                return;
            }

            try {
                console.log("Firebase UID:", user.uid);

                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);

                if (!active) return;

                console.log("Document exists:", userSnap.exists());

                if (!userSnap.exists()) {
                    console.log("User document not found");
                    router.replace("/Adminlogin");
                    return;
                }

                const userData = userSnap.data();

                console.log("Firestore user data:", userData);
                console.log("Firestore role:", userData.role);
                console.log("Role comparison:", userData.role === "admin");

                if (userData.role !== "admin") {
                    router.replace("/Adminlogin");
                    return;
                }

                setIsAdmin(true);

            } catch (error) {
                console.error("Firestore role check failed:", error);

                if (active) {
                    router.replace("/Adminlogin");
                }

            } finally {
                if (active) {
                    setChecking(false);
                }
            }
        });

        return () => {
            active = false;
            unsubscribe();
        };
    }, [router]);

    if (checking) return <div>Checking role...</div>;

    if (!isAdmin) return null;

    return children;
}
