
const jimp = require('jimp')

const imgResized = async (imgName) => {
  const uploadedImg = await jimp.read(imgName)
  await uploadedImg.resize(250, 250) // resize

  await uploadedImg.writeAsync(imgName) // save
}

module.exports = {
  imgResized
}
