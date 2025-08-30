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
    if (destination.length < 3) {
      setSuggestions([]);
      return;
    }
    const handler = setTimeout(async () => {
      setIsTyping(true);
      try {
        const res = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${destination}&type=city&apiKey=${GEOAPIFY_API_KEY}`
        );
        const data = await res.json();
        setSuggestions(data.features || []);
        setHighlightedIndex(-1);
      } catch (err) {
        console.error("Geoapify error:", err);
      } finally {
        setIsTyping(false);
      }
    }, 500);
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
    const systemPrompt = `You are Itinera, a world-class travel expert AI. Your primary goal is to create three distinct, practical, and inspiring travel itinerary options based on a single user request. You must strictly adhere to all user inputs, especially the total budget. For the given destination, budget, and preferences, you will generate three itinerary variations: 'Balanced', 'Luxury Stay', and 'Explorer'. 1. **Balanced Itinerary**: This should be a well-rounded plan. Allocate the budget for mid-range accommodations and a mix of paid attractions and free activities. Dining should include both popular restaurants and local eateries. 2. **Luxury Stay Itinerary**: This plan prioritizes comfort. Allocate a larger portion of the budget to high-end accommodation (4-5 star hotels, boutique hotels). The pacing should be more relaxed, with comfortable travel arrangements (e.g., taxis over public transport) and perhaps one or two premium experiences like fine dining or a private tour. 3. **Explorer Itinerary**: This plan prioritizes experiences over comfort. Allocate the budget towards more activities, tours, and exploration. Accommodation should be budget-friendly (e.g., hostels, budget hotels, guesthouses). Emphasize local transport, street food, and unique, possibly off-the-beaten-path activities. **Key Instructions**: - **Budgeting is CRITICAL**: The *total cost* for each of the three plans should still be within the user's single specified budget. You are reallocating the same budget, not creating three different budgets. - **Logic & Pacing**: All itineraries must have geographically logical routing to minimize travel time and a balanced pace. - **Output Format**: You MUST respond ONLY with a valid JSON object. Do not include any text, explanation, or markdown formatting before or after the JSON. The JSON schema is: {"itinerary_options": [{"type": "Balanced" | "Luxury Stay" | "Explorer", "summary": "A brief, one-sentence summary of this itinerary style.", "itinerary": [{"day": "number", "theme": "string", "morning": {"activity": "string", "description": "string"}, "afternoon": {"activity": "string", "description": "string"}, "evening": {"activity": "string", "description": "string"}, "food": {"lunch": "string", "dinner": "string"}}], "accommodation_suggestions": [{"name": "string", "type": "string", "description": "string"}]}]}`;

    try {
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
      const payload = {
        contents: [{ parts: [{ text: query }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { responseMimeType: "application/json" },
      };
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok)
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      const result = await response.json();
      const candidate = result.candidates?.[0];
      if (candidate?.content?.parts?.[0]?.text) {
        return JSON.parse(candidate.content.parts[0].text);
      } else {
        throw new Error("Failed to parse itinerary from AI response.");
      }
    } catch (err) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setLoading(false);
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

    const parsedItinerary = await callGeminiAPI(userQuery);
    if (parsedItinerary && parsedItinerary.itinerary_options) {
      setItinerary(parsedItinerary);
    } else {
      setError(
        "Sorry, I couldn't create an itinerary with that request. Please try different options."
      );
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

    const parsedItinerary = await callGeminiAPI(refinementQuery);
    if (parsedItinerary && parsedItinerary.itinerary_options) {
      setItinerary(parsedItinerary);
    } else {
      setError(
        "Sorry, I couldn't refine the itinerary with that request. Please try a different modification."
      );
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
      <div className="w-full flex justify-center mt-8">
        <form
          onSubmit={handleGenerateSubmit}
          className="w-full max-w-3xl bg-white p-6 md:p-8 rounded-3xl shadow-2xl border border-gray-200"
        >
          <h2 className="text-3xl font-bold text-center mb-2 text-gray-900">
            Let's Plan Your Next Adventure
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Fill in the details below to get your personalized AI-powered
            itinerary.
          </p>
          <div className="space-y-6">
            <div className="relative group" ref={suggestionsRef}>
              <label className="absolute -top-2 left-4 px-2 bg-white text-gray-500 text-xs font-semibold z-10 group-focus-within:text-purple-500 transition-colors duration-300 ease-in-out">
                Destination*
              </label>
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-500 transition-colors duration-300 ease-in-out" />
              <input
                type="text"
                placeholder="e.g., Paris, France"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-white text-gray-900 placeholder:text-gray-400 border-2 border-gray-200 focus:border-purple-500 focus:ring-0 rounded-xl py-2.5 pl-12 pr-4 transition-all duration-300 ease-in-out"
              />
              {(suggestions.length > 0 || isTyping) && (
                <div className="absolute top-full mt-2 w-full bg-white/80 backdrop-blur-xl border border-gray-200 rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto">
                  {isTyping && (
                    <div className="text-gray-500 px-4 py-2">Searching...</div>
                  )}
                  {!isTyping &&
                    suggestions.map((s, i) => (
                      <div
                        key={s.properties.place_id}
                        ref={(el) => (suggestionRefs.current[i] = el)}
                        onClick={() => handleSuggestionClick(s)}
                        className={`px-4 py-3 text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors duration-200 border-b border-gray-200 last:border-b-0 flex items-center gap-3 ${
                          i === highlightedIndex ? "bg-gray-100" : ""
                        }`}
                      >
                        <img
                          src={getCountryFlagUrl(s.properties.country_code)}
                          alt={s.properties.country}
                          className="w-6 h-auto rounded-sm flex-shrink-0"
                        />
                        <span>{s.properties.formatted}</span>
                      </div>
                    ))}
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
      <div ref={resultsRef} className="w-full">
        <ErrorDisplay message={error} />
        {loading && <LoadingSkeleton />}
        {itinerary && (
          <ItineraryDisplay data={itinerary} destination={destination} />
        )}
        {itinerary && !loading && (
          <div className="w-full max-w-4xl mx-auto mt-12 p-6 bg-white rounded-2xl shadow-lg border border-gray-200 animate-fade-in-up">
            <h3 className="text-2xl font-bold text-center mb-4">
              Want to make some changes?
            </h3>
            <p className="text-center text-gray-600 mb-6">
              Let me know what you'd like to adjust, and I'll create a new
              version for you!
            </p>
            <div className="relative group">
              <textarea
                placeholder="e.g., 'Can you replace the museum on Day 2 with a hiking trail?' or 'Add more budget-friendly food options.'"
                value={refinementPrompt}
                onChange={(e) => setRefinementPrompt(e.target.value)}
                className="w-full bg-white text-gray-900 placeholder-gray-400 border-2 border-gray-200 focus:border-purple-500 focus:ring-0 rounded-2xl py-3 px-4 h-24 resize-none transition-all duration-300 ease-in-out"
              />
            </div>
            <button
              onClick={refineItinerary}
              disabled={loading}
              className={`mt-4 w-full text-white font-bold py-3 rounded-full flex items-center justify-center gap-2 text-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 to-green-600 hover:shadow-xl hover:shadow-emerald-500/30"
              }`}
            >
              <Sparkles /> Refine My Itinerary
            </button>
          </div>
        )}
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
    <div className="w-full max-w-4xl mt-8 bg-red-500/10 border border-red-500/20 text-red-800 p-4 rounded-xl flex items-center gap-4 animate-fade-in-up">
      <ServerCrash className="w-8 h-8 text-red-600 flex-shrink-0" />
      <div>
        <h3 className="font-bold">Oops!</h3>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
const LoadingSkeleton = () => (
  <div className="w-full max-w-4xl mt-8 animate-pulse">
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
    <div className="w-full max-w-4xl mt-8 text-gray-900 animate-fade-in">
      <div id="pdf-content" className="bg-gray-100 p-4 sm:p-6">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-center text-gray-900 opacity-0 animate-fade-in-up">
          Your Trip to {destination}!
        </h2>
        <p
          className="text-center text-lg text-gray-600 mb-8 opacity-0 animate-fade-in-up"
          style={{ animationDelay: "100ms" }}
        >
          Here are a few options based on your preferences. Select a tab to view
          each plan.
        </p>

        <div
          className="flex justify-center mb-8 border-b border-gray-200 opacity-0 animate-fade-in-up"
          style={{ animationDelay: "200ms" }}
        >
          {data.itinerary_options.map((option, index) => (
            <button
              key={option.type}
              onClick={() => setActiveTab(index)}
              className={`px-6 py-3 text-lg font-semibold transition-all duration-300 ease-in-out relative ${
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
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 mb-8">
            <h3 className="text-2xl font-bold text-center text-gray-900">
              {activeItinerary.type} Plan
            </h3>
            <p className="text-center text-gray-600 mt-1">
              {activeItinerary.summary}
            </p>
          </div>
          <div className="space-y-8 mt-8">
            {activeItinerary.itinerary?.map((day, i) => (
              <div
                key={day.day}
                className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 ease-in-out hover:border-purple-500/50 hover:shadow-2xl opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${400 + i * 100}ms` }}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Day {day.day}:{" "}
                  <span className="font-semibold text-gray-600">
                    {day.theme}
                  </span>
                </h3>
                <div className="space-y-4">
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
            className="mt-12 opacity-0 animate-fade-in-up"
            style={{
              animationDelay: `${
                400 + (activeItinerary.itinerary?.length || 0) * 100
              }ms`,
            }}
          >
            <h3 className="text-2xl sm:text-3xl font-bold mb-6 text-center flex items-center justify-center gap-3">
              <Hotel /> Accommodation Ideas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeItinerary.accommodation_suggestions?.map((hotel) => (
                <div
                  key={hotel.name}
                  className="bg-white p-5 rounded-2xl border border-gray-200 transform hover:-translate-y-1 transition-transform duration-300 ease-in-out shadow-md hover:shadow-xl"
                >
                  <h4 className="font-bold text-lg text-gray-900">
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
    <div className="flex items-start gap-4">
      <div className={`${iconColorMap[time]} p-2 rounded-full mt-1`}>
        {React.cloneElement(icon, { className: "w-5 h-5" })}
      </div>
      <div>
        <p className="font-semibold text-lg text-gray-900">
          {time}: <span className="font-bold">{details.activity}</span>
        </p>
        <p className="text-gray-600 text-sm">{details.description}</p>
      </div>
    </div>
  );
};
const FoodCard = ({ details }) => {
  if (!details || (!details.lunch && !details.dinner)) return null;
  return (
    <div className="border-t border-gray-200 pt-4 mt-4 flex items-start gap-4">
      <div className={`${iconColorMap["Food"]} p-2 rounded-full mt-1`}>
        <Utensils className="w-5 h-5" />
      </div>
      <div>
        {details.lunch && (
          <p className="font-semibold text-gray-900">
            Lunch:{" "}
            <span className="font-normal text-gray-600">{details.lunch}</span>
          </p>
        )}
        {details.dinner && (
          <p className="font-semibold text-gray-900">
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
          <div className="w-full max-w-7xl flex justify-between items-center p-4">
            <div
              className="flex items-center cursor-pointer gap-3"
              onClick={() => setCurrentPage("home")}
            >
              <img
                src="https://i.ibb.co/mrh1SqNb/Chat-GPT-Image-Aug-30-2025-01-01-05-AM.png"
                alt="Itinera Logo"
                className="h-14 w-auto transition-transform duration-300 ease-in-out hover:scale-110"
              />
              <span className="text-3xl font-bold text-gray-900 tracking-wider">
                Itinera
              </span>
            </div>
            <div className="hidden md:flex items-center gap-4">
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
        <div className="w-full max-w-7xl z-0 p-4 sm:p-6">{renderPage()}</div>
        <footer className="w-full max-w-7xl mt-auto pt-10 pb-4 text-center text-gray-600 border-t border-gray-200 z-10 text-sm">
          <p>&copy; {new Date().getFullYear()} Itinera. All rights reserved.</p>
          <p>Powered by AI, built for adventure.</p>
        </footer>
      </main>
    </>
  );
};

export default App;
