import express from 'express'
// import path from 'path'
import cors from 'cors'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser';



const app = express();
const port = process.env.PORT || 4444;
const mongodbURI = process.env.mongodbURI || "mongodb+srv://MERN-Ecommerce:saaimahmedkhan123@cluster0.ztfqhsh.mongodb.net/learn-MongoDB?retryWrites=true&w=majority"
const SECRET = process.env.SECRET || "topsecret";



app.use(express.json());
mongoose.connect(mongodbURI)
app.use(cookieParser());



app.use(cors({
    origin: ['http://localhost:3000', "*"],
    credentials: true
}));


// ----------------------------------- MongoDB -----------------------------------
let usersSchema = new mongoose.Schema({
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, required: true },
    password: { type: String, required: true },
    createdOn: { type: Date, default: Date.now },
})
const userModel = mongoose.model('Users', usersSchema);
// ----------------------------------- MongoDB -----------------------------------



// ----------------------------------- SignUp -----------------------------------
pp.post("/signup", (req, res) => {

    let body = req.body;

    if (!body.firstName || !body.lastName || !body.email || !body.password) {
        res.status(400).send(
            `required fields missing, request example: 
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

    // check if user already exist // query email user
    userModel.findOne({ email: body.email }, (err, user) => {
        if (!err) {
            console.log("user: ", user);

            if (user) { // user already exist
                console.log("user already exist: ", user);
                res.status(400).send({ message: "user already exist,, please try a different email" });
                return;

            } else { // user not already exist

                // bcrypt hash
                stringToHash(body.password).then(hashString => {

                    userModel.create({
                        firstName: body.firstName,
                        lastName: body.lastName,
                        email: body.email,
                        password: hashString
                    },
                        (err, result) => {
                            if (!err) {
                                console.log("data saved: ", result);
                                res.status(201).send({ message: "user is created" });
                            } else {
                                console.log("db error: ", err);
                                res.status(500).send({ message: "internal server error" });
                            }
                        });
                })

            }
        } else {
            console.log("db error: ", err);
            res.status(500).send({ message: "db error in query" });
            return;
        }
    })
});
// ----------------------------------- SignUp -----------------------------------












// ----------------------------------- Create/Add Product -----------------------------------
app.post('/product', (req, res) => {
    const body = req.body
    if (!body.name || !body.price || !body.ratings || !body.description) {
        res.status(400).send({
            message: `Required Paramters Missing`
        })
        return;
    }
    userModel.create({
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
    userModel.find({}, (error, allFound) => {
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
    userModel.findOne({ _id: id }, (error, found) => {
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
    userModel.deleteMany({}, (error, data) => {
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
    userModel.deleteOne({ _id: id }, (error, deletedData) => {
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
        let data = await userModel.findByIdAndUpdate(id,
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



// const __dirname = path.resolve();
// app.use('/', express.static(path.join(__dirname, './app/build')))
// app.use('*', express.static(path.join(__dirname, './app/build')))

app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
})