exports.index = (req,res)=>{
  return res.render('index');
}
exports.login = (req,res)=>{
  return res.render('login');
}
exports.mealPlanner = (req,res)=>{
  return res.render('meal-planner');
}
exports.temp = (req,res)=>{
  return res.render('temp');
}
exports.humi = (req,res)=>{
  return res.render('humi');
}
exports.gas = (req,res)=>{
  return res.render('gas');
}
exports.fire = (req,res)=>{
  return res.render('fire');
}
