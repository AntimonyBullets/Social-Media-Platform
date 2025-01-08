import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/temp'); // initial parameter is 'null', this is syntax. Need to go through multer documentation to learn more about this.
    }, //to set the destination in our server where the file will be temporarily saved. (that destination is given as second parameter of cb);
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    } //to set name of the file to be saved in our server.
  })
  
export const upload = multer({ storage: storage });