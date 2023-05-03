import React, { useState } from 'react';
import { Card, CardActionArea, CardContent, CardMedia, Typography, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import { Product } from '../interfaces';
import { InView } from 'react-intersection-observer';
import './ProductCard.css';
// import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  // const handleAddToWishlist = async () => {
  //   if (isAuthenticated) {
  //     try {
  //       await axios.post(`/api/wishlist/${product._id}`);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   }
  // };

  const handleAddToCart = async () => {
    if (!auth.token) {
      navigate('/login');
      return;
    }

    try {
      await axios.post(
        `/api/cart/${product._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      setAddedToCart(true);
      setTimeout(() => {
        setAddedToCart(false);
      }, 3000);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Card
      sx={{
        maxWidth: 345,
        position: 'relative',
        margin: '0 auto',
        marginBottom: '20px',
        '@media (max-width: 600px)': {
          maxWidth: '100%',
          marginRight: 0,
        },
      }}
    >
      <Link to={`/products/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <CardActionArea>
          <InView as="div" onChange={(inView) => inView && !isImageLoaded && handleImageLoad()}>
            {!isImageLoaded && (
              <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, background: '#eee' }} />
                <Typography variant="caption" className="srOnly">{`Loading ${product.name} image`}</Typography>
              </div>
            )}
            {isImageLoaded && (
              <CardMedia
                component="img"
                height="140"
                image={product.image}
                alt={product.name}
              />
            )}
          </InView>
          <CardContent style={{ paddingBottom: '50px' }}>
            <Typography gutterBottom variant="h5" component="div">
              {product.name}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Link>
      {auth.token && (
        <div style={{ position: 'absolute', bottom: 0, right: 0 }}>
          {/* <IconButton color="primary" size="small" onClick={handleAddToWishlist}>
            <FavoriteBorderIcon />
          </IconButton> */}
          <IconButton color="primary" size="small" onClick={handleAddToCart}>
            <ShoppingCartIcon />
          </IconButton>
        </div>
      )}
    </Card>
  );
};

export default ProductCard;