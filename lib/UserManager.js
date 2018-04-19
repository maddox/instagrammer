let fs = require('fs')

class UserManager {
  constructor() {
    this.userDataPath = __dirname + '/../users.json'
    this.users = []
    this.loadUsers()
  }

  loadUsers() {
    if (fs.existsSync(this.userDataPath)) {
      this.users = JSON.parse(fs.readFileSync(this.userDataPath, 'utf8'))
    } else {
      this.saveUsers()
    }
  }

  saveUsers() {
    fs.writeFileSync(this.userDataPath, JSON.stringify(this.users, null, '  '), 'utf8')
  }

  findUser(id) {
    let user = this.users.find(x => x.id == id)
    return user
  }

  findUserByUsername(username) {
    let user = this.users.find(x => x.username == username)
    return user
  }

  addUser(user) {
    user.photos = []
    this.users.push(user)
    this.saveUsers()
  }

  updateUser(user, newUserData) {
    Object.assign(user, newUserData)
    this.saveUsers()
  }

  removeUser(user) {
    const index = this.users.indexOf(user)
    this.users.splice(index, 1)
    this.saveUsers()
  }

  findPhotoForUser(user, id) {
    let photo = user.photos.find(x => x.id == id)
    return photo
  }

  addPhotoForUser(user, photo) {
    user.photos.push(photo)
    this.saveUsers()
  }

  updatePhoto(photo, newPhotoData) {
    Object.assign(photo, newPhotoData)
    this.saveUsers()
  }
}

let userManager = new UserManager()

module.exports = userManager
