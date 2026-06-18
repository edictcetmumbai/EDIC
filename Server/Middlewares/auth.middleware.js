exports.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        return res.status(401).json({
            error: true,
            message: 'You must be logged in to perform this action'
        });
    }
};