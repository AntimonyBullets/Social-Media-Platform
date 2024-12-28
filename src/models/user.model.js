import mongoose, {Schema} from "mongoose";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userSchema = new Schema({
    username:{
        type: String,
        required: true,
        unique: true, 
        lowercase: true,
        trim: true,
        index: true
    },
    email:{
        type: String,
        required: true,
        unique: true, 
        lowercase: true,
        trim: true,
    },
    fullName:{
        type: String,
        required: true,
        trim: true
    },
    avatar:{
        type:String, //cloudinary url
        required: true,
    },
    coverImage:{
        type:String, //cloudinary url
    },
    watchHistory:[
        {
            type: Schema.Types.ObjectId,
            ref: 'Video'
        }
    ],
    password:{
        type:String,
        required: [true, "Password is required"]
    },
    refreshToken:{
        type:String
    }
},{timestamps: true});

userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        return next(); //next() function is called to signal that the current middleware is finished and to proceed to the next middleware in the stack. Here it is being called with 'return' to just ensure that the encryption logic below is not executed. next() does not return any meaningful value.
    }
    //We are performing the encryption only when the password is being modified. 
    this.password = await bcrypt.hash(this.password, 10);// hash(<field to be encrypted>, <no. of rounds for hashing>)
    next();
}) // here pre() is a middleware function which is being used to perform hashing (encryption) on password just before it is being saved in the database.

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password); //compares the current input password ('password') with the encrypted password in the database ('this.password') and validates the input password by returning a boolean value.
};

userSchema.methods.generateAccessToken = function (){
    jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username, 
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function (){
    jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
export const User = mongoose.model('User', userSchema);