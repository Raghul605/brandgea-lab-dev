import jwt from 'jsonwebtoken';

export default function adminAuth(req, res, next) {
    const token = req.cookies.adminToken;
    if (!token) return res.status(401).json({ message: 'Not authorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
}
