import React from "react";
import NavBar from "../Organisms/NavBar.tsx";
import Policy from "../Organisms/Policy.tsx";
import Footer from "../Organisms/Footer.tsx";

const PolicyTemplate = () => {
  return (
    <div>
      <NavBar />
      <div className="container">
        <Policy />
      </div>
      <Footer />
    </div>
  );
};

export default PolicyTemplate;
