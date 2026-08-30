const userRepo = require('../repositories/user.repository');
const ApiError = require('../utils/apiError');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken} = require('../utils/jwt.util');

function buildPayload(user) {
  return {id: user._id, role: user.role}
}

function sanitize(user){
  return { id: user._id, username: user.username, email: user.email, role: user.role};
}

exports.register = async ({username, email, password, role, reportsTo}) => {
  const existingEmail = await userRepo.findByEmail(email);
  if(existingEmail) throw new ApiError(409, 'Email already registered');

  const existingUsername = await userRepo.findByUsername(username);
  if(existingUsername) throw new ApiError(409, 'Username already taken');

  if(role !== 'manager'){
    if(!reportsTo) throw new ApiError(400, `reportsTo is required for role '${role}'`);
    const parent = await userRepo.findById(reportsTo) // doubt
    if(!parent) throw new ApiError(400, 'Selected manager/team lead does not exist');

    const expectedParentRole = role === 'teamlead' ? 'manager' : 'teamlead';
    if(parent.role !== expectedParentRole) {
      throw new ApiError(400, `A ${role} must report to a ${expectedParentRole}`)
    }
  }

  const user = await userRepo.create({
    username,
    email,
    password,
    role,
    reportsTo: role === 'manager' ? null : reportsTo
  })

  return sanitize(user)
}


exports.login = async ({email, password}) => {
  const user = await userRepo.findByEmail(email, true);
  if(!user) throw new ApiError(401, 'Invalid Email or Password')

  const isMatch = await user.comparePassword(password);
  if(!isMatch) throw new ApiError(401, 'Invalid email or password');

  const accessToken = generateAccessToken(buildPayload(user));
  const refreshToken = generateRefreshToken(buildPayload(user));

  return {accessToken, refreshToken, user: sanitize(user)};
}

exports.refresh = async (incomingToken) => {
  if (!incomingToken) throw new ApiError(401, 'Refresh token missing');

  let decoded;
  try {
    decoded = verifyRefreshToken(incomingToken);
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired refresh token, please log in again');
  }

  const user = await userRepo.findById(decoded.id);
  if(!user) throw new ApiError(401, 'User no longer exists');
  
  const accessToken = generateAccessToken(buildPayload(user));
  return { accessToken, user: sanitize(user) }
}

exports.listManagers = () => userRepo.findManagers();
exports.listTeamLeads = () => userRepo.findTeamLeads()