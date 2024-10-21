const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class TgService {
  createPhotoUrl(photo) {
    try {
      if (photo && photo.strippedThumb) {
        // // console.log('photo', JSON.stringify(photo?.strippedThumb?.data));
        // // const data = photo.strippedThumb.slice(8, photo.strippedThumb.length)

        // const regex = /\[(.*?)\]/g;
        // const string = JSON.stringify(photo.strippedThumb)
        // const matches = string.match(regex);
        // console.log('matches', matches);

        // const data = matches.map(match => match.slice(1, -1))[0]; // Удаляем квадратные скобки
        // // const data = 'qwert'
        // // console.log(values); // Вывод: ["значением"]
        // // const data = JSON.stringify(photo.strippedThumb)
        // // const data = photo.strippedThumb
        // console.log('photo', data);
        // const photoBuffer = Buffer.from(data);
        // const base64Image = photoBuffer.toString('base64');
        // const imageUrl = `data: image/jpeg;base64,${base64Image}`;

        // // Теперь вы можете использовать imageUrl для отображения изображения
        // console.log(imageUrl);
        // return imageUrl
      } else {
        console.log("У этого чата нет фотографии.");
      }
    } catch (error) {
      console.log('photoUrl error');

    }

  }
  // async addChat(data) {
  //   const chat = await prisma.chat.create({
  //     data
  //   });
  //   return chat
  // }

}

module.exports = new TgService();

