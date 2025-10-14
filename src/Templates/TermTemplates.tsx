import React from "react";
import Terms from "../Organisms/Terms.tsx";
import NavBar from "../Organisms/NavBar.tsx";
import Footer from "../Organisms/Footer.tsx";

const TermTemplates = () => {
  return (
    <div>
      <NavBar />
      <div className="container bg-secondary-subtle rounded mt-3">
        <h4 className="text-start">利用規約</h4>
        <Terms />
      </div>

      <Footer />
    </div>
  );
};

export default TermTemplates;
