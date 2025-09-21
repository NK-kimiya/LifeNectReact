import React from "react";
import Auth from "../Organisms/Auth.tsx";
import NavBar from "../Organisms/NavBar.tsx";
import Footer from "../Organisms/Footer.tsx";

const AdminLoginTemplate = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <NavBar />

      {/* メイン部分をflexで伸ばす */}
      <div className="flex-grow-1">
        <Auth />
      </div>

      <Footer />
    </div>
  );
};

export default AdminLoginTemplate;
