import React, { useContext, useEffect, useState } from 'react';
import './List.css';
import axios from "axios";
import { toast } from "react-toastify";
import { StoreContext } from '../../../../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from "../../Components/Sidebar/Sidebar";

const List = () => {
  const { url, role } = useContext(StoreContext);
  const navigate = useNavigate();
  const [list, setList] = useState([]);

  if (role !== 'admin') {
    navigate('/');
    return null;
  }

  const fetchList = async () => {
    const response = await axios.get(`${url}/api/food/list`, {
      headers: { token: localStorage.getItem("token") },
    });
    if (response.data.success) {
      setList(response.data.data);
    } else {
      toast.error("Error");
    }
  };

  const removeFood = async (foodId) => {
    const response = await axios.post(
      `${url}/api/food/remove`,
      { id: foodId },
      { headers: { token: localStorage.getItem("token") } }
    );
    await fetchList();
    if (response.data.success) {
      toast.success(response.data.message);
    } else {
      toast.error("Error");
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="app-content admin-layout">
      <Sidebar />
      <div className="main-content">
        <div className="list add flex-col">
          <p>All Foods List</p>
          <div className="list-table">
            <div className="list-table-format title">
              <b>Image</b>
              <b>Name</b>
              <b>Category</b>
              <b>Price</b>
              <b>Action</b>
            </div>
            {list.map((item, index) => (
              <div key={index} className="list-table-format">
                <img src={`${url}/images/` + item.image} alt="" />
                <p>{item.name}</p>
                <p>{item.category}</p>
                <p>KSh {item.price}</p>
                <p onClick={() => removeFood(item._id)} className="cursor">X</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default List;