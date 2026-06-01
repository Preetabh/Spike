import jwt from "jsonwebtoken";

export const generateJWT = (id) => {
  return jwt.sign(
    { userId: id },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};
