import { useState } from "react";
import "./App.scss";
import Joke from "./Joke"; // Assuming Joke is a class for creating joke objects

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookmark,
  faTimes,
  faChevronLeft,
  faChevronRight,
  faStar,
  faArrowDown,
  faArrowUp,
} from "@fortawesome/free-solid-svg-icons";
import {
  faBookmark as faBookmarkRegular,
  faStar as faStarRegular,
} from "@fortawesome/free-regular-svg-icons";

export default function App() {
  const [currentJoke, setCurrentJoke] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Bookmark a joke
  const handleBookmark = () => {
    const isAlreadyBookmarked = bookmarks.some(
      (bookmark) => bookmark.id === currentJoke.id
    );

    if (isAlreadyBookmarked) {
      // setIsBookmarked(false);
      setBookmarks(
        bookmarks.filter((bookmark) => bookmark.id !== currentJoke.id)
      );
    } else {
      // setIsBookmarked(true);
      setBookmarks([...bookmarks, { ...currentJoke, bookmarked: true }]);
    }

    setCurrentJoke((prev) => ({ ...prev, bookmarked: !prev.bookmarked }));
  };

  const handleRating = (rating) => {
    setCurrentJoke((prev) => {
      const updatedJoke = { ...prev, rating };

      if (updatedJoke.bookmarked) {
        setBookmarks((prevBookmarks) =>
          prevBookmarks.map((el) =>
            el.id === updatedJoke.id ? { ...el, rating } : el
          )
        );
      }
      return updatedJoke;
    });
  };

  // Select a bookmarked joke
  const handleSelectBookmark = (id) => {
    const selectedJoke = bookmarks.find((bookmark) => bookmark.id === id);
    setCurrentJoke(selectedJoke);
    // setIsBookmarked(selectedJoke.bookmarked);
  };

  // Fetch a new joke from the API
  const getJoke = async () => {
    setIsLoading(true);
    setError(null);
    setCurrentJoke(null);

    try {
      const response = await fetch(
        "https://official-joke-api.appspot.com/random_joke"
      );
      if (!response.ok) throw new Error("Failed to fetch joke");
      const jokeData = await response.json();
      setCurrentJoke(new Joke(jokeData));
    } catch (err) {
      setError("Failed to load joke. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <Sidebar bookmarks={bookmarks} onSelect={handleSelectBookmark} />
      {currentJoke && (
        <Card
          currentJoke={currentJoke}
          onBookmark={handleBookmark}
          onRating={handleRating}
        />
      )}
      {isLoading && <Loader />}
      {error && <ErrorMessage message={error} />}
      <Button onGetJoke={getJoke} />
    </div>
  );
}

// Sidebar Component
function Sidebar({ bookmarks, onSelect }) {
  const [isShown, setIsShown] = useState(false);
  const [orderBy, setOrderBy] = useState("desc");
  const handleToggle = () => {
    setIsShown((prev) => !prev);
  };

  const handleOrder = () => {
    setOrderBy((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const orderBookmarks = () => {
    return bookmarks.toSorted((a, b) =>
      orderBy === "asc" ? a.rating - b.rating : b.rating - a.rating
    );
  };

  let orderedBookmarks = orderBookmarks();

  return (
    <div className={`sidebar ${isShown ? "active" : ""}`}>
      <button onClick={handleToggle} className="sidebar__toggle">
        <FontAwesomeIcon icon={isShown ? faTimes : faBookmark} />
      </button>
      <button onClick={handleOrder} className="sidebar__orderBy">
        <FontAwesomeIcon icon={orderBy === "asc" ? faArrowUp : faArrowDown} />
      </button>
      <Bookmarks bookmarks={orderedBookmarks} onSelect={onSelect} />
    </div>
  );
}

// Card Component
function Card({ currentJoke, onBookmark, onRating }) {
  const [turned, setTurned] = useState(false);

  const toggleCard = () => setTurned((prev) => !prev);

  return (
    <div className={turned ? "card turn" : "card"}>
      <div className="card__front">
        <p className="card__text">{currentJoke.setup}</p>
        <button onClick={toggleCard} className="card__btn">
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
      <div className="card__back">
        <button onClick={onBookmark} className="card__bookmark">
          <FontAwesomeIcon
            icon={currentJoke.bookmarked ? faBookmark : faBookmarkRegular}
          />
        </button>
        <p className="card__text">{currentJoke.punchline}</p>
        <div className="card__group">
          <Ratings current={currentJoke} onRating={onRating} />
          <button onClick={toggleCard} className="card__btn">
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Bookmarks Component
function Bookmarks({ bookmarks, onSelect }) {
  return (
    <ul className="sidebar__bookmarks">
      {bookmarks.map((bookmark) => (
        <Bookmark key={bookmark.id} id={bookmark.id} onSelect={onSelect}>
          {bookmark.setup}
        </Bookmark>
      ))}
    </ul>
  );
}

// Individual Bookmark Item
function Bookmark({ children, id, onSelect }) {
  return (
    <li onClick={() => onSelect(id)} className="sidebar__bookmark">
      <p>{children}</p>
    </li>
  );
}

// Button Component
function Button({ onGetJoke }) {
  return (
    <button onClick={onGetJoke} className="btn">
      Get Joke
    </button>
  );
}

// Loader Component
function Loader() {
  return <div className="loader"></div>;
}

// Error Message Component
function ErrorMessage({ message }) {
  return <div className="error">{message}</div>;
}

function Ratings({ current, onRating }) {
  const [hovered, setHovered] = useState(null);
  const handleHover = (i) => {
    setHovered(i);
  };
  const handleHoverLeave = () => {
    setHovered(null);
  };
  return (
    <div className="card__ratings">
      {Array.from({ length: 5 }).map((el, i) => (
        <button
          onMouseEnter={() => handleHover(i + 1)}
          onMouseLeave={handleHoverLeave}
          onClick={() => onRating(i + 1)}
          id={i + 1}
          className="rating__btn"
          key={i}
        >
          <FontAwesomeIcon
            icon={
              hovered >= i + 1 || current.rating >= i + 1
                ? faStar
                : faStarRegular
            }
            size="xl"
          />
        </button>
      ))}
    </div>
  );
}
