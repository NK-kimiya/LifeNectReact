import React from "react";
import { useError } from "../Context/ErrorContext.tsx";
import { useSuccess } from "../Context/SuccessContext.tsx";

const AleartSuccess = () => {
  const { success, setSuccess } = useSuccess(); // Context から取得

  return (
    <>
      {success !== "" && (
        <div
          className="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          {success}
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="alert"
            aria-label="Close"
            onClick={() => setSuccess("")}
          ></button>
        </div>
      )}
    </>
  );
};

export default AleartSuccess;
