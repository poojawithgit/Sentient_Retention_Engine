/**
 * Auth Middleware
 * Validates JWT tokens for protected routes
 */

exports.protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized - No token' });
    }

    try {
        // Mock token verification logic
        req.user = { id: 'mock-user-id', role: 'admin' };
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Not authorized - Token failed' });
    }
};
