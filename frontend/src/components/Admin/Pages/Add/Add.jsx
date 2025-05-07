import React, { useContext, useState } from "react";
import "./Add.css";
import { assets } from "../../../../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";
import { StoreContext } from "../../../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../Components/Sidebar/Sidebar";

const Add = () => {
  const { url, role } = useContext(StoreContext);
  const navigate = useNavigate();

  if (role !== "admin") {
    navigate("/");
    return null;
  }

  const [image, setImage] = useState(false);
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Desserts",
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", Number(data.price));
    formData.append("category", data.category);
    formData.append("image", image);
    const response = await axios.post(`${url}/api/food/add`, formData, {
      headers: { token: localStorage.getItem("token") },
    });
    if (response.data.success) {
      setData({
        name: "",
        description: "",
        price: "",
        category: "Desserts",
      });
      setImage(false);
      toast.success(response.data.message);
    } else {
      toast.error(response.data.message);
    }
  };

  return (
    <div className="app-content admin-layout">
      <Sidebar />
      <div className="main-content">
        <div className="add">
          <form className="flex-col" onSubmit={onSubmitHandler}>
            <div className="add-img-upload flex-col">
              <p>Upload Image</p>
              <label htmlFor="image">
                <img src={image ? URL.createObjectURL(image) : assets.upload_area} alt="" />
              </label>
              <input
                onChange={(e) => setImage(e.target.files[0])}
                type="file"
                id="image"
                hidden
                required
              />
            </div>
            <div className="add-product-name flex-col">
              <p>Product name</p>
              <input
                onChange={onChangeHandler}
                value={data.name}
                type="text"
                name="name"
                placeholder="Type here"
              />
            </div>
            <div className="add-product-description flex-col">
              <p>Product description</p>
              <textarea
                onChange={onChangeHandler}
                value={data.description}
                name="description"
                rows={6}
                placeholder="Write description here"
                required
              ></textarea>
            </div>
            <div className="add-category-price">
              <div className="add-category flex-col">
                <p>Product category</p>
                <select onChange={onChangeHandler} name="category" value={data.category}>
                  <option value="Desserts">Desserts</option>
                  <option value="Rice Combos">Rice Combos</option>
                  <option value="Ugali Combos">Ugali Combos</option>
                  <option value="Chapati Combos">Chapati Combos</option>
                  <option value="Potato Combos">Potato Combos</option>
                  <option value="Cakes">Cakes</option>
                  <option value="Noodles">Noodles</option>
                  <option value="Cocktails">Cocktails</option>
                </select>
              </div>
              <div className="add-price flex-col">
                <p>Product price</p>
                <input
                  onChange={onChangeHandler}
                  value={data.price}
                  type="number"
                  name="price"
                  placeholder="kshs50"
                />
              </div>
            </div>
            <button type="submit" className="add-btn">
              ADD
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Add;