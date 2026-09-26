// Central error handler. Never leaks stack traces, secrets, or raw DB errors to clients.
const errorHandler = (err, req, res, next) => {
  console.error(err.stack || err.message);

  let status = err.statusCode || 500;
  let message = err.message || "Internal server error";

  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(", ");
  }
  if (err.code === 11000) {
    status = 409;
    message = "A record with that value already exists.";
  }
  if (err.name === "CastError") {
    status = 400;
    message = "Invalid identifier supplied.";
  }

  res.status(status).json({
    error: process.env.NODE_ENV === "production" && status === 500 ? "Internal server error" : message,
  });
};

export default errorHandler;
