//custom error handler for structured error handling in node.js backend application.
class ApiError extends Error { //ApiError is the child class of Error class 
    constructor ( //properties of my class ApiError
        statuscode, //http status code
        message = "Something went wrong", //default error message
        errors = [], //additional error details
        stack = "" //optional stack trace
    ){
        super(message)//calls the constructor of the error class(parent) //sets this.message = message automatically
        this.statuscode = statuscode
        this.data = null
        this.message = message //redundant
        this.success = false;   //because we are handling error not showing response
        this.errors = errors

        if(stack){
            this.stack = stack;
        }
        else{
            Error.captureStackTrace(this, this.constructor) //Helps in debugging by showing where the error originated
        }

    }
}

export {ApiError}


//if used function here you will not get benefitted from javascript error class or /no inheritance from error class.
//class is used for structured error handling for debugging.