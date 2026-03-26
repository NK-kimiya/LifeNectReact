import React from "react";
import Terms from "../Organisms/Terms.tsx";
import NavBar from "../Organisms/NavBar.tsx";
import Footer from "../Organisms/Footer.tsx";

const TermTemplates = () => {
  return (
    <div>
      <NavBar />
      <div className="container">
        <h2 className="text-start">ご利用にあたって</h2>
        <Terms />
      </div>

      <Footer />
    </div>
  );
};

export default TermTemplates;
