import React from "react";
import Select from "react-select";
import { commonSelectStyles } from "../../common/select/selectStyle";
import { useState, useEffect } from "react";
import { useNotification } from "../../../hooks/useNotification.jsx";
import PhoneInputWithCode from "../../phoneCodeInput/PhoneInputWithCode.jsx";
import LoadingBar from "../../common/LoadingBar/LoadingBar.jsx";

const InputComp = ({ label, placeholder, isRequired = false, type, name, value, onChange, }) => {
  return (
    <div className="first-name flex flex-col w-full">
      <label className="text-[#555555] text-sm font-semibold">
        {label} <span className="text-red-500"> {isRequired ? " *" : ""}</span>
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="p-2 border-0 border-gray-300 rounded-md bg-[#f8f8f8] outline-none placeholder:text-gray-500 mt-2 shadow-[0_0_3px_#00000026] focus:outline-primary text-sm "
      />
    </div>
  );
};
// border-0 rounded-[6px] 



const AddCustomersForm = ({
  focusedCustomer,
  clearSelection,
  onAddCustomer,
  onEditCustomer,
  countries,
}) => {

  const { notifySuccess, notifyError } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const defaultCodeOption = {
    label: "Select Code",
    value: "",
  };

  const codeOptions = countries.map((c) => ({
    label: c.name,
    value: c.code,                 // sent to backend
  }));

  const defaultCountryOption = {
    label: "Select Country",
    value: "",
  };

  const countryOptions = countries.map((c) => ({
    label: c.name,
    value: c.name,
  }));

  const initialFormData = {
    firstName: "",
    lastName: "",
    phoneCode: null,
    phone: "",
    email: "",
    address1: "",
    address2: "",
    country: defaultCountryOption,
    state: "",
    city: "",
    pincode: "",
  }

  const [formData, setFormData] = useState(initialFormData);

  // Auto fill on Edit
  useEffect(() => {
    if (focusedCustomer) {
      setFormData({
        ...initialFormData,
        ...focusedCustomer,
        phoneCode:
          codeOptions.find(
            (opt) => opt.value === focusedCustomer.phoneCode
          ) || defaultCodeOption,
        country:
          countryOptions.find(
            (opt) => opt.value === focusedCustomer.country
          ) || defaultCountryOption,
      });
    } else {
      setFormData(initialFormData);
    }
  }, [focusedCustomer]);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const validateForm = (data) => {
    if (!data.firstName) {
      notifyError("Please enter firstname!", "Require field missing");
      return false;
    }
    if (!data.lastName) {
      notifyError("Please enter lastName!", "Require field missing");
      return false;
    }
    if (!data.phoneCode) {
      notifyError("Please enter phoneCode!", "Require field missing");
      return false;
    }

    if (!data.phone) {
      notifyError("Please enter phone number!", "Require field missing");
      return false;
    }

    return true;
  };

  const handleCancel = (e) => {
    e.preventDefault();
    setFormData(initialFormData);   // clear form
    clearSelection(null);       // exit edit mode
  };

  const handleSubmit = async (e) => {

    e.preventDefault();
    const payload = {
      ...formData,
      phoneCode: formData.phoneCode ? formData.phoneCode.value : "",
      country: formData.country.value,
    };
    setIsLoading(true);


    if (!validateForm(formData)) return;
    try {

      if (focusedCustomer) {
        // UPDATE
        await onEditCustomer(payload);
        notifySuccess("Customer edited successfully");
      } else {
        // ADD
        await onAddCustomer(payload);
        notifySuccess("Customer added successfully");
      }
      setFormData(initialFormData);
      clearSelection();

    } catch (error) {
      notifyError("An error occurred. Please try again.");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="bg-white p-3 border-l border-gray-200 ">
      <LoadingBar isLoading={isLoading} />
      <h2 className="text-2xl font-semibold text-[#555555]">{focusedCustomer ? "Edit Customer" : "Add New Customer"}</h2>
      <div className="form mt-4" onSubmit={handleSubmit} >
        <form className="flex flex-col gap-3 ">
          <div className="name flex gap-4">
            <InputComp
              label={"First Name"}
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder={"Enter First Name"}
              isRequired={true}
              type={"text"}
            />
            <InputComp
              label={"Last Name"}
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder={"Enter First Name"}
              isRequired={true}
              type={"text"}
            />
          </div>
          <PhoneInputWithCode
            formData={formData}
            setFormData={setFormData}
            onPhoneChange={handleChange}
          />
          <div className="email">
            <InputComp
              label={"Email"}
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={"Enter Email"}
              type={"email"}
            />
          </div>
          <div className="address-line-1">
            <InputComp
              label={"Address Line 1"}
              name="address1"
              value={formData.address1}
              onChange={handleChange}
              placeholder={"Enter Address Line 1"}
              type={"text"}
            />
          </div>
          <div className="address-line-2">
            <InputComp
              label={"Address Line 2"}
              name="address2"
              value={formData.address2}
              onChange={handleChange}
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
                // isClearable="true"
                placeholder="Select Country"
                options={[defaultCountryOption, ...countryOptions]}
                value={formData.country}
                onChange={(option) =>
                  setFormData((prev) => ({ ...prev, country: option }))
                }
                isClearable={false}
                components={{
                  IndicatorSeparator: () => null,
                }}
                styles={{
                  control: (provided) => ({
                    ...provided,
                    fontSize: "14px",
                    height: "36px",
                    marginTop: "2px",
                    color: "#555555",
                    borderRadius: "6px",
                    border: "none",
                    outline: "1px",
                    outlineColor: "#d1d5dc",
                    "&:focus, &:focus-within": {
                      outlineWidth: "2px",
                      outlineColor: "var(--color-primary)",
                    },
                    padding: "2px",
                    backgroundColor: "#f8f8f8",
                    boxShadow: "0 0 3px #00000026",
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: "#gray",   // selected text color
                    fontWeight: "500",
                  }),
                  menu: (provided) => ({
                    ...provided,
                    width: "15rem",
                    fontWeight: "600",        // ⬅ dropdown width
                    color: "#555555",
                    fontSize: "0.8rem",
                    padding: "0",

                  }),
                  option: (provided, state) => ({
                    ...provided,

                    backgroundColor: state.isFocused
                      ? "var(--color-hover-color)"
                      : state.isSelected
                        ? "var(--color-secondary)"
                        : "white",
                    color: state.isFocused || state.isSelected ? "white" : "black",
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
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder={"Enter State"}
              type={"text"}
            />
          </div>
          <div className="city-pincode flex gap-4">
            <InputComp
              label={"City"}
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder={"Enter City"}
              type={"text"}
            />
            <InputComp
              label={"Pincode"}
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              placeholder={"Enter Pincode"}
              type={"text"}
            />
          </div>
          <button className="submit w-full p-3 bg-linear-180 from-primary to-secondary text-white font-bold text-center rounded-lg cursor-pointer mt-2">
            {isLoading ? "Saving..." : focusedCustomer ? "Update Customer" : "Save Customer"}
          </button>
          {focusedCustomer ? (
            <button type="button" onClick={handleCancel} className="cancel mb-5 w-full p-3 bg-white border-2 border-gray-200 text-[#555555] font-bold text-center rounded-lg cursor-pointer">Cancel</button>
          ) : (
            <button type="button" onClick={handleCancel} className="cancel mb-5 w-full p-3 bg-white border-2 border-gray-200 text-[#555555] font-bold text-center rounded-lg cursor-pointer">Reset</button>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddCustomersForm;

