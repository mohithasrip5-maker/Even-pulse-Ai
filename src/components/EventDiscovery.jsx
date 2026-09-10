import { useEffect, useState } from "react";
import axios from "axios";

function EventDiscovery({ onSelectEvent }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await axios.get(
          "https://event-pulse-ai-backend.onrender.com/api/events"
        );

        if (response.data.success) {
          setEvents(response.data.events);
        }
      } catch (error) {
        console.log("Event discovery error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <h2>🔎 Finding Events...</h2>
          <p>Loading available events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">

        <h1>EVENTPULSE AI</h1>

        <h2>🎯 Discover Events</h2>

        <p>
          Find upcoming events and register instantly.
        </p>

        {events.length === 0 ? (
          <div style={{ marginTop: "20px" }}>
            <h3>📭 No Events Available</h3>
            <p>
              New events will appear here when organizers
              publish them.
            </p>
          </div>
        ) : (
          <div style={{ marginTop: "20px" }}>

            {events.map((event) => (
              <div
                key={event.eventId}
                style={{
                  padding: "20px",
                  marginBottom: "15px",
                  borderRadius: "14px",
                  border: "1px solid #ddd",
                background: "rgba(17, 21, 42, 0.9)",
                color: "#ffffff",
                }}
              >

                <h3>🚀 {event.name}</h3>

                <p>
                  📅 <strong>Date:</strong> {event.date}
                </p>

                <p>
                  🕐 <strong>Time:</strong>{" "}
                  {event.startTime} - {event.endTime}
                </p>

                <p>
                  📍 <strong>Venue:</strong>{" "}
                  {event.location}
                </p>

                <p>
                  👥 <strong>Capacity:</strong>{" "}
                  {event.capacity}
                </p>

                <button
                  className="register-btn"
                  onClick={() => onSelectEvent(event)}
                >
                  VIEW & REGISTER
                </button>

              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
}

export default EventDiscovery;