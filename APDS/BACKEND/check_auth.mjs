import jwt from "jsonwebtoken";

const checkauth = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, "supersecret");
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Authentication failed" });
    }
};

export default checkauth;