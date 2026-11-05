
import React from "react";
import {
  ShieldCheck,
  Headset,
  Compass,
  CalendarCheck,
  ArrowRight,
  MapPin,
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
    <section className="bg-white px-5 py-12 md:px-10">
      <div className="mx-auto max-w-7xl">

        {/* Account Section */}
        <div className="border-b border-gray-200 pb-12">

          <h2 className="mb-4 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
            Your account, your travel
          </h2>

          <div className="flex flex-col-reverse items-center justify-between gap-6 rounded-xl border border-gray-200 p-6 md:flex-row md:px-7 md:py-8">

            {/* Account information */}
            <div className="w-full">
              <h3 className="text-xl font-bold text-gray-900 md:text-2xl">
                All your trip details in one place
              </h3>

              <p className="mt-3 text-base leading-7 text-gray-700 md:text-lg">
                Sign in to book faster, save your favourite hotels and
                manage your trips with ease.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-5">
                <a
                  href="/login"
                  className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-blue-700"
                >
                  Sign in
                </a>

                <a
                  href="/register"
                  className="inline-flex items-center gap-2 text-base font-semibold text-blue-600 transition hover:text-blue-800"
                >
                  Register
                  <ArrowRight size={17} />
                </a>
              </div>
            </div>

            {/* Illustration */}
            <div className="flex h-36 w-36 shrink-0 items-center justify-center rounded-full bg-blue-50 md:h-40 md:w-40">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                <Luggage size={48} strokeWidth={1.5} />

                <span className="absolute -right-3 -top-3 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-amber-400 text-blue-900">
                  <MapPin size={19} />
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Benefits Section */}
        <div className="pt-12">

          <h2 className="mb-8 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
            We've got you covered
          </h2>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">

            {benefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <div
                  key={benefit.title}
                  className="flex items-start gap-4"
                >
                  <div className="shrink-0 text-green-600">
                    <Icon size={34} strokeWidth={1.7} />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {benefit.title}
                    </h3>

                    <p className="mt-1 text-base leading-7 text-gray-700">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              );
            })}

          </div>
        </div>

      </div>
    </section>
  );
}
