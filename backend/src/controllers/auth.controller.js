const authService = require('../services/auth.service');

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  // sameSite: 'lax',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

exports.register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ message: 'Registered successfully', user });
  } catch (err) {
    console.log(err)
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, user } = await authService.login(req.body);
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
    res.json({ accessToken, user });
  } catch (err) {
    next(err);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const incoming = req.cookies.refreshToken;
    const { accessToken, user } = await authService.refresh(incoming);
    res.json({ accessToken, user });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  res.clearCookie('refreshToken', { path: '/api/auth' });
  res.json({ message: 'Logged out successfully' });
};

exports.managers = async (req, res, next) => {
  try {
    const managers = await authService.listManagers();
    res.json(managers);
  } catch (err) {
    next(err);
  }
};

exports.teamLeads = async (req, res, next) => {
  try {
    res.json(await authService.listTeamLeads());
  } catch (err) {
    next(err);
  }
};