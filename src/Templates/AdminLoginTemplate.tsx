import React from "react";
import Auth from "../Organisms/Auth.tsx";
import NavBar from "../Organisms/NavBar.tsx";
import Footer from "../Organisms/Footer.tsx";
import { useError } from "../Context/ErrorContext.tsx";
import { useNavigate } from "react-router-dom";
import { login } from "../API/Login.tsx";
const AdminLoginTemplate: React.FC = () => {
  const { setError } = useError();
  const navigate = useNavigate();

  const handleLogin = async (
    username: string,
    password: string
  ): Promise<void> => {
    const token: string | null = await login(username, password, setError);
    if (token) {
      navigate("/admin-top"); // ★ 成功したらここで遷移
    }
  };
  return (
    <div className="d-flex flex-column min-vh-100">
      <NavBar />

      {/* メイン部分をflexで伸ばす */}
      <div className="flex-grow-1">
        <Auth onSubmit={handleLogin} />
      </div>

      <Footer />
    </div>
  );
};

export default AdminLoginTemplate;
