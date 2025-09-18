import React from "react";
import { Outlet } from "react-router-dom";
import TopBar from "./components/TopBar/TopBar";

const Layout = () => {
  return (
    <div className="app-layout">
      <TopBar />
      <div className="content">
        <Outlet /> {/* Protected pages will render here */}
      </div>
    </div>
  );
};

export default Layout;
