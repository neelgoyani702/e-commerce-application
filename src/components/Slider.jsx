import * as React from "react";
import { useContext } from "react";
import { SettingsContext } from "../context/SettingsProvider";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const slides = [
  {
    imageUrl:
      "https://img.freepik.com/free-photo/portrait-young-woman-freelancer-working-from-home-saleswoman-doing-trading-from-her-kitchen-set_1258-202373.jpg?t=st=1724522932~exp=1724526532~hmac=9c396b99b39c9e47507f525e0604d8160bcbdccbb0eafd24a1dc9486805c5038&w=1800",
    alt: "Woman shopping online",
    headline: "Discover What's New",
    subtext: "Premium quality, unbeatable prices",
    cta: "Shop Now",
  },
  {
    imageUrl:
      "https://img.freepik.com/free-vector/pair-realistic-black-sneakers-with-shadow-isolated_548887-96.jpg?t=st=1724523063~exp=1724526663~hmac=5317d9dbdc768c9284c6ebbdbb9ca28c49a9444a72eafcbc1d934aa2a66cf154&w=1800",
    alt: "Black sneakers",
    headline: "Trending Footwear",
    subtext: "Step into style with our latest arrivals",
    cta: "Explore",
  },
  {
    imageUrl:
      "https://img.freepik.com/free-photo/portrait-man-shopping-buying-consumer-goods_23-2151669723.jpg?t=st=1724523111~exp=1724526711~hmac=b88d626ab5bf43a1b5765f13121fcfb75b807cc9e5eebabb76a5c4605126481e&w=1800",
    alt: "Man shopping",
    headline: "Exclusive Deals",
    subtext: "Up to 50% off on selected items",
    cta: "View Deals",
  },
  {
    imageUrl:
      "https://img.freepik.com/free-vector/flat-design-minimal-book-club-twitch-banner_23-2149694095.jpg?t=st=1724523146~exp=1724526746~hmac=e0dcf628d11f84372c4f1d2c9912fa4800b58597b9f289bd9ec655048dbd4a60&w=1800",
    alt: "Books collection",
    headline: "Curated Collections",
    subtext: "Handpicked just for you",
    cta: "Browse",
  },
];

export default function Slider() {
  const navigate = useNavigate();
  const { settings } = useContext(SettingsContext);

  return (
    <div className="w-full">
      <Carousel className="relative w-full">
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={index}>
              <div className="relative w-full h-[70vh] min-h-[400px] max-h-[600px] overflow-hidden">
                {/* Background Image */}
                <img
                  src={slide.imageUrl}
                  alt={slide.alt}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

                {/* Content */}
                <div className="relative z-10 h-full flex items-center">
                  <div className="max-w-7xl mx-auto px-6 w-full">
                    <div className="max-w-xl">
                      <p className="text-store-primary text-sm font-semibold tracking-widest uppercase mb-3 animate-fade-in">
                        {settings?.storeName || "ShopKart"}
                      </p>
                      <h2 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4 animate-fade-in-up">
                        {slide.headline}
                      </h2>
                      <p className="text-gray-300 text-lg md:text-xl mb-8 animate-fade-in-up animation-delay-100">
                        {slide.subtext}
                      </p>
                      <button
                        onClick={() => navigate("/products")}
                        className="inline-flex items-center gap-2 bg-store-gradient hover:bg-store-gradient-light text-white font-semibold px-8 py-3.5 rounded-full transition-all duration-300 shadow-lg shadow-store-primary-lg hover:shadow-store-primary-lg hover:scale-105 animate-fade-in-up animation-delay-200"
                      >
                        {slide.cta}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute top-1/2 left-4 -translate-y-1/2 h-10 w-10 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20" />
        <CarouselNext className="absolute top-1/2 right-4 -translate-y-1/2 h-10 w-10 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20" />
      </Carousel>
    </div>
  );
}
