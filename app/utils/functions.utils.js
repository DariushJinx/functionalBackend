const JWT = require("jsonwebtoken");
const UserModel = require("../http/models/user/user.model");
const {
  ACCESS_TOKEN_SECRET_KEY,
  REFRESH_TOKEN_SECRET_KEY,
} = require("./constans.utils");
const createHttpError = require("http-errors");
const path = require("path");
const fs = require("fs");
// const ProductModel = require("../http/models/product/product.model");

function RandomNumberGenerator() {
  return ~~(Math.random() * 90000 + 10000);
}

function SignAccessToken(userID) {
  return new Promise(async (resolve, reject) => {
    const user = await UserModel.findById(userID);
    const payload = {
      mobile: user.mobile,
    };
    const options = {
      expiresIn: "1d",
    };
    JWT.sign(payload, ACCESS_TOKEN_SECRET_KEY, options, (err, token) => {
      if (err) reject(createError.InternalServerError("خطای سروری"));
      resolve(token);
    });
  });
}

function SignRefreshToken(userID) {
  return new Promise(async (resolve, reject) => {
    const user = await UserModel.findById(userID);
    const payload = {
      mobile: user.mobile,
    };
    const options = {
      expiresIn: "1y",
    };
    JWT.sign(payload, REFRESH_TOKEN_SECRET_KEY, options, async (err, token) => {
      if (err) throw createHttpError.InternalServerError("خطای سرور");
      resolve(token);
    });
  });
}

// function verifyRefreshToken(token) {
//   return new Promise(async (resolve, reject) => {
//     JWT.verify(token, REFRESH_TOKEN_SECRET_KEY, async (err, payload) => {
//       if (err)
//         throw reject(createHttpError.Unauthorized("وارد حساب کاربری خود شوید"));
//       const { mobile } = payload || {};
//       const user = await UserModel.findOne({ mobile }, { password: 0, otp: 0 });
//       if (!user)
//         throw reject(
//           createHttpError.Unauthorized("حساب کاربری مورد نظر یافت نشد")
//         );
//       const refreshToken = await redisClient.get(String(user?._id));
//       if (!refreshToken)
//         throw reject(
//           createHttpError.Unauthorized("ورود مجدد به حساب کاربری انجام نشد")
//         );
//       if (refreshToken === token) return resolve(mobile);
//       reject(
//         createHttpError.Unauthorized("ورود مجدد به حساب کاربری انجام نشد")
//       );
//     });
//   });
// }

function copyObject(object) {
  return JSON.parse(JSON.stringify(object));
}

function deleteInvalidPropertyInObject(data = {}, blackList = []) {
  const nullishData = ["", " ", "0", 0, null, undefined];
  Object.keys(data).forEach((key) => {
    if (blackList.includes(key)) delete data[key];
    if (typeof data[key] == "string") data[key] = data[key].trim();
    if (Array.isArray(data[key]) && data[key].length > 0)
      data[key] = data[key].map((item) => item.trim());
    if (Array.isArray(data[key]) && data[key].length == 0) delete data[key];
    if (nullishData.includes(data[key])) delete data[key];
  });
}

function ListOfImagesForRequest(files, fileUploadPath) {
  if (files?.length > 0) {
    return files
      .map((file) =>
        path.join(
          `${process.env.BASE_URL}:${process.env.APPLICATION_PORT}/`,
          fileUploadPath,
          file.filename
        )
      )
      .map((item) => item.replace(/\\/g, "/"));
  } else {
    return [];
  }
}

function deleteFileInPublic(fileAddress) {
  if (fileAddress) {
    const pathFile = path.join(__dirname, "..", "..", "public", fileAddress);
    if (fs.existsSync(pathFile)) fs.unlinkSync(pathFile);
  }
}

// async function getComment(model, id) {
//   const findComment = await model.findOne(
//     { "comments._id": id },
//     { "comments.$": 1 }
//   );

//   return findComment?.comments?.[0];
// }
// async function getCommentWithComment(model, comment) {
//   const findComment = await model.findOne(
//     { "comments.comment": comment },
//     { "comments.$": 1 }
//   );

//   return findComment?.comments?.[0];
// }
// async function getAnswerComment(model, comment) {
//   const findComment = await model.findOne(
//     { "comments.answers.comment": comment },
//     { "comments.$": 1 }
//   );

//   return findComment?.comments?.[0]?.answers?.[0];
// }

// async function checkExistProduct(id) {
//   const product = await ProductModel.findById(id);
//   if (!product) throw createHttpError.NotFound("محصول مورد نظر یافت نشد");
//   return product;
// }

// async function getBasketOfUser(userID, discount = {}) {
//   const userDetail = await UserModel.aggregate([
//     {
//       $match: { _id: userID },
//     },
//     {
//       $project: { basket: 1 },
//     },
//     {
//       $lookup: {
//         from: "products",
//         localField: "basket.products.productID",
//         foreignField: "_id",
//         as: "productDetail",
//       },
//     },

//     {
//       $addFields: {
//         productDetail: {
//           $function: {
//             body: function (productDetail, products) {
//               return productDetail.map(function (product) {
//                 const count = products.find(
//                   (item) => item.productID.valueOf() == product._id.valueOf()
//                 ).count;
//                 const totalPrice = count * product.price;
//                 return {
//                   ...product,
//                   basketCount: count,
//                   totalPrice,
//                   finalPrice:
//                     totalPrice - (product.discount / 100) * totalPrice,
//                 };
//               });
//             },
//             args: ["$productDetail", "$basket.products"],
//             lang: "js",
//           },
//         },
//         payDetail: {
//           $function: {
//             body: function (productDetail, products) {
//               const productAmount = productDetail.reduce(function (
//                 total,
//                 product
//               ) {
//                 const count = products.find(
//                   (item) => item.productID.valueOf() == product._id.valueOf()
//                 ).count;
//                 const totalPrice = count * product.price;
//                 return (
//                   total + (totalPrice - (product.discount / 100) * totalPrice)
//                 );
//               },
//               0);

//               const productIds = productDetail.map((product) =>
//                 product._id.valueOf()
//               );
//               return {
//                 productAmount,
//                 paymentAmount: productAmount,
//                 productIds,
//               };
//             },
//             args: ["$productDetail", "$basket.products"],
//             lang: "js",
//           },
//         },
//       },
//     },
//     {
//       $project: { basket: 0 },
//     },
//   ]);
//   return copyObject(userDetail);
// }

const UtilsFunctions = {
  RandomNumberGenerator,
  SignAccessToken,
  SignRefreshToken,
  // verifyRefreshToken,
  copyObject,
  deleteInvalidPropertyInObject,
  ListOfImagesForRequest,
  deleteFileInPublic,
  // getComment,
  // getCommentWithComment,
  // getAnswerComment,
  // checkExistProduct,
  // getBasketOfUser,
};

module.exports = UtilsFunctions;
