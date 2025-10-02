import React, { createContext, useContext, useState, ReactNode } from "react";

export type Tag = {
  id: number;
  name: string;
};

type TagContextType = {
  tags: Tag[];
  setTags: React.Dispatch<React.SetStateAction<Tag[]>>;
};

const TagContext = createContext<TagContextType | undefined>(undefined);

export const TagProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [tags, setTags] = useState<Tag[]>([]);
  return (
    <TagContext.Provider value={{ tags, setTags }}>
      {children}
    </TagContext.Provider>
  );
};

export const useTagContext = (): TagContextType => {
  const context = useContext(TagContext);
  if (!context) {
    throw new Error("useTagContext must be used within a TagProvider");
  }
  return context;
};
