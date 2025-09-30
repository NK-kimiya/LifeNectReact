import React from "react";
import { useError } from "../Context/ErrorContext.tsx";

const Aleart = () => {
  const { error, setError } = useError(); // Context から取得

  return (
    <>
      {error !== "" && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          {error}
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="alert"
            aria-label="Close"
            onClick={() => setError("")}
          ></button>
        </div>
      )}
    </>
  );
};

export default Aleart;
