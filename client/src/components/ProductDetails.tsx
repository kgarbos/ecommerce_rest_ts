import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Box, Card, CardContent, CardMedia, IconButton, Typography } from '@mui/material';
import { Home } from '@mui/icons-material';
import { Product } from '../interfaces';
import axios from 'axios';

const ProductDetails: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/api/products/${productId}`);
        if (response && response.data && response.data.data) {
          setProduct(response.data.data);
        } else {
          console.error('No product found in the response data');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    fetchProduct();
  }, [productId]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mt: 4,
        mb: 4,
      }}
    >
      <Link to="/" style={{ textDecoration: 'none' }}>
        <IconButton sx={{ mb: 2 }}>
          <Home />
        </IconButton>
      </Link>
      <Typography variant="h4">Product Details</Typography>
      {product && (
        <Card
          sx={{
            maxWidth: 900,
            mt: 4,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
          }}
        >
          <CardMedia
            component="img"
            image={product.image}
            alt={product.name}
            sx={{ width: { xs: '100%', md: '50%' }, height: { xs: 300, md: 'auto' } }}
          />
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <Typography variant="h5" component="div" gutterBottom>
                {product.name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {product.description}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {`Brand: ${product.brand}`}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {`Category: ${product.category}`}
              </Typography>
            </div>
            <div>
              <Typography variant="body1" gutterBottom>
                {`Price: $${product.price}`}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {`Rating: ${product.rating}`}
              </Typography>
              <Typography variant="body1">
                {`Reviews: ${product.numReviews}`}
              </Typography>
            </div>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ProductDetails;