import React from "react";
import NavBar from "../Organisms/NavBar.tsx";
import Policy from "../Organisms/Policy.tsx";
import Footer from "../Organisms/Footer.tsx";

const PolicyTemplate = () => {
  return (
    <div>
      <NavBar />
      <div className="container bg-secondary-subtle rounded mt-3">
        <h4 className="text-start">プライバシーポリシー・Cookie</h4>
        <Policy />
      </div>
      <Footer />
    </div>
  );
};

export default PolicyTemplate;
