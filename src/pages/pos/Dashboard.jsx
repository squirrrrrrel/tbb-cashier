import React from "react";
import Cart from "../../components/pos/dashboard/Cart";
import Header from "../../components/pos/dashboard/Header";

const Dashboard = () => {
  return (
    <div className="flex">
      <div className="home w-3/5 bg-gray-50">
        <div className="header">
          <Header />
        </div>
      </div>
      <div className="w-2/5 h-screen">
        <Cart />
      </div>
    </div>
  );
};

export default Dashboard;
