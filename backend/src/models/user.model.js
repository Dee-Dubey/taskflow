const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: [3, 'Username must be atleast 3 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  role: {
    type: String,
    enum: ['manager', 'teamlead', 'employee'],
    required: true
  },
  reportsTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true }
)

userSchema.pre('save', async function (next) {
  if(!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
})

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model('User', userSchema);