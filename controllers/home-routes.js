const router = require('express').Router()
const { Post, User, Comment } = require('../models')
const sequelize = require('../config/connection')

router.get('/', async (req, res) => {
    console.log(req.session)
    try {
        const dbPostData = await Post.findAll({
            attributes: ['id', 'title', 'post_content', 'created_at'],
            include: [
                {
                    model: User,
                    attributes: ['username']
                }
            ]
        })
        const posts = dbPostData.map(post => post.get({ plain: true }))
        res.render('homepage', { loggedIn: req.session.loggedIn, posts })
    } catch (err) {
        console.error(err)
        res.status(500).json(err)
    }
})

router.get('/post/:id', async (req, res) => {
    try {
        const dbPostData = await Post.findOne({
            where: {
                id: req.params.id
            },
            attributes: ['id', 'title', 'post_content', 'created_at'],
            include: [
                {
                    model: Comment,
                    attributes: ['comment_text', 'user_id', 'created_at'],
                    include: {
                        model: User,
                        attributes: ['username']
                    }
                },
                {
                    model: User,
                    attributes: ['username']
                }
            ]
        })
        if (!dbPostData) {
            res.status(404).json({ message: 'No post found with this id' })
            return
        }
        const post = dbPostData.get({ plain: true })
        res.render('single-post', { post, loggedIn: req.session.loggedIn })
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
})

router.get('/login', async (req, res) => {
    try {
        if (req.session.loggedIn) {
            res.redirect('/')
            return
        }
        res.render('login')
    } catch (err) {
        console.error(err)
        res.status(500).json(err)
    }
})

router.get('/signup', async (req, res) => {
    try {
        res.render('signup')
    } catch (err) {
        console.error(err)
        res.status(500).json(err)
    }
})


module.exports = router