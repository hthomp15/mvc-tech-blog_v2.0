const router = require('express').Router()
const { User } = require('../../models')
const bcrypt = require('bcrypt')

router.get('/', async (req, res) => {
    try {
        const dbUserData = await User.findAll()
        res.status(200).json(dbUserData)
    } catch (err) {
        console.error(err)
        res.status(500).json(err)
    }
})

router.get('/:id', async (req, res) => {
    try {
        const dbUserData = await User.findOne({
            where: {
                id: req.params.id
            }
        })
        if (!dbUserData) {
            res.status(404).json({ message: 'No user found with this id' })
            return
        }
        res.status(200).json(dbUserData)
    } catch (err) {
        console.error(err)
        res.status(500).json(err)
    }
})

router.post('/', async (req, res) => {
    try {
        const dbUserData = await User.create({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        })
        req.session.save(() => {
            req.session.user_id = dbUserData.id,
                req.session.username = dbUserData.username,
                req.session.loggedIn = true

            res.status(200).json(dbUserData)
        })
    } catch (err) {
        console.error(err)
        res.status(500).json(err)
    }
})

router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({
            where: {
                username: req.body.username
            }
        })
        if (!user) {
            req.status(400).json({ message: 'Username not found!' })
            return
        }
        const validPassword = user.checkPassword(req.body.password, user.dataValues.password)
        if (!validPassword) {
            res.status(400).json({ message: 'Incorrect password!' })
            return
        }

        req.session.user_id = user.id
        req.session.username = user.username
        req.session.loggedIn = true
        req.session.save(() => {
            res.json({ user: user, message: 'You are now logged in!' })
        })
    } catch (err) {
        console.error(err)
        res.status(500).json(err)
    }
})

router.post('/logout', async (req, res) => {
    if (req.session.loggedIn) {
        req.session.destroy(() => {
            res.status(204).end()
        })
    } else {
        res.status(404).end()
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const user = await User.destroy({
            where: {
                id: req.params.id
            }
        })
        if (!user) {
            res.status(404).json({ message: 'No user found with this id' })
            return
        }
        res.status(200).json(user)
    } catch (err) {
        console.error(err)
        res.status(500).json(err)
    }
})
module.exports = router