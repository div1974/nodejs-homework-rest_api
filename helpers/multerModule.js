const multer = require('multer')
const path = require('path')

const uploadDir = path.join(process.cwd(), 'tmp')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const now = new Date()
    const fileName = `${now.getTime()}-${file.originalname}`

    cb(null, fileName)
  },
  limits: {
    fileSize: 2000000
  }
})

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.includes('image')) {
      cb(null, true)
      return
    }
    cb(null, false)
  }
})

module.exports = {
  upload
}
