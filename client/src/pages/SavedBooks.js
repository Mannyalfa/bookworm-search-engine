import React, { useState, useEffect } from 'react';
import {useQuery, useMutation} from '@apollo/react-hooks';
import {GET_ME} from '../utils/queries';
import {REMOVE_BOOK} from '../utils/mutations';
import { Jumbotron, Container, CardColumns, Card, Button } from 'react-bootstrap';
import { removeBookId } from '../utils/localStorage';


const SavedBooks = () => {
  const {loading, data} = useQuery(GET_ME);

  const[userData, setData] = useState(loading ? null : data.me);
  // const newdata = {...userData?.me};
  const [removeBook, {error}] = useMutation(REMOVE_BOOK);

  // useEffect(() =>{
  //   if(userData){
  //     console.log('useeffect!!')
  //   }
  // },[userData])
  
  if(!userData){
      return null
  }

  const handleDeleteBook = async (bookId) => {
    try {
       const data = await removeBook({
        variables: {bookId},
      });

      // update state of books:
      setData(()=>{
        return{
          ...userData,
          savedBooks: data.data.removeBook.savedBooks
        }
      })
    } catch (err) {
      console.error(err);
    }
    removeBookId(bookId);
  };


  return (
    <>
      <Jumbotron fluid className='text-light bg-primary'>
        <Container>
          <h1>Your saved book collection</h1>
        </Container>
      </Jumbotron>
      <Container>
        <h2>
          {!loading && userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${userData.savedBooks.length === 1 ? 'book' : 'books'}:`
            : 'You have no saved books'
          }
        </h2>
        <CardColumns>
          {!loading && userData.savedBooks.map((book) => {
              return (
                <Card key={book.bookId} border='dark'>
                  {book.image ? <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' /> : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    <Button className='btn-block btn-danger' onClick={() => handleDeleteBook(book.bookId)}>
                      Delete
                    </Button>
                  </Card.Body>
                </Card>
              );
            })
          }
        </CardColumns>
      </Container>
    </>
  );
};

export default SavedBooks;
