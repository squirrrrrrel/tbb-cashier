import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import qkartsLogo from "../../assets/images/qkarts-small-logo.png";

const NavButtons = ({ name, icon, target }) => {
  const location = useLocation();
  const isActive = location.pathname === target;

  return (
    <Link to={target}>
      <div
        className={`px-1 py-3 flex flex-col justify-center items-center
          rounded-3xl cursor-pointer transition
          group ${isActive
            ? "bg-gradient-to-b from-primary to-secondary text-white"
            : "text-gray-700 hover:bg-gradient-to-b hover:from-primary hover:to-secondary hover:text-white"
          }`}
      >
        {icon}
        <p
          className={`text-sm group-hover:text-white ${isActive ? "text-white" : ""
            }`}
        >
          {name}
        </p>
      </div>
    </Link>
  );
};

const SideHeader = ({ setIsLogoutClicked }) => {
  const navLinks = [
    { name: "Home", icon: <HomeIcon />, target: "/pos/dashboard" },
    { name: "Customers", icon: <CustomersIcon />, target: "/pos/customers" },
    { name: "Tables", icon: <TablesIcon />, target: "/pos/tables" },
    { name: "Invoices", icon: <InvoicesIcon />, target: "/pos/invoices" },
    { name: "Promotions", icon: <PromotionsIcon />, target: "/pos/promotions" },
    { name: "LowStock", icon: <LowStockIcon />, target: "/pos/lowstock" },
  ];

  return (
    <div className="header w-[109px] p-4 h-screen flex flex-col items-center justify-between gap-4 border-r border-gray-200">
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="logo mb-2">
          <img src={qkartsLogo} className="w-16" alt="warnoc-logo" />
        </div>
        <div className="navlinks flex flex-col gap-2">
          {navLinks.map((link, index) => (
            <NavButtons
              key={index}
              name={link.name}
              icon={link.icon}
              target={link.target}
            />
          ))}
        </div>
      </div>
      <div className="logout">
        <div
          onClick={() => setIsLogoutClicked(true)}
          className="link px-5 py-3 flex flex-col justify-center items-center bg-transparent hover:bg-linear-to-b hover:from-primary hover:to-secondary rounded-3xl cursor-pointer text-gray-700 group"
        >
          <LogoutIcon />
          <p className="text-sm group-hover:text-white">Logout</p>
        </div>
      </div>
    </div>
  );
};

// SVG Icons declaired here
const HomeIcon = () => (
  <svg
    className="w-6"
    fill="currentColor"
    viewBox="64 64 896 896"
    focusable="false"
    data-icon="home"
    aria-hidden="true"
  >
    <path d="M946.5 505L560.1 118.8l-25.9-25.9a31.5 31.5 0 00-44.4 0L77.5 505a63.9 63.9 0 00-18.8 46c.4 35.2 29.7 63.3 64.9 63.3h42.5V940h691.8V614.3h43.4c17.1 0 33.2-6.7 45.3-18.8a63.6 63.6 0 0018.7-45.3c0-17-6.7-33.1-18.8-45.2zM568 868H456V664h112v204zm217.9-325.7V868H632V640c0-22.1-17.9-40-40-40H432c-22.1 0-40 17.9-40 40v228H238.1V542.3h-96l370-369.7 23.1 23.1L882 542.3h-96.1z"></path>
  </svg>
);
const CustomersIcon = () => (
  <svg
    className="w-6"
    fill="currentColor"
    viewBox="64 64 896 896"
    focusable="false"
    data-icon="team"
    aria-hidden="true"
  >
    <path d="M824.2 699.9a301.55 301.55 0 00-86.4-60.4C783.1 602.8 812 546.8 812 484c0-110.8-92.4-201.7-203.2-200-109.1 1.7-197 90.6-197 200 0 62.8 29 118.8 74.2 155.5a300.95 300.95 0 00-86.4 60.4C345 754.6 314 826.8 312 903.8a8 8 0 008 8.2h56c4.3 0 7.9-3.4 8-7.7 1.9-58 25.4-112.3 66.7-153.5A226.62 226.62 0 01612 684c60.9 0 118.2 23.7 161.3 66.8C814.5 792 838 846.3 840 904.3c.1 4.3 3.7 7.7 8 7.7h56a8 8 0 008-8.2c-2-77-33-149.2-87.8-203.9zM612 612c-34.2 0-66.4-13.3-90.5-37.5a126.86 126.86 0 01-37.5-91.8c.3-32.8 13.4-64.5 36.3-88 24-24.6 56.1-38.3 90.4-38.7 33.9-.3 66.8 12.9 91 36.6 24.8 24.3 38.4 56.8 38.4 91.4 0 34.2-13.3 66.3-37.5 90.5A127.3 127.3 0 01612 612zM361.5 510.4c-.9-8.7-1.4-17.5-1.4-26.4 0-15.9 1.5-31.4 4.3-46.5.7-3.6-1.2-7.3-4.5-8.8-13.6-6.1-26.1-14.5-36.9-25.1a127.54 127.54 0 01-38.7-95.4c.9-32.1 13.8-62.6 36.3-85.6 24.7-25.3 57.9-39.1 93.2-38.7 31.9.3 62.7 12.6 86 34.4 7.9 7.4 14.7 15.6 20.4 24.4 2 3.1 5.9 4.4 9.3 3.2 17.6-6.1 36.2-10.4 55.3-12.4 5.6-.6 8.8-6.6 6.3-11.6-32.5-64.3-98.9-108.7-175.7-109.9-110.9-1.7-203.3 89.2-203.3 199.9 0 62.8 28.9 118.8 74.2 155.5-31.8 14.7-61.1 35-86.5 60.4-54.8 54.7-85.8 126.9-87.8 204a8 8 0 008 8.2h56.1c4.3 0 7.9-3.4 8-7.7 1.9-58 25.4-112.3 66.7-153.5 29.4-29.4 65.4-49.8 104.7-59.7 3.9-1 6.5-4.7 6-8.7z"></path>
  </svg>
);
const TablesIcon = () => (
  <svg
    className="w-6"
    fill="currentColor"
    version="1.1"
    id="Capa_1"
    xmlns="http://www.w3.org/2000/svg"
    x="0px"
    y="0px"
    viewBox="0 0 214.539 214.539"
  >
    <g>
      <g>
        <path d="M121.164,154.578h-6.625V89.14h38.937c4.014,0,7.269-3.254,7.269-7.269s-3.254-7.269-7.269-7.269h-92.41 c-4.014,0-7.269,3.254-7.269,7.269s3.254,7.269,7.269,7.269h38.936v65.438h-6.625c-4.014,0-7.269,3.254-7.269,7.27 c0,4.015,3.254,7.269,7.269,7.269h27.787c4.015,0,7.27-3.254,7.27-7.269C128.433,157.832,125.179,154.578,121.164,154.578z"></path>
        <path d="M73.783,120.777c0-4.014-3.254-7.269-7.269-7.269H54.833H34.219c-11.08,0-13.41-16.14-13.509-16.869l-6.239-45.122 c-0.55-3.977-4.217-6.748-8.196-6.205c-3.976,0.55-6.754,4.219-6.205,8.196l6.229,45.053c0.831,6.47,4.167,16.593,11.367,23.133 l-7.485,38.956c-0.758,3.942,1.824,7.752,5.766,8.509c3.946,0.761,7.752-1.825,8.509-5.766l6.792-35.349h17.579l6.792,35.349 c0.668,3.479,3.714,5.897,7.13,5.897c0.455,0,0.916-0.043,1.379-0.132c3.942-0.757,6.524-4.566,5.766-8.509l-6.265-32.605h2.883 C70.527,128.046,73.783,124.791,73.783,120.777z"></path>
        <path d="M208.267,45.313c-3.975-0.543-7.646,2.229-8.196,6.205l-6.244,45.165c-0.094,0.687-2.424,16.827-13.504,16.827h-20.614 h-11.681c-4.014,0-7.27,3.254-7.27,7.269s3.255,7.269,7.27,7.269h2.883l-6.265,32.605c-0.758,3.942,1.824,7.752,5.766,8.509 c3.946,0.761,7.752-1.825,8.509-5.766l6.792-35.349h17.579l6.792,35.349c0.668,3.479,3.714,5.897,7.13,5.897 c0.455,0,0.916-0.043,1.38-0.132c3.941-0.757,6.523-4.566,5.766-8.509l-7.485-38.953c7.198-6.534,10.532-16.64,11.357-23.065 l6.238-45.123C215.021,49.533,212.242,45.863,208.267,45.313z"></path>
      </g>
    </g>
  </svg>
);
const InvoicesIcon = () => (
  <svg
    className="w-6"
    stroke="currentColor"
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 9H18M6 13H18M6 17H12"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    ></path>
    <path
      d="M4 4H20V20H4V4Z"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    ></path>
  </svg>
);
const PromotionsIcon = () => (
  <svg
    className="w-6"
    stroke="currentColor"
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    ></path>
    <path
      d="M16 5L19 3"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    ></path>
    <path
      d="M8 5L5 3"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    ></path>
  </svg>
);
const LowStockIcon = () => (
  <svg
    className="w-6"
    fill="currentColor"
    viewBox="64 64 896 896"
    focusable="false"
    data-icon="shopping"
    aria-hidden="true"
  >
    <path d="M832 312H696v-16c0-101.6-82.4-184-184-184s-184 82.4-184 184v16H192c-17.7 0-32 14.3-32 32v536c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V344c0-17.7-14.3-32-32-32zm-432-16c0-61.9 50.1-112 112-112s112 50.1 112 112v16H400v-16zm392 544H232V384h96v88c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-88h224v88c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-88h96v456z"></path>
  </svg>
);
const LogoutIcon = () => (
  <svg
    className="w-6 fill-gray-700 group-hover:fill-white"
    viewBox="64 64 896 896"
    focusable="false"
    data-icon="logout"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M868 732h-70.3c-4.8 0-9.3 2.1-12.3 5.8-7 8.5-14.5 16.7-22.4 24.5a353.84 353.84 0 01-112.7 75.9A352.8 352.8 0 01512.4 866c-47.9 0-94.3-9.4-137.9-27.8a353.84 353.84 0 01-112.7-75.9 353.28 353.28 0 01-76-112.5C167.3 606.2 158 559.9 158 512s9.4-94.2 27.8-137.8c17.8-42.1 43.4-80 76-112.5s70.5-58.1 112.7-75.9c43.6-18.4 90-27.8 137.9-27.8 47.9 0 94.3 9.3 137.9 27.8 42.2 17.8 80.1 43.4 112.7 75.9 7.9 7.9 15.3 16.1 22.4 24.5 3 3.7 7.6 5.8 12.3 5.8H868c6.3 0 10.2-7 6.7-12.3C798 160.5 663.8 81.6 511.3 82 271.7 82.6 79.6 277.1 82 516.4 84.4 751.9 276.2 942 512.4 942c152.1 0 285.7-78.8 362.3-197.7 3.4-5.3-.4-12.3-6.7-12.3zm88.9-226.3L815 393.7c-5.3-4.2-13-.4-13 6.3v76H488c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h314v76c0 6.7 7.8 10.5 13 6.3l141.9-112a8 8 0 000-12.6z"></path>
  </svg>
);

export default SideHeader;
