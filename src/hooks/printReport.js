// utils/printReport.js
export const printReport = (elementId) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const printContents = element.innerHTML;

  // Grab all stylesheet links (Tailwind, etc.)
  const styles = Array.from(
    document.querySelectorAll("link[rel=stylesheet], style")
  )
    .map((node) => node.outerHTML)
    .join("\n");

  const printWindow = window.open("", "", "width=900,height=650");

  printWindow.document.write(`
    <html>
      <head>
        <title>Student Report</title>
        ${styles}  <!-- Inject app styles -->
        <style>
          body { margin: 20px; }
          @page { size: A4; margin: 15mm; }
          img { max-width: 100%; height: auto; }
        </style>
      </head>
      <body>
        <div id="print-container">${printContents}</div>
      </body>
    </html>
  `);

  printWindow.document.close();

  // Give styles a chance to load
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };
};
