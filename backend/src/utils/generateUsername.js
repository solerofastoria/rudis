exports.generateUsername = (email) => {
  if (!email) return "user" + Math.floor(Math.random() * 100000);

  const base = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
  const random = Math.floor(Math.random() * 10000);

  return `${base}_${random}`;
};
