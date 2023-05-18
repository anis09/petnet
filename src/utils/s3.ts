import AWS from "aws-sdk";
import { FileDto } from "../dtos/file.dto";
import { NextFunction, Response } from "express";
import fs from "fs";
import { RequestWithFile } from "../interfaces/file.interface";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { errors } from "../constants/errors";
import { vars } from "../constants/vars";

const MulterStorage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, uuidv4() + path.extname(file.originalname));
  },
});

const MulterUpload = multer({ storage: MulterStorage }).array("file");

const s3Client = new AWS.S3({
  accessKeyId: vars.awsAccessKeyId,
  secretAccessKey: vars.awsSecretAccessKey,
  region: vars.awsRegion,
});

const S3Upload = async (
  req: RequestWithFile,
  res: Response,
  next: NextFunction
) => {
  let files: FileDto[] = [];
  for (const file of req.files) {
    const uploadParams = {
      Bucket: vars.awsBucketName,
      Key: file.filename,
      Body: fs.createReadStream(file.path),
      ContentType: file.mimetype,
    };

    s3Client.upload(uploadParams, (err, data) => {
      if (err) {
        res.status(500).json({ message: errors.SOMETHING_WENT_WRONG });
        next();
      }
    });

    files.push({
      url: `${vars.fastlyCdnUrl}/${uploadParams.Key}`,
    });
  }

  res.status(200).json({ files });
};
const S3UploadPostPic = async (
  req: RequestWithFile,
  res: Response,
  next: NextFunction
) => {
  let files: FileDto[] = [];
  for (const file of req.files) {
    const uploadParams = {
      Bucket: vars.awsBucketName,
      Key: file.filename,
      Body: fs.createReadStream(file.path),
      ContentType: file.mimetype,
    };

    s3Client.upload(uploadParams, (err, data) => {
      if (err) {
        res.status(500).json({ message: errors.SOMETHING_WENT_WRONG });
        next();
      }
    });

    files.push({
      url: `${vars.fastlyCdnUrl}/${uploadParams.Key}`,
    });
  }
  req.body.images = files;
  next();
  //res.status(200).json({ files });
};

export { MulterUpload, S3Upload, S3UploadPostPic };
