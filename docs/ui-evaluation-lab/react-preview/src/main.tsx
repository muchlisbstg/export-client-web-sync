import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ProductExperience from "./ProductExperience";
import OriginExperience from "./OriginExperience";
import QualityHalalExperience from "./QualityHalalExperience";
import OrderJourneyExperience from "./OrderJourneyExperience";
import "./styles.css";
import "./product-experience.css";
import "./origin-experience.css";
import "./quality-halal-experience.css";
import "./order-journey-experience.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <ProductExperience />
    <OriginExperience />
    <QualityHalalExperience />
    <OrderJourneyExperience />
  </React.StrictMode>,
);
