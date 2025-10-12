import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
} from "react";

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

  const value = useMemo(
    // ★追加
    () => ({ tags, setTags }),
    [tags]
  );
  return <TagContext.Provider value={value}>{children}</TagContext.Provider>;
};

export const useTagContext = (): TagContextType => {
  const context = useContext(TagContext);
  if (!context) {
    throw new Error("useTagContext must be used within a TagProvider");
  }
  return context;
};
