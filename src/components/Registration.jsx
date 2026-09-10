import { useState, useEffect } from "react";
import axios from "axios";

function Registration({
  onRegistered,
  selectedEvent: preselectedEvent,
  onLogin
}) {
  const [events, setEvents] = useState([]);
 const [selectedEvent, setSelectedEvent] = useState(
  preselectedEvent?.eventId || ""
);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [phone, setPhone] = useState("");

  const [message, setMessage] = useState("");

  // Load available events
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/events"
        );

        if (response.data.success) {
          setEvents(response.data.events);
        }
      } catch (error) {
        console.log("Event loading error:", error);
      }
    };

    loadEvents();
  }, []);

  // When participant selects an event
  const handleEventChange = (eventId) => {
    setSelectedEvent(eventId);
    setMessage("");
  };

  const handleRegister = async () => {
    if (!selectedEvent || !name || !email || !department || !phone) {
      setMessage("Please fill all the details");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/participants",
        {
          participantId: "AUTO",
          name,
          email,
          phone,
          eventId: selectedEvent,
        }
      );

      const newParticipantId =
        response.data?.participant?.participantId;

      setMessage(
        `Registration successful! 🎉 Participant ID: ${
          newParticipantId || "Not received"
        }`
      );

      if (onRegistered) {
        onRegistered(response.data.participant);
      }

      setName("");
      setEmail("");
      setDepartment("");
      setPhone("");
      setSelectedEvent("");

    } catch (error) {
      console.log(error);

      setMessage(
        error.response?.data?.message ||
          "Registration failed"
      );
    }
  };

  const selectedEventData = events.find(
    (event) => event.eventId === selectedEvent
  );

  return (
    <div className="container">
      <div className="card">

        <h1>EVENTPULSE AI</h1>

        <h2>📝 Event Registration</h2>

        {/* EVENT SELECTION */}
        <label>Select Event</label>

        <select
          className="input"
          value={selectedEvent}
          onChange={(e) =>
            handleEventChange(e.target.value)
          }
        >
          <option value="">
            -- Choose an Event --
          </option>

          {events.map((event) => (
            <option
              key={event.eventId}
              value={event.eventId}
            >
              {event.name}
            </option>
          ))}
        </select>

        {/* AUTOMATIC EVENT DETAILS */}
        {selectedEventData && (
          <div
            style={{
              marginTop: "15px",
              marginBottom: "20px",
              padding: "15px",
              borderRadius: "10px",
              background: "#f5f3ff",
              color: "#222",
            }}
          >
            <h3>
              🎯 {selectedEventData.name}
            </h3>

            <p>
              📅 <strong>Date:</strong>{" "}
              {selectedEventData.date}
            </p>

            <p>
              🕐 <strong>Time:</strong>{" "}
              {selectedEventData.startTime} -{" "}
              {selectedEventData.endTime}
            </p>

            <p>
              📍 <strong>Venue:</strong>{" "}
              {selectedEventData.location}
            </p>

            <p>
              👥 <strong>Capacity:</strong>{" "}
              {selectedEventData.capacity}
            </p>
          </div>
        )}

        {/* PARTICIPANT DETAILS */}

        <input
          className="input"
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="input"
          type="text"
          placeholder="Department"
          value={department}
          onChange={(e) =>
            setDepartment(e.target.value)
          }
        />

        <input
          className="input"
          type="text"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value)
          }
        />

        <button
          className="register-btn"
          onClick={handleRegister}
        >
          REGISTER FOR EVENT
        </button>

        {message && (
  <div style={{ marginTop: "15px" }}>
    <p>{message}</p>

    {message.startsWith("Registration successful") && (
      <button
        className="register-btn"
        onClick={onLogin}
      >
        👤 PARTICIPANT LOGIN
      </button>
    )}
  </div>
)}
      </div>
    </div>
  );
}

export default Registration;