require('dotenv').config();
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET;
const authMiddleware = (req, res, next) => {
    try {
        console.log(req.headers);
        
        const token = req.headers.authorization.split(" ")[1];
        console.log(token);
        
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }
        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded;
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = authMiddleware;