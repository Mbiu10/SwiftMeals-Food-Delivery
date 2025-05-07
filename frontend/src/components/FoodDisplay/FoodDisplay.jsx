import React, { useContext } from 'react';
import './FoodDisplay.css';
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';

const FoodDisplay = ({ category }) => {
  const { filteredFoodList } = useContext(StoreContext);

  return (
    <div className='food-display' id='food-display'>
      <h2>Best dishes near you</h2>
      <div className='food-display-list'>
        {filteredFoodList.map((item, index) => {
          if (category === "all" || category === item.category) {
            return (
              <FoodItem
                key={item._id} // Use _id for uniqueness
                id={item._id}
                name={item.name}
                description={item.description}
                price={item.price}
                image={item.image}
              />
            );
          }
          return null; // Explicitly return null for non-matching items
        })}
      </div>
    </div>
  );
};

export default FoodDisplay;