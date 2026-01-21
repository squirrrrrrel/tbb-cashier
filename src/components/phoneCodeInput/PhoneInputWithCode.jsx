import React from "react";
import Select from "react-select";

const PhoneInputWithCode = ({
    formData,
    setFormData,
    onPhoneChange,
}) => {

    const countryCodeOptions = [
        { label: "India", value: "+91" },
        { label: "United States", value: "+1" },
        { label: "United Kingdom", value: "+44" },
        { label: "Canada", value: "+1" },
        { label: "Australia", value: "+61" },
        { label: "Philippines", value: "+63" },
        { label: "United Arab Emirates", value: "+971" },
        { label: "Saudi Arabia", value: "+966" },
        { label: "Germany", value: "+49" },
        { label: "France", value: "+33" },
        { label: "Italy", value: "+39" },
        { label: "Spain", value: "+34" },
        { label: "Japan", value: "+81" },
        { label: "China", value: "+86" },
        { label: "Singapore", value: "+65" },
        { label: "Malaysia", value: "+60" },
        { label: "Thailand", value: "+66" },
        { label: "Indonesia", value: "+62" },
        { label: "South Africa", value: "+27" },
        { label: "Brazil", value: "+55" },
    ];


    return (
        <div className="flex gap-4">
            {/* Country Code */}
            <div className="code w-1/4 flex flex-col">
                <label className="text-gray-600 text-sm font-semibold mb-[5px]">
                    Code <span className="text-red-600">*</span>
                </label>

                <Select
                    placeholder="Code"
                    options={countryCodeOptions}
                    value={formData.phoneCode}
                    onChange={(option) =>
                        setFormData((prev) => ({ ...prev, phoneCode: option }))
                    }
                    isClearable={false}
                    components={{
                        IndicatorSeparator: () => null,
                    }}
                    formatOptionLabel={(option, { context }) =>
                        context === "menu"
                            ? `${option.label} ${option.value}` // dropdown
                            : option.value                     // selected
                    }
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
                            "&:focus, &:focus-within": {
                                outlineWidth: "2px",
                                outlineColor: "var(--color-primary)",
                            },
                            padding: "0px",
                            backgroundColor: "#f8f8f8",
                            boxShadow: "0 0 3px #00000026",
                        }),
                        singleValue: (provided) => ({
                            ...provided,
                            fontWeight: "500",
                            color: "#555555",
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
                            color: state.isFocused || state.isSelected ? "white" : "black", "&:hover": {
                                backgroundColor: "var(--color-hover-color)",
                                color: "white",
                            },
                        }),
                    }}
                />
            </div>

            {/* Phone Number */}
            <div className="w-3/4">
                <div className="first-name flex flex-col w-full">
                    <label className="text-[#555555] text-sm font-semibold">
                        Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={onPhoneChange}
                        placeholder="Enter Phone Number"
                        className="p-2 border-0 border-gray-300 rounded-md bg-[#f8f8f8] outline-none placeholder:text-gray-500 mt-2 shadow-[0_0_3px_#00000026] focus:outline-primary text-sm "
                    />
                </div>
            </div>
        </div>
    );
};

export default PhoneInputWithCode;
