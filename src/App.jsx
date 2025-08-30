import React, { useState, useEffect, useRef } from "react";
import "./index.css";

import {
  MapPin,
  CalendarDays,
  Mountain,
  Utensils,
  Hotel,
  Sparkles,
  Loader2,
  ServerCrash,
  Globe,
  Wallet,
  Landmark,
  Wind,
  Baby,
  Info,
  Briefcase,
  Target,
  Zap,
  ArrowRight,
  Phone,
  Mail,
  Sunrise,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Coffee,
  Users,
  ChevronDown,
} from "lucide-react";

// --- STYLES & ANIMATIONS ---
const StyleInjector = () => (
  <style>{`
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.6s ease-out forwards;
        }
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
        }
        .nav-link {
            position: relative;
            padding-bottom: 4px;
            overflow: hidden;
        }
        .nav-link::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 2px;
            background-color: #8B5CF6;
            transform: translateX(-101%);
            transition: transform 0.3s ease-in-out;
        }
        .nav-link:hover::after {
            transform: translateX(0);
        }
    `}</style>
);

// --- CONSTANTS ---
const GEOAPIFY_API_KEY = "e141140e2b9048a0a04f55d5749bce01";

const currencies = [
  { code: "INR", name: "Indian Rupee", countryCode: "in" },
  { code: "USD", name: "US Dollar", countryCode: "us" },
  { code: "EUR", name: "Euro", countryCode: "eu" },
  { code: "GBP", name: "British Pound", countryCode: "gb" },
  { code: "JPY", name: "Japanese Yen", countryCode: "jp" },
  { code: "AUD", name: "Australian Dollar", countryCode: "au" },
  { code: "CAD", name: "Canadian Dollar", countryCode: "ca" },
  { code: "CHF", name: "Swiss Franc", countryCode: "ch" },
  { code: "CNY", name: "Chinese Yuan", countryCode: "cn" },
  { code: "SGD", name: "Singapore Dollar", countryCode: "sg" },
];

const travelPreferencesList = [
  {
    id: "adventure",
    label: "Adventure",
    icon: <Mountain className="w-5 h-5" />,
  },
  { id: "culture", label: "Culture", icon: <Landmark className="w-5 h-5" /> },
  { id: "foodie", label: "Foodie", icon: <Utensils className="w-5 h-5" /> },
  { id: "relaxation", label: "Relaxation", icon: <Wind className="w-5 h-5" /> },
  {
    id: "spiritual",
    label: "Spiritual",
    icon: <Sunrise className="w-5 h-5" />,
  },
  {
    id: "family",
    label: "Family Friendly",
    icon: <Baby className="w-5 h-5" />,
  },
];

const iconColorMap = {
  Morning: "bg-amber-500/10 text-amber-600",
  Afternoon: "bg-sky-500/10 text-sky-600",
  Evening: "bg-indigo-500/10 text-indigo-600",
  Food: "bg-rose-500/10 text-rose-600",
};

const loadingTexts = [
  "Scouting the best locations...",
  "Talking to local guides...",
  "Packing your virtual bags...",
  "Finding hidden gems...",
  "Crafting your unique adventure...",
];

// --- HELPER FUNCTIONS & HOOKS ---
function getCountryFlagUrl(countryCode) {
  if (!countryCode || countryCode.length !== 2) {
    return `https://placehold.co/24x18/F3F4F6/111827?text=?`;
  }
  const flagCode = countryCode === "eu" ? "eur" : countryCode.toLowerCase();
  return `https://flagcdn.com/w40/${flagCode}.png`;
}

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const correctedDate = new Date(date.getTime() + userTimezoneOffset);
  const day = String(correctedDate.getDate()).padStart(2, "0");
  const month = String(correctedDate.getMonth() + 1).padStart(2, "0");
  const year = correctedDate.getFullYear();
  return `${day}-${month}-${year}`;
};

const getPopularDestinations = (searchTerm) => {
  const popularDestinations = [
    // Major Cities
    { properties: { formatted: "Paris, France", country: "France", country_code: "fr", place_id: "paris-fr", type: "city" } },
    { properties: { formatted: "New York, USA", country: "United States", country_code: "us", place_id: "nyc-us", type: "city" } },
    { properties: { formatted: "London, UK", country: "United Kingdom", country_code: "gb", place_id: "london-gb", type: "city" } },
    { properties: { formatted: "Tokyo, Japan", country: "Japan", country_code: "jp", place_id: "tokyo-jp", type: "city" } },
    { properties: { formatted: "Barcelona, Spain", country: "Spain", country_code: "es", place_id: "barcelona-es", type: "city" } },
    { properties: { formatted: "Rome, Italy", country: "Italy", country_code: "it", place_id: "rome-it", type: "city" } },
    { properties: { formatted: "Amsterdam, Netherlands", country: "Netherlands", country_code: "nl", place_id: "amsterdam-nl", type: "city" } },
    { properties: { formatted: "Prague, Czech Republic", country: "Czech Republic", country_code: "cz", place_id: "prague-cz", type: "city" } },
    { properties: { formatted: "Vienna, Austria", country: "Austria", country_code: "at", place_id: "vienna-at", type: "city" } },
    { properties: { formatted: "Budapest, Hungary", country: "Hungary", country_code: "hu", place_id: "budapest-hu", type: "city" } },
    
    // Specific Areas & Neighborhoods
    { properties: { formatted: "Montmartre, Paris", country: "France", country_code: "fr", place_id: "montmartre-paris", type: "neighbourhood" } },
    { properties: { formatted: "Soho, London", country: "United Kingdom", country_code: "gb", place_id: "soho-london", type: "neighbourhood" } },
    { properties: { formatted: "Times Square, New York", country: "United States", country_code: "us", place_id: "times-square-nyc", type: "neighbourhood" } },
    { properties: { formatted: "Shibuya, Tokyo", country: "Japan", country_code: "jp", place_id: "shibuya-tokyo", type: "neighbourhood" } },
    { properties: { formatted: "Gothic Quarter, Barcelona", country: "Spain", country_code: "es", place_id: "gothic-quarter-barcelona", type: "neighbourhood" } },
    { properties: { formatted: "Trastevere, Rome", country: "Italy", country_code: "it", place_id: "trastevere-rome", type: "neighbourhood" } },
    { properties: { formatted: "Jordaan, Amsterdam", country: "Netherlands", country_code: "nl", place_id: "jordaan-amsterdam", type: "neighbourhood" } },
    { properties: { formatted: "Old Town, Prague", country: "Czech Republic", country_code: "cz", place_id: "old-town-prague", type: "neighbourhood" } },
    { properties: { formatted: "Innere Stadt, Vienna", country: "Austria", country_code: "at", place_id: "innere-stadt-vienna", type: "neighbourhood" } },
    { properties: { formatted: "Castle District, Budapest", country: "Hungary", country_code: "hu", place_id: "castle-district-budapest", type: "neighbourhood" } },
    
    // Tourist Areas & Landmarks
    { properties: { formatted: "Eiffel Tower Area, Paris", country: "France", country_code: "fr", place_id: "eiffel-tower-paris", type: "tourism" } },
    { properties: { formatted: "Louvre Museum Area, Paris", country: "France", country_code: "fr", place_id: "louvre-paris", type: "tourism" } },
    { properties: { formatted: "Central Park, New York", country: "United States", country_code: "us", place_id: "central-park-nyc", type: "tourism" } },
    { properties: { formatted: "Big Ben Area, London", country: "United Kingdom", country_code: "gb", place_id: "big-ben-london", type: "tourism" } },
    { properties: { formatted: "Senso-ji Temple, Tokyo", country: "Japan", country_code: "jp", place_id: "sensoji-tokyo", type: "tourism" } },
    { properties: { formatted: "Sagrada Familia, Barcelona", country: "Spain", country_code: "es", place_id: "sagrada-familia-barcelona", type: "tourism" } },
    { properties: { formatted: "Colosseum Area, Rome", country: "Italy", country_code: "it", place_id: "colosseum-rome", type: "tourism" } },
    { properties: { formatted: "Anne Frank House, Amsterdam", country: "Netherlands", country_code: "nl", place_id: "anne-frank-amsterdam", type: "tourism" } },
    { properties: { formatted: "Charles Bridge, Prague", country: "Czech Republic", country_code: "cz", place_id: "charles-bridge-prague", type: "tourism" } },
    { properties: { formatted: "Schönbrunn Palace, Vienna", country: "Austria", country_code: "at", place_id: "schonbrunn-vienna", type: "tourism" } },
    { properties: { formatted: "Fisherman's Bastion, Budapest", country: "Hungary", country_code: "hu", place_id: "fishermans-bastion-budapest", type: "tourism" } },
    
    // Beach & Nature Destinations
    { properties: { formatted: "Santorini, Greece", country: "Greece", country_code: "gr", place_id: "santorini-gr", type: "city" } },
    { properties: { formatted: "Bali, Indonesia", country: "Indonesia", country_code: "id", place_id: "bali-id", type: "city" } },
    { properties: { formatted: "Maldives", country: "Maldives", country_code: "mv", place_id: "maldives-mv", type: "city" } },
    { properties: { formatted: "Phuket, Thailand", country: "Thailand", country_code: "th", place_id: "phuket-th", type: "city" } },
    { properties: { formatted: "Swiss Alps", country: "Switzerland", country_code: "ch", place_id: "swiss-alps-ch", type: "tourism" } },
    { properties: { formatted: "Banff National Park, Canada", country: "Canada", country_code: "ca", place_id: "banff-ca", type: "tourism" } },
    { properties: { formatted: "Yosemite National Park, USA", country: "United States", country_code: "us", place_id: "yosemite-us", type: "tourism" } },
    { properties: { formatted: "Machu Picchu, Peru", country: "Peru", country_code: "pe", place_id: "machu-picchu-pe", type: "tourism" } },
    { properties: { formatted: "Petra, Jordan", country: "Jordan", country_code: "jo", place_id: "petra-jo", type: "tourism" } },
    
    // Cultural & Historical
    { properties: { formatted: "Kyoto, Japan", country: "Japan", country_code: "jp", place_id: "kyoto-jp", type: "city" } },
    { properties: { formatted: "Florence, Italy", country: "Italy", country_code: "it", place_id: "florence-it", type: "city" } },
    { properties: { formatted: "Venice, Italy", country: "Italy", country_code: "it", place_id: "venice-it", type: "city" } },
    { properties: { formatted: "Seville, Spain", country: "Spain", country_code: "es", place_id: "seville-es", type: "city" } },
    { properties: { formatted: "Salzburg, Austria", country: "Austria", country_code: "at", place_id: "salzburg-at", type: "city" } },
    { properties: { formatted: "Krakow, Poland", country: "Poland", country_code: "pl", place_id: "krakow-pl", type: "city" } },
    { properties: { formatted: "Dubrovnik, Croatia", country: "Croatia", country_code: "hr", place_id: "dubrovnik-hr", type: "city" } },
    { properties: { formatted: "Taj Mahal, India", country: "India", country_code: "in", place_id: "taj-mahal-in", type: "tourism" } },
    { properties: { formatted: "Angkor Wat, Cambodia", country: "Cambodia", country_code: "kh", place_id: "angkor-wat-kh", type: "tourism" } },
    { properties: { formatted: "Great Wall of China", country: "China", country_code: "cn", place_id: "great-wall-cn", type: "tourism" } },
    
    // Modern Cities
    { properties: { formatted: "Singapore", country: "Singapore", country_code: "sg", place_id: "singapore-sg", type: "city" } },
    { properties: { formatted: "Dubai, UAE", country: "United Arab Emirates", country_code: "ae", place_id: "dubai-ae", type: "city" } },
    { properties: { formatted: "Hong Kong", country: "Hong Kong", country_code: "hk", place_id: "hong-kong-hk", type: "city" } },
    { properties: { formatted: "Seoul, South Korea", country: "South Korea", country_code: "kr", place_id: "seoul-kr", type: "city" } },
    { properties: { formatted: "Sydney, Australia", country: "Australia", country_code: "au", place_id: "sydney-au", type: "city" } },
    { properties: { formatted: "Cape Town, South Africa", country: "South Africa", country_code: "za", place_id: "cape-town-za", type: "city" } },
    { properties: { formatted: "Rio de Janeiro, Brazil", country: "Brazil", country_code: "br", place_id: "rio-br", type: "city" } },
    { properties: { formatted: "Mexico City, Mexico", country: "Mexico", country_code: "mx", place_id: "mexico-city-mx", type: "city" } },
    { properties: { formatted: "Buenos Aires, Argentina", country: "Argentina", country_code: "ar", place_id: "buenos-aires-ar", type: "city" } },
    { properties: { formatted: "Lima, Peru", country: "Peru", country_code: "pe", place_id: "lima-pe", type: "city" } }
  ];

  if (!searchTerm) return popularDestinations.slice(0, 10);
  
  const searchLower = searchTerm.toLowerCase();
  return popularDestinations
    .filter(dest => 
      dest.properties.formatted.toLowerCase().includes(searchLower) ||
      dest.properties.country.toLowerCase().includes(searchLower)
    )
    .slice(0, 8);
};

const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

// --- CUSTOM UI COMPONENTS ---
const CustomCurrencySelect = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);
  useClickOutside(selectRef, () => setIsOpen(false));
  const selectedOption = options.find((o) => o.code === value);
  const handleSelect = (code) => {
    onChange(code);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full group" ref={selectRef}>
      <label
        className={`absolute -top-2 left-4 px-2 bg-white text-gray-500 text-xs font-semibold z-10 transition-colors duration-300 ${
          isOpen ? "text-purple-500" : "group-hover:text-gray-900"
        }`}
      >
        Currency
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:ring-0 rounded-xl py-2.5 pl-4 pr-10 text-left transition-all duration-300 ease-in-out flex items-center gap-3"
      >
        <img
          src={getCountryFlagUrl(selectedOption?.countryCode)}
          alt={selectedOption?.code}
          className="w-6 h-auto rounded-sm"
        />
        <span className="truncate">
          {selectedOption?.code} - {selectedOption?.name}
        </span>
        <ChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 transition-transform duration-300 ease-in-out ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-white/80 backdrop-blur-xl border border-gray-200 rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto animate-fade-in-up">
          {options.map((opt) => (
            <div
              key={opt.code}
              onClick={() => handleSelect(opt.code)}
              className="px-4 py-3 text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors duration-200 border-b border-gray-200 last:border-b-0 flex items-center gap-3"
            >
              <img
                src={getCountryFlagUrl(opt.countryCode)}
                alt={opt.code}
                className="w-6 h-auto rounded-sm"
              />
              <span>
                {opt.name} ({opt.code})
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ModernDatePicker = ({
  selectedDate,
  onChange,
  minDate,
  placeholder = "Select Date",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(
    selectedDate ? new Date(selectedDate) : new Date()
  );
  const datePickerRef = useRef(null);
  useClickOutside(datePickerRef, () => setIsOpen(false));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const minD = minDate ? new Date(minDate) : null;
  if (minD) minD.setHours(0, 0, 0, 0);

  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const firstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();
  const changeMonth = (offset) =>
    setViewDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1)
    );

  const handleDayClick = (day) => {
    const newDate = new Date(
      Date.UTC(viewDate.getFullYear(), viewDate.getMonth(), day)
    );
    onChange(newDate.toISOString().split("T")[0]);
    setIsOpen(false);
  };

  const renderDays = () => {
    const y = viewDate.getFullYear(),
      m = viewDate.getMonth();
    const numDays = daysInMonth(y, m),
      firstDay = firstDayOfMonth(y, m);
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`e-${i}`} className="w-8 h-8" />);
    }
    for (let day = 1; day <= numDays; day++) {
      const curr = new Date(y, m, day);
      curr.setHours(0, 0, 0, 0);
      const selected = selectedDate ? new Date(selectedDate) : null;
      if (selected) selected.setHours(0, 0, 0, 0);

      const isSelected = selected && selected.getTime() === curr.getTime();
      const isToday = curr.getTime() === today.getTime();
      const isDisabled = minD && curr < minD;
      days.push(
        <button
          type="button"
          key={day}
          disabled={isDisabled}
          onClick={() => handleDayClick(day)}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out text-sm ${
            isDisabled
              ? "text-gray-400 cursor-not-allowed"
              : "hover:bg-purple-100"
          } ${
            isSelected
              ? "bg-purple-500 text-white font-bold shadow-lg shadow-purple-500/30"
              : ""
          } ${!isSelected && isToday ? "border-2 border-purple-500" : ""} ${
            !isSelected ? "text-gray-900" : ""
          }`}
        >
          {day}
        </button>
      );
    }
    return days;
  };
  return (
    <div className="relative w-full group" ref={datePickerRef}>
      <label
        className={`absolute -top-2 left-4 px-2 bg-white text-gray-500 text-xs font-semibold z-10 transition-colors duration-300 ease-in-out ${
          isOpen || selectedDate
            ? "text-purple-500"
            : "group-hover:text-gray-900"
        }`}
      >
        {placeholder}
      </label>
      <button
        type="button"
        className="relative w-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CalendarDays
          className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-colors duration-300 ease-in-out ${
            isOpen || selectedDate
              ? "text-purple-500"
              : "group-hover:text-gray-900"
          }`}
        />
        <input
          type="text"
          readOnly
          value={formatDate(selectedDate)}
          className="w-full bg-white text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:ring-0 rounded-xl py-2.5 pl-12 pr-4 transition-all duration-300 ease-in-out cursor-pointer"
        />
      </button>
      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-lg z-20 p-2 animate-fade-in-up">
          <div className="flex justify-between items-center mb-2">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-300 ease-in-out"
            >
              <ChevronLeft className="w-5 h-5 text-gray-900" />
            </button>
            <span className="font-bold text-base text-gray-900">
              {viewDate.toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-300 ease-in-out"
            >
              <ChevronRight className="w-5 h-5 text-gray-900" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-gray-500 mb-1 font-medium text-xs">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 place-items-center">
            {renderDays()}
          </div>
        </div>
      )}
    </div>
  );
};

// --- PAGE COMPONENTS ---

const FeatureCard = ({ icon, title, children, delay = 0 }) => (
  <div
    className="bg-white p-8 rounded-3xl text-center border border-gray-200 transition-all duration-300 ease-in-out group shadow-sm hover:shadow-xl hover:border-purple-500/50 hover:-translate-y-2 opacity-0 animate-fade-in-up"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="inline-block p-4 bg-gray-900/5 rounded-2xl mb-4 group-hover:bg-purple-100 group-hover:scale-110 transition-all duration-300 ease-in-out">
      {React.cloneElement(icon, { className: "w-10 h-10 text-purple-500" })}
    </div>
    <h3 className="text-2xl font-bold mb-2 text-gray-900">{title}</h3>
    <p className="text-gray-600">{children}</p>
  </div>
);
const StepCard = ({ number, title, children, delay = 0 }) => (
  <div
    className="flex flex-col items-center opacity-0 animate-fade-in-up"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="bg-gray-900/5 text-gray-900 text-3xl font-bold rounded-full w-16 h-16 flex items-center justify-center mb-4 border-2 border-gray-900/10 transition-all duration-300 ease-in-out group-hover:scale-110">
      {number}
    </div>
    <h3 className="text-2xl font-bold mb-2 text-gray-900">{title}</h3>
    <p className="text-gray-600">{children}</p>
  </div>
);

const HomePage = ({ setCurrentPage }) => (
  <div className="w-full text-gray-900 animate-fade-in">
    <section className="text-center pt-20 pb-16 md:pt-32 md:pb-24">
      <h1
        className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-gray-900 to-gray-600 opacity-0 animate-fade-in-up"
        style={{ animationDelay: "100ms" }}
      >
        Craft Your Perfect Journey with AI
      </h1>
      <p
        className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10 opacity-0 animate-fade-in-up"
        style={{ animationDelay: "200ms" }}
      >
        Stop planning, start exploring. Itinera uses advanced AI to build
        personalized travel itineraries in seconds, tailored to your budget,
        style, and interests.
      </p>
      <div
        className="opacity-0 animate-fade-in-up"
        style={{ animationDelay: "300ms" }}
      >
        <button
          onClick={() => setCurrentPage("planner")}
          className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-4 px-8 rounded-full text-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 mx-auto"
        >
          Plan Your Trip Now <ArrowRight />
        </button>
      </div>
    </section>
    <section className="py-12 sm:py-16">
      <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16 text-gray-900">
        Why Choose Itinera?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <FeatureCard
          icon={<Sparkles />}
          title="Hyper-Personalized"
          children="From adventure to relaxation, get a plan that truly matches your travel DNA."
          delay={200}
        />
        <FeatureCard
          icon={<Zap />}
          title="Instant & Effortless"
          children="Save hours of research. Receive a complete, day-by-day itinerary in seconds."
          delay={300}
        />
        <FeatureCard
          icon={<Wallet />}
          title="Budget-Aware"
          children="We suggest activities and dining that respect your budget, big or small."
          delay={400}
        />
      </div>
    </section>
    <section className="py-12 sm:py-16">
      <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16 text-gray-900">
        Three Simple Steps
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto text-center group">
        <StepCard
          number="1"
          title="Share Your Vision"
          children="Tell us where you want to go, when, your budget, and what you love to do."
          delay={200}
        />
        <StepCard
          number="2"
          title="AI Creates Magic"
          children="Our smart engine analyzes your inputs to build a unique, logical travel plan."
          delay={300}
        />
        <StepCard
          number="3"
          title="Explore with Confidence"
          children="Receive your detailed itinerary and get ready for an unforgettable adventure!"
          delay={400}
        />
      </div>
    </section>
  </div>
);

const PlannerPage = () => {
  const [destination, setDestination] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [travelPreferences, setTravelPreferences] = useState([]);
  const [extraNotes, setExtraNotes] = useState("");
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(loadingTexts[0]);
  const [error, setError] = useState(null);
  const [today, setToday] = useState("");
  const [refinementPrompt, setRefinementPrompt] = useState("");
  const [originalUserQuery, setOriginalUserQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const suggestionsRef = useRef(null);
  const suggestionRefs = useRef([]);
  const resultsRef = useRef(null);
  useClickOutside(suggestionsRef, () => setSuggestions([]));

  useEffect(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    setToday(now.toISOString().split("T")[0]);
  }, []);
  useEffect(() => {
    if (destination.length < 2) {
      setSuggestions([]);
      return;
    }
    const handler = setTimeout(async () => {
      setIsTyping(true);
      console.log("🔍 Searching for:", destination);
      try {
        // Comprehensive search for autocomplete - search all types of places
        const res = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${destination}&apiKey=${GEOAPIFY_API_KEY}&limit=20&format=json&lang=en`
        );
        const data = await res.json();
        console.log("📡 API Response:", data);
        
        // Use only API results for autocomplete
        let enhancedSuggestions = data.features || [];
        
        console.log("✅ Final suggestions:", enhancedSuggestions);
        setSuggestions(enhancedSuggestions);
        setHighlightedIndex(-1);
      } catch (err) {
        console.error("❌ Geoapify error:", err);
        // Fallback to empty array if API fails
        console.log("🔄 API failed, no suggestions available");
        setSuggestions([]);
      } finally {
        setIsTyping(false);
      }
    }, 200);
    return () => clearTimeout(handler);
  }, [destination]);

  useEffect(() => {
    if (highlightedIndex >= 0 && suggestionRefs.current[highlightedIndex]) {
      suggestionRefs.current[highlightedIndex].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [highlightedIndex]);

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMessage((prev) => {
          const nextIndex =
            (loadingTexts.indexOf(prev) + 1) % loadingTexts.length;
          return loadingTexts[nextIndex];
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleBudgetChange = (e) => {
    const value = e.target.value.replace(/,/g, "");
    if (!isNaN(value) && value !== null) {
      setBudget(value);
    }
  };

  const formattedBudget = budget
    ? parseInt(budget, 10).toLocaleString("en-IN")
    : "";

  const callGeminiAPI = async (query) => {
    const systemPrompt = `You are Itinera, a travel planning AI. Create three distinct travel itinerary options: 'Balanced', 'Luxury Stay', and 'Explorer' for the given destination, budget, and preferences.

IMPORTANT: Respond ONLY with valid JSON. No text before or after the JSON.

JSON Schema:
{
  "itinerary_options": [
    {
      "type": "Balanced|Luxury Stay|Explorer",
      "summary": "Brief description of this itinerary style",
      "itinerary": [
        {
          "day": 1,
          "theme": "Day theme",
          "morning": {
            "activity": "Activity name",
            "description": "Brief description"
          },
          "afternoon": {
            "activity": "Activity name", 
            "description": "Brief description"
          },
          "evening": {
            "activity": "Activity name",
            "description": "Brief description"
          },
          "food": {
            "lunch": "Lunch suggestion",
            "dinner": "Dinner suggestion"
          }
        }
      ],
      "accommodation_suggestions": [
        {
          "name": "Hotel name",
          "type": "Hotel type",
          "description": "Brief description"
        }
      ]
    }
  ]
}`;

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your environment variables.");
      }
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const payload = {
        contents: [{ parts: [{ text: query }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { 
          responseMimeType: "application/json",
          temperature: 0.7,
          maxOutputTokens: 4000
        },
      };
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      const result = await response.json();
      const candidate = result.candidates?.[0];
      if (candidate?.content?.parts?.[0]?.text) {
        try {
          const parsedResponse = JSON.parse(candidate.content.parts[0].text);
          if (parsedResponse && parsedResponse.itinerary_options) {
            return parsedResponse;
          } else {
            throw new Error("Invalid response structure from AI");
          }
        } catch (parseError) {
          console.error("JSON Parse Error:", parseError);
          console.error("Raw response:", candidate.content.parts[0].text);
          throw new Error("Failed to parse itinerary from AI response. The AI may have returned invalid JSON.");
        }
      } else {
        console.error("Unexpected API response structure:", result);
        throw new Error("Failed to parse itinerary from AI response.");
      }
    } catch (err) {
      console.error("API Error:", err);
      throw err; // Re-throw the error so it can be handled by the caller
    }
  };

  const handleGenerateSubmit = async (e) => {
    e.preventDefault();
    if (
      !destination ||
      !startDate ||
      !endDate ||
      !budget ||
      !numberOfPeople ||
      travelPreferences.length === 0
    ) {
      setError(
        "Please fill in all required fields: destination, dates, budget, number of people, and select at least one travel style."
      );
      return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      setError("End date cannot be before the start date.");
      return;
    }

    setLoading(true);
    setError(null);
    setItinerary(null);
    setRefinementPrompt("");
    setTimeout(
      () =>
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        }),
      100
    );

    const duration =
      Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;
    const userQuery = `Create a travel itinerary with these details:
- Destination: ${destination}
- Duration: ${duration} days (from ${startDate} to ${endDate})
- Number of People: ${numberOfPeople}
- Budget: Approximately ${budget} ${currency}
- Travel Preferences: ${travelPreferences.join(", ")}
- Additional Notes: ${extraNotes || "None"}`;

    setOriginalUserQuery(userQuery);

    try {
      console.log('🚀 Starting API call...');
      const parsedItinerary = await callGeminiAPI(userQuery);
      console.log('✅ API call successful:', parsedItinerary);
      if (parsedItinerary && parsedItinerary.itinerary_options) {
        setItinerary(parsedItinerary);
      } else {
        console.log('❌ Invalid response structure:', parsedItinerary);
        setError(
          "Sorry, I couldn't create an itinerary with that request. Please try different options."
        );
      }
    } catch (error) {
      console.error('❌ API call failed:', error);
      setError(error.message || "Sorry, I couldn't create an itinerary with that request. Please try different options.");
    } finally {
      setLoading(false);
    }
  };

  const refineItinerary = async () => {
    if (!refinementPrompt) {
      setError("Please enter what you'd like to change.");
      return;
    }
    setLoading(true);
    setError(null);
    setTimeout(
      () =>
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        }),
      100
    );

    const refinementQuery = `The user's original request was: "${originalUserQuery}".
The itinerary you previously generated is: ${JSON.stringify(itinerary)}.
Now, the user wants to refine this plan with the following request: "${refinementPrompt}".
Please generate a new, updated itinerary based on this feedback. Make sure to keep the original constraints unless the user specifies otherwise. Output ONLY the updated JSON.`;

    try {
      const parsedItinerary = await callGeminiAPI(refinementQuery);
      if (parsedItinerary && parsedItinerary.itinerary_options) {
        setItinerary(parsedItinerary);
      } else {
        setError(
          "Sorry, I couldn't refine the itinerary with that request. Please try a different modification."
        );
      }
    } catch (error) {
      setError(error.message || "Sorry, I couldn't refine the itinerary with that request. Please try a different modification.");
    } finally {
      setLoading(false);
    }
    setRefinementPrompt("");
  };

  const handlePreferenceChange = (id) =>
    setTravelPreferences((p) =>
      p.includes(id) ? p.filter((i) => i !== id) : [...p, id]
    );
  const handleSuggestionClick = (s) => {
    setDestination(s.properties.formatted);
    setSuggestions([]);
  };
  const handleKeyDown = (e) => {
    if (suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex(
          (prev) => (prev - 1 + suggestions.length) % suggestions.length
        );
      } else if (e.key === "Enter") {
        if (highlightedIndex > -1) {
          e.preventDefault();
          handleSuggestionClick(suggestions[highlightedIndex]);
        }
      } else if (e.key === "Escape") {
        setSuggestions([]);
      }
    }
  };

  return (
    <div className="w-full max-w-6xl z-0 flex flex-col items-center animate-fade-in">
      <div className="w-full flex justify-center mt-4 sm:mt-8 px-4 mb-8">
        <form
          onSubmit={handleGenerateSubmit}
          className="w-full max-w-3xl bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-gray-200"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-gray-900">
            Let's Plan Your Next Adventure
          </h2>
          <p className="text-center text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
            Fill in the details below to get your personalized AI-powered
            itinerary.
          </p>
          <div className="space-y-4 sm:space-y-6">
            <div className="relative group" ref={suggestionsRef}>
              <label className="absolute -top-2 left-4 px-2 bg-white text-gray-600 text-xs font-bold z-30 group-focus-within:text-purple-500 transition-colors duration-300 ease-in-out shadow-sm">
                Destination*
              </label>
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-purple-500 transition-colors duration-300 ease-in-out w-5 h-5 z-20" />
              <input
                type="text"
                placeholder="e.g., Paris, France"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onKeyDown={handleKeyDown}

                className="relative z-10 w-full bg-gray-50 text-gray-900 placeholder:text-gray-500 border-2 border-gray-300 focus:border-purple-500 focus:bg-white focus:ring-0 rounded-xl py-3 pl-12 pr-4 transition-all duration-300 ease-in-out text-base font-medium hover:border-gray-400"
              />

                              {(suggestions.length > 0 || isTyping) && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-white/95 backdrop-blur-xl border-2 border-purple-100 rounded-xl shadow-2xl z-20 max-h-60 overflow-y-auto animate-fade-in-up">
                  {isTyping && (
                    <div className="text-gray-500 px-4 py-3 text-center text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                        Searching destinations...
                      </div>
                    </div>
                  )}
                  {!isTyping && suggestions.length > 0 && (
                    <div className="py-1">
                      {suggestions.map((s, i) => (
                        <div
                          key={s.properties.place_id}
                          ref={(el) => (suggestionRefs.current[i] = el)}
                          onClick={() => handleSuggestionClick(s)}
                          className={`px-4 py-3 text-gray-900 hover:bg-purple-50 cursor-pointer transition-all duration-200 border-b border-gray-100 last:border-b-0 flex items-center gap-3 ${
                            i === highlightedIndex ? "bg-purple-50 border-l-4 border-l-purple-500" : ""
                          }`}
                        >
                          <img
                            src={getCountryFlagUrl(s.properties.country_code)}
                            alt={s.properties.country}
                            className="w-5 h-auto rounded-sm flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">
                              {s.properties.formatted}
                            </div>
                            {s.properties.type && (
                              <div className="text-xs text-gray-500 capitalize">
                                {s.properties.type.replace('_', ' ')}
                              </div>
                            )}
                          </div>
                          {i === highlightedIndex && (
                            <div className="text-purple-500">
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {!isTyping && suggestions.length === 0 && destination.length > 0 && (
                    <div className="text-gray-500 px-4 py-3 text-center text-sm">
                      No destinations found. Try a different search term.
                    </div>
                  )}
                  
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ModernDatePicker
                selectedDate={startDate}
                onChange={setStartDate}
                minDate={today}
                placeholder="Start Date*"
              />
              <ModernDatePicker
                selectedDate={endDate}
                onChange={setEndDate}
                minDate={startDate || today}
                placeholder="End Date*"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative group">
                <label className="absolute -top-2 left-4 px-2 bg-white text-gray-500 text-xs font-semibold z-10 group-focus-within:text-purple-500 transition-colors duration-300 ease-in-out">
                  Budget*
                </label>
                <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-500 transition-colors duration-300 ease-in-out" />
                <input
                  type="text"
                  placeholder="20,000"
                  min="0"
                  value={formattedBudget}
                  onChange={handleBudgetChange}
                  className="w-full bg-white text-gray-900 placeholder:text-gray-400 border-2 border-gray-200 focus:border-purple-500 focus:ring-0 rounded-xl py-2.5 pl-12 pr-4 transition-all duration-300 ease-in-out"
                />
              </div>
              <CustomCurrencySelect
                value={currency}
                onChange={setCurrency}
                options={currencies}
              />
            </div>
            <div className="relative group">
              <label className="absolute -top-2 left-4 px-2 bg-white text-gray-500 text-xs font-semibold z-10 group-focus-within:text-purple-500 transition-colors duration-300 ease-in-out">
                Number of People*
              </label>
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-500 transition-colors duration-300 ease-in-out" />
              <input
                type="number"
                placeholder="e.g., 2"
                min="1"
                value={numberOfPeople}
                onChange={(e) =>
                  setNumberOfPeople(
                    Math.max(1, parseInt(e.target.value, 10)) || 1
                  )
                }
                className="w-full bg-white text-gray-900 placeholder:text-gray-400 border-2 border-gray-200 focus:border-purple-500 focus:ring-0 rounded-xl py-2.5 pl-12 pr-4 transition-all duration-300 ease-in-out"
              />
            </div>
            <div>
              <label className="block text-gray-900 font-semibold mb-4 text-center text-lg">
                What's Your Travel Style?*
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 justify-center">
                {travelPreferencesList.map((pref) => (
                  <button
                    type="button"
                    key={pref.id}
                    onClick={() => handlePreferenceChange(pref.id)}
                    className={`flex flex-col items-center justify-center gap-2 p-2 w-full h-24 rounded-2xl border-2 transition-all duration-300 ease-in-out transform hover:-translate-y-1 ${
                      travelPreferences.includes(pref.id)
                        ? "bg-purple-100 border-purple-500 text-purple-600 shadow-lg shadow-purple-500/20"
                        : "bg-gray-100 border-gray-200 hover:border-gray-400 text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {React.cloneElement(pref.icon, { className: "w-8 h-8" })}
                    <span className="font-semibold text-sm text-center">
                      {pref.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="relative group">
              <label className="absolute -top-2 left-4 px-2 bg-white text-gray-500 text-xs font-semibold z-10 group-focus-within:text-purple-500 transition-colors duration-300 ease-in-out">
                Anything else?
              </label>
              <Info className="absolute left-4 top-4 text-gray-500 group-focus-within:text-purple-500 transition-colors duration-300 ease-in-out" />
              <textarea
                placeholder="e.g., I'd love to visit a famous museum."
                value={extraNotes}
                onChange={(e) => setExtraNotes(e.target.value)}
                className="w-full bg-white text-gray-900 placeholder:text-gray-400 border-2 border-gray-200 focus:border-purple-500 focus:ring-0 rounded-2xl py-3 pl-12 pr-4 h-24 resize-none transition-all duration-300 ease-in-out"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white font-bold py-4 rounded-full flex items-center justify-center gap-2 text-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg  ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-500 to-indigo-600 hover:shadow-xl hover:shadow-purple-500/40"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" /> {loadingMessage}
                </>
              ) : (
                <>
                  <Sparkles /> Create My Itinerary
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      <div ref={resultsRef} className="w-full flex justify-center px-4">
        <div className="w-full max-w-3xl">
        <ErrorDisplay message={error} />
        {loading && <LoadingSkeleton />}
        {itinerary && (
          <ItineraryDisplay data={itinerary} destination={destination} />
        )}
        {itinerary && !loading && (
          <div className="w-full mt-8 sm:mt-12 p-4 sm:p-6 bg-white rounded-2xl shadow-lg border border-gray-200 animate-fade-in-up">
            <h3 className="text-xl sm:text-2xl font-bold text-center mb-3 sm:mb-4">
              Want to make some changes?
            </h3>
            <p className="text-center text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
              Let me know what you'd like to adjust, and I'll create a new
              version for you!
            </p>
            <div className="relative group">
              <textarea
                placeholder="e.g., 'Can you replace the museum on Day 2 with a hiking trail?' or 'Add more budget-friendly food options.'"
                value={refinementPrompt}
                onChange={(e) => setRefinementPrompt(e.target.value)}
                className="w-full bg-white text-gray-900 placeholder-gray-400 border-2 border-gray-200 focus:border-purple-500 focus:ring-0 rounded-2xl py-3 px-4 h-24 resize-none transition-all duration-300 ease-in-out text-sm sm:text-base"
              />
            </div>
            <button
              onClick={refineItinerary}
              disabled={loading}
              className={`mt-4 w-full text-white font-bold py-3 rounded-full flex items-center justify-center gap-2 text-base sm:text-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 to-green-600 hover:shadow-xl hover:shadow-emerald-500/30"
              }`}
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" /> Refine My Itinerary
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

const BusinessPage = ({ setCurrentPage }) => (
  <div className="w-full text-gray-900 animate-fade-in max-w-5xl mx-auto py-16 sm:py-20">
    <div className="text-center">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
        Empower Your Business with Itinera AI
      </h1>
      <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-12">
        Integrate our powerful itinerary generation engine to save time, delight
        customers, and scale your travel services.
      </p>
    </div>
    <div className="grid md:grid-cols-2 gap-10 items-center">
      <div className="space-y-8">
        <div className="flex items-start gap-4">
          <div className="bg-gray-900/10 p-3 rounded-full">
            <Briefcase className="text-gray-900" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">For Travel Agencies</h3>
            <p className="text-gray-600">
              Generate complex, multi-day itineraries for clients in minutes,
              not hours. Offer hyper-personalized travel plans as a premium
              service.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="bg-gray-900/10 p-3 rounded-full">
            <Target className="text-gray-900" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">For Corporate Travel</h3>
            <p className="text-gray-600">
              Streamline business trip planning. Create efficient,
              budget-compliant itineraries that cater to the needs of your
              employees.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="bg-gray-900/10 p-3 rounded-full">
            <Globe className="text-gray-900" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">API & White-Label</h3>
            <p className="text-gray-600">
              Integrate Itinera's AI directly into your own website or app with
              our flexible API, or deploy our solution under your own brand.
            </p>
          </div>
        </div>
      </div>
      <div className="bg-white p-8 rounded-2xl border border-gray-200 mt-10 md:mt-0">
        <h3 className="text-2xl font-bold mb-4 text-center">Let's Connect</h3>
        <p className="text-center text-gray-600 mb-6">
          Discover how we can help your business grow.
        </p>
        <button
          onClick={() => setCurrentPage("contact")}
          className="w-full bg-gray-900 text-white font-bold py-3 rounded-full text-lg hover:bg-opacity-90 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg"
        >
          Request a Demo
        </button>
      </div>
    </div>
  </div>
);
const ContactPage = () => (
  <div className="w-full text-gray-900 animate-fade-in max-w-3xl mx-auto py-16 sm:py-20 text-center">
    <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">Get In Touch</h1>
    <p className="text-base sm:text-lg text-gray-600 mb-12">
      We'd love to hear from you. Whether you have a question about our
      services, a business proposal, or just want to say hello.
    </p>
    <div className="bg-white p-8 rounded-2xl border border-gray-200 inline-flex flex-col gap-6 text-lg">
      <div className="flex items-center gap-4">
        <Mail className="text-gray-900" />
        <a
          href="mailto:contact@itinera.ai"
          className="hover:text-gray-600 transition-colors duration-300 ease-in-out"
        >
          contact@itinera.ai
        </a>
      </div>
      <div className="flex items-center gap-4">
        <Phone className="text-gray-900" />
        <a
          href="tel:+1234567890"
          className="hover:text-gray-600 transition-colors duration-300 ease-in-out"
        >
          +1 (234) 567-890
        </a>
      </div>
    </div>
  </div>
);

// --- SHARED UI & DISPLAY COMPONENTS ---

const ErrorDisplay = ({ message }) =>
  message && (
    <div className="w-full mt-8 bg-red-500/10 border border-red-500/20 text-red-800 p-4 rounded-xl flex items-center gap-4 animate-fade-in-up">
      <ServerCrash className="w-8 h-8 text-red-600 flex-shrink-0" />
      <div>
        <h3 className="font-bold">Oops!</h3>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
const LoadingSkeleton = () => (
  <div className="w-full mt-8 animate-pulse">
    <div className="h-10 bg-gray-300 rounded-lg w-1/2 mb-6"></div>
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-2xl">
          <div className="h-6 bg-gray-300 rounded-md w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded-md w-full"></div>
            <div className="h-4 bg-gray-300 rounded-md w-5/6"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ItineraryDisplay = ({ data, destination }) => {
  const [activeTab, setActiveTab] = useState(0);

  if (!data || !data.itinerary_options) return null;

  const activeItinerary = data.itinerary_options[activeTab];

  return (
    <div className="w-full mt-4 sm:mt-6 text-gray-900 animate-fade-in">
      <div id="pdf-content" className="bg-white p-3 sm:p-4 md:p-6 rounded-2xl shadow-lg border border-gray-200">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-center text-gray-900 opacity-0 animate-fade-in-up">
          Your Trip to {destination}!
        </h2>
        <p
          className="text-center text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 opacity-0 animate-fade-in-up"
          style={{ animationDelay: "100ms" }}
        >
          Here are a few options based on your preferences. Select a tab to view
          each plan.
        </p>

        <div
          className="flex justify-center mb-6 sm:mb-8 border-b border-gray-200 opacity-0 animate-fade-in-up overflow-x-auto"
          style={{ animationDelay: "200ms" }}
        >
          {data.itinerary_options.map((option, index) => (
            <button
              key={option.type}
              onClick={() => setActiveTab(index)}
              className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-lg font-semibold transition-all duration-300 ease-in-out relative whitespace-nowrap ${
                activeTab === index
                  ? "text-purple-500"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {option.type}
              {activeTab === index && (
                <span className="absolute bottom-0 left-0 w-full h-1 bg-purple-500 rounded-t-full"></span>
              )}
            </button>
          ))}
        </div>

        <div
          className="opacity-0 animate-fade-in-up"
          style={{ animationDelay: "300ms" }}
        >
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-center text-gray-900">
              {activeItinerary.type} Plan
            </h3>
            <p className="text-center text-gray-600 mt-1 text-sm sm:text-base">
              {activeItinerary.summary}
            </p>
          </div>
          <div className="space-y-6 sm:space-y-8 mt-6 sm:mt-8">
            {activeItinerary.itinerary?.map((day, i) => (
              <div
                key={day.day}
                className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 ease-in-out hover:border-purple-500/50 hover:shadow-2xl opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${400 + i * 100}ms` }}
              >
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                  Day {day.day}:{" "}
                  <span className="font-semibold text-gray-600">
                    {day.theme}
                  </span>
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <ActivityCard
                    time="Morning"
                    details={day.morning}
                    icon={<Coffee />}
                  />
                  <ActivityCard
                    time="Afternoon"
                    details={day.afternoon}
                    icon={<Sun />}
                  />
                  <ActivityCard
                    time="Evening"
                    details={day.evening}
                    icon={<Moon />}
                  />
                  <FoodCard details={day.food} />
                </div>
              </div>
            ))}
          </div>
          <div
            className="mt-8 sm:mt-12 opacity-0 animate-fade-in-up"
            style={{
              animationDelay: `${
                400 + (activeItinerary.itinerary?.length || 0) * 100
              }ms`,
            }}
          >
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-center flex items-center justify-center gap-2 sm:gap-3">
              <Hotel className="w-5 h-5 sm:w-6 sm:h-6" /> Accommodation Ideas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {activeItinerary.accommodation_suggestions?.map((hotel) => (
                <div
                  key={hotel.name}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 transform hover:-translate-y-1 transition-transform duration-300 ease-in-out shadow-md hover:shadow-xl"
                >
                  <h4 className="font-bold text-base sm:text-lg text-gray-900">
                    {hotel.name}
                  </h4>
                  <p className="text-sm font-semibold text-gray-600 mb-2">
                    {hotel.type}
                  </p>
                  <p className="text-gray-600 text-sm">{hotel.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActivityCard = ({ time, details, icon }) => {
  if (!details || !details.activity) return null;
  return (
    <div className="flex items-start gap-3 sm:gap-4">
      <div className={`${iconColorMap[time]} p-2 rounded-full mt-1 flex-shrink-0`}>
        {React.cloneElement(icon, { className: "w-4 h-4 sm:w-5 sm:h-5" })}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-base sm:text-lg text-gray-900">
          {time}: <span className="font-bold">{details.activity}</span>
        </p>
        <p className="text-gray-600 text-sm mt-1">{details.description}</p>
      </div>
    </div>
  );
};
const FoodCard = ({ details }) => {
  if (!details || (!details.lunch && !details.dinner)) return null;
  return (
    <div className="border-t border-gray-200 pt-3 sm:pt-4 mt-3 sm:mt-4 flex items-start gap-3 sm:gap-4">
      <div className={`${iconColorMap["Food"]} p-2 rounded-full mt-1 flex-shrink-0`}>
        <Utensils className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>
      <div className="min-w-0 flex-1">
        {details.lunch && (
          <p className="font-semibold text-gray-900 text-sm sm:text-base">
            Lunch:{" "}
            <span className="font-normal text-gray-600">{details.lunch}</span>
          </p>
        )}
        {details.dinner && (
          <p className="font-semibold text-gray-900 text-sm sm:text-base mt-1">
            Dinner:{" "}
            <span className="font-normal text-gray-600">{details.dinner}</span>
          </p>
        )}
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT (Router) ---
const App = () => {
  const [currentPage, setCurrentPage] = useState("home");

  useEffect(() => {
    const logo = new Image();
    logo.src =
      "https://i.ibb.co/mrh1SqNb/Chat-GPT-Image-Aug-30-2025-01-01-05-AM.png";
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case "planner":
        return <PlannerPage />;
      case "business":
        return <BusinessPage setCurrentPage={setCurrentPage} />;
      case "contact":
        return <ContactPage />;
      case "home":
      default:
        return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };
  const NavLink = ({ page, children }) => (
    <button
      onClick={() => setCurrentPage(page)}
      className={`nav-link px-4 py-2 transition-colors duration-300 ease-in-out text-lg ${
        currentPage === page
          ? "text-gray-900 font-semibold"
          : "text-gray-600 hover:text-gray-900"
      }`}
    >
      {children}
    </button>
  );

  return (
    <>
      <StyleInjector />
      <main className="min-h-screen w-full bg-gray-100 text-gray-900 font-sans flex flex-col items-center overflow-x-hidden">
        <nav className="w-full z-10 bg-white/80 backdrop-blur-xl border-b border-gray-200 flex justify-center sticky top-0 transition-all duration-300 ease-in-out">
          <div className="w-full max-w-7xl flex justify-between items-center p-3 sm:p-4">
            <div
              className="flex items-center cursor-pointer gap-2 sm:gap-3"
              onClick={() => setCurrentPage("home")}
            >
              <img
                src="https://i.ibb.co/mrh1SqNb/Chat-GPT-Image-Aug-30-2025-01-01-05-AM.png"
                alt="Itinera Logo"
                className="h-10 sm:h-14 w-auto transition-transform duration-300 ease-in-out hover:scale-110"
              />
              <span className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-wider">
                Itinera
              </span>
            </div>
            <div className="hidden md:flex items-center gap-3 sm:gap-4">
              <NavLink page="home">Home</NavLink>
              <NavLink page="planner">Planner</NavLink>
              <NavLink page="business">For Business</NavLink>
              <NavLink page="contact">Contact</NavLink>
            </div>
            <button
              onClick={() => setCurrentPage("planner")}
              className="bg-gray-900 text-white font-bold py-2 px-4 sm:px-5 rounded-full hover:bg-opacity-90 transition-colors duration-300 ease-in-out md:hidden text-sm sm:text-base"
            >
              Plan Trip
            </button>
          </div>
        </nav>
        <div className="w-full max-w-7xl z-0 p-3 sm:p-4 md:p-6">{renderPage()}</div>
        <footer className="w-full max-w-7xl mt-auto pt-10 pb-4 text-center text-gray-600 border-t border-gray-200 z-10 text-sm">
          <p>&copy; {new Date().getFullYear()} Itinera. All rights reserved.</p>
          <p>Powered by AI, built for adventure.</p>
        </footer>
      </main>
    </>
  );
};

export default App;
