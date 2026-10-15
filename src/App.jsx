import { useEffect, useState } from "react";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Planner from "./pages/Planner.jsx";
import Business from "./pages/Business.jsx";
import Contact from "./pages/Contact.jsx";

const routes = { "/": Home, "/plan": Planner, "/business": Business, "/contact": Contact };
const titles = { "/": "AI Travel Planner", "/plan": "Plan a trip", "/business": "For business", "/contact": "Contact" };

const readRoute = () => {
  const path = window.location.hash.replace(/^#/, "") || "/";
  return routes[path] ? path : "/";
};

export default function App() {
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    const onHash = () => {
      setRoute(readRoute());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    document.title = `Itinera · ${titles[route]}`;
  }, [route]);

  const Page = routes[route];
  return (
    <Layout route={route}>
      <Page />
    </Layout>
  );
}
