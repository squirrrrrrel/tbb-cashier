import React from "react";
import Select from "react-select";
import { commonSelectStyles } from "../../common/select/selectStyle";

const InputComp = ({ label, placeholder, isRequired = false, type }) => {
  return (
    <div className="first-name flex flex-col w-full">
      <label className="text-gray-600 text-sm font-semibold">
        {label} <span className="text-red-600"> {isRequired ? " *" : ""}</span>
      </label>
      <input
        type={type}
        placeholder={placeholder}
        className="p-2 border border-gray-300 rounded-md bg-gray-50 placeholder:text-gray-500 mt-1 focus:outline-primary"
      />
    </div>
  );
};

const AddCustomersForm = () => {
  return (
    <div className="bg-white p-4 border-l border-gray-200 h-screen">
      <h2 className="text-2xl font-semibold text-gray-700">Add New Customer</h2>
      <div className="form mt-4">
        <form className="flex flex-col gap-4">
          <div className="name flex gap-4">
            <InputComp
              label={"First Name"}
              placeholder={"Enter First Name"}
              isRequired={true}
              type={"text"}
            />
            <InputComp
              label={"Last Name"}
              placeholder={"Enter First Name"}
              isRequired={true}
              type={"text"}
            />
          </div>
          <div className="phone-number flex gap-4">
            <div className="code w-1/2 flex flex-col">
              <label className="text-gray-600 text-sm font-semibold mb-[5px]">
                Code
                <span className="text-red-600"> *</span>
              </label>
              <Select
                isClearable="true"
                placeholder="Code"
                options={[{ label: "Select Code", value: "Select Code" }]}
                components={{
                  IndicatorSeparator: () => null,
                }}
                styles={{
                  control: (provided) => ({
                    ...provided,
                    borderRadius: "6px",
                    border: "none",
                    outline: "1px",
                    outlineStyle: "solid",
                    outlineColor: "#d1d5dc",
                    boxShadow: "none",
                    "&:focus, &:focus-within": {
                      outlineWidth: "2px",
                      outlineColor: "var(--color-primary)",
                    },
                    padding: "2px",
                    backgroundColor: "#f9fafb",
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isSelected
                      ? "var(--color-secondary)"
                      : "white",
                    color: state.isSelected ? "white" : "black",
                    "&:hover": {
                      backgroundColor: "var(--color-hover-color)",
                      color: "white",
                    },
                  }),
                }}
              />
            </div>
            <InputComp
              label={"Phone Number"}
              placeholder={"Enter Phone Number"}
              isRequired="true"
              type={"tel"}
            />
          </div>
          <div className="email">
            <InputComp
              label={"Email"}
              placeholder={"Enter Email"}
              type={"email"}
            />
          </div>
          <div className="address-line-1">
            <InputComp
              label={"Address Line 1"}
              placeholder={"Enter Address Line 1"}
              type={"text"}
            />
          </div>
          <div className="address-line-2">
            <InputComp
              label={"Address Line 2"}
              placeholder={"Enter Address Line 2"}
              type={"text"}
            />
          </div>
          <div className="country-state flex gap-4">
            <div className="code w-full flex flex-col">
              <label className="text-gray-600 text-sm font-semibold mb-[5px]">
                Country
              </label>
              <Select
                isClearable="true"
                placeholder="Select Country"
                options={[{ label: "Select Country", value: "Select Country" }]}
                components={{
                  IndicatorSeparator: () => null,
                }}
                styles={{
                  control: (provided) => ({
                    ...provided,
                    borderRadius: "6px",
                    border: "none",
                    outline: "1px",
                    outlineStyle: "solid",
                    outlineColor: "#d1d5dc",
                    boxShadow: "none",
                    "&:focus, &:focus-within": {
                      outlineWidth: "2px",
                      outlineColor: "var(--color-primary)",
                    },
                    padding: "2px",
                    backgroundColor: "#f9fafb",
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isSelected
                      ? "var(--color-secondary)"
                      : "white",
                    color: state.isSelected ? "white" : "black",
                    "&:hover": {
                      backgroundColor: "var(--color-hover-color)",
                      color: "white",
                    },
                  }),
                }}
              />
            </div>
            <InputComp
              label={"State"}
              placeholder={"Enter State"}
              type={"text"}
            />
          </div>
          <div className="city-pincode flex gap-4">
            <InputComp
              label={"City"}
              placeholder={"Enter City"}
              type={"text"}
            />
            <InputComp
              label={"Pincode"}
              placeholder={"Enter Pincode"}
              type={"text"}
            />
          </div>
          <button className="submit w-full p-4 bg-linear-180 from-primary to-secondary text-white font-bold text-center rounded-lg cursor-pointer">
            Save Customer
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCustomersForm;
