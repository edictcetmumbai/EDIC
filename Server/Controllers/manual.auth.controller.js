const User = require('../Services/DB/Schema/user.schema.js');
const bcrypt = require('bcryptjs');
exports.Signup = async (req , res) => {
 try{
  const {email , password , name} = req.body;
  const existingUser = await User.findOne({ email });
  if(existingUser){
    return res.status(400).json({message : "Email already registered"});
  }
  if (!email.endsWith('@tcetmumbai.in')){
    return res.status(400).json({message : "Email must be of domain tcetmumbai.in"});
  }  
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({name , email , password: hashedPassword});
  await newUser.save();
  req.login(newUser, (err) => {
    if (err) {
      console.error('Error occurred during login after signup:', err);
      return res.status(500).json({ error: true, message: 'Login after signup failed' });
    }   
    res.status(200).json({ error: false, message: 'Signup and login successful', user: {id : newUser._id , email: newUser.email , name: newUser.name} });
  }); 
 }  
 catch(err){
  console.error(err);
  res.status(500).json({error:true , message:'Internal server error'});
 }
}
exports.login = async (req, res) => {
    res.status(200).json({
        error: false,
        message: 'Login successful',
        user: {
            id: req.user._id,
            email: req.user.email,
            name: req.user.name
        }
    });
};