const jwt = require('jsonwebtoken');

const required = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch {
        return res.status(500).send("Internal Server Error: Some error occured");
    }
};

const optional = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        req.userId = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch {
        return res.status(500).send("Internal Server Error: Some error occurred");
    }
};

module.exports = {
    required,
    optional,
};
