
import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import BookingCalendar from "@/components/BookingCalendar";
import FeatureTurfs from "@/components/FeatureTurfs";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <FeatureTurfs />
        <BookingCalendar />
        <HowItWorks />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
