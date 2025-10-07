import Admin from '../models/admin_users.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const loginAdmin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(404).json({ message: 'Admin not found' });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: admin._id, email: admin.email }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.cookie('adminToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(200).json({ message: 'Login successful', admin: { id: admin._id, email: admin.email } });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const logoutAdmin = (req, res) => {
    res.clearCookie('adminToken');
    res.status(200).json({ message: 'Logged out successfully' });
};
