
import React from "react";
import {
  ShieldCheck,
  Headset,
  Compass,
  CalendarCheck,
  ArrowRight,
  MapPin,
  Check,
  Luggage,
} from "lucide-react";

const benefits = [
  {
    icon: Compass,
    title: "Discover great places to stay",
    description:
      "Explore a wide selection of hotels and resorts to find the perfect accommodation for your next trip.",
  },
  {
    icon: CalendarCheck,
    title: "Simple and flexible booking",
    description:
      "Find your ideal stay, make reservations online and keep your travel plans organized in one place.",
  },
  {
    icon: Headset,
    title: "Support when you need it",
    description:
      "Need assistance with a reservation? Our customer support team is here to help make your experience easier.",
  },
];

export default function Accountintro() {
  return (
  
<section className="bg-slate-50 px-5 py-16 md:px-10 lg:py-20">
    <div className="mx-auto max-w-7xl">

        {/* ACCOUNT SECTION */}
        <div className="border-b border-slate-200 pb-16">

            <div className="mb-8">
                <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-extrabold uppercase tracking-widest text-blue-700">
                    <Luggage size={15} />
                    Your HotelReserve Account
                </span>

                <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">
                    Your account. Your journeys. <span className="text-blue-600">Your way.</span>
                </h2>

                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500">
                    Everything you need to plan, organize and manage your
                    accommodation experiences, all from one convenient place.
                </p>
            </div>

            {/* ACCOUNT CARD */}
            <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-white p-7 shadow-sm md:p-10 lg:p-12">

                {/* Decorative background */}
                <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full bg-blue-50" />
                <div className="pointer-events-none absolute -bottom-40 right-40 h-72 w-72 rounded-full bg-blue-50/70" />

                <div className="relative z-10 flex flex-col-reverse items-center justify-between gap-10 md:flex-row">

                    {/* ACCOUNT INFORMATION */}
                    <div className="w-full max-w-2xl">

                        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            Your travel experience starts here
                        </span>

                        <h3 className="mt-5 text-2xl font-extrabold leading-tight tracking-tight text-slate-950 md:text-3xl lg:text-4xl">
                            Make every trip easier with your personal account.
                        </h3>

                        <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 md:text-lg">
                            Sign in to discover personalized stays, save your
                            favourite properties, manage reservations and keep
                            all your travel details organized.
                        </p>

                        <div className="mt-8 flex flex-wrap items-center gap-4">

                            <a
                                href="/login"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl"
                            >
                                Sign In
                                <ArrowRight size={17} />
                            </a>

                            <a
                                href="/register"
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-sm font-bold text-slate-800 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                            >
                                Create Free Account
                            </a>

                        </div>

                        <p className="mt-5 flex items-center gap-2 text-xs font-medium text-slate-400">
                            <ShieldCheck size={15} className="text-emerald-600" />
                            Your account and travel information stay organized in one place.
                        </p>

                    </div>

                    {/* ILLUSTRATION */}
                    <div className="relative flex h-52 w-52 shrink-0 items-center justify-center rounded-full bg-blue-50 md:h-64 md:w-64">

                        <div className="absolute inset-5 rounded-full border border-blue-100" />

                        <div className="relative flex h-32 w-32 items-center justify-center rounded-3xl bg-blue-600 text-white shadow-2xl shadow-blue-600/30 md:h-36 md:w-36">
                            <Luggage size={65} strokeWidth={1.4} />

                            <span className="absolute -right-4 -top-4 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-amber-400 text-blue-950 shadow-lg">
                                <MapPin size={21} />
                            </span>

                            <span className="absolute -bottom-4 -left-4 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-emerald-500 text-white shadow-lg">
                                <Check size={21} strokeWidth={3} />
                            </span>
                        </div>

                    </div>

                </div>
            </div>
        </div>

        {/* BENEFITS SECTION */}
        <div className="pt-16">

            <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">

                <div>
                    <span className="mb-3 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-blue-700">
                        <ShieldCheck size={15} />
                        The HotelReserve Advantage
                    </span>

                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">
                        A better way to travel.
                    </h2>

                    <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500">
                        Enjoy a more convenient accommodation experience,
                        with the tools and support you need along the way.
                    </p>
                </div>

                <span className="text-sm font-bold text-slate-400">
                    Designed around your journey
                </span>

            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

                {benefits.map((benefit) => {
                    const Icon = benefit.icon;

                    return (
                        <div
                            key={benefit.title}
                            className="group rounded-2xl border border-slate-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/60"
                        >

                            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white">
                                <Icon size={29} strokeWidth={1.8} />
                            </div>

                            <h3 className="text-lg font-extrabold tracking-tight text-slate-900">
                                {benefit.title}
                            </h3>

                            <p className="mt-3 text-sm leading-7 text-slate-500">
                                {benefit.description}
                            </p>

                        </div>
                    );
                })}

            </div>
        </div>

    </div>
</section>

  );
}
