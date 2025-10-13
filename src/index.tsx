import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { ErrorProvider } from "./Context/ErrorContext.tsx";
import { FileProvider } from "./Context/FileContext.tsx";
import { TagProvider } from "./Context/TagContext.tsx";
import { TagSelectionProvider } from "./Context/TagSelectionContext.tsx";
import { ChatProvider } from "./Context/ChatContext.tsx";
import { BrowserRouter } from "react-router-dom";
import { SuccessProvider } from "./Context/SuccessContext.tsx";
import { AuthProvider } from "./Context/AuthContext.tsx";
import { ClearTagsOnRouteChange } from "./Components/ClearTagsOnRouteChange.tsx";
import { SearchProvider } from "./Context/SearchContext.tsx";
import { NavProvider } from "./Context/NavManage.tsx";
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <NavProvider>
        <SearchProvider>
          <ChatProvider>
            <TagSelectionProvider>
              <ClearTagsOnRouteChange />
              <TagProvider>
                <FileProvider>
                  <SuccessProvider>
                    <ErrorProvider>
                      <AuthProvider>
                        <App />
                      </AuthProvider>
                    </ErrorProvider>
                  </SuccessProvider>
                </FileProvider>
              </TagProvider>
            </TagSelectionProvider>
          </ChatProvider>
        </SearchProvider>
      </NavProvider>
    </BrowserRouter>
  </React.StrictMode>
);
