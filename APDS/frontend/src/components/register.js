import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    id_number: "",
    account_number: "",
    password: ""
  });
  const navigate = useNavigate();

  function updateForm(value) {
    return setForm((prev) => ({ ...prev, ...value }));
  }

  async function onSubmit(e) {
    e.preventDefault();

    const newUser = { ...form };

    await fetch("https://localhost:3001/user/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    })
      .then(() => {
        setForm({ name: "", id_number: "", account_number: "", password: "" });
        navigate("/login");
      })
      .catch((error) => window.alert("Failed to register: " + error.message));
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h3 className="text-center">Register</h3>
              <form onSubmit={onSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    value={form.name}
                    onChange={(e) => updateForm({ name: e.target.value })}
                    placeholder="Full Name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="id_number">ID Number</label>
                  <input
                    type="text"
                    className="form-control"
                    id="id_number"
                    value={form.id_number}
                    onChange={(e) => updateForm({ id_number: e.target.value })}
                    placeholder="ID Number"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="account_number">Account Number</label>
                  <input
                    type="text"
                    className="form-control"
                    id="account_number"
                    value={form.account_number}
                    onChange={(e) => updateForm({ account_number: e.target.value })}
                    placeholder="Account Number"
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
                  <input type="submit" value="Register" className="btn btn-primary btn-block" />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}