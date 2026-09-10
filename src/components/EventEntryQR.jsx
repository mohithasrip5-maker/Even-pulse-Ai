import { QRCodeCanvas } from "qrcode.react";

function EventEntryQR() {
  const websiteURL = `${window.location.origin}/?entry=1`;

  return (
    <div className="event-entry-qr">
      <h2>📱 Scan to Enter EventPulse</h2>

      <p>
        Scan this QR code to open the EventPulse event website.
      </p>

      <a
  href={websiteURL}
  target="_blank"
  rel="noopener noreferrer"
  className="event-qr-link"
>
  <QRCodeCanvas
    value={websiteURL}
    size={260}
    bgColor="#ffffff"
    fgColor="#111827"
    level="H"
  />
</a>
      <p className="qr-url">{websiteURL}</p>
    </div>
  );
}

export default EventEntryQR;