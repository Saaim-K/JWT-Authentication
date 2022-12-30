import express from 'express'
import path from 'path'
import cors from 'cors'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser';
import { stringToHash, varifyHash } from "bcrypt-inzi"



const app = express();
const port = process.env.PORT || 4444;
const mongodbURI = process.env.mongodbURI || "mongodb+srv://Learning-JWT:Learning-JWT@cluster0.tcywpkb.mongodb.net/Learning-JWT?retryWrites=true&w=majority"
const SECRET = process.env.SECRET || "topsecret";



app.use(express.json());
mongoose.connect(mongodbURI)
app.use(cookieParser())
app.use(cors({
    origin: ['http://localhost:3000', "*"],
    credentials: true
}));



// ----------------------------------- MongoDB -----------------------------------
let productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: Number,
    ratings: Number,
    description: String,
    createdOn: { type: Date, default: Date.now }
})
const productModel = mongoose.model('Products', productSchema);

const userSchema = new mongoose.Schema({
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, required: true },
    password: { type: String, required: true },
    createdOn: { type: Date, default: Date.now },
});
const userModel = mongoose.model('Users', userSchema);
// ----------------------------------- MongoDB -----------------------------------



// ----------------------------------- Signup using JSON Web Token -----------------------------------
app.post("/signup", (req, res) => {
    let body = req.body;
    if (!body.firstName || !body.lastName || !body.email || !body.password) {
        res.status(400).send(
            `Required fields missing, Request Example: 
                {
                    "firstName": "John",
                    "lastName": "Doe",
                    "email": "abc@abc.com",
                    "password": "12345"
                }`
        );
        return;
    }
    req.body.email = req.body.email.toLowerCase();
    userModel.findOne({ email: body.email }, (err, user) => {
        if (!err) {
            console.log("User: ", user);
            // ------------------------ Check if user already exists ------------------------
            if (user) {
                console.log("User already exist: ", user);
                res.status(400).send({
                    message: "User already exists. Please try a different email"
                });
                return;
            }
            // ------------------------ Check if user already exists ------------------------

            // ------------------------ Check if user doesn't exists and Create a User ------------------------
            else {
                stringToHash(body.password).then(hashString => {
                    userModel.create({
                        firstName: body.firstName,
                        lastName: body.lastName,
                        email: body.email,
                        password: hashString
                    },
                        (err, result) => {
                            if (!err) {
                                console.log("Data Saved: ", result);
                                res.status(201).send(
                                    {
                                        message: "User created"
                                    });
                            } else {
                                console.log("db error: ", err);
                                res.status(500).send(
                                    {
                                        message: "Internal Server Error"
                                    });
                            }
                        });
                })
            }
            // ------------------------ Check if user doesn't exists and Create a User ------------------------
        } else {
            console.log("database error: ", err);
            res.status(500).send({ message: "Database Error in Query" });
            return;
        }
    })
});
// ----------------------------------- Signup using JSON Web Token -----------------------------------

// ----------------------------------- Login using JSON Web Token -----------------------------------
app.post("/login", (req, res) => {

    let body = req.body;
    body.email = body.email.toLowerCase();

    if (!body.email || !body.password) {
        res.status(400).send(
            `Required fields missing, Request example: 
                {
                    "email": "abc@abc.com",
                    "password": "12345"
                }`
        );
        return;
    }

    // ------------------------ Check if user exists ------------------------
    userModel.findOne(
        { email: body.email },
        // ---------- Projection in MongoDB ----------
        // ----- 1st Method -----
        // { firstName: 1, lastName: 1, email: 1, password: 0 },//1= include ,0 = exclude 
        // ----- 1st Method -----
        // ----- 2nd Method -----
        "firstName lastName email password",//  - (minus sign) = exclude 
        // ----- 2nd Method -----
        // ---------- Projection in MongoDB ----------
        (err, data) => {
            if (!err) {
                console.log("data: ", data);
                if (data) {
                    varifyHash(body.password, data.password).then(isMatched => {
                        console.log("isMatched: ", isMatched);
                        if (isMatched) {
                            const token = jwt.sign({
                                _id: data._id,
                                email: data.email,
                                iat: Math.floor(Date.now() / 1000) - 30,
                                exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
                            }, SECRET);
                            console.log("Token: ", token);
                            res.cookie('Token', token, {
                                maxAge: 86_400_000,
                                httpOnly: true
                            });
                            res.send({
                                message: "Login Successful",
                                profile: {
                                    email: data.email,
                                    firstName: data.firstName,
                                    lastName: data.lastName,
                                    age: data.age,
                                    _id: data._id
                                }
                            });
                            return;
                        } else {
                            console.log("Password did not match");
                            res.status(401).send({ message: "Incorrect email or password" });
                            return;
                        }
                    })
                } else { // user not already exist
                    console.log("User not found");
                    res.status(401).send({ message: "Incorrect email or password" });
                    return;
                }
            } else {
                console.log("Database error: ", err);
                res.status(500).send({ message: "Login Failed, Please try later" });
                return;
            }
        })
    // ------------------------ Check if user exists ------------------------
})
// ----------------------------------- Login using JSON Web Token -----------------------------------

// ----------------------------------- Logout using JSON Web Token -----------------------------------
app.post("/logout", (req, res) => {
    res.cookie('Token', '', {
        maxAge: 1,
        httpOnly: true
    });
    res.send({ message: "Logout successful" });
})
// ----------------------------------- Logout using JSON Web Token -----------------------------------

// ----------------------------------- Middleware JSON Web Token -----------------------------------
app.use((req, res, next) => {
    console.log("req.cookies: ", req.cookies);
    if (!req?.cookies?.Token) {
        res.status(401).send({
            message: "Include http-only credentials with every request"
        })
        return;
    }
    jwt.verify(req.cookies.Token, SECRET, function (err, decodedData) {
        if (!err) {
            console.log("decodedData: ", decodedData);
            const nowDate = new Date().getTime() / 1000;
            if (decodedData.exp < nowDate) {
                res.status(401);
                res.cookie('Token', '', {
                    maxAge: 1,
                    httpOnly: true
                });
                res.send({ message: "Token Expired" })
            } else {
                console.log("Token Approved");
                req.body.token = decodedData
                next();
            }
        } else {
            res.status(401).send("Invalid Token")
        }
    });
})
// ----------------------------------- Middleware JSON Web Token -----------------------------------


// ----------------------------------- Create/Add Product -----------------------------------
app.post('/product', (req, res) => {
    const body = req.body
    if (!body.name || !body.price || !body.ratings || !body.description) {
        res.status(400).send({
            message: `Required Paramters Missing`
        })
        return;
    }
    productModel.create({
        name: body.name,
        price: body.price,
        ratings: body.ratings,
        description: body.description,
    },
        (error, uploaded) => {
            if (!error) {
                console.log("Succesfully Uploaded to database", uploaded);
                res.send({
                    message: "Product Added Successfully",
                    data: uploaded
                });
            } else {
                res.status(500).send({
                    message: "server error"
                })
            }
        })
})
// ----------------------------------- Create/Add Product -----------------------------------



// ----------------------------------- Get Product -----------------------------------
// ------------------------ Get All Product ------------------------
app.get('/products', (req, res) => {
    productModel.find({}, (error, allFound) => {
        if (!error) {
            console.log("uploaded", allFound)
            res.send({
                message: `Product Added Succesfully 👍`,
                data: allFound
            })
        } else {
            res.status(500).send({
                message: `Server Error`
            })

        }
    });
})
// ------------------------ Get All Product ------------------------

// ------------------------ Get Specified Product ------------------------
app.get('/product/:id', (req, res) => {
    const id = req.params.id
    productModel.findOne({ _id: id }, (error, found) => {
        if (!error) {
            if (found) {
                res.send({
                    message: `Got the product of the specified id ${found._id}`,
                    data: found
                })
            } else {
                res.status(404).send({
                    message: `Product Not Found`
                })
            }
        } else {
            res.status(500).send({
                message: "server error"
            })
        }


    })
})
// ------------------------ Get Specified Product ------------------------
// ----------------------------------- Get Product -----------------------------------



// ----------------------------------- Delete Product -----------------------------------
// ------------------------ Delete All Product ------------------------
app.delete('/products', (req, res) => {
    productModel.deleteMany({}, (error, data) => {
        if (!error) {
            res.send({
                message: `All products deleted`
            })
        } else {
            res.status(500).send({
                message: `server error`
            })
        }
    })
})
// ------------------------ Delete All Product ------------------------

// ------------------------ Delete Specified Product ------------------------
app.delete('/product/:id', (req, res) => {
    const id = req.params.id
    productModel.deleteOne({ _id: id }, (error, deletedData) => {
        console.log(deletedData)
        if (!error) {
            if (deletedData.deletedCount === 1) {
                res.send({
                    message: `Product has been deleted of the following id ${id}`
                })
            } else {
                res.send({
                    message: `Product not found of the following id ${id}`
                })
            }
        } else {
            res.status(500).send({
                message: `server error`
            })
        }
    })
})
// ------------------------ Delete Specified Product ------------------------
// ----------------------------------- Delete Product -----------------------------------



// ----------------------------------- Update Product -----------------------------------
app.put('/product/:id', async (req, res) => {
    const body = req.body
    const id = req.params.id

    if (!body.name || !body.price || !body.ratings || !body.description) {
        res.status(400).send({
            message: `Required Paramters Missing. Example request body {
                name:"name"
                price:"price"
                description:"description"
            }`
        })
        return;
    }
    try {
        let data = await productModel.findByIdAndUpdate(id,
            {
                name: body.name,
                price: body.price,
                ratings: body.ratings,
                description: body.description
            },
            { new: true }
        ).exec();

        console.log('updated: ', data);

        res.send({
            message: "product modified successfully"
        });

    } catch (error) {
        res.status(500).send({
            message: "server error"
        })
    }
})
// ----------------------------------- Update Product -----------------------------------



////////////////mongodb connected disconnected events///////////////////////////////////////////////
mongoose.connection.on('connected', function () {//connected
    console.log("Mongoose is connected");
    // process.exit(1);
});

mongoose.connection.on('disconnected', function () {//disconnected
    console.log("Mongoose is disconnected");
    process.exit(1);
});

mongoose.connection.on('error', function (err) {//any error
    console.log('Mongoose connection error: ', err);
    process.exit(1);
});

process.on('SIGINT', function () {/////this function will run jst before app is closing
    console.log("app is terminating");
    mongoose.connection.close(function () {
        console.log('Mongoose default connection closed');
        process.exit(0);
    });
});
////////////////mongodb connected disconnected events///////////////////////////////////////////////



const __dirname = path.resolve();
app.use('/', express.static(path.join(__dirname, './app/build')))
app.use('*', express.static(path.join(__dirname, './app/build')))

app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
})
