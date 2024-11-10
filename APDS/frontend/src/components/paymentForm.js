import React, { useState } from "react";

export default function PaymentForm() {
  const [form, setForm] = useState({
    amount: "",
    currency: "ZAR",
    provider: "SWIFT",
    account_info: "",
    swift_code: ""
  });

  function updateForm(value) {
    return setForm((prev) => ({ ...prev, ...value }));
  }

  async function onSubmit(e) {
    e.preventDefault();

    // Simple client-side validation before submission
    if (!/^\d+(\.\d{1,2})?$/.test(form.amount)) {
        return window.alert("Invalid amount format. Please enter a valid number.");
    }

    if (!/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(form.swift_code)) {
        return window.alert("Invalid SWIFT code format.");
    }

    const token = localStorage.getItem("jwt");  // Retrieve the JWT token

    const paymentDetails = { ...form };  // Assuming `form` contains the payment details

    try {
        const response = await fetch("https://localhost:3001/transaction/pay", {  
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`  // Ensure the JWT token is being sent
            },
            body: JSON.stringify(paymentDetails),
        });

        if (!response.ok) {
            const message = `An error has occurred: ${response.statusText}`;
            window.alert(message);
            return;
        }

        const data = await response.json();
        setForm({ amount: "", currency: "ZAR", provider: "SWIFT", account_info: "", swift_code: "" });
        window.alert("Payment successful!");  // Notify the user of successful payment
    } catch (error) {
        window.alert("Payment failed: " + error.message);
    }
}

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h3 className="text-center">Make a Payment</h3>
              <form onSubmit={onSubmit}>
                <div className="form-group">
                  <label htmlFor="amount">Amount</label>
                  <input
                    type="number"
                    className="form-control"
                    id="amount"
                    value={form.amount}
                    onChange={(e) => updateForm({ amount: e.target.value })}
                    placeholder="Amount"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="account_info">Account Info</label>
                  <input
                    type="text"
                    className="form-control"
                    id="account_info"
                    value={form.account_info}
                    onChange={(e) => updateForm({ account_info: e.target.value })}
                    placeholder="Account Info"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="swift_code">SWIFT Code</label>
                  <input
                    type="text"
                    className="form-control"
                    id="swift_code"
                    value={form.swift_code}
                    onChange={(e) => updateForm({ swift_code: e.target.value })}
                    placeholder="SWIFT Code"
                    required
                  />
                </div>
                <div className="text-center">
                  <input type="submit" value="Pay Now" className="btn btn-success btn-block" />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}