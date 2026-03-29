import React from "react";
import Policy from "../Organisms/Policy.tsx";
import Footer from "../Organisms/Footer.tsx";
import SimpleNav from "../Organisms/SimpleNav.tsx";

const PolicyTemplate = () => {
  return (
    <div>
      <SimpleNav />
      <div className="container">
        <Policy />
      </div>
      <Footer />
    </div>
  );
};

export default PolicyTemplate;
