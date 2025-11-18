exports.success = (res, data = null, message = "OK", status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
};

exports.error = (res, message = "Ошибка", status = 400, data = null) => {
  return res.status(status).json({
    success: false,
    message,
    data,
  });
};