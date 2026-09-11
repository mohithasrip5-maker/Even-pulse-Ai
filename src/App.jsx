import "./App.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import ParticipantDashboard from "./components/ParticipantDashboard";
import collegeLogo from "./assets/college-logo.jpg";
import EventEntryQR from "./components/EventEntryQR";
import Registration from "./components/Registration";
import DigitalPass from "./components/DigitalPass";
import CheckIn from "./components/CheckIn";
import EventDiscovery from "./components/EventDiscovery";
import PublicHome from "./components/PublicHome";
/* =========================================================
   DASHBOARD LIVE
========================================================= */
function DashboardLive({ setPage, announceEvent }) {
  const [liveData, setLiveData] = useState({
    currentAttendance: 0,
    capacity: 500,
    crowdPercentage: 0,
    riskLevel: "SAFE",
  });
const submitFeedback = async () => {
  if (!feedbackRating) {
    alert("Please select a star rating ⭐");
    return;
  }

  try {
    const response = await axios.post(
      "https://event-pulse-ai-backend.onrender.com/api/feedback",
      {
        eventId: "EVT001",
        participantId: participantId,
        rating: feedbackRating,
        comment: feedbackComment
      }
    );

    if (response.data.success) {
      setFeedbackSubmitted(true);
      alert(`⭐ Overall Rating: ${feedbackRating}/5\n✅ Feedback saved successfully!`);
    }
  } catch (error) {
    console.log("Feedback Error:", error);
    alert("Feedback submission failed");
  }
};
  const [aiAlert, setAiAlert] = useState(null);
  const [copilotData, setCopilotData] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =========================================================
     LOAD LIVE DASHBOARD DATA
  ========================================================= */

  const loadLiveData = async () => {
    try {
      const response = await axios.get(
        "https://event-pulse-ai-backend.onrender.com/api/live-dashboard/EVT001"
      );

      if (response.data.success) {
        setLiveData({
          currentAttendance: response.data.currentAttendance,
          capacity: response.data.capacity,
          crowdPercentage: response.data.crowdPercentage,
          riskLevel: response.data.riskLevel,
        });
      }
    } catch (error) {
      console.log("Live dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     INITIAL LIVE DATA + AUTO REFRESH
  ========================================================= */

  useEffect(() => {
    loadLiveData();

    const interval = setInterval(() => {
      loadLiveData();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  /* =========================================================
     SOCKET.IO AI ALERT
  ========================================================= */

  useEffect(() => {
    const socket = io("https://event-pulse-ai-backend.onrender.com");

    socket.emit("join-event", "EVT001");

    socket.on("ai-alert", (alert) => {
      console.log("🚨 AI ALERT:", alert);

      setAiAlert(alert);

      setLiveData((prev) => ({
        ...prev,
        riskLevel: alert.level,
      }));

      loadLiveData();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  /* =========================================================
     RISK MESSAGE
  ========================================================= */

  const getRiskMessage = () => {
    if (liveData.riskLevel === "CRITICAL") {
      return "Crowd capacity is critically high";
    }

    if (liveData.riskLevel === "HIGH") {
      return "Crowd density is increasing";
    }

    if (liveData.riskLevel === "MEDIUM") {
      return "Crowd is moderately high";
    }

    return "Crowd level is under control";
  };

  /* =========================================================
     CROWD SIMULATION
  ========================================================= */

  const simulateCrowdSurge = async () => {
    try {
      const response = await axios.post(
        "https://event-pulse-ai-backend.onrender.com/api/simulate-crowd-surge",
        {
          startCrowd: liveData.currentAttendance,
        }
      );

      console.log("🤖 AI Crowd Simulation:", response.data);

      const data = response.data;

      setAiAlert(data.aiAlert);

      setLiveData({
        currentAttendance: data.currentAttendance,
        capacity: data.capacity,
        crowdPercentage: data.crowdPercentage,
        riskLevel: data.riskLevel,
      });
    } catch (error) {
      console.log("Simulation error:", error);
    }
  };

  /* =========================================================
     AI EVENT COPILOT
  ========================================================= */

  const getAICopilot = async () => {
    try {
      const response = await axios.post(
        "https://event-pulse-ai-backend.onrender.com/api/action-plan",
        {
          problem:
            liveData.riskLevel === "CRITICAL"
              ? "Critical crowd capacity"
              : liveData.riskLevel === "HIGH"
              ? "High crowd density"
              : liveData.riskLevel === "MEDIUM"
              ? "Moderate crowd density"
              : "Crowd level normal",

          location: "Main Gate",

          severity:
            liveData.riskLevel === "SAFE"
              ? "LOW"
              : liveData.riskLevel,
        }
      );

      console.log("🤖 AI Copilot:", response.data);

      setCopilotData(response.data);
    } catch (error) {
      console.log("AI Copilot Error:", error);
    }
  };

  /* =========================================================
     DASHBOARD UI
  ========================================================= */

  return (
    <>
      {/* HEADER */}

      <header className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, Organizer 👋</p>
        </div>

        <div className="organizer">
          <div className="avatar">O</div>

          <div>
            <strong>Organizer</strong>
            <small>Admin</small>
          </div>
        </div>
      </header>

      {/* EVENT TITLE */}

      <section className="event-title">
        <div>
          <p>LIVE EVENT</p>

          <h2>MJC TechFest 2026</h2>

          <span>
            Real-time event command center
          </span>
        </div>

        <div className="live">
          ● LIVE
        </div>
      </section>

      {/* CROWD SIMULATION */}

      <button
        type="button"
        onClick={simulateCrowdSurge}
        style={{
          padding: "12px 20px",
          margin: "15px 0",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        🤖 SIMULATE CROWD SURGE
      </button>

      {/* =====================================================
          EVENT HEALTH
      ===================================================== */}

      <section className="health-card">
        <div>
          <p>EVENT HEALTH</p>

          <h2>
            {Math.max(
              0,
              100 - liveData.crowdPercentage
            )}
            %
          </h2>

          <span>{getRiskMessage()}</span>
        </div>

        <div className="health-circle">
          {Math.max(
            0,
            100 - liveData.crowdPercentage
          )}
          %
        </div>
      </section>

      {/* =====================================================
          LIVE STATS
      ===================================================== */}

      <section className="stats-grid">

        {/* PARTICIPANTS */}

        <div className="stat-card">
          <div className="stat-icon">👥</div>

          <p>Participants</p>

          <h2>
            {loading
              ? "..."
              : liveData.currentAttendance}

            <small>
              {" "}
              / {liveData.capacity}
            </small>
          </h2>

          <span>
            {liveData.crowdPercentage}% capacity
          </span>
        </div>

        {/* GATE QUEUE */}

        <div className="stat-card">
          <div className="stat-icon">🚪</div>

          <p>Gate Queue</p>

          <h2>43</h2>

          <span>People waiting</span>
        </div>

        {/* HALL A */}

        <div className="stat-card">
          <div className="stat-icon">🏛️</div>

          <p>Hall A</p>

          <h2>
            {Math.round(
              liveData.currentAttendance * 0.35
            )}

            <small> / 200</small>
          </h2>

          <span>Hall occupancy</span>
        </div>

        {/* HALL B */}

        <div className="stat-card">
          <div className="stat-icon">🏛️</div>

          <p>Hall B</p>

          <h2>
            {Math.round(
              liveData.currentAttendance * 0.25
            )}

            <small> / 200</small>
          </h2>

          <span>Hall occupancy</span>
        </div>
      </section>

      {/* =====================================================
          AI ALERT
      ===================================================== */}

      {aiAlert && (
        <div
          style={{
            margin: "20px 0",
            padding: "20px",
            borderRadius: "12px",
            border: "2px solid #ff4d4d",
            background: "#fff5f5",
            color: "#222",
          }}
        >
          <h2>🚨 AI ALERT</h2>

          <p>
            <strong>Risk Level:</strong>{" "}
            {aiAlert.level}
          </p>

          <p>
            <strong>Message:</strong>{" "}
            {aiAlert.message}
          </p>

          <p>
            <strong>AI Recommendation:</strong>{" "}
            {aiAlert.action}
          </p>
        </div>
      )}

      {/* =====================================================
          AI EVENT COPILOT
      ===================================================== */}

      <div
  className="ai-copilot"
  style={{
    marginTop: "20px",
    padding: "28px",
    borderRadius: "18px",
    background: "#11182f",
    border: "1px solid #6246d8",
    color: "#ffffff",
  }}
>
  <h2
    style={{
      color: "#ffffff",
      marginBottom: "10px",
    }}
  >
    🤖 AI Event Copilot
  </h2>

  <p
    style={{
      color: "#aeb7d4",
      marginBottom: "18px",
      lineHeight: "1.6",
    }}
  >
    AI analyzes the current event situation and recommends the next best action.
  </p>

  <button
    type="button"
    onClick={getAICopilot}
    style={{
      padding: "12px 20px",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      fontWeight: "bold",
      color: "#ffffff",
      background: "linear-gradient(90deg, #6246d8, #00bfff)",
    }}
  >
    ✨ GET AI RECOMMENDATION
  </button>

  {copilotData && (
    <div
      style={{
        marginTop: "20px",
        padding: "18px",
        borderRadius: "12px",
        background: "#18213d",
        border: "1px solid #303d66",
        color: "#ffffff",
      }}
    >
      <p
        style={{
          color: "#ffffff",
          marginBottom: "12px",
        }}
      >
        <strong style={{ color: "#00d4ff" }}>
          Priority:
        </strong>{" "}
        {copilotData.priority || "NORMAL"}
      </p>

      <p
        style={{
          color: "#dce3f7",
          lineHeight: "1.7",
        }}
      >
        <strong style={{ color: "#00d4ff" }}>
          AI Recommendation:
        </strong>{" "}
        {copilotData.action || copilotData.recommendation || "Continue monitoring the event."}
      </p>
    </div>
  )}
</div>
      {/* =====================================================
          AI ALERTS + EMERGENCY
      ===================================================== */}

      <section className="dashboard-bottom">

        {/* AI ALERTS */}

        <div className="ai-alert">

          <div className="section-heading">

            <h2>🤖 AI Alerts</h2>

            <span>
              {liveData.riskLevel === "SAFE"
                ? "0 Active"
                : "1 Active"}
            </span>

          </div>

          {/* LIVE AI ALERT */}

          {liveData.riskLevel !== "SAFE" && (
            <div
              style={{
                marginBottom: "20px",
                padding: "18px",
                borderRadius: "12px",
                border: "2px solid #ff4d4d",
                background: "#fff5f5",
              }}
            >
              <h3>🤖 LIVE AI ALERT</h3>

              <p>
                <strong>Risk Level:</strong>{" "}
                {liveData.riskLevel}
              </p>

              <p>
                <strong>Crowd:</strong>{" "}
                {liveData.currentAttendance} /{" "}
                {liveData.capacity}
              </p>

              <p>
                <strong>AI Message:</strong>{" "}
                {liveData.riskLevel === "CRITICAL"
                  ? "Crowd capacity is critically high."
                  : liveData.riskLevel === "HIGH"
                  ? "Crowd density is increasing."
                  : "Crowd is moderately high."}
              </p>

              <p>
                <strong>Recommended Action:</strong>{" "}
                {liveData.riskLevel === "CRITICAL"
                  ? "Activate emergency crowd control."
                  : liveData.riskLevel === "HIGH"
                  ? "Deploy additional volunteers."
                  : "Monitor entrances and exits."}
              </p>
            </div>
          )}

          {/* ALERT ITEM */}

          <div className="alert-item">

            <strong>
              {liveData.riskLevel === "CRITICAL"
                ? "🔴 Critical Crowd Alert"
                : liveData.riskLevel === "HIGH"
                ? "🔴 High Crowd Density"
                : liveData.riskLevel === "MEDIUM"
                ? "⚠️ Moderate Crowd Density"
                : "🟢 Crowd Level Normal"}
            </strong>

            <p>{getRiskMessage()}</p>

          </div>

          {/* AI RECOMMENDATION */}

          <div className="alert-item">

            <strong>
              🤖 AI Recommendation
            </strong>

            <p>
              {liveData.riskLevel === "CRITICAL"
                ? "Activate emergency crowd control immediately."
                : liveData.riskLevel === "HIGH"
                ? "Deploy additional volunteers."
                : liveData.riskLevel === "MEDIUM"
                ? "Monitor entrances and exits."
                : "Continue monitoring the event."}
            </p>

          </div>

        </div>

        {/* EMERGENCY */}

        <div className="emergency">

          <h2>🚨 Emergency Mode</h2>

          <p>
            Quickly activate emergency protocols
            if required.
          </p>

          <button
            type="button"
            onClick={() => setPage("emergency")}
          >
            ACTIVATE EMERGENCY MODE
          </button>

        </div>
<button
  type="button"
  onClick={announceEvent}
>
  📢 ANNOUNCE EVENT
</button>
      </section>
    </>
  );
}

/* =========================================================
   MAIN APP
========================================================= */

function App() {
  

const [page, setPage] = useState(
  new URLSearchParams(window.location.search).get("entry") === "1"
    ? "public"
    : "event-qr"
);
const [selectedEvent, setSelectedEvent] = useState(null);
  const [liveData, setLiveData] = useState({
    currentAttendance: 0,
    capacity: 500,
    crowdPercentage: 0,
    riskLevel: "SAFE",
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [participantId, setParticipantId] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  useEffect(() => {
  const loadAttendance = async () => {
    if (!participantId) return;

    try {
      const response = await axios.get(
        `https://event-pulse-ai-backend.onrender.com/api/attendance/${participantId}`
      );

      if (response.data.success) {
        setAttendanceData(response.data.attendance);
      }
    } catch (error) {
      console.log("Attendance loading error:", error);
    }
  };

  loadAttendance();
}, [participantId]); 
  const [loginRole, setLoginRole] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showSignupPassword, setShowSignupPassword] =
    useState(false);

  const [emergencyData, setEmergencyData] =
    useState(null);
const [announcementMessage, setAnnouncementMessage] =
  useState("");
  
  /* =========================================================
     APP LIVE DATA
  ========================================================= */

  useEffect(() => {

    const loadAppLiveData = async () => {

      try {

        const response = await axios.get(
          "https://event-pulse-ai-backend.onrender.com/api/live-dashboard/EVT001"
        );

        if (response.data.success) {

          setLiveData({
            currentAttendance:
              response.data.currentAttendance,

            capacity:
              response.data.capacity,

            crowdPercentage:
              response.data.crowdPercentage,

            riskLevel:
              response.data.riskLevel,
          });

        }

      } catch (error) {

        console.log(
          "App live data error:",
          error
        );

      }

    };

    loadAppLiveData();

    const interval = setInterval(
      loadAppLiveData,
      3000
    );

    return () => clearInterval(interval);

  }, []);

  /* =========================================================
     LOGIN
  ========================================================= */

 const handleLogin = async () => {

  if (!email || !password) {
    alert("Please enter Email and Password");
    return;
  }

  if (!loginRole) {
    alert("Please select your role");
    return;
  }

  // ORGANIZER LOGIN
  if (loginRole === "organizer") {

    if (
      email === "organizer@eventpulse.ai" &&
      password === "admin123"
    ) {
      setPage("dashboard");
      return;
    }

    alert("Invalid organizer email or password");
    return;
  }

  // PARTICIPANT LOGIN
if (loginRole === "participant") {

  if (email === "mohithasrip5@gmail.com" && password === "participant123") {
    setParticipantId("P002");
    setPage("participant-home");
    return;
  }

  alert("Invalid participant login");
  return;
}
};
  /* =========================================================
     SIGNUP
  ========================================================= */

  const handleSignup = () => {

    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword
    ) {

      alert("Please fill all fields");

      return;
    }

    /* EMAIL VALIDATION */

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {

      alert(
        "Please enter a valid email address"
      );

      return;
    }

    /* PASSWORD VALIDATION */

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordRegex.test(password)) {

      alert(
        "Password must contain:\n" +
        "• At least 8 characters\n" +
        "• One Capital letter\n" +
        "• One Small letter\n" +
        "• One Number\n" +
        "• One Special symbol"
      );

      return;
    }

    /* CONFIRM PASSWORD */

    if (password !== confirmPassword) {

      alert("Passwords do not match");

      return;
    }

    alert(
      "Account created successfully!"
    );

    setPage("login");

    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {

    setEmail("");
    setPassword("");
   setLoginRole("");
    setPage("login");
    
  };

  /* =========================================================
     EMERGENCY API
  ========================================================= */

  const activateEmergency = async () => {

    try {

      const response = await axios.post(
        "https://event-pulse-ai-backend.onrender.com/api/emergency-response",
        {
          location: "Main Hall",

          emergencyType:
            "Medical Emergency",

          exits: [
            "Main Gate",
            "Emergency Exit A",
          ],

          volunteers: [
            "Volunteer 01",
            "Volunteer 02",
            "Volunteer 03",
          ],
        }
      );

      console.log(
        "🚨 Emergency Response:",
        response.data
      );

      setEmergencyData(
        response.data
      );

    } catch (error) {

      console.log(
        "Emergency Error:",
        error
      );

      alert(
        "Emergency response failed"
      );
    }
  };
  const [feedbackRating, setFeedbackRating] = useState(0);
const [feedbackComment, setFeedbackComment] = useState("");
const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
const announceEvent = async () => {
  try {
    const response = await axios.post(
      "https://event-pulse-ai-backend.onrender.com/api/events/EVT001/announce"
    );

    console.log("📢 Event Announcement:", response.data);

    setAnnouncementMessage("📢 Event announced successfully!");
    console.log("TOAST TRIGGERED");
  } catch (error) {
    console.log("Announcement Error:", error);

    alert("Event announcement failed");
  }
};
  /* =========================================================
     APP UI
  ========================================================= */

  return (

    <div className={`app-layout page-${page}`}>


        <style>{`
          .app-layout.page-participant-home .sidebar { display:none !important; }
          .app-layout.page-participant-home .main-content { width:100%; margin:0; padding:0; background:#f6f8fc; }
          .app-layout.page-participant-home .participant-portal { min-height:100vh; padding:42px clamp(20px,5vw,72px); box-sizing:border-box; }
          .app-layout.page-participant-home .participant-hero { max-width:1180px; margin:0 auto 32px; padding:34px 38px; border-radius:24px; background:linear-gradient(135deg,#10182f,#24355f); color:#fff; display:flex; align-items:center; justify-content:space-between; gap:24px; box-shadow:0 18px 45px rgba(15,23,42,.14); }
          .app-layout.page-participant-home .participant-hero h1 { margin:8px 0 10px; color:#fff; font-size:clamp(30px,4vw,44px); line-height:1.1; }
          .app-layout.page-participant-home .participant-hero p { margin:0; color:#cbd5e1; font-size:16px; }
          .app-layout.page-participant-home .portal-label { color:#67e8f9; font-size:12px; font-weight:800; letter-spacing:1.5px; }
          .app-layout.page-participant-home .participant-live { padding:11px 15px; border:1px solid rgba(255,255,255,.18); border-radius:999px; background:rgba(255,255,255,.08); color:#e2e8f0; font-size:11px; font-weight:800; white-space:nowrap; }
          .app-layout.page-participant-home .participant-live span { color:#4ade80; margin-right:6px; }
          .app-layout.page-participant-home .participant-section,.app-layout.page-participant-home .participant-footer-actions { max-width:1180px; margin-left:auto; margin-right:auto; }
          .app-layout.page-participant-home .section-heading { margin-bottom:20px; }
          .app-layout.page-participant-home .section-heading span { color:#64748b; font-size:11px; font-weight:800; letter-spacing:1.4px; }
          .app-layout.page-participant-home .section-heading h2 { margin:6px 0 0; color:#172033; font-size:28px; }
          .app-layout.page-participant-home .participant-feature-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:20px; }
          .app-layout.page-participant-home .participant-feature-card { min-height:225px; padding:25px; border:1px solid #e2e8f0; border-radius:20px; background:#fff; box-shadow:0 10px 30px rgba(15,23,42,.06); display:flex; flex-direction:column; }
          .app-layout.page-participant-home .participant-feature-card h3 { margin:0 0 8px; color:#172033; font-size:18px; }
          .app-layout.page-participant-home .participant-feature-card p { margin:0 0 20px; color:#64748b; font-size:14px; line-height:1.55; flex:1; }
          .app-layout.page-participant-home .feature-icon { width:48px; height:48px; display:grid; place-items:center; border-radius:14px; background:#eef4ff; font-size:22px; margin-bottom:17px; }
          .app-layout.page-participant-home .participant-feature-card button { width:100%; border:0; border-radius:10px; padding:11px 14px; background:#172554; color:#fff; font-size:12px; font-weight:800; cursor:pointer; }
          .app-layout.page-participant-home .participant-feature-card .coming-soon-btn { background:#e9edf4; color:#64748b; cursor:default; }
          .app-layout.page-participant-home .participant-footer-actions { margin-top:26px; display:flex; justify-content:space-between; gap:12px; }
          .app-layout.page-participant-home .participant-footer-actions button { border:1px solid #dbe1eb; background:#fff; color:#334155; border-radius:10px; padding:11px 16px; font-weight:700; cursor:pointer; }
          .app-layout.page-dashboard .main-content,.app-layout.page-alerts .main-content,.app-layout.page-twin .main-content,.app-layout.page-emergency .main-content,.app-layout.page-analytics .main-content,.app-layout.page-settings .main-content { background:#f6f8fc; }
          @media(max-width:900px){ .app-layout.page-participant-home .participant-feature-grid{grid-template-columns:repeat(2,minmax(0,1fr));}.app-layout.page-participant-home .participant-hero{flex-direction:column;align-items:flex-start;} }
          @media(max-width:620px){ .app-layout.page-participant-home .participant-portal{padding:22px 16px;}.app-layout.page-participant-home .participant-feature-grid{grid-template-columns:1fr;} .app-layout.page-participant-home .participant-footer-actions{flex-direction:column;} }
          /* Login, Event QR and announcement styling intentionally untouched. */
        `}</style>
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      {page !== "login" &&
       page !== "signup" &&
       page !== "public" &&
       page !== "participant-home" && (
          <aside className="sidebar">

            <div className="side-logo">

              <img
                src={collegeLogo}
                alt="College Logo"
                className="college-logo"
              />

              <div>

                <h2>
                  EventPulse{" "}
                  <span>AI</span>
                </h2>

                <small>
                  EVENT PLATFORM
                </small>

              </div>

            </div>

            <nav>

              {/* DASHBOARD */}

              <a
                className={
                  page === "dashboard"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setPage("dashboard")
                }
              >
                🏠 Dashboard
              </a>
{/* DISCOVER EVENTS */}

<a
  className={
    page === "discover"
      ? "active"
      : ""
  }
  onClick={() =>
    setPage("discover")
  }
>
  🔎 Discover Events
</a>
              {/* REGISTRATION */}

              <a
                className={
                  page === "registration"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setPage("registration")
                }
              >
                📝 Registration
              </a>

              {/* DIGITAL PASS */}

              <a
                className={
                  page === "digitalpass"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setPage("digitalpass")
                }
              >
                🎫 Digital Pass
              </a>

              {/* CHECK-IN */}

              <a
                className={
                  page === "checkin"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setPage("checkin")
                }
              >
                📱 Check-in
              </a>
              {/* MY ATTENDANCE */}

<a
  className={
    page === "attendance"
      ? "active"
      : ""
  }
  onClick={() =>
    setPage("attendance")
  }
>
  📊 My Attendance
</a>
              {/* DIGITAL EVENT TWIN */}

              <a
                className={
                  page === "twin"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setPage("twin")
                }
              >
                🗺️ Digital Event Twin
              </a>

              {/* AI ALERTS */}

              <a
                className={
                  page === "alerts"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setPage("alerts")
                }
              >
                🤖 AI Alerts
              </a>

              {/* EMERGENCY */}

              <a
                className={
                  page === "emergency"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setPage("emergency")
                }
              >
                🚨 Emergency Mode
              </a>

              {/* ANALYTICS */}

              <a
                className={
                  page === "analytics"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setPage("analytics")
                }
              >
                📊 Analytics
              </a>

              {/* SETTINGS */}

              <a
                className={
                  page === "settings"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setPage("settings")
                }
              >
                ⚙️ Settings
              </a>

            </nav>

            <div className="side-bottom">

              <div className="status">
                <span>●</span>{" "}
                System Online
              </div>

              <a onClick={handleLogout}>
                🚪 Logout
              </a>

            </div>

          </aside>
        )}

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="main-content">
{announcementMessage && (
  <div className="announcement-toast">
    {announcementMessage}
  </div>
)}
        {/* ===================================================
            LOGIN
        =================================================== */}

        {page === "login" && (

          <div className="login-page">

            <div className="login-box">

              <div className="login-logo">

                <img
                  src={collegeLogo}
                  alt="College Logo"
                  className="college-logo"
                />

                <div className="login-brand">

                  <h1>
                    EventPulse{" "}
                    <span>AI</span>
                  </h1>

                  <p>
                    Smart Event Management
                    Platform
                  </p>

                </div>

              </div>

              <div className="login-form">

                <label>
                  Email Address
                </label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                />

                <label>
                  Password
                </label>

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                />
<div className="role-selection">
  <p><strong>Select your role:</strong></p>

  <button
    type="button"
    onClick={() => setLoginRole("participant")}
  >
    👤 Participant
  </button>

  <button
    type="button"
    onClick={() => setLoginRole("organizer")}
  >
    🧑‍💼 Organizer
  </button>
</div>
<p className="selected-role">
  {loginRole
    ? `Selected: ${loginRole === "participant" ? "Participant" : "Organizer"}`
    : "Please select your role"}
</p>
                <button
                  className="login-button"
                  type="button"
                  onClick={handleLogin}
                >
                  LOGIN
                </button>

              </div>

              <div className="signup-link">

                Don't have an account?

                <button
                  type="button"
                  onClick={() =>
                    setPage("signup")
                  }
                >
                  Create Account
                </button>

              </div>

              <div className="login-footer">
                Secure Organizer Login •
                EventPulse AI
              </div>

            </div>

          </div>
        )}

        {/* ===================================================
            SIGNUP
        =================================================== */}

        {page === "signup" && (

          <div className="login-page">

            <div className="login-box signup-box">

              <div className="login-logo">

                <img
                  src={collegeLogo}
                  alt="College Logo"
                  className="college-logo"
                />

                <div className="login-brand">

                  <h1>
                    EventPulse{" "}
                    <span>AI</span>
                  </h1>

                  <p>
                    Smart Event Management
                    Platform
                  </p>

                </div>

              </div>

              <div className="signup-heading">

                <h2>
                  Create Account
                </h2>

                <p>
                  Create your organizer
                  account
                </p>

              </div>

              <div className="login-form">

                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                />

                <label>
                  Email Address
                </label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                />

                <label>
                  Password
                </label>

                <div className="password-field">

                  <input
                    type={
                      showSignupPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                  />

                  <button
                    type="button"
                    className="show-password"
                    onClick={() =>
                      setShowSignupPassword(
                        !showSignupPassword
                      )
                    }
                  >
                    {showSignupPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>

                <label>
                  Confirm Password
                </label>

                <input
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                />

                <button
                  className="login-button"
                  type="button"
                  onClick={handleSignup}
                >
                  CREATE ACCOUNT
                </button>

              </div>

              <div className="signup-link">

                Already have an account?

                <button
                  type="button"
                  onClick={() =>
                    setPage("login")
                  }
                >
                  Login
                </button>

              </div>

              <div className="login-footer">
                Secure Organizer Registration •
                EventPulse AI
              </div>

            </div>

          </div>
        )}

        {/* ===================================================
            REGISTRATION
        =================================================== */}

        {page === "registration" && (

          <Registration
          selectedEvent={selectedEvent}
            onLogin={() => setPage("login")}
            onRegistered={(participant) => {

            console.log(
            "Registered:",
           participant
  );

  setParticipantId(participant.participantId);

}}
          />

        )}
{page === "discover" && (
  <EventDiscovery
    onSelectEvent={(event) => {
      setSelectedEvent(event);
      setPage("registration");
    }}
  />
)}
        {/* ===================================================
            DIGITAL PASS
        =================================================== */}

        {page === "digitalpass" && (
          <DigitalPass />
        )}

        {/* ===================================================
            CHECK-IN
        =================================================== */}

        {page === "checkin" && (
          <CheckIn />
        )}
        
        {/* ===================================================
    MY ATTENDANCE
=================================================== */}

{page === "attendance" && (
  <div className="attendance-page">
    <h2>📊 My Attendance</h2>

    <p>Participant ID: {participantId || "Not available"}</p>

    <p>Track your event participation and check-in status.</p>

    <div className="attendance-card">
      <h3>Event Attendance</h3>

      {attendanceData.length === 0 ? (
        <p>No attendance record found yet.</p>
      ) : (
        attendanceData.map((attendance, index) => (
          <div key={attendance._id || index}>
            <p>
              <strong>Status:</strong> {attendance.status}
            </p>

            <p>
              <strong>Check-in Time:</strong>{" "}
              {new Date(attendance.checkInTime).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
  </div>
)}
        {/* ===================================================
            DASHBOARD
        =================================================== */}

        {page === "dashboard" && (

          <DashboardLive
  setPage={setPage}
  announceEvent={announceEvent}
/>

        )}{page === "event-qr" && (
  <EventEntryQR />
)}
{page === "public" && (
  <PublicHome
    onViewEvent={(event) => {
      setSelectedEvent(event);
      setPage("login");
    }}
  />
)}

{page === "participant-home" && (
  <div className="participant-portal">

    <div className="participant-hero">
      <div>
        <span className="portal-label">EVENTPULSE AI • PARTICIPANT</span>

        <h1>👋 Welcome, Participant!</h1>

        <p>
          Your complete event journey — from registration to certificate.
        </p>
      </div>

      <div className="participant-live">
        <span>●</span> LIVE EVENT PLATFORM
      </div>
    </div>


    <div className="participant-section">
      <div className="section-heading">
        <span>YOUR EVENT JOURNEY</span>
        <h2>Everything You Need</h2>
      </div>


      <div className="participant-feature-grid">

        <div className="participant-feature-card">
          <div className="feature-icon">🔎</div>
          <h3>Discover Events</h3>
          <p>Explore upcoming events and event details.</p>

          <button onClick={() => setPage("discover")}>
            EXPLORE EVENTS →
          </button>
        </div>


        <div className="participant-feature-card">
          <div className="feature-icon">📝</div>
          <h3>Event Registration</h3>
          <p>Register for an event and receive your participant ID.</p>

          <button onClick={() => setPage("registration")}>
            REGISTER →
          </button>
        </div>


        <div className="participant-feature-card">
          <div className="feature-icon">🎫</div>
          <h3>Digital Event Pass</h3>
          <p>Access your digital pass and event QR code.</p>

          <button onClick={() => setPage("digitalpass")}>
            VIEW MY PASS →
          </button>
        </div>


        <div className="participant-feature-card">
          <div className="feature-icon">📱</div>
          <h3>QR Check-in</h3>
          <p>Use your participant ID or QR code for event check-in.</p>

          <button onClick={() => setPage("checkin")}>
  CHECK IN →
</button>
        </div>
<div className="participant-feature-card">
  <div className="feature-icon">💬</div>
  <h3>Event Feedback</h3>
  <p>Rate your experience and share your feedback.</p>

  <div style={{ margin: "15px 0" }}>
    <p style={{ marginBottom: "8px", fontWeight: "600" }}>
      Overall Rating
    </p>

    <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => setFeedbackRating(star)}
          style={{
            background: "none",
            border: "none",
            fontSize: "30px",
            cursor: "pointer",
            padding: "2px",
            color: star <= feedbackRating ? "#fbbf24" : "#cbd5e1"
          }}
        >
          ★
        </button>
      ))}
    </div>

    <p style={{ fontWeight: "600", marginTop: "5px" }}>
      {feedbackRating ? `${feedbackRating}/5 ⭐` : "Select your rating"}
    </p>
  </div>

  <textarea
    placeholder="Write your feedback..."
    value={feedbackComment}
    onChange={(e) => setFeedbackComment(e.target.value)}
    style={{
      width: "100%",
      minHeight: "80px",
      padding: "10px",
      borderRadius: "8px",
      border: "1px solid #cbd5e1",
      resize: "vertical",
      boxSizing: "border-box"
    }}
  />

  <button onClick={submitFeedback}>
    {feedbackSubmitted ? "FEEDBACK SAVED ✓" : "SUBMIT FEEDBACK →"}
  </button>

  {feedbackSubmitted && (
    <p style={{ color: "green", fontWeight: "600", marginTop: "10px" }}>
      ⭐ Overall Rating: {feedbackRating}/5
      <br />
      Feedback saved successfully!
    </p>
  )}
</div>

        <div className="participant-feature-card">
          <div className="feature-icon">📊</div>
          <h3>My Attendance</h3>
          <p>Track your event and session participation.</p>

          <button onClick={() => setPage("attendance")}>
          VIEW ATTENDANCE →
          </button>
        </div>


        <div className="participant-feature-card">
          <div className="feature-icon">🏆</div>
          <h3>My Certificate</h3>
          <p>Get your certificate after completing the event.</p>

          <button
  onClick={() => {
    const certificateId = "MJC-2026-" + participantId;

    const certificateWindow = window.open("", "_blank");

    certificateWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>EventPulse AI Certificate</title>
        <style>
          body {
            margin: 0;
            background: #f1f5f9;
            font-family: Georgia, serif;
          }

          .certificate {
            width: 900px;
            min-height: 600px;
            margin: 40px auto;
            background: white;
            border: 12px solid #1e3a8a;
            padding: 50px;
            box-sizing: border-box;
            text-align: center;
            position: relative;
          }

          .inner {
            border: 3px solid #d4af37;
            min-height: 490px;
            padding: 35px;
            box-sizing: border-box;
          }

          .logo {
            font-family: Arial, sans-serif;
            font-size: 18px;
            font-weight: bold;
            color: #1e3a8a;
            letter-spacing: 2px;
          }

          h1 {
            font-size: 48px;
            color: #1e3a8a;
            margin: 25px 0 10px;
          }

          .subtitle {
            font-size: 20px;
            color: #555;
          }

          .name {
            font-size: 38px;
            font-weight: bold;
            color: #111827;
            margin: 30px 0;
          }

          .event {
            font-size: 25px;
            font-weight: bold;
            color: #1e3a8a;
          }

          .description {
            font-size: 18px;
            color: #444;
            margin: 25px;
          }

          .id {
            font-family: Arial, sans-serif;
            font-size: 13px;
            color: #666;
            margin-top: 35px;
          }

          .actions {
            text-align: center;
            margin: 20px;
          }

          button {
            padding: 12px 25px;
            margin: 5px;
            border: none;
            border-radius: 8px;
            background: #1e3a8a;
            color: white;
            font-size: 15px;
            cursor: pointer;
          }

          @media print {
            body {
              background: white;
            }

            .certificate {
              margin: 0;
              width: 100%;
              border: 10px solid #1e3a8a;
            }

            .actions {
              display: none;
            }
          }
        </style>
      </head>

      <body>

        <div class="certificate">
          <div class="inner">

            <div class="logo">
              EVENTPULSE AI
            </div>

            <h1>CERTIFICATE</h1>

            <div class="subtitle">
              OF PARTICIPATION
            </div>

            <div class="description">
              This certificate is proudly presented to
            </div>

            <div class="name">
              Mohitha Sri. P
            </div>

            <div class="description">
              for successfully participating in
            </div>

            <div class="event">
              MJC TECHFEST 2026
            </div>

            <div class="description">
              and being a part of this event powered by
              EventPulse AI.
            </div>

            <div class="id">
              Certificate ID: ${certificateId}
            </div>

          </div>
        </div>

        <div class="actions">
          <button onclick="window.print()">
            🖨️ Download / Print Certificate
          </button>

          <button onclick="window.close()">
            Close
          </button>
        </div>

      </body>
      </html>
    `);

    certificateWindow.document.close();
  }}
>
  GENERATE E-CERTIFICATE
</button>
        </div>

      </div>
    </div>


    <div className="participant-footer-actions">
      <button onClick={() => setPage("public")}>
        ← BACK TO EVENTS
      </button>

      <button onClick={handleLogout}>
        LOGOUT
      </button>
    </div>

  </div>
)}
        {/* ===================================================
            AI ALERTS
        =================================================== */}

        {page === "alerts" && (

          <div className="alerts-page">

            <div className="twin-header">

              <div>

                <p className="twin-label">
                  AI MONITORING SYSTEM
                </p>

                <h1>
                  🤖 AI Alerts
                </h1>

                <span>
                  Real-time intelligent event
                  monitoring
                </span>

              </div>

              <div className="live">
                ● LIVE
              </div>

            </div>

            {/* SUMMARY */}

            <div className="alerts-summary">

              <div className="alert-summary-card">

                <span>
                  ACTIVE ALERTS
                </span>

                <strong>
                  {liveData.riskLevel ===
                  "SAFE"
                    ? 0
                    : 1}
                </strong>

              </div>

              <div className="alert-summary-card">

                <span>
                  HIGH PRIORITY
                </span>

                <strong>
                  {liveData.riskLevel ===
                    "HIGH" ||
                  liveData.riskLevel ===
                    "CRITICAL"
                    ? 1
                    : 0}
                </strong>

              </div>

              <div className="alert-summary-card">

                <span>
                  AI STATUS
                </span>

                <strong>
                  {liveData.riskLevel ===
                  "CRITICAL"
                    ? "EMERGENCY"
                    : "ONLINE"}
                </strong>

              </div>

            </div>

            {/* ALERT LIST */}

            <div className="alerts-list">

              {/* CROWD ALERT */}

              <div className="ai-alert-card high">

                <div className="alert-icon">
                  ⚠️
                </div>

                <div>

                  <h3>
                    {liveData.riskLevel ===
                    "CRITICAL"
                      ? "🚨 Critical Crowd Capacity"
                      : liveData.riskLevel ===
                        "HIGH"
                      ? "🔴 High Crowd Density"
                      : liveData.riskLevel ===
                        "MEDIUM"
                      ? "⚠️ Moderate Crowd Density"
                      : "🟢 Crowd Level Normal"}
                  </h3>

                  <p>
                    {
                      liveData.currentAttendance
                    }{" "}
                    participants are
                    currently inside the
                    event.
                  </p>

                  <small>
                    AI detected{" "}
                    {
                      liveData.crowdPercentage
                    }
                    % venue capacity
                    usage.
                  </small>

                </div>

                <span className="priority">
                  {liveData.riskLevel ===
                  "SAFE"
                    ? "INFO"
                    : liveData.riskLevel}
                </span>

              </div>

              {/* CAPACITY */}

              <div className="ai-alert-card danger">

                <div className="alert-icon">
                  🔴
                </div>

                <div>

                  <h3>
                    {liveData.riskLevel ===
                    "CRITICAL"
                      ? "🚨 Venue Capacity Critical"
                      : liveData.riskLevel ===
                        "HIGH"
                      ? "🔴 Venue Capacity High"
                      : liveData.riskLevel ===
                        "MEDIUM"
                      ? "⚠️ Venue Capacity Moderate"
                      : "🟢 Venue Capacity Safe"}
                  </h3>

                  <p>
                    Current occupancy:{" "}
                    <strong>
                      {
                        liveData.crowdPercentage
                      }
                      %
                    </strong>
                  </p>

                  <small>
                    {
                      liveData.capacity -
                      liveData.currentAttendance
                    }{" "}
                    participant
                    {liveData.capacity -
                      liveData.currentAttendance !==
                    1
                      ? "s"
                      : ""}{" "}
                    capacity remaining.
                  </small>

                </div>

                <span className="priority">
                  {liveData.riskLevel ===
                  "SAFE"
                    ? "LOW"
                    : liveData.riskLevel}
                </span>

              </div>

              {/* AI RECOMMENDATION */}

              <div className="ai-alert-card normal">

                <div className="alert-icon">
                  💡
                </div>

                <div>

                  <h3>
                    {liveData.riskLevel ===
                    "CRITICAL"
                      ? "🚨 AI Emergency Recommendation"
                      : liveData.riskLevel ===
                        "HIGH"
                      ? "🔴 AI Crowd Control Recommendation"
                      : liveData.riskLevel ===
                        "MEDIUM"
                      ? "⚠️ AI Monitoring Recommendation"
                      : "🟢 AI Recommendation"}
                  </h3>

                  <p>
                    {liveData.riskLevel ===
                    "CRITICAL"
                      ? "Activate emergency crowd control and redirect participants to available exits."
                      : liveData.riskLevel ===
                        "HIGH"
                      ? "Deploy additional volunteers and control participant entry."
                      : liveData.riskLevel ===
                        "MEDIUM"
                      ? "Monitor entrances and exits closely to prevent crowd buildup."
                      : "Crowd level is under control. Continue normal monitoring."}
                  </p>

                  <small>
                    AI decision based on
                    current crowd level:{" "}
                    <strong>
                      {
                        liveData.riskLevel
                      }
                    </strong>
                  </small>

                </div>

                <span className="priority">
                  INFO
                </span>

              </div>

            </div>

          </div>
        )}

        {/* ===================================================
            DIGITAL EVENT TWIN
        =================================================== */}

        {page === "twin" && (

          <div className="twin-page">

            <div className="twin-header">

              <div>

                <p className="twin-label">
                  DIGITAL EVENT TWIN
                </p>

                <h1>
                  🗺️ Venue Command Map
                </h1>

                <span>
                  Real-time venue monitoring
                  and crowd intelligence
                </span>

              </div>

              <div className="live">
                ● LIVE
              </div>

            </div>

            <div className="venue-map">

              <div className="map-title">
                MJC TECHFEST 2026 —
                LIVE VENUE
              </div>

              {/* MAIN GATE */}

              <div className="map-zone gate-zone">

                <div className="zone-icon">
                  🚪
                </div>

                <h3>MAIN GATE</h3>

                <strong>
                  {Math.max(
                    0,
                    Math.round(
                      liveData.currentAttendance *
                        0.15
                    )
                  )}
                </strong>

                <span>
                  People waiting
                </span>

              </div>

              {/* HALL A */}

              <div className="map-zone hall-a-zone">

                <div className="zone-icon">
                  🏛️
                </div>

                <h3>HALL A</h3>

                <strong>
                  {Math.round(
                    liveData.currentAttendance *
                      0.35
                  )}{" "}
                  / 200
                </strong>

                <span className="danger-text">

                  🔴{" "}

                  {Math.min(
                    100,
                    Math.round(
                      (liveData.currentAttendance *
                        0.35 /
                        200) *
                        100
                    )
                  )}
                  % Occupied

                </span>

              </div>

              {/* HALL B */}

              <div className="map-zone hall-b-zone">

                <div className="zone-icon">
                  🏛️
                </div>

                <h3>HALL B</h3>

                <strong>
                  {Math.round(
                    liveData.currentAttendance *
                      0.25
                  )}{" "}
                  / 200
                </strong>

                <span className="safe-text">

                  🟢{" "}

                  {Math.min(
                    100,
                    Math.round(
                      (liveData.currentAttendance *
                        0.25 /
                        200) *
                        100
                    )
                  )}
                  % Occupied

                </span>

              </div>

              {/* FOOD AREA */}

              <div className="map-zone food-zone">

                <div className="zone-icon">
                  🍴
                </div>

                <h3>FOOD AREA</h3>

                <strong>96</strong>

                <span>
                  Visitors
                </span>

              </div>

              {/* MAIN STAGE */}

              <div className="map-zone stage-zone">

                <div className="zone-icon">
                  🎤
                </div>

                <h3>MAIN STAGE</h3>

                <strong>
                  {Math.round(
                    liveData.currentAttendance *
                      0.4
                  )}
                </strong>

                <span>
                  Audience
                </span>

              </div>

            </div>

            {/* LEGEND */}

            <div className="map-legend">

              <h2>
                Crowd Status
              </h2>

              <div className="legend-items">

                <span>
                  🟢 Normal
                </span>

                <span>
                  🟡 Moderate
                </span>

                <span>
                  🔴 High Density
                </span>

              </div>

            </div>

            {/* AI */}

            <div className="twin-ai">

              <div className="twin-ai-icon">
                🤖
              </div>

              <div>

                <h3>
                  AI Recommendation
                </h3>

                <p>
                  Hall A is approaching
                  maximum capacity.
                  Consider redirecting
                  participants toward
                  Hall B to reduce crowd
                  density.
                </p>

              </div>

            </div>

          </div>
        )}

        {/* ===================================================
            EMERGENCY
        =================================================== */}

        {page === "emergency" && (

          <div className="emergency-page">

            <div className="twin-header">

              <div>

                <p className="twin-label">
                  EMERGENCY CONTROL SYSTEM
                </p>

                <h1>
                  🚨 Emergency Mode
                </h1>

                <span>
                  Rapid response and
                  emergency event
                  management
                </span>

              </div>

              <div className="live">
                ● READY
              </div>

            </div>

            {/* WARNING */}

            <div className="emergency-warning">

              <div className="warning-icon">
                🚨
              </div>

              <div>

                <h2>
                  Emergency Response
                  Center
                </h2>

                <p>
                  Activate emergency
                  protocols when immediate
                  action is required.
                </p>

              </div>

            </div>

            {/* EMERGENCY CARDS */}

            <div className="emergency-grid">

              {/* EVACUATION */}

              <div className="emergency-card">

                <span>👥</span>

                <h3>
                  Evacuation
                </h3>

                <p>
                  Guide participants to
                  safe exit points.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    alert(
                      "🚨 Evacuation protocol activated!"
                    )
                  }
                >
                  START EVACUATION
                </button>

              </div>

              {/* ALERT BROADCAST */}

              <div className="emergency-card">

                <span>📢</span>

                <h3>
                  Alert Broadcast
                </h3>

                <p>
                  Send an emergency
                  announcement to all
                  participants.
                </p>

                <button
                  type="button"
                  onClick={
                    activateEmergency
                  }
                >
                
                  🚨 SEND AI EMERGENCY ALERT
                </button>

              </div>

              {/* EXITS */}

              <div className="emergency-card">

                <span>🚪</span>

                <h3>
                  Emergency Exits
                </h3>

                <p>
                  Monitor and manage
                  emergency exit routes.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    alert(
                      "🚪 Emergency exit routes are now displayed!"
                    )
                  }
                >
                  VIEW EXITS
                </button>

              </div>

              {/* SECURITY */}

              <div className="emergency-card">

                <span>🛡️</span>

                <h3>
                  Security Response
                </h3>

                <p>
                  Coordinate security and
                  emergency teams.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    alert(
                      "🛡️ Security team has been contacted!"
                    )
                  }
                >
                  CONTACT SECURITY
                </button>

              </div>

            </div>

            {/* =================================================
                EMERGENCY API RESULT
            ================================================= */}

            {emergencyData && (

              <div
                style={{
                  margin: "20px 0",
                  padding: "20px",
                  borderRadius: "12px",
                  background: "#fff5f5",
                  border:
                    "2px solid #ff4d4d",
                  color: "#222",
                }}
              >

                <h2>
                  🚨 EMERGENCY ACTIVATED
                </h2>

                <p>
                  <strong>
                    Emergency:
                  </strong>{" "}
                  {
                    emergencyData.emergencyType
                  }
                </p>

                <p>
                  <strong>
                    Location:
                  </strong>{" "}
                  {
                    emergencyData.location
                  }
                </p>

                <p>
                  <strong>
                    Recommended Exit:
                  </strong>{" "}
                  {
                    emergencyData.recommendedExit
                  }
                </p>

                <p>
                  <strong>
                    Response Team:
                  </strong>{" "}
                  {emergencyData.assignedVolunteers?.join(
                    ", "
                  )}
                </p>

              </div>

            )}

            {/* STATUS */}

            <div className="emergency-status">

              <strong>
                ⚡ Emergency System Status
              </strong>

              <span>
                All emergency services
                are ready
              </span>

            </div>

          </div>
        )}

        {/* ===================================================
            ANALYTICS
        =================================================== */}

        {page === "analytics" && (

          <div className="analytics-page">

            <div className="twin-header">

              <div>

                <p className="twin-label">
                  EVENT ANALYTICS
                </p>

                <h1>
                  📊 Analytics
                </h1>

                <span>
                  Real-time event
                  performance insights
                </span>

              </div>

              <div className="live">
                ● LIVE
              </div>

            </div>

            {/* ANALYTICS CARDS */}

            <div className="analytics-cards">

              <div className="analytics-card">

                <p>
                  Current Participants
                </p>

                <h2>
                  {liveData.currentAttendance}
                </h2>

                <span>
                  Live attendance
                </span>

              </div>

              <div className="analytics-card">

                <p>
                  Current Occupancy
                </p>

                <h2>
                  {liveData.crowdPercentage}%
                </h2>

                <span>
                  Venue capacity used
                </span>

              </div>

              <div className="analytics-card">

                <p>
                  Available Capacity
                </p>

                <h2>
                  {Math.max(
                    0,
                    liveData.capacity -
                      liveData.currentAttendance
                  )}
                </h2>

                <span>
                  Participants remaining
                </span>

              </div>

              <div className="analytics-card">

                <p>
                  Event Health
                </p>

                <h2>
                  {Math.max(
                    0,
                    100 -
                      liveData.crowdPercentage
                  )}
                  %
                </h2>

                <span>
                  Based on current crowd
                </span>

              </div>

            </div>

            {/* CROWD ACTIVITY */}

            <div className="analytics-panel">

              <h2>
                📈 Crowd Activity
              </h2>

              <div className="chart">

                <div
                  className="bar"
                  style={{
                    height: "45%",
                  }}
                >
                  <span>
                    10 AM
                  </span>
                </div>

                <div
                  className="bar"
                  style={{
                    height: "60%",
                  }}
                >
                  <span>
                    11 AM
                  </span>
                </div>

                <div
                  className="bar"
                  style={{
                    height: "75%",
                  }}
                >
                  <span>
                    12 PM
                  </span>
                </div>

                <div
                  className="bar"
                  style={{
                    height: "90%",
                  }}
                >
                  <span>
                    1 PM
                  </span>
                </div>

                <div
                  className="bar"
                  style={{
                    height: "70%",
                  }}
                >
                  <span>
                    2 PM
                  </span>
                </div>

                <div
                  className="bar"
                  style={{
                    height: "82%",
                  }}
                >
                  <span>
                    3 PM
                  </span>
                </div>

              </div>

            </div>

            {/* VENUE PERFORMANCE */}

            <div className="analytics-panel">

              <h2>
                🏛️ Venue Performance
              </h2>

              <div className="venue-row">

                <span>
                  Hall A
                </span>

                <strong>
                  {Math.min(
                    100,
                    Math.round(
                      (liveData.currentAttendance *
                        0.35 /
                        200) *
                        100
                    )
                  )}
                  %
                </strong>

              </div>

              <div className="venue-row">

                <span>
                  Hall B
                </span>

                <strong>
                  {Math.min(
                    100,
                    Math.round(
                      (liveData.currentAttendance *
                        0.25 /
                        200) *
                        100
                    )
                  )}
                  %
                </strong>

              </div>

              <div className="venue-row">

                <span>
                  Main Stage
                </span>

                <strong>
                  {Math.min(
                    100,
                    Math.round(
                      liveData.currentAttendance *
                        0.4 /
                        500 *
                        100
                    )
                  )}
                  %
                </strong>

              </div>

              <div className="venue-row">

                <span>
                  Food Area
                </span>

                <strong>
                  48%
                </strong>

              </div>

            </div>

          </div>
        )}

        {/* ===================================================
            SETTINGS
        =================================================== */}

        {page === "settings" && (

          <div className="settings-page">

            <div className="settings-grid">

              {/* EVENT SETTINGS */}

              <div className="settings-card">

                <h2>
                  🎪 Event Settings
                </h2>

                <label>
                  Event Name
                </label>

                <input
                  type="text"
                  value="MJC TechFest 2026"
                  readOnly
                />

                <label>
                  Maximum Participants
                </label>

                <input
                  type="number"
                  value="800"
                  readOnly
                />

              </div>

              {/* NOTIFICATIONS */}

              <div className="settings-card">

                <h2>
                  🔔 Notifications
                </h2>

                <div className="setting-row">

                  <span>
                    AI Alerts
                  </span>

                  <input
                    type="checkbox"
                    defaultChecked
                  />

                </div>

                <div className="setting-row">

                  <span>
                    Emergency Notifications
                  </span>

                  <input
                    type="checkbox"
                    defaultChecked
                  />

                </div>

                <div className="setting-row">

                  <span>
                    System Updates
                  </span>

                  <input
                    type="checkbox"
                    defaultChecked
                  />

                </div>

              </div>

              {/* AI CONFIGURATION */}

              <div className="settings-card">

                <h2>
                  🤖 AI Configuration
                </h2>

                <div className="setting-row">

                  <span>
                    AI Crowd Prediction
                  </span>

                  <input
                    type="checkbox"
                    defaultChecked
                  />

                </div>

                <div className="setting-row">

                  <span>
                    Smart Alerts
                  </span>

                  <input
                    type="checkbox"
                    defaultChecked
                  />

                </div>

              </div>

              {/* SECURITY */}

              <div className="settings-card">

                <h2>
                  🔐 Security
                </h2>

                <div className="security-status">

                  <span>
                    ●
                  </span>

                  <div>

                    <strong>
                      System Secure
                    </strong>

                    <p>
                      All security systems
                      are operational.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

      </main>

    </div>
  );
}

export default App;