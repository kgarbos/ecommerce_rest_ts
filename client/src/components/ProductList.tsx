import React, { useEffect, useState, useMemo} from 'react';
import axios from 'axios';
import { Box, Grid, Pagination, PaginationItem } from '@mui/material';
import { Product } from '../interfaces';
import ProductCard from './ProductCard';

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const productsPerPage = 18;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/products');
        if (response && response.data && response.data.data) {
          setProducts(response.data.data);
        } else {
          console.error('No products found in the response data');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    setTotalPages(Math.ceil(products.length / productsPerPage));
  }, [products]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  const currentProducts = useMemo(() => {
    if (products.length === 0) {
      return [];
    }

    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    return products.slice(startIndex, endIndex);
  }, [products, currentPage]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
      } else if (event.key === 'ArrowLeft') {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentPage, totalPages]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '80vh',
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Grid
          container
          spacing={2}
          justifyContent="center"
          sx={{
            px: { xs: 1, sm: 2, md: 3, lg: 4 },
            mt: 2,
            '& > *': {
              maxWidth: 345,
              margin: '0 auto',
              width: '100%',
            },
            '@media (min-width: 600px)': {
              '& > *': {
                margin: '0',
              },
            },
          }}
        >
          {currentProducts.map((product: Product) => (
            <Grid item key={product._id} xs={12} sm={6} md={4} lg={2} xl={2} sx={{ px: { xs: 1, sm: 2 } }}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'fixed',
          top: '50%',
          left: 0,
          right: 0,
          zIndex: 1,
        }}
      >
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          variant="outlined"
          shape="rounded"
          renderItem={(item) => (item.type === "previous" ? <PaginationItem {...item} /> : null)}
          sx={{
            '& .MuiPaginationItem-root': {
              color: 'white',
              backgroundColor: '#2196f3',
              '&:hover': {
                backgroundColor: '#0d47a1',
              },
            },
            '& .Mui-selected': {
              backgroundColor: '#0d47a1',
            },
          }}
        />
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          variant="outlined"
          shape="rounded"
          renderItem={(item) => (item.type === "next" ? <PaginationItem {...item} /> : null)}
          sx={{
            '& .MuiPaginationItem-root': {
              color: 'white',
              backgroundColor: '#2196f3',
              '&:hover': {
                backgroundColor: '#0d47a1',
              },
            },
            '& .Mui-selected': {
              backgroundColor: '#0d47a1',
            },
          }}
        />
      </Box>
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1,
          bgcolor: 'transparent',
          width: '100%',
          mb: 2,
        }}
      >
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          variant="outlined"
          shape="rounded"
          renderItem={(item) => (item.type === "page" ? <PaginationItem {...item} /> : null)}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            '& .MuiPaginationItem-root': {
              color: 'white',
              backgroundColor: '#2196f3',
              '&:hover': {
                backgroundColor: '#0d47a1',
              },
            },
            '& .Mui-selected': {
              backgroundColor: '#0d47a1',
            },
          }}
        />
      </Box>
    </Box>

  );
};

export default ProductList;