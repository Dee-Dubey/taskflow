const userService = require('../services/user.service');

exports.listUsers = async (req, res, next) => {
  try {
    res.json(await userService.listVisibleUsers(req.user));
  } catch (err) {
    next(err);
  }
};

exports.listAssignable = async (req, res, next) => {
  try {
    res.json(await userService.listAssignableUsers(req.user));
  } catch (err) {
    next(err);
  }
};

exports.getTeamOverview = async (req, res, next) => {
  try {
    const teamOverviews = await userService.getTeamOverview(req.user)
    res.json(teamOverviews)
  } catch (error) {
    console.log(error)
    next(error)
  }
}

exports.getUsersOverview = async (req, res, next) =>{
  try {
    const userOverview = await userService.getUsersOverview(req.user);
    res.json(userOverview);
  } catch (error) {
    next(error)
  }
}