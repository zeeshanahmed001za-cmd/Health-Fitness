import React from "react";
import styles from "../styles/Dashboard.module.css";

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const SearchBar = ({ placeholder = "Search...", onSearch }) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      const query = e.target.value.trim();
      if (query) {
        if (onSearch) {
          onSearch(query);
        } else {
          alert(`Searching for: "${query}"... This feature is coming soon!`);
        }
        e.target.value = "";
      }
    }
  };

  return (
    <div className={styles.searchBar}>
      <input
        type="text"
        placeholder={placeholder}
        onKeyDown={handleKeyDown}
        aria-label={placeholder}
      />
      <SearchIcon />
    </div>
  );
};

export default SearchBar;
