export const commonSelectStyles = {
  control: (provided) => ({
    ...provided,
    borderRadius: "4px",
    border: "2px solid #ccc",
    boxShadow: "none",
    "&:hover": {
      border: "2px solid var(--color-primary)",
    },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? "var(--color-secondary)" : "white",
    color: state.isSelected ? "white" : "black",
    "&:hover": {
      backgroundColor: "var(--color-hover-color)",
      color: "white",
    },
  }),
};
