import express, { Request, Response} from "express";
import { ImageIdValidation, ImageValidator,listImagevalidation } from "./validator/image-validator";
import { AppDataSource } from "../database/database";
import { ImageUseCase } from "../domain/image-usecase";
import { generateValidationErrorMessage } from "./validator/generate-validation-message";
import { upload } from "../middlewares/multer-config";
import { Image } from "../database/entities/image"

export const imageRoutes = (app: express.Express) => {
     
    app.get("/healthimage", (req: Request, res: Response) => {
        res.send({ "message": "image" })
    });

     // lister les sport disponible
     app.get("/images", async (req: Request, res: Response) =>{
        try{
            const imagevalidator = listImagevalidation.validate(req.query)
            const listimageRequest = imagevalidator.value
            let limit = 50
            if(listimageRequest.limit){
                limit = listimageRequest.limit
            }
            const page = listimageRequest.page ?? 1
            try{
                const imageUseCase = new ImageUseCase(AppDataSource)
                const listimage= await imageUseCase.ListeImage({ ...listimageRequest, page, limit })
                res.status(200).send(listimage)
            }catch(error){
                console.log(error)
                res.status(500).send({ "error": "internal error for list event retry later" })
                return
            }
        }catch(error){
            console.log(error)
            res.status(500).send({ "error": "internal error retry later" })
            return
        }
    });

     // obtenir le planning par l'id du planning
     app.get("/images/:Id", async (req: Request , res : Response) =>{
        try{
            const imageidvalidation  = ImageIdValidation.validate(req.params)
            
            if(imageidvalidation.error){
                res.status(400).send(generateValidationErrorMessage(imageidvalidation.error.details))
            }

            const imageUseCase = new ImageUseCase(AppDataSource)
            const imageid = imageidvalidation.value.Id;

            const image  = await imageUseCase.getImageById(imageid)
            console.log("image",image)
            console.log("image.Path",image.url)
            
            res.set('Content-Type', 'image/png');
        
            const imageData = image.url;
          
            //res.send(imageData);
            if (!image) {
                res.status(404).send({ "error": "sport not found" });
                return;
            }
            res.status(200).send(imageData);

        }catch(error){
            console.log(error)
            res.status(500).send({ "error": "internal error retry later" })
            return
        }
    })

    app.post("/images",upload.single('image'),async (req: Request, res: Response) =>{
        try{
            const imagevalidation = ImageValidator.validate(req.body)
            console.log("imagevalidation",imagevalidation)
            
            if(imagevalidation.error){
                res.status(400).send(generateValidationErrorMessage(imagevalidation.error.details))
            }
            const imagedata = imagevalidation.value;

            console.log("imagedata",imagedata);

            const imageUseCase = new ImageUseCase(AppDataSource)

            const result = await  imageUseCase.CreatImage(imagedata)

            console.log("result",result)
            
            return res.status(201).send(result);
        }catch(error){
            console.log(error)
            res.status(500).send({ "error": "internal error retry later" })
            return
        }
    });
}
