import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
function PublicHome({ onViewEvent }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const socket = io("http://localhost:5000");

  socket.on("event-announcement", (announcement) => {
    console.log("📢 LIVE ANNOUNCEMENT:", announcement);

    setEvents((prevEvents) => {
      const exists = prevEvents.some(
        (event) => event.eventId === announcement.eventId
      );

      if (exists) return prevEvents;

      return [
        {
          eventId: announcement.eventId,
          name: announcement.eventName,
          location: announcement.location,
          date: announcement.date,
          startTime: announcement.startTime,
          endTime: "",
          capacity: 0,
        },
        ...prevEvents,
      ];
    });
  });

  const loadEvents = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/events"
      );

      if (response.data.success) {
        setEvents(response.data.events);
      }
    } catch (error) {
      console.log("Public events error:", error);
    } finally {
      setLoading(false);
    }
  };

  loadEvents();

  return () => {
    socket.disconnect();
  };
}, []);

  return (
    <div className="public-home">

      <div className="public-header">
        {/* BREAKING EVENT TICKER */}

<div className="breaking-ticker">

  <div className="breaking-label">
    🔴 BREAKING EVENT
  </div>

  <div className="ticker-track">

    {events.length === 0 ? (
      <span>
        No events announced yet
      </span>
    ) : (
      events.map((event) => (
        <button
          key={event.eventId}
          className="ticker-event"
          onClick={() => onViewEvent(event)}
        >
          🚀 {event.name}
          <span>•</span>
          📍 {event.location}
          <span>•</span>
          🕐 {event.startTime}
          <span>→</span>
        </button>
      ))
    )}

  </div>

</div>
        <div>
          <h1>
            EventPulse <span>AI</span>
          </h1>

          <p>
            Real-Time Event Intelligence & Response Platform
          </p>
        </div>

        <div className="public-badge">
          ● LIVE PLATFORM
        </div>
      </div>

      <div className="public-hero">
        <div>
          <span className="hero-label">
            DISCOVER • REGISTER • EXPERIENCE
          </span>

          <h2>
            Discover What's
            <br />
            Happening Now.
          </h2>

          <p>
            Explore upcoming events, get instant announcements,
            and register for events in one place.
          </p>
        </div>
      </div>

      <section className="public-events">

        <div className="public-section-title">
          <div>
            <span>EVENTPULSE</span>
            <h2>Upcoming Events</h2>
          </div>

          <span>
            {events.length} Event
            {events.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div className="public-empty">
            🔎 Loading events...
          </div>
        ) : events.length === 0 ? (
          <div className="public-empty">
            📭 No events published yet.
          </div>
        ) : (
          <div className="public-event-grid">

            {events.map((event) => (
              <div
                className="public-event-card"
                key={event.eventId}
              >

                <div className="event-live-tag">
                  ● EVENT
                </div>

                <h3>{event.name}</h3>

                <div className="event-info">
                  <p>
                    📅 {event.date}
                  </p>

                  <p>
                    🕐 {event.startTime} - {event.endTime}
                  </p>

                  <p>
                    📍 {event.location}
                  </p>

                  <p>
                    👥 Capacity: {event.capacity}
                  </p>
                </div>

                <button
                  onClick={() => onViewEvent(event)}
                >
                  VIEW EVENT →
                </button>

              </div>
            ))}

          </div>
        )}

      </section>

      <div className="public-footer">
        Powered by <strong>EventPulse AI</strong>
      </div>

    </div>
  );
}

export default PublicHome;