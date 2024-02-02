require('dotenv').config()
const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const {Op} = require("sequelize")
const jwt = require("jsonwebtoken")
const User = require("../models/User")

const userController = {
// Per ricevere la lista di tutti gli utenti
usersList: async (req, res) => {
    const userId = req.params.id
    try {
        const getUsers = await User.findAll(userId)
        res.status(200).json(getUsers)
    } catch(err) {
        res.status(500).json({error: "Impossibile ricevere la lista",})
    }
},
singleUser: async(req,res) => {
    const userId = req.params.userId
    try {
        const getUser = await User.findByPk(userId)
        if (getUser) {
            res.json(getUser)
        } else {
            res.status(404).json({message: "Utente non trovato"})
        }
    } catch(err) {
        console.error(err);
    }
},


signup: async(req,res) => {
    const {username, email, password} = req.body
    try {
        const existingUser = await User.findOne({where: {[Op.or]: [{ username },{ email }]}});
        if(existingUser) {
            return res.status(400).json({error: "Utente già registrato"})
        }
        const newUser = await User.create({username, email, password})
        // Crea un token JWT
        const token = jwt.sign(
            { userId: newUser.id }, // payload
           process.env.JWT_SECRET,
           {expiresIn: '3h'}
        );
        res.cookie('token', token, { httpOnly: true, domain: '.vercel.app'});
        req.session.auth = true
        res.status(201).json({message: "Registrazione effettuata con successo", newUser, token})
    } catch(err) {
        console.error("Errore durante la creazione dell'utente");
        res.status(500).json({error: "Errore interno del server", err})
    }
},
login: async(req,res) => {
    const {email, password} = req.body
    try {
        const existingUser = await User.findOne({where: {[Op.or]: [{ email },{ password }]}})
        if(existingUser) {
            const passwordMatch = await bcrypt.compare(password, existingUser.password)
            if (passwordMatch) {
                // Crea un token JWT
                const token = jwt.sign(
                    { userId: existingUser.id }, // payload
                    process.env.JWT_SECRET ,// segreto
                    {expiresIn: '3h'}
                );
                res.cookie('token', token, { httpOnly: true, domain: '.vercel.app'});
                req.session.auth = true
                res.status(200).json({message:"Accesso effettuato", token})
            } else {
                return res.status(401).json({message: "Dati non corretti"})
            }
        } else {
            return res.status(401).json({error: "Dati non corretti"})
        }
    } catch(err) {
        console.error("Errore durante l'accesso");
        return res.status(500).json({error: "Errore interno del server"})
    }
},
// Per permettere all'utente di scollegarsi
logout: async(req,res) => {
    req.session.auth = false
    try {
        res.status(200).json({message: "Logout effettuato con successo"})
    } catch(err) {
        res.status(500).json({error: "Errore nella disconnessione"})
    }
},

auth: async (req, res) => {
    try {
      const token = req.cookies.token; // Assume the token is stored in a cookie named 'token'
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded) {
        res.status(200).json({ message: "Accesso consentito all'area riservata", token });
      } else {
        res.status(401).json({ error: "Non autorizzato: effettua l'accesso" });
      }
    } catch (err) {
      console.error("Errore durante l'accesso all'area riservata", err);
      res.status(500).json({ error: "Errore interno del server", err });
    }
  }
}

module.exports = userController