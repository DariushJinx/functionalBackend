const createHttpError = require("http-errors");
const RoleModel = require("../../models/role/role.model");
const RoleValidation = require("../../validation/RBAC/role.validation");
const { StatusCodes: HttpStatus } = require("http-status-codes");
const { default: mongoose } = require("mongoose");
const {
  copyObject,
  deleteInvalidPropertyInObject,
} = require("../../../utils/functions.utils");

exports.createNewRole = async(req, res, next) => {
  try {
    const validation = await RoleValidation.validateAsync(req.body);
    const { title, description, permissions } = validation;
    await findRoleWithTitle(title);
    const roles = await RoleModel.create({ title, description, permissions });
    if (!roles)
      throw createHttpError.InternalServerError(
        "نقش مورد نظر با موفقیت ایجاد نشد"
      );
    return res.status(HttpStatus.CREATED).json({
      statusCode: HttpStatus.CREATED,
      data: {
        message: "نقش مورد نظر با موفقیت ایجاد شد",
        roles,
      },
    });
  } catch (err) {
    next(err);
  }
}

exports.getAllRoles = async (req, res, next) => {
  try {
    const roles = await RoleModel.find({});
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message: "تمامی نقش های موجود بازگردانده شد",
        roles,
      },
    });
  } catch (err) {
    next(err);
  }
}

exports.removeRole = async(req, res, next) => {
  try {
    const { field } = req.params;
    const role = await findRoleWithTitleOrID(field);
    const removeResult = await RoleModel.deleteOne({ _id: role._id });
    if (!removeResult.deletedCount)
      throw createHttpError.InternalServerError(
        "حذف نقش با موفقیت انجام نشد"
      );
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message: "حذف نقش با موفقیت انجام شد",
      },
    });
  } catch (err) {
    next(err);
  }
}

exports.updateRole = async(req, res, next) => {
  try {
    const { field } = req.params;
    const role = await findRoleWithTitleOrID(field);
    const data = copyObject(req.body);
    deleteInvalidPropertyInObject(data, []);
    const updateResult = await RoleModel.updateOne(
      { _id: role._id },
      { $set: data }
    );
    if (!updateResult.modifiedCount)
      throw createHttpError.InternalServerError(
        "نقش مورد نظر با موفقیت به روزرسانی نشد"
      );
    res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK.toExponential,
      data: {
        message: "نقش مورد نظر با موفقیت به روزرسانی شد",
      },
    });
  } catch (err) {
    next(err);
  }
}

const findRoleWithTitleOrID = async (field) => {
  const findQuery = mongoose.isValidObjectId(field)
    ? { _id: field }
    : { title: field };
  const role = await RoleModel.findOne(findQuery);
  if (!role) throw createHttpError.NotFound("نقش مورد نظر یافت نشد");
  return role;
}

const findRoleWithTitle = async (title) => {
  const role = await RoleModel.findOne({ title });
  if (role)
    throw createHttpError.BadRequest("نقش مورد نظر قبلا ایجاد شده است");
}