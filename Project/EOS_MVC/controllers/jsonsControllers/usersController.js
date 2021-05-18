const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const tablaJson = require("../../data/jsonManager");
const usersJson = tablaJson("users");
const db = require("../../database/models");

const usersController = {

  listAll: function (req, res) {
    if(req.session.adminLogged){

    let users = usersJson.all()
    return res.render("./users/list", { users });
      
    }
    else
    return res.redirect("/");
  },

  show: (req, res) => {
    let userDetail = usersJson.find(req.params.idUser);

    res.render("./users/profile", { userDetail });
  },

  register: function (req, res) {
    return res.render("./users/register");
  },

  saveUser: function (req, res) {
    // Validacion
    let errors = validationResult(req);

    let userInDb = usersJson.findByField("email", req.body.email);
    if (userInDb) {
      return res.render("users/register", {
        errors: {
          email: {
            msg: "* Este email ya esta registrado",
          },
        },
        oldData: req.body,
      });
    }

    if (errors.isEmpty()) {
      // Almaceno los datos del producto
      
      const user = {
        
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        dateOfBirth: req.body.dateOfBirth,
        email: req.body.email,
        phone: req.body.phone,
        password: bcrypt.hashSync(req.body.password, 10),
        admin: "false",
        active: "true",
      };
      
      usersJson.create(user);

      db.User.create({
          
        first_name: req.body.firstName,
        last_name: req.body.lastName,
        date_of_birth: req.body.dateOfBirth,
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.password,           
            
      }); 

      res.redirect("profile");

    } else {
      return res.render("users/register", {
        errors: errors.mapped(),
        old: req.body,
      });
    }
  },

  profile: function (req, res) {
  
    if(req.session.adminLogged){
     return(res.redirect("/admin")); 
    } 
    
    res.render("users/profile", {
      user: req.session.userLogged,
    });
  },

  findById: (req, res) => {
    let userDetail = usersJson.find(req.params.idUser);
    //"./users/detail"
    res.render("users/detail", { userDetail });
  },

  updateUser : function (req,res){

    if(req.session.adminLogged || req.session.userLogged){
      let userId = req.params.idUser;
      //busco el id en la lista 
      let userToEdit = usersJson.find(userId);
     
      res.render("./users/update",{userToEdit});
      
    }
    else
     return res.redirect("/");
  },

  updatedUser: function(req,res){

    let errors = validationResult(req);

    
    if (req.session.adminLogged) {
      // Validacion
      let errors = validationResult(req);

      const userToUpdate = usersJson.find(req.params.idUser);

      if (errors.isEmpty()) {
        // Almaceno los datos del user
        userToUpdate.image = req.file.filename;
        userToUpdate.firstName = req.body.firstName;
        userToUpdate.lastName = req.body.lastName;
        userToUpdate.dateOfBirth = req.body.dateOfBirth;
        userToUpdate.email = req.body.email;
        userToUpdate.password = req.body.password;
        userToUpdate.phone = req.body.phone;
        userToUpdate.active = "true";
      }

      usersJson.update(userToUpdate);

      db.User.update({
        image: req.file.filename,
        first_name: req.body.firstName,
        last_name: req.body.lastName,
        date_of_birth: req.body.dateOfBirth,
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.password, 
        }, { where: { id_user: req.params.idUser}}
      );

     
      res.redirect("/");
    } else {
      return res.render("users/update", {
        errors: errors.mapped(),
        old: req.body,
      });
    }
  },


  delete: function(req,res){
    
    if(req.session.adminLogged){
      
      usersJson.delete(req.params.idUser);
      
      db.User.destroy({
        where: { id_user: req.params.idUser}
       
      });
      
      res.redirect("/admin");
      
      }
      else
       return res.redirect("/");

  },

};

module.exports = usersController;