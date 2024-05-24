import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Form } from 'react-bootstrap';

const API_URL = 'https://api.unsplash.com/search/photos';
const RANDOM_IMAGE_URL = 'https://api.unsplash.com/photos/random';
const IMAGES_PER_PAGE = 18;

function App() {
  const searchInput = useRef(null);
  const imagesContainer = useRef(null); // Ref for images container
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchImages = useCallback(async () => {
    try {
      if (searchInput.current.value) {
        setErrorMsg('');
        setLoading(true);
        const { data } = await axios.get(
          `${API_URL}?query=${searchInput.current.value}&page=${page}&per_page=${IMAGES_PER_PAGE}&client_id=${import.meta.env.VITE_API_KEY}`
        );
        if (page === 1) {
          setImages(data.results);
        } else {
          setImages((prevImages) => [...prevImages, ...data.results]);
        }
        setTotalPages(data.total_pages);
        setLoading(false);
      }
    } catch (error) {
      setErrorMsg('Error fetching images. Try again later.');
      console.log(error);
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const resetSearch = () => {
    setPage(1);
    setImages([]);
    fetchImages();
  };

  const handleSearch = (event) => {
    event.preventDefault();
    resetSearch();
  };

  const handleRandomImage = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${RANDOM_IMAGE_URL}?client_id=${import.meta.env.VITE_API_KEY}`
      );
      setImages([data]); // Set a single random image
      setLoading(false);
    } catch (error) {
      setErrorMsg('Error fetching random image. Try again later.');
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Scroll to the bottom of the images container when images change
    if (imagesContainer.current) {
      imagesContainer.current.scrollTop = imagesContainer.current.scrollHeight;
    }
  }, [images]);

  return (
    <div className='container'>
      <h1 className='title'>Find Image</h1>
      {errorMsg && <p className='error-msg'>{errorMsg}</p>}
      <div className='search-section'>
        <Form onSubmit={handleSearch}>
          <Form.Control
            type='search'
            placeholder='Type something to search...'
            className='search-input'
            ref={searchInput}
          />
          <Button variant='secondary' type='submit'>Search</Button>
        </Form>
        <Button variant='secondary' onClick={handleRandomImage}>Random Image</Button>
      </div>
      <div ref={imagesContainer} className='images'>
        {images.map((image) => (
          <img
            key={image.id}
            src={image.urls.small}
            alt={image.alt_description}
            className='image'
          />
        ))}
        {page < totalPages && (
          <div className='buttons' style={{ textAlign: 'center' }}>
            <Button onClick={handleLoadMore}>Load More</Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
