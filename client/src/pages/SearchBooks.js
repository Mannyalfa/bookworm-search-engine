import React, { useState, useEffect } from "react";
import { Jumbotron, Container, Col, Form, Button, Card, CardColumns } from "react-bootstrap";
import Auth from "../utils/auth";
import { saveBook, searchGoogleBooks } from "../utils/API";
import { saveBookIds, getSavedBookIds } from "../utils/localStorage";
import { useMutation } from "@apollo/react-hooks";
import { SAVE_BOOK } from "../utils/mutations";
import { FaSearch } from 'react-icons/fa';
import bookworm from "../../src/images/worm.jpg"

const SearchBooks = () => {
  const [searchedBooks, setSearchedBooks] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [saveBook, { error }] = useMutation(SAVE_BOOK);
  const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds());

  useEffect(() => {
    return () => saveBookIds(savedBookIds);
  });

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!searchInput) {
      return false;
    }

    try {
      const response = await searchGoogleBooks(searchInput);
      if (!response.ok) {
        throw new Error("something went wrong!");
      }

      const { items } = await response.json();
      const bookData = items.map((book) => ({
        bookId: book.id,
        authors: book.volumeInfo.authors || ["No author to display"],
        title: book.volumeInfo.title,
        description: book.volumeInfo.description,
        image: book.volumeInfo.imageLinks?.thumbnail || "",
      }));

      setSearchedBooks(bookData);
      setSearchInput("");
    } catch (err) {
      console.error(err);
    }
  };


  const handleSaveBook = async (bookId) => {
    const bookToSave = searchedBooks.find((book) => book.bookId === bookId);

    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      await saveBook({
        variables: { body: bookToSave },
      });

      setSavedBookIds([...savedBookIds, bookToSave.bookId]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Jumbotron fluid className="text-light bg-info">
        <Container>
        <div>
            <img src={bookworm} alt="bookworm" />
          </div>
          <h1>Worlds to explore: <i>let's go find your books!</i></h1>
          <Form onSubmit={handleFormSubmit}>
            <Form.Row>
              <Col xs={12} md={7}>
                <Form.Control
                  name="searchInput"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type="text"
                  size="lg"
                  placeholder="Search by title, author or subject"
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type="submit" variant="dark" size="lg">
                  <FaSearch/>
                </Button>
              </Col>
            </Form.Row>
          </Form>
        </Container>
      </Jumbotron>

      <Container>
        <h2>
          {searchedBooks.length
            ? `Viewing ${searchedBooks.length} results:`
            : "Search for a book to begin"}
        </h2>
        <CardColumns>
          {searchedBooks.map((book) => {
            return (
              <Card key={book.bookId} border="dark">
                {book.image ? (
                  <Card.Img
                    src={book.image}
                    alt={`The cover for ${book.title}`}
                    variant="top"
                  />
                ) : null}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className="small">Authors: {book.authors}</p>
                  <Card.Text>{book.description}</Card.Text>
                  {Auth.loggedIn() && (
                    <Button
                      disabled={savedBookIds?.some(
                        (savedBookId) => savedBookId === book.bookId
                      )}
                      className="btn-block btn-info"
                      onClick={() => handleSaveBook(book.bookId)}
                    >
                      {savedBookIds?.some(
                        (savedBookId) => savedBookId === book.bookId
                      )
                        ? "SAVED IN YOUR BOOKS"
                        : "SAVE"}
                    </Button>
                  )}
                </Card.Body>
              </Card>
            );
          })}
        </CardColumns>
      </Container>
    </>
  );
};

export default SearchBooks;
