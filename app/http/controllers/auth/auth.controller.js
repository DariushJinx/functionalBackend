const createHttpError = require("http-errors");
const {
  RandomNumberGenerator,
  SignAccessToken,
  SignRefreshToken,
} = require("../../../utils/functions.utils");
const UserModel = require("../../models/user/user.model");
const {
  GetOtpValidation,
  CheckOtpValidation,
  RegisterValidation,
  LoginValidation,
} = require("../../validation/auth/auth.validation");
const { StatusCodes: HttpStatus } = require("http-status-codes");
const bcrypt = require("bcrypt");
const BanModel = require("../../models/ban/ban.model");

exports.getOtp = async (req, res, next) => {
  try {
    const authValidation = await GetOtpValidation.validateAsync(req.body);
    const { mobile } = authValidation;
    const code = RandomNumberGenerator();
    const result = await saveUser(code, mobile);
    if (!result) throw createHttpError.Unauthorized("ورود شما انجام نشد");
    return res.status(HttpStatus.CREATED).json({
      statusCode: HttpStatus.CREATED,
      data: {
        message: "ورود شما با موفقیت انجام شد",
        code,
        mobile,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.checkOtp = async (req, res, next) => {
  try {
    const validation = await CheckOtpValidation.validateAsync(req.body);
    const { mobile, code } = validation;
    const user = await UserModel.findOne({ mobile }, { password: 0, "otp.expiresIn": 0 });
    if (!user) throw createHttpError.NotFound("کاربر مورد نظر یافت نشد");
    if (user.otp.code != code) throw createHttpError.Unauthorized("کد وارد شده معتبر نمی باشد");
    const now = new Date().getTime();
    if (+user.otp.expiresIn < now) throw createHttpError.Unauthorized("کد وارد شده منقضی شده است");
    const accessToken = await SignAccessToken(user._id);
    const refreshToken = await SignRefreshToken(user._id);
    res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message: "کد وارد شده صحیح می باشد",
        accessToken,
        refreshToken,
        user,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.register = async (req, res) => {
  const validation = await RegisterValidation.validateAsync(req.body);
  const { username, password, first_name, last_name, email, mobile } = validation;

  const isUserExists = await UserModel.findOne(
    {
      $or: [{ username }, { email }, { mobile }],
    },
    { "otp.expiresIn": 0 }
  );

  const countOfRegisteredUser = await UserModel.count();

  if (isUserExists) {
    return res.status(HttpStatus.CONFLICT).json({
      message: "ایمیل و یا یوزرنیم و یا موبایل شما تکراری می باشد",
    });
  }

  const isUserBan = await BanModel.find({ mobile });
  if (isUserBan.length) {
    return res.status(HttpStatus.FORBIDDEN).json({
      message: "این شماره تماس مسدود شده است!!!",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await UserModel.create({
    email,
    username,
    first_name,
    last_name,
    mobile,
    password: hashedPassword,
    role: countOfRegisteredUser > 2 ? "USER" : "ADMIN",
  });
  const accessToken = await SignAccessToken(user._id);
  const userObject = user.toObject();

  Reflect.deleteProperty(userObject, "password");
  Reflect.deleteProperty(userObject, "otp");

  return res.status(HttpStatus.CREATED).json({
    statusCode: HttpStatus.CREATED,
    data: {
      message: "شما با موفقیت ثبت نام کردید",
      user: userObject,
      accessToken,
    },
  });
};

exports.login = async (req, res) => {
  const validation = await LoginValidation.validateAsync(req.body);
  const { identifier, password } = validation;

  const user = await UserModel.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  });

  if (!user) {
    return res.status(HttpStatus.UNAUTHORIZED).json("کاربری با این ایمیل و یا یوزرنیم یافت نشد");
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password);

  if (!isPasswordValid) {
    return res.status(HttpStatus.UNAUTHORIZED).json({ message: "رمز عبور وارد شده صحیح نمی باشد" });
  }

  const accessToken = await SignAccessToken(user._id);

  return res.status(HttpStatus.OK).json({
    statusCode: HttpStatus.OK,
    data: {
      message: "شما با موفقیت وارد شدید",
      accessToken,
    },
  });
};

const saveUser = async (code, mobile) => {
  const now = new Date().getTime();
  let otp = {
    code,
    expiresIn: now + 2592000,
  };
  const user = await checkExistUser(mobile);
  const countOfRegisteredUser = await UserModel.count();
  if (user) {
    if (+user.otp.expiresIn > now) {
      throw createHttpError.Forbidden("کد احراز هویت قبلی هنوز منقضی نشده است");
    }
    return await updateUser(mobile, { otp });
  }
  return await UserModel.create({
    mobile,
    otp,
    role: countOfRegisteredUser > 2 ? "USER" : "ADMIN",
  });
};

const checkExistUser = async (mobile) => {
  const user = await UserModel.findOne({ mobile });
  return user;
};

const updateUser = async (mobile, objectData = {}) => {
  Object.keys(objectData).forEach((key) => {
    if (["", " ", "0", 0, null, undefined, NaN].includes(objectData[key])) delete objectData[key];
  });
  const updateResult = await UserModel.updateOne({ mobile }, { $set: objectData });

  return !!updateResult.modifiedCount;
};
