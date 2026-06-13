"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function useSmoothScroll() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Basic GSAP ScrollTrigger configuration
    // For a more advanced smooth scroll, we could use Lenis or ScrollSmoother (GSAP Club)
    // Here we will implement a light ScrollTrigger reveal system
    
    const sections = document.querySelectorAll(".reveal");
    sections.forEach((section) => {
      gsap.fromTo(
        section,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
    });
  }, []);
}
