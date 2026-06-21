// Middleware koji ispisuje svaki zahtjev u konzolu
const requestLogger = (req, res, next) => {
  const now = new Date();
  const date =
    now.getFullYear() + "-" +
    String(now.getMonth() + 1).padStart(2, "0") + "-" +
    String(now.getDate()).padStart(2, "0");

  const time =
    String(now.getHours()).padStart(2, "0") + ":" +
    String(now.getMinutes()).padStart(2, "0") + ":" +
    String(now.getSeconds()).padStart(2, "0");

  console.log(`[student-tracker] [${date} ${time}] ${req.method} ${req.originalUrl}`,);

  next();
};

export default requestLogger;
