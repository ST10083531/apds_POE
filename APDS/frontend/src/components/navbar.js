import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../logo.svg";

const Navbar = () => {
    const [isEmployeeLoggedIn, setIsEmployeeLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if there is a JWT token in localStorage to determine if an employee is logged in
        const token = localStorage.getItem("jwt");
        setIsEmployeeLoggedIn(!!token);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("jwt");  // Clear the JWT token on logout
        setIsEmployeeLoggedIn(false);    // Update state to reflect logout
        navigate("/employee-login");     // Redirect to Employee Login page
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <NavLink className="navbar-brand" to="/">
                <img src={logo} alt="Logo" style={{ width: '40px', marginRight: '10px' }} />
                Bank Portal
            </NavLink>
            <button
                className="navbar-toggler"
                type="button"
                data-toggle="collapse"
                data-target="#navbarNav"
                aria-controls="navbarNav"
                aria-expanded="false"
                aria-label="Toggle navigation"
            >
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav ml-auto">
                    {/* Only show Employee Login if the employee is not logged in */}
                    {!isEmployeeLoggedIn && (
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/employee-login">Employee Login</NavLink>
                        </li>
                    )}
                    {/* Show International Payment Portal only when employee is logged in */}
                    {isEmployeeLoggedIn && (
                        <>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/portal">International Payment Portal</NavLink>
                            </li>
                            <li className="nav-item">
                                <button className="btn btn-link nav-link" onClick={handleLogout}>Logout</button>
                            </li>
                        </>
                    )}
                    <li className="nav-item">
                        <NavLink className="nav-link" to="/login">Login</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className="nav-link" to="/register">Register</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className="nav-link" to="/pay">Payment</NavLink>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;