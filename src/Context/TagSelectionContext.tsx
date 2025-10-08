import React, { createContext, useContext, useState, ReactNode } from "react";

type TagSelectionContextType = {
  selectedTagIds: number[];
  setSelectedTagIds: React.Dispatch<React.SetStateAction<number[]>>; // ★ 初期化や一括更新用
  toggleTag: (tagId: number) => void;
};

const TagSelectionContext = createContext<TagSelectionContextType | undefined>(
  undefined
);

export const TagSelectionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  const toggleTag = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <TagSelectionContext.Provider
      value={{ selectedTagIds, setSelectedTagIds, toggleTag }}
    >
      {children}
    </TagSelectionContext.Provider>
  );
};

export const useTagSelection = (): TagSelectionContextType => {
  const context = useContext(TagSelectionContext);
  if (!context) {
    throw new Error(
      "useTagSelection must be used within a TagSelectionProvider"
    );
  }
  return context;
};
