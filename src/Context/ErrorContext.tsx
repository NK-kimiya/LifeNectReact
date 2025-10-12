import React, {
  createContext,
  useState,
  ReactNode,
  useContext,
  Dispatch,
  SetStateAction,
  useMemo,
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

  const value = useMemo(
    // ★追加
    () => ({ error, setError }),
    [error]
  );

  return (
    <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>
  );
};

// カスタムフック（使いやすくするため）
export const useError = (): ErrorContextType => useContext(ErrorContext);
