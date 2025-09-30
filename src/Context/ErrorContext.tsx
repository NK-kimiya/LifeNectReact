import React, {
  createContext,
  useState,
  ReactNode,
  useContext,
  Dispatch,
  SetStateAction,
} from "react";

type ErrorContextType = {
  error: string;
  setError: Dispatch<SetStateAction<string>>;
};

const ErrorContext = createContext<ErrorContextType>({
  error: "",
  setError: () => {},
});

type ErrorProviderProps = {
  children: ReactNode;
};

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [error, setError] = useState("");

  return (
    <ErrorContext.Provider value={{ error, setError }}>
      {children}
    </ErrorContext.Provider>
  );
};

// カスタムフック（使いやすくするため）
export const useError = (): ErrorContextType => useContext(ErrorContext);
