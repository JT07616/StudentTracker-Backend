// Middleware za obradu grešaka na serveru
const errorHandler = (err, req, res, next) => {
  console.log(err);
  res.status(500).json({ message: "Greška na poslužitelju" });
};

export default errorHandler;
