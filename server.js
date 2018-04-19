require('dotenv').config()

const fs = require('fs')
const express = require('express')
const ejs = require('ejs')
const Instagram = require('node-instagram').default
const RSS = require('rss')

const userManager = require('./lib/UserManager')
const PhotosManager = require('./lib/PhotosManager')

// Create a new instance.
const instagram = new Instagram({
  clientId: process.env.INSTAGRAM_CLIENT_ID,
  clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
})

const photosManager = new PhotosManager(userManager)
photosManager.start()

const app = express()
const port = process.env.PORT || 3001

function rssItemForPhoto(photo) {
  const item = {}
  const custom_elements = []

  custom_elements.push({'instagrammer:likes': photo.likes.count})
  custom_elements.push({'instagrammer:comments': photo.comments.count})
  custom_elements.push({'instagrammer:username': photo.user.username})
  custom_elements.push({'instagrammer:full_name': photo.user.full_name})
  custom_elements.push({'instagrammer:avatar': photo.user.profile_picture})

  if (photo.caption) {
    item.title = photo.caption.text
    custom_elements.push({'instagrammer:caption': photo.caption.text})
  }

  if (photo.location) {
    item.description = photo.location.name
    custom_elements.push({'instagrammer:location': photo.location.name})
  }

  item.image_url = photo.images.standard_resolution.url
  item.guid = photo.id
  item.author = photo.user.full_name
  item.date = new Date(parseInt(photo.created_time, 10) * 1000)
  item.enclosure = {url: photo.images.standard_resolution.url, type: 'image/jpeg'}
  item.custom_elements = custom_elements

  return item
}

app.get('/', (req, res) => {
  res.redirect('/all')
})

app.get('/all.:extension?', (req, res) => {
  let photos = []
  userManager.users.forEach(user => {
    photos = photos.concat(user.photos)
  })

  photos.sort(function(a, b) {
    return b.created_time - a.created_time
  })

  photos = photos.slice(0, 20)

  if (req.params.extension === 'rss') {
    const feed = new RSS({
      title: `Instagrammer`,
      description: `Instagram feed`,
      generator: 'Instagrammer',
      pubDate: new Date(),
    })

    photos
      .map(photo => {
        return rssItemForPhoto(photo)
      })
      .forEach(item => {
        feed.item(item)
      })

    res.send(feed.xml())
  } else if (req.params.extension === 'json') {
    res.json(photos)
  } else {
    const rssURL = req.originalUrl + '.rss'
    const jsonURL = req.originalUrl + '.json'
    ejs.renderFile('index.ejs', {photos, rssURL, jsonURL}, {}, (err, str) => {
      console.log(err)
      res.send(str)
    })
  }
})

app.get('/:username.:extension?', (req, res) => {
  const user = userManager.findUserByUsername(req.params.username)

  if (!user) {
    res.status(404).send('Not found')
    return
  }

  const photos = user.photos.slice(0, 20)

  if (req.params.extension === 'rss') {
    const feed = new RSS({
      title: `Instagrammer: ${user.username}`,
      description: `Instagram feed for ${user.username}`,
      generator: 'Instagrammer',
      pubDate: new Date(),
    })

    photos
      .map(photo => {
        return rssItemForPhoto(photo)
      })
      .forEach(item => {
        feed.item(item)
      })

    res.send(feed.xml())
  } else if (req.params.extension === 'json') {
    res.json(photos)
  } else {
    const rssURL = req.originalUrl + '.rss'
    const jsonURL = req.originalUrl + '.json'
    ejs.renderFile('index.ejs', {photos, rssURL, jsonURL}, {}, (err, str) => {
      res.send(str)
    })
  }
})

app.get('/auth/instagram', (req, res) => {
  const redirectUri = `${req.protocol}://${req.headers.host}/auth/instagram/callback`
  res.redirect(instagram.getAuthorizationUrl(redirectUri, {scope: ['basic']}))
})

app.get('/auth/instagram/callback', async (req, res) => {
  const redirectUri = `${req.protocol}://${req.headers.host}/auth/instagram/callback`

  try {
    const data = await instagram.authorizeUser(req.query.code, redirectUri)
    const user = data.user
    user.access_token = data.access_token

    const existingUser = userManager.findUser(user.id)

    if (existingUser) {
      userManager.updateUser(existingUser, user)
    } else {
      userManager.addUser(user)
    }

    photosManager.downloadPhotos(() => {
      res.redirect('/')
    })
  } catch (err) {
    res.json(err)
  }
})

app.listen(port, () => console.log(`Listening on port ${port}`))
