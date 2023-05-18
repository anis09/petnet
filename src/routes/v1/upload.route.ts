import { Router } from 'express';
import { Routes } from '../../interfaces/routes.interface';
import { MulterUpload, S3Upload } from '../../utils/s3';

class UploadRouteV1 implements Routes {
    public path = '/api/v1/upload';
    public adminPath = "/api/v1/admin/upload";
    public router = Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}/s3`, MulterUpload, S3Upload);
        this.router.post(`${this.adminPath}/s3`, MulterUpload, S3Upload);
    }
};

export default UploadRouteV1;