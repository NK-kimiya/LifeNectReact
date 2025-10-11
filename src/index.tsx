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
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ChatProvider>
        <TagSelectionProvider>
          <TagProvider>
            <FileProvider>
              <SuccessProvider>
                <ErrorProvider>
                  <App />
                </ErrorProvider>
              </SuccessProvider>
            </FileProvider>
          </TagProvider>
        </TagSelectionProvider>
      </ChatProvider>
    </BrowserRouter>
  </React.StrictMode>
);
