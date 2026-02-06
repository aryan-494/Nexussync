

// Distinguishes expected errors from bugs
export class HttpError extends Error {

    statusCode : number ;
    isOperational : boolean;

    constructor(message : string , statusCode = 500){
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
    }


}