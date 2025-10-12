import React, {
  createContext,
  useState,
  ReactNode,
  useContext,
  Dispatch,
  SetStateAction,
  useMemo,
} from "react";

type SuccessContextType = {
  success: string;
  setSuccess: Dispatch<SetStateAction<string>>;
};

const SuccessContext = createContext<SuccessContextType>({
  success: "",
  setSuccess: () => {},
});

type SuccessProviderProps = {
  children: ReactNode;
};

export const SuccessProvider: React.FC<SuccessProviderProps> = ({
  children,
}) => {
  const [success, setSuccess] = useState("");

  const value = useMemo(
    // ★追加
    () => ({ success, setSuccess }),
    [success]
  );

  return (
    <SuccessContext.Provider value={value}>{children}</SuccessContext.Provider>
  );
};

// カスタムフック（使いやすくするため）
export const useSuccess = (): SuccessContextType => useContext(SuccessContext);
