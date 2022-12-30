import { useEffect, useState, useContext } from "react";
import { GlobalContext } from './Context/Context'
import axios from 'axios'
import { BrowserRouter as Router, Link, Routes, Route, Navigate } from 'react-router-dom'
import Home from './Components/Home';
import About from './Components/About';
import Gallery from './Components/Gallery';
import Profile from './Components/Profile';
import Login from './Components/Login';
import Signup from './Components/Signup';

const App = () => {
  let { state, dispatch } = useContext(GlobalContext);
  const [fullName, setFullName] = useState("");

  const logoutHandler = () => {

  }

  useEffect(() => {
    const baseUrl = 'http://localhost:4444'
    const getProfile = async () => {
      try {
        let response = await axios.get(`${baseUrl}/products`, {
          withCredentials: true
        })
        console.log("response: ", response);
        dispatch({
          type: 'USER_LOGIN'
        })
      } catch (error) {
        console.log("axios error: ", error);
        dispatch({
          type: 'USER_LOGOUT'
        })
      }
    }
    getProfile();
  }
    , [])

  return (
    <>
      <Router>
        {(state.isLogin === true) ?
          <>
            <h1> <Link to={`/`}>Home</Link> </h1>
            <h1> <Link to={`/about`}>About</Link> </h1>
            <h1> <Link to={`/gallery`}>Gallery</Link> </h1>
            <h1> <Link to={`/profile`}>Profile</Link> </h1>
            <h1> {fullName} <button onClick={logoutHandler}>Logout</button> </h1>
          </>
          : null}
        {
          (state.isLogin === false) ?
            <>
              <h1> <Link to={`/`}>Login</Link> </h1>
              <h1> <Link to={`/signup`}>Signup</Link> </h1>
            </>
            : null}
        {(state.isLogin === true) ?
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace={true} />} />
          </Routes>
          : null}
        {(state.isLogin === false) ?
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="*" element={<Navigate to="/" replace={true} />} />
          </Routes>
          : null
        }
      </Router>
    </>
  )
}

export default App













// import React, { useState, useEffect } from 'react'
// import axios from 'axios'
// import './App.css'

// let baseUrl = '';
// if (window.location.href.split(':')[0] === 'http') { baseUrl = 'http://localhost:4444' }

// const App = () => {
//   // ----------------------------- States -----------------------------
//   const [product, setProduct] = useState([])
//   const [addProduct, setAddProduct] = useState(false)//Runs every time product is added ,deleted or edited
//   const [editMode, setEditMode] = useState(false)
//   const [editProduct, setEditProduct] = useState({})
//   const [name, setName] = useState('')
//   const [price, setPrice] = useState('')
//   const [ratings, setRatings] = useState('')
//   const [description, setDescription] = useState('')
//   // ----------------------------- States -----------------------------


//   // ----------------------------- Create Product Function -----------------------------
//   const createPost = (e) => {
//     e.preventDefault();
//     axios.post(`${baseUrl}/product`, { name, price, ratings, description })
//       .then(response => {
//         console.log("Response Sent ", response.data);
//         setAddProduct(!addProduct)
//         console.log('Product added Succesfully 👍')
//       })
//       .catch(error => {
//         console.log('Error occured while adding product ❌', error)
//       })
//   }
//   // ----------------------------- Create Product Function -----------------------------


//   // ----------------------------- Get Product Function -----------------------------
//   useEffect(() => {
//     const allProducts = async () => {
//       try {
//         const response = await axios.get(`${baseUrl}/products`)
//         setProduct(response.data.data)//New Product at the bottom
//         setProduct(response.data.data.reverse())//New Product at the top
//         console.log('Product fetched Succesfully 👍')
//       }
//       catch (error) {
//         console.log('Error occured while fetching product ❌', error)
//       }
//     }
//     allProducts()

//     //   // ---------- Cleanup Function ----------
//     return () => { allProducts() }
//     //   // ---------- Cleanup Function ----------

//   }, [addProduct])
//   // ----------------------------- Get Product Function -----------------------------


//   // ----------------------------- Delete Product Function -----------------------------
//   const deleteFunction = async (id) => {
//     try {
//       const response = await axios.delete(`${baseUrl}/product/${id}`)
//       console.log("response: ", response.data);
//       setAddProduct(!addProduct)
//       console.log('Product deleted Succesfully 👍')
//     } catch (error) {
//       console.log('Error occured while deleting product ❌', error)
//     }
//   }

//   const deleteAll = (e) => {
//     e.preventDefault();
//     axios.delete(`${baseUrl}/products`)
//       .then((response) => {
//         console.log("Response Sent ", response.data);
//         setAddProduct(!addProduct)
//         console.log(' Succesfully Deleted All Products👍')
//       })
//       .catch(error => {
//         console.log('Error in Deleting All Products ❌', error)
//       })
//   }
//   // ----------------------------- Delete Product Function -----------------------------


//   // ----------------------------- Edit Product Function -----------------------------
//   const editFunction = (product) => {
//     setEditMode(!editMode)
//     setEditProduct(product)
//   }

//   const editProductFunc = (id) => {
//     console.log("first")
//     axios.put(`${baseUrl}/product/${id}`, { name, price, ratings, description })
//       .then(response => {
//         console.log("Response Sent ", response.data);
//         setAddProduct(!addProduct)
//         console.log('Product edited Succesfully 👍')
//         setEditMode(!editMode)

//       })
//       .catch(error => {
//         console.log('Error occured while editing product ❌', error)
//       })
//   }
//   // ----------------------------- Edit Product Function -----------------------------

//   return (
//     <>
//       <form >
//         <h1>Product</h1>
//         <h3>
//           Name:
//           <input placeholder='Enter Product' type="text" onChange={(e) => (setName(e.target.value))} /> <br />
//           Price:
//           <input placeholder='Enter Product Price' type="number" onChange={(e) => (setPrice(e.target.value))} /> <br />
//           Ratings:
//           <input placeholder='Enter Product Ratings' type="number" onChange={(e) => (setRatings(e.target.value))} /> <br />
//           Description:
//           <input placeholder='Enter Product Description' type="text" onChange={(e) => (setDescription(e.target.value))} /> <br />
//           <button onClick={createPost}>Post</button>
//           <button onClick={deleteAll}>Delete All</button>
//         </h3>
//       </form>

//       <div>
//         {
//           product.map((eachProduct, i) =>
//           (
//             <div key={i}>
//               <hr />
//               <h2><b>Name</b> :{eachProduct.name}</h2>
//               <p><b>ID</b> :{eachProduct._id}</p>
//               <p><b>Price</b> :{eachProduct.price}</p>
//               <p><b>Ratings</b> :{eachProduct.ratings}</p>
//               <p><b>Description</b> :{eachProduct.description}</p>
//               <button onClick={() => { deleteFunction(eachProduct._id) }}>Delete</button>
//               <button onClick={() => { editFunction(eachProduct, i) }}>Edit</button>
//               {
//                 (editMode && editProduct._id === eachProduct._id) ?
//                   <>
//                     <form onSubmit={(e) => { e.preventDefault(); editProductFunc(editProduct._id) }}>
//                       <h5>
//                         Edited Name:
//                         <input placeholder='Enter Product' type="text" onChange={(e) => (setName(e.target.value))} /> <br />
//                         Edited Price:
//                         <input placeholder='Enter Product Price' type="number" onChange={(e) => (setPrice(e.target.value))} /> <br />
//                         Edited Ratings:
//                         <input placeholder='Enter Product Ratings' type="number" onChange={(e) => (setRatings(e.target.value))} /> <br />
//                         Edited Description:
//                         <input placeholder='Enter Product Description' type="text" onChange={(e) => (setDescription(e.target.value))} /> <br />
//                         <button>Post</button>
//                       </h5>
//                     </form>
//                   </>
//                   : null
//               }
//               <hr />
//               <br />
//             </div>
//           ))
//         }
//       </div>
//     </>
//   )
// }

// export default App