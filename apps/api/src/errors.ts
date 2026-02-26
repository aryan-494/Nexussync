

// // Distinguishes expected errors from bugs
// export class HttpError extends Error {

//     statusCode : number ;
//     isOperational : boolean;

//     constructor(message : string , statusCode = 500){
//         super(message);
//         this.statusCode = statusCode;
//         this.isOperational = true;
//     }


// }


// export class NotFoundError extends HttpError{
//     constructor(message = "Route Not found"){
//         super(message , 404);
//     }
// }



export class HttpError extends Error {

  statusCode: number;
  code: string;

  constructor(
    message: string,
    statusCode: number,
    code: string
  ) {
    super(message);

    this.statusCode = statusCode;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}



export class NotFoundError extends HttpError {

  constructor(message: string = "Not Found") {
    super(
      message,
      404,
      "NOT_FOUND"
    );
  }

}