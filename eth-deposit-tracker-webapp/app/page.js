"use client";
import { useState, useEffect } from 'react';

export default function Home() {
  const [latestDeposits, setLatestDeposits] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        const response = await fetch('/api/deposits');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setLatestDeposits(data.latestDeposits);
        setLastUpdated(new Date().toLocaleTimeString());
      } catch (error) {
        console.error('Error fetching deposits:', error);
      }
    };

    // Fetch data initially
    fetchDeposits();

    // Set up interval to re-fetch data every 60 seconds
    const intervalId = setInterval(fetchDeposits, 60000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="bg-darkGrey text-white min-h-screen p-6">
      <header className="text-center">
        <h1 className="text-4xl font-bold mb-4">Ethereum Deposit Tracker</h1>
      </header>
      <main className="max-w-4xl mx-auto">
        {/* Latest Deposits */}
        <section>
          <h3 className="text-2xl font-bold mb-4">Latest Deposits</h3>
          <p className="mb-4 text-lg">Last updated at: {lastUpdated}</p>
          {latestDeposits.length > 0 ? (
            <ul className="space-y-2">
              {latestDeposits.map((deposit, index) => (
                <li key={index} className="bg-lightGrey text-black p-4 rounded-lg">
                  <p><b>Block Number:</b> {deposit.blockNumber}</p>
                  <p><b>Timestamp:</b> {deposit.blockTimestamp}</p>
                  <p><b>Fee:</b> {deposit.fee}</p>
                  <p><b>Transaction Hash:</b> {deposit.hash}</p>
                  <p><b>PubKey:</b> {deposit.pubKey}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No deposits available.</p>
          )}
        </section>
      </main>
    </div>
  );
}
