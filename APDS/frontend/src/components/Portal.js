import React, { useEffect, useState } from "react";

export default function Portal() {
    const [transactions, setTransactions] = useState([]);

    // Fetch transactions when component mounts
    useEffect(() => {
        async function fetchTransactions() {
            const token = localStorage.getItem("jwt");
            try {
                const response = await fetch("https://localhost:3001/transaction/transactions", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setTransactions(data);  // Set fetched transactions in state
            } catch (error) {
                console.error("Failed to fetch transactions:", error);
            }
        }
        fetchTransactions();
    }, []);

    // Function to handle transaction updates (Accept or Deny)
    async function updateTransactionStatus(id, newStatus) {
        console.log(`Updating transaction ${id} to ${newStatus}`); // Debugging line
        const token = localStorage.getItem("jwt");
    
        try {
            const response = await fetch(`https://localhost:3001/transaction/verify/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            // Remove the transaction from the list after it has been updated
            setTransactions(transactions.filter(transaction => transaction._id !== id));
        } catch (error) {
            console.error(`Failed to update transaction status to ${newStatus}:`, error);
        }
    }

    return (
        <div className="container mt-5">
            <h2>International Payment Portal</h2>
            {transactions.length === 0 ? (
                <p>No pending transactions available.</p>
            ) : (
                <table className="table table-bordered mt-3">
                    <thead>
                        <tr>
                            <th>Payee Account Info</th>
                            <th>SWIFT Code</th>
                            <th>Amount</th>
                            <th>Currency</th>
                            <th>Provider</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map(transaction => (
                            <tr key={transaction._id}>
                                <td>{transaction.account_info}</td>
                                <td>{transaction.swift_code}</td>
                                <td>{transaction.amount}</td>
                                <td>{transaction.currency}</td>
                                <td>{transaction.provider}</td>
                                <td>
                                    <button
                                        className="btn btn-success btn-sm mr-2"
                                        onClick={() => updateTransactionStatus(transaction._id, "accepted")}
                                    >
                                        Accept
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => updateTransactionStatus(transaction._id, "denied")}
                                    >
                                        Deny
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}