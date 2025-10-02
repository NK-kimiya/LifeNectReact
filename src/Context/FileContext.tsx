import React, { createContext, useContext, useState, ReactNode } from "react";
import { UploadedFile } from "../API/File";

type FileContextType = {
  files: UploadedFile[];
  setFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
};

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  return (
    <FileContext.Provider value={{ files, setFiles }}>
      {children}
    </FileContext.Provider>
  );
};

export const useFileContext = (): FileContextType => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error("useFileContext must be used within a FileProvider");
  }
  return context;
};
