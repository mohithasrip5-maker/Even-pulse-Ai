import { useState } from "react";
import axios from "axios";

function DigitalPass() {
  const [participantId, setParticipantId] = useState("");
  const [pass, setPass] = useState(null);
  const [message, setMessage] = useState("");

  const getPass = async () => {
    if (!participantId) {
      setMessage("Enter Participant ID");
      return;
    }

    try {
      const response = await axios.get(
        `https://event-pulse-ai-backend.onrender.com/api/participants/${participantId}/pass`
      );

      setPass(response.data);
      setMessage("");
    } catch (error) {
      setPass(null);
      setMessage(
        error.response?.data?.message || "Digital pass not found"
      );
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>EVENTPULSE AI</h1>
        <h2>🎫 Digital Event Pass</h2>

        <input
          className="input"
          type="text"
          placeholder="Enter Participant ID"
          value={participantId}
          onChange={(e) => setParticipantId(e.target.value)}
        />

        <button className="register-btn" onClick={getPass}>
          GET DIGITAL PASS
        </button>

        {message && <p>{message}</p>}

        {pass && (
          <div style={{ marginTop: "20px" }}>
            <h3>{pass.digitalPass?.eventName}</h3>
            <p>
              <strong>Participant:</strong>{" "}
              {pass.digitalPass?.participantName}
            </p>
            <p>
              <strong>Participant ID:</strong>{" "}
              {pass.digitalPass?.participantId}
            </p>

            {pass.qrCode && (
              <img
                src={pass.qrCode}
                alt="Event QR Code"
                style={{
                  width: "200px",
                  marginTop: "15px"
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DigitalPass;