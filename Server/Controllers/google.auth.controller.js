 const loginSuccess = (req , res) => {
  if(req.user){
      res.status(200).json({
        error: false,
        message: 'Login successful',
        user: req.user
      })
    }
      else{
        res.status(401).json({
          error: true,
          message: 'Not authorised'
        })
      }
}

 const loginFailed = (req , res) => {
 res.status(401).json({
    error: true,
    message: 'Login failed'
  })
}
 const logout = (req , res) => {
   req.logout((err) => {
    if (err) {
      console.error('Error occurred while logging out:', err);
      res.status(500).json({ error: true, message: 'Logout failed' });
    }
  });
  res.redirect(process.env.CLIENT_URL);
}

module.exports = {loginFailed , loginSuccess , logout};