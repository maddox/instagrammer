const Instagram = require('node-instagram').default

class PhotosManager {
  constructor(userManager) {
    this.userManager = userManager
  }

  start() {
    this.downloadPhotos()

    setInterval(() => {
      this.downloadPhotos()
    }, 600000) // every 10 minutes
  }

  downloadPhotos(callback) {
    if (this.userManager.users.length === 0) {
      return
    }

    this.userManager.users.forEach(user => {
      console.log(`looking up photos for ${user.full_name}`)

      const instagram = new Instagram({
        clientId: process.env.INSTAGRAM_CLIENT_ID,
        clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
        accessToken: user.access_token,
      })

      instagram.get('users/self/media/recent', (err, data) => {
        if (err) {
          console.log(err)
          if (callback) {
            callback()
          }
        } else {
          data.data.forEach(photo => {
            const existingPhoto = this.userManager.findPhotoForUser(user, photo.id)
            if (existingPhoto) {
              this.userManager.updatePhoto(existingPhoto, photo)
            } else {
              this.userManager.addPhotoForUser(user, photo)
            }
          })

          if (callback) {
            callback()
          }
        }
      })
    })
  }
}

module.exports = PhotosManager
