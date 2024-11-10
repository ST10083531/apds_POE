import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EmployeeLogin() {
    const [form, setForm] = useState({ name: "", password: "" });
    const navigate = useNavigate();

    function updateForm(value) {
        return setForm((prev) => ({ ...prev, ...value }));
    }

    async function onSubmit(e) {
        e.preventDefault();
        const employeeCredentials = { ...form };

        try {
            const response = await fetch("https://localhost:3001/employee/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(employeeCredentials),
            });

            if (!response.ok) {
                const message = `An error occurred: ${response.statusText}`;
                window.alert(message);
                return;
            }

            const data = await response.json();
            localStorage.setItem("jwt", data.token);  // Store JWT token for employee
            setForm({ name: "", password: "" });
            navigate("/portal");  // Redirect to the portal after login
        } catch (error) {
            window.alert("Failed to log in: " + error.message);
        }
    }

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h3 className="text-center">Employee Login</h3>
                            <form onSubmit={onSubmit}>
                                <div className="form-group">
                                    <label htmlFor="name">Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="name"
                                        value={form.name}
                                        onChange={(e) => updateForm({ name: e.target.value })}
                                        placeholder="Name"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="password">Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="password"
                                        value={form.password}
                                        onChange={(e) => updateForm({ password: e.target.value })}
                                        placeholder="Password"
                                        required
                                    />
                                </div>
                                <div className="text-center">
                                    <input type="submit" value="Login" className="btn btn-primary btn-block" />
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}