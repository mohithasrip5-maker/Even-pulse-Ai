import { useState } from "react";
import axios from "axios";
import { Html5QrcodeScanner } from "html5-qrcode";

function CheckIn() {
  const [participantId, setParticipantId] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [scannerStarted, setScannerStarted] = useState(false);

  const handleCheckIn = async (id) => {
    if (!id) {
      setMessage("Please enter Participant ID");
      setSuccess(false);
      return;
    }

    try {
      const response = await axios.post(
        "https://event-pulse-ai-backend.onrender.com/api/checkin",
        {
          participantId: id,
          eventId: "EVT001"
        }
      );

      setMessage(response.data.message || "Check-in successful!");
      setSuccess(true);
      setParticipantId("");

    } catch (error) {
      setMessage(
        error.response?.data?.message || "Check-in failed"
      );
      setSuccess(false);
    }
  };

  const startScanner = () => {
    if (scannerStarted) return;

    setScannerStarted(true);

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 }
      },
      false
    );

    scanner.render(
      async (decodedText) => {
        try {
          const qrData = JSON.parse(decodedText);

          if (!qrData.participantId) {
            setMessage("Invalid QR Code");
            setSuccess(false);
            return;
          }

          const response = await axios.post(
            "https://event-pulse-ai-backend.onrender.com/api/checkin/qr",
            {
              participantId: qrData.participantId,
              eventId: "EVT001"
            }
          );

          setMessage(
            `${response.data.message} 🎉 ${response.data.participant?.name || ""}`
          );
          setSuccess(true);

          scanner.clear();

        } catch (error) {
          setMessage(
            error.response?.data?.message || "QR Check-in failed"
          );
          setSuccess(false);
        }
      },
      () => {
        // Scanner errors can be ignored while searching for QR
      }
    );
  };

  return (
    <div className="container">
      <div className="card">
        <h1>EVENTPULSE AI</h1>
        <h2>📱 Participant Check-in</h2>

        {/* Manual Check-in */}
        <input
          className="input"
          type="text"
          placeholder="Enter Participant ID"
          value={participantId}
          onChange={(e) => setParticipantId(e.target.value)}
        />

        <button
          className="register-btn"
          onClick={() => handleCheckIn(participantId)}
        >
          CHECK IN
        </button>

        <hr style={{ margin: "25px 0" }} />

        {/* QR Check-in */}
        <h3>🎫 Scan Digital Pass</h3>

        {!scannerStarted && (
          <button
            className="register-btn"
            onClick={startScanner}
          >
            📷 START QR SCANNER
          </button>
        )}

        <div
          id="qr-reader"
          style={{
            width: "100%",
            maxWidth: "400px",
            margin: "20px auto"
          }}
        ></div>

        {message && (
          <p
            style={{
              marginTop: "15px",
              fontWeight: "bold"
            }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default CheckIn;