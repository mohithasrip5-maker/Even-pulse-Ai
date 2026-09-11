import { useEffect, useState } from "react";
import axios from "axios";

function ParticipantDashboard({ participantId, onLogout }) {
  const [pass, setPass] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPass = async () => {
      try {
        const response = await axios.get(
          `https://event-pulse-ai-backend.onrender.com/api/participants/${participantId}/pass`
        );

        if (response.data.success) {
          setPass(response.data.digitalPass);
        }
      } catch (error) {
        console.log("Participant dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPass();
  }, [participantId]);

  if (loading) {
    return (
      <div className="participant-dashboard">
        <h2>Loading Participant Dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="participant-dashboard">

      <div className="participant-dashboard-header">
        <div>
          <span>EVENTPULSE AI</span>
          <h1>Participant Dashboard</h1>
          <p>Welcome, {pass?.participantName || "Participant"} 👋</p>
        </div>

        <button onClick={onLogout}>LOGOUT</button>
      </div>

      <div className="participant-dashboard-grid">

        <div className="participant-card">
          <span>👤</span>
          <h3>Participant ID</h3>
          <strong>{pass?.participantId || participantId}</strong>
        </div>

        <div className="participant-card">
          <span>🎫</span>
          <h3>Event</h3>
          <strong>{pass?.eventName || "MJC TECHFEST 2026"}</strong>
        </div>

        <div className="participant-card">
          <span>📅</span>
          <h3>Date</h3>
          <strong>{pass?.date || "Event Date"}</strong>
        </div>

        <div className="participant-card">
          <span>📍</span>
          <h3>Location</h3>
          <strong>{pass?.location || "Event Venue"}</strong>
        </div>

      </div>

      <div className="participant-main-card">

        <div>
          <span className="dashboard-label">YOUR EVENT PASS</span>

          <h2>{pass?.eventName || "EventPulse Event"}</h2>

          <p>
            Your digital event information is available here.
          </p>

          <div className="participant-details">
            <p><b>Name:</b> {pass?.participantName}</p>
            <p><b>Email:</b> {pass?.email}</p>
            <p><b>Event ID:</b> {pass?.eventId}</p>
            <p><b>Time:</b> {pass?.startTime} - {pass?.endTime}</p>
            <p><b>Location:</b> {pass?.location}</p>
          </div>
        </div>

        <div className="participant-status">
          <div className="status-icon">✓</div>
          <h3>REGISTERED</h3>
          <p>Your participation is confirmed.</p>
        </div>

      </div>

      <div className="participant-footer">
        Powered by <strong>EventPulse AI</strong>
      </div>

    </div>
  );
}

export default ParticipantDashboard;