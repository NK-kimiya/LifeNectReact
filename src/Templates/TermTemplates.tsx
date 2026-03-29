import React from "react";
import Terms from "../Organisms/Terms.tsx";
import Footer from "../Organisms/Footer.tsx";
import SimpleNav from "../Organisms/SimpleNav.tsx";

const TermTemplates = () => {
  return (
    <div>
      <SimpleNav/>
      <div className="container">
        <h2 className="text-start">ご利用にあたって</h2>
        <Terms />
      </div>

      <Footer />
    </div>
  );
};

export default TermTemplates;
